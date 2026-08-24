package com.crm.sales.quote.application.command;

import java.time.LocalDate;
import java.util.UUID;

public record CreateQuoteCommand(
		String name,
		UUID accountId,
		UUID contactId,
		UUID opportunityId,
		UUID priceBookId,
		String ownerType,
		UUID ownerId,
		LocalDate issueDate,
		LocalDate validUntil
) {
}
