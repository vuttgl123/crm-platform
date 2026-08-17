package com.crm.marketing.campaign.presentation.web;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import com.crm.marketing.campaign.domain.CampaignMemberStatus;

public record UpdateCampaignMemberStatusRequest(
		@NotNull(message = "Version is required")
		@Positive(message = "Version must be positive")
		Long version,

		@NotNull(message = "Member status is required")
		CampaignMemberStatus memberStatus,

		@Size(max = 255, message = "Source detail must not exceed 255 characters")
		String sourceDetail,

		String metadata
) {
}
