package com.crm.sales.quote.application.command;

import java.time.LocalDate;
import java.util.UUID;

import com.crm.sales.quote.domain.QuoteAmounts;
import com.crm.sales.quote.domain.QuoteId;
import com.crm.sales.quote.domain.QuoteStatus;

public record UpdateQuoteCommand(
		QuoteId quoteId,
		UUID accountId,
		UUID contactId,
		UUID opportunityId,
		UUID priceBookId,
		UUID ownerUserId,
		QuoteStatus status,
		QuoteAmounts amounts,
		LocalDate issueDate,
		LocalDate validUntil,
		String paymentTerms,
		String deliveryTerms,
		String customerReference,
		String notes,
		long expectedVersion) {
}
