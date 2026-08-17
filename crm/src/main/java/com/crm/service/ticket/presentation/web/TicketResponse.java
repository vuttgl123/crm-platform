package com.crm.service.ticket.presentation.web;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import com.crm.service.ticket.domain.TicketChannel;
import com.crm.service.ticket.domain.TicketPriority;
import com.crm.service.ticket.domain.TicketStatus;

public record TicketResponse(
		UUID id,
		String ticketNumber,
		UUID accountId,
		UUID contactId,
		String subject,
		String description,
		TicketChannel channel,
		UUID categoryId,
		TicketPriority priority,
		String severity,
		TicketStatus status,
		UUID assignedUserId,
		UUID assignedTeamId,
		UUID ownerUserId,
		UUID slaPolicyId,
		String externalReference,
		Instant firstResponseDueAt,
		Instant resolutionDueAt,
		Instant firstRespondedAt,
		Instant resolvedAt,
		Instant closedAt,
		Integer satisfactionScore,
		String satisfactionComment,
		List<TicketCommentResponse> comments,
		UUID createdBy,
		Instant createdAt,
		UUID updatedBy,
		Instant updatedAt,
		long version
) {
}
