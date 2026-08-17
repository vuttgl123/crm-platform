package com.crm.integration.importjob.presentation.web;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public record FailImportJobRequest(
		@NotNull(message = "Version is required")
		@Positive(message = "Version must be positive")
		Long version,

		@Size(max = 2048, message = "Error report reference must not exceed 2048 characters")
		String errorReportReference
) {
}
