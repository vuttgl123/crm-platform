package com.crm.integration.importjob.presentation.web;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record StartImportJobRequest(
		@NotNull(message = "Version is required")
		@Positive(message = "Version must be positive")
		Long version
) {
}
