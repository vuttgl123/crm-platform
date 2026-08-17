package com.crm.marketing.campaign.presentation.web;

import java.util.UUID;

import jakarta.validation.constraints.Size;
import com.crm.marketing.campaign.domain.CampaignMemberStatus;

public record AddCampaignMemberRequest(
		UUID leadId,

		UUID contactId,

		CampaignMemberStatus memberStatus,

		@Size(max = 255, message = "Source detail must not exceed 255 characters")
		String sourceDetail,

		String metadata
) {
}
