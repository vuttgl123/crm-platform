package com.crm.customer.pipeline.application.dto;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import com.crm.customer.pipeline.domain.Pipeline;
import com.crm.customer.pipeline.domain.PipelineType;

public record PipelineDetails(
		UUID id,
		String pipelineCode,
		String name,
		PipelineType pipelineType,
		boolean defaultPipeline,
		boolean active,
		List<PipelineStageDetails> stages,
		UUID createdBy,
		Instant createdAt,
		UUID updatedBy,
		Instant updatedAt,
		long version
) {

	public static PipelineDetails from(Pipeline pipeline, List<PipelineStageDetails> stages) {
		return new PipelineDetails(
				pipeline.id().value(),
				pipeline.pipelineCode(),
				pipeline.name(),
				pipeline.pipelineType(),
				pipeline.isDefaultPipeline(),
				pipeline.isActive(),
				stages != null ? stages : List.of(),
				pipeline.auditInfo().createdBy() != null ? pipeline.auditInfo().createdBy().value() : null,
				pipeline.auditInfo().createdAt(),
				pipeline.auditInfo().updatedBy() != null ? pipeline.auditInfo().updatedBy().value() : null,
				pipeline.auditInfo().updatedAt(),
				pipeline.version()
		);
	}

}
