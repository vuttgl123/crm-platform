package com.crm.catalog.category.application.command;

import java.util.UUID;

import com.crm.catalog.category.domain.CategoryId;

public record UpdateCategoryCommand(
		CategoryId id,
		long version,
		String name,
		UUID parentCategoryId,
		String description,
		Boolean isActive
) {
}
