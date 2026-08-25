package com.crm.sales.order.application.command;

import com.crm.sales.order.domain.OrderId;

public record StartOrderProcessingCommand(
		OrderId orderId,
		long expectedVersion
) {}
