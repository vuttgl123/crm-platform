package com.crm.sales.quote.presentation.web;

import java.math.BigDecimal;
import java.util.UUID;

public record QuoteLineResponse(
		UUID id,
		int position,
		UUID productId,
		UUID priceBookItemId,
		String sku,
		String productName,
		String unit,
		String description,
		BigDecimal quantity,
		BigDecimal listUnitPrice,
		BigDecimal salesUnitPrice,
		BigDecimal discountPercent,
		BigDecimal taxPercent,
		BigDecimal lineSubtotal,
		BigDecimal lineDiscount,
		BigDecimal lineTax,
		BigDecimal lineTotal
) {
}
