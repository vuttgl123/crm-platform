package com.crm.customer.note.application.dto;

import java.time.Instant;
import java.util.UUID;

import com.crm.customer.note.domain.Note;
import com.crm.customer.note.domain.NoteVisibility;

public record NoteDetails(
		UUID id,
		String title,
		String body,
		NoteVisibility visibility,
		UUID ownerUserId,
		UUID accountId,
		UUID contactId,
		UUID leadId,
		UUID opportunityId,
		UUID activityId,
		UUID ticketId,
		UUID createdBy,
		Instant createdAt,
		UUID updatedBy,
		Instant updatedAt,
		long version
) {

	public static NoteDetails from(Note note) {
		return new NoteDetails(
				note.id().value(),
				note.title(),
				note.body(),
				note.visibility(),
				note.ownerUserId(),
				note.accountId(),
				note.contactId(),
				note.leadId(),
				note.opportunityId(),
				note.activityId(),
				note.ticketId(),
				note.auditInfo().createdBy() != null ? note.auditInfo().createdBy().value() : null,
				note.auditInfo().createdAt(),
				note.auditInfo().updatedBy() != null ? note.auditInfo().updatedBy().value() : null,
				note.auditInfo().updatedAt(),
				note.version()
		);
	}

}
