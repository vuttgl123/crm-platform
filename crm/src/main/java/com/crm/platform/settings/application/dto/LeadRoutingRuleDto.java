package com.crm.platform.settings.application.dto;

import java.util.UUID;

public record LeadRoutingRuleDto(
		UUID id,
		String ruleName,
		int priority,
		String conditionField, // LEAD_SCORE, COUNTRY, INDUSTRY, ANNUAL_REVENUE
		String conditionOperator, // GREATER_THAN, EQUALS, IN, LESS_THAN
		String conditionValue,
		UUID assignToUserId,
		UUID assignToTeamId,
		boolean active
) {}
