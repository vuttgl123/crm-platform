package com.crm.integration.application.command;

import java.util.List;

import com.crm.integration.domain.SignatureAlgorithm;

public record CreateWebhookSubscriptionCommand(
		String name,
		String endpointUrl,
		List<String> eventTypes,
		String secretReference,
		SignatureAlgorithm signatureAlgorithm,
		String customHeaders,
		Integer timeoutSeconds,
		Integer maxRetries
) {
}
