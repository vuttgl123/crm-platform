package com.crm.marketing.campaign.application.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

import com.crm.marketing.campaign.domain.Campaign;
import com.crm.marketing.campaign.domain.CampaignStatus;
import com.crm.marketing.campaign.domain.CampaignType;

public record CampaignDetails(
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

	public static CampaignDetails from(Campaign campaign, CampaignPerformanceMetrics metrics) {
		return new CampaignDetails(
				campaign.id().value(),
				campaign.campaignCode(),
				campaign.name(),
				campaign.campaignType(),
				campaign.status(),
				campaign.ownerUserId() != null ? campaign.ownerUserId().value() : null,
				campaign.startAt(),
				campaign.endAt(),
				campaign.budget(),
				campaign.actualCost(),
				campaign.currencyCode(),
				campaign.expectedRevenue(),
				campaign.description(),
				campaign.utmSource(),
				campaign.utmMedium(),
				campaign.utmCampaign(),
				metrics != null ? metrics : CampaignPerformanceMetrics.empty(),
				campaign.auditInfo().createdBy() != null ? campaign.auditInfo().createdBy().value() : null,
				campaign.auditInfo().createdAt(),
				campaign.auditInfo().updatedBy() != null ? campaign.auditInfo().updatedBy().value() : null,
				campaign.auditInfo().updatedAt(),
				campaign.version()
		);
	}

}
