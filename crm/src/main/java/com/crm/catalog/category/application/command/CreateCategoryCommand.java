package com.crm.catalog.category.application.command;

import java.util.UUID;

public record CreateCategoryCommand(
		String categoryCode,
		String name,
		UUID parentCategoryId,
		String description,
		Boolean isActive
) {
}
