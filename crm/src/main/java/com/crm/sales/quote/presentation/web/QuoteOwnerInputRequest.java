package com.crm.sales.quote.presentation.web;

import java.util.UUID;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record QuoteOwnerInputRequest(
		@NotBlank String type,
		@NotNull UUID id
) {
}
