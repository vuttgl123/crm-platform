package com.crm.sales.order.domain;

import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

import com.crm.sharedkernel.domain.ActorId;

public class OrderFulfillmentEvent {

	private final UUID id;
	private final OrderId orderId;
	private final String eventNumber;
	private final String referenceNumber;
	private final LocalDate fulfillmentDate;
	private final String note;
	private OrderFulfillmentStatus status;
	private final Instant occurredAt;
	private final ActorId recordedBy;
	private Instant voidedAt;
	private ActorId voidedBy;
	private String voidReason;
	private final List<OrderFulfillmentEventLine> lines;
	private long version;

	public OrderFulfillmentEvent(
			UUID id,
			OrderId orderId,
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
			List<OrderFulfillmentEventLine> lines,
			long version) {
		this.id = Objects.requireNonNull(id, "id must not be null");
		this.orderId = Objects.requireNonNull(orderId, "orderId must not be null");
		this.eventNumber = eventNumber != null ? eventNumber : id.toString().substring(0, 8);
		this.referenceNumber = trimToNull(referenceNumber);
		this.fulfillmentDate = fulfillmentDate != null ? fulfillmentDate : LocalDate.now();
		this.note = trimToNull(note);
		this.status = status != null ? status : OrderFulfillmentStatus.RECORDED;
		this.occurredAt = Objects.requireNonNull(occurredAt, "occurredAt must not be null");
		this.recordedBy = recordedBy;
		this.voidedAt = voidedAt;
		this.voidedBy = voidedBy;
		this.voidReason = trimToNull(voidReason);
		this.lines = lines != null ? new ArrayList<>(lines) : new ArrayList<>();
		this.version = version;
	}

	public static OrderFulfillmentEvent record(
			UUID id,
			OrderId orderId,
			String eventNumber,
			String referenceNumber,
			LocalDate fulfillmentDate,
			String note,
			List<OrderFulfillmentEventLine> lines,
			ActorId actorId,
			Instant now) {
		return new OrderFulfillmentEvent(
				id,
				orderId,
				eventNumber,
				referenceNumber,
				fulfillmentDate,
				note,
				OrderFulfillmentStatus.RECORDED,
				now,
				actorId,
				null,
				null,
				null,
				lines,
				1L
		);
	}

	public void voidEvent(String reason, ActorId actorId, Instant now) {
		if (this.status == OrderFulfillmentStatus.VOIDED) {
			throw new IllegalStateException("Fulfillment event is already voided");
		}
		this.status = OrderFulfillmentStatus.VOIDED;
		this.voidReason = Objects.requireNonNull(trimToNull(reason), "Void reason must not be blank");
		this.voidedBy = actorId;
		this.voidedAt = now;
		this.version++;
	}

	public UUID id() { return id; }
	public OrderId orderId() { return orderId; }
	public String eventNumber() { return eventNumber; }
	public String referenceNumber() { return referenceNumber; }
	public LocalDate fulfillmentDate() { return fulfillmentDate; }
	public String note() { return note; }
	public OrderFulfillmentStatus status() { return status; }
	public Instant occurredAt() { return occurredAt; }
	public ActorId recordedBy() { return recordedBy; }
	public Instant voidedAt() { return voidedAt; }
	public ActorId voidedBy() { return voidedBy; }
	public String voidReason() { return voidReason; }
	public List<OrderFulfillmentEventLine> lines() { return Collections.unmodifiableList(lines); }
	public long version() { return version; }

	private static String trimToNull(String value) {
		if (value == null) return null;
		String trimmed = value.trim();
		return trimmed.isEmpty() ? null : trimmed;
	}

}
