package com.crm.overview.application.dto;

import java.util.List;

/** Opportunity volume and value per pipeline stage, ordered by stage position. */
public record FunnelBlock(
		String currencyCode,
		List<FunnelStage> stages
) {
}
