package com.crm.customer.note.presentation.web;

import java.util.List;
import java.util.UUID;

import com.crm.customer.note.application.command.CreateNoteCommand;
import com.crm.customer.note.application.command.UpdateNoteCommand;
import com.crm.customer.note.application.dto.NoteDetails;
import com.crm.customer.note.application.dto.NoteSummary;
import com.crm.customer.note.application.query.NoteSearchQuery;
import com.crm.customer.note.domain.NoteId;
import com.crm.sharedkernel.domain.ActorId;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface NoteWebMapper {

	default CreateNoteCommand toCreateCommand(CreateNoteRequest request) {
		return new CreateNoteCommand(
				request.title(),
				request.body(),
				request.visibility(),
				request.ownerUserId(),
				request.accountId(),
				request.contactId(),
				request.leadId(),
				request.opportunityId(),
				request.activityId(),
				request.ticketId()
		);
	}

	default UpdateNoteCommand toUpdateCommand(NoteId id, UpdateNoteRequest request) {
		return new UpdateNoteCommand(
				id,
				request.version(),
				request.title(),
				request.body(),
				request.visibility()
		);
	}

	NoteResponse toResponse(NoteDetails details);

	NoteSummaryResponse toSummaryResponse(NoteSummary summary);

	List<NoteSummaryResponse> toSummaryResponseList(List<NoteSummary> summaries);

	default UUID map(ActorId value) {
		return value == null ? null : value.value();
	}

	default ActorId map(UUID value) {
		return value == null ? null : new ActorId(value);
	}

	default UUID map(NoteId value) {
		return value == null ? null : value.value();
	}

	default NoteId mapToNoteId(UUID value) {
		return value == null ? null : new NoteId(value);
	}

}
