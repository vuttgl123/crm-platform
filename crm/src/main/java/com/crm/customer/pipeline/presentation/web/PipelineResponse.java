package com.crm.customer.pipeline.presentation.web;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import com.crm.customer.pipeline.domain.PipelineType;

public record PipelineResponse(
		UUID id,
		String pipelineCode,
		String name,
		PipelineType pipelineType,
		boolean defaultPipeline,
		boolean active,
		List<PipelineStageResponse> stages,
		UUID createdBy,
		Instant createdAt,
		UUID updatedBy,
		Instant updatedAt,
		long version
) {
}
