package com.crm.sales.quote.infrastructure.persistence;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.Instant;
import java.time.LocalDate;
import java.util.Collections;
import java.util.UUID;

import com.crm.sales.quote.application.dto.QuoteOwnerReferenceDto;
import com.crm.sales.quote.application.dto.QuoteReferenceDto;
import com.crm.sales.quote.application.dto.QuoteSummary;
import com.crm.sales.quote.domain.Quote;
import com.crm.sales.quote.domain.QuoteAmounts;
import com.crm.sales.quote.domain.QuoteId;
import com.crm.sales.quote.domain.QuoteStatus;
import com.crm.sharedkernel.domain.ActorId;
import com.crm.sharedkernel.domain.TenantId;

public final class QuoteJdbcMapper {

	private QuoteJdbcMapper() {
	}

	public static Quote mapQuote(ResultSet rs, int rowNum) throws SQLException {
		String prevQuoteIdStr = rs.getString("previous_quote_id");
		UUID previousQuoteId = prevQuoteIdStr == null ? null : UUID.fromString(prevQuoteIdStr);

		String contactIdStr = rs.getString("contact_id");
		UUID contactId = contactIdStr == null ? null : UUID.fromString(contactIdStr);

		String opportunityIdStr = rs.getString("opportunity_id");
		UUID opportunityId = opportunityIdStr == null ? null : UUID.fromString(opportunityIdStr);

		String priceBookIdStr = rs.getString("price_book_id");
		UUID priceBookId = priceBookIdStr == null ? null : UUID.fromString(priceBookIdStr);

		String ownerUserIdStr = rs.getString("owner_user_id");
		UUID ownerUserId = ownerUserIdStr == null ? null : UUID.fromString(ownerUserIdStr);

		QuoteAmounts amounts = new QuoteAmounts(
				rs.getString("currency_code"),
				rs.getBigDecimal("subtotal"),
				rs.getBigDecimal("discount_total"),
				rs.getBigDecimal("tax_total"),
				rs.getBigDecimal("shipping_total"),
				rs.getBigDecimal("grand_total"));

		java.sql.Date issueDateSql = rs.getDate("issue_date");
		LocalDate issueDate = issueDateSql == null ? null : issueDateSql.toLocalDate();

		java.sql.Date validUntilSql = rs.getDate("valid_until");
		LocalDate validUntil = validUntilSql == null ? null : validUntilSql.toLocalDate();

		return Quote.reconstitute(
				TenantId.from(rs.getString("tenant_id")),
				QuoteId.from(rs.getString("id")),
				rs.getString("quote_number"),
				rs.getInt("revision_number"),
				previousQuoteId,
				UUID.fromString(rs.getString("account_id")),
				contactId,
				opportunityId,
				priceBookId,
				ownerUserId,
				QuoteStatus.valueOf(rs.getString("status")),
				amounts,
				rs.getBigDecimal("exchange_rate_to_tenant_currency"),
				issueDate,
				validUntil,
				rs.getString("payment_terms"),
				rs.getString("delivery_terms"),
				rs.getString("customer_reference"),
				rs.getString("notes"),
				toInstant(rs.getTimestamp("approved_at")),
				toActorId(rs.getString("approved_by")),
				toInstant(rs.getTimestamp("accepted_at")),
				toInstant(rs.getTimestamp("rejected_at")),
				toInstant(rs.getTimestamp("created_at")),
				toActorId(rs.getString("created_by")),
				toInstant(rs.getTimestamp("updated_at")),
				toActorId(rs.getString("updated_by")),
				rs.getLong("version"));
	}

	public static QuoteSummary mapSummary(ResultSet rs, int rowNum) throws SQLException {
		String opportunityIdStr = rs.getString("opportunity_id");
		UUID opportunityId = opportunityIdStr == null ? null : UUID.fromString(opportunityIdStr);

		String ownerUserIdStr = rs.getString("owner_user_id");
		UUID ownerUserId = ownerUserIdStr == null ? null : UUID.fromString(ownerUserIdStr);

		UUID accountId = UUID.fromString(rs.getString("account_id"));

		QuoteAmounts amounts = new QuoteAmounts(
				rs.getString("currency_code"),
				rs.getBigDecimal("subtotal"),
				rs.getBigDecimal("discount_total"),
				rs.getBigDecimal("tax_total"),
				rs.getBigDecimal("shipping_total"),
				rs.getBigDecimal("grand_total"));

		java.sql.Date issueDateSql = rs.getDate("issue_date");
		LocalDate issueDate = issueDateSql == null ? null : issueDateSql.toLocalDate();

		java.sql.Date validUntilSql = rs.getDate("valid_until");
		LocalDate validUntil = validUntilSql == null ? null : validUntilSql.toLocalDate();

		QuoteStatus status = QuoteStatus.valueOf(rs.getString("status"));
		String quoteNumber = rs.getString("quote_number");

		return new QuoteSummary(
				QuoteId.from(rs.getString("id")),
				quoteNumber,
				rs.getInt("revision_number"),
				quoteNumber,
				true,
				false,
				status,
				new QuoteReferenceDto(accountId, "Account", true),
				opportunityId != null ? new QuoteReferenceDto(opportunityId, "Opportunity", true) : null,
				ownerUserId != null ? new QuoteOwnerReferenceDto("USER", ownerUserId, "User") : null,
				amounts,
				0,
				issueDate,
				validUntil,
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
