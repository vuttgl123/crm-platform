package com.crm.sales.quote.application.command;

import com.crm.sales.quote.domain.QuoteId;

public record DuplicateQuoteCommand(
		QuoteId sourceQuoteId
) {}
