package com.crm.integration.webhook.application.dto;

import java.util.UUID;

public record WebhookDeliveryLogDto(
		UUID id,
		UUID webhookId,
		String event,
		int httpStatusCode,
		long executionTimeMs,
		String requestPayload,
		String responseBody,
		String status,
		String triggeredAt
) {}
