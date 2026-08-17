package com.crm.marketing.campaign.application.command;

import java.util.UUID;

import com.crm.marketing.campaign.domain.CampaignId;
import com.crm.marketing.campaign.domain.CampaignMemberId;
import com.crm.marketing.campaign.domain.CampaignMemberStatus;

public record UpdateCampaignMemberStatusCommand(
		CampaignId campaignId,
		CampaignMemberId memberId,
		long version,
		CampaignMemberStatus memberStatus,
		String sourceDetail,
		String metadata
) {
}
