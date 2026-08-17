package com.crm.service.category.presentation.web;

import java.util.UUID;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record CreateTicketCategoryRequest(
		@NotBlank(message = "Category code must not be blank")
		@Pattern(regexp = "^[A-Za-z0-9_-]{2,50}$", message = "Category code must be 2-50 alphanumeric characters, dashes or underscores")
		String categoryCode,

		@NotBlank(message = "Category name must not be blank")
		@Size(max = 255, message = "Category name must not exceed 255 characters")
		String name,

		UUID parentCategoryId,

		UUID defaultTeamId,

		@Size(max = 2000, message = "Description must not exceed 2000 characters")
		String description,

		Boolean isActive
) {
}
