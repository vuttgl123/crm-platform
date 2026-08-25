package com.crm.sales.order.presentation.web;

import java.time.Instant;
import java.util.UUID;
import com.crm.sales.order.domain.OrderStatus;

public record OrderStatusHistoryResponse(
		UUID id,
		UUID orderId,
		Instant changedAt,
		String changedBy,
		String action,
		OrderStatus fromStatus,
		OrderStatus toStatus,
		String notes
) {}
