package com.crm.customer.activity.application.query;

import java.time.Instant;
import java.util.UUID;

import com.crm.customer.activity.domain.ActivityPriority;
import com.crm.customer.activity.domain.ActivityStatus;
import com.crm.customer.activity.domain.ActivityType;
import com.crm.sharedkernel.application.PageQuery;

public record ActivitySearchQuery(
		String search,
		ActivityType activityType,
		ActivityStatus status,
		ActivityPriority priority,
		UUID ownerUserId,
		UUID assignedTeamId,
		Instant fromTime,
		Instant toTime,
		PageQuery pageQuery) {
}
