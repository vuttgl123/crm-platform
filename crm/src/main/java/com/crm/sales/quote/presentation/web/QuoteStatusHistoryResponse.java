package com.crm.sales.quote.presentation.web;

import java.time.Instant;
import java.util.UUID;

import com.crm.sales.quote.domain.QuoteStatus;

public record QuoteStatusHistoryResponse(
		UUID id,
		UUID quoteId,
		int quoteRevisionNumber,
		String action,
		QuoteStatus previousStoredStatus,
		QuoteStatus newStoredStatus,
		UUID actorId,
		String reason,
		long quoteVersionBefore,
		long quoteVersionAfter,
		Instant occurredAt
) {
}
