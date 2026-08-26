package com.crm.identity.application.port;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import com.crm.identity.domain.PasswordResetToken;

public interface PasswordResetTokenRepository {

	void create(PasswordResetToken token, String requestedIp,
			String requestedUserAgent);

	Optional<PasswordResetToken> findByIdForUpdate(UUID tokenId);

	void markConsumed(UUID tokenId, Instant consumedAt);

	/**
	 * Invalidates every usable token for the user; used when a new one is
	 * issued, so an older link cannot still be redeemed.
	 */
	void invalidateUsableForUser(UUID userId, Instant invalidatedAt,
			String reason);

	/** Tokens issued to this user at or after the given instant. */
	int countIssuedSince(UUID userId, Instant since);

}
