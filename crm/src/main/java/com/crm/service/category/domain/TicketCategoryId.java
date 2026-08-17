package com.crm.service.category.domain;

import java.util.Objects;
import java.util.UUID;

public record TicketCategoryId(UUID value) {

	public TicketCategoryId {
		Objects.requireNonNull(value, "value must not be null");
	}

	public static TicketCategoryId from(UUID value) {
		return new TicketCategoryId(value);
	}

	public static TicketCategoryId from(String value) {
		return new TicketCategoryId(UUID.fromString(value));
	}

	@Override
	public String toString() {
		return value.toString();
	}

}
