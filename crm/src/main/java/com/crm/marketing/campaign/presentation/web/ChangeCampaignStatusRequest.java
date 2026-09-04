package com.crm.marketing.campaign.presentation.web;

import com.crm.marketing.campaign.domain.CampaignStatus;
import jakarta.validation.constraints.NotNull;

public record ChangeCampaignStatusRequest(
		@NotNull CampaignStatus status
) {}
