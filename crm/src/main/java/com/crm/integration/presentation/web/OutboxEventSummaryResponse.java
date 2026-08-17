package com.crm.integration.presentation.web;

import java.time.Instant;
import java.util.UUID;

import com.crm.integration.domain.OutboxEventStatus;

public record OutboxEventSummaryResponse(
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
