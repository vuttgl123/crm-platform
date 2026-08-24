package com.crm.sales.quote.application.query;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import com.crm.sales.quote.domain.QuoteStatus;
import com.crm.sharedkernel.application.PageQuery;

public record QuoteSearchQuery(
		String q,
		List<QuoteStatus> statuses,
		UUID accountId,
		UUID opportunityId,
		String ownerType,
		UUID ownerId,
		String currencyCode,
		String validity,
		LocalDate issueFrom,
		LocalDate issueTo,
		LocalDate validFrom,
		LocalDate validTo,
		boolean latestOnly,
		String sort,
		String direction,
		PageQuery pageQuery
) {
}
