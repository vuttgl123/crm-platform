package com.crm.platform.team.infrastructure.persistence;

import java.sql.Timestamp;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import com.crm.platform.team.application.dto.TeamMemberDetails;
import com.crm.platform.team.application.dto.TeamSummary;
import com.crm.platform.team.application.port.TeamRepository;
import com.crm.platform.team.domain.Team;
import com.crm.platform.team.domain.TeamId;
import com.crm.platform.team.domain.TeamMember;
import com.crm.sharedkernel.domain.TenantId;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;

@Repository
public class JdbcTeamRepository implements TeamRepository {

	private static final String TEAM_SELECT = """
			SELECT t.tenant_id, t.id, t.name, t.description, t.parent_team_id,
			       t.manager_user_id, t.status, t.created_at, t.updated_at,
			       t.created_by, t.updated_by, t.deleted_at, t.deleted_by, t.version
			FROM platform_teams t
			""";

	private static final String SUMMARY_SELECT = """
			SELECT t.id, t.name, t.description, t.parent_team_id,
			       pt.name AS parent_team_name, t.manager_user_id, t.status,
			       (SELECT COUNT(*) FROM platform_team_members tm WHERE tm.tenant_id = t.tenant_id AND tm.team_id = t.id AND tm.left_at IS NULL) AS active_members_count,
			       t.updated_at, t.version
			FROM platform_teams t
			LEFT JOIN platform_teams pt ON pt.tenant_id = t.tenant_id AND pt.id = t.parent_team_id
			""";

	private final JdbcClient jdbcClient;

	public JdbcTeamRepository(JdbcClient jdbcClient) {
		this.jdbcClient = jdbcClient;
	}

	@Override
	public Optional<Team> findById(TenantId tenantId, TeamId id) {
		String sql = TEAM_SELECT + """
				WHERE t.tenant_id = :tenantId
				  AND t.id = :id
				  AND t.deleted_at IS NULL
				""";
		return jdbcClient.sql(sql)
				.param("tenantId", tenantId.value())
				.param("id", id.value())
				.query(TeamJdbcMapper::mapTeam)
				.optional();
	}

	@Override
	public Optional<Team> findByName(TenantId tenantId, String name) {
		String sql = TEAM_SELECT + """
				WHERE t.tenant_id = :tenantId
				  AND lower(t.name) = lower(:name)
				  AND t.deleted_at IS NULL
				""";
		return jdbcClient.sql(sql)
				.param("tenantId", tenantId.value())
				.param("name", name.trim())
				.query(TeamJdbcMapper::mapTeam)
				.optional();
	}

	@Override
	public boolean existsByName(TenantId tenantId, String name) {
		String sql = """
				SELECT COUNT(*) > 0
				FROM platform_teams t
				WHERE t.tenant_id = :tenantId
				  AND lower(t.name) = lower(:name)
				  AND t.deleted_at IS NULL
				""";
		return Boolean.TRUE.equals(jdbcClient.sql(sql)
				.param("tenantId", tenantId.value())
				.param("name", name.trim())
				.query(Boolean.class)
				.single());
	}

	@Override
	public List<TeamSummary> findAll(TenantId tenantId) {
		String sql = SUMMARY_SELECT + """
				WHERE t.tenant_id = :tenantId
				  AND t.deleted_at IS NULL
				ORDER BY t.name ASC
				""";
		return jdbcClient.sql(sql)
				.param("tenantId", tenantId.value())
				.query(TeamJdbcMapper::mapSummary)
				.list();
	}

	@Override
	public void insert(Team team) {
		String sql = """
				INSERT INTO platform_teams (
				    tenant_id, id, name, description, parent_team_id,
				    manager_user_id, status, created_at, updated_at,
				    created_by, updated_by, deleted_at, deleted_by, version
				) VALUES (
				    :tenantId, :id, :name, :description, :parentTeamId,
				    :managerUserId, :status, :createdAt, :updatedAt,
				    :createdBy, :updatedBy, :deletedAt, :deletedBy, :version
				)
				""";
		jdbcClient.sql(sql)
				.param("tenantId", team.tenantId().value())
				.param("id", team.id().value())
				.param("name", team.name())
				.param("description", team.description())
				.param("parentTeamId", team.parentTeamId() != null ? team.parentTeamId().value() : null)
				.param("managerUserId", team.managerUserId())
				.param("status", team.status().name())
				.param("createdAt", Timestamp.from(team.auditInfo().createdAt()))
				.param("updatedAt", Timestamp.from(team.auditInfo().updatedAt()))
				.param("createdBy", team.auditInfo().createdBy() != null ? team.auditInfo().createdBy().value() : null)
				.param("updatedBy", team.auditInfo().updatedBy() != null ? team.auditInfo().updatedBy().value() : null)
				.param("deletedAt", team.softDeleteInfo().deletedAt() != null ? Timestamp.from(team.softDeleteInfo().deletedAt()) : null)
				.param("deletedBy", team.softDeleteInfo().deletedBy() != null ? team.softDeleteInfo().deletedBy().value() : null)
				.param("version", team.version())
				.update();
	}

