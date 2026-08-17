package com.crm.marketing.campaign.application.dto;

import java.math.BigDecimal;

public record CampaignPerformanceMetrics(
		int totalMembers,
		int sentCount,
		int openedCount,
		int clickedCount,
		int respondedCount,
		int attendedCount,
		double responseRatePercent,
		int opportunitiesCount,
		int wonOpportunitiesCount,
		BigDecimal totalOpportunityValue,
		BigDecimal wonOpportunityValue,
		BigDecimal roiPercent
) {

	public static CampaignPerformanceMetrics empty() {
		return new CampaignPerformanceMetrics(
				0, 0, 0, 0, 0, 0, 0.0, 0, 0,
				BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO
		);
	}

}
