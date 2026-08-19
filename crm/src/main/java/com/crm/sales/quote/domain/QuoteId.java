package com.crm.sales.quote.domain;

import java.util.Objects;
import java.util.UUID;

public record QuoteId(UUID value) {

	public QuoteId {
		Objects.requireNonNull(value, "Quote ID value must not be null");
	}

	public static QuoteId from(UUID value) {
		return new QuoteId(value);
	}

	public static QuoteId from(String value) {
		Objects.requireNonNull(value, "Quote ID string must not be null");
		return new QuoteId(UUID.fromString(value));
	}

	@Override
	public String toString() {
		return value.toString();
	}

}
