package com.crm.customer.tag.presentation.web;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public record UpdateTagRequest(
		@NotNull(message = "Version is required")
		@Positive(message = "Version must be positive")
		Long version,

		@NotBlank(message = "Tag name must not be blank")
		@Size(max = 100, message = "Tag name must not exceed 100 characters")
		String name,

		@Size(max = 500, message = "Description must not exceed 500 characters")
		String description,

		@Pattern(regexp = "^#[0-9A-Fa-f]{6}$", message = "Color hex must be a valid 6-digit hex code e.g. #FF5733")
		String colorHex,

		boolean active
) {
}
