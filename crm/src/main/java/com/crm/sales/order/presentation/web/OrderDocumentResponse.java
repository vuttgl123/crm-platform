package com.crm.sales.order.presentation.web;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import com.crm.sales.order.domain.OrderStatus;

public record OrderDocumentResponse(
		UUID id,
		String orderNumber,
		OrderStatus status,
		OrderReferenceResponse account,
		OrderReferenceResponse contact,
		OrderReferenceResponse opportunity,
		OrderReferenceResponse quote,
		OrderOwnerReferenceResponse owner,
		OrderAmountsResponse amounts,
		OrderAddressSnapshotResponse billingAddressSnapshot,
		OrderAddressSnapshotResponse shippingAddressSnapshot,
		List<OrderLineResponse> lines,
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
