package com.crm.sales.quote.application.port;

import java.util.Optional;
import java.util.UUID;

import com.crm.foundation.security.AuthorizedDataAccess;
import com.crm.sales.quote.application.dto.QuoteSummary;
import com.crm.sales.quote.application.query.QuoteSearchQuery;
import com.crm.sales.quote.domain.Quote;
import com.crm.sales.quote.domain.QuoteId;
import com.crm.sharedkernel.application.PageResult;
import com.crm.sharedkernel.domain.ActorId;
import com.crm.sharedkernel.domain.TenantId;

public interface QuoteRepository {

	Optional<Quote> findById(TenantId tenantId, QuoteId quoteId,
			ActorId actorId, AuthorizedDataAccess access);

	PageResult<QuoteSummary> search(TenantId tenantId,
			ActorId actorId, QuoteSearchQuery query,
			AuthorizedDataAccess access);

	boolean existsByQuoteNumber(TenantId tenantId, String quoteNumber,
			QuoteId excludeId);

	boolean existsAccount(TenantId tenantId, UUID accountId,
			ActorId actorId, AuthorizedDataAccess access);

	boolean existsContact(TenantId tenantId, UUID contactId,
			ActorId actorId, AuthorizedDataAccess access);

	boolean existsOpportunity(TenantId tenantId, UUID opportunityId,
			ActorId actorId, AuthorizedDataAccess access);

	boolean existsPriceBook(TenantId tenantId, UUID priceBookId);

	void save(Quote quote);

	void delete(TenantId tenantId, QuoteId quoteId);

}
