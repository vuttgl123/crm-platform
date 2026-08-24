package com.crm.sales.quote.presentation.web;

import java.math.BigDecimal;
import java.util.UUID;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record QuoteLineInputRequest(
		UUID id,
		int position,
		@NotNull UUID productId,
		@NotNull UUID priceBookItemId,
		@NotNull @DecimalMin("0.000001") BigDecimal quantity,
		@NotNull @DecimalMin("0.0") BigDecimal salesUnitPrice,
		@DecimalMin("0.0") BigDecimal discountPercent,
		@DecimalMin("0.0") BigDecimal taxPercent,
		@Size(max = 1000) String description
) {
}
