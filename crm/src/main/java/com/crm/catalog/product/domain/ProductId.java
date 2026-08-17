package com.crm.catalog.product.domain;

import java.util.Objects;
import java.util.UUID;

public record ProductId(UUID value) {

	public ProductId {
		Objects.requireNonNull(value, "value must not be null");
	}

	public static ProductId from(UUID value) {
		return new ProductId(value);
	}

	public static ProductId from(String value) {
		return new ProductId(UUID.fromString(value));
	}

	@Override
	public String toString() {
		return value.toString();
	}

}
