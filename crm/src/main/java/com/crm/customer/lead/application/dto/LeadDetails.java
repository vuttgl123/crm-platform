package com.crm.customer.lead.application.dto;

import java.time.Instant;
import java.util.UUID;

import com.crm.customer.lead.domain.LeadEstimatedValue;
import com.crm.customer.lead.domain.LeadId;
import com.crm.customer.lead.domain.LeadOwner;
import com.crm.customer.lead.domain.LeadRating;
import com.crm.sharedkernel.domain.ActorId;
import com.crm.sharedkernel.domain.TenantId;

public record LeadDetails(
		TenantId tenantId,
		LeadId id,
		String leadNumber,
		UUID statusId,
		UUID sourceId,
		LeadOwner owner,
		LeadRating rating,
		String accountName,
		String companyName,
		String honorific,
		String givenName,
		String familyName,
		String displayName,
		String email,
		String phoneE164,
		String jobTitle,
		String website,
		String countryCode,
		String preferredLanguageCode,
		LeadEstimatedValue estimatedValue,
		String qualificationNotes,
		String disqualificationReason,
		Instant convertedAt,
		ActorId convertedBy,
		UUID convertedAccountId,
		UUID convertedContactId,
		UUID convertedOpportunityId,
		Instant createdAt,
		ActorId createdBy,
		Instant updatedAt,
		ActorId updatedBy,
		long version) {
}
