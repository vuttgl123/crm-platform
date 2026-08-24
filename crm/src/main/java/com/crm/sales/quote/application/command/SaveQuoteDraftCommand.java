package com.crm.sales.quote.application.command;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import com.crm.sales.quote.domain.QuoteCustomerSnapshot;

public record SaveQuoteDraftCommand(
		String name,
		UUID accountId,
		UUID contactId,
		UUID opportunityId,
		UUID priceBookId,
		String ownerType,
		UUID ownerId,
		LocalDate issueDate,
		LocalDate validUntil,
		QuoteCustomerSnapshot customerSnapshot,
		String paymentTerms,
		String deliveryTerms,
		String customerReference,
		String internalNotes,
		BigDecimal shippingTotal,
		List<QuoteLineInputCommand> lines,
		long expectedVersion
) {
}
