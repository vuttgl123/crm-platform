package com.crm.service.ticket.presentation.web;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public record CloseTicketRequest(
		@NotNull(message = "Version is required")
		@Positive(message = "Version must be positive")
		Long version,

		@Min(value = 1, message = "Satisfaction score must be between 1 and 5")
		@Max(value = 5, message = "Satisfaction score must be between 1 and 5")
		Integer satisfactionScore,

		@Size(max = 2000, message = "Satisfaction comment must not exceed 2000 characters")
		String satisfactionComment
) {
}
