package com.crm.platform.user.infrastructure.persistence;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import com.crm.platform.user.application.dto.TenantUserDetailsDto;
import com.crm.platform.user.application.dto.TenantUserRoleSummaryDto;
import com.crm.platform.user.application.dto.TenantUserStatsDto;
import com.crm.platform.user.application.dto.TenantUserSummaryDto;
import com.crm.platform.user.application.dto.TenantUserTeamSummaryDto;
import com.crm.platform.user.application.port.TenantUserRepository;
import com.crm.platform.user.application.query.TenantUserSearchQuery;
import com.crm.platform.user.domain.PlatformUser;
import com.crm.platform.user.domain.PlatformUserStatus;
import com.crm.sharedkernel.application.PageResult;
import com.crm.sharedkernel.domain.ActorId;
import com.crm.sharedkernel.domain.TenantId;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;

@Repository
public class JdbcTenantUserRepository implements TenantUserRepository {

	private final JdbcClient jdbcClient;

	public JdbcTenantUserRepository(JdbcClient jdbcClient) {
		this.jdbcClient = jdbcClient;
	}

	@Override
	public PageResult<TenantUserSummaryDto> search(TenantId tenantId, TenantUserSearchQuery query) {
		StringBuilder whereClause = new StringBuilder("""
				WHERE m.tenant_id = :tenantId
				  AND m.membership_status <> 'REMOVED'
				""");

		if (query.query() != null && !query.query().trim().isEmpty()) {
			whereClause.append(" AND (LOWER(u.display_name) LIKE :search OR LOWER(u.email) LIKE :search OR LOWER(m.employee_reference) LIKE :search) ");
		}
		if (query.status() != null) {
			whereClause.append(" AND m.membership_status = :status ");
		}
		if (query.roleId() != null) {
			whereClause.append(" AND EXISTS (SELECT 1 FROM platform_user_roles ur WHERE ur.tenant_id = m.tenant_id AND ur.user_id = m.user_id AND ur.role_id = :roleId) ");
		}
		if (query.teamId() != null) {
			whereClause.append(" AND EXISTS (SELECT 1 FROM platform_team_members tm WHERE tm.tenant_id = m.tenant_id AND tm.user_id = m.user_id AND tm.team_id = :teamId AND tm.left_at IS NULL) ");
		}

		String countSql = "SELECT COUNT(*) FROM platform_tenant_memberships m JOIN platform_users u ON u.id = m.user_id " + whereClause;
		var countSpec = jdbcClient.sql(countSql)
				.param("tenantId", tenantId.value().toString());

		if (query.query() != null && !query.query().trim().isEmpty()) {
			countSpec.param("search", "%" + query.query().trim().toLowerCase() + "%");
		}
		if (query.status() != null) {
			countSpec.param("status", query.status().name());
		}
		if (query.roleId() != null) {
			countSpec.param("roleId", query.roleId().toString());
		}
		if (query.teamId() != null) {
			countSpec.param("teamId", query.teamId().toString());
		}

		long totalElements = countSpec.query(Long.class).single();

		int page = query.pageQuery() != null ? query.pageQuery().page() : 0;
		int size = query.pageQuery() != null ? query.pageQuery().size() : 20;
		long offset = (long) page * size;

		String selectSql = """
				SELECT m.user_id, u.email, u.display_name, u.phone_e164,
				       m.job_title, m.employee_reference, m.membership_status,
				       m.is_tenant_admin, m.joined_at, u.last_login_at, m.version
				FROM platform_tenant_memberships m
				JOIN platform_users u ON u.id = m.user_id
				""" + whereClause + """
				ORDER BY m.joined_at DESC, u.display_name ASC
				LIMIT :limit OFFSET :offset
				""";

		var selectSpec = jdbcClient.sql(selectSql)
				.param("tenantId", tenantId.value().toString())
				.param("limit", size)
				.param("offset", offset);

		if (query.query() != null && !query.query().trim().isEmpty()) {
			selectSpec.param("search", "%" + query.query().trim().toLowerCase() + "%");
		}
		if (query.status() != null) {
			selectSpec.param("status", query.status().name());
		}
		if (query.roleId() != null) {
			selectSpec.param("roleId", query.roleId().toString());
		}
		if (query.teamId() != null) {
			selectSpec.param("teamId", query.teamId().toString());
		}

		List<TenantUserSummaryDto> items = selectSpec.query((rs, rowNum) -> {
			UUID userId = UUID.fromString(rs.getString("user_id"));
			List<TenantUserRoleSummaryDto> roles = findRolesForUser(tenantId, userId);
			TenantUserTeamSummaryDto primaryTeam = findPrimaryTeamForUser(tenantId, userId);

			return new TenantUserSummaryDto(
					userId,
					rs.getString("email"),
					rs.getString("display_name"),
					rs.getString("phone_e164"),
					rs.getString("job_title"),
					rs.getString("employee_reference"),
					rs.getString("membership_status"),
					rs.getBoolean("is_tenant_admin"),
					roles,
					primaryTeam,
					rs.getTimestamp("joined_at") != null ? rs.getTimestamp("joined_at").toInstant() : null,
					rs.getTimestamp("last_login_at") != null ? rs.getTimestamp("last_login_at").toInstant() : null,
					rs.getLong("version")
			);
		}).list();

		return PageResult.of(items, page, size, totalElements);
	}

