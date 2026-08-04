package com.crm.identity.application.service;

import java.time.Instant;
import java.util.Locale;
import java.util.Optional;
import java.util.UUID;

import com.crm.foundation.identifier.IdentifierGenerator;
import com.crm.foundation.security.CodedAccessDeniedException;
import com.crm.foundation.security.CodedAuthenticationException;
import com.crm.foundation.time.TimeProvider;
import com.crm.identity.application.AuthenticationPolicy;
import com.crm.identity.application.command.AuthenticationRequestMetadata;
import com.crm.identity.application.command.ExternalLoginCommand;
import com.crm.identity.application.command.LoginCommand;
import com.crm.identity.application.command.RegisterCommand;
import com.crm.identity.application.dto.CurrentIdentity;
import com.crm.identity.application.dto.IssuedTokens;
import com.crm.identity.application.port.AccessTokenIssuer;
import com.crm.identity.application.port.IdentityRepository;
import com.crm.identity.application.port.PasswordHasher;
import com.crm.identity.application.port.RefreshSessionRepository;
import com.crm.identity.application.port.RefreshTokenManager;
import com.crm.identity.application.port.RefreshTokenManager.GeneratedRefreshToken;
import com.crm.identity.application.port.RefreshTokenManager.ParsedRefreshToken;
import com.crm.identity.application.usecase.AuthenticationFacade;
import com.crm.identity.domain.AuthEvent;
import com.crm.identity.domain.AuthenticationErrorCode;
import com.crm.identity.domain.RefreshSession;
import com.crm.identity.domain.UserAccount;
import com.crm.sharedkernel.domain.exception.ResourceConflict;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthenticationApplicationService
		implements AuthenticationFacade {

	private static final String LOCAL_PROVIDER = "LOCAL";
	private static final String SESSION_PROVIDER = "SESSION";
	private static final String INVALID_CREDENTIALS = "INVALID_CREDENTIALS";

	private final IdentityRepository identityRepository;
	private final RefreshSessionRepository refreshSessionRepository;
	private final AccessTokenIssuer accessTokenIssuer;
	private final RefreshTokenManager refreshTokenManager;
	private final PasswordHasher passwordHasher;
	private final IdentifierGenerator identifierGenerator;
	private final TimeProvider timeProvider;
	private final AuthenticationPolicy policy;
	private final String dummyPasswordHash;

	public AuthenticationApplicationService(
			IdentityRepository identityRepository,
			RefreshSessionRepository refreshSessionRepository,
			AccessTokenIssuer accessTokenIssuer,
			RefreshTokenManager refreshTokenManager,
			PasswordHasher passwordHasher,
			IdentifierGenerator identifierGenerator,
			TimeProvider timeProvider,
			AuthenticationPolicy policy) {
		this.identityRepository = identityRepository;
		this.refreshSessionRepository = refreshSessionRepository;
		this.accessTokenIssuer = accessTokenIssuer;
		this.refreshTokenManager = refreshTokenManager;
		this.passwordHasher = passwordHasher;
		this.identifierGenerator = identifierGenerator;
		this.timeProvider = timeProvider;
		this.policy = policy;
		this.dummyPasswordHash = passwordHasher.hash(
				identifierGenerator.nextId().toString());
	}

	@Override
	@Transactional
	public IssuedTokens register(RegisterCommand command,
			AuthenticationRequestMetadata metadata) {
		if (!policy.selfRegistrationEnabled()) {
			throw new CodedAccessDeniedException(
					AuthenticationErrorCode.SELF_REGISTRATION_DISABLED);
		}
		String normalizedEmail = normalizeEmail(command.email());
		if (identityRepository.findByEmail(normalizedEmail).isPresent()) {
			throw new ResourceConflict(
					AuthenticationErrorCode.EMAIL_ALREADY_REGISTERED);
		}

		Instant now = timeProvider.now();
		UUID userId = identifierGenerator.nextId();
		try {
			identityRepository.createUser(userId, normalizedEmail,
					command.displayName().trim(), null, now);
			identityRepository.createCredential(userId,
					passwordHasher.hash(command.password()), now);
		}
		catch (DataIntegrityViolationException exception) {
			throw new ResourceConflict(
					AuthenticationErrorCode.EMAIL_ALREADY_REGISTERED);
		}

		UserAccount user = identityRepository.findById(userId)
				.orElseThrow(() -> new IllegalStateException(
						"Created user cannot be loaded"));
		appendEvent(user.id(), null, "REGISTER", LOCAL_PROVIDER, true,
				user.email(), null, metadata, now);
		return issueTokens(user, LOCAL_PROVIDER, metadata, now,
				"LOGIN_SUCCESS");
	}

	@Override
	@Transactional(noRollbackFor = CodedAuthenticationException.class)
	public IssuedTokens login(LoginCommand command,
			AuthenticationRequestMetadata metadata) {
		String normalizedEmail = normalizeEmail(command.email());
		Instant now = timeProvider.now();
		Optional<UserAccount> candidate = identityRepository
				.findLocalByEmailForUpdate(normalizedEmail);
		if (candidate.isEmpty()) {
			passwordHasher.matches(command.password(), dummyPasswordHash);
			appendLoginFailure(null, normalizedEmail, metadata, now);
			throw invalidCredentials();
		}

		UserAccount user = candidate.get();
		if (!user.isActive() || user.passwordHash() == null) {
			passwordHasher.matches(command.password(), dummyPasswordHash);
			appendLoginFailure(user.id(), normalizedEmail, metadata, now);
			throw invalidCredentials();
		}
		if (user.isTemporarilyLocked(now)) {
			passwordHasher.matches(command.password(), user.passwordHash());
			appendLoginFailure(user.id(), normalizedEmail, metadata, now);
			throw invalidCredentials();
		}
		if (!passwordHasher.matches(command.password(), user.passwordHash())) {
			recordFailedLogin(user, normalizedEmail, metadata, now);
			throw invalidCredentials();
		}

		identityRepository.recordSuccessfulLogin(user.id(), now);
		UserAccount refreshedUser = identityRepository.findById(user.id())
				.orElseThrow(AuthenticationApplicationService::invalidCredentials);
		return issueTokens(refreshedUser, LOCAL_PROVIDER, metadata, now,
				"LOGIN_SUCCESS");
	}

	@Override
	@Transactional(noRollbackFor = CodedAuthenticationException.class)
	public IssuedTokens refresh(String rawRefreshToken,
			AuthenticationRequestMetadata metadata) {
		Instant now = timeProvider.now();
		ParsedRefreshToken parsed = refreshTokenManager.parse(rawRefreshToken)
				.orElseThrow(
						AuthenticationApplicationService::invalidRefreshToken);
		RefreshSession session = refreshSessionRepository
				.findByIdForUpdate(parsed.sessionId())
				.orElseThrow(
						AuthenticationApplicationService::invalidRefreshToken);

		if (!refreshTokenManager.matches(session.refreshTokenHash(),
				parsed.hash())) {
			refreshSessionRepository.revoke(session.id(), now,
					"REUSE_DETECTED");
			UserAccount user = identityRepository.findById(session.userId())
					.orElse(null);
			appendEvent(session.userId(), session.id(), "SESSION_REVOKED",
					SESSION_PROVIDER, false,
					user == null ? null : user.email(),
					"REFRESH_TOKEN_REUSED", metadata, now);
			throw new CodedAuthenticationException(
					AuthenticationErrorCode.REFRESH_TOKEN_REUSED);
		}
		if (!session.isUsableAt(now)) {
			if (session.revokedAt() == null) {
				refreshSessionRepository.revoke(session.id(), now, "EXPIRED");
			}
			throw invalidRefreshToken();
		}

		UserAccount user = identityRepository.findById(session.userId())
				.filter(UserAccount::isActive)
				.orElseThrow(
						AuthenticationApplicationService::invalidRefreshToken);
		GeneratedRefreshToken rotated = refreshTokenManager
				.generate(session.id());
		refreshSessionRepository.rotate(session.id(), rotated.hash(), now,
				ip(metadata));
		String accessToken = accessTokenIssuer.issue(user, session.id(), now);
		appendEvent(user.id(), session.id(), "REFRESH", SESSION_PROVIDER,
				true, user.email(), null, metadata, now);
		return new IssuedTokens(accessToken, rotated.rawToken(),
				policy.accessTokenTtl(), user);
	}

	@Override
	@Transactional
	public void logout(String rawRefreshToken,
			AuthenticationRequestMetadata metadata) {
		refreshTokenManager.parse(rawRefreshToken).ifPresent(parsed -> {
			Instant now = timeProvider.now();
			refreshSessionRepository.findByIdForUpdate(parsed.sessionId())
					.ifPresent(session -> revokeOnLogout(
							session, parsed, metadata, now));
		});
	}

	@Override
	@Transactional
	public IssuedTokens loginExternal(ExternalLoginCommand command,
			AuthenticationRequestMetadata metadata) {
		Instant now = timeProvider.now();
		String normalizedEmail = normalizeEmail(command.email());
		if (!command.emailVerified()) {
			throw new CodedAuthenticationException(
					AuthenticationErrorCode.EXTERNAL_EMAIL_NOT_VERIFIED);
		}

		UserAccount user = identityRepository
				.findByExternalIdentity(command.issuer(), command.subject())
				.orElseGet(() -> createExternalUser(
						command, normalizedEmail, now));
		if (!user.isActive()) {
			throw invalidCredentials();
		}

		identityRepository.recordExternalLogin(user.id(), command.issuer(),
				command.subject(), command.displayName().trim(), now);
		UserAccount refreshedUser = identityRepository.findById(user.id())
				.orElseThrow(AuthenticationApplicationService::invalidCredentials);
		return issueTokens(refreshedUser, command.provider().name(), metadata,
				now, "LOGIN_SUCCESS");
	}

	@Override
	@Transactional(readOnly = true)
	public CurrentIdentity currentIdentity(UUID userId) {
		UserAccount user = identityRepository.findById(userId)
				.filter(UserAccount::isActive)
				.orElseThrow(AuthenticationApplicationService::invalidCredentials);
		return new CurrentIdentity(user,
				identityRepository.findActiveTenantMemberships(userId));
	}

	private UserAccount createExternalUser(ExternalLoginCommand command,
			String normalizedEmail, Instant now) {
		if (!policy.selfRegistrationEnabled()) {
			throw new CodedAccessDeniedException(
					AuthenticationErrorCode.SELF_REGISTRATION_DISABLED);
		}
		if (identityRepository.findByEmail(normalizedEmail).isPresent()) {
			throw new ResourceConflict(
					AuthenticationErrorCode.EXTERNAL_IDENTITY_LINK_REQUIRED);
		}
		UUID userId = identifierGenerator.nextId();
		try {
			identityRepository.createUser(userId, normalizedEmail,
					command.displayName().trim(), now, now);
			identityRepository.createExternalIdentity(
					identifierGenerator.nextId(), userId, command.provider(),
					command.issuer(), command.subject(), normalizedEmail, true,
					now);
		}
		catch (DataIntegrityViolationException exception) {
			throw new ResourceConflict(
					AuthenticationErrorCode.EXTERNAL_IDENTITY_LINK_REQUIRED);
		}
		appendEvent(userId, null, "EXTERNAL_IDENTITY_CREATED",
				command.provider().name(), true, normalizedEmail, null, null,
				now);
		return identityRepository.findById(userId)
				.orElseThrow(AuthenticationApplicationService::invalidCredentials);
	}

	private IssuedTokens issueTokens(UserAccount user, String provider,
			AuthenticationRequestMetadata metadata, Instant now,
			String eventType) {
		UUID sessionId = identifierGenerator.nextId();
		GeneratedRefreshToken refreshToken = refreshTokenManager
				.generate(sessionId);
		RefreshSession session = new RefreshSession(
				sessionId,
				user.id(),
				refreshToken.hash(),
				0,
				now.plus(policy.refreshTokenTtl()),
				null);
		refreshSessionRepository.create(session, now, ip(metadata),
				userAgent(metadata));
		String accessToken = accessTokenIssuer.issue(user, sessionId, now);
		appendEvent(user.id(), sessionId, eventType, provider, true,
				user.email(), null, metadata, now);
		return new IssuedTokens(accessToken, refreshToken.rawToken(),
				policy.accessTokenTtl(), user);
	}

	private void revokeOnLogout(RefreshSession session,
			ParsedRefreshToken parsed, AuthenticationRequestMetadata metadata,
			Instant now) {
		if (!refreshTokenManager.matches(session.refreshTokenHash(),
				parsed.hash())) {
			return;
		}
		refreshSessionRepository.revoke(session.id(), now, "LOGOUT");
		UserAccount user = identityRepository.findById(session.userId())
				.orElse(null);
		appendEvent(session.userId(), session.id(), "LOGOUT", SESSION_PROVIDER,
				true, user == null ? null : user.email(), null, metadata, now);
	}

	private void recordFailedLogin(UserAccount user, String email,
			AuthenticationRequestMetadata metadata, Instant now) {
		int failedAttempts = user.failedLoginAttempts() + 1;
		Instant lockedUntil = failedAttempts >= policy.maxFailedAttempts()
				? now.plus(policy.lockDuration())
				: null;
		identityRepository.recordFailedLogin(user.id(), failedAttempts,
				lockedUntil);
		appendLoginFailure(user.id(), email, metadata, now);
	}

	private void appendLoginFailure(UUID userId, String email,
			AuthenticationRequestMetadata metadata, Instant now) {
		appendEvent(userId, null, "LOGIN_FAILURE", LOCAL_PROVIDER, false,
				email, INVALID_CREDENTIALS, metadata, now);
	}

	private void appendEvent(UUID userId, UUID sessionId, String eventType,
			String provider, boolean success, String email, String failureCode,
			AuthenticationRequestMetadata metadata, Instant occurredAt) {
		identityRepository.appendAuthEvent(new AuthEvent(
				identifierGenerator.nextId(), userId, sessionId, eventType,
				provider, success, email, failureCode, ip(metadata),
				userAgent(metadata), occurredAt));
	}

	private static String normalizeEmail(String email) {
		return email.trim().toLowerCase(Locale.ROOT);
	}

	private static String ip(AuthenticationRequestMetadata metadata) {
		return metadata == null ? null : truncate(metadata.ipAddress(), 45);
	}

	private static String userAgent(
			AuthenticationRequestMetadata metadata) {
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

	private static CodedAuthenticationException invalidCredentials() {
		return new CodedAuthenticationException(
				AuthenticationErrorCode.INVALID_CREDENTIALS);
	}

	private static CodedAuthenticationException invalidRefreshToken() {
		return new CodedAuthenticationException(
				AuthenticationErrorCode.INVALID_REFRESH_TOKEN);
	}

}
