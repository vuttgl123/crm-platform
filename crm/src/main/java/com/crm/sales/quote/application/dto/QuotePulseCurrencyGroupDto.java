package com.crm.sales.quote.application.dto;

import java.math.BigDecimal;

public record QuotePulseCurrencyGroupDto(
		String currencyCode,
		long draftCount,
		long pendingApprovalCount,
		BigDecimal sentAmount,
		long sentCount,
		BigDecimal acceptedAmount,
		long acceptedCount,
		BigDecimal expiringSoonAmount,
		long expiringSoonCount
) {
}
