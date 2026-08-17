package com.crm.catalog.pricebook.application.command;

import java.time.LocalDate;

public record CreatePriceBookCommand(
		String priceBookCode,
		String name,
		String currencyCode,
		LocalDate validFrom,
		LocalDate validTo,
		Boolean isDefault,
		Boolean isActive
) {
}
