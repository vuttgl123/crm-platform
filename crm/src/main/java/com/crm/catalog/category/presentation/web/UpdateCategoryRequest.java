package com.crm.catalog.category.presentation.web;

import java.util.UUID;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public record UpdateCategoryRequest(
		@NotNull(message = "Version is required")
		@Positive(message = "Version must be positive")
		Long version,

		@NotBlank(message = "Category name must not be blank")
		@Size(max = 255, message = "Category name must not exceed 255 characters")
		String name,

		UUID parentCategoryId,

		@Size(max = 2000, message = "Description must not exceed 2000 characters")
		String description,

		Boolean isActive
) {
}
