package com.crm.catalog.pricebook.application.dto;

public record PriceBookStatsDto(
		long totalPriceBooks,
		long activePriceBooks,
		long standardPriceBooks,
		long customPriceBooks,
		long totalPricedItemsCount
) {}
