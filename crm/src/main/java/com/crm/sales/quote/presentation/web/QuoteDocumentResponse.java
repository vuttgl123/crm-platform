package com.crm.sales.quote.presentation.web;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import com.crm.sales.quote.domain.QuoteStatus;

public record QuoteDocumentResponse(
		UUID quoteId,
		String quoteNumber,
		int revisionNumber,
		String name,
		QuoteStatus effectiveStatus,
		QuoteStatus storedStatus,
		LocalDate issueDate,
		LocalDate validUntil,
		QuoteCustomerSnapshotResponse customerSnapshot,
		List<QuoteLineResponse> lines,
		QuoteAmountsResponse amounts,
		String paymentTerms,
		String deliveryTerms,
		String customerReference
) {
}
