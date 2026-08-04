package com.crm.identity.application.service;

import java.time.Instant;
import java.util.UUID;

import com.crm.foundation.identifier.IdentifierGenerator;
import com.crm.identity.application.command.AuthenticationRequestMetadata;
import com.crm.identity.application.port.IdentityRepository;
import com.crm.identity.domain.AuthEvent;
import com.crm.identity.domain.RefreshSession;
import com.crm.identity.domain.UserAccount;
import org.springframework.stereotype.Component;

@Component
public final class AuthenticationAuditRecorder {

	private static final String LOCAL_PROVIDER = "LOCAL";
	private static final String SESSION_PROVIDER = "SESSION";
	private static final String INVALID_CREDENTIALS = "INVALID_CREDENTIALS";
	private static final String REFRESH_TOKEN_REUSED = "REFRESH_TOKEN_REUSED";

	private final IdentityRepository identityRepository;
	private final IdentifierGenerator identifierGenerator;

	public AuthenticationAuditRecorder(IdentityRepository identityRepository,
			IdentifierGenerator identifierGenerator) {
		this.identityRepository = identityRepository;
		this.identifierGenerator = identifierGenerator;
	}

	public void recordRegistration(UserAccount user,
			AuthenticationRequestMetadata metadata, Instant occurredAt) {
		record(user.id(), null, "REGISTER", LOCAL_PROVIDER, true,
				user.email(), null, metadata, occurredAt);
	}

	public void recordLoginSuccess(UserAccount user, UUID sessionId,
			String provider, AuthenticationRequestMetadata metadata,
			Instant occurredAt) {
		record(user.id(), sessionId, "LOGIN_SUCCESS", provider, true,
				user.email(), null, metadata, occurredAt);
	}

	public void recordLoginFailure(UUID userId, String email,
			AuthenticationRequestMetadata metadata, Instant occurredAt) {
		record(userId, null, "LOGIN_FAILURE", LOCAL_PROVIDER, false, email,
				INVALID_CREDENTIALS, metadata, occurredAt);
	}

	public void recordRefreshTokenReuse(RefreshSession session, String email,
			AuthenticationRequestMetadata metadata, Instant occurredAt) {
		record(session.userId(), session.id(), "SESSION_REVOKED",
				SESSION_PROVIDER, false, email, REFRESH_TOKEN_REUSED, metadata,
				occurredAt);
	}

	public void recordRefresh(UserAccount user, UUID sessionId,
			AuthenticationRequestMetadata metadata, Instant occurredAt) {
		record(user.id(), sessionId, "REFRESH", SESSION_PROVIDER, true,
				user.email(), null, metadata, occurredAt);
	}

	public void recordLogout(RefreshSession session, String email,
			AuthenticationRequestMetadata metadata, Instant occurredAt) {
		record(session.userId(), session.id(), "LOGOUT", SESSION_PROVIDER,
				true, email, null, metadata, occurredAt);
	}

	public void recordExternalIdentityCreated(UUID userId, String provider,
			String email, Instant occurredAt) {
		record(userId, null, "EXTERNAL_IDENTITY_CREATED", provider, true,
				email, null, null, occurredAt);
	}

	private void record(UUID userId, UUID sessionId, String eventType,
			String provider, boolean success, String email, String failureCode,
			AuthenticationRequestMetadata metadata, Instant occurredAt) {
		identityRepository.appendAuthEvent(new AuthEvent(
				identifierGenerator.nextId(), userId, sessionId, eventType,
				provider, success, email, failureCode, ipAddress(metadata),
				userAgent(metadata), occurredAt));
	}

	String ipAddress(AuthenticationRequestMetadata metadata) {
		return metadata == null ? null : truncate(metadata.ipAddress(), 45);
	}

	String userAgent(AuthenticationRequestMetadata metadata) {
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

}
