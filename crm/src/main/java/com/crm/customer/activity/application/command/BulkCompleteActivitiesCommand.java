package com.crm.customer.activity.application.command;

import java.util.List;
import java.util.UUID;

public record BulkCompleteActivitiesCommand(
		List<UUID> activityIds,
		String outcomeCode
) {}
