package com.crm.sales.forecast.application.dto;

import java.util.List;

public record ForecastBreakdownRow(
		ForecastBreakdownSubject subject,
		String currencyCode,
		String weightedForecastAmount,
		String openPipelineAmount,
		long opportunityCount,
		List<ForecastCategoryMetric> categories
) {
}
