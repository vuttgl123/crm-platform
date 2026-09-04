package com.crm.customer.activity.application.command;

import com.crm.customer.activity.domain.ActivityId;

public record CancelActivityCommand(
		ActivityId id,
		String cancelReason,
		long expectedVersion
) {}
