package com.crm.integration.domain;

import java.util.Objects;
import java.util.UUID;

public record WebhookSubscriptionId(UUID value) {

	public WebhookSubscriptionId {
		Objects.requireNonNull(value, "value must not be null");
	}

	public static WebhookSubscriptionId from(UUID value) {
		return new WebhookSubscriptionId(value);
	}

	public static WebhookSubscriptionId from(String value) {
		return new WebhookSubscriptionId(UUID.fromString(value));
	}

	@Override
	public String toString() {
		return value.toString();
	}

}
