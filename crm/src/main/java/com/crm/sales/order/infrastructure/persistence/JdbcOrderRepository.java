package com.crm.sales.order.infrastructure.persistence;

import java.sql.Timestamp;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;

import com.crm.customer.infrastructure.persistence.AccountScopeSql;
import com.crm.foundation.security.AuthorizedDataAccess;
import com.crm.sales.order.application.dto.OrderSummary;
import com.crm.sales.order.application.port.OrderRepository;
import com.crm.sales.order.application.query.OrderSearchQuery;
import com.crm.sales.order.domain.Order;
import com.crm.sales.order.domain.OrderId;
import com.crm.sharedkernel.application.PageResult;
import com.crm.sharedkernel.domain.ActorId;
import com.crm.sharedkernel.domain.TenantId;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;

@Repository
public class JdbcOrderRepository implements OrderRepository {

	private static final String ORDER_SELECT = """
			SELECT o.tenant_id, o.id, o.order_number, o.account_id,
			       o.contact_id, o.opportunity_id, o.quote_id,
			       o.owner_user_id, o.status, o.currency_code,
			       o.order_date, o.requested_delivery_date,
			       o.customer_reference, o.subtotal, o.discount_total,
			       o.tax_total, o.shipping_total, o.grand_total,
			       o.confirmed_at, o.fulfilled_at, o.cancelled_at,
			       o.cancellation_reason, o.created_at, o.created_by,
			       o.updated_at, o.updated_by, o.version
			FROM sales_orders o
			""";

	private static final String SUMMARY_SELECT = """
			SELECT o.id, o.order_number, o.account_id, o.contact_id,
			       o.opportunity_id, o.quote_id, o.owner_user_id,
			       o.status, o.currency_code, o.subtotal, o.discount_total,
			       o.tax_total, o.shipping_total, o.grand_total,
			       o.order_date, o.requested_delivery_date,
			       o.updated_at, o.version
			FROM sales_orders o
			""";

	private final JdbcClient jdbcClient;

	public JdbcOrderRepository(JdbcClient jdbcClient) {
		this.jdbcClient = jdbcClient;
	}

	@Override
	public Optional<Order> findById(TenantId tenantId, OrderId orderId,
			ActorId actorId, AuthorizedDataAccess access) {
		AccountScopeSql scope = AccountScopeSql.resolve(actorId, access);
		Map<String, Object> parameters = new HashMap<>(scope.parameters());
		parameters.put("tenantId", tenantId.toString());
		parameters.put("orderId", orderId.toString());
		String sql = scope.cte() + ORDER_SELECT + """
				WHERE o.tenant_id = :tenantId
				  AND o.id = :orderId
				""";
		return jdbcClient.sql(sql)
				.params(parameters)
				.query(OrderJdbcMapper::mapOrder)
				.optional();
	}

	@Override
	public PageResult<OrderSummary> search(TenantId tenantId,
			ActorId actorId, OrderSearchQuery query,
			AuthorizedDataAccess access) {
		AccountScopeSql scope = AccountScopeSql.resolve(actorId, access);
		Map<String, Object> parameters = new HashMap<>(scope.parameters());
		parameters.put("tenantId", tenantId.toString());

		StringBuilder criteria = new StringBuilder("""
				WHERE o.tenant_id = :tenantId
				""");
		appendSearchCriteria(criteria, parameters, query);

		long totalElements = jdbcClient.sql(scope.cte() + """
				SELECT COUNT(*)
				FROM sales_orders o
				""" + criteria)
				.params(parameters)
				.query(Long.class)
				.single();

		parameters.put("pageSize", query.pageQuery().size());
		parameters.put("pageOffset", query.pageQuery().offset());

		List<OrderSummary> items = jdbcClient.sql(scope.cte() + SUMMARY_SELECT
				+ criteria + """
				ORDER BY o.updated_at DESC, o.id DESC
				LIMIT :pageSize OFFSET :pageOffset
				""")
				.params(parameters)
				.query(OrderJdbcMapper::mapSummary)
				.list();

		return new PageResult<>(
				items,
				query.pageQuery().page(),
				query.pageQuery().size(),
				totalElements,
				(int) Math.ceil((double) totalElements / query.pageQuery().size()));
	}

