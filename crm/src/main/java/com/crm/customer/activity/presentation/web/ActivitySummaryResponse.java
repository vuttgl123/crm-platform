package com.crm.customer.activity.presentation.web;

import java.time.Instant;
import java.util.UUID;

import com.crm.customer.activity.domain.ActivityDirection;
import com.crm.customer.activity.domain.ActivityPriority;
import com.crm.customer.activity.domain.ActivityStatus;
import com.crm.customer.activity.domain.ActivityType;

public record ActivitySummaryResponse(
		UUID id,
		ActivityType activityType,
		String subject,
		ActivityDirection direction,
		ActivityStatus status,
		ActivityPriority priority,
		Owner owner,
		Instant scheduledStartAt,
		Instant scheduledEndAt,
		Instant completedAt,
		Instant updatedAt,
		long version) {

	public record Owner(UUID ownerUserId, UUID assignedTeamId) {
	}

}
