package com.crm.sales.quote.presentation.web;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

import com.crm.sales.quote.domain.QuoteStatus;

public record QuoteSummaryResponse(
		UUID id,
		String quoteNumber,
		int revisionNumber,
		UUID accountId,
		UUID contactId,
		UUID opportunityId,
		UUID ownerUserId,
		QuoteStatus status,
		Amounts amounts,
		LocalDate issueDate,
		LocalDate validUntil,
		Instant updatedAt,
		long version) {

	public record Amounts(
			String currencyCode,
			BigDecimal subtotal,
			BigDecimal discountTotal,
			BigDecimal taxTotal,
			BigDecimal shippingTotal,
			BigDecimal grandTotal) {
	}

}
