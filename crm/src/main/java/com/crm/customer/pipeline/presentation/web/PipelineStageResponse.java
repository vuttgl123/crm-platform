package com.crm.customer.pipeline.presentation.web;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

import com.crm.customer.pipeline.domain.ForecastCategory;
import com.crm.customer.pipeline.domain.StageCategory;

public record PipelineStageResponse(
		UUID id,
		UUID pipelineId,
		String stageCode,
		String name,
		int displayOrder,
		BigDecimal defaultProbability,
		StageCategory stageCategory,
		ForecastCategory forecastCategory,
		boolean active,
		UUID createdBy,
		Instant createdAt,
		UUID updatedBy,
		Instant updatedAt,
		long version
) {
}
