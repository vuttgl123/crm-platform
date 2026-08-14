package com.crm.customer.activity.application.command;

import com.crm.customer.activity.domain.ActivityId;

public record CompleteActivityCommand(
		ActivityId activityId,
		String outcomeCode,
		long expectedVersion) {
}
