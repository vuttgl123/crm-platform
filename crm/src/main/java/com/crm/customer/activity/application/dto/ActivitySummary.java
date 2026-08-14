package com.crm.customer.activity.application.dto;

import java.time.Instant;

import com.crm.customer.activity.domain.ActivityDirection;
import com.crm.customer.activity.domain.ActivityId;
import com.crm.customer.activity.domain.ActivityOwner;
import com.crm.customer.activity.domain.ActivityPriority;
import com.crm.customer.activity.domain.ActivityStatus;
import com.crm.customer.activity.domain.ActivityType;

public record ActivitySummary(
		ActivityId id,
		ActivityType activityType,
		String subject,
		ActivityDirection direction,
		ActivityStatus status,
		ActivityPriority priority,
		ActivityOwner owner,
		Instant scheduledStartAt,
		Instant scheduledEndAt,
		Instant completedAt,
		Instant updatedAt,
		long version) {
}
