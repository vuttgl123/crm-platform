package com.crm.sales.quote.presentation.web;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public record QuotePulseResponse(
		String revisionScope,
		Instant asOf,
		String tenantTimezone,
		List<CurrencyGroup> currencyGroups
) {
	public record CurrencyGroup(
			String currencyCode,
			long draftCount,
			long pendingApprovalCount,
			BigDecimal sentAmount,
			long sentCount,
			BigDecimal acceptedAmount,
			long acceptedCount,
			BigDecimal expiringSoonAmount,
			long expiringSoonCount
	) {}
}
