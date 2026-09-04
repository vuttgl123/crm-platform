package com.crm.catalog.pricebook.presentation.web;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record BulkAddPriceBookItemsRequest(
		@NotEmpty List<@Valid ItemEntryRequest> items
) {
	public record ItemEntryRequest(
			@NotNull UUID productId,
			@NotNull @Positive BigDecimal unitPrice,
			Integer minimumQuantity
	) {}
}
