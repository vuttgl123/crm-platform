package com.crm.customer.activity.application.command;

import java.time.Instant;

import com.crm.customer.activity.domain.ActivityDirection;
import com.crm.customer.activity.domain.ActivityOwner;
import com.crm.customer.activity.domain.ActivityPriority;
import com.crm.customer.activity.domain.ActivityType;

public record CreateActivityCommand(
		ActivityType activityType,
		String subject,
		String description,
		ActivityDirection direction,
		ActivityPriority priority,
		ActivityOwner owner,
		Instant scheduledStartAt,
		Instant scheduledEndAt,
		Integer durationSeconds,
		String outcomeCode,
		String externalReference,
		String recurrenceRule) {
}
