package com.crm.platform.settings.application.command;

public record AddIpWhitelistRuleCommand(
		String cidrBlock,
		String description
) {}
