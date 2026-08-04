package com.crm.identity.application.port;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import com.crm.identity.domain.RefreshSession;

public interface RefreshSessionRepository {

	Optional<RefreshSession> findByIdForUpdate(UUID sessionId);

	void create(RefreshSession session, Instant issuedAt, String ipAddress,
			String userAgent);

	void rotate(UUID sessionId, String refreshTokenHash, Instant now,
			String ipAddress);

	void revoke(UUID sessionId, Instant now, String reason);

}
