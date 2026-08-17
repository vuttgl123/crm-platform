package com.crm.integration.presentation.web;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import com.crm.integration.domain.SignatureAlgorithm;
import com.crm.integration.domain.WebhookStatus;

public record WebhookSubscriptionResponse(
		UUID id,
		String name,
		String endpointUrl,
		List<String> eventTypes,
		String secretReference,
		SignatureAlgorithm signatureAlgorithm,
		String customHeaders,
		int timeoutSeconds,
		int maxRetries,
		WebhookStatus status,
		Instant lastSuccessAt,
		Instant lastFailureAt,
		UUID createdBy,
		Instant createdAt,
		UUID updatedBy,
		Instant updatedAt,
		long version
) {
}
