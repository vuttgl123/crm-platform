package com.crm.integration.application.dto;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import com.crm.integration.domain.SignatureAlgorithm;
import com.crm.integration.domain.WebhookStatus;
import com.crm.integration.domain.WebhookSubscription;

public record WebhookSubscriptionDetails(
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

	public static WebhookSubscriptionDetails from(WebhookSubscription sub) {
		return new WebhookSubscriptionDetails(
				sub.id().value(),
				sub.name(),
				sub.endpointUrl(),
				sub.eventTypes(),
				sub.secretReference(),
				sub.signatureAlgorithm(),
				sub.customHeaders(),
				sub.timeoutSeconds(),
				sub.maxRetries(),
				sub.status(),
				sub.lastSuccessAt(),
				sub.lastFailureAt(),
				sub.auditInfo().createdBy() != null ? sub.auditInfo().createdBy().value() : null,
				sub.auditInfo().createdAt(),
				sub.auditInfo().updatedBy() != null ? sub.auditInfo().updatedBy().value() : null,
				sub.auditInfo().updatedAt(),
				sub.version()
		);
	}

}
