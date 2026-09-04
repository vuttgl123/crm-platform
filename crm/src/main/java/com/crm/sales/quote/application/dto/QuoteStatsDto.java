package com.crm.sales.quote.application.dto;

import java.math.BigDecimal;

public record QuoteStatsDto(
		long totalQuotes,
		long draftQuotes,
		long pendingApprovalQuotes,
		long approvedQuotes,
		long sentQuotes,
		long acceptedQuotes,
		long rejectedQuotes,
		BigDecimal totalPipelineValue
) {}
