package com.crm.customer.note.domain;

import java.util.Objects;
import java.util.UUID;

public record NoteId(UUID value) {

	public NoteId {
		Objects.requireNonNull(value, "value must not be null");
	}

	public static NoteId from(UUID value) {
		return new NoteId(value);
	}

	public static NoteId from(String value) {
		return new NoteId(UUID.fromString(value));
	}

	@Override
	public String toString() {
		return value.toString();
	}

}
