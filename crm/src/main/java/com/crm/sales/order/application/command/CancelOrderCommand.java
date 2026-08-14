package com.crm.sales.order.application.command;

import com.crm.sales.order.domain.OrderId;

public record CancelOrderCommand(
		OrderId orderId,
		String reason,
		long expectedVersion) {
}
