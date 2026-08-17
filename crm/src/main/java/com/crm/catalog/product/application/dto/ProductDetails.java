package com.crm.catalog.product.application.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

import com.crm.catalog.product.domain.Product;
import com.crm.catalog.product.domain.ProductType;

public record ProductDetails(
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

	public static ProductDetails from(Product product) {
		return new ProductDetails(
				product.id().value(),
				product.sku(),
				product.name(),
				product.description(),
				product.categoryId() != null ? product.categoryId().value() : null,
				product.productType(),
				product.unitOfMeasure(),
				product.taxCategory(),
				product.standardCost(),
				product.costCurrencyCode(),
				product.isActive(),
				product.metadata(),
				product.auditInfo().createdBy() != null ? product.auditInfo().createdBy().value() : null,
				product.auditInfo().createdAt(),
				product.auditInfo().updatedBy() != null ? product.auditInfo().updatedBy().value() : null,
				product.auditInfo().updatedAt(),
				product.version()
		);
	}

}
