package com.crm.service.ticket.presentation.web;

import java.util.UUID;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import com.crm.service.ticket.domain.TicketChannel;
import com.crm.service.ticket.domain.TicketPriority;

public record CreateTicketRequest(
		@NotBlank(message = "Ticket number must not be blank")
		@Pattern(regexp = "^[A-Za-z0-9_-]{2,100}$", message = "Ticket number must be 2-100 alphanumeric characters, dashes or underscores")
		String ticketNumber,

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

		UUID assignedUserId,

		UUID assignedTeamId,

		UUID ownerUserId,

		UUID slaPolicyId,

		@Size(max = 255, message = "External reference must not exceed 255 characters")
		String externalReference
) {
}
