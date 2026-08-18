package com.crm.marketing.drip.application.dto;

public record DripStepAnalytics(
		int stepOrder,
		String stepName,
		String stepType,
		int sentCount,
		int openCount,
		int clickCount,
		double openRatePercent,
		double clickRatePercent,
		double conversionRatePercent
) {}
