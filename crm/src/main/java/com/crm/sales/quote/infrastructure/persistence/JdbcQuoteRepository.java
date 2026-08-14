package com.crm.sales.quote.infrastructure.persistence;

import java.sql.Timestamp;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;

import com.crm.customer.infrastructure.persistence.AccountScopeSql;
import com.crm.foundation.security.AuthorizedDataAccess;
import com.crm.sales.quote.application.dto.QuoteSummary;
import com.crm.sales.quote.application.port.QuoteRepository;
import com.crm.sales.quote.application.query.QuoteSearchQuery;
import com.crm.sales.quote.domain.Quote;
import com.crm.sales.quote.domain.QuoteId;
import com.crm.sharedkernel.application.PageResult;
import com.crm.sharedkernel.domain.ActorId;
import com.crm.sharedkernel.domain.TenantId;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;

@Repository
public class JdbcQuoteRepository implements QuoteRepository {

	private static final String QUOTE_SELECT = """
			SELECT q.tenant_id, q.id, q.quote_number, q.revision_number,
			       q.previous_quote_id, q.account_id, q.contact_id,
			       q.opportunity_id, q.price_book_id, q.owner_user_id,
			       q.status, q.currency_code, q.exchange_rate_to_tenant_currency,
			       q.issue_date, q.valid_until, q.payment_terms,
			       q.delivery_terms, q.customer_reference, q.subtotal,
			       q.discount_total, q.tax_total, q.shipping_total,
			       q.grand_total, q.notes, q.approved_at, q.approved_by,
			       q.accepted_at, q.rejected_at, q.created_at, q.created_by,
			       q.updated_at, q.updated_by, q.version
			FROM sales_quotes q
			""";

	private static final String SUMMARY_SELECT = """
			SELECT q.id, q.quote_number, q.revision_number, q.account_id,
			       q.contact_id, q.opportunity_id, q.owner_user_id,
			       q.status, q.currency_code, q.subtotal, q.discount_total,
			       q.tax_total, q.shipping_total, q.grand_total,
			       q.issue_date, q.valid_until, q.updated_at, q.version
			FROM sales_quotes q
			""";

	private final JdbcClient jdbcClient;

	public JdbcQuoteRepository(JdbcClient jdbcClient) {
		this.jdbcClient = jdbcClient;
	}

	@Override
	public Optional<Quote> findById(TenantId tenantId, QuoteId quoteId,
			ActorId actorId, AuthorizedDataAccess access) {
		AccountScopeSql scope = AccountScopeSql.resolve(actorId, access);
		Map<String, Object> parameters = new HashMap<>(scope.parameters());
		parameters.put("tenantId", tenantId.toString());
		parameters.put("quoteId", quoteId.toString());
		String sql = scope.cte() + QUOTE_SELECT + """
				WHERE q.tenant_id = :tenantId
				  AND q.id = :quoteId
				""";
		return jdbcClient.sql(sql)
				.params(parameters)
				.query(QuoteJdbcMapper::mapQuote)
				.optional();
	}

	@Override
	public PageResult<QuoteSummary> search(TenantId tenantId,
			ActorId actorId, QuoteSearchQuery query,
			AuthorizedDataAccess access) {
		AccountScopeSql scope = AccountScopeSql.resolve(actorId, access);
		Map<String, Object> parameters = new HashMap<>(scope.parameters());
		parameters.put("tenantId", tenantId.toString());

		StringBuilder criteria = new StringBuilder("""
				WHERE q.tenant_id = :tenantId
				""");
		appendSearchCriteria(criteria, parameters, query);

		long totalElements = jdbcClient.sql(scope.cte() + """
				SELECT COUNT(*)
				FROM sales_quotes q
				""" + criteria)
				.params(parameters)
				.query(Long.class)
				.single();

		parameters.put("pageSize", query.pageQuery().size());
		parameters.put("pageOffset", query.pageQuery().offset());

		List<QuoteSummary> items = jdbcClient.sql(scope.cte() + SUMMARY_SELECT
				+ criteria + """
				ORDER BY q.updated_at DESC, q.id DESC
				LIMIT :pageSize OFFSET :pageOffset
				""")
				.params(parameters)
				.query(QuoteJdbcMapper::mapSummary)
				.list();

		return new PageResult<>(
				items,
				query.pageQuery().page(),
				query.pageQuery().size(),
				totalElements,
				(int) Math.ceil((double) totalElements / query.pageQuery().size()));
	}

	@Override
	public boolean existsByQuoteNumber(TenantId tenantId, String quoteNumber,
			QuoteId excludeId) {
		StringBuilder sql = new StringBuilder("""
				SELECT COUNT(*)
				FROM sales_quotes q
				WHERE q.tenant_id = :tenantId
				  AND q.quote_number = :quoteNumber
				""");
		Map<String, Object> parameters = new HashMap<>();
		parameters.put("tenantId", tenantId.toString());
		parameters.put("quoteNumber", quoteNumber);
		if (excludeId != null) {
			sql.append(" AND q.id <> :excludeId");
			parameters.put("excludeId", excludeId.toString());
		}
		Long count = jdbcClient.sql(sql.toString())
				.params(parameters)
				.query(Long.class)
				.single();
		return count != null && count > 0;
	}

