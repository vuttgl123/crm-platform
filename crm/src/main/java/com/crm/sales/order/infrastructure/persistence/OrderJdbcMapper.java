package com.crm.sales.order.infrastructure.persistence;

import java.math.BigDecimal;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.Instant;
import java.time.LocalDate;
import java.util.Collections;
import java.util.UUID;

import com.crm.sales.order.application.dto.OrderOwnerReferenceDto;
import com.crm.sales.order.application.dto.OrderReferenceDto;
import com.crm.sales.order.application.dto.OrderSummary;
import com.crm.sales.order.domain.Order;
import com.crm.sales.order.domain.OrderAddressSnapshot;
import com.crm.sales.order.domain.OrderAmounts;
import com.crm.sales.order.domain.OrderId;
import com.crm.sales.order.domain.OrderPricingMode;
import com.crm.sales.order.domain.OrderSourceType;
import com.crm.sales.order.domain.OrderStatus;
import com.crm.sharedkernel.domain.ActorId;
import com.crm.sharedkernel.domain.TenantId;

public final class OrderJdbcMapper {

	private OrderJdbcMapper() {
	}

	public static Order mapOrder(ResultSet rs, int rowNum) throws SQLException {
		String contactIdStr = rs.getString("contact_id");
		UUID contactId = contactIdStr == null ? null : UUID.fromString(contactIdStr);

		String opportunityIdStr = rs.getString("opportunity_id");
		UUID opportunityId = opportunityIdStr == null ? null : UUID.fromString(opportunityIdStr);

		String quoteIdStr = rs.getString("quote_id");
		UUID quoteId = quoteIdStr == null ? null : UUID.fromString(quoteIdStr);

		String ownerUserIdStr = rs.getString("owner_user_id");
		UUID ownerUserId = ownerUserIdStr == null ? null : UUID.fromString(ownerUserIdStr);

		OrderAmounts amounts = new OrderAmounts(
				rs.getString("currency_code"),
				rs.getBigDecimal("subtotal"),
				rs.getBigDecimal("discount_total"),
				rs.getBigDecimal("tax_total"),
				rs.getBigDecimal("shipping_total"),
				rs.getBigDecimal("grand_total"));

		java.sql.Date orderDateSql = rs.getDate("order_date");
		LocalDate orderDate = orderDateSql == null ? null : orderDateSql.toLocalDate();

		java.sql.Date reqDateSql = rs.getDate("requested_delivery_date");
		LocalDate requestedDeliveryDate = reqDateSql == null ? null : reqDateSql.toLocalDate();

		return Order.reconstitute(
				TenantId.from(rs.getString("tenant_id")),
				OrderId.from(rs.getString("id")),
				rs.getString("order_number"),
				quoteId != null ? OrderSourceType.QUOTE_CONVERTED : OrderSourceType.DIRECT,
				OrderPricingMode.LINE_ITEM,
				UUID.fromString(rs.getString("account_id")),
				contactId,
				opportunityId,
				quoteId,
				null,
				ownerUserId,
				null,
				OrderStatus.valueOf(rs.getString("status")),
				amounts,
				OrderAddressSnapshot.empty("Customer"),
				OrderAddressSnapshot.empty("Customer"),
				Collections.emptyList(),
				orderDate,
				requestedDeliveryDate,
				rs.getString("customer_reference"),
				null,
				null,
				null,
				toInstant(rs.getTimestamp("confirmed_at")),
				null,
				toInstant(rs.getTimestamp("fulfilled_at")),
				toInstant(rs.getTimestamp("cancelled_at")),
				null,
				rs.getString("cancellation_reason"),
				null,
				null,
				null,
				toInstant(rs.getTimestamp("created_at")),
				toActorId(rs.getString("created_by")),
				toInstant(rs.getTimestamp("updated_at")),
				toActorId(rs.getString("updated_by")),
				rs.getLong("version"));
	}

	public static OrderSummary mapSummary(ResultSet rs, int rowNum) throws SQLException {
		UUID accountId = UUID.fromString(rs.getString("account_id"));
		String oppIdStr = rs.getString("opportunity_id");
		UUID oppId = oppIdStr == null ? null : UUID.fromString(oppIdStr);

		String quoteIdStr = rs.getString("quote_id");
		UUID quoteId = quoteIdStr == null ? null : UUID.fromString(quoteIdStr);

		String ownerUserIdStr = rs.getString("owner_user_id");
		UUID ownerUserId = ownerUserIdStr == null ? null : UUID.fromString(ownerUserIdStr);

		OrderAmounts amounts = new OrderAmounts(
				rs.getString("currency_code"),
				rs.getBigDecimal("subtotal"),
				rs.getBigDecimal("discount_total"),
				rs.getBigDecimal("tax_total"),
				rs.getBigDecimal("shipping_total"),
				rs.getBigDecimal("grand_total"));

		java.sql.Date orderDateSql = rs.getDate("order_date");
		LocalDate orderDate = orderDateSql == null ? null : orderDateSql.toLocalDate();

		java.sql.Date reqDateSql = rs.getDate("requested_delivery_date");
		LocalDate requestedDeliveryDate = reqDateSql == null ? null : reqDateSql.toLocalDate();

		return new OrderSummary(
				OrderId.from(rs.getString("id")),
				rs.getString("order_number"),
				quoteId != null ? OrderSourceType.QUOTE_CONVERTED : OrderSourceType.DIRECT,
				OrderPricingMode.LINE_ITEM,
				OrderStatus.valueOf(rs.getString("status")),
				new OrderReferenceDto(accountId, "Account", true),
				oppId != null ? new OrderReferenceDto(oppId, "Opportunity", true) : null,
				quoteId != null ? new OrderReferenceDto(quoteId, "Quote", true) : null,
				ownerUserId != null ? new OrderOwnerReferenceDto("USER", ownerUserId, "User") : null,
				amounts,
				0,
				BigDecimal.ZERO,
				orderDate,
				requestedDeliveryDate,
				toInstant(rs.getTimestamp("updated_at")),
				rs.getLong("version"),
				Collections.emptyList());
	}

	private static Instant toInstant(Timestamp timestamp) {
		return timestamp == null ? null : timestamp.toInstant();
	}

	private static ActorId toActorId(String value) {
		return value == null ? null : ActorId.from(value);
	}

}
