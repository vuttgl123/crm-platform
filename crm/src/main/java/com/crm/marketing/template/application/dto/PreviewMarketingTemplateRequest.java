package com.crm.marketing.template.application.dto;

import java.util.Map;

public record PreviewMarketingTemplateRequest(
		String subject,
		String content,
		Map<String, String> sampleData
) {}
