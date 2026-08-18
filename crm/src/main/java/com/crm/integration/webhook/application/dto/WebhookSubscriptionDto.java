package com.crm.integration.webhook.application.dto;

import java.util.List;
import java.util.UUID;

public record WebhookSubscriptionDto(
		UUID id,
		String name,
		String targetUrl,
		String secretToken,
		List<String> events,
		String status,
		int successCount,
		int failureCount,
		String lastTriggeredAt,
		String createdAt
) {}
