package com.crm.platform.settings.presentation.web;

import java.math.BigDecimal;
import java.util.List;

import jakarta.validation.constraints.DecimalMin;

public record UpdateAlertRulesRequest(
		boolean highValueDealAlertEnabled,
		@DecimalMin("0.0") BigDecimal highValueDealThreshold,
		List<String> highValueNotificationChannels,
		boolean staleDealAlertEnabled,
		int staleDealInactivityDays,
		boolean churnRiskAlertEnabled
) {}
