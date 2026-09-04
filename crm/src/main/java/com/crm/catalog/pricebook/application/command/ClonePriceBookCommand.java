package com.crm.catalog.pricebook.application.command;

import java.math.BigDecimal;

import com.crm.catalog.pricebook.domain.PriceBookId;

public record ClonePriceBookCommand(
		PriceBookId sourceId,
		String newName,
		String newCode,
		BigDecimal adjustmentPercentage
) {}
