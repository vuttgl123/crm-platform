package com.crm.marketing.campaign.application.command;

import java.util.UUID;

import com.crm.marketing.campaign.domain.CampaignId;
import com.crm.marketing.campaign.domain.CampaignMemberStatus;

public record AddCampaignMemberCommand(
		CampaignId campaignId,
		UUID leadId,
		UUID contactId,
		CampaignMemberStatus memberStatus,
		String sourceDetail,
		String metadata
) {
}