	@Override
	public boolean existsAccount(TenantId tenantId, UUID accountId,
			ActorId actorId, AuthorizedDataAccess access) {
		AccountScopeSql scope = AccountScopeSql.resolve(actorId, access);
		Map<String, Object> parameters = new HashMap<>(scope.parameters());
		parameters.put("tenantId", tenantId.toString());
		parameters.put("accountId", accountId.toString());
		String sql = scope.cte() + """
				SELECT COUNT(*)
				FROM crm_accounts a
				WHERE a.tenant_id = :tenantId
				  AND a.id = :accountId
				  AND a.deleted_at IS NULL
				  AND (%s)
				""".formatted(scope.predicate("a"));
		Long count = jdbcClient.sql(sql).params(parameters).query(Long.class).single();
		return count != null && count > 0;
	}

	@Override
	public boolean existsContact(TenantId tenantId, UUID contactId,
			ActorId actorId, AuthorizedDataAccess access) {
		AccountScopeSql scope = AccountScopeSql.resolve(actorId, access);
		Map<String, Object> parameters = new HashMap<>(scope.parameters());
		parameters.put("tenantId", tenantId.toString());
		parameters.put("contactId", contactId.toString());
		String sql = scope.cte() + """
				SELECT COUNT(*)
				FROM crm_contacts c
				WHERE c.tenant_id = :tenantId
				  AND c.id = :contactId
				  AND c.deleted_at IS NULL
				  AND (%s)
				""".formatted(scope.predicate("c"));
		Long count = jdbcClient.sql(sql).params(parameters).query(Long.class).single();
		return count != null && count > 0;
	}

	@Override
	public boolean existsOpportunity(TenantId tenantId, UUID opportunityId,
			ActorId actorId, AuthorizedDataAccess access) {
		AccountScopeSql scope = AccountScopeSql.resolve(actorId, access);
		Map<String, Object> parameters = new HashMap<>(scope.parameters());
		parameters.put("tenantId", tenantId.toString());
		parameters.put("opportunityId", opportunityId.toString());
		String sql = scope.cte() + """
				SELECT COUNT(*)
				FROM crm_opportunities o
				WHERE o.tenant_id = :tenantId
				  AND o.id = :opportunityId
				  AND o.deleted_at IS NULL
				  AND (%s)
				""".formatted(scope.predicate("o"));
		Long count = jdbcClient.sql(sql).params(parameters).query(Long.class).single();
		return count != null && count > 0;
	}

	@Override
	public boolean existsPriceBook(TenantId tenantId, UUID priceBookId) {
		Map<String, Object> parameters = Map.of(
				"tenantId", tenantId.toString(),
				"priceBookId", priceBookId.toString());
		String sql = """
				SELECT COUNT(*)
				FROM catalog_price_books pb
				WHERE pb.tenant_id = :tenantId
				  AND pb.id = :priceBookId
				  AND pb.is_active = true
				""";
		Long count = jdbcClient.sql(sql).params(parameters).query(Long.class).single();
		return count != null && count > 0;
	}

