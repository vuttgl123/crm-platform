package com.crm.sales.quote.application.command;

public record RejectQuoteCommand(
		String reason,
		long expectedVersion
) {
}
