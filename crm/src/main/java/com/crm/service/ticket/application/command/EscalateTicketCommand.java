package com.crm.service.ticket.application.command;

import com.crm.service.ticket.domain.TicketId;
import com.crm.service.ticket.domain.TicketPriority;

public record EscalateTicketCommand(
		TicketId id,
		TicketPriority priority,
		String escalationReason,
		long expectedVersion
) {}
