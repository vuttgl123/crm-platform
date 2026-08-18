package com.crm.integration.webhook.application.dto;

import java.util.List;

public record CreateWebhookRequest(
		String name,
		String targetUrl,
		String secretToken,
		List<String> events
) {}
