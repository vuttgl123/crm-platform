package com.crm.customer.pipeline.application.command;

import java.math.BigDecimal;

import com.crm.customer.pipeline.domain.ForecastCategory;
import com.crm.customer.pipeline.domain.PipelineId;
import com.crm.customer.pipeline.domain.StageCategory;

public record CreatePipelineStageCommand(
		PipelineId pipelineId,
		String stageCode,
		String name,
		int displayOrder,
		BigDecimal defaultProbability,
		StageCategory stageCategory,
		ForecastCategory forecastCategory
) {
}
