package com.crm.integration.importjob.presentation.web;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;

public record UpdateImportProgressRequest(
		@NotNull(message = "Version is required")
		@Positive(message = "Version must be positive")
		Long version,

		@PositiveOrZero(message = "Processed rows must be positive or zero")
		long processedRows,

		@PositiveOrZero(message = "Success rows must be positive or zero")
		long successRows,

		@PositiveOrZero(message = "Error rows must be positive or zero")
		long errorRows
) {
}
