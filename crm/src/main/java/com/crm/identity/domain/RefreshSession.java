package com.crm.identity.domain;

import java.time.Instant;
import java.util.UUID;

public record RefreshSession(
		UUID id,
		UUID userId,
		String refreshTokenHash,
		long rotationCounter,
		Instant expiresAt,
		Instant revokedAt) {

	public boolean isUsableAt(Instant now) {
		return revokedAt == null && expiresAt.isAfter(now);
	}

}
