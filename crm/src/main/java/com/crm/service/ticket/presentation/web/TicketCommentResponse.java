package com.crm.service.ticket.presentation.web;

import java.time.Instant;
import java.util.UUID;

import com.crm.service.ticket.domain.CommentVisibility;

public record TicketCommentResponse(
		UUID id,
		UUID ticketId,
		UUID authorUserId,
		String authorUserName,
		UUID authorContactId,
		String authorContactName,
		String body,
		CommentVisibility visibility,
		String channel,
		String externalMessageId,
		UUID createdBy,
		Instant createdAt,
		UUID updatedBy,
		Instant updatedAt,
		long version
) {
}
