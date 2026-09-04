package com.crm.customer.opportunity.application.command;

import java.math.BigDecimal;
import java.time.Instant;

import com.crm.customer.opportunity.domain.OpportunityId;

public record CloseWonOpportunityCommand(
		OpportunityId id,
		BigDecimal actualRevenueAmount,
		Instant closedDate,
		long expectedVersion
) {}
