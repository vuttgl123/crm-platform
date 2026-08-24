package com.crm.sales.quote.application.command;

public record ConvertQuoteToOrderCommand(
		long expectedVersion
) {
}
