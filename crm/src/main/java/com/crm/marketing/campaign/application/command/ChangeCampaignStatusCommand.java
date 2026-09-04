package com.crm.marketing.campaign.application.command;

import com.crm.marketing.campaign.domain.CampaignId;
import com.crm.marketing.campaign.domain.CampaignStatus;

public record ChangeCampaignStatusCommand(
		CampaignId id,
		CampaignStatus status
) {}
