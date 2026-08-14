package com.crm.customer.activity.presentation.web;

import java.time.Instant;
import java.util.UUID;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.PositiveOrZero;
import com.crm.customer.activity.domain.ActivityPriority;
import com.crm.customer.activity.domain.ActivityStatus;
import com.crm.customer.activity.domain.ActivityType;

public record ActivitySearchRequest(
		String q,
		ActivityType activityType,
		ActivityStatus status,
		ActivityPriority priority,
		UUID ownerUserId,
		UUID assignedTeamId,
		Instant from,
		Instant to,
		@PositiveOrZero @Min(0) Integer page,
		@PositiveOrZero @Min(1) @Max(100) Integer size) {
}
