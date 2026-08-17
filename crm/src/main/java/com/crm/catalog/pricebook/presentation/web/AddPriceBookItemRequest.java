package com.crm.catalog.pricebook.presentation.web;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;

public record AddPriceBookItemRequest(
		@NotNull(message = "Product ID is required")
		UUID productId,

		@NotNull(message = "Unit price is required")
		@PositiveOrZero(message = "Unit price must be positive or zero")
		BigDecimal unitPrice,

		@Positive(message = "Minimum quantity must be at least 1")
		Integer minimumQuantity,

		LocalDate validFrom,

		LocalDate validTo
) {
}
