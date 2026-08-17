package com.crm.integration.domain;

import java.util.Objects;
import java.util.UUID;

public record WebhookDeliveryId(UUID value) {

	public WebhookDeliveryId {
		Objects.requireNonNull(value, "value must not be null");
	}

	public static WebhookDeliveryId from(UUID value) {
		return new WebhookDeliveryId(value);
	}

	public static WebhookDeliveryId from(String value) {
		return new WebhookDeliveryId(UUID.fromString(value));
	}

	@Override
	public String toString() {
		return value.toString();
	}

}
