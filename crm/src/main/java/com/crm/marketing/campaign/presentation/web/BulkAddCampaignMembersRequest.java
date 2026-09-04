package com.crm.marketing.campaign.presentation.web;

import java.util.List;
import java.util.UUID;

import com.crm.marketing.campaign.domain.CampaignMemberStatus;
import jakarta.validation.constraints.NotEmpty;

public record BulkAddCampaignMembersRequest(
		@NotEmpty List<MemberItem> members
) {
	public record MemberItem(
			UUID leadId,
			UUID contactId,
			CampaignMemberStatus memberStatus
	) {}
}
