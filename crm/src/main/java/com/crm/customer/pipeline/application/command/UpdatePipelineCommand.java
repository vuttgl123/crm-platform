package com.crm.customer.pipeline.application.command;

import com.crm.customer.pipeline.domain.PipelineId;
import com.crm.customer.pipeline.domain.PipelineType;

public record UpdatePipelineCommand(
		PipelineId id,
		long version,
		String name,
		PipelineType pipelineType,
		boolean defaultPipeline,
		boolean active
) {
}
