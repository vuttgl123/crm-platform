package com.crm.identity.domain;

import java.time.Instant;
import java.util.UUID;

public record PasswordResetToken(
		UUID id,
		UUID userId,
		String tokenHash,
		Instant issuedAt,
		Instant expiresAt,
		Instant consumedAt,
		Instant invalidatedAt,
		String invalidateReason) {

	public boolean isConsumed() {
		return consumedAt != null;
	}

	public boolean isInvalidated() {
		return invalidatedAt != null;
	}

	public boolean isExpiredAt(Instant now) {
		return !expiresAt.isAfter(now);
	}

	/** Usable means: not consumed, not invalidated, and not yet expired. */
	public boolean isUsableAt(Instant now) {
		return !isConsumed() && !isInvalidated() && !isExpiredAt(now);
	}

}
