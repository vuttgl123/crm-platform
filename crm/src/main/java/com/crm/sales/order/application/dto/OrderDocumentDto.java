package com.crm.sales.order.application.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import com.crm.sales.order.domain.OrderAddressSnapshot;
import com.crm.sales.order.domain.OrderAmounts;
import com.crm.sales.order.domain.OrderId;
import com.crm.sales.order.domain.OrderStatus;

public record OrderDocumentDto(
		OrderId id,
		String orderNumber,
		OrderStatus status,
		OrderReferenceDto account,
		OrderReferenceDto contact,
		OrderReferenceDto opportunity,
		OrderReferenceDto quote,
		OrderOwnerReferenceDto owner,
		OrderAmounts amounts,
		OrderAddressSnapshot billingAddressSnapshot,
		OrderAddressSnapshot shippingAddressSnapshot,
		List<OrderLineDetails> lines,
		BigDecimal progressPercent,
		LocalDate orderDate,
		LocalDate requestedDeliveryDate,
		String customerReference,
		String paymentTerms,
		String deliveryTerms,
		String notes,
		Instant confirmedAt,
		Instant fulfilledAt,
		Instant createdAt
) {}
