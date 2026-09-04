package com.crm.customer.activity.presentation.web;

import java.util.List;
import java.util.UUID;

import jakarta.validation.constraints.NotEmpty;

public record BulkCompleteActivitiesRequest(
		@NotEmpty List<UUID> activityIds,
		String outcomeCode
) {}
