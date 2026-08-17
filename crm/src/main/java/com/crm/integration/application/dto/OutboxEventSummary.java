package com.crm.integration.application.dto;

import java.time.Instant;
import java.util.UUID;

import com.crm.integration.domain.OutboxEventStatus;

public record OutboxEventSummary(
		UUID id,
		String aggregateType,
		UUID aggregateId,
		String eventType,
		int eventVersion,
		String payload,
		OutboxEventStatus status,
		Instant availableAt,
		Instant publishedAt,
		int retryCount,
		String lastError,
		Instant createdAt
) {
}
