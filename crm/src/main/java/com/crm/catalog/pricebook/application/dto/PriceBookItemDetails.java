package com.crm.catalog.pricebook.application.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record PriceBookItemDetails(
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
