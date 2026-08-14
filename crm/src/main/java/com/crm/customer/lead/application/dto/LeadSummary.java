package com.crm.customer.lead.application.dto;

import java.time.Instant;
import java.util.UUID;

import com.crm.customer.lead.domain.LeadEstimatedValue;
import com.crm.customer.lead.domain.LeadId;
import com.crm.customer.lead.domain.LeadOwner;
import com.crm.customer.lead.domain.LeadRating;

public record LeadSummary(
		LeadId id,
		String leadNumber,
		UUID statusId,
		UUID sourceId,
		LeadOwner owner,
		LeadRating rating,
		String companyName,
		String displayName,
		String email,
		String phoneE164,
		String jobTitle,
		LeadEstimatedValue estimatedValue,
		Instant convertedAt,
		Instant updatedAt,
		long version) {
}
