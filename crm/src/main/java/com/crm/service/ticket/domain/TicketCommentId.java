package com.crm.service.ticket.domain;

import java.util.Objects;
import java.util.UUID;

public record TicketCommentId(UUID value) {

	public TicketCommentId {
		Objects.requireNonNull(value, "value must not be null");
	}

	public static TicketCommentId from(UUID value) {
		return new TicketCommentId(value);
	}

	public static TicketCommentId from(String value) {
		return new TicketCommentId(UUID.fromString(value));
	}

	@Override
	public String toString() {
		return value.toString();
	}

}
