package com.crm.sales.quote.application.command;

import java.math.BigDecimal;
import java.util.UUID;

public record QuoteLineInputCommand(
		UUID id,
		int position,
		UUID productId,
		UUID priceBookItemId,
		BigDecimal quantity,
		BigDecimal salesUnitPrice,
		BigDecimal discountPercent,
		BigDecimal taxPercent,
		String description
) {
}
