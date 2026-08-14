package com.crm.customer.lead.presentation.web;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

import com.crm.customer.account.domain.AccountOwnerType;
import com.crm.customer.lead.domain.LeadRating;

public record LeadResponse(
		UUID id,
		String leadNumber,
		UUID statusId,
		UUID sourceId,
		Owner owner,
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
		EstimatedValue estimatedValue,
		String qualificationNotes,
		String disqualificationReason,
		Instant convertedAt,
		UUID convertedBy,
		UUID convertedAccountId,
		UUID convertedContactId,
		UUID convertedOpportunityId,
		Instant createdAt,
		UUID createdBy,
		Instant updatedAt,
		UUID updatedBy,
		long version) {

	public record Owner(
			AccountOwnerType type,
			UUID id) {
	}

	public record EstimatedValue(
			BigDecimal amount,
			String currencyCode) {
	}

}
