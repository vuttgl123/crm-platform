package com.crm.marketing.campaign.presentation.web;

import java.time.Instant;
import java.util.UUID;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import com.crm.marketing.campaign.domain.CampaignStatus;
import com.crm.marketing.campaign.domain.CampaignType;

public record CampaignSearchRequest(
		String q,
		CampaignType campaignType,
		CampaignStatus status,
		UUID ownerUserId,
		Instant startDateFrom,
		Instant startDateTo,

		@Min(value = 0, message = "Page index must not be negative")
		Integer page,

		@Min(value = 1, message = "Page size must be at least 1")
		@Max(value = 100, message = "Page size must not exceed 100")
		Integer size
) {
}
