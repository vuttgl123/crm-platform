package com.crm.sales.quote.application.command;

import java.time.LocalDate;
import java.util.UUID;

import com.crm.sales.quote.domain.QuoteAmounts;

public record CreateQuoteCommand(
		String quoteNumber,
		UUID accountId,
		UUID contactId,
		UUID opportunityId,
		UUID priceBookId,
		UUID ownerUserId,
		QuoteAmounts amounts,
		LocalDate issueDate,
		LocalDate validUntil,
		String paymentTerms,
		String deliveryTerms,
		String customerReference,
		String notes) {
}
