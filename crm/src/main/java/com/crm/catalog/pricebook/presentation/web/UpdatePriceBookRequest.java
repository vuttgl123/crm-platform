package com.crm.catalog.pricebook.presentation.web;

import java.time.LocalDate;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public record UpdatePriceBookRequest(
		@NotNull(message = "Version is required")
		@Positive(message = "Version must be positive")
		Long version,

		@NotBlank(message = "Price book name must not be blank")
		@Size(max = 255, message = "Price book name must not exceed 255 characters")
		String name,

		@NotBlank(message = "Currency code is required")
		@Pattern(regexp = "^[A-Z]{3}$", message = "Currency code must be 3 uppercase letters (e.g. VND, USD)")
		String currencyCode,

		LocalDate validFrom,

		LocalDate validTo,

		Boolean isDefault,

		Boolean isActive
) {
}
