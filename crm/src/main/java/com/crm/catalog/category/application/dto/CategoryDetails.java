package com.crm.catalog.category.application.dto;

import java.time.Instant;
import java.util.UUID;

import com.crm.catalog.category.domain.ProductCategory;

public record CategoryDetails(
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

	public static CategoryDetails from(ProductCategory category) {
		return new CategoryDetails(
				category.id().value(),
				category.categoryCode(),
				category.name(),
				category.parentCategoryId() != null ? category.parentCategoryId().value() : null,
				category.description(),
				category.isActive(),
				category.auditInfo().createdBy() != null ? category.auditInfo().createdBy().value() : null,
				category.auditInfo().createdAt(),
				category.auditInfo().updatedBy() != null ? category.auditInfo().updatedBy().value() : null,
				category.auditInfo().updatedAt(),
				category.version()
		);
	}

}
