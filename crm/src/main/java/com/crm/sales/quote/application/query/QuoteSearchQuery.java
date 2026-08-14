package com.crm.sales.quote.application.query;

import java.util.UUID;

import com.crm.sales.quote.domain.QuoteStatus;
import com.crm.sharedkernel.application.PageQuery;

public record QuoteSearchQuery(
		String search,
		UUID accountId,
		UUID opportunityId,
		QuoteStatus status,
		UUID ownerUserId,
		PageQuery pageQuery) {
}
