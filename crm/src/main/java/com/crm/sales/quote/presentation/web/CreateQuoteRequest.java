package com.crm.sales.quote.presentation.web;

import java.time.LocalDate;
import java.util.UUID;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateQuoteRequest(
		@NotBlank @Size(max = 255) String name,
		@NotNull UUID accountId,
		UUID contactId,
		UUID opportunityId,
		@NotNull UUID priceBookId,
		QuoteOwnerInputRequest owner,
		@NotNull LocalDate issueDate,
		LocalDate validUntil
) {
}
