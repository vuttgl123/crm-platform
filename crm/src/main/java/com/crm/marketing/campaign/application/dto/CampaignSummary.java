package com.crm.marketing.campaign.application.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

import com.crm.marketing.campaign.domain.CampaignStatus;
import com.crm.marketing.campaign.domain.CampaignType;

public record CampaignSummary(
		UUID id,
		String campaignCode,
		String name,
		CampaignType campaignType,
		CampaignStatus status,
		UUID ownerUserId,
		String ownerUserName,
		Instant startAt,
		Instant endAt,
		BigDecimal budget,
		BigDecimal actualCost,
		String currencyCode,
		BigDecimal expectedRevenue,
		int membersCount,
		int respondedCount,
		BigDecimal wonRevenue,
		Instant updatedAt,
		long version
) {
}
