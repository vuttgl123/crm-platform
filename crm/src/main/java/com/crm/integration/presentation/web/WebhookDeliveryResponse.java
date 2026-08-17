package com.crm.integration.presentation.web;

import java.time.Instant;
import java.util.UUID;

import com.crm.integration.domain.DeliveryStatus;

public record WebhookDeliveryResponse(
		UUID id,
		UUID subscriptionId,
		UUID outboxEventId,
		String eventType,
		int attemptNumber,
		String requestHeaders,
		Integer responseStatus,
		String responseHeaders,
		String responseBodyExcerpt,
		DeliveryStatus status,
		Instant nextAttemptAt,
		Instant startedAt,
		Instant completedAt,
		Integer durationMs,
		String errorMessage,
		Instant createdAt
) {
}
