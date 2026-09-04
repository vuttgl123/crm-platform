package com.crm.service.ticket.application.port;

import java.util.List;
import java.util.Optional;

import com.crm.service.ticket.application.dto.TicketCommentDetails;
import com.crm.service.ticket.application.dto.TicketSummary;
import com.crm.service.ticket.application.query.TicketSearchQuery;
import com.crm.service.ticket.domain.Ticket;
import com.crm.service.ticket.domain.TicketComment;
import com.crm.service.ticket.domain.TicketCommentId;
import com.crm.service.ticket.domain.TicketId;
import com.crm.sharedkernel.application.PageResult;
import com.crm.sharedkernel.domain.TenantId;

public interface TicketRepository {

	Optional<Ticket> findById(TenantId tenantId, TicketId id);

	Optional<Ticket> findByTicketNumber(TenantId tenantId, String ticketNumber);

	boolean existsByTicketNumber(TenantId tenantId, String ticketNumber);

	PageResult<TicketSummary> search(TenantId tenantId, TicketSearchQuery query);

	List<TicketCommentDetails> findCommentsByTicketId(TenantId tenantId, TicketId ticketId);

	Optional<TicketComment> findCommentById(TenantId tenantId, TicketCommentId commentId);

	void insert(Ticket ticket);

	void update(Ticket ticket);

	void delete(TenantId tenantId, TicketId id, long version);

	void insertComment(TicketComment comment);

	void updateComment(TicketComment comment);

	com.crm.service.ticket.application.dto.TicketStatsDto getStats(
			TenantId tenantId,
			com.crm.sharedkernel.domain.ActorId actorId,
			com.crm.foundation.security.AuthorizedDataAccess access);

	void escalate(
			TenantId tenantId,
			TicketId id,
			com.crm.service.ticket.domain.TicketPriority priority,
			String reason,
			long expectedVersion,
			com.crm.sharedkernel.domain.ActorId actorId,
			java.time.Instant now);

	int bulkAssign(
			TenantId tenantId,
			List<TicketId> ids,
			java.util.UUID assignedUserId,
			java.util.UUID assignedTeamId,
			com.crm.sharedkernel.domain.ActorId actorId,
			java.time.Instant now);

	int bulkChangeStatus(
			TenantId tenantId,
			List<TicketId> ids,
			String status,
			com.crm.sharedkernel.domain.ActorId actorId,
			java.time.Instant now);

}
