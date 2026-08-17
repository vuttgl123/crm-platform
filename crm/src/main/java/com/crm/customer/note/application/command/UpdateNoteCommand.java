package com.crm.customer.note.application.command;

import com.crm.customer.note.domain.NoteId;
import com.crm.customer.note.domain.NoteVisibility;

public record UpdateNoteCommand(
		NoteId id,
		long version,
		String title,
		String body,
		NoteVisibility visibility
) {
}
