package com.crm.platform.settings.application.dto;

import java.util.List;
import java.util.UUID;

public record DigestScheduleDto(
		boolean enabled,
		String frequency, // DAILY, WEEKLY_MONDAY, WEEKLY_FRIDAY
		String deliveryTime, // "18:00"
		String timezone,
		List<UUID> recipientUserIds,
		List<String> recipientEmails,
		List<String> includedMetricKeys // ["DEALS_WON", "LEADS_CREATED", "TASKS_OVERDUE", "REVENUE_GENERATED"]
) {}
