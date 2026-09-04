package com.crm.marketing.campaign.application.dto;

import java.math.BigDecimal;

public record CampaignStatsDto(
		long totalCampaigns,
		long activeCampaigns,
		long planningCampaigns,
		long completedCampaigns,
		long pausedCampaigns,
		BigDecimal totalBudgetedCost,
		BigDecimal totalActualCost,
		long totalMembersCount
) {}
