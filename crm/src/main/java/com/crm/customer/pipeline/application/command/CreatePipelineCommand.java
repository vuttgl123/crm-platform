package com.crm.customer.pipeline.application.command;

import com.crm.customer.pipeline.domain.PipelineType;

public record CreatePipelineCommand(
		String pipelineCode,
		String name,
		PipelineType pipelineType,
		boolean defaultPipeline
) {
}
