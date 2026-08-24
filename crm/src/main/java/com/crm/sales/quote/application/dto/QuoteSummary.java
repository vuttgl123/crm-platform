package com.crm.sales.quote.application.dto;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

import com.crm.sales.quote.domain.QuoteAction;
import com.crm.sales.quote.domain.QuoteAmounts;
import com.crm.sales.quote.domain.QuoteId;
import com.crm.sales.quote.domain.QuoteStatus;

public record QuoteSummary(
		QuoteId id,
		String quoteNumber,
		int revisionNumber,
		String name,
		boolean latestRevision,
		boolean legacyAmountOnly,
		QuoteStatus effectiveStatus,
		QuoteReferenceDto account,
		QuoteReferenceDto opportunity,
		QuoteOwnerReferenceDto owner,
		QuoteAmounts amounts,
		int lineCount,
		LocalDate issueDate,
		LocalDate validUntil,
		Instant updatedAt,
		long version,
		List<QuoteAction> availableActions
) {
}
