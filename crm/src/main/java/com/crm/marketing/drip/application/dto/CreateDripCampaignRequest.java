package com.crm.marketing.drip.application.dto;

import java.util.List;

public record CreateDripCampaignRequest(
		String name,
		String description,
		String triggerEvent,
		String targetAudience,
		List<DripStepDto> steps
) {}
