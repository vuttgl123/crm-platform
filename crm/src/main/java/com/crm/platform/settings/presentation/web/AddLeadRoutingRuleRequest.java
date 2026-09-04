package com.crm.platform.settings.presentation.web;

import java.util.UUID;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AddLeadRoutingRuleRequest(
		@NotBlank @Size(max = 255) String ruleName,
		@Min(1) int priority,
		@NotBlank @Size(max = 100) String conditionField,
		@NotBlank @Size(max = 50) String conditionOperator,
		@NotBlank @Size(max = 255) String conditionValue,
		UUID assignToUserId,
		UUID assignToTeamId,
		boolean active
) {}
