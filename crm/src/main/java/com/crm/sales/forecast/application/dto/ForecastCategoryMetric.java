package com.crm.sales.forecast.application.dto;

import com.crm.sales.forecast.domain.ForecastCategory;

public record ForecastCategoryMetric(
		ForecastCategory category,
		String amount,
		long opportunityCount
) {
}
