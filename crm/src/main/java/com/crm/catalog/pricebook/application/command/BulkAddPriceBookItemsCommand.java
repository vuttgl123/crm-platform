package com.crm.catalog.pricebook.application.command;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import com.crm.catalog.pricebook.domain.PriceBookId;

public record BulkAddPriceBookItemsCommand(
		PriceBookId priceBookId,
		List<ItemEntry> items
) {
	public record ItemEntry(
			UUID productId,
			BigDecimal unitPrice,
			Integer minimumQuantity
	) {}
}
