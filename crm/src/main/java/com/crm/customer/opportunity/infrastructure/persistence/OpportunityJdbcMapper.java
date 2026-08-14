package com.crm.customer.opportunity.infrastructure.persistence;

import java.math.BigDecimal;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

import com.crm.customer.account.domain.AccountOwnerType;
import com.crm.customer.opportunity.application.dto.OpportunitySummary;
import com.crm.customer.opportunity.domain.Opportunity;
import com.crm.customer.opportunity.domain.OpportunityAmount;
import com.crm.customer.opportunity.domain.OpportunityId;
import com.crm.customer.opportunity.domain.OpportunityOwner;
import com.crm.customer.opportunity.domain.OpportunityStatus;
import com.crm.customer.opportunity.domain.OpportunityType;
import com.crm.sharedkernel.domain.ActorId;
import com.crm.sharedkernel.domain.TenantId;

public final class OpportunityJdbcMapper {

	private OpportunityJdbcMapper() {
	}

	public static Opportunity mapOpportunity(ResultSet rs, int rowNum) throws SQLException {
		String ownerUserIdStr = rs.getString("owner_user_id");
		String ownerTeamIdStr = rs.getString("owner_team_id");
		OpportunityOwner owner = null;
		if (ownerUserIdStr != null) {
			owner = new OpportunityOwner(
					AccountOwnerType.USER, UUID.fromString(ownerUserIdStr));
		} else if (ownerTeamIdStr != null) {
			owner = new OpportunityOwner(
					AccountOwnerType.TEAM, UUID.fromString(ownerTeamIdStr));
		}

		String sourceIdStr = rs.getString("source_id");
		UUID sourceId = sourceIdStr == null ? null : UUID.fromString(sourceIdStr);

		String primaryContactIdStr = rs.getString("primary_contact_id");
		UUID primaryContactId = primaryContactIdStr == null ? null : UUID.fromString(primaryContactIdStr);

		String lostReasonIdStr = rs.getString("lost_reason_id");
		UUID lostReasonId = lostReasonIdStr == null ? null : UUID.fromString(lostReasonIdStr);

		String campaignIdStr = rs.getString("campaign_id");
		UUID campaignId = campaignIdStr == null ? null : UUID.fromString(campaignIdStr);

		BigDecimal amountValue = rs.getBigDecimal("amount");
		String currencyCode = rs.getString("currency_code");
		OpportunityAmount amount = new OpportunityAmount(
				amountValue == null ? BigDecimal.ZERO : amountValue,
				currencyCode == null ? "USD" : currencyCode);

		java.sql.Date expCloseSql = rs.getDate("expected_close_date");
		LocalDate expectedCloseDate = expCloseSql == null ? null : expCloseSql.toLocalDate();

		java.sql.Date actCloseSql = rs.getDate("actual_close_date");
		LocalDate actualCloseDate = actCloseSql == null ? null : actCloseSql.toLocalDate();

		return Opportunity.reconstitute(
				TenantId.from(rs.getString("tenant_id")),
				OpportunityId.from(rs.getString("id")),
				rs.getString("opportunity_number"),
				rs.getString("name"),
				UUID.fromString(rs.getString("account_id")),
				UUID.fromString(rs.getString("pipeline_id")),
				UUID.fromString(rs.getString("current_stage_id")),
				owner,
				sourceId,
				primaryContactId,
				OpportunityType.valueOf(rs.getString("opportunity_type")),
				OpportunityStatus.valueOf(rs.getString("status")),
				amount,
				rs.getBigDecimal("probability"),
				expectedCloseDate,
				actualCloseDate,
				rs.getString("next_step"),
				rs.getString("description"),
				lostReasonId,
				rs.getString("lost_reason_notes"),
				campaignId,
				toInstant(rs.getTimestamp("created_at")),
				toActorId(rs.getString("created_by")),
				toInstant(rs.getTimestamp("updated_at")),
				toActorId(rs.getString("updated_by")),
				toInstant(rs.getTimestamp("deleted_at")),
				toActorId(rs.getString("deleted_by")),
				rs.getLong("version"));
	}

	public static OpportunitySummary mapSummary(ResultSet rs, int rowNum) throws SQLException {
		String ownerUserIdStr = rs.getString("owner_user_id");
		String ownerTeamIdStr = rs.getString("owner_team_id");
		OpportunityOwner owner = null;
		if (ownerUserIdStr != null) {
			owner = new OpportunityOwner(
					AccountOwnerType.USER, UUID.fromString(ownerUserIdStr));
		} else if (ownerTeamIdStr != null) {
			owner = new OpportunityOwner(
					AccountOwnerType.TEAM, UUID.fromString(ownerTeamIdStr));
		}

		BigDecimal amountValue = rs.getBigDecimal("amount");
		String currencyCode = rs.getString("currency_code");
		OpportunityAmount amount = new OpportunityAmount(
				amountValue == null ? BigDecimal.ZERO : amountValue,
				currencyCode == null ? "USD" : currencyCode);

		java.sql.Date expCloseSql = rs.getDate("expected_close_date");
		LocalDate expectedCloseDate = expCloseSql == null ? null : expCloseSql.toLocalDate();

		return new OpportunitySummary(
				OpportunityId.from(rs.getString("id")),
				rs.getString("opportunity_number"),
				rs.getString("name"),
				UUID.fromString(rs.getString("account_id")),
				UUID.fromString(rs.getString("pipeline_id")),
				UUID.fromString(rs.getString("current_stage_id")),
				owner,
				OpportunityType.valueOf(rs.getString("opportunity_type")),
				OpportunityStatus.valueOf(rs.getString("status")),
				amount,
				rs.getBigDecimal("probability"),
				expectedCloseDate,
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
