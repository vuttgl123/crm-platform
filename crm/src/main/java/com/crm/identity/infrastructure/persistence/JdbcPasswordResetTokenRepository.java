package com.crm.identity.infrastructure.persistence;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import com.crm.identity.application.port.PasswordResetTokenRepository;
import com.crm.identity.domain.PasswordResetToken;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;

@Repository
public class JdbcPasswordResetTokenRepository
		implements PasswordResetTokenRepository {

	private final JdbcClient jdbcClient;

	public JdbcPasswordResetTokenRepository(JdbcClient jdbcClient) {
		this.jdbcClient = jdbcClient;
	}

	@Override
	public void create(PasswordResetToken token, String requestedIp,
			String requestedUserAgent) {
		jdbcClient.sql("""
				INSERT INTO platform_password_reset_tokens
				    (id, user_id, token_hash, issued_at, expires_at,
				     requested_ip, requested_user_agent)
				VALUES
				    (:id, :userId, :tokenHash, :issuedAt, :expiresAt,
				     :requestedIp, :requestedUserAgent)
				""")
				.param("id", token.id().toString())
				.param("userId", token.userId().toString())
				.param("tokenHash", token.tokenHash())
				.param("issuedAt", Timestamp.from(token.issuedAt()))
				.param("expiresAt", Timestamp.from(token.expiresAt()))
				.param("requestedIp", requestedIp)
				.param("requestedUserAgent", requestedUserAgent)
				.update();
	}

	@Override
	public Optional<PasswordResetToken> findByIdForUpdate(UUID tokenId) {
		return jdbcClient.sql("""
				SELECT id, user_id, token_hash, issued_at, expires_at,
				       consumed_at, invalidated_at, invalidate_reason
				FROM platform_password_reset_tokens
				WHERE id = :id
				FOR UPDATE
				""")
				.param("id", tokenId.toString())
				.query((rs, rowNum) -> new PasswordResetToken(
						UUID.fromString(rs.getString("id")),
						UUID.fromString(rs.getString("user_id")),
						rs.getString("token_hash"),
						instant(rs.getTimestamp("issued_at")),
						instant(rs.getTimestamp("expires_at")),
						instant(rs.getTimestamp("consumed_at")),
						instant(rs.getTimestamp("invalidated_at")),
						rs.getString("invalidate_reason")))
				.optional();
	}

	/**
	 * The guard lives in the WHERE clause rather than in the caller, mirroring
	 * the CHECK (consumed_at IS NULL OR invalidated_at IS NULL) constraint one
	 * layer down.
	 */
	@Override
	public void markConsumed(UUID tokenId, Instant consumedAt) {
		jdbcClient.sql("""
				UPDATE platform_password_reset_tokens
				SET consumed_at = :consumedAt
				WHERE id = :id
				  AND consumed_at IS NULL
				  AND invalidated_at IS NULL
				""")
				.param("consumedAt", Timestamp.from(consumedAt))
				.param("id", tokenId.toString())
				.update();
	}

	@Override
	public void invalidateUsableForUser(UUID userId, Instant invalidatedAt,
			String reason) {
		jdbcClient.sql("""
				UPDATE platform_password_reset_tokens
				SET invalidated_at = :invalidatedAt,
				    invalidate_reason = :reason
				WHERE user_id = :userId
				  AND consumed_at IS NULL
				  AND invalidated_at IS NULL
				""")
				.param("invalidatedAt", Timestamp.from(invalidatedAt))
				.param("reason", reason)
				.param("userId", userId.toString())
				.update();
	}

	@Override
	public int countIssuedSince(UUID userId, Instant since) {
		return jdbcClient.sql("""
				SELECT COUNT(*)
				FROM platform_password_reset_tokens
				WHERE user_id = :userId AND issued_at >= :since
				""")
				.param("userId", userId.toString())
				.param("since", Timestamp.from(since))
				.query(Integer.class)
				.single();
	}

	private static Instant instant(Timestamp timestamp) {
		return timestamp == null ? null : timestamp.toInstant();
	}

}
