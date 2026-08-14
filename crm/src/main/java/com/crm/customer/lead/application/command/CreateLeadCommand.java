package com.crm.customer.lead.application.command;

import java.util.UUID;

import com.crm.customer.lead.domain.LeadEstimatedValue;
import com.crm.customer.lead.domain.LeadOwner;
import com.crm.customer.lead.domain.LeadRating;

public record CreateLeadCommand(
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
		String qualificationNotes) {
}
