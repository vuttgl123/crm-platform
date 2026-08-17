package com.crm.customer.note.presentation.web;

import java.time.Instant;
import java.util.UUID;

import com.crm.customer.note.domain.NoteVisibility;

public record NoteSummaryResponse(
		UUID id,
		String title,
		String bodyPreview,
		NoteVisibility visibility,
		UUID ownerUserId,
		String ownerDisplayName,
		UUID accountId,
		UUID contactId,
		UUID leadId,
		UUID opportunityId,
		UUID activityId,
		UUID ticketId,
		Instant createdAt,
		Instant updatedAt,
		long version
) {
}
