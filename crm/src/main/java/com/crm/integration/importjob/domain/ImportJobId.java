package com.crm.integration.importjob.domain;

import java.util.Objects;
import java.util.UUID;

public record ImportJobId(UUID value) {

	public ImportJobId {
		Objects.requireNonNull(value, "value must not be null");
	}

	public static ImportJobId from(UUID value) {
		return new ImportJobId(value);
	}

	public static ImportJobId from(String value) {
		return new ImportJobId(UUID.fromString(value));
	}

	@Override
	public String toString() {
		return value.toString();
	}

}
