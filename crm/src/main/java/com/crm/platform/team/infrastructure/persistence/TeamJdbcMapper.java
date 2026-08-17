package com.crm.platform.team.infrastructure.persistence;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.UUID;

import com.crm.platform.team.application.dto.TeamMemberDetails;
import com.crm.platform.team.application.dto.TeamSummary;
import com.crm.platform.team.domain.Team;
import com.crm.platform.team.domain.TeamId;
import com.crm.platform.team.domain.TeamMember;
import com.crm.platform.team.domain.TeamStatus;
import com.crm.sharedkernel.domain.ActorId;
import com.crm.sharedkernel.domain.AuditInfo;
import com.crm.sharedkernel.domain.SoftDeleteInfo;
import com.crm.sharedkernel.domain.TenantId;

public final class TeamJdbcMapper {

	private TeamJdbcMapper() {
	}

	public static Team mapTeam(ResultSet rs, int rowNum) throws SQLException {
		TenantId tenantId = TenantId.from(rs.getObject("tenant_id", UUID.class));
		TeamId id = TeamId.from(rs.getObject("id", UUID.class));
		String name = rs.getString("name");
		String description = rs.getString("description");

		UUID parentUuid = rs.getObject("parent_team_id", UUID.class);
		TeamId parentTeamId = parentUuid != null ? TeamId.from(parentUuid) : null;

		UUID managerUserId = rs.getObject("manager_user_id", UUID.class);

		String statusStr = rs.getString("status");
		TeamStatus status = statusStr != null ? TeamStatus.valueOf(statusStr) : TeamStatus.ACTIVE;

		UUID createdByUuid = rs.getObject("created_by", UUID.class);
		ActorId createdBy = createdByUuid != null ? new ActorId(createdByUuid) : null;
		Timestamp createdAtTs = rs.getTimestamp("created_at");
		Instant createdAt = createdAtTs != null ? createdAtTs.toInstant() : Instant.now();

		UUID updatedByUuid = rs.getObject("updated_by", UUID.class);
		ActorId updatedBy = updatedByUuid != null ? new ActorId(updatedByUuid) : null;
		Timestamp updatedAtTs = rs.getTimestamp("updated_at");
		Instant updatedAt = updatedAtTs != null ? updatedAtTs.toInstant() : createdAt;

		UUID deletedByUuid = rs.getObject("deleted_by", UUID.class);
		ActorId deletedBy = deletedByUuid != null ? new ActorId(deletedByUuid) : null;
		Timestamp deletedAtTs = rs.getTimestamp("deleted_at");
		Instant deletedAt = deletedAtTs != null ? deletedAtTs.toInstant() : null;

		long version = rs.getLong("version");

		AuditInfo auditInfo = AuditInfo.restore(createdBy, createdAt, updatedBy, updatedAt);
		SoftDeleteInfo softDeleteInfo = SoftDeleteInfo.restore(deletedAt, deletedBy);

		return new Team(tenantId, id, name, description, parentTeamId, managerUserId, status, auditInfo, softDeleteInfo, version);
	}

	public static TeamSummary mapSummary(ResultSet rs, int rowNum) throws SQLException {
		UUID id = rs.getObject("id", UUID.class);
		String name = rs.getString("name");
		String description = rs.getString("description");
		UUID parentTeamId = rs.getObject("parent_team_id", UUID.class);
		String parentTeamName = rs.getString("parent_team_name");
		UUID managerUserId = rs.getObject("manager_user_id", UUID.class);

		String statusStr = rs.getString("status");
		TeamStatus status = statusStr != null ? TeamStatus.valueOf(statusStr) : TeamStatus.ACTIVE;

		int activeMembersCount = rs.getInt("active_members_count");
		Timestamp updatedAtTs = rs.getTimestamp("updated_at");
		Instant updatedAt = updatedAtTs != null ? updatedAtTs.toInstant() : Instant.now();
		long version = rs.getLong("version");

		return new TeamSummary(id, name, description, parentTeamId, parentTeamName, managerUserId, status, activeMembersCount, updatedAt, version);
	}

	public static TeamMember mapMember(ResultSet rs, int rowNum) throws SQLException {
		TenantId tenantId = TenantId.from(rs.getObject("tenant_id", UUID.class));
		TeamId teamId = TeamId.from(rs.getObject("team_id", UUID.class));
		UUID userId = rs.getObject("user_id", UUID.class);
		String memberRole = rs.getString("member_role");
		boolean primary = rs.getBoolean("is_primary");

		Timestamp joinedAtTs = rs.getTimestamp("joined_at");
		Instant joinedAt = joinedAtTs != null ? joinedAtTs.toInstant() : Instant.now();

		Timestamp leftAtTs = rs.getTimestamp("left_at");
		Instant leftAt = leftAtTs != null ? leftAtTs.toInstant() : null;

		Timestamp createdAtTs = rs.getTimestamp("created_at");
		Instant createdAt = createdAtTs != null ? createdAtTs.toInstant() : Instant.now();

		UUID createdByUuid = rs.getObject("created_by", UUID.class);
		ActorId createdBy = createdByUuid != null ? new ActorId(createdByUuid) : null;

		return new TeamMember(tenantId, teamId, userId, memberRole, primary, joinedAt, leftAt, createdAt, createdBy);
	}

	public static TeamMemberDetails mapMemberDetails(ResultSet rs, int rowNum) throws SQLException {
		UUID teamId = rs.getObject("team_id", UUID.class);
		UUID userId = rs.getObject("user_id", UUID.class);
		String userDisplayName = rs.getString("user_display_name");
		String userEmail = rs.getString("user_email");
		String memberRole = rs.getString("member_role");
		boolean primary = rs.getBoolean("is_primary");

		Timestamp joinedAtTs = rs.getTimestamp("joined_at");
		Instant joinedAt = joinedAtTs != null ? joinedAtTs.toInstant() : Instant.now();

		Timestamp leftAtTs = rs.getTimestamp("left_at");
		Instant leftAt = leftAtTs != null ? leftAtTs.toInstant() : null;

		return new TeamMemberDetails(teamId, userId, userDisplayName, userEmail, memberRole, primary, joinedAt, leftAt);
	}

}