	@Override
	public Optional<TenantUserDetailsDto> findDetailsById(TenantId tenantId, UUID userId) {
		return jdbcClient.sql("""
				SELECT m.user_id, u.email, u.display_name, u.phone_e164,
				       m.job_title, m.employee_reference, m.membership_status,
				       m.is_tenant_admin, m.joined_at, u.last_login_at,
				       m.updated_at, m.updated_by, m.version
				FROM platform_tenant_memberships m
				JOIN platform_users u ON u.id = m.user_id
				WHERE m.tenant_id = :tenantId AND m.user_id = :userId
				""")
				.param("tenantId", tenantId.value().toString())
				.param("userId", userId.toString())
				.query((rs, rowNum) -> {
					List<TenantUserRoleSummaryDto> roles = findRolesForUser(tenantId, userId);
					List<TenantUserTeamSummaryDto> teams = findTeamsForUser(tenantId, userId);
					List<String> permissions = findPermissionsForUser(tenantId, userId);
					String updatedByStr = rs.getString("updated_by");
					UUID updatedBy = updatedByStr != null ? UUID.fromString(updatedByStr) : null;

					return new TenantUserDetailsDto(
							userId,
							rs.getString("email"),
							rs.getString("display_name"),
							rs.getString("phone_e164"),
							rs.getString("job_title"),
							rs.getString("employee_reference"),
							rs.getString("membership_status"),
							rs.getBoolean("is_tenant_admin"),
							roles,
							teams,
							permissions,
							rs.getTimestamp("joined_at") != null ? rs.getTimestamp("joined_at").toInstant() : null,
							rs.getTimestamp("last_login_at") != null ? rs.getTimestamp("last_login_at").toInstant() : null,
							rs.getTimestamp("updated_at") != null ? rs.getTimestamp("updated_at").toInstant() : null,
							updatedBy,
							rs.getLong("version")
					);
				})
				.optional();
	}

	@Override
	public Optional<PlatformUser> findByIdForUpdate(TenantId tenantId, UUID userId) {
		return jdbcClient.sql("""
				SELECT m.tenant_id, m.user_id, u.email, u.display_name, u.phone_e164,
				       m.job_title, m.employee_reference, m.membership_status,
				       m.is_tenant_admin, m.joined_at, u.last_login_at,
				       m.updated_at, m.updated_by, m.version
				FROM platform_tenant_memberships m
				JOIN platform_users u ON u.id = m.user_id
				WHERE m.tenant_id = :tenantId AND m.user_id = :userId
				FOR UPDATE
				""")
				.param("tenantId", tenantId.value().toString())
				.param("userId", userId.toString())
				.query(this::mapUserRow)
				.optional();
	}

	@Override
	public boolean existsByEmail(String email) {
		Integer count = jdbcClient.sql("""
				SELECT COUNT(*) FROM platform_users WHERE LOWER(email) = :email
				""")
				.param("email", email.trim().toLowerCase())
				.query(Integer.class)
				.single();
		return count != null && count > 0;
	}

	@Override
	public Optional<UUID> findUserIdByEmail(String email) {
		return jdbcClient.sql("""
				SELECT id FROM platform_users WHERE LOWER(email) = :email
				""")
				.param("email", email.trim().toLowerCase())
				.query((rs, rowNum) -> UUID.fromString(rs.getString("id")))
				.optional();
	}

