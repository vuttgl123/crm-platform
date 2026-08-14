package com.crm.customer.lead.application.query;

import java.util.UUID;

import com.crm.customer.lead.domain.LeadOwner;
import com.crm.customer.lead.domain.LeadRating;
import com.crm.sharedkernel.application.PageQuery;

public record LeadSearchQuery(
		String search,
		UUID statusId,
		UUID sourceId,
		LeadRating rating,
		LeadOwner owner,
		Boolean converted,
		PageQuery pageQuery) {
}
