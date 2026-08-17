package com.crm.catalog.category.presentation.web;

import java.time.Instant;
import java.util.UUID;

public record CategoryResponse(
		UUID id,
		String categoryCode,
		String name,
		UUID parentCategoryId,
		String description,
		boolean isActive,
		UUID createdBy,
		Instant createdAt,
		UUID updatedBy,
		Instant updatedAt,
		long version
) {
}
