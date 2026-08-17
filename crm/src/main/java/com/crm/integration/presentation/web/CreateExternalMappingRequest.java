package com.crm.integration.presentation.web;

import java.util.UUID;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record CreateExternalMappingRequest(
		@NotBlank(message = "Integration key must not be blank")
		@Pattern(regexp = "^[A-Za-z0-9_-]{2,100}$", message = "Integration key must be 2-100 alphanumeric characters, dashes or underscores")
		String integrationKey,

		@NotBlank(message = "Entity type must not be blank")
		@Pattern(regexp = "^[A-Za-z0-9_]{2,50}$", message = "Entity type must be 2-50 alphanumeric characters or underscores")
		String entityType,

		@NotNull(message = "Internal entity ID is required")
		UUID internalEntityId,

		@NotBlank(message = "External entity ID must not be blank")
		@Size(max = 255, message = "External entity ID must not exceed 255 characters")
		String externalEntityId,

		@Size(max = 100, message = "External version must not exceed 100 characters")
		String externalVersion,

		String metadata
) {
}