	@Override
	public boolean existsByOrderNumber(TenantId tenantId, String orderNumber,
			OrderId excludeId) {
		StringBuilder sql = new StringBuilder("""
				SELECT COUNT(*)
				FROM sales_orders o
				WHERE o.tenant_id = :tenantId
				  AND o.order_number = :orderNumber
				""");
		Map<String, Object> parameters = new HashMap<>();
		parameters.put("tenantId", tenantId.toString());
		parameters.put("orderNumber", orderNumber);
		if (excludeId != null) {
			sql.append(" AND o.id <> :excludeId");
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
	public boolean existsQuote(TenantId tenantId, UUID quoteId,
			ActorId actorId, AuthorizedDataAccess access) {
		AccountScopeSql scope = AccountScopeSql.resolve(actorId, access);
		Map<String, Object> parameters = new HashMap<>(scope.parameters());
		parameters.put("tenantId", tenantId.toString());
		parameters.put("quoteId", quoteId.toString());
		String sql = scope.cte() + """
				SELECT COUNT(*)
				FROM sales_quotes q
				WHERE q.tenant_id = :tenantId
				  AND q.id = :quoteId
				""";
		Long count = jdbcClient.sql(sql).params(parameters).query(Long.class).single();
		return count != null && count > 0;
	}

	@Override
	public void save(Order order) {
		Objects.requireNonNull(order, "order must not be null");
		Map<String, Object> parameters = new HashMap<>();
		parameters.put("tenantId", order.tenantId().toString());
		parameters.put("id", order.id().toString());
		parameters.put("orderNumber", order.orderNumber());
		parameters.put("accountId", order.accountId().toString());
		parameters.put("contactId", order.contactId() == null ? null : order.contactId().toString());
		parameters.put("opportunityId", order.opportunityId() == null ? null : order.opportunityId().toString());
		parameters.put("quoteId", order.quoteId() == null ? null : order.quoteId().toString());
		parameters.put("ownerUserId", order.ownerUserId() == null ? null : order.ownerUserId().toString());
		parameters.put("status", order.status().name());
		parameters.put("currencyCode", order.amounts().currencyCode());
		parameters.put("orderDate", order.orderDate());
		parameters.put("requestedDeliveryDate", order.requestedDeliveryDate());
		parameters.put("customerReference", order.customerReference());
		parameters.put("subtotal", order.amounts().subtotal());
		parameters.put("discountTotal", order.amounts().discountTotal());
		parameters.put("taxTotal", order.amounts().taxTotal());
		parameters.put("shippingTotal", order.amounts().shippingTotal());
		parameters.put("grandTotal", order.amounts().grandTotal());
		parameters.put("confirmedAt", order.confirmedAt() == null ? null : Timestamp.from(order.confirmedAt()));
		parameters.put("fulfilledAt", order.fulfilledAt() == null ? null : Timestamp.from(order.fulfilledAt()));
		parameters.put("cancelledAt", order.cancelledAt() == null ? null : Timestamp.from(order.cancelledAt()));
		parameters.put("cancellationReason", order.cancellationReason());
		parameters.put("createdAt", Timestamp.from(order.createdAt()));
		parameters.put("createdBy", order.createdBy() == null ? null : order.createdBy().toString());
		parameters.put("updatedAt", Timestamp.from(order.updatedAt()));
		parameters.put("updatedBy", order.updatedBy() == null ? null : order.updatedBy().toString());
		parameters.put("version", order.version());

		String sql = """
				INSERT INTO sales_orders (
				    tenant_id, id, order_number, account_id, contact_id,
				    opportunity_id, quote_id, owner_user_id, status,
				    currency_code, order_date, requested_delivery_date,
				    customer_reference, subtotal, discount_total, tax_total,
				    shipping_total, grand_total, confirmed_at, fulfilled_at,
				    cancelled_at, cancellation_reason, created_at, created_by,
				    updated_at, updated_by, version
				) VALUES (
				    :tenantId, :id, :orderNumber, :accountId, :contactId,
				    :opportunityId, :quoteId, :ownerUserId, :status,
				    :currencyCode, :orderDate, :requestedDeliveryDate,
				    :customerReference, :subtotal, :discountTotal, :taxTotal,
				    :shippingTotal, :grandTotal, :confirmedAt, :fulfilledAt,
				    :cancelledAt, :cancellationReason, :createdAt, :createdBy,
				    :updatedAt, :updatedBy, :version
				)
				ON DUPLICATE KEY UPDATE
				    account_id = VALUES(account_id),
				    contact_id = VALUES(contact_id),
				    opportunity_id = VALUES(opportunity_id),
				    quote_id = VALUES(quote_id),
				    owner_user_id = VALUES(owner_user_id),
				    status = VALUES(status),
				    currency_code = VALUES(currency_code),
				    order_date = VALUES(order_date),
				    requested_delivery_date = VALUES(requested_delivery_date),
				    customer_reference = VALUES(customer_reference),
				    subtotal = VALUES(subtotal),
				    discount_total = VALUES(discount_total),
				    tax_total = VALUES(tax_total),
				    shipping_total = VALUES(shipping_total),
				    grand_total = VALUES(grand_total),
				    confirmed_at = VALUES(confirmed_at),
				    fulfilled_at = VALUES(fulfilled_at),
				    cancelled_at = VALUES(cancelled_at),
				    cancellation_reason = VALUES(cancellation_reason),
				    updated_at = VALUES(updated_at),
				    updated_by = VALUES(updated_by),
				    version = VALUES(version)
				""";
		jdbcClient.sql(sql).params(parameters).update();
	}

	@Override
	public void delete(TenantId tenantId, OrderId orderId) {
		Map<String, Object> parameters = Map.of(
				"tenantId", tenantId.toString(),
				"orderId", orderId.toString());
		String sql = """
				DELETE FROM sales_orders
				WHERE tenant_id = :tenantId AND id = :orderId
				""";
		jdbcClient.sql(sql).params(parameters).update();
	}

	private void appendSearchCriteria(StringBuilder criteria,
			Map<String, Object> parameters, OrderSearchQuery query) {
		if (query.search() != null && !query.search().trim().isEmpty()) {
			criteria.append("""
					  AND (
					      LOWER(o.order_number) LIKE :searchPattern
					      OR LOWER(o.customer_reference) LIKE :searchPattern
					  )
					""");
			parameters.put("searchPattern", "%" + query.search().trim().toLowerCase() + "%");
		}
		if (query.accountId() != null) {
			criteria.append(" AND o.account_id = :filterAccountId");
			parameters.put("filterAccountId", query.accountId().toString());
		}
		if (query.opportunityId() != null) {
			criteria.append(" AND o.opportunity_id = :filterOpportunityId");
			parameters.put("filterOpportunityId", query.opportunityId().toString());
		}
		if (query.quoteId() != null) {
			criteria.append(" AND o.quote_id = :filterQuoteId");
			parameters.put("filterQuoteId", query.quoteId().toString());
		}
		if (query.status() != null) {
			criteria.append(" AND o.status = :filterStatus");
			parameters.put("filterStatus", query.status().name());
		}
		if (query.ownerUserId() != null) {
			criteria.append(" AND o.owner_user_id = :filterOwnerUserId");
			parameters.put("filterOwnerUserId", query.ownerUserId().toString());
		}
	}

}
