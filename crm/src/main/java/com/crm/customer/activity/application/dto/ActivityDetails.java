package com.crm.customer.activity.application.dto;

import java.time.Instant;

import com.crm.customer.activity.domain.ActivityDirection;
import com.crm.customer.activity.domain.ActivityId;
import com.crm.customer.activity.domain.ActivityOwner;
import com.crm.customer.activity.domain.ActivityPriority;
import com.crm.customer.activity.domain.ActivityStatus;
import com.crm.customer.activity.domain.ActivityType;
import com.crm.sharedkernel.domain.ActorId;
import com.crm.sharedkernel.domain.TenantId;

public record ActivityDetails(
		TenantId tenantId,
		ActivityId id,
		ActivityType activityType,
		String subject,
		String description,
		ActivityDirection direction,
		ActivityStatus status,
		ActivityPriority priority,
		ActivityOwner owner,
		Instant scheduledStartAt,
		Instant scheduledEndAt,
		Instant completedAt,
		Integer durationSeconds,
		String outcomeCode,
		String externalReference,
		String recurrenceRule,
		Instant createdAt,
		ActorId createdBy,
		Instant updatedAt,
		ActorId updatedBy,
		long version) {
}
