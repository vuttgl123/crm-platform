package com.crm.service.ticket.application.command;

import java.util.UUID;

import com.crm.service.ticket.domain.TicketChannel;
import com.crm.service.ticket.domain.TicketId;
import com.crm.service.ticket.domain.TicketPriority;

public record UpdateTicketCommand(
		TicketId id,
		long version,
		UUID accountId,
		UUID contactId,
		String subject,
		String description,
		TicketChannel channel,
		UUID categoryId,
		TicketPriority priority,
		String severity,
		String externalReference
) {
}
