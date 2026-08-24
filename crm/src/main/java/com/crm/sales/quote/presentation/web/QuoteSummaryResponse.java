package com.crm.sales.quote.presentation.web;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import com.crm.sales.quote.domain.QuoteAction;
import com.crm.sales.quote.domain.QuoteStatus;

public record QuoteSummaryResponse(
		UUID id,
		String quoteNumber,
		int revisionNumber,
		String name,
		boolean latestRevision,
		boolean legacyAmountOnly,
		QuoteStatus effectiveStatus,
		QuoteReferenceResponse account,
		QuoteReferenceResponse opportunity,
		QuoteOwnerReferenceResponse owner,
		QuoteAmountsResponse amounts,
		int lineCount,
		LocalDate issueDate,
		LocalDate validUntil,
		Instant updatedAt,
		long version,
		List<QuoteAction> availableActions
) {
}
