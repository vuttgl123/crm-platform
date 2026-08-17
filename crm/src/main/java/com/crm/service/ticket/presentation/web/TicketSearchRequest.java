package com.crm.service.ticket.presentation.web;

import java.util.UUID;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import com.crm.service.ticket.domain.TicketPriority;
import com.crm.service.ticket.domain.TicketStatus;

public record TicketSearchRequest(
		String q,
		UUID accountId,
		UUID contactId,
		UUID categoryId,
		TicketStatus status,
		TicketPriority priority,
		UUID assignedUserId,
		UUID assignedTeamId,

		@Min(value = 0, message = "Page index must not be negative")
		Integer page,

		@Min(value = 1, message = "Page size must be at least 1")
		@Max(value = 100, message = "Page size must not exceed 100")
		Integer size
) {
}
