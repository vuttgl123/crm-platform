package com.crm.sales.quote.application.dto;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import com.crm.sales.quote.domain.QuoteAmounts;
import com.crm.sales.quote.domain.QuoteCustomerSnapshot;
import com.crm.sales.quote.domain.QuoteId;
import com.crm.sales.quote.domain.QuoteStatus;

public record QuoteDocumentDto(
		QuoteId quoteId,
		String quoteNumber,
		int revisionNumber,
		String name,
		QuoteStatus effectiveStatus,
		QuoteStatus storedStatus,
		LocalDate issueDate,
		LocalDate validUntil,
		QuoteCustomerSnapshot customerSnapshot,
		List<QuoteLineDetails> lines,
		QuoteAmounts amounts,
		String paymentTerms,
		String deliveryTerms,
		String customerReference
) {
}
