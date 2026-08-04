package com.crm.identity.application;

import java.time.Instant;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.UUID;

import com.crm.foundation.identifier.IdentifierGenerator;
import com.crm.foundation.time.TimeProvider;
import com.crm.identity.application.port.AccessTokenIssuer;
import com.crm.identity.application.port.IdentityRepository;
import com.crm.identity.application.port.RefreshSessionRepository;
import com.crm.identity.domain.AuthEvent;
import com.crm.identity.domain.AuthenticationErrorCode;
import com.crm.identity.domain.CrmAccessDeniedException;
import com.crm.identity.domain.CrmAuthenticationException;
import com.crm.identity.domain.RefreshSession;
import com.crm.identity.domain.TenantMembershipSummary;
import com.crm.identity.domain.UserAccount;
import com.crm.identity.infrastructure.config.CrmSecurityProperties;
import com.crm.identity.infrastructure.security.RefreshTokenCodec;
import com.crm.identity.infrastructure.security.RefreshTokenCodec.GeneratedRefreshToken;
import com.crm.identity.infrastructure.security.RefreshTokenCodec.ParsedRefreshToken;
import com.crm.sharedkernel.domain.exception.ResourceConflict;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthenticationService {

	private static final String LOCAL_PROVIDER = "LOCAL";
	private static final String SESSION_PROVIDER = "SESSION";
	private static final String INVALID_CREDENTIALS = "INVALID_CREDENTIALS";

	private final IdentityRepository identityRepository;
	private final RefreshSessionRepository refreshSessionRepository;
	private final AccessTokenIssuer accessTokenIssuer;
	private final RefreshTokenCodec refreshTokenCodec;
	private final PasswordEncoder passwordEncoder;
	private final IdentifierGenerator identifierGenerator;
	private final TimeProvider timeProvider;
	private final CrmSecurityProperties properties;
	private final String dummyPasswordHash;

	public AuthenticationService(IdentityRepository identityRepository,
			RefreshSessionRepository refreshSessionRepository,
			AccessTokenIssuer accessTokenIssuer,
			RefreshTokenCodec refreshTokenCodec,
			PasswordEncoder passwordEncoder,
			IdentifierGenerator identifierGenerator,
			TimeProvider timeProvider,
			CrmSecurityProperties properties) {
		this.identityRepository = identityRepository;
		this.refreshSessionRepository = refreshSessionRepository;
		this.accessTokenIssuer = accessTokenIssuer;
		this.refreshTokenCodec = refreshTokenCodec;
		this.passwordEncoder = passwordEncoder;
		this.identifierGenerator = identifierGenerator;
		this.timeProvider = timeProvider;
		this.properties = properties;
		this.dummyPasswordHash = passwordEncoder.encode(
				identifierGenerator.nextId().toString());
	}

	@Transactional
	public IssuedTokens register(String email, String password, String displayName,
			AuthenticationRequestMetadata metadata) {
		if (!properties.selfRegistrationEnabled()) {
			throw new CrmAccessDeniedException(AuthenticationErrorCode.SELF_REGISTRATION_DISABLED);
		}
		String normalizedEmail = normalizeEmail(email);
		if (identityRepository.findByEmail(normalizedEmail).isPresent()) {
			throw new ResourceConflict(AuthenticationErrorCode.EMAIL_ALREADY_REGISTERED);
		}

		Instant now = timeProvider.now();
		UUID userId = identifierGenerator.nextId();
		try {
			identityRepository.createUser(userId, normalizedEmail, displayName.trim(), null, now);
			identityRepository.createCredential(userId, passwordEncoder.encode(password), now);
		}
		catch (DataIntegrityViolationException exception) {
			throw new ResourceConflict(AuthenticationErrorCode.EMAIL_ALREADY_REGISTERED);
		}

		UserAccount user = identityRepository.findById(userId).orElseThrow(() -> new IllegalStateException("Created user cannot be loaded"));
		appendEvent(user.id(), null, "REGISTER", LOCAL_PROVIDER, true, user.email(), null, metadata, now);
		return issueTokens(user, LOCAL_PROVIDER, metadata, now, "LOGIN_SUCCESS");
	}

	@Transactional(noRollbackFor = CrmAuthenticationException.class)
	public IssuedTokens login(String email, String password, AuthenticationRequestMetadata metadata) {
		String normalizedEmail = normalizeEmail(email);
		Instant now = timeProvider.now();
		Optional<UserAccount> candidate = identityRepository.findLocalByEmailForUpdate(normalizedEmail);
		if (candidate.isEmpty()) {
			passwordEncoder.matches(password, dummyPasswordHash);
			appendEvent(null, null, "LOGIN_FAILURE", LOCAL_PROVIDER, false, normalizedEmail, INVALID_CREDENTIALS, metadata, now);
			throw invalidCredentials();
		}

		UserAccount user = candidate.get();
		if (!user.isActive() || user.passwordHash() == null) {
			passwordEncoder.matches(password, dummyPasswordHash);
			appendEvent(user.id(), null, "LOGIN_FAILURE", LOCAL_PROVIDER, false, normalizedEmail, INVALID_CREDENTIALS, metadata, now);
			throw invalidCredentials();
		}
		if (user.isTemporarilyLocked(now)) {
			passwordEncoder.matches(password, user.passwordHash());
			appendEvent(user.id(), null, "LOGIN_FAILURE", LOCAL_PROVIDER, false, normalizedEmail, INVALID_CREDENTIALS, metadata, now);
			throw invalidCredentials();
		}
		if (!passwordEncoder.matches(password, user.passwordHash())) {
			recordFailedLogin(user, normalizedEmail, metadata, now);
			throw invalidCredentials();
		}

		identityRepository.recordSuccessfulLogin(user.id(), now);
		UserAccount refreshedUser = identityRepository.findById(user.id()).orElseThrow(AuthenticationService::invalidCredentials);
		return issueTokens(refreshedUser, LOCAL_PROVIDER, metadata, now, "LOGIN_SUCCESS");
	}

	@Transactional(noRollbackFor = CrmAuthenticationException.class)
	public IssuedTokens refresh(String rawRefreshToken, AuthenticationRequestMetadata metadata) {
		Instant now = timeProvider.now();
		ParsedRefreshToken parsed = refreshTokenCodec.parse(rawRefreshToken).orElseThrow(AuthenticationService::invalidRefreshToken);
		RefreshSession session = refreshSessionRepository.findByIdForUpdate(parsed.sessionId()).orElseThrow(AuthenticationService::invalidRefreshToken);

		if (!refreshTokenCodec.matches(session.refreshTokenHash(), parsed.hash())) {
			refreshSessionRepository.revoke(session.id(), now, "REUSE_DETECTED");
			UserAccount user = identityRepository.findById(session.userId()).orElse(null);
			appendEvent(session.userId(), session.id(), "SESSION_REVOKED", SESSION_PROVIDER, false, user == null ? null : user.email(), "REFRESH_TOKEN_REUSED", metadata, now);
			throw new CrmAuthenticationException(AuthenticationErrorCode.REFRESH_TOKEN_REUSED);
		}
		if (!session.isUsableAt(now)) {
			if (session.revokedAt() == null) {
				refreshSessionRepository.revoke(session.id(), now, "EXPIRED");
			}
			throw invalidRefreshToken();
		}

		UserAccount user = identityRepository.findById(session.userId()).filter(UserAccount::isActive).orElseThrow(AuthenticationService::invalidRefreshToken);
		GeneratedRefreshToken rotated = refreshTokenCodec.generate(session.id());
		refreshSessionRepository.rotate(session.id(), rotated.hash(), now, ip(metadata));
		String accessToken = accessTokenIssuer.issue(user, session.id(), now);
		appendEvent(user.id(), session.id(), "REFRESH", SESSION_PROVIDER, true, user.email(), null, metadata, now);
		return new IssuedTokens(accessToken, rotated.rawToken(), properties.accessTokenTtl(), user);
	}

	@Transactional
	public void logout(String rawRefreshToken, AuthenticationRequestMetadata metadata) {
		refreshTokenCodec.parse(rawRefreshToken).ifPresent(parsed -> {
			Instant now = timeProvider.now();
			refreshSessionRepository.findByIdForUpdate(parsed.sessionId())
					.ifPresent(session -> {
						if (refreshTokenCodec.matches(session.refreshTokenHash(), parsed.hash())) {
							refreshSessionRepository.revoke(session.id(), now, "LOGOUT");
							UserAccount user = identityRepository.findById(session.userId()).orElse(null);
							appendEvent(session.userId(), session.id(), "LOGOUT", SESSION_PROVIDER, true, user == null ? null : user.email(), null, metadata, now);
						}
					});
		});
	}

	@Transactional
	public IssuedTokens loginExternal(ExternalLoginCommand command, AuthenticationRequestMetadata metadata) {
		Instant now = timeProvider.now();
		String normalizedEmail = normalizeEmail(command.email());
		if (!command.emailVerified()) {
			throw new CrmAuthenticationException(AuthenticationErrorCode.EXTERNAL_EMAIL_NOT_VERIFIED);
		}

		UserAccount user = identityRepository.findByExternalIdentity(command.issuer(), command.subject()).orElseGet(() -> createExternalUser(command, normalizedEmail, now));
		if (!user.isActive()) {
			throw invalidCredentials();
		}

		identityRepository.recordExternalLogin(user.id(), command.issuer(), command.subject(), command.displayName().trim(), now);
		UserAccount refreshedUser = identityRepository.findById(user.id()).orElseThrow(AuthenticationService::invalidCredentials);
		return issueTokens(refreshedUser, command.provider().name(), metadata, now, "LOGIN_SUCCESS");
	}

	@Transactional(readOnly = true)
	public UserAccount requireUser(UUID userId) {
		return identityRepository.findById(userId).filter(UserAccount::isActive).orElseThrow(AuthenticationService::invalidCredentials);
	}

	@Transactional(readOnly = true)
	public List<TenantMembershipSummary> activeTenants(UUID userId) {
		return identityRepository.findActiveTenantMemberships(userId);
	}

	private UserAccount createExternalUser(ExternalLoginCommand command,
			String normalizedEmail, Instant now) {
		if (!properties.selfRegistrationEnabled()) {
			throw new CrmAccessDeniedException(AuthenticationErrorCode.SELF_REGISTRATION_DISABLED);
		}
		if (identityRepository.findByEmail(normalizedEmail).isPresent()) {
			throw new ResourceConflict(AuthenticationErrorCode.EXTERNAL_IDENTITY_LINK_REQUIRED);
		}
		UUID userId = identifierGenerator.nextId();
		try {
			identityRepository.createUser(userId, normalizedEmail, command.displayName().trim(), now, now);
			identityRepository.createExternalIdentity(
					identifierGenerator.nextId(),
					userId, command.provider(),
					command.issuer(),
					command.subject(),
					normalizedEmail,
					true,
					now
			);
		}
		catch (DataIntegrityViolationException exception) {
			throw new ResourceConflict(AuthenticationErrorCode.EXTERNAL_IDENTITY_LINK_REQUIRED);
		}
		appendEvent(userId, null, "EXTERNAL_IDENTITY_CREATED", command.provider().name(), true, normalizedEmail, null, null, now);
		return identityRepository.findById(userId).orElseThrow(AuthenticationService::invalidCredentials);
	}

	private IssuedTokens issueTokens(UserAccount user, String provider, AuthenticationRequestMetadata metadata, Instant now, String eventType) {
		UUID sessionId = identifierGenerator.nextId();
		GeneratedRefreshToken refreshToken = refreshTokenCodec.generate(sessionId);
		RefreshSession session = new RefreshSession(
				sessionId,
				user.id(),
				refreshToken.hash(),
				0,
				now.plus(properties.refreshTokenTtl()), null
		);
		refreshSessionRepository.create(session, now, ip(metadata), userAgent(metadata));
		String accessToken = accessTokenIssuer.issue(user, sessionId, now);
		appendEvent(user.id(), sessionId, eventType, provider, true, user.email(), null, metadata, now);
		return new IssuedTokens(accessToken, refreshToken.rawToken(),
				properties.accessTokenTtl(), user);
	}

	private void recordFailedLogin(UserAccount user, String email,
			AuthenticationRequestMetadata metadata, Instant now) {
		int failedAttempts = user.failedLoginAttempts() + 1;
		Instant lockedUntil = failedAttempts >= properties.maxFailedAttempts()
				? now.plus(properties.lockDuration())
				: null;
		identityRepository.recordFailedLogin(user.id(), failedAttempts,
				lockedUntil);
		appendEvent(user.id(), null, "LOGIN_FAILURE", LOCAL_PROVIDER, false,
				email, INVALID_CREDENTIALS, metadata, now);
	}

	private void appendEvent(UUID userId, UUID sessionId, String eventType,
			String provider, boolean success, String email, String failureCode,
			AuthenticationRequestMetadata metadata, Instant occurredAt) {
		identityRepository.appendAuthEvent(new AuthEvent(
				identifierGenerator.nextId(), userId, sessionId, eventType, provider,
				success, email, failureCode, ip(metadata), userAgent(metadata),
				occurredAt));
	}

	private static String normalizeEmail(String email) {
		return email.trim().toLowerCase(Locale.ROOT);
	}

	private static String ip(AuthenticationRequestMetadata metadata) {
		return metadata == null ? null : truncate(metadata.ipAddress(), 45);
	}

	private static String userAgent(AuthenticationRequestMetadata metadata) {
		return metadata == null ? null : truncate(metadata.userAgent(), 512);
	}

	private static String truncate(String value, int maximumLength) {
		if (value == null || value.isBlank()) {
			return null;
		}
		String singleLine = value.replace('\r', '_').replace('\n', '_');
		return singleLine.length() <= maximumLength
				? singleLine
				: singleLine.substring(0, maximumLength);
	}

	private static CrmAuthenticationException invalidCredentials() {
		return new CrmAuthenticationException(
				AuthenticationErrorCode.INVALID_CREDENTIALS);
	}

	private static CrmAuthenticationException invalidRefreshToken() {
		return new CrmAuthenticationException(
				AuthenticationErrorCode.INVALID_REFRESH_TOKEN);
	}

}
