package com.crm.sales.order.application.command;

import com.crm.sales.order.domain.OrderId;

public record ConfirmOrderCommand(
		OrderId orderId,
		long expectedVersion) {
}
