package com.crm.sales.quote.application.dto;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

import com.crm.sales.quote.domain.QuoteAmounts;
import com.crm.sales.quote.domain.QuoteId;
import com.crm.sales.quote.domain.QuoteStatus;

public record QuoteSummary(
		QuoteId id,
		String quoteNumber,
		int revisionNumber,
		UUID accountId,
		UUID contactId,
		UUID opportunityId,
		UUID ownerUserId,
		QuoteStatus status,
		QuoteAmounts amounts,
		LocalDate issueDate,
		LocalDate validUntil,
		Instant updatedAt,
		long version) {
}
