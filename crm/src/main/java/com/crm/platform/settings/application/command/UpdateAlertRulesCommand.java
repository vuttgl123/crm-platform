package com.crm.platform.settings.application.command;

import java.math.BigDecimal;
import java.util.List;

public record UpdateAlertRulesCommand(
		boolean highValueDealAlertEnabled,
		BigDecimal highValueDealThreshold,
		List<String> highValueNotificationChannels,
		boolean staleDealAlertEnabled,
		int staleDealInactivityDays,
		boolean churnRiskAlertEnabled
) {}
