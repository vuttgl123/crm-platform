package com.crm.sales.order.domain;

import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

import com.crm.sharedkernel.domain.ActorId;

public record OrderStatusHistoryEntry(
		UUID id,
		OrderId orderId,
		Instant changedAt,
		ActorId changedBy,
		String action,
		OrderStatus fromStatus,
		OrderStatus toStatus,
		String notes) {

	public OrderStatusHistoryEntry {
		Objects.requireNonNull(id, "id must not be null");
		Objects.requireNonNull(orderId, "orderId must not be null");
		Objects.requireNonNull(changedAt, "changedAt must not be null");
		Objects.requireNonNull(action, "action must not be null");
		Objects.requireNonNull(toStatus, "toStatus must not be null");
	}

}
