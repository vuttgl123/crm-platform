package com.crm.sales.order.application.dto;

import java.math.BigDecimal;

public record OrderStatsDto(
		long totalOrders,
		long draftOrders,
		long confirmedOrders,
		long inFulfillmentOrders,
		long completedOrders,
		long cancelledOrders,
		BigDecimal fulfilledAmount,
		BigDecimal totalPipelineAmount
) {}
