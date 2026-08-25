package com.crm.sales.order.application.command;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import com.crm.sales.order.domain.OrderAddressSnapshot;
import com.crm.sales.order.domain.OrderId;

public record SaveOrderDraftCommand(
		OrderId orderId,
		UUID accountId,
		UUID contactId,
		UUID opportunityId,
		UUID priceBookId,
		String ownerType,
		UUID ownerId,
		OrderAddressSnapshot billingAddressSnapshot,
		OrderAddressSnapshot shippingAddressSnapshot,
		LocalDate orderDate,
		LocalDate requestedDeliveryDate,
		String customerReference,
		String paymentTerms,
		String deliveryTerms,
		String notes,
		BigDecimal shippingTotal,
		List<OrderLineInputCommand> lines,
		long expectedVersion
) {}
