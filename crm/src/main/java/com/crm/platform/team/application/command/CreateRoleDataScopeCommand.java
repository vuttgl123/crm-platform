package com.crm.platform.team.application.command;

import java.util.UUID;

import com.crm.platform.team.domain.DataScopeType;
import com.crm.platform.team.domain.TeamId;

public record CreateRoleDataScopeCommand(
		UUID roleId,
		String entityType,
		DataScopeType scopeType,
		TeamId teamId
) {
}
