package com.crm.sales.order.domain;

import java.util.Objects;
import java.util.UUID;

public record OrderId(UUID value) {

	public OrderId {
		Objects.requireNonNull(value, "Order ID value must not be null");
	}

	public static OrderId from(String value) {
		Objects.requireNonNull(value, "Order ID string must not be null");
		return new OrderId(UUID.fromString(value));
	}

	@Override
	public String toString() {
		return value.toString();
	}

}
