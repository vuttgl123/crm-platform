package com.crm.customer.tag.application.dto;

import java.time.Instant;
import java.util.UUID;

public record EntityTagDetails(
		UUID id,
		UUID tagId,
		String tagKey,
		String tagName,
		String tagColorHex,
		UUID accountId,
		UUID contactId,
		UUID leadId,
		UUID opportunityId,
		UUID activityId,
		UUID ticketId,
		Instant createdAt,
		UUID createdBy
) {
}
