package com.crm.catalog.product.presentation.web;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

import com.crm.catalog.product.domain.ProductType;

public record ProductSummaryResponse(
		UUID id,
		String sku,
		String name,
		UUID categoryId,
		String categoryName,
		ProductType productType,
		String unitOfMeasure,
		BigDecimal standardCost,
		String costCurrencyCode,
		boolean isActive,
		Instant updatedAt,
		long version
) {
}
