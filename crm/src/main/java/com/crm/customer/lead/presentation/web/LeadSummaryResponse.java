package com.crm.customer.lead.presentation.web;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

import com.crm.customer.account.domain.AccountOwnerType;
import com.crm.customer.lead.domain.LeadRating;

public record LeadSummaryResponse(
		UUID id,
		String leadNumber,
		UUID statusId,
		UUID sourceId,
		Owner owner,
		LeadRating rating,
		String companyName,
		String displayName,
		String email,
		String phoneE164,
		String jobTitle,
		EstimatedValue estimatedValue,
		Instant convertedAt,
		Instant updatedAt,
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
