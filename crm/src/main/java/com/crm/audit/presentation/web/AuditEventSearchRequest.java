package com.crm.audit.presentation.web;

import java.time.Instant;
import java.util.UUID;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.PositiveOrZero;
import com.crm.audit.domain.AuditAction;

public record AuditEventSearchRequest(
		String q,
		String aggregateType,
		UUID aggregateId,
		AuditAction action,
		UUID actorUserId,
		Instant from,
		Instant to,
		@PositiveOrZero @Min(0) Integer page,
		@PositiveOrZero @Min(1) @Max(100) Integer size) {
}
