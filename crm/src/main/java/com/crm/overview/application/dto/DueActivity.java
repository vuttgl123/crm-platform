package com.crm.overview.application.dto;

import java.util.UUID;

public record DueActivity(
		UUID id,
		String subject,
		String activityType,
		String priority,
		String status,
		String scheduledStartAt,
		String accountName,
		boolean overdue
) {
}