	@Override
	public UUID insertUser(String email, String passwordHash, String displayName, String phone, ActorId actorId, Instant now) {
		UUID id = UUID.randomUUID();
		jdbcClient.sql("""
				INSERT INTO platform_users (
				    id, email, password_hash, display_name, phone_e164, status,
				    created_at, updated_at, created_by, updated_by, version
				) VALUES (
				    :id, :email, :passwordHash, :displayName, :phone, 'ACTIVE',
				    :createdAt, :updatedAt, :createdBy, :updatedBy, 1
				)
				""")
				.param("id", id.toString())
				.param("email", email.trim().toLowerCase())
				.param("passwordHash", passwordHash)
				.param("displayName", displayName)
				.param("phone", phone)
				.param("createdAt", Timestamp.from(now))
				.param("updatedAt", Timestamp.from(now))
				.param("createdBy", actorId != null ? actorId.value().toString() : null)
				.param("updatedBy", actorId != null ? actorId.value().toString() : null)
				.update();
		return id;
	}

	@Override
	public void insertMembership(TenantId tenantId, UUID userId, String employeeReference, String jobTitle, boolean isTenantAdmin, ActorId actorId, Instant now) {
		jdbcClient.sql("""
				INSERT INTO platform_tenant_memberships (
				    tenant_id, user_id, membership_status, employee_reference,
				    job_title, is_tenant_admin, joined_at, created_at, updated_at,
				    created_by, updated_by, version
				) VALUES (
				    :tenantId, :userId, 'ACTIVE', :employeeRef,
				    :jobTitle, :isTenantAdmin, :joinedAt, :createdAt, :updatedAt,
				    :createdBy, :updatedBy, 1
				)
				ON DUPLICATE KEY UPDATE
				    membership_status = 'ACTIVE',
				    job_title = VALUES(job_title),
				    employee_reference = VALUES(employee_reference),
				    is_tenant_admin = VALUES(is_tenant_admin),
				    removed_at = NULL,
				    updated_at = VALUES(updated_at),
				    updated_by = VALUES(updated_by),
				    version = platform_tenant_memberships.version + 1
				""")
				.param("tenantId", tenantId.value().toString())
				.param("userId", userId.toString())
				.param("employeeRef", employeeReference)
				.param("jobTitle", jobTitle)
				.param("isTenantAdmin", isTenantAdmin)
				.param("joinedAt", Timestamp.from(now))
				.param("createdAt", Timestamp.from(now))
				.param("updatedAt", Timestamp.from(now))
				.param("createdBy", actorId != null ? actorId.value().toString() : null)
				.param("updatedBy", actorId != null ? actorId.value().toString() : null)
				.update();
	}

	@Override
	public int updateMembership(PlatformUser user, long expectedVersion) {
		// Update user profile
		jdbcClient.sql("""
				UPDATE platform_users
				SET display_name = :displayName,
				    phone_e164 = :phone,
				    updated_at = :updatedAt,
				    updated_by = :updatedBy
				WHERE id = :userId
				""")
				.param("displayName", user.displayName())
				.param("phone", user.phone())
				.param("updatedAt", Timestamp.from(user.updatedAt()))
				.param("updatedBy", user.updatedBy() != null ? user.updatedBy().value().toString() : null)
				.param("userId", user.userId().toString())
				.update();

		// Update tenant membership
		return jdbcClient.sql("""
				UPDATE platform_tenant_memberships
				SET job_title = :jobTitle,
				    employee_reference = :employeeRef,
				    membership_status = :status,
				    is_tenant_admin = :isTenantAdmin,
				    updated_at = :updatedAt,
				    updated_by = :updatedBy,
				    version = :newVersion
				WHERE tenant_id = :tenantId AND user_id = :userId AND version = :expectedVersion
				""")
				.param("jobTitle", user.jobTitle())
				.param("employeeRef", user.employeeReference())
				.param("status", user.status().name())
				.param("isTenantAdmin", user.isTenantAdmin())
				.param("updatedAt", Timestamp.from(user.updatedAt()))
				.param("updatedBy", user.updatedBy() != null ? user.updatedBy().value().toString() : null)
				.param("newVersion", user.version())
				.param("tenantId", user.tenantId().value().toString())
				.param("userId", user.userId().toString())
				.param("expectedVersion", expectedVersion)
				.update();
	}

