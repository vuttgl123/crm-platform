package com.crm.platform.settings.presentation.web;

import java.util.UUID;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;

public record UpdateAutomationRequest(
		boolean autoAssignLeads,
		@Size(max = 50) String routingStrategy,
		UUID defaultLeadOwnerUserId,
		UUID defaultLeadOwnerTeamId,
		boolean notifySlack,
		boolean dailyDigest,
		@Size(max = 10) String digestTime,
		boolean autoTaskCreationOnNewLead,
		@Min(1) @Max(365) int staleDealThresholdDays
) {}
