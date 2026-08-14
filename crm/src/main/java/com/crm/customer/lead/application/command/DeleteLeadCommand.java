package com.crm.customer.lead.application.command;

import com.crm.customer.lead.domain.LeadId;

public record DeleteLeadCommand(
		LeadId leadId,
		long expectedVersion) {
}
