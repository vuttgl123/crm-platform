package com.crm.foundation.web.error;

import java.util.Objects;

public record FieldViolation(String field, String errorCode, String message) {

	public FieldViolation {
		field = requireText(field, "field");
		errorCode = requireText(errorCode, "errorCode");
		message = requireText(message, "message");
	}

	private static String requireText(String value, String name) {
		String required = Objects.requireNonNull(value,
				name + " must not be null");
		if (required.isBlank()) {
			throw new IllegalArgumentException(name + " must not be blank");
		}
		return required;
	}

}
