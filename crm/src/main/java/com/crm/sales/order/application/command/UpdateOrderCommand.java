package com.crm.sales.order.application.command;

import java.time.LocalDate;
import java.util.UUID;

import com.crm.sales.order.domain.OrderAmounts;
import com.crm.sales.order.domain.OrderId;
import com.crm.sales.order.domain.OrderStatus;

public record UpdateOrderCommand(
		OrderId orderId,
		UUID accountId,
		UUID contactId,
		UUID opportunityId,
		UUID quoteId,
		UUID ownerUserId,
		OrderStatus status,
		OrderAmounts amounts,
		LocalDate orderDate,
		LocalDate requestedDeliveryDate,
		String customerReference,
		long expectedVersion) {
}
