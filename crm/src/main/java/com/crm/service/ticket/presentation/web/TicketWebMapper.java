package com.crm.service.ticket.presentation.web;

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
import com.crm.sharedkernel.application.PageQuery;
import com.crm.sharedkernel.application.PageResult;
import com.crm.sharedkernel.domain.ActorId;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface TicketWebMapper {

	CreateTicketCommand toCreateCommand(CreateTicketRequest request);

	default UpdateTicketCommand toUpdateCommand(TicketId id, UpdateTicketRequest request) {
		return new UpdateTicketCommand(
				id,
				request.version(),
				request.accountId(),
				request.contactId(),
				request.subject(),
				request.description(),
				request.channel(),
				request.categoryId(),
				request.priority(),
				request.severity(),
				request.externalReference()
		);
	}

	default AssignTicketCommand toAssignCommand(TicketId id, AssignTicketRequest request) {
		return new AssignTicketCommand(
				id,
				request.version(),
				request.assignedUserId(),
				request.assignedTeamId()
		);
	}

	default CloseTicketCommand toCloseCommand(TicketId id, CloseTicketRequest request) {
		return new CloseTicketCommand(
				id,
				request.version(),
				request.satisfactionScore(),
				request.satisfactionComment()
		);
	}

	default AddTicketCommentCommand toAddCommentCommand(TicketId id, AddTicketCommentRequest request) {
		return new AddTicketCommentCommand(
				id,
				request.authorUserId(),
				request.authorContactId(),
				request.body(),
				request.visibility(),
				request.channel(),
				request.externalMessageId()
		);
	}

	default TicketSearchQuery toSearchQuery(TicketSearchRequest request) {
		if (request == null) {
			return new TicketSearchQuery(null, null, null, null, null, null, null, null, PageQuery.defaultPage());
		}
		int page = request.page() != null ? request.page() : 0;
		int size = request.size() != null ? request.size() : 20;
		return new TicketSearchQuery(
				request.q(),
				request.accountId(),
				request.contactId(),
				request.categoryId(),
				request.status(),
				request.priority(),
				request.assignedUserId(),
				request.assignedTeamId(),
				PageQuery.of(page, size)
		);
	}

	TicketResponse toResponse(TicketDetails details);

	TicketSummaryResponse toSummaryResponse(TicketSummary summary);

	TicketCommentResponse toCommentResponse(TicketCommentDetails details);

	default PageResult<TicketSummaryResponse> toSummaryPage(PageResult<TicketSummary> page) {
		return page.map(this::toSummaryResponse);
	}

	default UUID map(ActorId value) {
		return value == null ? null : value.value();
	}

	default ActorId map(UUID value) {
		return value == null ? null : new ActorId(value);
	}

	default UUID map(TicketId value) {
		return value == null ? null : value.value();
	}

	default TicketId mapToTicketId(UUID value) {
		return value == null ? null : new TicketId(value);
	}

	default UUID map(TicketCommentId value) {
		return value == null ? null : value.value();
	}

	default TicketCommentId mapToTicketCommentId(UUID value) {
		return value == null ? null : new TicketCommentId(value);
	}

}
