package com.crm.catalog.pricebook.domain;

import java.util.Objects;
import java.util.UUID;

public record PriceBookItemId(UUID value) {

	public PriceBookItemId {
		Objects.requireNonNull(value, "value must not be null");
	}

	public static PriceBookItemId from(UUID value) {
		return new PriceBookItemId(value);
	}

	public static PriceBookItemId from(String value) {
		return new PriceBookItemId(UUID.fromString(value));
	}

	@Override
	public String toString() {
		return value.toString();
	}

}
