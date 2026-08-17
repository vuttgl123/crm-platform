package com.crm.service.ticket.application.command;

import java.util.UUID;

import com.crm.service.ticket.domain.TicketChannel;
import com.crm.service.ticket.domain.TicketPriority;

public record CreateTicketCommand(
		String ticketNumber,
		UUID accountId,
		UUID contactId,
		String subject,
		String description,
		TicketChannel channel,
		UUID categoryId,
		TicketPriority priority,
		String severity,
		UUID assignedUserId,
		UUID assignedTeamId,
		UUID ownerUserId,
		UUID slaPolicyId,
		String externalReference
) {
}
