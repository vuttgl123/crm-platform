package com.crm.sales.quote.presentation.web;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

import com.crm.sales.quote.domain.QuoteStatus;

public record QuoteResponse(
		UUID id,
		String quoteNumber,
		int revisionNumber,
		UUID previousQuoteId,
		UUID accountId,
		UUID contactId,
		UUID opportunityId,
		UUID priceBookId,
		UUID ownerUserId,
		QuoteStatus status,
		Amounts amounts,
		BigDecimal exchangeRateToTenantCurrency,
		LocalDate issueDate,
		LocalDate validUntil,
		String paymentTerms,
		String deliveryTerms,
		String customerReference,
		String notes,
		Instant approvedAt,
		UUID approvedBy,
		Instant acceptedAt,
		Instant rejectedAt,
		Instant createdAt,
		UUID createdBy,
		Instant updatedAt,
		UUID updatedBy,
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
