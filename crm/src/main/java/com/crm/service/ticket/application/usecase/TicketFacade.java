package com.crm.service.ticket.application.usecase;

import java.util.UUID;

import com.crm.service.ticket.application.command.AddTicketCommentCommand;
import com.crm.service.ticket.application.command.AssignTicketCommand;
import com.crm.service.ticket.application.command.CloseTicketCommand;
import com.crm.service.ticket.application.command.CreateTicketCommand;
import com.crm.service.ticket.application.command.UpdateTicketCommand;
import com.crm.service.ticket.application.dto.TicketCommentDetails;
import com.crm.service.ticket.application.dto.TicketDetails;
import com.crm.service.ticket.application.dto.TicketSummary;
import com.crm.service.ticket.application.query.TicketSearchQuery;
import com.crm.service.ticket.domain.TicketCommentId;
import com.crm.service.ticket.domain.TicketId;
import com.crm.sharedkernel.application.PageResult;

public interface TicketFacade {

	TicketDetails create(CreateTicketCommand command);

	TicketDetails get(TicketId id);

	PageResult<TicketSummary> search(TicketSearchQuery query);

	TicketDetails update(UpdateTicketCommand command);

	TicketDetails assign(AssignTicketCommand command);

	TicketDetails resolve(TicketId id, long version);

	TicketDetails close(CloseTicketCommand command);

	TicketDetails reopen(TicketId id, long version);

	void delete(TicketId id, long version);

	TicketCommentDetails addComment(AddTicketCommentCommand command);

	void deleteComment(TicketId ticketId, TicketCommentId commentId);

	com.crm.service.ticket.application.dto.TicketStatsDto getStats();

	TicketDetails escalate(com.crm.service.ticket.application.command.EscalateTicketCommand command);

	int bulkAssign(com.crm.service.ticket.application.command.BulkAssignTicketsCommand command);

	int bulkChangeStatus(com.crm.service.ticket.application.command.BulkChangeTicketStatusCommand command);

}
