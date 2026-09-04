package com.crm.platform.settings.application.dto;

import java.util.UUID;

public record AutomationSettingsDto(
		boolean autoAssignLeads,
		String routingStrategy, // ROUND_ROBIN, WEIGHTED_CAPACITY, TERRITORY, MANUAL
		UUID defaultLeadOwnerUserId,
		UUID defaultLeadOwnerTeamId,
		boolean notifySlack,
		boolean dailyDigest,
		String digestTime,
		boolean autoTaskCreationOnNewLead,
		int staleDealThresholdDays
) {}
