package com.crm.marketing.template.application.dto;

import java.util.List;
import jakarta.validation.constraints.NotBlank;

public record CreateMarketingTemplateRequest(
		@NotBlank(message = "Tên mẫu không được để trống")
		String name,
		@NotBlank(message = "Kênh gửi không được để trống")
		String channel,
		String category,
		String subject,
		@NotBlank(message = "Nội dung mẫu không được để trống")
		String content,
		List<String> variables,
		String status
) {}
