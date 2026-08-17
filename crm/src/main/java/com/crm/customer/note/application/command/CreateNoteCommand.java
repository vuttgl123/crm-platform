package com.crm.customer.note.application.command;

import java.util.UUID;

import com.crm.customer.note.domain.NoteVisibility;

public record CreateNoteCommand(
		String title,
		String body,
		NoteVisibility visibility,
		UUID ownerUserId,
		UUID accountId,
		UUID contactId,
		UUID leadId,
		UUID opportunityId,
		UUID activityId,
		UUID ticketId
) {
}
