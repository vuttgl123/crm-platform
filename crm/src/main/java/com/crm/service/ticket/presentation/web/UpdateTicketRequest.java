package com.crm.service.ticket.presentation.web;

import java.util.UUID;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import com.crm.service.ticket.domain.TicketChannel;
import com.crm.service.ticket.domain.TicketPriority;

public record UpdateTicketRequest(
		@NotNull(message = "Version is required")
		@Positive(message = "Version must be positive")
		Long version,

		UUID accountId,

		UUID contactId,

		@NotBlank(message = "Subject must not be blank")
		@Size(max = 255, message = "Subject must not exceed 255 characters")
		String subject,

		@Size(max = 5000, message = "Description must not exceed 5000 characters")
		String description,

		TicketChannel channel,

		UUID categoryId,

		TicketPriority priority,

		String severity,

		@Size(max = 255, message = "External reference must not exceed 255 characters")
		String externalReference
) {
}
