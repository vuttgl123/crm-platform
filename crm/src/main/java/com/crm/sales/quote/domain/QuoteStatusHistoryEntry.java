package com.crm.sales.quote.domain;

import java.time.Instant;
import java.util.UUID;

import com.crm.sharedkernel.domain.ActorId;
import com.crm.sharedkernel.domain.TenantId;

public record QuoteStatusHistoryEntry(
		UUID id,
		TenantId tenantId,
		QuoteId quoteId,
		int quoteRevisionNumber,
		String action,
		QuoteStatus previousStoredStatus,
		QuoteStatus newStoredStatus,
		ActorId actorId,
		String reason,
		long quoteVersionBefore,
		long quoteVersionAfter,
		Instant occurredAt
) {
}
