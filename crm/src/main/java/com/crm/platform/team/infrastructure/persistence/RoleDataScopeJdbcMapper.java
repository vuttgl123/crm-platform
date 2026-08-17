package com.crm.platform.team.infrastructure.persistence;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.UUID;

import com.crm.platform.team.application.dto.RoleDataScopeDetails;
import com.crm.platform.team.domain.DataScopeType;
import com.crm.platform.team.domain.RoleDataScope;
import com.crm.platform.team.domain.RoleDataScopeId;
import com.crm.platform.team.domain.TeamId;
import com.crm.sharedkernel.domain.ActorId;
import com.crm.sharedkernel.domain.TenantId;

public final class RoleDataScopeJdbcMapper {

	private RoleDataScopeJdbcMapper() {
	}

	public static RoleDataScope mapScope(ResultSet rs, int rowNum) throws SQLException {
		TenantId tenantId = TenantId.from(rs.getObject("tenant_id", UUID.class));
		RoleDataScopeId id = RoleDataScopeId.from(rs.getObject("id", UUID.class));
		UUID roleId = rs.getObject("role_id", UUID.class);
		String entityType = rs.getString("entity_type");

		String scopeStr = rs.getString("scope_type");
		DataScopeType scopeType = scopeStr != null ? DataScopeType.valueOf(scopeStr) : DataScopeType.TENANT;

		UUID teamUuid = rs.getObject("team_id", UUID.class);
		TeamId teamId = teamUuid != null ? TeamId.from(teamUuid) : null;

		Timestamp createdAtTs = rs.getTimestamp("created_at");
		Instant createdAt = createdAtTs != null ? createdAtTs.toInstant() : Instant.now();

		UUID createdByUuid = rs.getObject("created_by", UUID.class);
		ActorId createdBy = createdByUuid != null ? new ActorId(createdByUuid) : null;

		return new RoleDataScope(tenantId, id, roleId, entityType, scopeType, teamId, createdAt, createdBy);
	}

	public static RoleDataScopeDetails mapDetails(ResultSet rs, int rowNum) throws SQLException {
		UUID id = rs.getObject("id", UUID.class);
		UUID roleId = rs.getObject("role_id", UUID.class);
		String entityType = rs.getString("entity_type");

		String scopeStr = rs.getString("scope_type");
		DataScopeType scopeType = scopeStr != null ? DataScopeType.valueOf(scopeStr) : DataScopeType.TENANT;

		UUID teamId = rs.getObject("team_id", UUID.class);
		String teamName = rs.getString("team_name");

		Timestamp createdAtTs = rs.getTimestamp("created_at");
		Instant createdAt = createdAtTs != null ? createdAtTs.toInstant() : Instant.now();

		UUID createdBy = rs.getObject("created_by", UUID.class);

		return new RoleDataScopeDetails(id, roleId, entityType, scopeType, teamId, teamName, createdAt, createdBy);
	}

}
