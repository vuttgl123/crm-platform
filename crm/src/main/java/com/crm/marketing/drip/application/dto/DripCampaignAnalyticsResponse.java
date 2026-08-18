package com.crm.marketing.drip.application.dto;

import java.util.List;
import java.util.UUID;

public record DripCampaignAnalyticsResponse(
		UUID campaignId,
		String campaignName,
		int totalEnrolled,
		double overallConversionRate,
		List<DripStepAnalytics> stepAnalytics
) {}
