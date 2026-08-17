package com.crm.integration.presentation.web;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import com.crm.integration.domain.SignatureAlgorithm;
import com.crm.integration.domain.WebhookStatus;

public record WebhookSubscriptionSummaryResponse(
		UUID id,
		String name,
		String endpointUrl,
		List<String> eventTypes,
		SignatureAlgorithm signatureAlgorithm,
		WebhookStatus status,
		Instant lastSuccessAt,
		Instant lastFailureAt,
		int totalDeliveriesCount,
		Instant updatedAt,
		long version
) {
}
