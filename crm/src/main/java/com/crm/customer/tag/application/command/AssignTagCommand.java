package com.crm.customer.tag.application.command;

import java.util.UUID;

import com.crm.customer.tag.domain.TagId;

public record AssignTagCommand(
		TagId tagId,
		UUID accountId,
		UUID contactId,
		UUID leadId,
		UUID opportunityId,
		UUID activityId,
		UUID ticketId
) {
}
