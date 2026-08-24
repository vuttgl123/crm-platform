package com.crm.sales.quote.application.command;

public record RequestQuoteChangesCommand(
		String reason,
		long expectedVersion
) {
}
