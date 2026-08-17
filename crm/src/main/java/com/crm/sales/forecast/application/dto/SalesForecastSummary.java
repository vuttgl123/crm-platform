package com.crm.sales.forecast.application.dto;

import java.util.List;

public record SalesForecastSummary(
		String period,
		Double closedWonAmount,
		Double commitAmount,
		Double bestCaseAmount,
		Double pipelineAmount,
		Double totalTargetQuota,
		Double weightedForecastAmount,
		Double winRatePercent,
		Integer totalDealsCount,
		List<SalesRepPerformanceDto> salesRepPerformance
) {}
