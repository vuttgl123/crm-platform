package com.crm.privacy.domain;

import java.util.Objects;
import java.util.UUID;

public record RetentionPolicyId(UUID value) {

	public RetentionPolicyId {
		Objects.requireNonNull(value, "value must not be null");
	}

	public static RetentionPolicyId from(UUID value) {
		return new RetentionPolicyId(value);
	}

	public static RetentionPolicyId from(String value) {
		return new RetentionPolicyId(UUID.fromString(value));
	}

	@Override
	public String toString() {
		return value.toString();
	}

}