	@Override
	public void update(Team team) {
		String sql = """
				UPDATE platform_teams
				SET name = :name,
				    description = :description,
				    parent_team_id = :parentTeamId,
				    manager_user_id = :managerUserId,
				    status = :status,
				    updated_at = :updatedAt,
				    updated_by = :updatedBy,
				    deleted_at = :deletedAt,
				    deleted_by = :deletedBy,
				    version = :newVersion
				WHERE tenant_id = :tenantId
				  AND id = :id
				  AND version = :expectedVersion
				""";
		int updated = jdbcClient.sql(sql)
				.param("tenantId", team.tenantId().value())
				.param("id", team.id().value())
				.param("name", team.name())
				.param("description", team.description())
				.param("parentTeamId", team.parentTeamId() != null ? team.parentTeamId().value() : null)
				.param("managerUserId", team.managerUserId())
				.param("status", team.status().name())
				.param("updatedAt", Timestamp.from(team.auditInfo().updatedAt()))
				.param("updatedBy", team.auditInfo().updatedBy() != null ? team.auditInfo().updatedBy().value() : null)
				.param("deletedAt", team.softDeleteInfo().deletedAt() != null ? Timestamp.from(team.softDeleteInfo().deletedAt()) : null)
				.param("deletedBy", team.softDeleteInfo().deletedBy() != null ? team.softDeleteInfo().deletedBy().value() : null)
				.param("newVersion", team.version())
				.param("expectedVersion", team.version() - 1)
				.update();
		if (updated == 0) {
			throw new IllegalStateException("Team update failed due to version mismatch");
		}
	}

	@Override
	public void insertMember(TeamMember member) {
		String sql = """
				INSERT INTO platform_team_members (
				    tenant_id, team_id, user_id, member_role,
				    is_primary, joined_at, left_at, created_at, created_by
				) VALUES (
				    :tenantId, :teamId, :userId, :memberRole,
				    :isPrimary, :joinedAt, :leftAt, :createdAt, :createdBy
				)
				""";
		jdbcClient.sql(sql)
				.param("tenantId", member.tenantId().value())
				.param("teamId", member.teamId().value())
				.param("userId", member.userId())
				.param("memberRole", member.memberRole())
				.param("isPrimary", member.isPrimary())
				.param("joinedAt", Timestamp.from(member.joinedAt()))
				.param("leftAt", member.leftAt() != null ? Timestamp.from(member.leftAt()) : null)
				.param("createdAt", Timestamp.from(member.createdAt()))
				.param("createdBy", member.createdBy() != null ? member.createdBy().value() : null)
				.update();
	}

	@Override
	public void updateMember(TeamMember member) {
		String sql = """
				UPDATE platform_team_members
				SET member_role = :memberRole,
				    is_primary = :isPrimary,
				    left_at = :leftAt
				WHERE tenant_id = :tenantId
				  AND team_id = :teamId
				  AND user_id = :userId
				""";
		jdbcClient.sql(sql)
				.param("tenantId", member.tenantId().value())
				.param("teamId", member.teamId().value())
				.param("userId", member.userId())
				.param("memberRole", member.memberRole())
				.param("isPrimary", member.isPrimary())
				.param("leftAt", member.leftAt() != null ? Timestamp.from(member.leftAt()) : null)
				.update();
	}

	@Override
	public void removeMember(TenantId tenantId, TeamId teamId, UUID userId) {
		String sql = """
				DELETE FROM platform_team_members
				WHERE tenant_id = :tenantId
				  AND team_id = :teamId
				  AND user_id = :userId
				""";
		jdbcClient.sql(sql)
				.param("tenantId", tenantId.value())
				.param("teamId", teamId.value())
				.param("userId", userId)
				.update();
	}

	@Override
	public void clearPrimaryForUser(TenantId tenantId, UUID userId) {
		String sql = """
				UPDATE platform_team_members
				SET is_primary = false
				WHERE tenant_id = :tenantId
				  AND user_id = :userId
				  AND is_primary = true
				""";
		jdbcClient.sql(sql)
				.param("tenantId", tenantId.value())
				.param("userId", userId)
				.update();
	}

