package com.crm.marketing.campaign.presentation.web;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

import com.crm.marketing.campaign.application.dto.CampaignPerformanceMetrics;
import com.crm.marketing.campaign.domain.CampaignStatus;
import com.crm.marketing.campaign.domain.CampaignType;

public record CampaignResponse(
		UUID id,
		String campaignCode,
		String name,
		CampaignType campaignType,
		CampaignStatus status,
		UUID ownerUserId,
		Instant startAt,
		Instant endAt,
		BigDecimal budget,
		BigDecimal actualCost,
		String currencyCode,
		BigDecimal expectedRevenue,
		String description,
		String utmSource,
		String utmMedium,
		String utmCampaign,
		CampaignPerformanceMetrics metrics,
		UUID createdBy,
		Instant createdAt,
		UUID updatedBy,
		Instant updatedAt,
		long version
) {
}
