package com.crm.catalog.product.presentation.web;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

import com.crm.catalog.product.domain.ProductType;

public record ProductResponse(
		UUID id,
		String sku,
		String name,
		String description,
		UUID categoryId,
		ProductType productType,
		String unitOfMeasure,
		String taxCategory,
		BigDecimal standardCost,
		String costCurrencyCode,
		boolean isActive,
		String metadata,
		UUID createdBy,
		Instant createdAt,
		UUID updatedBy,
		Instant updatedAt,
		long version
) {
}
