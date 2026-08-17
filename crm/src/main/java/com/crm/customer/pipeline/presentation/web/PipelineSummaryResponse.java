package com.crm.customer.pipeline.presentation.web;

import java.time.Instant;
import java.util.UUID;

import com.crm.customer.pipeline.domain.PipelineType;

public record PipelineSummaryResponse(
		UUID id,
		String pipelineCode,
		String name,
		PipelineType pipelineType,
		boolean defaultPipeline,
		boolean active,
		int stageCount,
		Instant createdAt,
		Instant updatedAt,
		long version
) {
}
