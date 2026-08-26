package com.crm.overview.application.dto;

import java.util.UUID;

public record FunnelStage(
		UUID stageId,
		String stageName,
		String pipelineName,
		Integer displayOrder,
		String stageCategory,
		String openPipelineAmount,
		long opportunityCount
) {
}
