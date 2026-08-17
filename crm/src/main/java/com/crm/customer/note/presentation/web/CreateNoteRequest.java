package com.crm.customer.note.presentation.web;

import java.util.UUID;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import com.crm.customer.note.domain.NoteVisibility;

public record CreateNoteRequest(
		@Size(max = 255, message = "Title must not exceed 255 characters")
		String title,

		@NotBlank(message = "Note body must not be blank")
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
