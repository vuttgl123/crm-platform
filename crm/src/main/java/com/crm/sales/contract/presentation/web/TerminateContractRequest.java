package com.crm.sales.contract.presentation.web;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public record TerminateContractRequest(
		@NotNull(message = "Version is required")
		@Positive(message = "Version must be positive")
		Long version,

		@NotBlank(message = "Termination reason is required")
		@Size(max = 2000, message = "Termination reason must not exceed 2000 characters")
		String terminationReason
) {
}
