package com.crm.marketing.template.application.dto;

import java.util.List;
import java.util.UUID;

public record MarketingTemplateSummary(
		UUID id,
		String name,
		String channel, // EMAIL, SMS, ZALO_ZNS, IN_APP
		String category, // WELCOME, NURTURE, PROMOTION, RE_ENGAGEMENT, EVENT
		String subject,
		String content,
		List<String> variables,
		String status, // ACTIVE, DRAFT, ARCHIVED
		int usageCount,
		String updatedAt
) {}
