package com.crm.service.ticket.application.dto;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import com.crm.service.ticket.domain.Ticket;
import com.crm.service.ticket.domain.TicketChannel;
import com.crm.service.ticket.domain.TicketPriority;
import com.crm.service.ticket.domain.TicketStatus;

public record TicketDetails(
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
		List<TicketCommentDetails> comments,
		UUID createdBy,
		Instant createdAt,
		UUID updatedBy,
		Instant updatedAt,
		long version
) {

	public static TicketDetails from(Ticket ticket, List<TicketCommentDetails> comments) {
		return new TicketDetails(
				ticket.id().value(),
				ticket.ticketNumber(),
				ticket.accountId() != null ? ticket.accountId().value() : null,
				ticket.contactId() != null ? ticket.contactId().value() : null,
				ticket.subject(),
				ticket.description(),
				ticket.channel(),
				ticket.categoryId() != null ? ticket.categoryId().value() : null,
				ticket.priority(),
				ticket.severity(),
				ticket.status(),
				ticket.assignedUserId() != null ? ticket.assignedUserId().value() : null,
				ticket.assignedTeamId(),
				ticket.ownerUserId() != null ? ticket.ownerUserId().value() : null,
				ticket.slaPolicyId(),
				ticket.externalReference(),
				ticket.firstResponseDueAt(),
				ticket.resolutionDueAt(),
				ticket.firstRespondedAt(),
				ticket.resolvedAt(),
				ticket.closedAt(),
				ticket.satisfactionScore(),
				ticket.satisfactionComment(),
				comments != null ? comments : List.of(),
				ticket.auditInfo().createdBy() != null ? ticket.auditInfo().createdBy().value() : null,
				ticket.auditInfo().createdAt(),
				ticket.auditInfo().updatedBy() != null ? ticket.auditInfo().updatedBy().value() : null,
				ticket.auditInfo().updatedAt(),
				ticket.version()
		);
	}

}
