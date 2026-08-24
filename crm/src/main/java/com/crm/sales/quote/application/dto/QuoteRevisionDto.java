package com.crm.sales.quote.application.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

import com.crm.sales.quote.domain.QuoteStatus;

public record QuoteRevisionDto(
		UUID id,
		String quoteNumber,
		int revisionNumber,
		QuoteStatus status,
		QuoteStatus effectiveStatus,
		BigDecimal grandTotal,
		String currencyCode,
		Instant createdAt,
		UUID createdBy,
		boolean isCurrent
) {
}
