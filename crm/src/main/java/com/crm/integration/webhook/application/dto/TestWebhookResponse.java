package com.crm.integration.webhook.application.dto;

public record TestWebhookResponse(
		boolean success,
		int httpStatusCode,
		long executionTimeMs,
		String responseMessage
) {}
