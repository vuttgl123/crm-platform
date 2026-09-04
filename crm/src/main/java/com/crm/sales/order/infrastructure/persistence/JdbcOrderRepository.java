package com.crm.sales.order.infrastructure.persistence;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.Instant;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;

import com.crm.foundation.persistence.OwnershipScopeSql;
import com.crm.foundation.security.AuthorizedDataAccess;
import com.crm.sales.order.application.dto.OrderOwnerReferenceDto;
import com.crm.sales.order.application.dto.OrderPulseCurrencyGroupDto;
import com.crm.sales.order.application.dto.OrderPulseDto;
import com.crm.sales.order.application.dto.OrderReferenceDto;
import com.crm.sales.order.application.dto.OrderStatsDto;
import com.crm.sales.order.application.dto.OrderSummary;
import com.crm.sales.order.application.port.OrderRepository;
import com.crm.sales.order.application.query.OrderSearchQuery;
import com.crm.sales.order.domain.Order;
import com.crm.sales.order.domain.OrderAddressSnapshot;
import com.crm.sales.order.domain.OrderAmounts;
import com.crm.sales.order.domain.OrderFulfillmentEvent;
import com.crm.sales.order.domain.OrderFulfillmentEventLine;
import com.crm.sales.order.domain.OrderFulfillmentStatus;
import com.crm.sales.order.domain.OrderId;
import com.crm.sales.order.domain.OrderLine;
import com.crm.sales.order.domain.OrderPricingMode;
import com.crm.sales.order.domain.OrderSourceType;
import com.crm.sales.order.domain.OrderStatus;
import com.crm.sales.order.domain.OrderStatusHistoryEntry;
import com.crm.sharedkernel.application.PageResult;
import com.crm.sharedkernel.domain.ActorId;
import com.crm.sharedkernel.domain.TenantId;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public class JdbcOrderRepository implements OrderRepository, InitializingBean {

	private final JdbcClient jdbcClient;

	public JdbcOrderRepository(JdbcClient jdbcClient) {
		this.jdbcClient = jdbcClient;
	}

	@Override
	public void afterPropertiesSet() {
		initTablesAndColumns();
	}

	private void initTablesAndColumns() {
		try {
			jdbcClient.sql("""
					CREATE TABLE IF NOT EXISTS sales_order_fulfillment_events (
					    tenant_id VARCHAR(64) NOT NULL,
					    id VARCHAR(64) NOT NULL,
					    order_id VARCHAR(64) NOT NULL,
					    event_number VARCHAR(64) NOT NULL,
					    reference_number VARCHAR(128),
					    fulfillment_date DATE,
					    note TEXT,
					    status VARCHAR(32) NOT NULL,
					    occurred_at TIMESTAMP NOT NULL,
					    recorded_by VARCHAR(64),
					    voided_at TIMESTAMP,
					    voided_by VARCHAR(64),
					    void_reason TEXT,
					    version BIGINT NOT NULL DEFAULT 1,
					    PRIMARY KEY (tenant_id, id)
					)
					""").update();

			jdbcClient.sql("""
					CREATE TABLE IF NOT EXISTS sales_order_fulfillment_event_lines (
					    tenant_id VARCHAR(64) NOT NULL,
					    id VARCHAR(64) NOT NULL,
					    fulfillment_id VARCHAR(64) NOT NULL,
					    order_line_id VARCHAR(64) NOT NULL,
					    quantity DECIMAL(20, 6) NOT NULL,
					    PRIMARY KEY (tenant_id, id)
					)
					""").update();

			jdbcClient.sql("""
					CREATE TABLE IF NOT EXISTS sales_order_status_history (
					    tenant_id VARCHAR(64) NOT NULL,
					    id VARCHAR(64) NOT NULL,
					    order_id VARCHAR(64) NOT NULL,
					    changed_at TIMESTAMP NOT NULL,
					    changed_by VARCHAR(64),
					    action VARCHAR(64) NOT NULL,
					    from_status VARCHAR(32),
					    to_status VARCHAR(32) NOT NULL,
					    notes TEXT,
					    PRIMARY KEY (tenant_id, id)
					)
					""").update();
		} catch (Exception ignored) {}

		// Safe column additions for legacy tables
		String[] alterColumns = {
				"ALTER TABLE sales_orders ADD COLUMN IF NOT EXISTS source_type VARCHAR(32) DEFAULT 'DIRECT'",
				"ALTER TABLE sales_orders ADD COLUMN IF NOT EXISTS pricing_mode VARCHAR(32) DEFAULT 'LINE_ITEM'",
				"ALTER TABLE sales_orders ADD COLUMN IF NOT EXISTS price_book_id VARCHAR(64)",
				"ALTER TABLE sales_orders ADD COLUMN IF NOT EXISTS owner_team_id VARCHAR(64)",
				"ALTER TABLE sales_orders ADD COLUMN IF NOT EXISTS payment_terms VARCHAR(255)",
				"ALTER TABLE sales_orders ADD COLUMN IF NOT EXISTS delivery_terms VARCHAR(255)",
				"ALTER TABLE sales_orders ADD COLUMN IF NOT EXISTS notes TEXT",
				"ALTER TABLE sales_orders ADD COLUMN IF NOT EXISTS confirmed_by VARCHAR(64)",
				"ALTER TABLE sales_orders ADD COLUMN IF NOT EXISTS cancelled_by VARCHAR(64)",
				"ALTER TABLE sales_orders ADD COLUMN IF NOT EXISTS closed_at TIMESTAMP",
				"ALTER TABLE sales_orders ADD COLUMN IF NOT EXISTS closed_by VARCHAR(64)",
				"ALTER TABLE sales_orders ADD COLUMN IF NOT EXISTS closed_reason TEXT",
				"ALTER TABLE sales_order_items ADD COLUMN IF NOT EXISTS discount_percent DECIMAL(20,6) DEFAULT 0",
				"ALTER TABLE sales_order_items ADD COLUMN IF NOT EXISTS tax_percent DECIMAL(20,6) DEFAULT 0"
		};

		for (String sql : alterColumns) {
			try {
				jdbcClient.sql(sql).update();
			} catch (Exception ignored) {}
		}
	}

	@Override
	public String generateOrderNumber(TenantId tenantId) {
		String prefix = "ORD-" + LocalDate.now().format(DateTimeFormatter.ofPattern("yyMM")) + "-";
		Long count = jdbcClient.sql("SELECT COUNT(*) FROM sales_orders WHERE tenant_id = :t AND order_number LIKE :p")
				.param("t", tenantId.toString())
				.param("p", prefix + "%")
				.query(Long.class)
				.single();
		long next = (count != null ? count : 0) + 1;
		return String.format("%s%04d", prefix, next);
	}

	@Override
	public String generateFulfillmentEventNumber(TenantId tenantId, OrderId orderId) {
		String prefix = "FUL-" + LocalDate.now().format(DateTimeFormatter.ofPattern("yyMM")) + "-";
		Long count = jdbcClient.sql("SELECT COUNT(*) FROM sales_order_fulfillment_events WHERE tenant_id = :t AND event_number LIKE :p")
				.param("t", tenantId.toString())
				.param("p", prefix + "%")
				.query(Long.class)
				.single();
		long next = (count != null ? count : 0) + 1;
		return String.format("%s%04d", prefix, next);
	}

	@Override
	public Optional<Order> findById(TenantId tenantId, OrderId orderId,
			ActorId actorId, AuthorizedDataAccess access) {
		OwnershipScopeSql scope = OwnershipScopeSql.resolve(actorId, access);
		Map<String, Object> parameters = new HashMap<>(scope.parameters());
		parameters.put("tenantId", tenantId.toString());
		parameters.put("orderId", orderId.toString());

		String sql = scope.cte() + """
				SELECT o.*
				FROM sales_orders o
				WHERE o.tenant_id = :tenantId
				  AND o.id = :orderId
				  AND (%s)
				""".formatted(scope.predicate("o"));

		return jdbcClient.sql(sql)
				.params(parameters)
				.query((rs, rowNum) -> mapOrderRow(tenantId, rs))
				.optional();
	}

	@Override
	public PageResult<OrderSummary> search(TenantId tenantId,
			ActorId actorId, OrderSearchQuery query,
			AuthorizedDataAccess access) {
		OwnershipScopeSql scope = OwnershipScopeSql.resolve(actorId, access);
		Map<String, Object> parameters = new HashMap<>(scope.parameters());
		parameters.put("tenantId", tenantId.toString());

		StringBuilder criteria = new StringBuilder(" WHERE o.tenant_id = :tenantId ");

		if (query.search() != null && !query.search().isBlank()) {
			parameters.put("searchParam", "%" + query.search().trim().toLowerCase() + "%");
			criteria.append(" AND (LOWER(o.order_number) LIKE :searchParam OR LOWER(COALESCE(o.customer_reference, '')) LIKE :searchParam) ");
		}
		if (query.accountId() != null) {
			parameters.put("accountIdParam", query.accountId().toString());
			criteria.append(" AND o.account_id = :accountIdParam ");
		}
		if (query.contactId() != null) {
			parameters.put("contactIdParam", query.contactId().toString());
			criteria.append(" AND o.contact_id = :contactIdParam ");
		}
		if (query.opportunityId() != null) {
			parameters.put("opportunityIdParam", query.opportunityId().toString());
			criteria.append(" AND o.opportunity_id = :opportunityIdParam ");
		}
		if (query.quoteId() != null) {
			parameters.put("quoteIdParam", query.quoteId().toString());
			criteria.append(" AND o.quote_id = :quoteIdParam ");
		}
		if (query.status() != null) {
			parameters.put("statusParam", query.status().name());
			criteria.append(" AND o.status = :statusParam ");
		}
		if (query.statuses() != null && !query.statuses().isEmpty()) {
			List<String> statusNames = query.statuses().stream().map(Enum::name).toList();
			criteria.append(" AND o.status IN (");
			for (int i = 0; i < statusNames.size(); i++) {
				if (i > 0) criteria.append(", ");
				String pName = "statusListParam" + i;
				criteria.append(":").append(pName);
				parameters.put(pName, statusNames.get(i));
			}
			criteria.append(") ");
		}
		if (query.ownerId() != null) {
			if ("TEAM".equalsIgnoreCase(query.ownerType())) {
				parameters.put("ownerTeamParam", query.ownerId().toString());
				criteria.append(" AND o.owner_team_id = :ownerTeamParam ");
			} else {
				parameters.put("ownerUserParam", query.ownerId().toString());
				criteria.append(" AND o.owner_user_id = :ownerUserParam ");
			}
		}
		if (query.fromDate() != null) {
			parameters.put("fromDateParam", query.fromDate().toString());
			criteria.append(" AND o.order_date >= :fromDateParam ");
		}
		if (query.toDate() != null) {
			parameters.put("toDateParam", query.toDate().toString());
			criteria.append(" AND o.order_date <= :toDateParam ");
		}
		if (query.currencyCode() != null && !query.currencyCode().isBlank()) {
			parameters.put("currParam", query.currencyCode().trim().toUpperCase());
			criteria.append(" AND o.currency_code = :currParam ");
		}

		criteria.append(" AND (").append(scope.predicate("o")).append(") ");

		String countSql = scope.cte() + "SELECT COUNT(*) FROM sales_orders o " + criteria;
		Long total = jdbcClient.sql(countSql)
				.params(parameters)
				.query(Long.class)
				.single();

		long totalElements = total != null ? total : 0;
		int pageSize = query.pageQuery() != null ? query.pageQuery().size() : 20;
		int pageNumber = query.pageQuery() != null ? query.pageQuery().page() : 0;
		int offset = pageNumber * pageSize;

		parameters.put("pageSize", pageSize);
		parameters.put("pageOffset", offset);

		String selectSql = scope.cte() + """
				SELECT o.id, o.order_number, o.source_type, o.pricing_mode, o.status,
				       o.account_id, o.opportunity_id, o.quote_id,
				       o.owner_user_id, o.owner_team_id,
				       o.currency_code, o.subtotal, o.discount_total, o.tax_total, o.shipping_total, o.grand_total,
				       o.order_date, o.requested_delivery_date, o.updated_at, o.version,
				       COALESCE(a.display_name, a.legal_name, 'Account') AS account_name,
				       opp.name AS opportunity_name,
				       q.quote_number AS quote_number,
				       u.display_name AS owner_user_name,
				       t.name AS owner_team_name,
				       (SELECT COUNT(*) FROM sales_order_items oi WHERE oi.tenant_id = o.tenant_id AND oi.order_id = o.id) AS item_count,
				       (SELECT COALESCE(SUM(oi.quantity), 0) FROM sales_order_items oi WHERE oi.tenant_id = o.tenant_id AND oi.order_id = o.id) AS total_ordered_qty,
				       (SELECT COALESCE(SUM(oi.fulfilled_quantity), 0) FROM sales_order_items oi WHERE oi.tenant_id = o.tenant_id AND oi.order_id = o.id) AS total_fulfilled_qty
				FROM sales_orders o
				LEFT JOIN crm_accounts a ON a.tenant_id = o.tenant_id AND a.id = o.account_id
				LEFT JOIN crm_opportunities opp ON opp.tenant_id = o.tenant_id AND opp.id = o.opportunity_id
				LEFT JOIN sales_quotes q ON q.tenant_id = o.tenant_id AND q.id = o.quote_id
				LEFT JOIN platform_users u ON u.id = o.owner_user_id
				LEFT JOIN platform_teams t ON t.tenant_id = o.tenant_id AND t.id = o.owner_team_id
				""" + criteria + """
				ORDER BY o.updated_at DESC, o.id DESC
				LIMIT :pageSize OFFSET :pageOffset
				""";

		List<OrderSummary> items = jdbcClient.sql(selectSql)
				.params(parameters)
				.query((rs, rowNum) -> mapSummaryRow(rs))
				.list();

		int totalPages = (int) Math.ceil((double) totalElements / pageSize);
		return new PageResult<>(items, pageNumber, pageSize, totalElements, totalPages);
	}

	@Override
	public OrderPulseDto getPulse(TenantId tenantId, ActorId actorId, AuthorizedDataAccess access) {
		OwnershipScopeSql scope = OwnershipScopeSql.resolve(actorId, access);
		Map<String, Object> parameters = new HashMap<>(scope.parameters());
		parameters.put("tenantId", tenantId.toString());

		String sql = scope.cte() + """
				SELECT o.currency_code,
				       COUNT(CASE WHEN o.status = 'DRAFT' THEN 1 END) AS draft_count,
				       COUNT(CASE WHEN o.status = 'CONFIRMED' THEN 1 END) AS confirmed_count,
				       COALESCE(SUM(CASE WHEN o.status = 'PROCESSING' THEN o.grand_total ELSE 0 END), 0) AS processing_total,
				       COUNT(CASE WHEN o.status = 'PROCESSING' THEN 1 END) AS processing_count,
				       COALESCE(SUM(CASE WHEN o.status = 'PARTIALLY_FULFILLED' THEN o.grand_total ELSE 0 END), 0) AS partially_fulfilled_total,
				       COUNT(CASE WHEN o.status = 'PARTIALLY_FULFILLED' THEN 1 END) AS partially_fulfilled_count,
				       COALESCE(SUM(CASE WHEN o.status = 'FULFILLED' THEN o.grand_total ELSE 0 END), 0) AS fulfilled_total,
				       COUNT(CASE WHEN o.status = 'FULFILLED' THEN 1 END) AS fulfilled_count,
				       COUNT(CASE WHEN o.status = 'CLOSED_PARTIAL' THEN 1 END) AS closed_partial_count,
				       COUNT(CASE WHEN o.status = 'CANCELLED' THEN 1 END) AS cancelled_count
				FROM sales_orders o
				WHERE o.tenant_id = :tenantId
				  AND (%s)
				GROUP BY o.currency_code
				ORDER BY o.currency_code ASC
				""".formatted(scope.predicate("o"));

		List<OrderPulseCurrencyGroupDto> groups = jdbcClient.sql(sql)
				.params(parameters)
				.query((rs, rowNum) -> new OrderPulseCurrencyGroupDto(
						rs.getString("currency_code"),
						rs.getLong("draft_count"),
						rs.getLong("confirmed_count"),
						rs.getBigDecimal("processing_total"),
						rs.getLong("processing_count"),
						rs.getBigDecimal("partially_fulfilled_total"),
						rs.getLong("partially_fulfilled_count"),
						rs.getBigDecimal("fulfilled_total"),
						rs.getLong("fulfilled_count"),
						rs.getLong("closed_partial_count"),
						rs.getLong("cancelled_count")
				))
				.list();

		long totalOrders = 0;
		long activeProcessing = 0;
		long pendingFulfillment = 0;
		long completed = 0;

		for (OrderPulseCurrencyGroupDto g : groups) {
			totalOrders += g.draftCount() + g.confirmedCount() + g.processingCount() + g.partiallyFulfilledCount() + g.fulfilledCount() + g.closedPartialCount() + g.cancelledCount();
			activeProcessing += g.processingCount();
			pendingFulfillment += g.confirmedCount() + g.partiallyFulfilledCount();
			completed += g.fulfilledCount();
		}

		return new OrderPulseDto(totalOrders, activeProcessing, pendingFulfillment, completed, groups);
	}

	@Override
	public OrderStatsDto getStats(TenantId tenantId, ActorId actorId, AuthorizedDataAccess access) {
		OwnershipScopeSql scope = OwnershipScopeSql.resolve(actorId, access);
		Map<String, Object> parameters = new HashMap<>(scope.parameters());
		parameters.put("tenantId", tenantId.toString());

		String sql = scope.cte() + """
				SELECT COUNT(*) AS total_orders,
				       COUNT(CASE WHEN o.status = 'DRAFT' THEN 1 END) AS draft_orders,
				       COUNT(CASE WHEN o.status = 'CONFIRMED' THEN 1 END) AS confirmed_orders,
				       COUNT(CASE WHEN o.status IN ('PROCESSING', 'PARTIALLY_FULFILLED') THEN 1 END) AS in_fulfillment_orders,
				       COUNT(CASE WHEN o.status = 'FULFILLED' THEN 1 END) AS completed_orders,
				       COUNT(CASE WHEN o.status IN ('CANCELLED', 'CLOSED_PARTIAL') THEN 1 END) AS cancelled_orders,
				       COALESCE(SUM(CASE WHEN o.status = 'FULFILLED' THEN o.grand_total ELSE 0 END), 0) AS fulfilled_amount,
				       COALESCE(SUM(o.grand_total), 0) AS total_pipeline_amount
				FROM sales_orders o
				WHERE o.tenant_id = :tenantId
				  AND (%s)
				""".formatted(scope.predicate("o"));

		return jdbcClient.sql(sql)
				.params(parameters)
				.query((rs, rowNum) -> new OrderStatsDto(
						rs.getLong("total_orders"),
						rs.getLong("draft_orders"),
						rs.getLong("confirmed_orders"),
						rs.getLong("in_fulfillment_orders"),
						rs.getLong("completed_orders"),
						rs.getLong("cancelled_orders"),
						rs.getBigDecimal("fulfilled_amount"),
						rs.getBigDecimal("total_pipeline_amount")
				))
				.single();
	}

	@Override
	@Transactional
	public int bulkChangeStatus(TenantId tenantId, List<UUID> orderIds, OrderStatus status, String reason, ActorId actorId, Instant now) {
		if (orderIds == null || orderIds.isEmpty()) {
			return 0;
		}
		int updated = 0;
		for (UUID id : orderIds) {
			OrderId orderId = new OrderId(id);
			int rows = jdbcClient.sql("""
					UPDATE sales_orders SET
					    status = :status,
					    updated_at = :now,
					    updated_by = :actorId,
					    version = version + 1
					WHERE tenant_id = :tenantId AND id = :id
					""")
					.param("status", status.name())
					.param("now", Timestamp.from(now))
					.param("actorId", actorId != null ? actorId.toString() : null)
					.param("tenantId", tenantId.toString())
					.param("id", id.toString())
					.update();
			if (rows > 0) {
				updated += rows;
				OrderStatusHistoryEntry history = new OrderStatusHistoryEntry(
						UUID.randomUUID(),
						orderId,
						now,
						actorId,
						"BULK_STATUS_CHANGE",
						null,
						status,
						reason != null ? reason : "Bulk status changed to " + status.name()
				);
				saveStatusHistory(tenantId, history);
			}
		}
		return updated;
	}

	@Override
	public boolean existsByOrderNumber(TenantId tenantId, String orderNumber, OrderId excludeId) {
		String sql = "SELECT COUNT(*) FROM sales_orders WHERE tenant_id = :t AND order_number = :num";
		Map<String, Object> params = new HashMap<>();
		params.put("t", tenantId.toString());
		params.put("num", orderNumber);
		if (excludeId != null) {
			sql += " AND id <> :ex";
			params.put("ex", excludeId.toString());
		}
		Long count = jdbcClient.sql(sql).params(params).query(Long.class).single();
		return count != null && count > 0;
	}

	@Override
	public boolean existsAccount(TenantId tenantId, UUID accountId, ActorId actorId, AuthorizedDataAccess access) {
		if (accountId == null) return false;
		Long count = jdbcClient.sql("SELECT COUNT(*) FROM crm_accounts WHERE tenant_id = :t AND id = :id")
				.param("t", tenantId.toString())
				.param("id", accountId.toString())
				.query(Long.class)
				.single();
		return count != null && count > 0;
	}

	@Override
	public boolean existsContact(TenantId tenantId, UUID contactId, ActorId actorId, AuthorizedDataAccess access) {
		if (contactId == null) return true;
		Long count = jdbcClient.sql("SELECT COUNT(*) FROM crm_contacts WHERE tenant_id = :t AND id = :id")
				.param("t", tenantId.toString())
				.param("id", contactId.toString())
				.query(Long.class)
				.single();
		return count != null && count > 0;
	}

	@Override
	public boolean existsOpportunity(TenantId tenantId, UUID opportunityId, ActorId actorId, AuthorizedDataAccess access) {
		if (opportunityId == null) return true;
		Long count = jdbcClient.sql("SELECT COUNT(*) FROM crm_opportunities WHERE tenant_id = :t AND id = :id")
				.param("t", tenantId.toString())
				.param("id", opportunityId.toString())
				.query(Long.class)
				.single();
		return count != null && count > 0;
	}

	@Override
	public boolean existsQuote(TenantId tenantId, UUID quoteId, ActorId actorId, AuthorizedDataAccess access) {
		if (quoteId == null) return true;
		Long count = jdbcClient.sql("SELECT COUNT(*) FROM sales_quotes WHERE tenant_id = :t AND id = :id")
				.param("t", tenantId.toString())
				.param("id", quoteId.toString())
				.query(Long.class)
				.single();
		return count != null && count > 0;
	}

	@Override
	public boolean existsPriceBook(TenantId tenantId, UUID priceBookId) {
		if (priceBookId == null) return true;
		Long count = jdbcClient.sql("SELECT COUNT(*) FROM catalog_price_books WHERE tenant_id = :t AND id = :id")
				.param("t", tenantId.toString())
				.param("id", priceBookId.toString())
				.query(Long.class)
				.single();
		return count != null && count > 0;
	}

	@Override
	@Transactional
	public void save(Order order) {
		String tenantIdStr = order.tenantId().toString();
		String orderIdStr = order.id().toString();

		Long exists = jdbcClient.sql("SELECT COUNT(*) FROM sales_orders WHERE tenant_id = :t AND id = :id")
				.param("t", tenantIdStr)
				.param("id", orderIdStr)
				.query(Long.class)
				.single();

		String billingJson = "{}";
		String shippingJson = "{}";

		if (exists == null || exists == 0) {
			// Insert
			jdbcClient.sql("""
					INSERT INTO sales_orders (
					    tenant_id, id, order_number, source_type, pricing_mode,
					    account_id, contact_id, opportunity_id, quote_id, price_book_id,
					    owner_user_id, owner_team_id, status, currency_code,
					    order_date, requested_delivery_date, customer_reference,
					    payment_terms, delivery_terms, notes,
					    billing_address_snapshot, shipping_address_snapshot,
					    subtotal, discount_total, tax_total, shipping_total, grand_total,
					    confirmed_at, confirmed_by, fulfilled_at,
					    cancelled_at, cancelled_by, cancellation_reason,
					    closed_at, closed_by, closed_reason,
					    created_at, created_by, updated_at, updated_by, version
					) VALUES (
					    :tenantId, :id, :orderNumber, :sourceType, :pricingMode,
					    :accountId, :contactId, :opportunityId, :quoteId, :priceBookId,
					    :ownerUserId, :ownerTeamId, :status, :currencyCode,
					    :orderDate, :requestedDeliveryDate, :customerReference,
					    :paymentTerms, :deliveryTerms, :notes,
					    :billingSnapshot, :shippingSnapshot,
					    :subtotal, :discountTotal, :taxTotal, :shippingTotal, :grandTotal,
					    :confirmedAt, :confirmedBy, :fulfilledAt,
					    :cancelledAt, :cancelledBy, :cancellationReason,
					    :closedAt, :closedBy, :closedReason,
					    :createdAt, :createdBy, :updatedAt, :updatedBy, :version
					)
					""")
					.param("tenantId", tenantIdStr)
					.param("id", orderIdStr)
					.param("orderNumber", order.orderNumber())
					.param("sourceType", order.sourceType().name())
					.param("pricingMode", order.pricingMode().name())
					.param("accountId", order.accountId().toString())
					.param("contactId", order.contactId() != null ? order.contactId().toString() : null)
					.param("opportunityId", order.opportunityId() != null ? order.opportunityId().toString() : null)
					.param("quoteId", order.quoteId() != null ? order.quoteId().toString() : null)
					.param("priceBookId", order.priceBookId() != null ? order.priceBookId().toString() : null)
					.param("ownerUserId", order.ownerUserId() != null ? order.ownerUserId().toString() : null)
					.param("ownerTeamId", order.ownerTeamId() != null ? order.ownerTeamId().toString() : null)
					.param("status", order.status().name())
					.param("currencyCode", order.amounts().currencyCode())
					.param("orderDate", order.orderDate())
					.param("requestedDeliveryDate", order.requestedDeliveryDate())
					.param("customerReference", order.customerReference())
					.param("paymentTerms", order.paymentTerms())
					.param("deliveryTerms", order.deliveryTerms())
					.param("notes", order.notes())
					.param("billingSnapshot", billingJson)
					.param("shippingSnapshot", shippingJson)
					.param("subtotal", order.amounts().subtotal())
					.param("discountTotal", order.amounts().discountTotal())
					.param("taxTotal", order.amounts().taxTotal())
					.param("shippingTotal", order.amounts().shippingTotal())
					.param("grandTotal", order.amounts().grandTotal())
					.param("confirmedAt", order.confirmedAt() != null ? Timestamp.from(order.confirmedAt()) : null)
					.param("confirmedBy", order.confirmedBy() != null ? order.confirmedBy().toString() : null)
					.param("fulfilledAt", order.fulfilledAt() != null ? Timestamp.from(order.fulfilledAt()) : null)
					.param("cancelledAt", order.cancelledAt() != null ? Timestamp.from(order.cancelledAt()) : null)
					.param("cancelledBy", order.cancelledBy() != null ? order.cancelledBy().toString() : null)
					.param("cancellationReason", order.cancellationReason())
					.param("closedAt", order.closedAt() != null ? Timestamp.from(order.closedAt()) : null)
					.param("closedBy", order.closedBy() != null ? order.closedBy().toString() : null)
					.param("closedReason", order.closedReason())
					.param("createdAt", Timestamp.from(order.createdAt()))
					.param("createdBy", order.createdBy() != null ? order.createdBy().toString() : null)
					.param("updatedAt", Timestamp.from(order.updatedAt()))
					.param("updatedBy", order.updatedBy() != null ? order.updatedBy().toString() : null)
					.param("version", order.version())
					.update();
		} else {
			// Update
			jdbcClient.sql("""
					UPDATE sales_orders SET
					    source_type = :sourceType,
					    pricing_mode = :pricingMode,
					    account_id = :accountId,
					    contact_id = :contactId,
					    opportunity_id = :opportunityId,
					    price_book_id = :priceBookId,
					    owner_user_id = :ownerUserId,
					    owner_team_id = :ownerTeamId,
					    status = :status,
					    currency_code = :currencyCode,
					    order_date = :orderDate,
					    requested_delivery_date = :requestedDeliveryDate,
					    customer_reference = :customerReference,
					    payment_terms = :paymentTerms,
					    delivery_terms = :deliveryTerms,
					    notes = :notes,
					    subtotal = :subtotal,
					    discount_total = :discountTotal,
					    tax_total = :taxTotal,
					    shipping_total = :shippingTotal,
					    grand_total = :grandTotal,
					    confirmed_at = :confirmedAt,
					    confirmed_by = :confirmedBy,
					    fulfilled_at = :fulfilledAt,
					    cancelled_at = :cancelledAt,
					    cancelled_by = :cancelledBy,
					    cancellation_reason = :cancellationReason,
					    closed_at = :closedAt,
					    closed_by = :closedBy,
					    closed_reason = :closedReason,
					    updated_at = :updatedAt,
					    updated_by = :updatedBy,
					    version = :version
					WHERE tenant_id = :tenantId AND id = :id
					""")
					.param("tenantId", tenantIdStr)
					.param("id", orderIdStr)
					.param("sourceType", order.sourceType().name())
					.param("pricingMode", order.pricingMode().name())
					.param("accountId", order.accountId().toString())
					.param("contactId", order.contactId() != null ? order.contactId().toString() : null)
					.param("opportunityId", order.opportunityId() != null ? order.opportunityId().toString() : null)
					.param("priceBookId", order.priceBookId() != null ? order.priceBookId().toString() : null)
					.param("ownerUserId", order.ownerUserId() != null ? order.ownerUserId().toString() : null)
					.param("ownerTeamId", order.ownerTeamId() != null ? order.ownerTeamId().toString() : null)
					.param("status", order.status().name())
					.param("currencyCode", order.amounts().currencyCode())
					.param("orderDate", order.orderDate())
					.param("requestedDeliveryDate", order.requestedDeliveryDate())
					.param("customerReference", order.customerReference())
					.param("paymentTerms", order.paymentTerms())
					.param("deliveryTerms", order.deliveryTerms())
					.param("notes", order.notes())
					.param("subtotal", order.amounts().subtotal())
					.param("discountTotal", order.amounts().discountTotal())
					.param("taxTotal", order.amounts().taxTotal())
					.param("shippingTotal", order.amounts().shippingTotal())
					.param("grandTotal", order.amounts().grandTotal())
					.param("confirmedAt", order.confirmedAt() != null ? Timestamp.from(order.confirmedAt()) : null)
					.param("confirmedBy", order.confirmedBy() != null ? order.confirmedBy().toString() : null)
					.param("fulfilledAt", order.fulfilledAt() != null ? Timestamp.from(order.fulfilledAt()) : null)
					.param("cancelledAt", order.cancelledAt() != null ? Timestamp.from(order.cancelledAt()) : null)
					.param("cancelledBy", order.cancelledBy() != null ? order.cancelledBy().toString() : null)
					.param("cancellationReason", order.cancellationReason())
					.param("closedAt", order.closedAt() != null ? Timestamp.from(order.closedAt()) : null)
					.param("closedBy", order.closedBy() != null ? order.closedBy().toString() : null)
					.param("closedReason", order.closedReason())
					.param("updatedAt", Timestamp.from(order.updatedAt()))
					.param("updatedBy", order.updatedBy() != null ? order.updatedBy().toString() : null)
					.param("version", order.version())
					.update();
		}

		// Save lines
		jdbcClient.sql("DELETE FROM sales_order_items WHERE tenant_id = :t AND order_id = :oid")
				.param("t", tenantIdStr)
				.param("oid", orderIdStr)
				.update();

		for (OrderLine line : order.lines()) {
			jdbcClient.sql("""
					INSERT INTO sales_order_items (
					    tenant_id, id, order_id, line_number, product_id, quote_item_id,
					    sku_snapshot, name_snapshot, description_snapshot, unit_of_measure_snapshot,
					    quantity, fulfilled_quantity, unit_price, discount_percent, discount_amount,
					    tax_percent, tax_amount, line_total, created_at, updated_at, version
					) VALUES (
					    :tenantId, :id, :orderId, :lineNumber, :productId, :quoteItemId,
					    :sku, :name, :desc, :unit,
					    :qty, :fulfilledQty, :unitPrice, :discPct, :discAmt,
					    :taxPct, :taxAmt, :total, :createdAt, :updatedAt, 1
					)
					""")
					.param("tenantId", tenantIdStr)
					.param("id", line.id().toString())
					.param("orderId", orderIdStr)
					.param("lineNumber", line.lineNumber())
					.param("productId", line.productId() != null ? line.productId().toString() : null)
					.param("quoteItemId", line.quoteItemId() != null ? line.quoteItemId().toString() : null)
					.param("sku", line.skuSnapshot())
					.param("name", line.nameSnapshot())
					.param("desc", line.descriptionSnapshot())
					.param("unit", line.unitOfMeasureSnapshot())
					.param("qty", line.quantity())
					.param("fulfilledQty", line.fulfilledQuantity())
					.param("unitPrice", line.unitPrice())
					.param("discPct", line.discountPercent())
					.param("discAmt", line.discountAmount())
					.param("taxPct", line.taxPercent())
					.param("taxAmt", line.taxAmount())
					.param("total", line.lineTotal())
					.param("createdAt", Timestamp.from(order.createdAt()))
					.param("updatedAt", Timestamp.from(order.updatedAt()))
					.update();
		}
	}

	@Override
	@Transactional
	public void saveFulfillmentEvent(TenantId tenantId, OrderFulfillmentEvent event) {
		String tenantIdStr = tenantId.toString();
		String eventIdStr = event.id().toString();

		Long count = jdbcClient.sql("SELECT COUNT(*) FROM sales_order_fulfillment_events WHERE tenant_id = :t AND id = :id")
				.param("t", tenantIdStr)
				.param("id", eventIdStr)
				.query(Long.class)
				.single();

		if (count == null || count == 0) {
			jdbcClient.sql("""
					INSERT INTO sales_order_fulfillment_events (
					    tenant_id, id, order_id, event_number, reference_number,
					    fulfillment_date, note, status, occurred_at, recorded_by,
					    voided_at, voided_by, void_reason, version
					) VALUES (
					    :t, :id, :oid, :num, :ref,
					    :date, :note, :st, :occ, :rec,
					    :vat, :vby, :vrea, :ver
					)
					""")
					.param("t", tenantIdStr)
					.param("id", eventIdStr)
					.param("oid", event.orderId().toString())
					.param("num", event.eventNumber())
					.param("ref", event.referenceNumber())
					.param("date", event.fulfillmentDate())
					.param("note", event.note())
					.param("st", event.status().name())
					.param("occ", Timestamp.from(event.occurredAt()))
					.param("rec", event.recordedBy() != null ? event.recordedBy().toString() : null)
					.param("vat", event.voidedAt() != null ? Timestamp.from(event.voidedAt()) : null)
					.param("vby", event.voidedBy() != null ? event.voidedBy().toString() : null)
					.param("vrea", event.voidReason())
					.param("ver", event.version())
					.update();

			for (OrderFulfillmentEventLine fl : event.lines()) {
				jdbcClient.sql("""
						INSERT INTO sales_order_fulfillment_event_lines (
						    tenant_id, id, fulfillment_id, order_line_id, quantity
						) VALUES (
						    :t, :id, :fid, :lid, :qty
						)
						""")
						.param("t", tenantIdStr)
						.param("id", fl.id().toString())
						.param("fid", eventIdStr)
						.param("lid", fl.orderLineId().toString())
						.param("qty", fl.quantity())
						.update();
			}
		} else {
			jdbcClient.sql("""
					UPDATE sales_order_fulfillment_events SET
					    status = :st,
					    voided_at = :vat,
					    voided_by = :vby,
					    void_reason = :vrea,
					    version = :ver
					WHERE tenant_id = :t AND id = :id
					""")
					.param("t", tenantIdStr)
					.param("id", eventIdStr)
					.param("st", event.status().name())
					.param("vat", event.voidedAt() != null ? Timestamp.from(event.voidedAt()) : null)
					.param("vby", event.voidedBy() != null ? event.voidedBy().toString() : null)
					.param("vrea", event.voidReason())
					.param("ver", event.version())
					.update();
		}
	}

	@Override
	@Transactional
	public void saveStatusHistory(TenantId tenantId, OrderStatusHistoryEntry entry) {
		jdbcClient.sql("""
				INSERT INTO sales_order_status_history (
				    tenant_id, id, order_id, changed_at, changed_by, action, from_status, to_status, notes
				) VALUES (
				    :t, :id, :oid, :at, :by, :act, :from, :to, :notes
				)
				""")
				.param("t", tenantId.toString())
				.param("id", entry.id().toString())
				.param("oid", entry.orderId().toString())
				.param("at", Timestamp.from(entry.changedAt()))
				.param("by", entry.changedBy() != null ? entry.changedBy().toString() : null)
				.param("act", entry.action())
				.param("from", entry.fromStatus() != null ? entry.fromStatus().name() : null)
				.param("to", entry.toStatus().name())
				.param("notes", entry.notes())
				.update();
	}

	@Override
	public List<OrderFulfillmentEvent> findFulfillmentsByOrderId(TenantId tenantId, OrderId orderId) {
		List<OrderFulfillmentEvent> events = jdbcClient.sql("""
				SELECT * FROM sales_order_fulfillment_events
				WHERE tenant_id = :t AND order_id = :oid
				ORDER BY occurred_at ASC
				""")
				.param("t", tenantId.toString())
				.param("oid", orderId.toString())
				.query((rs, rowNum) -> mapFulfillmentEventRow(rs))
				.list();

		for (OrderFulfillmentEvent ev : events) {
			List<OrderFulfillmentEventLine> fLines = jdbcClient.sql("""
					SELECT * FROM sales_order_fulfillment_event_lines
					WHERE tenant_id = :t AND fulfillment_id = :fid
					""")
					.param("t", tenantId.toString())
					.param("fid", ev.id().toString())
					.query((rs, rowNum) -> new OrderFulfillmentEventLine(
							UUID.fromString(rs.getString("id")),
							UUID.fromString(rs.getString("fulfillment_id")),
							UUID.fromString(rs.getString("order_line_id")),
							rs.getBigDecimal("quantity")
					))
					.list();
			ev.lines().addAll(fLines);
		}
		return events;
	}

	@Override
	public Optional<OrderFulfillmentEvent> findFulfillmentById(TenantId tenantId, OrderId orderId, UUID fulfillmentId) {
		var evOpt = jdbcClient.sql("""
				SELECT * FROM sales_order_fulfillment_events
				WHERE tenant_id = :t AND order_id = :oid AND id = :id
				""")
				.param("t", tenantId.toString())
				.param("oid", orderId.toString())
				.param("id", fulfillmentId.toString())
				.query((rs, rowNum) -> mapFulfillmentEventRow(rs))
				.optional();

		evOpt.ifPresent(ev -> {
			List<OrderFulfillmentEventLine> fLines = jdbcClient.sql("""
					SELECT * FROM sales_order_fulfillment_event_lines
					WHERE tenant_id = :t AND fulfillment_id = :fid
					""")
					.param("t", tenantId.toString())
					.param("fid", ev.id().toString())
					.query((rs, rowNum) -> new OrderFulfillmentEventLine(
							UUID.fromString(rs.getString("id")),
							UUID.fromString(rs.getString("fulfillment_id")),
							UUID.fromString(rs.getString("order_line_id")),
							rs.getBigDecimal("quantity")
					))
					.list();
			ev.lines().addAll(fLines);
		});

		return evOpt;
	}

	@Override
	public List<OrderStatusHistoryEntry> findStatusHistory(TenantId tenantId, OrderId orderId) {
		return jdbcClient.sql("""
				SELECT * FROM sales_order_status_history
				WHERE tenant_id = :t AND order_id = :oid
				ORDER BY changed_at DESC
				""")
				.param("t", tenantId.toString())
				.param("oid", orderId.toString())
				.query((rs, rowNum) -> new OrderStatusHistoryEntry(
						UUID.fromString(rs.getString("id")),
						OrderId.from(rs.getString("order_id")),
						rs.getTimestamp("changed_at").toInstant(),
						toActorId(rs.getString("changed_by")),
						rs.getString("action"),
						rs.getString("from_status") != null ? OrderStatus.valueOf(rs.getString("from_status")) : null,
						OrderStatus.valueOf(rs.getString("to_status")),
						rs.getString("notes")
				))
				.list();
	}

	@Override
	@Transactional
	public void delete(TenantId tenantId, OrderId orderId) {
		jdbcClient.sql("DELETE FROM sales_order_status_history WHERE tenant_id = :t AND order_id = :id")
				.param("t", tenantId.toString())
				.param("id", orderId.toString())
				.update();
		jdbcClient.sql("DELETE FROM sales_order_fulfillment_event_lines WHERE tenant_id = :t AND fulfillment_id IN (SELECT id FROM sales_order_fulfillment_events WHERE tenant_id = :t AND order_id = :id)")
				.param("t", tenantId.toString())
				.param("id", orderId.toString())
				.update();
		jdbcClient.sql("DELETE FROM sales_order_fulfillment_events WHERE tenant_id = :t AND order_id = :id")
				.param("t", tenantId.toString())
				.param("id", orderId.toString())
				.update();
		jdbcClient.sql("DELETE FROM sales_order_items WHERE tenant_id = :t AND order_id = :id")
				.param("t", tenantId.toString())
				.param("id", orderId.toString())
				.update();
		jdbcClient.sql("DELETE FROM sales_orders WHERE tenant_id = :t AND id = :id")
				.param("t", tenantId.toString())
				.param("id", orderId.toString())
				.update();
	}

	private Order mapOrderRow(TenantId tenantId, ResultSet rs) throws SQLException {
		OrderId orderId = OrderId.from(rs.getString("id"));
		String orderIdStr = orderId.toString();

		List<OrderLine> lines = jdbcClient.sql("""
				SELECT * FROM sales_order_items
				WHERE tenant_id = :t AND order_id = :oid
				ORDER BY line_number ASC
				""")
				.param("t", tenantId.toString())
				.param("oid", orderIdStr)
				.query((lrs, lRowNum) -> new OrderLine(
						UUID.fromString(lrs.getString("id")),
						lrs.getInt("line_number"),
						toUuid(lrs.getString("product_id")),
						toUuid(lrs.getString("quote_item_id")),
						lrs.getString("sku_snapshot"),
						lrs.getString("name_snapshot"),
						lrs.getString("description_snapshot"),
						lrs.getString("unit_of_measure_snapshot"),
						lrs.getBigDecimal("quantity"),
						lrs.getBigDecimal("fulfilled_quantity"),
						lrs.getBigDecimal("unit_price"),
						getDecimalOrDefault(lrs, "discount_percent", BigDecimal.ZERO),
						lrs.getBigDecimal("discount_amount"),
						getDecimalOrDefault(lrs, "tax_percent", BigDecimal.ZERO),
						lrs.getBigDecimal("tax_amount"),
						lrs.getBigDecimal("line_total")
				))
				.list();

		OrderAmounts amounts = new OrderAmounts(
				rs.getString("currency_code"),
				rs.getBigDecimal("subtotal"),
				rs.getBigDecimal("discount_total"),
				rs.getBigDecimal("tax_total"),
				rs.getBigDecimal("shipping_total"),
				rs.getBigDecimal("grand_total")
		);

		String srcTypeStr = getStringOrDefault(rs, "source_type", "DIRECT");
		OrderSourceType sourceType = OrderSourceType.valueOf(srcTypeStr);

		String pricingModeStr = getStringOrDefault(rs, "pricing_mode", "LINE_ITEM");
		OrderPricingMode pricingMode = OrderPricingMode.valueOf(pricingModeStr);

		return Order.reconstitute(
				tenantId,
				orderId,
				rs.getString("order_number"),
				sourceType,
				pricingMode,
				UUID.fromString(rs.getString("account_id")),
				toUuid(rs.getString("contact_id")),
				toUuid(rs.getString("opportunity_id")),
				toUuid(rs.getString("quote_id")),
				toUuid(getStringOrDefault(rs, "price_book_id", null)),
				toUuid(rs.getString("owner_user_id")),
				toUuid(getStringOrDefault(rs, "owner_team_id", null)),
				OrderStatus.valueOf(rs.getString("status")),
				amounts,
				OrderAddressSnapshot.empty("Customer"),
				OrderAddressSnapshot.empty("Customer"),
				lines,
				rs.getDate("order_date") != null ? rs.getDate("order_date").toLocalDate() : LocalDate.now(),
				rs.getDate("requested_delivery_date") != null ? rs.getDate("requested_delivery_date").toLocalDate() : null,
				rs.getString("customer_reference"),
				getStringOrDefault(rs, "payment_terms", null),
				getStringOrDefault(rs, "delivery_terms", null),
				getStringOrDefault(rs, "notes", null),
				toInstant(rs.getTimestamp("confirmed_at")),
				toActorId(getStringOrDefault(rs, "confirmed_by", null)),
				toInstant(rs.getTimestamp("fulfilled_at")),
				toInstant(rs.getTimestamp("cancelled_at")),
				toActorId(getStringOrDefault(rs, "cancelled_by", null)),
				rs.getString("cancellation_reason"),
				toInstant(getTimestampOrDefault(rs, "closed_at")),
				toActorId(getStringOrDefault(rs, "closed_by", null)),
				getStringOrDefault(rs, "closed_reason", null),
				rs.getTimestamp("created_at").toInstant(),
				toActorId(rs.getString("created_by")),
				rs.getTimestamp("updated_at").toInstant(),
				toActorId(rs.getString("updated_by")),
				rs.getLong("version")
		);
	}

	private OrderSummary mapSummaryRow(ResultSet rs) throws SQLException {
		UUID accountId = UUID.fromString(rs.getString("account_id"));
		UUID oppId = toUuid(rs.getString("opportunity_id"));
		UUID quoteId = toUuid(rs.getString("quote_id"));
		UUID ownerUserId = toUuid(rs.getString("owner_user_id"));
		UUID ownerTeamId = toUuid(getStringOrDefault(rs, "owner_team_id", null));

		OrderReferenceDto account = new OrderReferenceDto(accountId, rs.getString("account_name"), true);
		OrderReferenceDto opportunity = oppId != null ? new OrderReferenceDto(oppId, rs.getString("opportunity_name"), true) : null;
		OrderReferenceDto quote = quoteId != null ? new OrderReferenceDto(quoteId, rs.getString("quote_number"), true) : null;

		OrderOwnerReferenceDto owner = null;
		if (ownerTeamId != null) {
			owner = new OrderOwnerReferenceDto("TEAM", ownerTeamId, rs.getString("owner_team_name") != null ? rs.getString("owner_team_name") : "Team");
		} else if (ownerUserId != null) {
			owner = new OrderOwnerReferenceDto("USER", ownerUserId, rs.getString("owner_user_name") != null ? rs.getString("owner_user_name") : "User");
		}

		OrderAmounts amounts = new OrderAmounts(
				rs.getString("currency_code"),
				rs.getBigDecimal("subtotal"),
				rs.getBigDecimal("discount_total"),
				rs.getBigDecimal("tax_total"),
				rs.getBigDecimal("shipping_total"),
				rs.getBigDecimal("grand_total")
		);

		int itemCount = rs.getInt("item_count");
		BigDecimal totalOrdered = rs.getBigDecimal("total_ordered_qty");
		BigDecimal totalFulfilled = rs.getBigDecimal("total_fulfilled_qty");
		BigDecimal progress = BigDecimal.ZERO;
		if (totalOrdered != null && totalOrdered.compareTo(BigDecimal.ZERO) > 0 && totalFulfilled != null) {
			progress = totalFulfilled.multiply(BigDecimal.valueOf(100)).divide(totalOrdered, 2, RoundingMode.HALF_UP);
		}

		OrderStatus status = OrderStatus.valueOf(rs.getString("status"));
		String srcTypeStr = getStringOrDefault(rs, "source_type", "DIRECT");
		String pricingModeStr = getStringOrDefault(rs, "pricing_mode", "LINE_ITEM");

		return new OrderSummary(
				OrderId.from(rs.getString("id")),
				rs.getString("order_number"),
				OrderSourceType.valueOf(srcTypeStr),
				OrderPricingMode.valueOf(pricingModeStr),
				status,
				account,
				opportunity,
				quote,
				owner,
				amounts,
				itemCount,
				progress,
				rs.getDate("order_date") != null ? rs.getDate("order_date").toLocalDate() : LocalDate.now(),
				rs.getDate("requested_delivery_date") != null ? rs.getDate("requested_delivery_date").toLocalDate() : null,
				rs.getTimestamp("updated_at").toInstant(),
				rs.getLong("version"),
				Collections.emptyList()
		);
	}

	private OrderFulfillmentEvent mapFulfillmentEventRow(ResultSet rs) throws SQLException {
		return new OrderFulfillmentEvent(
				UUID.fromString(rs.getString("id")),
				OrderId.from(rs.getString("order_id")),
				rs.getString("event_number"),
				rs.getString("reference_number"),
				rs.getDate("fulfillment_date") != null ? rs.getDate("fulfillment_date").toLocalDate() : LocalDate.now(),
				rs.getString("note"),
				OrderFulfillmentStatus.valueOf(rs.getString("status")),
				rs.getTimestamp("occurred_at").toInstant(),
				toActorId(rs.getString("recorded_by")),
				toInstant(rs.getTimestamp("voided_at")),
				toActorId(rs.getString("voided_by")),
				rs.getString("void_reason"),
				new ArrayList<>(),
				rs.getLong("version")
		);
	}

	private static UUID toUuid(String val) {
		return val != null && !val.isBlank() ? UUID.fromString(val) : null;
	}

	private static ActorId toActorId(String val) {
		return val != null && !val.isBlank() ? ActorId.from(val) : null;
	}

	private static Instant toInstant(Timestamp ts) {
		return ts != null ? ts.toInstant() : null;
	}

	private static String getStringOrDefault(ResultSet rs, String col, String def) {
		try {
			String val = rs.getString(col);
			return val != null ? val : def;
		} catch (SQLException ex) {
			return def;
		}
	}

	private static BigDecimal getDecimalOrDefault(ResultSet rs, String col, BigDecimal def) {
		try {
			BigDecimal val = rs.getBigDecimal(col);
			return val != null ? val : def;
		} catch (SQLException ex) {
			return def;
		}
	}

	private static Timestamp getTimestampOrDefault(ResultSet rs, String col) {
		try {
			return rs.getTimestamp(col);
		} catch (SQLException ex) {
			return null;
		}
	}

}
