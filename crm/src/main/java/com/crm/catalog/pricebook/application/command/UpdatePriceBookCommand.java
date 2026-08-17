package com.crm.catalog.pricebook.application.command;

import java.time.LocalDate;

import com.crm.catalog.pricebook.domain.PriceBookId;

public record UpdatePriceBookCommand(
		PriceBookId id,
		long version,
		String name,
		String currencyCode,
		LocalDate validFrom,
		LocalDate validTo,
		Boolean isDefault,
		Boolean isActive
) {
}
