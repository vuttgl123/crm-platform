package com.crm.sales.forecast.application.dto;

import java.util.List;

public record ForecastCurrencySummary(
		String currencyCode,
		String weightedForecastAmount,
		String openPipelineAmount,
		long eligibleOpportunityCount,
		List<ForecastCategoryMetric> categories,
		List<ForecastQualityMetric> quality
) {
}
