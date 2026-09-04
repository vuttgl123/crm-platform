package com.crm.platform.settings.application.dto;

import java.math.BigDecimal;
import java.time.Instant;

public record CurrencyRateDto(
		String currencyCode,
		String currencyName,
		String symbol,
		BigDecimal exchangeRateToBase,
		String rateMode, // MANUAL, AUTO_SYNC
		Instant lastSyncedAt
) {}
