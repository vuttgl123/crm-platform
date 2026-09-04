package com.crm.sales.quote.application.port;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import com.crm.foundation.security.AuthorizedDataAccess;
import com.crm.sales.quote.application.dto.QuoteDetails;
import com.crm.sales.quote.application.dto.QuoteDocumentDto;
import com.crm.sales.quote.application.dto.QuotePulseDto;
import com.crm.sales.quote.application.dto.QuoteRevisionDto;
import com.crm.sales.quote.application.dto.QuoteSummary;
import com.crm.sales.quote.application.query.QuoteSearchQuery;
import com.crm.sales.quote.domain.Quote;
import com.crm.sales.quote.domain.QuoteId;
import com.crm.sales.quote.domain.QuoteStatusHistoryEntry;
import com.crm.sharedkernel.application.PageQuery;
import com.crm.sharedkernel.application.PageResult;
import com.crm.sharedkernel.domain.ActorId;
import com.crm.sharedkernel.domain.TenantId;

public interface QuoteRepository {

	Optional<Quote> findById(TenantId tenantId, QuoteId quoteId,
			ActorId actorId, AuthorizedDataAccess access);

	Optional<QuoteDetails> findDetailsById(TenantId tenantId, QuoteId quoteId,
			ActorId actorId, AuthorizedDataAccess access);

	Optional<QuoteDocumentDto> findDocumentById(TenantId tenantId, QuoteId quoteId,
			ActorId actorId, AuthorizedDataAccess access);

	PageResult<QuoteSummary> search(TenantId tenantId,
			ActorId actorId, QuoteSearchQuery query,
			AuthorizedDataAccess access);

	QuotePulseDto getPulse(TenantId tenantId, ActorId actorId, QuoteSearchQuery query,
			AuthorizedDataAccess access, String tenantTimezone);

	List<QuoteRevisionDto> findRevisions(TenantId tenantId, QuoteId quoteId,
			ActorId actorId, AuthorizedDataAccess access);

	PageResult<QuoteStatusHistoryEntry> findHistory(TenantId tenantId, QuoteId quoteId,
			ActorId actorId, AuthorizedDataAccess access, PageQuery pageQuery);

	void insertStatusHistory(QuoteStatusHistoryEntry entry);

	boolean existsByQuoteNumberAndRevision(TenantId tenantId, String quoteNumber, int revisionNumber,
			QuoteId excludeId);

	String generateQuoteNumber(TenantId tenantId);

	boolean existsAccount(TenantId tenantId, UUID accountId,
			ActorId actorId, AuthorizedDataAccess access);

	boolean existsContact(TenantId tenantId, UUID contactId,
			ActorId actorId, AuthorizedDataAccess access);

	boolean existsOpportunity(TenantId tenantId, UUID opportunityId,
			ActorId actorId, AuthorizedDataAccess access);

	boolean existsPriceBook(TenantId tenantId, UUID priceBookId);

	void save(Quote quote);

	void softDelete(TenantId tenantId, QuoteId quoteId, ActorId actorId);

	UUID findRelatedOrderId(TenantId tenantId, QuoteId quoteId);

	UUID convertToOrder(TenantId tenantId, Quote quote, ActorId actorId, Instant now);

	com.crm.sales.quote.application.dto.QuoteStatsDto getStats(
			TenantId tenantId,
			ActorId actorId,
			AuthorizedDataAccess access);

	void applyDiscount(
			TenantId tenantId,
			QuoteId id,
			java.math.BigDecimal discountPercentage,
			long expectedVersion,
			ActorId actorId,
			Instant now);

	int bulkChangeStatus(
			TenantId tenantId,
			List<QuoteId> ids,
			com.crm.sales.quote.domain.QuoteStatus status,
			ActorId actorId,
			Instant now);

}
