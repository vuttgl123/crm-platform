package com.crm.customer.lead.application.command;

import java.util.UUID;

import com.crm.customer.lead.domain.LeadId;

public record ConvertLeadCommand(
		LeadId leadId,
		UUID convertedAccountId,
		UUID convertedContactId,
		UUID convertedOpportunityId,
		UUID convertedStatusId,
		long expectedVersion) {
}
