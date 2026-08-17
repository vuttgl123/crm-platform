package com.crm.service.ticket.application.command;

import java.util.UUID;

import com.crm.service.ticket.domain.TicketId;

public record AssignTicketCommand(
		TicketId id,
		long version,
		UUID assignedUserId,
		UUID assignedTeamId
) {
}
