package com.crm.platform.settings.application.command;

import java.util.List;

public record UpdateLocalizationCommand(
		String defaultCurrency,
		List<String> supportedCurrencies,
		String defaultTimezone,
		String dateFormat,
		String timeFormat,
		String decimalSeparator,
		String thousandsSeparator,
		int fiscalYearStartMonth
) {}
