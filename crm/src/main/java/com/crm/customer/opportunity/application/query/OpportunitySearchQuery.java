package com.crm.customer.opportunity.application.query;

import java.util.UUID;

import com.crm.customer.opportunity.domain.OpportunityOwner;
import com.crm.customer.opportunity.domain.OpportunityStatus;
import com.crm.customer.opportunity.domain.OpportunityType;
import com.crm.sharedkernel.application.PageQuery;

public record OpportunitySearchQuery(
		String search,
		UUID accountId,
		UUID pipelineId,
		UUID stageId,
		OpportunityStatus status,
		OpportunityType opportunityType,
		OpportunityOwner owner,
		String forecastFrom,
		String forecastTo,
		String forecastCategory,
		String currencyCode,
		String forecastQuality,
		PageQuery pageQuery) {
}
