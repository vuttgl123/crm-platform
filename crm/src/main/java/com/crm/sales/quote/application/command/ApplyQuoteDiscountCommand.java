package com.crm.sales.quote.application.command;

import java.math.BigDecimal;

import com.crm.sales.quote.domain.QuoteId;

public record ApplyQuoteDiscountCommand(
		QuoteId id,
		BigDecimal discountPercentage,
		long expectedVersion
) {}
