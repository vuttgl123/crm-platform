package com.crm.catalog.product.presentation.web;

import java.util.UUID;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import com.crm.catalog.product.domain.ProductType;

public record ProductSearchRequest(
		String q,
		UUID categoryId,
		ProductType productType,
		Boolean isActive,

		@Min(value = 0, message = "Page index must not be negative")
		Integer page,

		@Min(value = 1, message = "Page size must be at least 1")
		@Max(value = 100, message = "Page size must not exceed 100")
		Integer size
) {
}
