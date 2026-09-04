package com.crm.platform.settings.presentation.web;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record AddCurrencyRequest(
		@NotBlank @Size(max = 10) String currencyCode,
		@NotBlank @Size(max = 100) String currencyName,
		@NotBlank @Size(max = 10) String symbol,
		@NotNull @DecimalMin("0.000001") BigDecimal exchangeRateToBase,
		@Size(max = 20) String rateMode
) {}
