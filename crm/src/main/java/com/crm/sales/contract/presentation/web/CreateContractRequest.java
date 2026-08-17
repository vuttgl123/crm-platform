package com.crm.sales.contract.presentation.web;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import com.crm.sales.contract.domain.ContractType;

public record CreateContractRequest(
		@NotBlank(message = "Contract number must not be blank")
		@Pattern(regexp = "^[A-Za-z0-9_-]{2,100}$", message = "Contract number must be 2-100 alphanumeric characters, dashes or underscores")
		String contractNumber,

		@NotNull(message = "Account ID is required")
		UUID accountId,

		UUID contactId,

		UUID opportunityId,

		UUID quoteId,

		UUID orderId,

		UUID ownerUserId,

		ContractType contractType,

		@Pattern(regexp = "^[A-Z]{3}$", message = "Currency code must be 3 uppercase letters (e.g. VND, USD)")
		String currencyCode,

		@PositiveOrZero(message = "Contract value must be positive or zero")
		BigDecimal contractValue,

		LocalDate effectiveFrom,

		LocalDate effectiveTo,

		Boolean autoRenew,

		@PositiveOrZero(message = "Renewal notice days must be positive or zero")
		Integer renewalNoticeDays,

		@Size(max = 500, message = "Document reference must not exceed 500 characters")
		String documentReference,

		String termsSnapshot
) {
}
