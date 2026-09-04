package com.crm.marketing.campaign.presentation.web;

import java.util.List;
import java.util.UUID;

import com.crm.marketing.campaign.domain.CampaignStatus;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

public record BulkChangeCampaignStatusRequest(
		@NotEmpty List<UUID> campaignIds,
		@NotNull CampaignStatus status
) {}
