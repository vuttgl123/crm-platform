package com.crm.identity.infrastructure.persistence;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import com.crm.identity.application.port.IdentityRepository;
import com.crm.identity.domain.AuthEvent;
import com.crm.identity.domain.ExternalProvider;
import com.crm.identity.domain.TenantMembershipSummary;
import com.crm.identity.domain.UserAccount;
import com.crm.identity.domain.UserStatus;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;

@Repository
public class JdbcIdentityRepository implements IdentityRepository {

	private static final RowMapper<UserAccount> USER_ACCOUNT_ROW_MAPPER =
			JdbcIdentityRepository::mapUserAccount;

	private final JdbcClient jdbcClient;

	public JdbcIdentityRepository(JdbcClient jdbcClient) {
		this.jdbcClient = jdbcClient;
	}

	@Override
	public Optional<UserAccount> findLocalByEmailForUpdate(String normalizedEmail) {
		return jdbcClient.sql("""
				SELECT u.id, u.email, u.display_name, u.status,
				       u.email_verified_at, c.password_hash,
				       c.failed_login_attempts, c.locked_until
				FROM platform_users u
				JOIN platform_user_credentials c ON c.user_id = u.id
				WHERE u.email = :email
				FOR UPDATE
				""")
				.param("email", normalizedEmail)
				.query(USER_ACCOUNT_ROW_MAPPER)
				.optional();
	}

	@Override
	public Optional<UserAccount> findById(UUID userId) {
		return findOne("u.id = :value", userId.toString());
	}

	@Override
	public Optional<UserAccount> findByEmail(String normalizedEmail) {
		return findOne("u.email = :value", normalizedEmail);
	}

	@Override
	public Optional<UserAccount> findByExternalIdentity(String issuer,
			String subject) {
		return jdbcClient.sql("""
				SELECT u.id, u.email, u.display_name, u.status,
				       u.email_verified_at, c.password_hash,
				       COALESCE(c.failed_login_attempts, 0) AS failed_login_attempts,
				       c.locked_until
				FROM platform_users u
				JOIN platform_user_identities i ON i.user_id = u.id
				LEFT JOIN platform_user_credentials c ON c.user_id = u.id
				WHERE i.issuer = :issuer AND i.subject = :subject
				""")
				.param("issuer", issuer)
				.param("subject", subject)
				.query(USER_ACCOUNT_ROW_MAPPER)
				.optional();
	}

	@Override
	public void createUser(UUID userId, String email, String displayName,
			Instant emailVerifiedAt, Instant now) {
		jdbcClient.sql("""
				INSERT INTO platform_users (
				    id, email, display_name, status, email_verified_at,
				    created_at, updated_at, version
				) VALUES (
				    :id, :email, :displayName, 'ACTIVE', :emailVerifiedAt,
				    :now, :now, 1
				)
				""")
				.param("id", userId.toString())
				.param("email", email)
				.param("displayName", displayName)
				.param("emailVerifiedAt", timestamp(emailVerifiedAt))
				.param("now", Timestamp.from(now))
				.update();
	}

	@Override
	public void createCredential(UUID userId, String passwordHash, Instant now) {
		jdbcClient.sql("""
				INSERT INTO platform_user_credentials (
				    user_id, password_hash, password_changed_at,
				    created_at, updated_at, version
				) VALUES (:userId, :passwordHash, :now, :now, :now, 1)
				""")
				.param("userId", userId.toString())
				.param("passwordHash", passwordHash)
				.param("now", Timestamp.from(now))
				.update();
	}

	@Override
	public void createExternalIdentity(UUID identityId, UUID userId,
			ExternalProvider provider, String issuer, String subject,
			String providerEmail, boolean emailVerified, Instant now) {
		jdbcClient.sql("""
				INSERT INTO platform_user_identities (
				    id, user_id, provider, issuer, subject, provider_email,
				    provider_email_verified, last_login_at, created_at, updated_at
				) VALUES (
				    :id, :userId, :provider, :issuer, :subject, :providerEmail,
				    :emailVerified, :now, :now, :now
				)
				""")
				.param("id", identityId.toString())
				.param("userId", userId.toString())
				.param("provider", provider.name())
				.param("issuer", issuer)
				.param("subject", subject)
				.param("providerEmail", providerEmail)
				.param("emailVerified", emailVerified)
				.param("now", Timestamp.from(now))
				.update();
	}

	@Override
	public void recordFailedLogin(UUID userId, int failedAttempts,
			Instant lockedUntil) {
		jdbcClient.sql("""
				UPDATE platform_user_credentials
				SET failed_login_attempts = :failedAttempts,
				    locked_until = :lockedUntil,
				    version = version + 1
				WHERE user_id = :userId
				""")
				.param("failedAttempts", failedAttempts)
				.param("lockedUntil", timestamp(lockedUntil))
				.param("userId", userId.toString())
				.update();
	}

	@Override
	public void updatePasswordAndClearLock(UUID userId, String passwordHash,
			Instant now) {
		jdbcClient.sql("""
				UPDATE platform_user_credentials
				SET password_hash = :passwordHash,
				    password_changed_at = :now,
				    failed_login_attempts = 0,
				    locked_until = NULL,
				    version = version + 1
				WHERE user_id = :userId
				""")
				.param("passwordHash", passwordHash)
				.param("now", Timestamp.from(now))
				.param("userId", userId.toString())
				.update();
	}

