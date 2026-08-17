package com.crm.customer.note.application.query;

import java.util.UUID;

public record NoteSearchQuery(
		UUID accountId,
		UUID contactId,
		UUID leadId,
		UUID opportunityId,
		UUID activityId,
		UUID ticketId
) {
}
