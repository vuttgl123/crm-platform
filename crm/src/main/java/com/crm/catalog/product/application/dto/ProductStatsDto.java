package com.crm.catalog.product.application.dto;

public record ProductStatsDto(
		long totalProducts,
		long activeProducts,
		long inactiveProducts,
		long totalCategoriesCount
) {}
