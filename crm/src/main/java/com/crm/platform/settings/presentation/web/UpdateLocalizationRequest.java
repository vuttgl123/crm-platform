package com.crm.platform.settings.presentation.web;

import java.util.List;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdateLocalizationRequest(
		@NotBlank @Size(max = 10) String defaultCurrency,
		List<String> supportedCurrencies,
		@NotBlank @Size(max = 100) String defaultTimezone,
		@NotBlank @Size(max = 50) String dateFormat,
		@NotBlank @Size(max = 20) String timeFormat,
		@NotBlank @Size(max = 5) String decimalSeparator,
		@NotBlank @Size(max = 5) String thousandsSeparator,
		@Min(1) @Max(12) int fiscalYearStartMonth
) {}
