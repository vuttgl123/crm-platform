package com.crm.sales.order.presentation.web;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

import com.crm.sales.order.domain.OrderStatus;

public record OrderResponse(
		UUID id,
		String orderNumber,
		UUID accountId,
		UUID contactId,
		UUID opportunityId,
		UUID quoteId,
		UUID ownerUserId,
		OrderStatus status,
		Amounts amounts,
		LocalDate orderDate,
		LocalDate requestedDeliveryDate,
		String customerReference,
		Instant confirmedAt,
		Instant fulfilledAt,
		Instant cancelledAt,
		String cancellationReason,
		Instant createdAt,
		UUID createdBy,
		Instant updatedAt,
		UUID updatedBy,
		long version) {

	public record Amounts(
			String currencyCode,
			BigDecimal subtotal,
			BigDecimal discountTotal,
			BigDecimal taxTotal,
			BigDecimal shippingTotal,
			BigDecimal grandTotal) {
	}

}
