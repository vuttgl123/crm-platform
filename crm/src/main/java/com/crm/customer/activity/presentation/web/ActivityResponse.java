package com.crm.customer.activity.presentation.web;

import java.time.Instant;
import java.util.UUID;

import com.crm.customer.activity.domain.ActivityDirection;
import com.crm.customer.activity.domain.ActivityPriority;
import com.crm.customer.activity.domain.ActivityStatus;
import com.crm.customer.activity.domain.ActivityType;

public record ActivityResponse(
		UUID id,
		ActivityType activityType,
		String subject,
		String description,
		ActivityDirection direction,
		ActivityStatus status,
		ActivityPriority priority,
		Owner owner,
		Instant scheduledStartAt,
		Instant scheduledEndAt,
		Instant completedAt,
		Integer durationSeconds,
		String outcomeCode,
		String externalReference,
		String recurrenceRule,
		Instant createdAt,
		UUID createdBy,
		Instant updatedAt,
		UUID updatedBy,
		long version) {

	public record Owner(UUID ownerUserId, UUID assignedTeamId) {
	}

}
