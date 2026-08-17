package com.crm.catalog.pricebook.presentation.web;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record PriceBookResponse(
		UUID id,
		String priceBookCode,
		String name,
		String currencyCode,
		LocalDate validFrom,
		LocalDate validTo,
		boolean isDefault,
		boolean isActive,
		List<PriceBookItemResponse> items,
		UUID createdBy,
		Instant createdAt,
		UUID updatedBy,
		Instant updatedAt,
		long version
) {
}