	@Override
	public void revokeAllSessions(UUID userId, Instant now, String reason) {
		jdbcClient.sql("""
				UPDATE platform_auth_sessions
				SET revoked_at = :now, revoke_reason = :reason
				WHERE user_id = :userId AND revoked_at IS NULL
				""")
				.param("now", Timestamp.from(now))
				.param("reason", reason)
				.param("userId", userId.toString())
				.update();
	}

	@Override
	public void recordSuccessfulLogin(UUID userId, Instant now) {
		jdbcClient.sql("""
				UPDATE platform_user_credentials
				SET failed_login_attempts = 0,
				    locked_until = NULL,
				    version = version + 1
				WHERE user_id = :userId
				""")
				.param("userId", userId.toString())
				.update();
		jdbcClient.sql("""
				UPDATE platform_users
				SET last_login_at = :now, updated_at = :now, version = version + 1
				WHERE id = :userId
				""")
				.param("now", Timestamp.from(now))
				.param("userId", userId.toString())
				.update();
	}

	@Override
	public void recordExternalLogin(UUID userId, String issuer, String subject,
			String displayName, Instant now) {
		jdbcClient.sql("""
				UPDATE platform_user_identities
				SET last_login_at = :now, updated_at = :now
				WHERE user_id = :userId AND issuer = :issuer AND subject = :subject
				""")
				.param("now", Timestamp.from(now))
				.param("userId", userId.toString())
				.param("issuer", issuer)
				.param("subject", subject)
				.update();
		jdbcClient.sql("""
				UPDATE platform_users
				SET display_name = :displayName, last_login_at = :now,
				    updated_at = :now, version = version + 1
				WHERE id = :userId
				""")
				.param("displayName", displayName)
				.param("now", Timestamp.from(now))
				.param("userId", userId.toString())
				.update();
	}

	@Override
	public List<TenantMembershipSummary> findActiveTenantMemberships(UUID userId) {
		return jdbcClient.sql("""
				SELECT t.id, t.tenant_code, t.display_name, m.is_tenant_admin
				FROM platform_tenant_memberships m
				JOIN platform_tenants t ON t.id = m.tenant_id
				WHERE m.user_id = :userId
				  AND m.membership_status = 'ACTIVE'
				  AND t.status IN ('TRIAL', 'ACTIVE')
				ORDER BY t.display_name, t.id
				""")
				.param("userId", userId.toString())
				.query((resultSet, rowNumber) -> new TenantMembershipSummary(
						UUID.fromString(resultSet.getString("id")),
						resultSet.getString("tenant_code"),
						resultSet.getString("display_name"),
						resultSet.getBoolean("is_tenant_admin")))
				.list();
	}

	@Override
	public boolean hasActiveTenantMembership(UUID userId, UUID tenantId) {
		return jdbcClient.sql("""
				SELECT COUNT(*)
				FROM platform_tenant_memberships m
				JOIN platform_tenants t ON t.id = m.tenant_id
				JOIN platform_users u ON u.id = m.user_id
				WHERE m.user_id = :userId AND m.tenant_id = :tenantId
				  AND m.membership_status = 'ACTIVE'
				  AND t.status IN ('TRIAL', 'ACTIVE')
				  AND u.status = 'ACTIVE'
				""")
				.param("userId", userId.toString())
				.param("tenantId", tenantId.toString())
				.query(Long.class)
				.single() > 0L;
	}

	@Override
	public void appendAuthEvent(AuthEvent event) {
		jdbcClient.sql("""
				INSERT INTO platform_auth_events (
				    id, user_id, session_id, event_type, provider, success,
				    email, failure_code, ip_address, user_agent, occurred_at
				) VALUES (
				    :id, :userId, :sessionId, :eventType, :provider, :success,
				    :email, :failureCode, :ipAddress, :userAgent, :occurredAt
				)
				""")
				.param("id", event.id().toString())
				.param("userId", uuid(event.userId()))
				.param("sessionId", uuid(event.sessionId()))
				.param("eventType", event.eventType())
				.param("provider", event.provider())
				.param("success", event.success())
				.param("email", event.email())
				.param("failureCode", event.failureCode())
				.param("ipAddress", event.ipAddress())
				.param("userAgent", event.userAgent())
				.param("occurredAt", Timestamp.from(event.occurredAt()))
				.update();
	}

	private Optional<UserAccount> findOne(String predicate, String value) {
		return jdbcClient.sql("""
				SELECT u.id, u.email, u.display_name, u.status,
				       u.email_verified_at, c.password_hash,
				       COALESCE(c.failed_login_attempts, 0) AS failed_login_attempts,
				       c.locked_until
				FROM platform_users u
				LEFT JOIN platform_user_credentials c ON c.user_id = u.id
				WHERE %s
				""".formatted(predicate))
				.param("value", value)
				.query(USER_ACCOUNT_ROW_MAPPER)
				.optional();
	}

	private static UserAccount mapUserAccount(ResultSet resultSet, int rowNumber)
			throws SQLException {
		return new UserAccount(
				UUID.fromString(resultSet.getString("id")),
				resultSet.getString("email"),
				resultSet.getString("display_name"),
				UserStatus.valueOf(resultSet.getString("status")),
				resultSet.getString("password_hash"),
				resultSet.getInt("failed_login_attempts"),
				instant(resultSet.getTimestamp("locked_until")),
				instant(resultSet.getTimestamp("email_verified_at")));
	}

	private static Timestamp timestamp(Instant instant) {
		return instant == null ? null : Timestamp.from(instant);
	}

	private static Instant instant(Timestamp timestamp) {
		return timestamp == null ? null : timestamp.toInstant();
	}

	private static String uuid(UUID value) {
		return value == null ? null : value.toString();
	}

}
