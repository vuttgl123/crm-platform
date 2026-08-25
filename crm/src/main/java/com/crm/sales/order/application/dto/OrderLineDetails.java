package com.crm.sales.order.application.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record OrderLineDetails(
		UUID id,
		int lineNumber,
		UUID productId,
		UUID quoteItemId,
		String skuSnapshot,
		String nameSnapshot,
		String descriptionSnapshot,
		String unitOfMeasureSnapshot,
		BigDecimal quantity,
		BigDecimal fulfilledQuantity,
		BigDecimal remainingQuantity,
		BigDecimal unitPrice,
		BigDecimal discountPercent,
		BigDecimal discountAmount,
		BigDecimal taxPercent,
		BigDecimal taxAmount,
		BigDecimal lineTotal
) {}
