package com.crm.catalog.category.presentation.web;

import java.time.Instant;
import java.util.UUID;

public record CategorySummaryResponse(
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
