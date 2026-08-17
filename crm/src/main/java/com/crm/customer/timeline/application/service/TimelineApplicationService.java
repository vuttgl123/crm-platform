package com.crm.customer.timeline.application.service;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

import com.crm.customer.timeline.application.dto.TimelineItem;
import com.crm.customer.timeline.domain.TimelineCategory;
import com.crm.foundation.security.SystemPermission;
import com.crm.foundation.security.TenantAccessAuthorizer;
import com.crm.foundation.tenancy.CurrentTenant;
import com.crm.sharedkernel.domain.TenantId;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class TimelineApplicationService {

	private final JdbcClient jdbcClient;
	private final CurrentTenant currentTenant;
	private final TenantAccessAuthorizer authorizer;

	public TimelineApplicationService(
			JdbcClient jdbcClient,
			CurrentTenant currentTenant,
			TenantAccessAuthorizer authorizer) {
		this.jdbcClient = jdbcClient;
		this.currentTenant = currentTenant;
		this.authorizer = authorizer;
	}

	@Transactional(readOnly = true)
	public List<TimelineItem> getTimeline(String entityType, String entityId) {
		Objects.requireNonNull(entityType, "entityType must not be null");
		Objects.requireNonNull(entityId, "entityId must not be null");

		TenantId tenantId = currentTenant.requireTenantId();
		authorizer.requirePermission(SystemPermission.CRM_ACCOUNT_READ);

		List<TimelineItem> items = new ArrayList<>();
		String normalizedType = entityType.trim().toLowerCase();

		// 1. Fetch Notes
		fetchNotes(tenantId, normalizedType, entityId, items);

		// 2. Fetch Activities
		fetchActivities(tenantId, normalizedType, entityId, items);

		// 3. Fetch Orders & Quotes & Contracts (if applicable)
		fetchSalesDocuments(tenantId, normalizedType, entityId, items);

		// 4. Fetch Support Tickets
		fetchTickets(tenantId, normalizedType, entityId, items);

		// Sort by occurredAt descending
		items.sort(Comparator.comparing(TimelineItem::occurredAt, Comparator.nullsLast(Comparator.reverseOrder())));
		return items;
	}

	private void fetchNotes(TenantId tenantId, String entityType, String entityId, List<TimelineItem> items) {
		try {
			String column = switch (entityType) {
				case "account" -> "account_id";
				case "lead" -> "lead_id";
				case "contact" -> "contact_id";
				case "opportunity", "deal" -> "opportunity_id";
				default -> "account_id";
			};

			String sql = String.format("""
					SELECT id, title, body, owner_user_id, created_at, is_pinned
					FROM crm_notes
					WHERE tenant_id = :tenantId AND %s = :entityId AND deleted_at IS NULL
					""", column);

			jdbcClient.sql(sql)
					.param("tenantId", tenantId.toString())
					.param("entityId", entityId)
					.query((rs, rowNum) -> {
						Timestamp ts = rs.getTimestamp("created_at");
						Instant occurredAt = ts != null ? ts.toInstant() : Instant.now();
						Map<String, Object> meta = new HashMap<>();
						meta.put("ownerUserId", rs.getString("owner_user_id"));

						return new TimelineItem(
								rs.getString("id"),
								"NOTE",
								rs.getString("title"),
								rs.getString("body"),
								rs.getString("owner_user_id"),
								occurredAt,
								TimelineCategory.NOTE,
								meta,
								rs.getBoolean("is_pinned")
						);
					})
					.list()
					.forEach(items::add);
		} catch (Exception ignored) {
			// Fail-safe if table or target column not found
		}
	}

	private void fetchActivities(TenantId tenantId, String entityType, String entityId, List<TimelineItem> items) {
		try {
			String sql = """
					SELECT a.id, a.activity_type, a.subject, a.description,
					       a.status, a.priority, a.owner_user_id, a.scheduled_start_at, a.completed_at, a.created_at
					FROM crm_activities a
					WHERE a.tenant_id = :tenantId
					""";

			jdbcClient.sql(sql)
					.param("tenantId", tenantId.toString())
					.query((rs, rowNum) -> {
						Timestamp ts = rs.getTimestamp("completed_at");
						if (ts == null) ts = rs.getTimestamp("scheduled_start_at");
						if (ts == null) ts = rs.getTimestamp("created_at");
						Instant occurredAt = ts != null ? ts.toInstant() : Instant.now();

						String type = rs.getString("activity_type");
						Map<String, Object> meta = new HashMap<>();
						meta.put("status", rs.getString("status"));
						meta.put("priority", rs.getString("priority"));

						return new TimelineItem(
								rs.getString("id"),
								"ACTIVITY_" + type,
								rs.getString("subject"),
								rs.getString("description"),
								rs.getString("owner_user_id"),
								occurredAt,
								TimelineCategory.ENGAGEMENT,
								meta,
								false
						);
					})
					.list()
					.forEach(items::add);
		} catch (Exception ignored) {
		}
	}

	private void fetchSalesDocuments(TenantId tenantId, String entityType, String entityId, List<TimelineItem> items) {
		try {
			if ("account".equals(entityType)) {
				// Orders
				String orderSql = """
						SELECT id, order_number, status, subtotal, order_date, created_at
						FROM sales_orders
						WHERE tenant_id = :tenantId AND account_id = :entityId
						""";
				jdbcClient.sql(orderSql)
						.param("tenantId", tenantId.toString())
						.param("entityId", entityId)
						.query((rs, rowNum) -> {
							Timestamp ts = rs.getTimestamp("order_date");
							if (ts == null) ts = rs.getTimestamp("created_at");
							Instant occurredAt = ts != null ? ts.toInstant() : Instant.now();

							Map<String, Object> meta = new HashMap<>();
							meta.put("status", rs.getString("status"));
							meta.put("amount", rs.getBigDecimal("subtotal"));

							return new TimelineItem(
									rs.getString("id"),
									"ORDER_CREATED",
									"Đơn hàng " + rs.getString("order_number"),
									"Trạng thái đơn: " + rs.getString("status"),
									"Hệ thống",
									occurredAt,
									TimelineCategory.TRANSACTION,
									meta,
									false
							);
						})
						.list()
						.forEach(items::add);

				// Quotes
				String quoteSql = """
						SELECT id, quote_number, status, subtotal, created_at
						FROM sales_quotes
						WHERE tenant_id = :tenantId AND account_id = :entityId
						""";
				jdbcClient.sql(quoteSql)
						.param("tenantId", tenantId.toString())
						.param("entityId", entityId)
						.query((rs, rowNum) -> {
							Timestamp ts = rs.getTimestamp("created_at");
							Instant occurredAt = ts != null ? ts.toInstant() : Instant.now();

							Map<String, Object> meta = new HashMap<>();
							meta.put("status", rs.getString("status"));
							meta.put("amount", rs.getBigDecimal("subtotal"));

							return new TimelineItem(
									rs.getString("id"),
									"QUOTE_SENT",
									"Báo giá " + rs.getString("quote_number"),
									"Trạng thái báo giá: " + rs.getString("status"),
									"Hệ thống",
									occurredAt,
									TimelineCategory.TRANSACTION,
									meta,
									false
							);
						})
						.list()
						.forEach(items::add);
			}
		} catch (Exception ignored) {
		}
	}

	private void fetchTickets(TenantId tenantId, String entityType, String entityId, List<TimelineItem> items) {
		try {
			if ("account".equals(entityType)) {
				String ticketSql = """
						SELECT id, ticket_number, subject, priority, status, created_at
						FROM service_tickets
						WHERE tenant_id = :tenantId AND account_id = :entityId
						""";
				jdbcClient.sql(ticketSql)
						.param("tenantId", tenantId.toString())
						.param("entityId", entityId)
						.query((rs, rowNum) -> {
							Timestamp ts = rs.getTimestamp("created_at");
							Instant occurredAt = ts != null ? ts.toInstant() : Instant.now();

							Map<String, Object> meta = new HashMap<>();
							meta.put("priority", rs.getString("priority"));
							meta.put("status", rs.getString("status"));

							return new TimelineItem(
									rs.getString("id"),
									"TICKET_SUBMITTED",
									"Phiếu hỗ trợ " + rs.getString("ticket_number") + ": " + rs.getString("subject"),
									"Ưu tiên: " + rs.getString("priority") + " | Trạng thái: " + rs.getString("status"),
									"Bộ phận CSKH",
									occurredAt,
									TimelineCategory.SUPPORT,
									meta,
									false
							);
						})
						.list()
						.forEach(items::add);
			}
		} catch (Exception ignored) {
		}
	}

}
