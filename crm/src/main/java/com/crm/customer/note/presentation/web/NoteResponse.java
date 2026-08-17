package com.crm.customer.note.presentation.web;

import java.time.Instant;
import java.util.UUID;

import com.crm.customer.note.domain.NoteVisibility;

public record NoteResponse(
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
}
