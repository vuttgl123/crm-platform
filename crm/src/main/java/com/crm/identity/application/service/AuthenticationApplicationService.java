package com.crm.identity.application.service;

import java.time.Instant;
import java.util.Locale;
import java.util.Optional;
import java.util.UUID;

import com.crm.foundation.identifier.IdentifierGenerator;
import com.crm.foundation.security.AccountLockedException;
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
import com.crm.identity.application.port.IdentityRepository;
import com.crm.identity.application.port.PasswordHasher;
import com.crm.identity.application.usecase.AuthenticationFacade;
import com.crm.identity.domain.AuthenticationErrorCode;
import com.crm.identity.domain.PasswordPolicy;
import com.crm.identity.domain.UserAccount;
import com.crm.sharedkernel.domain.exception.BusinessRuleViolation;
import com.crm.sharedkernel.domain.exception.ResourceConflict;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthenticationApplicationService
		implements AuthenticationFacade {

	private static final String LOCAL_PROVIDER = "LOCAL";

	private final IdentityRepository identityRepository;
	private final AuthenticationSessionService sessionService;
	private final AuthenticationAuditRecorder auditRecorder;
	private final PasswordHasher passwordHasher;
	private final IdentifierGenerator identifierGenerator;
	private final TimeProvider timeProvider;
	private final AuthenticationPolicy policy;
	private final String dummyPasswordHash;

	public AuthenticationApplicationService(
			IdentityRepository identityRepository,
			AuthenticationSessionService sessionService,
			AuthenticationAuditRecorder auditRecorder,
			PasswordHasher passwordHasher,
			IdentifierGenerator identifierGenerator,
			TimeProvider timeProvider,
			AuthenticationPolicy policy) {
		this.identityRepository = identityRepository;
		this.sessionService = sessionService;
		this.auditRecorder = auditRecorder;
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
		ensureSelfRegistrationEnabled();
		String normalizedEmail = normalizeEmail(command.email());
		// @Size(min = 12) on the request only checks length; the policy is the
		// authority, and it applies here exactly as it does to reset and change.
		enforcePasswordPolicy(command.password(), normalizedEmail,
				command.displayName());
		if (identityRepository.findByEmail(normalizedEmail).isPresent()) {
			throw emailAlreadyRegistered();
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
			throw emailAlreadyRegistered();
		}

		UserAccount user = identityRepository.findById(userId)
				.orElseThrow(() -> new IllegalStateException(
						"Created user cannot be loaded"));
		auditRecorder.recordRegistration(user, metadata, now);
		return sessionService.issueLogin(
				user, LOCAL_PROVIDER, metadata, now);
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
			auditRecorder.recordLoginFailure(
					null, normalizedEmail, metadata, now);
			throw invalidCredentials();
		}

		UserAccount user = candidate.get();
		if (!user.permitsAuthentication() || user.passwordHash() == null) {
			passwordHasher.matches(command.password(), dummyPasswordHash);
			auditRecorder.recordLoginFailure(
					user.id(), normalizedEmail, metadata, now);
			throw invalidCredentials();
		}
		// The password is verified first so that ACCOUNT_LOCKED can be
		// returned only to a caller who has proved they know it. Verifying
		// always, for any existing account, also makes response timing more
		// uniform than the previous ordering.
		boolean passwordMatches = passwordHasher.matches(
				command.password(), user.passwordHash());
		boolean locked = !user.permitsPasswordAuthenticationAt(now);

		if (!passwordMatches) {
			if (locked) {
				// Do not extend an existing lock: the counter stays put,
				// matching the behaviour before this change.
				auditRecorder.recordLoginFailure(
						user.id(), normalizedEmail, metadata, now);
			}
			else {
				recordFailedLogin(user, normalizedEmail, metadata, now);
			}
			throw invalidCredentials();
		}

		if (locked) {
			auditRecorder.recordLoginBlockedByLock(
					user.id(), normalizedEmail, metadata, now);
			throw new AccountLockedException(
					AuthenticationErrorCode.ACCOUNT_LOCKED,
					user.lockedUntil());
		}

		identityRepository.recordSuccessfulLogin(user.id(), now);
		UserAccount refreshedUser = identityRepository.findById(user.id())
				.orElseThrow(AuthenticationApplicationService::invalidCredentials);
		return sessionService.issueLogin(
				refreshedUser, LOCAL_PROVIDER, metadata, now);
	}

	@Override
	public IssuedTokens refresh(String rawRefreshToken,
			AuthenticationRequestMetadata metadata) {
		return sessionService.refresh(rawRefreshToken, metadata);
	}

	@Override
	public void logout(String rawRefreshToken,
			AuthenticationRequestMetadata metadata) {
		sessionService.logout(rawRefreshToken, metadata);
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
		if (!user.permitsAuthentication()) {
			throw invalidCredentials();
		}

		identityRepository.recordExternalLogin(user.id(), command.issuer(),
				command.subject(), command.displayName().trim(), now);
		UserAccount refreshedUser = identityRepository.findById(user.id())
				.orElseThrow(AuthenticationApplicationService::invalidCredentials);
		return sessionService.issueLogin(refreshedUser,
				command.provider().name(), metadata, now);
	}

	@Override
	@Transactional(readOnly = true)
	public CurrentIdentity currentIdentity(UUID userId) {
		UserAccount user = identityRepository.findById(userId)
				.filter(UserAccount::permitsAuthentication)
				.orElseThrow(AuthenticationApplicationService::invalidCredentials);
		return new CurrentIdentity(user,
				identityRepository.findActiveTenantMemberships(userId));
	}

	private UserAccount createExternalUser(ExternalLoginCommand command,
			String normalizedEmail, Instant now) {
		ensureSelfRegistrationEnabled();
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

		auditRecorder.recordExternalIdentityCreated(userId,
				command.provider().name(), normalizedEmail, now);
		return identityRepository.findById(userId)
				.orElseThrow(AuthenticationApplicationService::invalidCredentials);
	}

	private void recordFailedLogin(UserAccount user, String email,
			AuthenticationRequestMetadata metadata, Instant now) {
		int failedAttempts = user.failedLoginAttempts() + 1;
		Instant lockedUntil = failedAttempts >= policy.maxFailedAttempts()
				? now.plus(policy.lockDuration())
				: null;
		identityRepository.recordFailedLogin(
				user.id(), failedAttempts, lockedUntil);
		auditRecorder.recordLoginFailure(user.id(), email, metadata, now);
	}

	private void ensureSelfRegistrationEnabled() {
		if (!policy.selfRegistrationEnabled()) {
			throw new CodedAccessDeniedException(
					AuthenticationErrorCode.SELF_REGISTRATION_DISABLED);
		}
	}

	private static void enforcePasswordPolicy(String password, String email,
			String displayName) {
		if (PasswordPolicy.validate(password, email, displayName).isPresent()) {
			throw new BusinessRuleViolation(
					AuthenticationErrorCode.WEAK_PASSWORD);
		}
	}

	private static String normalizeEmail(String email) {
		return email.trim().toLowerCase(Locale.ROOT);
	}

	private static ResourceConflict emailAlreadyRegistered() {
		return new ResourceConflict(
				AuthenticationErrorCode.EMAIL_ALREADY_REGISTERED);
	}

	private static CodedAuthenticationException invalidCredentials() {
		return new CodedAuthenticationException(
				AuthenticationErrorCode.INVALID_CREDENTIALS);
	}

}
