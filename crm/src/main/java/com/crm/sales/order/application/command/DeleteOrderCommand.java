package com.crm.sales.order.application.command;

import com.crm.sales.order.domain.OrderId;

public record DeleteOrderCommand(
		OrderId orderId,
		long expectedVersion) {
}
