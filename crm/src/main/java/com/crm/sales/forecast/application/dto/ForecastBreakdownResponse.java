package com.crm.sales.forecast.application.dto;

import java.util.List;

import com.crm.sales.forecast.domain.ForecastBreakdownDimension;

public record ForecastBreakdownResponse(
		ForecastBreakdownDimension dimension,
		ForecastPeriodContext period,
		AppliedForecastFilters appliedFilters,
		String currencyCode,
		List<ForecastBreakdownRow> items,
		int page,
		int size,
		long totalElements,
		int totalPages,
		String asOf
) {
}
