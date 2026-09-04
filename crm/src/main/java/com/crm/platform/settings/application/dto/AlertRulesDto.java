package com.crm.platform.settings.application.dto;

import java.math.BigDecimal;
import java.util.List;

public record AlertRulesDto(
		boolean highValueDealAlertEnabled,
		BigDecimal highValueDealThreshold,
		List<String> highValueNotificationChannels, // ["SLACK", "EMAIL", "IN_APP"]
		boolean staleDealAlertEnabled,
		int staleDealInactivityDays,
		boolean churnRiskAlertEnabled
) {}