	@Override
	public void save(Quote quote) {
		Objects.requireNonNull(quote, "quote must not be null");
		Map<String, Object> parameters = new HashMap<>();
		parameters.put("tenantId", quote.tenantId().toString());
		parameters.put("id", quote.id().toString());
		parameters.put("quoteNumber", quote.quoteNumber());
		parameters.put("revisionNumber", quote.revisionNumber());
		parameters.put("previousQuoteId", quote.previousQuoteId() == null ? null : quote.previousQuoteId().toString());
		parameters.put("accountId", quote.accountId().toString());
		parameters.put("contactId", quote.contactId() == null ? null : quote.contactId().toString());
		parameters.put("opportunityId", quote.opportunityId() == null ? null : quote.opportunityId().toString());
		parameters.put("priceBookId", quote.priceBookId() == null ? null : quote.priceBookId().toString());
		parameters.put("ownerUserId", quote.ownerUserId() == null ? null : quote.ownerUserId().toString());
		parameters.put("status", quote.status().name());
		parameters.put("currencyCode", quote.amounts().currencyCode());
		parameters.put("exchangeRateToTenantCurrency", quote.exchangeRateToTenantCurrency());
		parameters.put("issueDate", quote.issueDate());
		parameters.put("validUntil", quote.validUntil());
		parameters.put("paymentTerms", quote.paymentTerms());
		parameters.put("deliveryTerms", quote.deliveryTerms());
		parameters.put("customerReference", quote.customerReference());
		parameters.put("subtotal", quote.amounts().subtotal());
		parameters.put("discountTotal", quote.amounts().discountTotal());
		parameters.put("taxTotal", quote.amounts().taxTotal());
		parameters.put("shippingTotal", quote.amounts().shippingTotal());
		parameters.put("grandTotal", quote.amounts().grandTotal());
		parameters.put("notes", quote.notes());
		parameters.put("approvedAt", quote.approvedAt() == null ? null : Timestamp.from(quote.approvedAt()));
		parameters.put("approvedBy", quote.approvedBy() == null ? null : quote.approvedBy().toString());
		parameters.put("acceptedAt", quote.acceptedAt() == null ? null : Timestamp.from(quote.acceptedAt()));
		parameters.put("rejectedAt", quote.rejectedAt() == null ? null : Timestamp.from(quote.rejectedAt()));
		parameters.put("createdAt", Timestamp.from(quote.createdAt()));
		parameters.put("createdBy", quote.createdBy() == null ? null : quote.createdBy().toString());
		parameters.put("updatedAt", Timestamp.from(quote.updatedAt()));
		parameters.put("updatedBy", quote.updatedBy() == null ? null : quote.updatedBy().toString());
		parameters.put("version", quote.version());

		String sql = """
				INSERT INTO sales_quotes (
				    tenant_id, id, quote_number, revision_number, previous_quote_id,
				    account_id, contact_id, opportunity_id, price_book_id,
				    owner_user_id, status, currency_code, exchange_rate_to_tenant_currency,
				    issue_date, valid_until, payment_terms, delivery_terms,
				    customer_reference, subtotal, discount_total, tax_total,
				    shipping_total, grand_total, notes, approved_at, approved_by,
				    accepted_at, rejected_at, created_at, created_by,
				    updated_at, updated_by, version
				) VALUES (
				    :tenantId, :id, :quoteNumber, :revisionNumber, :previousQuoteId,
				    :accountId, :contactId, :opportunityId, :priceBookId,
				    :ownerUserId, :status, :currencyCode, :exchangeRateToTenantCurrency,
				    :issueDate, :validUntil, :paymentTerms, :deliveryTerms,
				    :customerReference, :subtotal, :discountTotal, :taxTotal,
				    :shippingTotal, :grandTotal, :notes, :approvedAt, :approvedBy,
				    :acceptedAt, :rejectedAt, :createdAt, :createdBy,
				    :updatedAt, :updatedBy, :version
				)
				ON DUPLICATE KEY UPDATE
				    account_id = VALUES(account_id),
				    contact_id = VALUES(contact_id),
				    opportunity_id = VALUES(opportunity_id),
				    price_book_id = VALUES(price_book_id),
				    owner_user_id = VALUES(owner_user_id),
				    status = VALUES(status),
				    currency_code = VALUES(currency_code),
				    issue_date = VALUES(issue_date),
				    valid_until = VALUES(valid_until),
				    payment_terms = VALUES(payment_terms),
				    delivery_terms = VALUES(delivery_terms),
				    customer_reference = VALUES(customer_reference),
				    subtotal = VALUES(subtotal),
				    discount_total = VALUES(discount_total),
				    tax_total = VALUES(tax_total),
				    shipping_total = VALUES(shipping_total),
				    grand_total = VALUES(grand_total),
				    notes = VALUES(notes),
				    approved_at = VALUES(approved_at),
				    approved_by = VALUES(approved_by),
				    accepted_at = VALUES(accepted_at),
				    rejected_at = VALUES(rejected_at),
				    updated_at = VALUES(updated_at),
				    updated_by = VALUES(updated_by),
				    version = VALUES(version)
				""";
		jdbcClient.sql(sql).params(parameters).update();
	}

	@Override
	public void delete(TenantId tenantId, QuoteId quoteId) {
		Map<String, Object> parameters = Map.of(
				"tenantId", tenantId.toString(),
				"quoteId", quoteId.toString());
		String sql = """
				DELETE FROM sales_quotes
				WHERE tenant_id = :tenantId AND id = :quoteId
				""";
		jdbcClient.sql(sql).params(parameters).update();
	}

	private void appendSearchCriteria(StringBuilder criteria,
			Map<String, Object> parameters, QuoteSearchQuery query) {
		if (query.search() != null && !query.search().trim().isEmpty()) {
			criteria.append("""
					  AND (
					      LOWER(q.quote_number) LIKE :searchPattern
					      OR LOWER(q.customer_reference) LIKE :searchPattern
					  )
					""");
			parameters.put("searchPattern", "%" + query.search().trim().toLowerCase() + "%");
		}
		if (query.accountId() != null) {
			criteria.append(" AND q.account_id = :filterAccountId");
			parameters.put("filterAccountId", query.accountId().toString());
		}
		if (query.opportunityId() != null) {
			criteria.append(" AND q.opportunity_id = :filterOpportunityId");
			parameters.put("filterOpportunityId", query.opportunityId().toString());
		}
		if (query.status() != null) {
			criteria.append(" AND q.status = :filterStatus");
			parameters.put("filterStatus", query.status().name());
		}
		if (query.ownerUserId() != null) {
			criteria.append(" AND q.owner_user_id = :filterOwnerUserId");
			parameters.put("filterOwnerUserId", query.ownerUserId().toString());
		}
	}

}
