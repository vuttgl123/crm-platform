package com.crm.platform.settings.application.command;

import java.util.UUID;

public record UpdateAutomationRulesCommand(
		boolean autoAssignLeads,
		String routingStrategy,
		UUID defaultLeadOwnerUserId,
		UUID defaultLeadOwnerTeamId,
		boolean notifySlack,
		boolean dailyDigest,
		String digestTime,
		boolean autoTaskCreationOnNewLead,
		int staleDealThresholdDays
) {}
