package com.crm.customer.pipeline.domain;

import java.util.Objects;
import java.util.UUID;

public record PipelineId(UUID value) {

	public PipelineId {
		Objects.requireNonNull(value, "value must not be null");
	}

	public static PipelineId from(UUID value) {
		return new PipelineId(value);
	}

	public static PipelineId from(String value) {
		return new PipelineId(UUID.fromString(value));
	}

	@Override
	public String toString() {
		return value.toString();
	}

}
