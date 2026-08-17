package com.crm.marketing.campaign.application.command;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

import com.crm.marketing.campaign.domain.CampaignType;

public record CreateCampaignCommand(
		String campaignCode,
		String name,
		CampaignType campaignType,
		UUID ownerUserId,
		Instant startAt,
		Instant endAt,
		BigDecimal budget,
		String currencyCode,
		BigDecimal expectedRevenue,
		String description,
		String utmSource,
		String utmMedium,
		String utmCampaign
) {
}
