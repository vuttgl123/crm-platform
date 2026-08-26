package com.crm.sales.quote.infrastructure.persistence;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.sql.Date;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.Instant;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;

import com.crm.foundation.persistence.OwnershipScopeSql;
import com.crm.foundation.security.AuthorizedDataAccess;
import com.crm.sales.quote.application.dto.QuoteDetails;
import com.crm.sales.quote.application.dto.QuoteDocumentDto;
import com.crm.sales.quote.application.dto.QuoteLineDetails;
import com.crm.sales.quote.application.dto.QuoteOwnerReferenceDto;
import com.crm.sales.quote.application.dto.QuotePulseCurrencyGroupDto;
import com.crm.sales.quote.application.dto.QuotePulseDto;
import com.crm.sales.quote.application.dto.QuoteReferenceDto;
import com.crm.sales.quote.application.dto.QuoteRevisionDto;
import com.crm.sales.quote.application.dto.QuoteSummary;
import com.crm.sales.quote.application.port.QuoteRepository;
import com.crm.sales.quote.application.query.QuoteSearchQuery;
import com.crm.sales.quote.domain.Quote;
import com.crm.sales.quote.domain.QuoteAction;
import com.crm.sales.quote.domain.QuoteAmounts;
import com.crm.sales.quote.domain.QuoteCustomerSnapshot;
import com.crm.sales.quote.domain.QuoteId;
import com.crm.sales.quote.domain.QuoteLine;
import com.crm.sales.quote.domain.QuotePricingMode;
import com.crm.sales.quote.domain.QuoteStatus;
import com.crm.sales.quote.domain.QuoteStatusHistoryEntry;
import com.crm.sharedkernel.application.PageQuery;
import com.crm.sharedkernel.application.PageResult;
import com.crm.sharedkernel.domain.ActorId;
import com.crm.sharedkernel.domain.TenantId;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public class JdbcQuoteRepository implements QuoteRepository, InitializingBean {

	private final JdbcClient jdbcClient;

	public JdbcQuoteRepository(JdbcClient jdbcClient) {
		this.jdbcClient = jdbcClient;
	}

	@Override
	public void afterPropertiesSet() {
		initTablesAndColumns();
	}

	private void initTablesAndColumns() {
		try {
			jdbcClient.sql("""
					CREATE TABLE IF NOT EXISTS sales_quote_lines (
					    tenant_id VARCHAR(64) NOT NULL,
					    id VARCHAR(64) NOT NULL,
					    quote_id VARCHAR(64) NOT NULL,
					    position INT NOT NULL,
					    product_id VARCHAR(64) NOT NULL,
					    price_book_item_id VARCHAR(64) NOT NULL,
					    sku_snapshot VARCHAR(191),
					    product_name_snapshot VARCHAR(255),
					    unit_snapshot VARCHAR(64),
					    description_snapshot TEXT,
					    quantity DECIMAL(19, 6) NOT NULL,
					    list_unit_price DECIMAL(19, 6) NOT NULL,
					    sales_unit_price DECIMAL(19, 6) NOT NULL,
					    discount_percent DECIMAL(8, 4) NOT NULL,
					    tax_percent DECIMAL(8, 4) NOT NULL,
					    line_subtotal DECIMAL(19, 6) NOT NULL,
					    line_discount DECIMAL(19, 6) NOT NULL,
					    line_tax DECIMAL(19, 6) NOT NULL,
					    line_total DECIMAL(19, 6) NOT NULL,
					    created_at TIMESTAMP NOT NULL,
					    updated_at TIMESTAMP NOT NULL,
					    PRIMARY KEY (tenant_id, id)
					)
					""").update();

			jdbcClient.sql("""
					CREATE TABLE IF NOT EXISTS sales_quote_status_history (
					    tenant_id VARCHAR(64) NOT NULL,
					    id VARCHAR(64) NOT NULL,
					    quote_id VARCHAR(64) NOT NULL,
					    quote_revision_number INT NOT NULL,
					    action VARCHAR(64) NOT NULL,
					    previous_stored_status VARCHAR(64),
					    new_stored_status VARCHAR(64) NOT NULL,
					    actor_id VARCHAR(64),
					    reason TEXT,
					    quote_version_before BIGINT NOT NULL,
					    quote_version_after BIGINT NOT NULL,
					    occurred_at TIMESTAMP NOT NULL,
					    PRIMARY KEY (tenant_id, id)
					)
					""").update();

			// Ensure additional columns exist on sales_quotes
			String[] cols = {
					"ALTER TABLE sales_quotes ADD COLUMN IF NOT EXISTS name VARCHAR(255)",
					"ALTER TABLE sales_quotes ADD COLUMN IF NOT EXISTS owner_team_id VARCHAR(64)",
					"ALTER TABLE sales_quotes ADD COLUMN IF NOT EXISTS pricing_mode VARCHAR(64) DEFAULT 'LINE_ITEM'",
					"ALTER TABLE sales_quotes ADD COLUMN IF NOT EXISTS sent_at TIMESTAMP",
					"ALTER TABLE sales_quotes ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMP",
					"ALTER TABLE sales_quotes ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP",
					"ALTER TABLE sales_quotes ADD COLUMN IF NOT EXISTS snapshot_legal_name VARCHAR(255)",
					"ALTER TABLE sales_quotes ADD COLUMN IF NOT EXISTS snapshot_address_line1 VARCHAR(255)",
					"ALTER TABLE sales_quotes ADD COLUMN IF NOT EXISTS snapshot_address_line2 VARCHAR(255)",
					"ALTER TABLE sales_quotes ADD COLUMN IF NOT EXISTS snapshot_locality VARCHAR(100)",
					"ALTER TABLE sales_quotes ADD COLUMN IF NOT EXISTS snapshot_region VARCHAR(100)",
					"ALTER TABLE sales_quotes ADD COLUMN IF NOT EXISTS snapshot_postal_code VARCHAR(32)",
					"ALTER TABLE sales_quotes ADD COLUMN IF NOT EXISTS snapshot_country_code VARCHAR(32)",
					"ALTER TABLE sales_quotes ADD COLUMN IF NOT EXISTS snapshot_contact_name VARCHAR(255)",
					"ALTER TABLE sales_quotes ADD COLUMN IF NOT EXISTS snapshot_contact_email VARCHAR(255)",
					"ALTER TABLE sales_quotes ADD COLUMN IF NOT EXISTS snapshot_contact_phone VARCHAR(64)"
			};
			for (String sql : cols) {
				try {
					jdbcClient.sql(sql).update();
				} catch (Exception ignored) {
				}
			}
		} catch (Exception ignored) {
		}
	}

	@Override
	public Optional<Quote> findById(TenantId tenantId, QuoteId quoteId,
			ActorId actorId, AuthorizedDataAccess access) {
		OwnershipScopeSql scope = OwnershipScopeSql.resolve(actorId, access);
		Map<String, Object> parameters = new HashMap<>(scope.parameters());
		parameters.put("tenantId", tenantId.value());
		parameters.put("quoteId", quoteId.value().toString());

		String sql = scope.cte() + """
				SELECT q.*
				FROM sales_quotes q
				WHERE q.tenant_id = :tenantId
				  AND q.id = :quoteId
				  AND q.deleted_at IS NULL
				  AND (%s)
				""".formatted(scope.predicate("q"));

		List<Map<String, Object>> rows = jdbcClient.sql(sql)
				.params(parameters)
				.query()
				.listOfRows();

		if (rows.isEmpty()) {
			return Optional.empty();
		}

		Map<String, Object> row = rows.get(0);
		Quote quote = mapQuoteFromRow(tenantId, row);
		List<QuoteLine> lines = loadLines(tenantId, quoteId);
		quote.saveDraft(
				quote.name(),
				quote.accountId(),
				quote.contactId(),
				quote.opportunityId(),
				quote.priceBookId(),
				quote.ownerUserId(),
				quote.ownerTeamId(),
				quote.customerSnapshot(),
				quote.issueDate(),
				quote.validUntil(),
				quote.paymentTerms(),
				quote.deliveryTerms(),
				quote.customerReference(),
				quote.notes(),
				quote.amounts().shippingTotal(),
				lines,
				quote.updatedBy(),
				quote.updatedAt(),
				quote.version()
		);
		// restore version after saveDraft
		return Optional.of(reconstituteFullQuote(tenantId, row, lines));
	}

	@Override
	public Optional<QuoteDetails> findDetailsById(TenantId tenantId, QuoteId quoteId,
			ActorId actorId, AuthorizedDataAccess access) {
		OwnershipScopeSql scope = OwnershipScopeSql.resolve(actorId, access);
		Map<String, Object> parameters = new HashMap<>(scope.parameters());
		parameters.put("tenantId", tenantId.value());
		parameters.put("quoteId", quoteId.value().toString());

		String sql = scope.cte() + """
				SELECT q.*,
				       a.name AS account_name,
				       c.first_name AS contact_first_name, c.last_name AS contact_last_name,
				       o.title AS opportunity_title,
				       pb.name AS price_book_name,
				       u.display_name AS owner_user_name,
				       ord.id AS related_order_id,
				       (NOT EXISTS (
				           SELECT 1 FROM sales_quotes q_next
				           WHERE q_next.tenant_id = q.tenant_id
				             AND q_next.previous_quote_id = q.id
				             AND q_next.deleted_at IS NULL
				       )) AS is_latest_revision
				FROM sales_quotes q
				LEFT JOIN crm_accounts a ON a.tenant_id = q.tenant_id AND a.id = q.account_id
				LEFT JOIN crm_contacts c ON c.tenant_id = q.tenant_id AND c.id = q.contact_id
				LEFT JOIN crm_opportunities o ON o.tenant_id = q.tenant_id AND o.id = q.opportunity_id
				LEFT JOIN catalog.price_books pb ON pb.tenant_id = q.tenant_id AND pb.id = q.price_book_id
				LEFT JOIN iam_users u ON u.tenant_id = q.tenant_id AND u.id = q.owner_user_id
				LEFT JOIN sales_orders ord ON ord.tenant_id = q.tenant_id AND ord.quote_id = q.id
				WHERE q.tenant_id = :tenantId
				  AND q.id = :quoteId
				  AND q.deleted_at IS NULL
				  AND (%s)
				""".formatted(scope.predicate("q"));

		List<Map<String, Object>> rows = jdbcClient.sql(sql)
				.params(parameters)
				.query()
				.listOfRows();

		if (rows.isEmpty()) {
			return Optional.empty();
		}

		Map<String, Object> r = rows.get(0);
		List<QuoteLineDetails> lines = loadLineDetails(tenantId, quoteId);
		return Optional.of(mapQuoteDetails(r, lines));
	}

	@Override
	public Optional<QuoteDocumentDto> findDocumentById(TenantId tenantId, QuoteId quoteId,
			ActorId actorId, AuthorizedDataAccess access) {
		return findDetailsById(tenantId, quoteId, actorId, access).map(d -> new QuoteDocumentDto(
				d.id(),
				d.quoteNumber(),
				d.revisionNumber(),
				d.name(),
				d.effectiveStatus(),
				d.storedStatus(),
				d.issueDate(),
				d.validUntil(),
				d.customerSnapshot(),
				d.lines(),
				d.amounts(),
				d.paymentTerms(),
				d.deliveryTerms(),
				d.customerReference()
		));
	}

	@Override
	public PageResult<QuoteSummary> search(TenantId tenantId,
			ActorId actorId, QuoteSearchQuery query,
			AuthorizedDataAccess access) {
		OwnershipScopeSql scope = OwnershipScopeSql.resolve(actorId, access);
		Map<String, Object> parameters = new HashMap<>(scope.parameters());
		parameters.put("tenantId", tenantId.value());

		StringBuilder criteria = new StringBuilder("""
				WHERE q.tenant_id = :tenantId
				  AND q.deleted_at IS NULL
				  AND (%s)
				""".formatted(scope.predicate("q")));

		appendSearchFilters(criteria, parameters, query);

		long totalElements = jdbcClient.sql(scope.cte() + """
				SELECT COUNT(*)
				FROM sales_quotes q
				LEFT JOIN crm_accounts a ON a.tenant_id = q.tenant_id AND a.id = q.account_id
				""" + criteria)
				.params(parameters)
				.query(Long.class)
				.single();

		parameters.put("pageSize", query.pageQuery().size());
		parameters.put("pageOffset", query.pageQuery().offset());

		String sortColumn = resolveSortColumn(query.sort());
		String direction = "asc".equalsIgnoreCase(query.direction()) ? "ASC" : "DESC";

		String selectSql = scope.cte() + """
				SELECT q.*,
				       a.name AS account_name,
				       o.title AS opportunity_title,
				       u.display_name AS owner_user_name,
				       (SELECT COUNT(*) FROM sales_quote_lines l WHERE l.tenant_id = q.tenant_id AND l.quote_id = q.id) AS lines_count,
				       (NOT EXISTS (
				           SELECT 1 FROM sales_quotes q_next
				           WHERE q_next.tenant_id = q.tenant_id
				             AND q_next.previous_quote_id = q.id
				             AND q_next.deleted_at IS NULL
				       )) AS is_latest_revision
				FROM sales_quotes q
				LEFT JOIN crm_accounts a ON a.tenant_id = q.tenant_id AND a.id = q.account_id
				LEFT JOIN crm_opportunities o ON o.tenant_id = q.tenant_id AND o.id = q.opportunity_id
				LEFT JOIN iam_users u ON u.tenant_id = q.tenant_id AND u.id = q.owner_user_id
				""" + criteria + """
				ORDER BY %s %s, q.id DESC
				LIMIT :pageSize OFFSET :pageOffset
				""".formatted(sortColumn, direction);

		List<QuoteSummary> items = jdbcClient.sql(selectSql)
				.params(parameters)
				.query(this::mapQuoteSummaryRow)
				.list();

		return new PageResult<>(
				items,
				query.pageQuery().page(),
				query.pageQuery().size(),
				totalElements,
				(int) Math.ceil((double) totalElements / query.pageQuery().size()));
	}

	@Override
	public QuotePulseDto getPulse(TenantId tenantId, ActorId actorId, QuoteSearchQuery query,
			AuthorizedDataAccess access, String tenantTimezone) {
		OwnershipScopeSql scope = OwnershipScopeSql.resolve(actorId, access);
		Map<String, Object> parameters = new HashMap<>(scope.parameters());
		parameters.put("tenantId", tenantId.value());

		StringBuilder criteria = new StringBuilder("""
				WHERE q.tenant_id = :tenantId
				  AND q.deleted_at IS NULL
				  AND (%s)
				  AND (NOT EXISTS (
				      SELECT 1 FROM sales_quotes q_next
				      WHERE q_next.tenant_id = q.tenant_id
				        AND q_next.previous_quote_id = q.id
				        AND q_next.deleted_at IS NULL
				  ))
				""".formatted(scope.predicate("q")));

		// Apply filters except pagination & latestOnly
		appendSearchFilters(criteria, parameters, query);

		LocalDate today = LocalDate.now();
		LocalDate next7Days = today.plusDays(7);
		parameters.put("todayDate", Date.valueOf(today));
		parameters.put("next7DaysDate", Date.valueOf(next7Days));

		String pulseSql = scope.cte() + """
				SELECT q.currency_code,
				       SUM(CASE WHEN q.status = 'DRAFT' THEN 1 ELSE 0 END) AS draft_count,
				       SUM(CASE WHEN q.status = 'PENDING_APPROVAL' THEN 1 ELSE 0 END) AS pending_approval_count,
				       SUM(CASE WHEN q.status = 'SENT' AND (q.valid_until IS NULL OR q.valid_until >= :todayDate) THEN q.grand_total ELSE 0 END) AS sent_amount,
				       SUM(CASE WHEN q.status = 'SENT' AND (q.valid_until IS NULL OR q.valid_until >= :todayDate) THEN 1 ELSE 0 END) AS sent_count,
				       SUM(CASE WHEN q.status = 'ACCEPTED' THEN q.grand_total ELSE 0 END) AS accepted_amount,
				       SUM(CASE WHEN q.status = 'ACCEPTED' THEN 1 ELSE 0 END) AS accepted_count,
				       SUM(CASE WHEN q.status = 'SENT' AND q.valid_until >= :todayDate AND q.valid_until <= :next7DaysDate THEN q.grand_total ELSE 0 END) AS expiring_soon_amount,
				       SUM(CASE WHEN q.status = 'SENT' AND q.valid_until >= :todayDate AND q.valid_until <= :next7DaysDate THEN 1 ELSE 0 END) AS expiring_soon_count
				FROM sales_quotes q
				LEFT JOIN crm_accounts a ON a.tenant_id = q.tenant_id AND a.id = q.account_id
				""" + criteria + """
				GROUP BY q.currency_code
				ORDER BY q.currency_code ASC
				""";

		List<QuotePulseCurrencyGroupDto> groups = jdbcClient.sql(pulseSql)
				.params(parameters)
				.query((rs, rowNum) -> new QuotePulseCurrencyGroupDto(
						rs.getString("currency_code"),
						rs.getLong("draft_count"),
						rs.getLong("pending_approval_count"),
						toBigDecimal(rs.getBigDecimal("sent_amount")),
						rs.getLong("sent_count"),
						toBigDecimal(rs.getBigDecimal("accepted_amount")),
						rs.getLong("accepted_count"),
						toBigDecimal(rs.getBigDecimal("expiring_soon_amount")),
						rs.getLong("expiring_soon_count")
				))
				.list();

		return new QuotePulseDto(
				"LATEST_ONLY",
				Instant.now(),
				tenantTimezone != null ? tenantTimezone : "UTC",
				groups
		);
	}

	@Override
	public List<QuoteRevisionDto> findRevisions(TenantId tenantId, QuoteId quoteId,
			ActorId actorId, AuthorizedDataAccess access) {
		OwnershipScopeSql scope = OwnershipScopeSql.resolve(actorId, access);
		Map<String, Object> parameters = new HashMap<>(scope.parameters());
		parameters.put("tenantId", tenantId.value());
		parameters.put("quoteId", quoteId.value().toString());

		String sql = scope.cte() + """
				SELECT q.id, q.quote_number, q.revision_number, q.status, q.valid_until,
				       q.grand_total, q.currency_code, q.created_at, q.created_by
				FROM sales_quotes q
				WHERE q.tenant_id = :tenantId
				  AND q.deleted_at IS NULL
				  AND q.quote_number = (SELECT q_target.quote_number FROM sales_quotes q_target WHERE q_target.tenant_id = :tenantId AND q_target.id = :quoteId)
				  AND (%s)
				ORDER BY q.revision_number DESC
				""".formatted(scope.predicate("q"));

		LocalDate today = LocalDate.now();
		return jdbcClient.sql(sql)
				.params(parameters)
				.query((rs, rowNum) -> {
					QuoteStatus status = QuoteStatus.valueOf(rs.getString("status"));
					Date validUntilDate = rs.getDate("valid_until");
					LocalDate validUntil = validUntilDate != null ? validUntilDate.toLocalDate() : null;
					QuoteStatus effective = resolveEffectiveStatus(status, validUntil, today);

					UUID id = UUID.fromString(rs.getString("id"));
					String createdByStr = rs.getString("created_by");
					UUID createdBy = createdByStr != null ? tryParseUUID(createdByStr) : null;

					return new QuoteRevisionDto(
							id,
							rs.getString("quote_number"),
							rs.getInt("revision_number"),
							status,
							effective,
							toBigDecimal(rs.getBigDecimal("grand_total")),
							rs.getString("currency_code"),
							rs.getTimestamp("created_at").toInstant(),
							createdBy,
							id.equals(quoteId.value())
					);
				})
				.list();
	}

	@Override
	public PageResult<QuoteStatusHistoryEntry> findHistory(TenantId tenantId, QuoteId quoteId,
			ActorId actorId, AuthorizedDataAccess access, PageQuery pageQuery) {
		Map<String, Object> parameters = new HashMap<>();
		parameters.put("tenantId", tenantId.value());
		parameters.put("quoteId", quoteId.value().toString());

		long total = jdbcClient.sql("""
				SELECT COUNT(*)
				FROM sales_quote_status_history h
				WHERE h.tenant_id = :tenantId AND h.quote_id = :quoteId
				""")
				.params(parameters)
				.query(Long.class)
				.single();

		parameters.put("pageSize", pageQuery.size());
		parameters.put("pageOffset", pageQuery.offset());

		List<QuoteStatusHistoryEntry> items = jdbcClient.sql("""
				SELECT h.*
				FROM sales_quote_status_history h
				WHERE h.tenant_id = :tenantId AND h.quote_id = :quoteId
				ORDER BY h.occurred_at DESC, h.id DESC
				LIMIT :pageSize OFFSET :pageOffset
				""")
				.params(parameters)
				.query((rs, rowNum) -> new QuoteStatusHistoryEntry(
						UUID.fromString(rs.getString("id")),
						TenantId.from(rs.getString("tenant_id")),
						QuoteId.from(rs.getString("quote_id")),
						rs.getInt("quote_revision_number"),
						rs.getString("action"),
						rs.getString("previous_stored_status") != null ? QuoteStatus.valueOf(rs.getString("previous_stored_status")) : null,
						QuoteStatus.valueOf(rs.getString("new_stored_status")),
						rs.getString("actor_id") != null ? ActorId.from(rs.getString("actor_id")) : null,
						rs.getString("reason"),
						rs.getLong("quote_version_before"),
						rs.getLong("quote_version_after"),
						rs.getTimestamp("occurred_at").toInstant()
				))
				.list();

		return new PageResult<>(items, pageQuery.page(), pageQuery.size(), total, (int) Math.ceil((double) total / pageQuery.size()));
	}

	@Override
	public void insertStatusHistory(QuoteStatusHistoryEntry entry) {
		jdbcClient.sql("""
				INSERT INTO sales_quote_status_history (
				    tenant_id, id, quote_id, quote_revision_number, action,
				    previous_stored_status, new_stored_status, actor_id, reason,
				    quote_version_before, quote_version_after, occurred_at
				) VALUES (
				    :tenantId, :id, :quoteId, :revNum, :action,
				    :prevStatus, :newStatus, :actorId, :reason,
				    :vBefore, :vAfter, :occurredAt
				)
				""")
				.param("tenantId", entry.tenantId().value())
				.param("id", entry.id().toString())
				.param("quoteId", entry.quoteId().value().toString())
				.param("revNum", entry.quoteRevisionNumber())
				.param("action", entry.action())
				.param("prevStatus", entry.previousStoredStatus() != null ? entry.previousStoredStatus().name() : null)
				.param("newStatus", entry.newStoredStatus().name())
				.param("actorId", entry.actorId() != null ? entry.actorId().value() : null)
				.param("reason", entry.reason())
				.param("vBefore", entry.quoteVersionBefore())
				.param("vAfter", entry.quoteVersionAfter())
				.param("occurredAt", Timestamp.from(entry.occurredAt()))
				.update();
	}

	@Override
	public boolean existsByQuoteNumberAndRevision(TenantId tenantId, String quoteNumber, int revisionNumber,
			QuoteId excludeId) {
		StringBuilder sql = new StringBuilder("""
				SELECT COUNT(*)
				FROM sales_quotes q
				WHERE q.tenant_id = :tenantId
				  AND q.quote_number = :quoteNumber
				  AND q.revision_number = :revisionNumber
				""");
		Map<String, Object> parameters = new HashMap<>();
		parameters.put("tenantId", tenantId.value());
		parameters.put("quoteNumber", quoteNumber);
		parameters.put("revisionNumber", revisionNumber);
		if (excludeId != null) {
			sql.append(" AND q.id <> :excludeId");
			parameters.put("excludeId", excludeId.value().toString());
		}
		Long count = jdbcClient.sql(sql.toString())
				.params(parameters)
				.query(Long.class)
				.single();
		return count != null && count > 0;
	}

	@Override
	public String generateQuoteNumber(TenantId tenantId) {
		String prefix = "QT-" + LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMM")) + "-";
		Long seq = jdbcClient.sql("""
				SELECT COUNT(*) + 1
				FROM sales_quotes q
				WHERE q.tenant_id = :tenantId
				  AND q.quote_number LIKE :prefixPattern
				""")
				.param("tenantId", tenantId.value())
				.param("prefixPattern", prefix + "%")
				.query(Long.class)
				.single();
		return String.format("%s%04d", prefix, seq != null ? seq : 1);
	}

	@Override
	public boolean existsAccount(TenantId tenantId, UUID accountId,
			ActorId actorId, AuthorizedDataAccess access) {
		OwnershipScopeSql scope = OwnershipScopeSql.resolve(actorId, access);
		Map<String, Object> parameters = new HashMap<>(scope.parameters());
		parameters.put("tenantId", tenantId.value());
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
		OwnershipScopeSql scope = OwnershipScopeSql.resolve(actorId, access);
		Map<String, Object> parameters = new HashMap<>(scope.parameters());
		parameters.put("tenantId", tenantId.value());
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
		OwnershipScopeSql scope = OwnershipScopeSql.resolve(actorId, access);
		Map<String, Object> parameters = new HashMap<>(scope.parameters());
		parameters.put("tenantId", tenantId.value());
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
		Long count = jdbcClient.sql("""
				SELECT COUNT(*)
				FROM catalog.price_books pb
				WHERE pb.tenant_id = :tenantId
				  AND pb.id = :priceBookId
				  AND pb.is_active = true
				""")
				.param("tenantId", tenantId.value())
				.param("priceBookId", priceBookId.toString())
				.query(Long.class)
				.single();
		return count != null && count > 0;
	}

	@Override
	@Transactional
	public void save(Quote quote) {
		Objects.requireNonNull(quote, "quote must not be null");
		Map<String, Object> parameters = new HashMap<>();
		parameters.put("tenantId", quote.tenantId().value());
		parameters.put("id", quote.id().value().toString());
		parameters.put("quoteNumber", quote.quoteNumber());
		parameters.put("revisionNumber", quote.revisionNumber());
		parameters.put("previousQuoteId", quote.previousQuoteId() == null ? null : quote.previousQuoteId().toString());
		parameters.put("name", quote.name());
		parameters.put("accountId", quote.accountId().toString());
		parameters.put("contactId", quote.contactId() == null ? null : quote.contactId().toString());
		parameters.put("opportunityId", quote.opportunityId() == null ? null : quote.opportunityId().toString());
		parameters.put("priceBookId", quote.priceBookId() == null ? null : quote.priceBookId().toString());
		parameters.put("ownerUserId", quote.ownerUserId() == null ? null : quote.ownerUserId().toString());
		parameters.put("ownerTeamId", quote.ownerTeamId() == null ? null : quote.ownerTeamId().toString());
		parameters.put("status", quote.status().name());
		parameters.put("pricingMode", quote.pricingMode().name());
		parameters.put("currencyCode", quote.amounts().currencyCode());
		parameters.put("exchangeRateToTenantCurrency", quote.exchangeRateToTenantCurrency());
		parameters.put("issueDate", quote.issueDate() != null ? Date.valueOf(quote.issueDate()) : null);
		parameters.put("validUntil", quote.validUntil() != null ? Date.valueOf(quote.validUntil()) : null);
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
		parameters.put("approvedBy", quote.approvedBy() == null ? null : quote.approvedBy().value());
		parameters.put("sentAt", quote.sentAt() == null ? null : Timestamp.from(quote.sentAt()));
		parameters.put("acceptedAt", quote.acceptedAt() == null ? null : Timestamp.from(quote.acceptedAt()));
		parameters.put("rejectedAt", quote.rejectedAt() == null ? null : Timestamp.from(quote.rejectedAt()));
		parameters.put("cancelledAt", quote.cancelledAt() == null ? null : Timestamp.from(quote.cancelledAt()));
		parameters.put("createdAt", Timestamp.from(quote.createdAt()));
		parameters.put("createdBy", quote.createdBy() == null ? null : quote.createdBy().value());
		parameters.put("updatedAt", Timestamp.from(quote.updatedAt()));
		parameters.put("updatedBy", quote.updatedBy() == null ? null : quote.updatedBy().value());
		parameters.put("version", quote.version());

		QuoteCustomerSnapshot snap = quote.customerSnapshot();
		parameters.put("snapLegalName", snap != null ? snap.legalName() : quote.name());
		parameters.put("snapAddr1", snap != null ? snap.addressLine1() : null);
		parameters.put("snapAddr2", snap != null ? snap.addressLine2() : null);
		parameters.put("snapLocality", snap != null ? snap.locality() : null);
		parameters.put("snapRegion", snap != null ? snap.region() : null);
		parameters.put("snapPostal", snap != null ? snap.postalCode() : null);
		parameters.put("snapCountry", snap != null ? snap.countryCode() : null);
		parameters.put("snapContactName", snap != null ? snap.contactName() : null);
		parameters.put("snapContactEmail", snap != null ? snap.contactEmail() : null);
		parameters.put("snapContactPhone", snap != null ? snap.contactPhone() : null);

		String sql = """
				INSERT INTO sales_quotes (
				    tenant_id, id, quote_number, revision_number, previous_quote_id,
				    name, account_id, contact_id, opportunity_id, price_book_id,
				    owner_user_id, owner_team_id, status, pricing_mode, currency_code,
				    exchange_rate_to_tenant_currency, issue_date, valid_until, payment_terms,
				    delivery_terms, customer_reference, subtotal, discount_total, tax_total,
				    shipping_total, grand_total, notes, approved_at, approved_by,
				    sent_at, accepted_at, rejected_at, cancelled_at,
				    snapshot_legal_name, snapshot_address_line1, snapshot_address_line2,
				    snapshot_locality, snapshot_region, snapshot_postal_code, snapshot_country_code,
				    snapshot_contact_name, snapshot_contact_email, snapshot_contact_phone,
				    created_at, created_by, updated_at, updated_by, version
				) VALUES (
				    :tenantId, :id, :quoteNumber, :revisionNumber, :previousQuoteId,
				    :name, :accountId, :contactId, :opportunityId, :priceBookId,
				    :ownerUserId, :ownerTeamId, :status, :pricingMode, :currencyCode,
				    :exchangeRateToTenantCurrency, :issueDate, :validUntil, :paymentTerms,
				    :deliveryTerms, :customerReference, :subtotal, :discountTotal, :taxTotal,
				    :shippingTotal, :grandTotal, :notes, :approvedAt, :approvedBy,
				    :sentAt, :acceptedAt, :rejectedAt, :cancelledAt,
				    :snapLegalName, :snapAddr1, :snapAddr2,
				    :snapLocality, :snapRegion, :snapPostal, :snapCountry,
				    :snapContactName, :snapContactEmail, :snapContactPhone,
				    :createdAt, :createdBy, :updatedAt, :updatedBy, :version
				)
				ON DUPLICATE KEY UPDATE
				    name = VALUES(name),
				    account_id = VALUES(account_id),
				    contact_id = VALUES(contact_id),
				    opportunity_id = VALUES(opportunity_id),
				    price_book_id = VALUES(price_book_id),
				    owner_user_id = VALUES(owner_user_id),
				    owner_team_id = VALUES(owner_team_id),
				    status = VALUES(status),
				    pricing_mode = VALUES(pricing_mode),
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
				    sent_at = VALUES(sent_at),
				    accepted_at = VALUES(accepted_at),
				    rejected_at = VALUES(rejected_at),
				    cancelled_at = VALUES(cancelled_at),
				    snapshot_legal_name = VALUES(snapshot_legal_name),
				    snapshot_address_line1 = VALUES(snapshot_address_line1),
				    snapshot_address_line2 = VALUES(snapshot_address_line2),
				    snapshot_locality = VALUES(snapshot_locality),
				    snapshot_region = VALUES(snapshot_region),
				    snapshot_postal_code = VALUES(snapshot_postal_code),
				    snapshot_country_code = VALUES(snapshot_country_code),
				    snapshot_contact_name = VALUES(snapshot_contact_name),
				    snapshot_contact_email = VALUES(snapshot_contact_email),
				    snapshot_contact_phone = VALUES(snapshot_contact_phone),
				    updated_at = VALUES(updated_at),
				    updated_by = VALUES(updated_by),
				    version = VALUES(version)
				""";

		jdbcClient.sql(sql).params(parameters).update();

		// Replace lines collection
		jdbcClient.sql("DELETE FROM sales_quote_lines WHERE tenant_id = :tenantId AND quote_id = :quoteId")
				.param("tenantId", quote.tenantId().value())
				.param("quoteId", quote.id().value().toString())
				.update();

		for (QuoteLine line : quote.lines()) {
			jdbcClient.sql("""
					INSERT INTO sales_quote_lines (
					    tenant_id, id, quote_id, position, product_id, price_book_item_id,
					    sku_snapshot, product_name_snapshot, unit_snapshot, description_snapshot,
					    quantity, list_unit_price, sales_unit_price, discount_percent, tax_percent,
					    line_subtotal, line_discount, line_tax, line_total, created_at, updated_at
					) VALUES (
					    :tenantId, :id, :quoteId, :position, :productId, :priceBookItemId,
					    :sku, :prodName, :unit, :description,
					    :qty, :listPrice, :salesPrice, :discPct, :taxPct,
					    :subtotal, :discount, :tax, :total, :createdAt, :updatedAt
					)
					""")
					.param("tenantId", quote.tenantId().value())
					.param("id", line.id().toString())
					.param("quoteId", quote.id().value().toString())
					.param("position", line.position())
					.param("productId", line.productId().toString())
					.param("priceBookItemId", line.priceBookItemId().toString())
					.param("sku", line.skuSnapshot())
					.param("prodName", line.productNameSnapshot())
					.param("unit", line.unitSnapshot())
					.param("description", line.descriptionSnapshot())
					.param("qty", line.quantity())
					.param("listPrice", line.listUnitPrice())
					.param("salesPrice", line.salesUnitPrice())
					.param("discPct", line.discountPercent())
					.param("taxPct", line.taxPercent())
					.param("subtotal", line.lineSubtotal())
					.param("discount", line.lineDiscount())
					.param("tax", line.lineTax())
					.param("total", line.lineTotal())
					.param("createdAt", Timestamp.from(line.createdAt()))
					.param("updatedAt", Timestamp.from(line.updatedAt()))
					.update();
		}
	}

	@Override
	public void softDelete(TenantId tenantId, QuoteId quoteId, ActorId actorId) {
		jdbcClient.sql("""
				UPDATE sales_quotes
				SET deleted_at = :now, updated_at = :now, updated_by = :actorId
				WHERE tenant_id = :tenantId AND id = :quoteId AND deleted_at IS NULL
				""")
				.param("tenantId", tenantId.value())
				.param("quoteId", quoteId.value().toString())
				.param("actorId", actorId != null ? actorId.value() : null)
				.param("now", Timestamp.from(Instant.now()))
				.update();
	}

	@Override
	public UUID findRelatedOrderId(TenantId tenantId, QuoteId quoteId) {
		List<String> orderIds = jdbcClient.sql("""
				SELECT ord.id
				FROM sales_orders ord
				WHERE ord.tenant_id = :tenantId AND ord.quote_id = :quoteId
				LIMIT 1
				""")
				.param("tenantId", tenantId.value())
				.param("quoteId", quoteId.value().toString())
				.query(String.class)
				.list();
		return orderIds.isEmpty() ? null : UUID.fromString(orderIds.get(0));
	}

	@Override
	@Transactional
	public UUID convertToOrder(TenantId tenantId, Quote quote, ActorId actorId, Instant now) {
		UUID existing = findRelatedOrderId(tenantId, quote.id());
		if (existing != null) {
			return existing;
		}

		UUID newOrderId = UUID.randomUUID();
		String orderNumber = "SO-" + LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMM")) + "-" + newOrderId.toString().substring(0, 6).toUpperCase();

		jdbcClient.sql("""
				INSERT INTO sales_orders (
				    tenant_id, id, order_number, account_id, contact_id, opportunity_id, quote_id,
				    owner_user_id, status, currency_code, order_date, requested_delivery_date,
				    customer_reference, subtotal, discount_total, tax_total, shipping_total,
				    grand_total, confirmed_at, created_at, created_by, updated_at, updated_by, version
				) VALUES (
				    :tenantId, :id, :orderNumber, :accountId, :contactId, :opportunityId, :quoteId,
				    :ownerUserId, 'PENDING', :currencyCode, :orderDate, :deliveryDate,
				    :customerRef, :subtotal, :discountTotal, :taxTotal, :shippingTotal,
				    :grandTotal, :confirmedAt, :createdAt, :createdBy, :updatedAt, :updatedBy, 1
				)
				""")
				.param("tenantId", tenantId.value())
				.param("id", newOrderId.toString())
				.param("orderNumber", orderNumber)
				.param("accountId", quote.accountId().toString())
				.param("contactId", quote.contactId() != null ? quote.contactId().toString() : null)
				.param("opportunityId", quote.opportunityId() != null ? quote.opportunityId().toString() : null)
				.param("quoteId", quote.id().value().toString())
				.param("ownerUserId", quote.ownerUserId() != null ? quote.ownerUserId().toString() : null)
				.param("currencyCode", quote.amounts().currencyCode())
				.param("orderDate", Date.valueOf(LocalDate.now()))
				.param("deliveryDate", quote.validUntil() != null ? Date.valueOf(quote.validUntil()) : null)
				.param("customerRef", quote.customerReference())
				.param("subtotal", quote.amounts().subtotal())
				.param("discountTotal", quote.amounts().discountTotal())
				.param("taxTotal", quote.amounts().taxTotal())
				.param("shippingTotal", quote.amounts().shippingTotal())
				.param("grandTotal", quote.amounts().grandTotal())
				.param("confirmedAt", Timestamp.from(now))
				.param("createdAt", Timestamp.from(now))
				.param("createdBy", actorId != null ? actorId.value() : null)
				.param("updatedAt", Timestamp.from(now))
				.param("updatedBy", actorId != null ? actorId.value() : null)
				.update();

		return newOrderId;
	}

	private List<QuoteLine> loadLines(TenantId tenantId, QuoteId quoteId) {
		return jdbcClient.sql("""
				SELECT l.*
				FROM sales_quote_lines l
				WHERE l.tenant_id = :tenantId AND l.quote_id = :quoteId
				ORDER BY l.position ASC
				""")
				.param("tenantId", tenantId.value())
				.param("quoteId", quoteId.value().toString())
				.query((rs, rowNum) -> new QuoteLine(
						UUID.fromString(rs.getString("id")),
						quoteId,
						rs.getInt("position"),
						UUID.fromString(rs.getString("product_id")),
						UUID.fromString(rs.getString("price_book_item_id")),
						rs.getString("sku_snapshot"),
						rs.getString("product_name_snapshot"),
						rs.getString("unit_snapshot"),
						rs.getString("description_snapshot"),
						toBigDecimal(rs.getBigDecimal("quantity")),
						toBigDecimal(rs.getBigDecimal("list_unit_price")),
						toBigDecimal(rs.getBigDecimal("sales_unit_price")),
						toBigDecimal(rs.getBigDecimal("discount_percent")),
						toBigDecimal(rs.getBigDecimal("tax_percent")),
						toBigDecimal(rs.getBigDecimal("line_subtotal")),
						toBigDecimal(rs.getBigDecimal("line_discount")),
						toBigDecimal(rs.getBigDecimal("line_tax")),
						toBigDecimal(rs.getBigDecimal("line_total")),
						rs.getTimestamp("created_at").toInstant(),
						rs.getTimestamp("updated_at").toInstant()
				))
				.list();
	}

	private List<QuoteLineDetails> loadLineDetails(TenantId tenantId, QuoteId quoteId) {
		return jdbcClient.sql("""
				SELECT l.*
				FROM sales_quote_lines l
				WHERE l.tenant_id = :tenantId AND l.quote_id = :quoteId
				ORDER BY l.position ASC
				""")
				.param("tenantId", tenantId.value())
				.param("quoteId", quoteId.value().toString())
				.query((rs, rowNum) -> new QuoteLineDetails(
						UUID.fromString(rs.getString("id")),
						rs.getInt("position"),
						UUID.fromString(rs.getString("product_id")),
						UUID.fromString(rs.getString("price_book_item_id")),
						rs.getString("sku_snapshot"),
						rs.getString("product_name_snapshot"),
						rs.getString("unit_snapshot"),
						rs.getString("description_snapshot"),
						toBigDecimal(rs.getBigDecimal("quantity")),
						toBigDecimal(rs.getBigDecimal("list_unit_price")),
						toBigDecimal(rs.getBigDecimal("sales_unit_price")),
						toBigDecimal(rs.getBigDecimal("discount_percent")),
						toBigDecimal(rs.getBigDecimal("tax_percent")),
						toBigDecimal(rs.getBigDecimal("line_subtotal")),
						toBigDecimal(rs.getBigDecimal("line_discount")),
						toBigDecimal(rs.getBigDecimal("line_tax")),
						toBigDecimal(rs.getBigDecimal("line_total"))
				))
				.list();
	}

	private QuoteSummary mapQuoteSummaryRow(ResultSet rs, int rowNum) throws SQLException {
		QuoteId id = QuoteId.from(rs.getString("id"));
		String quoteNumber = rs.getString("quote_number");
		int revisionNumber = rs.getInt("revision_number");
		String name = rs.getString("name");
		if (name == null || name.isBlank()) name = quoteNumber;

		QuoteStatus storedStatus = QuoteStatus.valueOf(rs.getString("status"));
		Date validUntilDate = rs.getDate("valid_until");
		LocalDate validUntil = validUntilDate != null ? validUntilDate.toLocalDate() : null;
		QuoteStatus effectiveStatus = resolveEffectiveStatus(storedStatus, validUntil, LocalDate.now());

		String pricingModeStr = rs.getString("pricing_mode");
		boolean legacyAmountOnly = "LEGACY_AMOUNT_ONLY".equalsIgnoreCase(pricingModeStr);
		boolean latestRevision = rs.getBoolean("is_latest_revision");

		UUID accountId = UUID.fromString(rs.getString("account_id"));
		String accountName = rs.getString("account_name");
		QuoteReferenceDto accountRef = new QuoteReferenceDto(accountId, accountName != null ? accountName : "Account", true);

		String oppIdStr = rs.getString("opportunity_id");
		QuoteReferenceDto oppRef = null;
		if (oppIdStr != null) {
			String oppTitle = rs.getString("opportunity_title");
			oppRef = new QuoteReferenceDto(UUID.fromString(oppIdStr), oppTitle != null ? oppTitle : "Opportunity", true);
		}

		String ownerUserIdStr = rs.getString("owner_user_id");
		String ownerTeamIdStr = rs.getString("owner_team_id");
		QuoteOwnerReferenceDto ownerRef = null;
		if (ownerUserIdStr != null) {
			String ownerName = rs.getString("owner_user_name");
			ownerRef = new QuoteOwnerReferenceDto("USER", UUID.fromString(ownerUserIdStr), ownerName != null ? ownerName : "User");
		} else if (ownerTeamIdStr != null) {
			ownerRef = new QuoteOwnerReferenceDto("TEAM", UUID.fromString(ownerTeamIdStr), "Team");
		}

		QuoteAmounts amounts = new QuoteAmounts(
				rs.getString("currency_code"),
				toBigDecimal(rs.getBigDecimal("subtotal")),
				toBigDecimal(rs.getBigDecimal("discount_total")),
				toBigDecimal(rs.getBigDecimal("tax_total")),
				toBigDecimal(rs.getBigDecimal("shipping_total")),
				toBigDecimal(rs.getBigDecimal("grand_total"))
		);

		Date issueDateSql = rs.getDate("issue_date");
		LocalDate issueDate = issueDateSql != null ? issueDateSql.toLocalDate() : LocalDate.now();

		List<QuoteAction> actions = resolveAvailableActions(storedStatus, effectiveStatus, latestRevision, legacyAmountOnly);

		return new QuoteSummary(
				id,
				quoteNumber,
				revisionNumber,
				name,
				latestRevision,
				legacyAmountOnly,
				effectiveStatus,
				accountRef,
				oppRef,
				ownerRef,
				amounts,
				rs.getInt("lines_count"),
				issueDate,
				validUntil,
				rs.getTimestamp("updated_at").toInstant(),
				rs.getLong("version"),
				actions
		);
	}

	private QuoteDetails mapQuoteDetails(Map<String, Object> r, List<QuoteLineDetails> lines) {
		QuoteId id = QuoteId.from(String.valueOf(r.get("id")));
		String quoteNumber = String.valueOf(r.get("quote_number"));
		int revisionNumber = ((Number) r.get("revision_number")).intValue();
		String name = r.get("name") != null ? String.valueOf(r.get("name")) : quoteNumber;

		QuoteStatus storedStatus = QuoteStatus.valueOf(String.valueOf(r.get("status")));
		LocalDate validUntil = r.get("valid_until") != null ? ((java.sql.Date) r.get("valid_until")).toLocalDate() : null;
		QuoteStatus effectiveStatus = resolveEffectiveStatus(storedStatus, validUntil, LocalDate.now());

		String pricingModeStr = r.get("pricing_mode") != null ? String.valueOf(r.get("pricing_mode")) : "LINE_ITEM";
		QuotePricingMode pricingMode = "LEGACY_AMOUNT_ONLY".equalsIgnoreCase(pricingModeStr) ? QuotePricingMode.LEGACY_AMOUNT_ONLY : QuotePricingMode.LINE_ITEM;
		boolean legacyAmountOnly = pricingMode == QuotePricingMode.LEGACY_AMOUNT_ONLY;
		boolean latestRevision = Boolean.TRUE.equals(r.get("is_latest_revision"));

		UUID accountId = UUID.fromString(String.valueOf(r.get("account_id")));
		String accountName = r.get("account_name") != null ? String.valueOf(r.get("account_name")) : "Account";
		QuoteReferenceDto accountRef = new QuoteReferenceDto(accountId, accountName, true);

		QuoteReferenceDto contactRef = null;
		if (r.get("contact_id") != null) {
			String fn = r.get("contact_first_name") != null ? String.valueOf(r.get("contact_first_name")) : "";
			String ln = r.get("contact_last_name") != null ? String.valueOf(r.get("contact_last_name")) : "";
			String cName = (fn + " " + ln).trim();
			contactRef = new QuoteReferenceDto(UUID.fromString(String.valueOf(r.get("contact_id"))), cName.isEmpty() ? "Contact" : cName, true);
		}

		QuoteReferenceDto oppRef = null;
		if (r.get("opportunity_id") != null) {
			String oppTitle = r.get("opportunity_title") != null ? String.valueOf(r.get("opportunity_title")) : "Opportunity";
			oppRef = new QuoteReferenceDto(UUID.fromString(String.valueOf(r.get("opportunity_id"))), oppTitle, true);
		}

		QuoteReferenceDto pbRef = null;
		if (r.get("price_book_id") != null) {
			String pbName = r.get("price_book_name") != null ? String.valueOf(r.get("price_book_name")) : "Price Book";
			pbRef = new QuoteReferenceDto(UUID.fromString(String.valueOf(r.get("price_book_id"))), pbName, true);
		}

		QuoteOwnerReferenceDto ownerRef = null;
		if (r.get("owner_user_id") != null) {
			String uName = r.get("owner_user_name") != null ? String.valueOf(r.get("owner_user_name")) : "User";
			ownerRef = new QuoteOwnerReferenceDto("USER", UUID.fromString(String.valueOf(r.get("owner_user_id"))), uName);
		} else if (r.get("owner_team_id") != null) {
			ownerRef = new QuoteOwnerReferenceDto("TEAM", UUID.fromString(String.valueOf(r.get("owner_team_id"))), "Team");
		}

		QuoteAmounts amounts = new QuoteAmounts(
				String.valueOf(r.get("currency_code")),
				toBigDecimal((BigDecimal) r.get("subtotal")),
				toBigDecimal((BigDecimal) r.get("discount_total")),
				toBigDecimal((BigDecimal) r.get("tax_total")),
				toBigDecimal((BigDecimal) r.get("shipping_total")),
				toBigDecimal((BigDecimal) r.get("grand_total"))
		);

		QuoteCustomerSnapshot customerSnapshot = new QuoteCustomerSnapshot(
				r.get("snapshot_legal_name") != null ? String.valueOf(r.get("snapshot_legal_name")) : accountName,
				r.get("snapshot_address_line1") != null ? String.valueOf(r.get("snapshot_address_line1")) : null,
				r.get("snapshot_address_line2") != null ? String.valueOf(r.get("snapshot_address_line2")) : null,
				r.get("snapshot_locality") != null ? String.valueOf(r.get("snapshot_locality")) : null,
				r.get("snapshot_region") != null ? String.valueOf(r.get("snapshot_region")) : null,
				r.get("snapshot_postal_code") != null ? String.valueOf(r.get("snapshot_postal_code")) : null,
				r.get("snapshot_country_code") != null ? String.valueOf(r.get("snapshot_country_code")) : null,
				r.get("snapshot_contact_name") != null ? String.valueOf(r.get("snapshot_contact_name")) : (contactRef != null ? contactRef.label() : null),
				r.get("snapshot_contact_email") != null ? String.valueOf(r.get("snapshot_contact_email")) : null,
				r.get("snapshot_contact_phone") != null ? String.valueOf(r.get("snapshot_contact_phone")) : null
		);

		LocalDate issueDate = r.get("issue_date") != null ? ((java.sql.Date) r.get("issue_date")).toLocalDate() : LocalDate.now();
		UUID previousQuoteId = r.get("previous_quote_id") != null ? UUID.fromString(String.valueOf(r.get("previous_quote_id"))) : null;
		UUID relatedOrderId = r.get("related_order_id") != null ? UUID.fromString(String.valueOf(r.get("related_order_id"))) : null;

		List<QuoteAction> actions = resolveAvailableActions(storedStatus, effectiveStatus, latestRevision, legacyAmountOnly);

		return new QuoteDetails(
				TenantId.from(String.valueOf(r.get("tenant_id"))),
				id,
				quoteNumber,
				revisionNumber,
				previousQuoteId,
				name,
				latestRevision,
				legacyAmountOnly,
				effectiveStatus,
				storedStatus,
				pricingMode,
				accountRef,
				contactRef,
				oppRef,
				pbRef,
				ownerRef,
				amounts,
				customerSnapshot,
				lines,
				(BigDecimal) r.get("exchange_rate_to_tenant_currency"),
				issueDate,
				validUntil,
				r.get("payment_terms") != null ? String.valueOf(r.get("payment_terms")) : null,
				r.get("delivery_terms") != null ? String.valueOf(r.get("delivery_terms")) : null,
				r.get("customer_reference") != null ? String.valueOf(r.get("customer_reference")) : null,
				r.get("notes") != null ? String.valueOf(r.get("notes")) : null,
				toInstant(r.get("approved_at")),
				r.get("approved_by") != null ? ActorId.from(String.valueOf(r.get("approved_by"))) : null,
				toInstant(r.get("sent_at")),
				toInstant(r.get("accepted_at")),
				toInstant(r.get("rejected_at")),
				toInstant(r.get("cancelled_at")),
				relatedOrderId,
				actions,
				toInstant(r.get("created_at")),
				r.get("created_by") != null ? ActorId.from(String.valueOf(r.get("created_by"))) : null,
				toInstant(r.get("updated_at")),
				r.get("updated_by") != null ? ActorId.from(String.valueOf(r.get("updated_by"))) : null,
				((Number) r.get("version")).longValue()
		);
	}

	private Quote mapQuoteFromRow(TenantId tenantId, Map<String, Object> r) {
		return reconstituteFullQuote(tenantId, r, Collections.emptyList());
	}

	private Quote reconstituteFullQuote(TenantId tenantId, Map<String, Object> r, List<QuoteLine> lines) {
		QuoteId id = QuoteId.from(String.valueOf(r.get("id")));
		String quoteNumber = String.valueOf(r.get("quote_number"));
		int revisionNumber = ((Number) r.get("revision_number")).intValue();
		UUID previousQuoteId = r.get("previous_quote_id") != null ? UUID.fromString(String.valueOf(r.get("previous_quote_id"))) : null;
		String name = r.get("name") != null ? String.valueOf(r.get("name")) : quoteNumber;
		UUID accountId = UUID.fromString(String.valueOf(r.get("account_id")));
		UUID contactId = r.get("contact_id") != null ? UUID.fromString(String.valueOf(r.get("contact_id"))) : null;
		UUID opportunityId = r.get("opportunity_id") != null ? UUID.fromString(String.valueOf(r.get("opportunity_id"))) : null;
		UUID priceBookId = r.get("price_book_id") != null ? UUID.fromString(String.valueOf(r.get("price_book_id"))) : null;
		UUID ownerUserId = r.get("owner_user_id") != null ? UUID.fromString(String.valueOf(r.get("owner_user_id"))) : null;
		UUID ownerTeamId = r.get("owner_team_id") != null ? UUID.fromString(String.valueOf(r.get("owner_team_id"))) : null;
		QuoteStatus status = QuoteStatus.valueOf(String.valueOf(r.get("status")));
		String pricingModeStr = r.get("pricing_mode") != null ? String.valueOf(r.get("pricing_mode")) : "LINE_ITEM";
		QuotePricingMode pricingMode = "LEGACY_AMOUNT_ONLY".equalsIgnoreCase(pricingModeStr) ? QuotePricingMode.LEGACY_AMOUNT_ONLY : QuotePricingMode.LINE_ITEM;

		QuoteAmounts amounts = new QuoteAmounts(
				String.valueOf(r.get("currency_code")),
				toBigDecimal((BigDecimal) r.get("subtotal")),
				toBigDecimal((BigDecimal) r.get("discount_total")),
				toBigDecimal((BigDecimal) r.get("tax_total")),
				toBigDecimal((BigDecimal) r.get("shipping_total")),
				toBigDecimal((BigDecimal) r.get("grand_total"))
		);

		QuoteCustomerSnapshot customerSnapshot = new QuoteCustomerSnapshot(
				r.get("snapshot_legal_name") != null ? String.valueOf(r.get("snapshot_legal_name")) : name,
				r.get("snapshot_address_line1") != null ? String.valueOf(r.get("snapshot_address_line1")) : null,
				r.get("snapshot_address_line2") != null ? String.valueOf(r.get("snapshot_address_line2")) : null,
				r.get("snapshot_locality") != null ? String.valueOf(r.get("snapshot_locality")) : null,
				r.get("snapshot_region") != null ? String.valueOf(r.get("snapshot_region")) : null,
				r.get("snapshot_postal_code") != null ? String.valueOf(r.get("snapshot_postal_code")) : null,
				r.get("snapshot_country_code") != null ? String.valueOf(r.get("snapshot_country_code")) : null,
				r.get("snapshot_contact_name") != null ? String.valueOf(r.get("snapshot_contact_name")) : null,
				r.get("snapshot_contact_email") != null ? String.valueOf(r.get("snapshot_contact_email")) : null,
				r.get("snapshot_contact_phone") != null ? String.valueOf(r.get("snapshot_contact_phone")) : null
		);

		LocalDate issueDate = r.get("issue_date") != null ? ((java.sql.Date) r.get("issue_date")).toLocalDate() : LocalDate.now();
		LocalDate validUntil = r.get("valid_until") != null ? ((java.sql.Date) r.get("valid_until")).toLocalDate() : null;

		return new Quote(
				tenantId,
				id,
				quoteNumber,
				revisionNumber,
				previousQuoteId,
				name,
				accountId,
				contactId,
				opportunityId,
				priceBookId,
				ownerUserId,
				ownerTeamId,
				status,
				pricingMode,
				amounts,
				customerSnapshot,
				lines,
				(BigDecimal) r.get("exchange_rate_to_tenant_currency"),
				issueDate,
				validUntil,
				r.get("payment_terms") != null ? String.valueOf(r.get("payment_terms")) : null,
				r.get("delivery_terms") != null ? String.valueOf(r.get("delivery_terms")) : null,
				r.get("customer_reference") != null ? String.valueOf(r.get("customer_reference")) : null,
				r.get("notes") != null ? String.valueOf(r.get("notes")) : null,
				toInstant(r.get("approved_at")),
				r.get("approved_by") != null ? ActorId.from(String.valueOf(r.get("approved_by"))) : null,
				toInstant(r.get("sent_at")),
				toInstant(r.get("accepted_at")),
				toInstant(r.get("rejected_at")),
				toInstant(r.get("cancelled_at")),
				toInstant(r.get("created_at")),
				r.get("created_by") != null ? ActorId.from(String.valueOf(r.get("created_by"))) : null,
				toInstant(r.get("updated_at")),
				r.get("updated_by") != null ? ActorId.from(String.valueOf(r.get("updated_by"))) : null,
				((Number) r.get("version")).longValue()
		);
	}

	private void appendSearchFilters(StringBuilder criteria, Map<String, Object> parameters, QuoteSearchQuery query) {
		if (query.q() != null && !query.q().trim().isEmpty()) {
			String pattern = "%" + query.q().trim().toLowerCase() + "%";
			criteria.append("""
					  AND (
					      LOWER(q.quote_number) LIKE :qPattern
					      OR LOWER(COALESCE(q.name, '')) LIKE :qPattern
					      OR LOWER(COALESCE(q.customer_reference, '')) LIKE :qPattern
					      OR LOWER(COALESCE(q.snapshot_legal_name, '')) LIKE :qPattern
					      OR LOWER(COALESCE(a.name, '')) LIKE :qPattern
					  )
					""");
			parameters.put("qPattern", pattern);
		}

		if (query.statuses() != null && !query.statuses().isEmpty()) {
			List<String> statusNames = new ArrayList<>();
			boolean includeExpired = false;
			for (QuoteStatus s : query.statuses()) {
				if (s == QuoteStatus.EXPIRED) {
					includeExpired = true;
				} else {
					statusNames.add(s.name());
				}
			}
			LocalDate today = LocalDate.now();
			parameters.put("todayDateFilter", Date.valueOf(today));

			if (includeExpired && statusNames.isEmpty()) {
				criteria.append(" AND (q.status = 'SENT' AND q.valid_until < :todayDateFilter)");
			} else if (includeExpired) {
				criteria.append(" AND (q.status IN (:statusList) OR (q.status = 'SENT' AND q.valid_until < :todayDateFilter))");
				parameters.put("statusList", statusNames);
			} else {
				criteria.append(" AND (q.status IN (:statusList) AND NOT (q.status = 'SENT' AND q.valid_until < :todayDateFilter))");
				parameters.put("statusList", statusNames);
			}
		}

		if (query.accountId() != null) {
			criteria.append(" AND q.account_id = :filterAccountId");
			parameters.put("filterAccountId", query.accountId().toString());
		}

		if (query.opportunityId() != null) {
			criteria.append(" AND q.opportunity_id = :filterOpportunityId");
			parameters.put("filterOpportunityId", query.opportunityId().toString());
		}

		if (query.ownerType() != null && query.ownerId() != null) {
			if ("TEAM".equalsIgnoreCase(query.ownerType())) {
				criteria.append(" AND q.owner_team_id = :filterOwnerTeamId");
				parameters.put("filterOwnerTeamId", query.ownerId().toString());
			} else {
				criteria.append(" AND q.owner_user_id = :filterOwnerUserId");
				parameters.put("filterOwnerUserId", query.ownerId().toString());
			}
		}

		if (query.currencyCode() != null && !query.currencyCode().trim().isEmpty()) {
			criteria.append(" AND q.currency_code = :filterCurrency");
			parameters.put("filterCurrency", query.currencyCode().trim().toUpperCase());
		}

		LocalDate today = LocalDate.now();
		if ("EXPIRING_SOON".equalsIgnoreCase(query.validity())) {
			criteria.append(" AND q.status = 'SENT' AND q.valid_until >= :validToday AND q.valid_until <= :validNext7");
			parameters.put("validToday", Date.valueOf(today));
			parameters.put("validNext7", Date.valueOf(today.plusDays(7)));
		} else if ("EXPIRED".equalsIgnoreCase(query.validity())) {
			criteria.append(" AND q.status = 'SENT' AND q.valid_until < :validExpiredToday");
			parameters.put("validExpiredToday", Date.valueOf(today));
		} else if ("ACTIVE".equalsIgnoreCase(query.validity())) {
			criteria.append(" AND (q.valid_until IS NULL OR q.valid_until >= :validActiveToday)");
			parameters.put("validActiveToday", Date.valueOf(today));
		}

		if (query.issueFrom() != null) {
			criteria.append(" AND q.issue_date >= :issueFrom");
			parameters.put("issueFrom", Date.valueOf(query.issueFrom()));
		}
		if (query.issueTo() != null) {
			criteria.append(" AND q.issue_date <= :issueTo");
			parameters.put("issueTo", Date.valueOf(query.issueTo()));
		}
		if (query.validFrom() != null) {
			criteria.append(" AND q.valid_until >= :validFrom");
			parameters.put("validFrom", Date.valueOf(query.validFrom()));
		}
		if (query.validTo() != null) {
			criteria.append(" AND q.valid_until <= :validTo");
			parameters.put("validTo", Date.valueOf(query.validTo()));
		}

		if (query.latestOnly()) {
			criteria.append("""
					  AND (NOT EXISTS (
					      SELECT 1 FROM sales_quotes q_next
					      WHERE q_next.tenant_id = q.tenant_id
					        AND q_next.previous_quote_id = q.id
					        AND q_next.deleted_at IS NULL
					  ))
					""");
		}
	}

	private String resolveSortColumn(String sort) {
		if ("validUntil".equalsIgnoreCase(sort)) return "q.valid_until";
		if ("grandTotal".equalsIgnoreCase(sort)) return "q.grand_total";
		if ("quoteNumber".equalsIgnoreCase(sort)) return "q.quote_number";
		return "q.updated_at";
	}

	private QuoteStatus resolveEffectiveStatus(QuoteStatus status, LocalDate validUntil, LocalDate today) {
		if (status == QuoteStatus.SENT && validUntil != null && validUntil.isBefore(today)) {
			return QuoteStatus.EXPIRED;
		}
		return status;
	}

	private List<QuoteAction> resolveAvailableActions(QuoteStatus storedStatus, QuoteStatus effectiveStatus,
			boolean latestRevision, boolean legacyAmountOnly) {
		List<QuoteAction> actions = new ArrayList<>();
		actions.add(QuoteAction.PRINT);

		if (!latestRevision) {
			return actions;
		}

		if (legacyAmountOnly) {
			if (storedStatus == QuoteStatus.APPROVED || storedStatus == QuoteStatus.SENT || storedStatus == QuoteStatus.REJECTED || effectiveStatus == QuoteStatus.EXPIRED) {
				actions.add(QuoteAction.REVISE);
			}
			return actions;
		}

		switch (storedStatus) {
			case DRAFT -> {
				actions.add(QuoteAction.EDIT_DRAFT);
				actions.add(QuoteAction.SUBMIT);
				actions.add(QuoteAction.DELETE_DRAFT);
			}
			case PENDING_APPROVAL -> {
				actions.add(QuoteAction.APPROVE);
				actions.add(QuoteAction.REQUEST_CHANGES);
				actions.add(QuoteAction.CANCEL);
			}
			case APPROVED -> {
				actions.add(QuoteAction.MARK_SENT);
				actions.add(QuoteAction.CANCEL);
				actions.add(QuoteAction.REVISE);
			}
			case SENT -> {
				if (effectiveStatus == QuoteStatus.EXPIRED) {
					actions.add(QuoteAction.REVISE);
				} else {
					actions.add(QuoteAction.ACCEPT);
					actions.add(QuoteAction.REJECT);
					actions.add(QuoteAction.CANCEL);
					actions.add(QuoteAction.REVISE);
				}
			}
			case ACCEPTED -> {
				actions.add(QuoteAction.CREATE_ORDER);
			}
			case REJECTED -> {
				actions.add(QuoteAction.REVISE);
			}
			case EXPIRED -> {
				actions.add(QuoteAction.REVISE);
			}
			case CANCELLED, SUPERSEDED -> {
				// No lifecycle actions
			}
		}
		return actions;
	}

	private static BigDecimal toBigDecimal(BigDecimal val) {
		return val != null ? val : BigDecimal.ZERO.setScale(6, RoundingMode.HALF_UP);
	}

	private static Instant toInstant(Object obj) {
		if (obj instanceof Timestamp ts) return ts.toInstant();
		if (obj instanceof java.util.Date d) return d.toInstant();
		return null;
	}

	private static UUID tryParseUUID(String val) {
		try {
			return UUID.fromString(val);
		} catch (Exception e) {
			return null;
		}
	}
}
