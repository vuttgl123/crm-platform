package com.crm.sales.order.presentation.web;

import java.math.BigDecimal;
import java.util.UUID;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record OrderLineInputRequest(
		UUID id,
		int lineNumber,
		UUID productId,
		UUID quoteItemId,
		String skuSnapshot,
		@NotBlank String nameSnapshot,
		String descriptionSnapshot,
		String unitOfMeasureSnapshot,
		@NotNull @DecimalMin("0.000001") BigDecimal quantity,
		@NotNull @DecimalMin("0.0") BigDecimal unitPrice,
		BigDecimal discountPercent,
		BigDecimal discountAmount,
		BigDecimal taxPercent,
		BigDecimal taxAmount
) {}
