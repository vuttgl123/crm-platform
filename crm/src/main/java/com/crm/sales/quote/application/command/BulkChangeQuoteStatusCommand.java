package com.crm.sales.quote.application.command;

import java.util.List;
import java.util.UUID;

import com.crm.sales.quote.domain.QuoteStatus;

public record BulkChangeQuoteStatusCommand(
		List<UUID> quoteIds,
		QuoteStatus status
) {}
