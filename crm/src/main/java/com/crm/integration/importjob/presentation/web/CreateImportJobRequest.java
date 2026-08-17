package com.crm.integration.importjob.presentation.web;

import java.util.Map;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import com.crm.integration.importjob.domain.SourceType;

public record CreateImportJobRequest(
		@NotBlank(message = "Job type must not be blank")
		@Size(max = 100, message = "Job type must not exceed 100 characters")
		String jobType,

		@NotNull(message = "Source type is required")
		SourceType sourceType,

		@Size(max = 2048, message = "Source reference must not exceed 2048 characters")
		String sourceReference,

		@NotBlank(message = "Target entity type must not be blank")
		@Size(max = 100, message = "Target entity type must not exceed 100 characters")
		String targetEntityType,

		@PositiveOrZero(message = "Total rows must be positive or zero")
		Long totalRows,

		Map<String, Object> mappingConfig
) {
}
