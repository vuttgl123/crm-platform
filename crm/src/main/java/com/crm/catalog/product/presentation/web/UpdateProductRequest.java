package com.crm.catalog.product.presentation.web;

import java.math.BigDecimal;
import java.util.UUID;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import com.crm.catalog.product.domain.ProductType;

public record UpdateProductRequest(
		@NotNull(message = "Version is required")
		@Positive(message = "Version must be positive")
		Long version,

		@NotBlank(message = "Product name must not be blank")
		@Size(max = 255, message = "Product name must not exceed 255 characters")
		String name,

		@Size(max = 4000, message = "Description must not exceed 4000 characters")
		String description,

		UUID categoryId,

		ProductType productType,

		@Size(max = 50, message = "Unit of measure must not exceed 50 characters")
		String unitOfMeasure,

		@Size(max = 50, message = "Tax category must not exceed 50 characters")
		String taxCategory,

		@PositiveOrZero(message = "Standard cost must be positive or zero")
		BigDecimal standardCost,

		@Pattern(regexp = "^[A-Z]{3}$", message = "Cost currency code must be 3 uppercase letters (e.g. VND, USD)")
		String costCurrencyCode,

		Boolean isActive,

		String metadata
) {
}
