package com.crm.service.ticket.application.command;

import com.crm.service.ticket.domain.TicketId;

public record CloseTicketCommand(
		TicketId id,
		long version,
		Integer satisfactionScore,
		String satisfactionComment
) {
}
