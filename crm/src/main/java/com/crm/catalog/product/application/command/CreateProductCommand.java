package com.crm.catalog.product.application.command;

import java.math.BigDecimal;
import java.util.UUID;

import com.crm.catalog.product.domain.ProductType;

public record CreateProductCommand(
		String sku,
		String name,
		String description,
		UUID categoryId,
		ProductType productType,
		String unitOfMeasure,
		String taxCategory,
		BigDecimal standardCost,
		String costCurrencyCode,
		Boolean isActive,
		String metadata
) {
}
