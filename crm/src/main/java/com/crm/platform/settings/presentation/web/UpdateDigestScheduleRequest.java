package com.crm.platform.settings.presentation.web;

import java.util.List;
import java.util.UUID;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdateDigestScheduleRequest(
		boolean enabled,
		@NotBlank @Size(max = 50) String frequency,
		@NotBlank @Size(max = 10) String deliveryTime,
		@NotBlank @Size(max = 100) String timezone,
		List<UUID> recipientUserIds,
		List<String> recipientEmails,
		List<String> includedMetricKeys
) {}
