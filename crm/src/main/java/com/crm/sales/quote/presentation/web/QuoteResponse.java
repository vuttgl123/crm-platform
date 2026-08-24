package com.crm.sales.quote.presentation.web;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import com.crm.sales.quote.domain.QuoteAction;
import com.crm.sales.quote.domain.QuotePricingMode;
import com.crm.sales.quote.domain.QuoteStatus;

public record QuoteResponse(
		UUID id,
		String quoteNumber,
		int revisionNumber,
		UUID previousQuoteId,
		String name,
		boolean latestRevision,
		boolean legacyAmountOnly,
		QuoteStatus effectiveStatus,
		QuoteStatus storedStatus,
		QuotePricingMode pricingMode,
		QuoteReferenceResponse account,
		QuoteReferenceResponse contact,
		QuoteReferenceResponse opportunity,
		QuoteReferenceResponse priceBook,
		QuoteOwnerReferenceResponse owner,
		QuoteAmountsResponse amounts,
		QuoteCustomerSnapshotResponse customerSnapshot,
		List<QuoteLineResponse> lines,
		BigDecimal exchangeRateToTenantCurrency,
		LocalDate issueDate,
		LocalDate validUntil,
		String paymentTerms,
		String deliveryTerms,
		String customerReference,
		String notes,
		Instant approvedAt,
		UUID approvedBy,
		Instant sentAt,
		Instant acceptedAt,
		Instant rejectedAt,
		Instant cancelledAt,
		UUID relatedOrderId,
		List<QuoteAction> availableActions,
		Instant createdAt,
		UUID createdBy,
		Instant updatedAt,
		UUID updatedBy,
		long version
) {
}
