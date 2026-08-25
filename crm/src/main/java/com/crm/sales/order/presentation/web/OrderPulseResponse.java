package com.crm.sales.order.presentation.web;

import java.util.List;
import com.crm.sales.order.application.dto.OrderPulseCurrencyGroupDto;

public record OrderPulseResponse(
		long totalOrders,
		long activeProcessingCount,
		long pendingFulfillmentCount,
		long completedCount,
		List<OrderPulseCurrencyGroupDto> currencyGroups
) {}
