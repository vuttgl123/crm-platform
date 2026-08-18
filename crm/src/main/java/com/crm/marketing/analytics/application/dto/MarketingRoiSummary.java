package com.crm.marketing.analytics.application.dto;

import java.math.BigDecimal;

public record MarketingRoiSummary(
		BigDecimal totalBudget,
		BigDecimal totalActualSpend,
		BigDecimal totalExpectedRevenue,
		BigDecimal totalWonRevenue,
		BigDecimal totalPipelineValue,
		BigDecimal overallRoiPercent,
		int totalCampaignsCount,
		int activeCampaignsCount,
		int totalLeadsGenerated,
		int totalOpportunitiesCreated,
		int totalDealsWon,
		BigDecimal costPerLead,
		BigDecimal customerAcquisitionCost
) {}
