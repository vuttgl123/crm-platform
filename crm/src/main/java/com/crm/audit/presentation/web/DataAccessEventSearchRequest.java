package com.crm.audit.presentation.web;

import java.time.Instant;
import java.util.UUID;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.PositiveOrZero;
import com.crm.audit.domain.DataAccessType;

public record DataAccessEventSearchRequest(
		String q,
		String entityType,
		UUID entityId,
		DataAccessType accessType,
		UUID actorUserId,
		Instant from,
		Instant to,
		@PositiveOrZero @Min(0) Integer page,
		@PositiveOrZero @Min(1) @Max(100) Integer size) {
}
