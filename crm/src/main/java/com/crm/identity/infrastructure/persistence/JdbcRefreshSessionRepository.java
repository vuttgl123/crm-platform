package com.crm.identity.infrastructure.persistence;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import com.crm.identity.application.port.RefreshSessionRepository;
import com.crm.identity.domain.RefreshSession;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;

@Repository
public final class JdbcRefreshSessionRepository
		implements RefreshSessionRepository {

	private final JdbcClient jdbcClient;

	public JdbcRefreshSessionRepository(JdbcClient jdbcClient) {
		this.jdbcClient = jdbcClient;
	}

	@Override
	public Optional<RefreshSession> findByIdForUpdate(UUID sessionId) {
		return jdbcClient.sql("""
				SELECT id, user_id, refresh_token_hash, rotation_counter,
				       expires_at, revoked_at
				FROM platform_auth_sessions
				WHERE id = :id
				FOR UPDATE
				""")
				.param("id", sessionId.toString())
				.query((resultSet, rowNumber) -> new RefreshSession(
						UUID.fromString(resultSet.getString("id")),
						UUID.fromString(resultSet.getString("user_id")),
						resultSet.getString("refresh_token_hash"),
						resultSet.getLong("rotation_counter"),
						resultSet.getTimestamp("expires_at").toInstant(),
						instant(resultSet.getTimestamp("revoked_at"))))
				.optional();
	}

	@Override
	public void create(RefreshSession session, Instant issuedAt,
			String ipAddress, String userAgent) {
		jdbcClient.sql("""
				INSERT INTO platform_auth_sessions (
				    id, user_id, refresh_token_hash, rotation_counter,
				    issued_at, expires_at, created_ip, last_used_ip, user_agent
				) VALUES (
				    :id, :userId, :refreshTokenHash, :rotationCounter,
				    :issuedAt, :expiresAt, :ipAddress, :ipAddress, :userAgent
				)
				""")
				.param("id", session.id().toString())
				.param("userId", session.userId().toString())
				.param("refreshTokenHash", session.refreshTokenHash())
				.param("rotationCounter", session.rotationCounter())
				.param("issuedAt", Timestamp.from(issuedAt))
				.param("expiresAt", Timestamp.from(session.expiresAt()))
				.param("ipAddress", ipAddress)
				.param("userAgent", userAgent)
				.update();
	}

	@Override
	public void rotate(UUID sessionId, String refreshTokenHash, Instant now,
			String ipAddress) {
		jdbcClient.sql("""
				UPDATE platform_auth_sessions
				SET refresh_token_hash = :refreshTokenHash,
				    rotation_counter = rotation_counter + 1,
				    last_used_at = :now,
				    last_used_ip = :ipAddress
				WHERE id = :id AND revoked_at IS NULL
				""")
				.param("refreshTokenHash", refreshTokenHash)
				.param("now", Timestamp.from(now))
				.param("ipAddress", ipAddress)
				.param("id", sessionId.toString())
				.update();
	}

	@Override
	public void revoke(UUID sessionId, Instant now, String reason) {
		jdbcClient.sql("""
				UPDATE platform_auth_sessions
				SET revoked_at = COALESCE(revoked_at, :now),
				    revoke_reason = COALESCE(revoke_reason, :reason)
				WHERE id = :id
				""")
				.param("now", Timestamp.from(now))
				.param("reason", reason)
				.param("id", sessionId.toString())
				.update();
	}

	private static Instant instant(Timestamp timestamp) {
		return timestamp == null ? null : timestamp.toInstant();
	}

}
