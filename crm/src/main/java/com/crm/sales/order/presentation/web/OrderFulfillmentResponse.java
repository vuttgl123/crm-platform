package com.crm.sales.order.presentation.web;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import com.crm.sales.order.domain.OrderFulfillmentStatus;

public record OrderFulfillmentResponse(
		UUID id,
		String eventNumber,
		String referenceNumber,
		LocalDate fulfillmentDate,
		String note,
		OrderFulfillmentStatus status,
		Instant occurredAt,
		String recordedBy,
		Instant voidedAt,
		String voidedBy,
		String voidReason,
		List<OrderFulfillmentLineResponse> lines,
		long version
) {}
