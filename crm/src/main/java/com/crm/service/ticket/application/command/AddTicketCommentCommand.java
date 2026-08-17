package com.crm.service.ticket.application.command;

import java.util.UUID;

import com.crm.service.ticket.domain.CommentVisibility;
import com.crm.service.ticket.domain.TicketId;

public record AddTicketCommentCommand(
		TicketId ticketId,
		UUID authorUserId,
		UUID authorContactId,
		String body,
		CommentVisibility visibility,
		String channel,
		String externalMessageId
) {
}
