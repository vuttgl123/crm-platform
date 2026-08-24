package com.crm.sales.quote.application.command;

public record AcceptQuoteCommand(
		String customerReference,
		long expectedVersion
) {
}
