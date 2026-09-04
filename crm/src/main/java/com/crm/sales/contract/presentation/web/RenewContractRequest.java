package com.crm.sales.contract.presentation.web;

import java.math.BigDecimal;
import java.time.LocalDate;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record RenewContractRequest(
		@NotBlank @Size(max = 64) String newContractNumber,
		LocalDate effectiveFrom,
		LocalDate effectiveTo,
		BigDecimal contractValue,
		Boolean autoRenew,
		@NotNull Long version
) {}
