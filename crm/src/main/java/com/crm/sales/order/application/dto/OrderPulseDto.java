package com.crm.sales.order.application.dto;

import java.util.List;

public record OrderPulseDto(
		long totalOrders,
		long activeProcessingCount,
		long pendingFulfillmentCount,
		long completedCount,
		List<OrderPulseCurrencyGroupDto> currencyGroups
) {}
