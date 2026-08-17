package com.crm.sales.contract.presentation.web;

import java.time.LocalDate;
import java.util.UUID;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import com.crm.sales.contract.domain.ContractStatus;
import com.crm.sales.contract.domain.ContractType;

public record ContractSearchRequest(
		String q,
		UUID accountId,
		ContractStatus status,
		ContractType contractType,
		LocalDate effectiveFrom,
		LocalDate effectiveTo,

		@Min(value = 0, message = "Page index must not be negative")
		Integer page,

		@Min(value = 1, message = "Page size must be at least 1")
		@Max(value = 100, message = "Page size must not exceed 100")
		Integer size
) {
}
