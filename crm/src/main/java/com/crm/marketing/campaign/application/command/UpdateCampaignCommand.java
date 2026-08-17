package com.crm.marketing.campaign.application.command;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

import com.crm.marketing.campaign.domain.CampaignId;
import com.crm.marketing.campaign.domain.CampaignStatus;
import com.crm.marketing.campaign.domain.CampaignType;

public record UpdateCampaignCommand(
		CampaignId id,
		long version,
		String name,
		CampaignType campaignType,
		CampaignStatus status,
		UUID ownerUserId,
		Instant startAt,
		Instant endAt,
		BigDecimal budget,
		BigDecimal actualCost,
		BigDecimal expectedRevenue,
		String currencyCode,
		String description,
		String utmSource,
		String utmMedium,
		String utmCampaign
) {
}
