package com.crm.integration.application.command;

import java.util.List;

import com.crm.integration.domain.SignatureAlgorithm;
import com.crm.integration.domain.WebhookStatus;
import com.crm.integration.domain.WebhookSubscriptionId;

public record UpdateWebhookSubscriptionCommand(
		WebhookSubscriptionId id,
		long version,
		String name,
		String endpointUrl,
		List<String> eventTypes,
		String secretReference,
		SignatureAlgorithm signatureAlgorithm,
		String customHeaders,
		Integer timeoutSeconds,
		Integer maxRetries,
		WebhookStatus status
) {
}
