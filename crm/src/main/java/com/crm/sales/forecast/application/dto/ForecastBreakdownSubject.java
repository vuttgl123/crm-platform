package com.crm.sales.forecast.application.dto;

import java.util.UUID;

import com.crm.sales.forecast.domain.ForecastCategory;

public record ForecastBreakdownSubject(
		String kind,
		UUID id,
		String label,
		UUID pipelineId,
		String pipelineName,
		Integer displayOrder,
		String stageCategory,
		ForecastCategory forecastCategory
) {
}
