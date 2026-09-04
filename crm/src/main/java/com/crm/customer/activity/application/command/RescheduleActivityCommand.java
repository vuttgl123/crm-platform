package com.crm.customer.activity.application.command;

import java.time.Instant;

import com.crm.customer.activity.domain.ActivityId;

public record RescheduleActivityCommand(
		ActivityId id,
		Instant startsAt,
		Instant dueAt,
		long expectedVersion
) {}
