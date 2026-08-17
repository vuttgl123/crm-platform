package com.crm.catalog.pricebook.domain;

import java.util.Objects;
import java.util.UUID;

public record PriceBookId(UUID value) {

	public PriceBookId {
		Objects.requireNonNull(value, "value must not be null");
	}

	public static PriceBookId from(UUID value) {
		return new PriceBookId(value);
	}

	public static PriceBookId from(String value) {
		return new PriceBookId(UUID.fromString(value));
	}

	@Override
	public String toString() {
		return value.toString();
	}

}
