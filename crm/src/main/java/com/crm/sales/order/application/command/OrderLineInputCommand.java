package com.crm.sales.order.application.command;

import java.math.BigDecimal;
import java.util.UUID;

public record OrderLineInputCommand(
		UUID id,
		int lineNumber,
		UUID productId,
		UUID quoteItemId,
		String skuSnapshot,
		String nameSnapshot,
		String descriptionSnapshot,
		String unitOfMeasureSnapshot,
		BigDecimal quantity,
		BigDecimal unitPrice,
		BigDecimal discountPercent,
		BigDecimal discountAmount,
		BigDecimal taxPercent,
		BigDecimal taxAmount
) {}
