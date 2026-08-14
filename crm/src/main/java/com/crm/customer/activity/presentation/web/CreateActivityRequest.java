package com.crm.customer.activity.presentation.web;

import java.time.Instant;
import java.util.UUID;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import com.crm.customer.activity.domain.ActivityDirection;
import com.crm.customer.activity.domain.ActivityPriority;
import com.crm.customer.activity.domain.ActivityType;

public record CreateActivityRequest(
		@NotNull ActivityType activityType,
		@NotBlank @Size(max = 255) String subject,
		String description,
		ActivityDirection direction,
		ActivityPriority priority,
		@Valid Owner owner,
		Instant scheduledStartAt,
		Instant scheduledEndAt,
		@PositiveOrZero Integer durationSeconds,
		@Size(max = 191) String outcomeCode,
		@Size(max = 191) String externalReference,
		@Size(max = 255) String recurrenceRule) {

	public record Owner(UUID ownerUserId, UUID assignedTeamId) {
	}

}
