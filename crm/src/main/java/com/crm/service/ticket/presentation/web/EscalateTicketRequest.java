package com.crm.service.ticket.presentation.web;

import com.crm.service.ticket.domain.TicketPriority;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record EscalateTicketRequest(
		@NotNull TicketPriority priority,
		@Size(max = 500) String escalationReason,
		@NotNull Long version
) {}
