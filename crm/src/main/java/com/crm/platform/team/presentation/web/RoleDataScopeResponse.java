package com.crm.platform.team.presentation.web;

import java.time.Instant;
import java.util.UUID;

import com.crm.platform.team.domain.DataScopeType;

public record RoleDataScopeResponse(
		UUID id,
		UUID roleId,
		String entityType,
		DataScopeType scopeType,
		UUID teamId,
		String teamName,
		Instant createdAt,
		UUID createdBy
) {
}
