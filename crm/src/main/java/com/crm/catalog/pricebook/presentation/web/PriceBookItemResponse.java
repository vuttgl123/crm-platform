package com.crm.catalog.pricebook.presentation.web;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record PriceBookItemResponse(
		UUID id,
		UUID priceBookId,
		UUID productId,
		String productSku,
		String productName,
		BigDecimal unitPrice,
		int minimumQuantity,
		LocalDate validFrom,
		LocalDate validTo,
		UUID createdBy,
		Instant createdAt,
		UUID updatedBy,
		Instant updatedAt,
		long version
) {
}
