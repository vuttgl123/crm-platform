package com.crm.customer.activity.application.command;

import com.crm.customer.activity.domain.ActivityId;

public record DeleteActivityCommand(
		ActivityId activityId,
		long expectedVersion) {
}
