package com.crm.sales.order.application.dto;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import com.crm.sales.order.domain.OrderFulfillmentStatus;
import com.crm.sharedkernel.domain.ActorId;

public record OrderFulfillmentDto(
		UUID id,
		String eventNumber,
		String referenceNumber,
		LocalDate fulfillmentDate,
		String note,
		OrderFulfillmentStatus status,
		Instant occurredAt,
		ActorId recordedBy,
		Instant voidedAt,
		ActorId voidedBy,
		String voidReason,
		List<OrderFulfillmentLineDto> lines,
		long version
) {}
