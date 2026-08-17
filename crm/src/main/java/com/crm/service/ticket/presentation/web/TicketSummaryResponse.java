package com.crm.service.ticket.presentation.web;

import java.time.Instant;
import java.util.UUID;

import com.crm.service.ticket.domain.TicketChannel;
import com.crm.service.ticket.domain.TicketPriority;
import com.crm.service.ticket.domain.TicketStatus;

public record TicketSummaryResponse(
		UUID id,
		String ticketNumber,
		UUID accountId,
		String accountName,
		UUID contactId,
		String contactName,
		String subject,
		TicketChannel channel,
		UUID categoryId,
		String categoryName,
		TicketPriority priority,
		String severity,
		TicketStatus status,
		UUID assignedUserId,
		String assignedUserName,
		UUID assignedTeamId,
		String assignedTeamName,
		Instant firstResponseDueAt,
		Instant resolutionDueAt,
		Instant resolvedAt,
		Instant closedAt,
		int commentsCount,
		Instant updatedAt,
		long version
) {
}