	@Override
	public void replaceUserRoles(TenantId tenantId, UUID userId, List<UUID> roleIds, ActorId actorId, Instant now) {
		jdbcClient.sql("""
				DELETE FROM platform_user_roles
				WHERE tenant_id = :tenantId AND user_id = :userId
				""")
				.param("tenantId", tenantId.value().toString())
				.param("userId", userId.toString())
				.update();

		if (roleIds != null) {
			for (UUID roleId : roleIds) {
				jdbcClient.sql("""
						INSERT INTO platform_user_roles (
						    tenant_id, user_id, role_id, valid_from, assigned_by, created_at
						) VALUES (
						    :tenantId, :userId, :roleId, :validFrom, :assignedBy, :createdAt
						)
						""")
						.param("tenantId", tenantId.value().toString())
						.param("userId", userId.toString())
						.param("roleId", roleId.toString())
						.param("validFrom", Timestamp.from(now))
						.param("assignedBy", actorId != null ? actorId.value().toString() : null)
						.param("createdAt", Timestamp.from(now))
						.update();
			}
		}
	}

	@Override
	public void replacePrimaryTeam(TenantId tenantId, UUID userId, UUID teamId, ActorId actorId, Instant now) {
		if (teamId == null) return;
		jdbcClient.sql("""
				UPDATE platform_team_members
				SET is_primary = false
				WHERE tenant_id = :tenantId AND user_id = :userId
				""")
				.param("tenantId", tenantId.value().toString())
				.param("userId", userId.toString())
				.update();

		jdbcClient.sql("""
				INSERT INTO platform_team_members (
				    tenant_id, team_id, user_id, member_role, is_primary, joined_at, created_at, created_by
				) VALUES (
				    :tenantId, :teamId, :userId, 'MEMBER', true, :joinedAt, :createdAt, :createdBy
				)
				ON DUPLICATE KEY UPDATE
				    is_primary = true,
				    left_at = NULL
				""")
				.param("tenantId", tenantId.value().toString())
				.param("teamId", teamId.toString())
				.param("userId", userId.toString())
				.param("joinedAt", Timestamp.from(now))
				.param("createdAt", Timestamp.from(now))
				.param("createdBy", actorId != null ? actorId.value().toString() : null)
				.update();
	}

	@Override
	public void softRemoveMembership(TenantId tenantId, UUID userId, ActorId actorId, Instant now) {
		jdbcClient.sql("""
				UPDATE platform_tenant_memberships
				SET membership_status = 'REMOVED',
				    removed_at = :removedAt,
				    updated_at = :updatedAt,
				    updated_by = :updatedBy,
				    version = version + 1
				WHERE tenant_id = :tenantId AND user_id = :userId
				""")
				.param("removedAt", Timestamp.from(now))
				.param("updatedAt", Timestamp.from(now))
				.param("updatedBy", actorId != null ? actorId.value().toString() : null)
				.param("tenantId", tenantId.value().toString())
				.param("userId", userId.toString())
				.update();
	}

	@Override
	public TenantUserStatsDto getStats(TenantId tenantId) {
		Long total = jdbcClient.sql("""
				SELECT COUNT(*) FROM platform_tenant_memberships
				WHERE tenant_id = :tenantId AND membership_status <> 'REMOVED'
				""")
				.param("tenantId", tenantId.value().toString())
				.query(Long.class).single();

		Long active = jdbcClient.sql("""
				SELECT COUNT(*) FROM platform_tenant_memberships
				WHERE tenant_id = :tenantId AND membership_status = 'ACTIVE'
				""")
				.param("tenantId", tenantId.value().toString())
				.query(Long.class).single();

		Long suspended = jdbcClient.sql("""
				SELECT COUNT(*) FROM platform_tenant_memberships
				WHERE tenant_id = :tenantId AND membership_status = 'SUSPENDED'
				""")
				.param("tenantId", tenantId.value().toString())
				.query(Long.class).single();

		Long invited = jdbcClient.sql("""
				SELECT COUNT(*) FROM platform_tenant_memberships
				WHERE tenant_id = :tenantId AND membership_status = 'INVITED'
				""")
				.param("tenantId", tenantId.value().toString())
				.query(Long.class).single();

		Long admins = jdbcClient.sql("""
				SELECT COUNT(*) FROM platform_tenant_memberships
				WHERE tenant_id = :tenantId AND is_tenant_admin = true AND membership_status <> 'REMOVED'
				""")
				.param("tenantId", tenantId.value().toString())
				.query(Long.class).single();

		Long pendingRequests = jdbcClient.sql("""
				SELECT COUNT(*) FROM platform_membership_requests
				WHERE tenant_id = :tenantId AND status = 'PENDING'
				""")
				.param("tenantId", tenantId.value().toString())
				.query(Long.class).single();

		return new TenantUserStatsDto(
				total != null ? total : 0L,
				active != null ? active : 0L,
				suspended != null ? suspended : 0L,
				invited != null ? invited : 0L,
				admins != null ? admins : 0L,
				pendingRequests != null ? pendingRequests : 0L
		);
	}

