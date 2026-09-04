package com.crm.platform.access.application.command;

public record InstantiateRoleTemplateCommand(
		String templateCode,
		String customRoleCode,
		String customName
) {}
