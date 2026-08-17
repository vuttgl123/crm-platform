package com.crm.integration.importjob.presentation.web;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

public record CompleteImportJobRequest(
		@NotNull(message = "Version is required")
		@Positive(message = "Version must be positive")
		Long version,

		@PositiveOrZero(message = "Processed rows must be positive or zero")
		long processedRows,

		@PositiveOrZero(message = "Success rows must be positive or zero")
		long successRows,

		@PositiveOrZero(message = "Error rows must be positive or zero")
		long errorRows,

		@Size(max = 2048, message = "Error report reference must not exceed 2048 characters")
		String errorReportReference
) {
}
