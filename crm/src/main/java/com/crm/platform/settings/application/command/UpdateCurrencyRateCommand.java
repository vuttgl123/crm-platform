package com.crm.platform.settings.application.command;

import java.math.BigDecimal;

public record UpdateCurrencyRateCommand(
		String currencyCode,
		String currencyName,
		String symbol,
		BigDecimal exchangeRateToBase,
		String rateMode
) {}
