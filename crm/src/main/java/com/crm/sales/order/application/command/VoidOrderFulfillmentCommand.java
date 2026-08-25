package com.crm.sales.order.application.command;

import java.util.UUID;
import com.crm.sales.order.domain.OrderId;

public record VoidOrderFulfillmentCommand(
		OrderId orderId,
		UUID fulfillmentId,
		String reason,
		long expectedVersion
) {}
