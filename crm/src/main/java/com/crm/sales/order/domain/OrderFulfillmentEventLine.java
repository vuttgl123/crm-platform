package com.crm.sales.order.domain;

import java.math.BigDecimal;
import java.util.Objects;
import java.util.UUID;

public class OrderFulfillmentEventLine {

	private final UUID id;
	private final UUID fulfillmentId;
	private final UUID orderLineId;
	private final BigDecimal quantity;

	public OrderFulfillmentEventLine(
			UUID id,
			UUID fulfillmentId,
			UUID orderLineId,
			BigDecimal quantity) {
		this.id = Objects.requireNonNull(id, "id must not be null");
		this.fulfillmentId = Objects.requireNonNull(fulfillmentId, "fulfillmentId must not be null");
		this.orderLineId = Objects.requireNonNull(orderLineId, "orderLineId must not be null");
		this.quantity = Objects.requireNonNull(quantity, "quantity must not be null");
		if (this.quantity.compareTo(BigDecimal.ZERO) <= 0) {
			throw new IllegalArgumentException("Fulfilled quantity must be positive");
		}
	}

	public UUID id() { return id; }
	public UUID fulfillmentId() { return fulfillmentId; }
	public UUID orderLineId() { return orderLineId; }
	public BigDecimal quantity() { return quantity; }

}
