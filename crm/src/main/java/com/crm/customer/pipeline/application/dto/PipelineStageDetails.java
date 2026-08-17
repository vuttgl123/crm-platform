package com.crm.customer.pipeline.application.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

import com.crm.customer.pipeline.domain.ForecastCategory;
import com.crm.customer.pipeline.domain.PipelineStage;
import com.crm.customer.pipeline.domain.StageCategory;

public record PipelineStageDetails(
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

	public static PipelineStageDetails from(PipelineStage stage) {
		return new PipelineStageDetails(
				stage.id().value(),
				stage.pipelineId().value(),
				stage.stageCode(),
				stage.name(),
				stage.displayOrder(),
				stage.defaultProbability(),
				stage.stageCategory(),
				stage.forecastCategory(),
				stage.isActive(),
				stage.auditInfo().createdBy() != null ? stage.auditInfo().createdBy().value() : null,
				stage.auditInfo().createdAt(),
				stage.auditInfo().updatedBy() != null ? stage.auditInfo().updatedBy().value() : null,
				stage.auditInfo().updatedAt(),
				stage.version()
		);
	}

}
