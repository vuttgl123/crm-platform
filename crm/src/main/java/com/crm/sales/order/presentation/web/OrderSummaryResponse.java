package com.crm.sales.order.presentation.web;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

import com.crm.sales.order.domain.OrderStatus;

public record OrderSummaryResponse(
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
		Instant updatedAt,
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
