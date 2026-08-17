package com.crm.marketing.campaign.application.dto;

import java.time.Instant;
import java.util.UUID;

import com.crm.marketing.campaign.domain.CampaignMemberStatus;

public record CampaignMemberDetails(
		UUID id,
		UUID campaignId,
		UUID leadId,
		String leadName,
		String leadCompany,
		String leadEmail,
		UUID contactId,
		String contactName,
		String contactEmail,
		CampaignMemberStatus memberStatus,
		String sourceDetail,
		Instant firstRespondedAt,
		Instant lastEngagedAt,
		String metadata,
		UUID createdBy,
		Instant createdAt,
		UUID updatedBy,
		Instant updatedAt,
		long version
) {
}
