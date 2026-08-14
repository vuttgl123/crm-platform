package com.crm.sales.quote.application.command;

import com.crm.sales.quote.domain.QuoteId;

public record ApproveQuoteCommand(
		QuoteId quoteId,
		long expectedVersion) {
}
