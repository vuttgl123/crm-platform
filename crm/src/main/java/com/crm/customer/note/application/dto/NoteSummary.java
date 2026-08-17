package com.crm.customer.note.application.dto;

import java.time.Instant;
import java.util.UUID;

import com.crm.customer.note.domain.NoteVisibility;

public record NoteSummary(
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
