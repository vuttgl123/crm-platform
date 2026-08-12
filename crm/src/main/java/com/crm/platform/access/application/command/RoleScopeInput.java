package com.crm.platform.access.application.command;

import java.util.UUID;

import com.crm.foundation.security.DataScopeType;

public record RoleScopeInput(
		String entityType,
		DataScopeType type,
		UUID teamId) {
}
