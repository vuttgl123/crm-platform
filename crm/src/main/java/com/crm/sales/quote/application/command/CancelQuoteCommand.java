package com.crm.sales.quote.application.command;

public record CancelQuoteCommand(
		String reason,
		long expectedVersion
) {
}
