package com.crm.sales.forecast.application.dto;

import java.util.List;

public record SalesForecastSummaryResponse(
		ForecastPeriodContext period,
		AppliedForecastFilters appliedFilters,
		String tenantCurrencyCode,
		String asOf,
		List<ForecastCurrencySummary> currencyGroups
) {
}
