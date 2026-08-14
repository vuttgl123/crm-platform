package com.crm.customer.lead.infrastructure.persistence;

import java.math.BigDecimal;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.UUID;

import com.crm.customer.account.domain.AccountOwnerType;
import com.crm.customer.lead.application.dto.LeadSummary;
import com.crm.customer.lead.domain.Lead;
import com.crm.customer.lead.domain.LeadEstimatedValue;
import com.crm.customer.lead.domain.LeadId;
import com.crm.customer.lead.domain.LeadOwner;
import com.crm.customer.lead.domain.LeadRating;
import com.crm.sharedkernel.domain.ActorId;
import com.crm.sharedkernel.domain.TenantId;

public final class LeadJdbcMapper {

	private LeadJdbcMapper() {
	}

	public static Lead mapLead(ResultSet rs, int rowNum) throws SQLException {
		String ownerUserIdStr = rs.getString("owner_user_id");
		String ownerTeamIdStr = rs.getString("owner_team_id");
		LeadOwner owner = null;
		if (ownerUserIdStr != null) {
			owner = new LeadOwner(
					AccountOwnerType.USER, UUID.fromString(ownerUserIdStr));
		} else if (ownerTeamIdStr != null) {
			owner = new LeadOwner(
					AccountOwnerType.TEAM, UUID.fromString(ownerTeamIdStr));
		}

		String sourceIdStr = rs.getString("source_id");
		UUID sourceId = sourceIdStr == null ? null : UUID.fromString(sourceIdStr);

		String ratingStr = rs.getString("rating");
		LeadRating rating = ratingStr == null ? null : LeadRating.valueOf(ratingStr);

		BigDecimal estimatedValueAmt = rs.getBigDecimal("estimated_value");
		String currencyCode = rs.getString("currency_code");
		LeadEstimatedValue estimatedValue = null;
		if (estimatedValueAmt != null && currencyCode != null) {
			estimatedValue = new LeadEstimatedValue(estimatedValueAmt, currencyCode);
		}

		String convertedAccIdStr = rs.getString("converted_account_id");
		UUID convertedAccountId = convertedAccIdStr == null
				? null : UUID.fromString(convertedAccIdStr);

		String convertedCtIdStr = rs.getString("converted_contact_id");
		UUID convertedContactId = convertedCtIdStr == null
				? null : UUID.fromString(convertedCtIdStr);

		String convertedOppIdStr = rs.getString("converted_opportunity_id");
		UUID convertedOpportunityId = convertedOppIdStr == null
				? null : UUID.fromString(convertedOppIdStr);

		return Lead.reconstitute(
				TenantId.from(rs.getString("tenant_id")),
				LeadId.from(rs.getString("id")),
				rs.getString("lead_number"),
				UUID.fromString(rs.getString("status_id")),
				sourceId,
				owner,
				rating,
				rs.getString("account_name"),
				rs.getString("company_name"),
				rs.getString("honorific"),
				rs.getString("given_name"),
				rs.getString("family_name"),
				rs.getString("display_name"),
				rs.getString("email"),
				rs.getString("phone_e164"),
				rs.getString("job_title"),
				rs.getString("website"),
				rs.getString("country_code"),
				rs.getString("preferred_language_code"),
				estimatedValue,
				rs.getString("qualification_notes"),
				rs.getString("disqualification_reason"),
				toInstant(rs.getTimestamp("converted_at")),
				toActorId(rs.getString("converted_by")),
				convertedAccountId,
				convertedContactId,
				convertedOpportunityId,
				toInstant(rs.getTimestamp("created_at")),
				toActorId(rs.getString("created_by")),
				toInstant(rs.getTimestamp("updated_at")),
				toActorId(rs.getString("updated_by")),
				toInstant(rs.getTimestamp("deleted_at")),
				toActorId(rs.getString("deleted_by")),
				rs.getLong("version"));
	}

	public static LeadSummary mapSummary(ResultSet rs, int rowNum)
			throws SQLException {
		String ownerUserIdStr = rs.getString("owner_user_id");
		String ownerTeamIdStr = rs.getString("owner_team_id");
		LeadOwner owner = null;
		if (ownerUserIdStr != null) {
			owner = new LeadOwner(
					AccountOwnerType.USER, UUID.fromString(ownerUserIdStr));
		} else if (ownerTeamIdStr != null) {
			owner = new LeadOwner(
					AccountOwnerType.TEAM, UUID.fromString(ownerTeamIdStr));
		}

		String sourceIdStr = rs.getString("source_id");
		UUID sourceId = sourceIdStr == null ? null : UUID.fromString(sourceIdStr);

		String ratingStr = rs.getString("rating");
		LeadRating rating = ratingStr == null ? null : LeadRating.valueOf(ratingStr);

		BigDecimal estimatedValueAmt = rs.getBigDecimal("estimated_value");
		String currencyCode = rs.getString("currency_code");
		LeadEstimatedValue estimatedValue = null;
		if (estimatedValueAmt != null && currencyCode != null) {
			estimatedValue = new LeadEstimatedValue(estimatedValueAmt, currencyCode);
		}

		return new LeadSummary(
				LeadId.from(rs.getString("id")),
				rs.getString("lead_number"),
				UUID.fromString(rs.getString("status_id")),
				sourceId,
				owner,
				rating,
				rs.getString("company_name"),
				rs.getString("display_name"),
				rs.getString("email"),
				rs.getString("phone_e164"),
				rs.getString("job_title"),
				estimatedValue,
				toInstant(rs.getTimestamp("converted_at")),
				toInstant(rs.getTimestamp("updated_at")),
				rs.getLong("version"));
	}

	private static Instant toInstant(Timestamp timestamp) {
		return timestamp == null ? null : timestamp.toInstant();
	}

	private static ActorId toActorId(String value) {
		return value == null ? null : ActorId.from(value);
	}

}
