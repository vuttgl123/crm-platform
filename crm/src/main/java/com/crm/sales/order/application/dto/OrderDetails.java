package com.crm.sales.order.application.dto;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

import com.crm.sales.order.domain.OrderAmounts;
import com.crm.sales.order.domain.OrderId;
import com.crm.sales.order.domain.OrderStatus;
import com.crm.sharedkernel.domain.ActorId;
import com.crm.sharedkernel.domain.TenantId;

public record OrderDetails(
		TenantId tenantId,
		OrderId id,
		String orderNumber,
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
		Instant confirmedAt,
		Instant fulfilledAt,
		Instant cancelledAt,
		String cancellationReason,
		Instant createdAt,
		ActorId createdBy,
		Instant updatedAt,
		ActorId updatedBy,
		long version) {
}
