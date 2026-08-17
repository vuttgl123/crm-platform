package com.crm.customer.pipeline.presentation.web;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import com.crm.customer.pipeline.domain.PipelineType;

public record UpdatePipelineRequest(
		@NotNull(message = "Version is required")
		@Positive(message = "Version must be positive")
		Long version,

		@NotBlank(message = "Pipeline name must not be blank")
		@Size(max = 100, message = "Pipeline name must not exceed 100 characters")
		String name,

		PipelineType pipelineType,
		boolean defaultPipeline,
		boolean active
) {
}