	@Override
	public Optional<TeamMember> findMember(TenantId tenantId, TeamId teamId, UUID userId) {
		String sql = """
				SELECT tm.tenant_id, tm.team_id, tm.user_id, tm.member_role,
				       tm.is_primary, tm.joined_at, tm.left_at, tm.created_at, tm.created_by
				FROM platform_team_members tm
				WHERE tm.tenant_id = :tenantId
				  AND tm.team_id = :teamId
				  AND tm.user_id = :userId
				""";
		return jdbcClient.sql(sql)
				.param("tenantId", tenantId.value())
				.param("teamId", teamId.value())
				.param("userId", userId)
				.query(TeamJdbcMapper::mapMember)
				.optional();
	}

	@Override
	public List<TeamMemberDetails> findMembersByTeam(TenantId tenantId, TeamId teamId) {
		String sql = """
				SELECT tm.team_id, tm.user_id, u.display_name AS user_display_name,
				       u.email AS user_email, tm.member_role, tm.is_primary,
				       tm.joined_at, tm.left_at
				FROM platform_team_members tm
				JOIN platform_users u ON u.id = tm.user_id
				WHERE tm.tenant_id = :tenantId
				  AND tm.team_id = :teamId
				ORDER BY tm.is_primary DESC, tm.joined_at ASC
				""";
		return jdbcClient.sql(sql)
				.param("tenantId", tenantId.value())
				.param("teamId", teamId.value())
				.query(TeamJdbcMapper::mapMemberDetails)
				.list();
	}

	@Override
	public com.crm.platform.team.application.dto.TeamStatsDto getStats(TenantId tenantId) {
		Long total = jdbcClient.sql("""
				SELECT COUNT(*) FROM platform_teams
				WHERE tenant_id = :tenantId AND deleted_at IS NULL
				""")
				.param("tenantId", tenantId.value())
				.query(Long.class).single();

		Long active = jdbcClient.sql("""
				SELECT COUNT(*) FROM platform_teams
				WHERE tenant_id = :tenantId AND status = 'ACTIVE' AND deleted_at IS NULL
				""")
				.param("tenantId", tenantId.value())
				.query(Long.class).single();

		Long totalAssigned = jdbcClient.sql("""
				SELECT COUNT(DISTINCT user_id) FROM platform_team_members
				WHERE tenant_id = :tenantId AND left_at IS NULL
				""")
				.param("tenantId", tenantId.value())
				.query(Long.class).single();

		Long unassigned = jdbcClient.sql("""
				SELECT COUNT(*) FROM platform_users u
				WHERE u.deleted_at IS NULL
				  AND NOT EXISTS (
				      SELECT 1 FROM platform_team_members tm
				      WHERE tm.tenant_id = :tenantId AND tm.user_id = u.id AND tm.left_at IS NULL
				  )
				""")
				.param("tenantId", tenantId.value())
				.query(Long.class).single();

		Long withManagers = jdbcClient.sql("""
				SELECT COUNT(*) FROM platform_teams
				WHERE tenant_id = :tenantId AND manager_user_id IS NOT NULL AND deleted_at IS NULL
				""")
				.param("tenantId", tenantId.value())
				.query(Long.class).single();

		return new com.crm.platform.team.application.dto.TeamStatsDto(
				total != null ? total : 0L,
				active != null ? active : 0L,
				totalAssigned != null ? totalAssigned : 0L,
				unassigned != null ? unassigned : 0L,
				withManagers != null ? withManagers : 0L
		);
	}

	@Override
	public void updateStatus(TenantId tenantId, TeamId teamId, String status, java.time.Instant now) {
		jdbcClient.sql("""
				UPDATE platform_teams
				SET status = :status,
				    updated_at = :now,
				    version = version + 1
				WHERE tenant_id = :tenantId AND id = :teamId AND deleted_at IS NULL
				""")
				.param("status", status)
				.param("now", Timestamp.from(now))
				.param("tenantId", tenantId.value())
				.param("teamId", teamId.value())
				.update();
	}

	@Override
	public void updateManager(TenantId tenantId, TeamId teamId, UUID newManagerUserId, java.time.Instant now) {
		jdbcClient.sql("""
				UPDATE platform_teams
				SET manager_user_id = :managerUserId,
				    updated_at = :now,
				    version = version + 1
				WHERE tenant_id = :tenantId AND id = :teamId AND deleted_at IS NULL
				""")
				.param("managerUserId", newManagerUserId)
				.param("now", Timestamp.from(now))
				.param("tenantId", tenantId.value())
				.param("teamId", teamId.value())
				.update();
	}

}
