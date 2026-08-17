package com.crm.privacy.domain;

import java.util.Objects;
import java.util.UUID;

public record DataSubjectRequestId(UUID value) {

	public DataSubjectRequestId {
		Objects.requireNonNull(value, "value must not be null");
	}

	public static DataSubjectRequestId from(UUID value) {
		return new DataSubjectRequestId(value);
	}

	public static DataSubjectRequestId from(String value) {
		return new DataSubjectRequestId(UUID.fromString(value));
	}

	@Override
	public String toString() {
		return value.toString();
	}

}
