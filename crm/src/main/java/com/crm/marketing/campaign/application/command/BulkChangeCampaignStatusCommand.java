package com.crm.marketing.campaign.application.command;

import java.util.List;
import java.util.UUID;

import com.crm.marketing.campaign.domain.CampaignStatus;

public record BulkChangeCampaignStatusCommand(
		List<UUID> campaignIds,
		CampaignStatus status
) {}
