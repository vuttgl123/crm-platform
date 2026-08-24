package com.crm.sales.quote.presentation.web;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record SaveQuoteDraftRequest(
		@NotBlank @Size(max = 255) String name,
		@NotNull UUID accountId,
		UUID contactId,
		UUID opportunityId,
		@NotNull UUID priceBookId,
		QuoteOwnerInputRequest owner,
		@NotNull LocalDate issueDate,
		LocalDate validUntil,
		@Valid QuoteCustomerSnapshotRequest customerSnapshot,
		@Size(max = 255) String paymentTerms,
		@Size(max = 255) String deliveryTerms,
		@Size(max = 255) String customerReference,
		@Size(max = 4000) String internalNotes,
		BigDecimal shippingTotal,
		@Valid List<QuoteLineInputRequest> lines
) {
}
