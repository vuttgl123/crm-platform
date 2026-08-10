package com.crm.identity.application.service;

import java.time.Instant;
import java.util.UUID;

import com.crm.foundation.identifier.IdentifierGenerator;
import com.crm.foundation.security.CodedAuthenticationException;
import com.crm.foundation.time.TimeProvider;
import com.crm.identity.application.AuthenticationPolicy;
import com.crm.identity.application.command.AuthenticationRequestMetadata;
import com.crm.identity.application.dto.IssuedTokens;
import com.crm.identity.application.port.AccessTokenIssuer;
import com.crm.identity.application.port.IdentityRepository;
import com.crm.identity.application.port.RefreshSessionRepository;
import com.crm.identity.application.port.RefreshTokenManager;
import com.crm.identity.application.port.RefreshTokenManager.GeneratedRefreshToken;
import com.crm.identity.application.port.RefreshTokenManager.ParsedRefreshToken;
import com.crm.identity.domain.AuthenticationErrorCode;
import com.crm.identity.domain.RefreshSession;
import com.crm.identity.domain.UserAccount;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthenticationSessionService {

	private final IdentityRepository identityRepository;
	private final RefreshSessionRepository refreshSessionRepository;
	private final AccessTokenIssuer accessTokenIssuer;
	private final RefreshTokenManager refreshTokenManager;
	private final AuthenticationAuditRecorder auditRecorder;
	private final IdentifierGenerator identifierGenerator;
	private final TimeProvider timeProvider;
	private final AuthenticationPolicy policy;

	public AuthenticationSessionService(
			IdentityRepository identityRepository,
			RefreshSessionRepository refreshSessionRepository,
			AccessTokenIssuer accessTokenIssuer,
			RefreshTokenManager refreshTokenManager,
			AuthenticationAuditRecorder auditRecorder,
			IdentifierGenerator identifierGenerator,
			TimeProvider timeProvider,
			AuthenticationPolicy policy) {
		this.identityRepository = identityRepository;
		this.refreshSessionRepository = refreshSessionRepository;
		this.accessTokenIssuer = accessTokenIssuer;
		this.refreshTokenManager = refreshTokenManager;
		this.auditRecorder = auditRecorder;
		this.identifierGenerator = identifierGenerator;
		this.timeProvider = timeProvider;
		this.policy = policy;
	}

	public IssuedTokens issueLogin(UserAccount user, String provider,
			AuthenticationRequestMetadata metadata, Instant issuedAt) {
		UUID sessionId = identifierGenerator.nextId();
		GeneratedRefreshToken refreshToken = refreshTokenManager
				.generate(sessionId);
		RefreshSession session = new RefreshSession(
				sessionId,
				user.id(),
				refreshToken.hash(),
				0,
				issuedAt.plus(policy.refreshTokenTtl()),
				null);
		refreshSessionRepository.create(session, issuedAt,
				auditRecorder.ipAddress(metadata),
				auditRecorder.userAgent(metadata));
		String accessToken = accessTokenIssuer.issue(user, sessionId, issuedAt);
		auditRecorder.recordLoginSuccess(
				user, sessionId, provider, metadata, issuedAt);
		return new IssuedTokens(accessToken, refreshToken.rawToken(),
				policy.accessTokenTtl(), user);
	}

	@Transactional(noRollbackFor = CodedAuthenticationException.class)
	public IssuedTokens refresh(String rawRefreshToken,
			AuthenticationRequestMetadata metadata) {
		Instant now = timeProvider.now();
		ParsedRefreshToken parsed = refreshTokenManager.parse(rawRefreshToken)
				.orElseThrow(AuthenticationSessionService::invalidRefreshToken);
		RefreshSession session = refreshSessionRepository
				.findByIdForUpdate(parsed.sessionId())
				.orElseThrow(AuthenticationSessionService::invalidRefreshToken);

		if (!refreshTokenManager.matches(session.refreshTokenHash(),
				parsed.hash())) {
			handleRefreshTokenReuse(session, metadata, now);
		}
		if (!session.isUsableAt(now)) {
			if (session.revokedAt() == null) {
				refreshSessionRepository.revoke(session.id(), now, "EXPIRED");
			}
			throw invalidRefreshToken();
		}

		UserAccount user = identityRepository.findById(session.userId())
				.filter(UserAccount::permitsAuthentication)
				.orElseThrow(AuthenticationSessionService::invalidRefreshToken);
		GeneratedRefreshToken rotated = refreshTokenManager
				.generate(session.id());
		refreshSessionRepository.rotate(session.id(), rotated.hash(), now,
				auditRecorder.ipAddress(metadata));
		String accessToken = accessTokenIssuer.issue(user, session.id(), now);
		auditRecorder.recordRefresh(user, session.id(), metadata, now);
		return new IssuedTokens(accessToken, rotated.rawToken(),
				policy.accessTokenTtl(), user);
	}

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

	private void handleRefreshTokenReuse(RefreshSession session,
			AuthenticationRequestMetadata metadata, Instant now) {
		refreshSessionRepository.revoke(session.id(), now, "REUSE_DETECTED");
		UserAccount user = identityRepository.findById(session.userId())
				.orElse(null);
		auditRecorder.recordRefreshTokenReuse(session,
				user == null ? null : user.email(), metadata, now);
		throw new CodedAuthenticationException(
				AuthenticationErrorCode.REFRESH_TOKEN_REUSED);
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
		auditRecorder.recordLogout(session,
				user == null ? null : user.email(), metadata, now);
	}

	private static CodedAuthenticationException invalidRefreshToken() {
		return new CodedAuthenticationException(
				AuthenticationErrorCode.INVALID_REFRESH_TOKEN);
	}

}
