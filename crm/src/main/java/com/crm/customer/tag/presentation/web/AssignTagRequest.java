package com.crm.customer.tag.presentation.web;

import java.util.UUID;

import jakarta.validation.constraints.NotNull;

public record AssignTagRequest(
		@NotNull(message = "Tag ID is required")
		UUID tagId,

		UUID accountId,
		UUID contactId,
		UUID leadId,
		UUID opportunityId,
		UUID activityId,
		UUID ticketId
) {
}
