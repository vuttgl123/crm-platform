package com.crm.customer.activity.presentation.web;

import java.time.Instant;

import jakarta.validation.constraints.NotNull;

public record RescheduleActivityRequest(
		Instant startsAt,
		Instant dueAt,
		@NotNull Long version
) {}
