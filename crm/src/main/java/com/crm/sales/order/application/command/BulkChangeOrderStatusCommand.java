package com.crm.sales.order.application.command;

import java.util.List;
import java.util.UUID;
import com.crm.sales.order.domain.OrderStatus;

public record BulkChangeOrderStatusCommand(
		List<UUID> orderIds,
		OrderStatus status,
		String reason
) {}
