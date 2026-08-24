package com.crm.sales.forecast.application.dto;

import com.crm.sales.forecast.domain.ForecastQualityCode;

public record ForecastQualityMetric(
		ForecastQualityCode code,
		String amount,
		long opportunityCount,
		String scope
) {
}
