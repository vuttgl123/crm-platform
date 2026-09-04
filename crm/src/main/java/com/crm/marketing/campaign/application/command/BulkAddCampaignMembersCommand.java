package com.crm.marketing.campaign.application.command;

import java.util.List;
import java.util.UUID;

import com.crm.marketing.campaign.domain.CampaignId;
import com.crm.marketing.campaign.domain.CampaignMemberStatus;

public record BulkAddCampaignMembersCommand(
		CampaignId campaignId,
		List<MemberEntry> members
) {
	public record MemberEntry(
			UUID leadId,
			UUID contactId,
			CampaignMemberStatus memberStatus
	) {}
}
