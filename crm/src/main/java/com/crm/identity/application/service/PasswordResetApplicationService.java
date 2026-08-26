package com.crm.identity.application.service;

import java.time.Duration;
import java.time.Instant;
import java.util.Locale;
import java.util.Optional;
import java.util.UUID;

import com.crm.foundation.security.CodedAuthenticationException;
import com.crm.identity.application.command.AuthenticationRequestMetadata;
import com.crm.identity.application.command.ChangePasswordCommand;
import com.crm.identity.application.command.ForgotPasswordCommand;
import com.crm.identity.application.command.ResetPasswordCommand;
import com.crm.identity.application.port.IdentityRepository;
import com.crm.identity.application.port.PasswordHasher;
import com.crm.identity.application.port.PasswordResetMailer;
import com.crm.identity.application.port.PasswordResetTokenRepository;
import com.crm.identity.domain.AuthenticationErrorCode;
import com.crm.identity.domain.PasswordPolicy;
import com.crm.identity.domain.PasswordResetToken;
import com.crm.identity.domain.UserAccount;
import com.crm.identity.infrastructure.security.PasswordResetTokenFactory;
import com.crm.foundation.identifier.IdentifierGenerator;
import com.crm.foundation.time.TimeProvider;
import com.crm.sharedkernel.domain.exception.BusinessRuleViolation;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PasswordResetApplicationService {

	private static final Logger log =
			LoggerFactory.getLogger(PasswordResetApplicationService.class);

	private static final String SUPERSEDED = "SUPERSEDED";

	private static final String REVOKE_PASSWORD_RESET = "PASSWORD_RESET";

	private static final String REVOKE_PASSWORD_CHANGED = "PASSWORD_CHANGED";

	private final IdentityRepository identityRepository;
	private final PasswordResetTokenRepository tokenRepository;
	private final PasswordResetMailer mailer;
	private final PasswordHasher passwordHasher;
	private final AuthenticationAuditRecorder auditRecorder;
	private final IdentifierGenerator identifierGenerator;
	private final TimeProvider timeProvider;
	private final Duration tokenTtl;
	private final Duration minimumInterval;
	private final int maxPerHour;
	private final String resetUrlTemplate;

	public PasswordResetApplicationService(
			IdentityRepository identityRepository,
			PasswordResetTokenRepository tokenRepository,
			PasswordResetMailer mailer,
			PasswordHasher passwordHasher,
			AuthenticationAuditRecorder auditRecorder,
			IdentifierGenerator identifierGenerator,
			TimeProvider timeProvider,
			Duration tokenTtl,
			Duration minimumInterval,
			int maxPerHour,
			String resetUrlTemplate) {
		this.identityRepository = identityRepository;
		this.tokenRepository = tokenRepository;
		this.mailer = mailer;
		this.passwordHasher = passwordHasher;
		this.auditRecorder = auditRecorder;
		this.identifierGenerator = identifierGenerator;
		this.timeProvider = timeProvider;
		this.tokenTtl = tokenTtl;
		this.minimumInterval = minimumInterval;
		this.maxPerHour = maxPerHour;
		this.resetUrlTemplate = resetUrlTemplate;
	}

	/**
	 * Runs off the request thread so that response time does not depend on
	 * whether the address belongs to an account. Matching the 202 status alone
	 * would still leak the answer through timing.
	 *
	 * Every early return is silent by design: the caller has already been
	 * answered, and any difference in observable behaviour would reintroduce
	 * the enumeration channel this method exists to close.
	 */
	@Async
	@Transactional
	public void requestReset(ForgotPasswordCommand command,
			AuthenticationRequestMetadata metadata, Locale locale) {
		Instant now = timeProvider.now();
		String normalizedEmail =
				command.email().trim().toLowerCase(Locale.ROOT);

		Optional<UserAccount> candidate =
				identityRepository.findByEmail(normalizedEmail);
		if (candidate.isEmpty()) {
			return;
		}
		UserAccount user = candidate.get();
		if (!user.permitsAuthentication() || user.passwordHash() == null) {
			return;
		}
		if (isRateLimited(user.id(), now)) {
			log.info("Password reset rate limit reached for user {}",
					user.id());
			return;
		}

		tokenRepository.invalidateUsableForUser(user.id(), now, SUPERSEDED);

		UUID tokenId = identifierGenerator.nextId();
		String rawToken =
				tokenId + "." + PasswordResetTokenFactory.generateSecret();
		Instant expiresAt = now.plus(tokenTtl);

		tokenRepository.create(new PasswordResetToken(tokenId, user.id(),
				PasswordResetTokenFactory.hash(rawToken), now, expiresAt,
				null, null, null),
				auditRecorder.ipAddress(metadata),
				auditRecorder.userAgent(metadata));

		auditRecorder.recordPasswordResetRequested(
				user.id(), normalizedEmail, metadata, now);

		mailer.sendResetLink(user.email(), user.displayName(),
				String.format(resetUrlTemplate, rawToken), expiresAt, locale);
	}

	@Transactional
	public void resetPassword(ResetPasswordCommand command,
			AuthenticationRequestMetadata metadata) {
		Instant now = timeProvider.now();
		PasswordResetToken token = loadUsableToken(command.rawToken(), now);
		UserAccount user = identityRepository.findById(token.userId())
				.orElseThrow(PasswordResetApplicationService::invalidToken);

		enforcePolicy(command.newPassword(), user.email(), user.displayName());

		identityRepository.updatePasswordAndClearLock(user.id(),
				passwordHasher.hash(command.newPassword()), now);
		tokenRepository.markConsumed(token.id(), now);

		// Reset exists because the account may be compromised; leaving live
		// sessions alone would defeat the entire purpose.
		identityRepository.revokeAllSessions(user.id(), now,
				REVOKE_PASSWORD_RESET);

		auditRecorder.recordPasswordResetCompleted(
				user.id(), user.email(), metadata, now);
	}

	@Transactional
	public void changePassword(UUID userId, ChangePasswordCommand command,
			AuthenticationRequestMetadata metadata) {
		Instant now = timeProvider.now();
		UserAccount user = identityRepository.findById(userId)
				.orElseThrow(() -> new CodedAuthenticationException(
						AuthenticationErrorCode.INVALID_CREDENTIALS));

		if (user.passwordHash() == null || !passwordHasher.matches(
				command.currentPassword(), user.passwordHash())) {
			throw new CodedAuthenticationException(
					AuthenticationErrorCode.INVALID_CREDENTIALS);
		}

		enforcePolicy(command.newPassword(), user.email(), user.displayName());

		identityRepository.updatePasswordAndClearLock(user.id(),
				passwordHasher.hash(command.newPassword()), now);
		identityRepository.revokeAllSessions(user.id(), now,
				REVOKE_PASSWORD_CHANGED);

		auditRecorder.recordPasswordChanged(
				user.id(), user.email(), metadata, now);
	}

	private boolean isRateLimited(UUID userId, Instant now) {
		if (tokenRepository.countIssuedSince(
				userId, now.minus(minimumInterval)) > 0) {
			return true;
		}
		return tokenRepository.countIssuedSince(
				userId, now.minus(Duration.ofHours(1))) >= maxPerHour;
	}

	private PasswordResetToken loadUsableToken(String rawToken, Instant now) {
		int separator = rawToken == null ? -1 : rawToken.indexOf('.');
		if (separator <= 0) {
			throw invalidToken();
		}
		UUID tokenId;
		try {
			tokenId = UUID.fromString(rawToken.substring(0, separator));
		}
		catch (IllegalArgumentException exception) {
			throw invalidToken();
		}

		PasswordResetToken token = tokenRepository.findByIdForUpdate(tokenId)
				.orElseThrow(PasswordResetApplicationService::invalidToken);
		if (!PasswordResetTokenFactory.matches(token.tokenHash(),
				PasswordResetTokenFactory.hash(rawToken))) {
			throw invalidToken();
		}
		if (token.isConsumed() || token.isInvalidated()) {
			throw invalidToken();
		}
		// Expiry is reported separately from invalidity so the UI can offer a
		// fresh link in the first case and not in the second. There is no
		// enumeration risk: the token is itself the secret.
		if (token.isExpiredAt(now)) {
			throw new CodedAuthenticationException(
					AuthenticationErrorCode.PASSWORD_RESET_TOKEN_EXPIRED);
		}
		return token;
	}

	private static void enforcePolicy(String password, String email,
			String displayName) {
		if (PasswordPolicy.validate(password, email, displayName).isPresent()) {
			throw new BusinessRuleViolation(
					AuthenticationErrorCode.WEAK_PASSWORD);
		}
	}

	private static CodedAuthenticationException invalidToken() {
		return new CodedAuthenticationException(
				AuthenticationErrorCode.PASSWORD_RESET_TOKEN_INVALID);
	}

}
