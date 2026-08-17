package com.crm.customer.pipeline.presentation.web;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import com.crm.customer.pipeline.domain.PipelineType;

public record CreatePipelineRequest(
		@NotBlank(message = "Pipeline code must not be blank")
		@Pattern(regexp = "^[A-Za-z0-9_]{2,50}$", message = "Pipeline code must be 2-50 characters alphanumeric or underscore")
		String pipelineCode,

		@NotBlank(message = "Pipeline name must not be blank")
		@Size(max = 100, message = "Pipeline name must not exceed 100 characters")
		String name,

		PipelineType pipelineType,
		boolean defaultPipeline
) {
}
