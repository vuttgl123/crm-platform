package com.crm.service.ticket.domain;

import java.util.Objects;
import java.util.UUID;

public record TicketId(UUID value) {

	public TicketId {
		Objects.requireNonNull(value, "value must not be null");
	}

	public static TicketId from(UUID value) {
		return new TicketId(value);
	}

	public static TicketId from(String value) {
		return new TicketId(UUID.fromString(value));
	}

	@Override
	public String toString() {
		return value.toString();
	}

}
