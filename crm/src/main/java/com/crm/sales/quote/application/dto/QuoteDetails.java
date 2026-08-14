package com.crm.sales.quote.application.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

import com.crm.sales.quote.domain.QuoteAmounts;
import com.crm.sales.quote.domain.QuoteId;
import com.crm.sales.quote.domain.QuoteStatus;
import com.crm.sharedkernel.domain.ActorId;
import com.crm.sharedkernel.domain.TenantId;

public record QuoteDetails(
		TenantId tenantId,
		QuoteId id,
		String quoteNumber,
		int revisionNumber,
		UUID previousQuoteId,
		UUID accountId,
		UUID contactId,
		UUID opportunityId,
		UUID priceBookId,
		UUID ownerUserId,
		QuoteStatus status,
		QuoteAmounts amounts,
		BigDecimal exchangeRateToTenantCurrency,
		LocalDate issueDate,
		LocalDate validUntil,
		String paymentTerms,
		String deliveryTerms,
		String customerReference,
		String notes,
		Instant approvedAt,
		ActorId approvedBy,
		Instant acceptedAt,
		Instant rejectedAt,
		Instant createdAt,
		ActorId createdBy,
		Instant updatedAt,
		ActorId updatedBy,
		long version) {
}
