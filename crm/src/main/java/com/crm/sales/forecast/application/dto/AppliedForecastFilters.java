package com.crm.sales.forecast.application.dto;

import java.util.UUID;

public record AppliedForecastFilters(
		UUID pipelineId,
		ForecastOwnerFilterDto owner,
		String currencyCode
) {
}
