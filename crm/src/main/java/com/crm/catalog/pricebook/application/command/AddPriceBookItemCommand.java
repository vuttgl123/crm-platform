package com.crm.catalog.pricebook.application.command;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

import com.crm.catalog.pricebook.domain.PriceBookId;

public record AddPriceBookItemCommand(
		PriceBookId priceBookId,
		UUID productId,
		BigDecimal unitPrice,
		Integer minimumQuantity,
		LocalDate validFrom,
		LocalDate validTo
) {
}
