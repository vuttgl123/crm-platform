package com.crm.sales.order.application.dto;

import java.math.BigDecimal;

public record OrderPulseCurrencyGroupDto(
		String currencyCode,
		long draftCount,
		long confirmedCount,
		BigDecimal processingTotal,
		long processingCount,
		BigDecimal partiallyFulfilledTotal,
		long partiallyFulfilledCount,
		BigDecimal fulfilledTotal,
		long fulfilledCount,
		long closedPartialCount,
		long cancelledCount
) {}