	private List<TenantUserRoleSummaryDto> findRolesForUser(TenantId tenantId, UUID userId) {
		return jdbcClient.sql("""
				SELECT r.id, r.role_code, r.name
				FROM platform_user_roles ur
				JOIN platform_roles r ON r.id = ur.role_id AND r.tenant_id = ur.tenant_id
				WHERE ur.tenant_id = :tenantId AND ur.user_id = :userId
				ORDER BY r.name ASC
				""")
				.param("tenantId", tenantId.value().toString())
				.param("userId", userId.toString())
				.query((rs, rowNum) -> new TenantUserRoleSummaryDto(
						UUID.fromString(rs.getString("id")),
						rs.getString("role_code"),
						rs.getString("name")
				)).list();
	}

	private TenantUserTeamSummaryDto findPrimaryTeamForUser(TenantId tenantId, UUID userId) {
		return jdbcClient.sql("""
				SELECT t.id, t.name, tm.member_role, tm.is_primary
				FROM platform_team_members tm
				JOIN platform_teams t ON t.id = tm.team_id AND t.tenant_id = tm.tenant_id
				WHERE tm.tenant_id = :tenantId AND tm.user_id = :userId AND tm.left_at IS NULL
				ORDER BY tm.is_primary DESC
				LIMIT 1
				""")
				.param("tenantId", tenantId.value().toString())
				.param("userId", userId.toString())
				.query((rs, rowNum) -> new TenantUserTeamSummaryDto(
						UUID.fromString(rs.getString("id")),
						rs.getString("name"),
						rs.getString("member_role"),
						rs.getBoolean("is_primary")
				)).optional().orElse(null);
	}

	private List<TenantUserTeamSummaryDto> findTeamsForUser(TenantId tenantId, UUID userId) {
		return jdbcClient.sql("""
				SELECT t.id, t.name, tm.member_role, tm.is_primary
				FROM platform_team_members tm
				JOIN platform_teams t ON t.id = tm.team_id AND t.tenant_id = tm.tenant_id
				WHERE tm.tenant_id = :tenantId AND tm.user_id = :userId AND tm.left_at IS NULL
				ORDER BY tm.is_primary DESC, t.name ASC
				""")
				.param("tenantId", tenantId.value().toString())
				.param("userId", userId.toString())
				.query((rs, rowNum) -> new TenantUserTeamSummaryDto(
						UUID.fromString(rs.getString("id")),
						rs.getString("name"),
						rs.getString("member_role"),
						rs.getBoolean("is_primary")
				)).list();
	}

	private List<String> findPermissionsForUser(TenantId tenantId, UUID userId) {
		return jdbcClient.sql("""
				SELECT DISTINCT rp.permission_code
				FROM platform_user_roles ur
				JOIN platform_role_permissions rp ON rp.role_id = ur.role_id AND rp.tenant_id = ur.tenant_id
				WHERE ur.tenant_id = :tenantId AND ur.user_id = :userId
				ORDER BY rp.permission_code ASC
				""")
				.param("tenantId", tenantId.value().toString())
				.param("userId", userId.toString())
				.query(String.class).list();
	}

	private PlatformUser mapUserRow(ResultSet rs, int rowNum) throws SQLException {
		String updatedByStr = rs.getString("updated_by");
		ActorId updatedBy = updatedByStr != null ? new ActorId(UUID.fromString(updatedByStr)) : null;

		return new PlatformUser(
				new TenantId(UUID.fromString(rs.getString("tenant_id"))),
				UUID.fromString(rs.getString("user_id")),
				rs.getString("email"),
				rs.getString("display_name"),
				rs.getString("phone_e164"),
				rs.getString("job_title"),
				rs.getString("employee_reference"),
				PlatformUserStatus.valueOf(rs.getString("membership_status")),
				rs.getBoolean("is_tenant_admin"),
				rs.getTimestamp("joined_at") != null ? rs.getTimestamp("joined_at").toInstant() : null,
				rs.getTimestamp("last_login_at") != null ? rs.getTimestamp("last_login_at").toInstant() : null,
				rs.getTimestamp("updated_at") != null ? rs.getTimestamp("updated_at").toInstant() : null,
				updatedBy,
				rs.getLong("version")
		);
	}
}
