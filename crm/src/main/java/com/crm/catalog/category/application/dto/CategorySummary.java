package com.crm.catalog.category.application.dto;

import java.time.Instant;
import java.util.UUID;

public record CategorySummary(
		UUID id,
		String categoryCode,
		String name,
		UUID parentCategoryId,
		String description,
		boolean isActive,
		int productsCount,
		Instant updatedAt,
		long version
) {
}
