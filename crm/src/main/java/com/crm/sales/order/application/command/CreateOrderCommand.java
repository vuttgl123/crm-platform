package com.crm.sales.order.application.command;

import java.time.LocalDate;
import java.util.UUID;

import com.crm.sales.order.domain.OrderAmounts;

public record CreateOrderCommand(
		String orderNumber,
		UUID accountId,
		UUID contactId,
		UUID opportunityId,
		UUID quoteId,
		UUID ownerUserId,
		OrderAmounts amounts,
		LocalDate orderDate,
		LocalDate requestedDeliveryDate,
		String customerReference) {
}
