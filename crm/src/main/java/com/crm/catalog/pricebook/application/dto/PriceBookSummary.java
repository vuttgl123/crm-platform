package com.crm.catalog.pricebook.application.dto;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record PriceBookSummary(
		UUID id,
		String priceBookCode,
		String name,
		String currencyCode,
		LocalDate validFrom,
		LocalDate validTo,
		boolean isDefault,
		boolean isActive,
		int itemsCount,
		Instant updatedAt,
		long version
) {
}
