package com.crm.customer.pipeline.domain;

import java.util.Objects;
import java.util.UUID;

public record PipelineStageId(UUID value) {

	public PipelineStageId {
		Objects.requireNonNull(value, "value must not be null");
	}

	public static PipelineStageId from(UUID value) {
		return new PipelineStageId(value);
	}

	public static PipelineStageId from(String value) {
		return new PipelineStageId(UUID.fromString(value));
	}

	@Override
	public String toString() {
		return value.toString();
	}

}
