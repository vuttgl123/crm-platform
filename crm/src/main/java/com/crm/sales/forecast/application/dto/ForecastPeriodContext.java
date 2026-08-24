package com.crm.sales.forecast.application.dto;

import com.crm.sales.forecast.domain.ForecastPeriodPreset;

public record ForecastPeriodContext(
		ForecastPeriodPreset preset,
		String fromDate,
		String toDate,
		String timezone
) {
}
