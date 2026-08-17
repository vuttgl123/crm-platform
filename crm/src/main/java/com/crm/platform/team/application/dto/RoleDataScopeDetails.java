package com.crm.platform.team.application.dto;

import java.time.Instant;
import java.util.UUID;

import com.crm.platform.team.domain.DataScopeType;
import com.crm.platform.team.domain.RoleDataScope;

public record RoleDataScopeDetails(
		UUID id,
		UUID roleId,
		String entityType,
		DataScopeType scopeType,
		UUID teamId,
		String teamName,
		Instant createdAt,
		UUID createdBy
) {

	public static RoleDataScopeDetails from(RoleDataScope scope, String teamName) {
		return new RoleDataScopeDetails(
				scope.id().value(),
				scope.roleId(),
				scope.entityType(),
				scope.scopeType(),
				scope.teamId() != null ? scope.teamId().value() : null,
				teamName,
				scope.createdAt(),
				scope.createdBy() != null ? scope.createdBy().value() : null
		);
	}

}
