package com.crm.platform.settings.application.dto;

import java.util.List;

public record LocalizationSettingsDto(
		String defaultCurrency,
		List<String> supportedCurrencies,
		String defaultTimezone,
		String dateFormat,
		String timeFormat,
		String decimalSeparator,
		String thousandsSeparator,
		int fiscalYearStartMonth
) {}
