package com.crm.sales.quote.presentation.web;

import java.util.List;
import java.util.UUID;

import com.crm.sales.quote.domain.QuoteStatus;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

public record BulkChangeQuoteStatusRequest(
		@NotEmpty List<UUID> quoteIds,
		@NotNull QuoteStatus status
) {}
