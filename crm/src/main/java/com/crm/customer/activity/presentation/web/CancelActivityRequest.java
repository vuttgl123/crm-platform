package com.crm.customer.activity.presentation.web;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CancelActivityRequest(
		@Size(max = 255) String cancelReason,
		@NotNull Long version
) {}
