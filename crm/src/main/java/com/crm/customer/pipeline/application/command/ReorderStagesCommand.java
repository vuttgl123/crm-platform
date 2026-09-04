package com.crm.customer.pipeline.application.command;

import java.util.List;
import java.util.UUID;

import com.crm.customer.pipeline.domain.PipelineId;

public record ReorderStagesCommand(
		PipelineId pipelineId,
		List<UUID> orderedStageIds
) {}
