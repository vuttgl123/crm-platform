package com.crm.marketing.campaign.infrastructure.persistence;

import java.math.BigDecimal;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.UUID;

import com.crm.customer.contact.domain.ContactId;
import com.crm.customer.lead.domain.LeadId;
import com.crm.marketing.campaign.application.dto.CampaignMemberDetails;
import com.crm.marketing.campaign.application.dto.CampaignSummary;
import com.crm.marketing.campaign.domain.Campaign;
import com.crm.marketing.campaign.domain.CampaignId;
import com.crm.marketing.campaign.domain.CampaignMember;
import com.crm.marketing.campaign.domain.CampaignMemberId;
import com.crm.marketing.campaign.domain.CampaignMemberStatus;
import com.crm.marketing.campaign.domain.CampaignStatus;
import com.crm.marketing.campaign.domain.CampaignType;
import com.crm.sharedkernel.domain.ActorId;
import com.crm.sharedkernel.domain.AuditInfo;
import com.crm.sharedkernel.domain.TenantId;

public final class CampaignJdbcMapper {

	private CampaignJdbcMapper() {
	}

	public static Campaign mapCampaign(ResultSet rs, int rowNum) throws SQLException {
		TenantId tenantId = TenantId.from(rs.getObject("tenant_id", UUID.class));
		CampaignId id = CampaignId.from(rs.getObject("id", UUID.class));
		String campaignCode = rs.getString("campaign_code");
		String name = rs.getString("name");

		String typeStr = rs.getString("campaign_type");
		CampaignType campaignType = typeStr != null ? CampaignType.valueOf(typeStr) : CampaignType.OTHER;

		String statusStr = rs.getString("status");
		CampaignStatus status = statusStr != null ? CampaignStatus.valueOf(statusStr) : CampaignStatus.PLANNED;

		UUID ownerUuid = rs.getObject("owner_user_id", UUID.class);
		ActorId ownerUserId = ownerUuid != null ? new ActorId(ownerUuid) : null;

		Timestamp startAtTs = rs.getTimestamp("start_at");
		Instant startAt = startAtTs != null ? startAtTs.toInstant() : null;

		Timestamp endAtTs = rs.getTimestamp("end_at");
		Instant endAt = endAtTs != null ? endAtTs.toInstant() : null;

		BigDecimal budget = rs.getBigDecimal("budget");
		BigDecimal actualCost = rs.getBigDecimal("actual_cost");
		String currencyCode = rs.getString("currency_code");
		BigDecimal expectedRevenue = rs.getBigDecimal("expected_revenue");
		String description = rs.getString("description");
		String utmSource = rs.getString("utm_source");
		String utmMedium = rs.getString("utm_medium");
		String utmCampaign = rs.getString("utm_campaign");

		UUID createdByUuid = rs.getObject("created_by", UUID.class);
		ActorId createdBy = createdByUuid != null ? new ActorId(createdByUuid) : null;
		Timestamp createdAtTs = rs.getTimestamp("created_at");
		Instant createdAt = createdAtTs != null ? createdAtTs.toInstant() : Instant.now();

		UUID updatedByUuid = rs.getObject("updated_by", UUID.class);
		ActorId updatedBy = updatedByUuid != null ? new ActorId(updatedByUuid) : null;
		Timestamp updatedAtTs = rs.getTimestamp("updated_at");
		Instant updatedAt = updatedAtTs != null ? updatedAtTs.toInstant() : createdAt;

		Timestamp deletedAtTs = rs.getTimestamp("deleted_at");
		Instant deletedAt = deletedAtTs != null ? deletedAtTs.toInstant() : null;
		UUID deletedByUuid = rs.getObject("deleted_by", UUID.class);
		ActorId deletedBy = deletedByUuid != null ? new ActorId(deletedByUuid) : null;

		long version = rs.getLong("version");

		AuditInfo auditInfo = AuditInfo.restore(createdBy, createdAt, updatedBy, updatedAt);

		return new Campaign(tenantId, id, campaignCode, name, campaignType, status,
				ownerUserId, startAt, endAt, budget, actualCost, currencyCode,
				expectedRevenue, description, utmSource, utmMedium, utmCampaign,
				auditInfo, deletedAt, deletedBy, version);
	}

	public static CampaignSummary mapSummary(ResultSet rs, int rowNum) throws SQLException {
		UUID id = rs.getObject("id", UUID.class);
		String campaignCode = rs.getString("campaign_code");
		String name = rs.getString("name");

		String typeStr = rs.getString("campaign_type");
		CampaignType campaignType = typeStr != null ? CampaignType.valueOf(typeStr) : CampaignType.OTHER;

		String statusStr = rs.getString("status");
		CampaignStatus status = statusStr != null ? CampaignStatus.valueOf(statusStr) : CampaignStatus.PLANNED;

		UUID ownerUserId = rs.getObject("owner_user_id", UUID.class);
		String ownerUserName = rs.getString("owner_user_name");

		Timestamp startAtTs = rs.getTimestamp("start_at");
		Instant startAt = startAtTs != null ? startAtTs.toInstant() : null;

		Timestamp endAtTs = rs.getTimestamp("end_at");
		Instant endAt = endAtTs != null ? endAtTs.toInstant() : null;

		BigDecimal budget = rs.getBigDecimal("budget");
		BigDecimal actualCost = rs.getBigDecimal("actual_cost");
		String currencyCode = rs.getString("currency_code");
		BigDecimal expectedRevenue = rs.getBigDecimal("expected_revenue");

		int membersCount = rs.getInt("members_count");
		int respondedCount = rs.getInt("responded_count");
		BigDecimal wonRevenue = rs.getBigDecimal("won_revenue");
		if (wonRevenue == null) {
			wonRevenue = BigDecimal.ZERO;
		}

		Timestamp updatedAtTs = rs.getTimestamp("updated_at");
		Instant updatedAt = updatedAtTs != null ? updatedAtTs.toInstant() : Instant.now();
		long version = rs.getLong("version");

		return new CampaignSummary(id, campaignCode, name, campaignType, status,
				ownerUserId, ownerUserName, startAt, endAt, budget, actualCost,
				currencyCode, expectedRevenue, membersCount, respondedCount,
				wonRevenue, updatedAt, version);
	}

	public static CampaignMemberDetails mapMemberDetails(ResultSet rs, int rowNum) throws SQLException {
		UUID id = rs.getObject("id", UUID.class);
		UUID campaignId = rs.getObject("campaign_id", UUID.class);
		UUID leadId = rs.getObject("lead_id", UUID.class);
		String leadName = rs.getString("lead_name");
		String leadCompany = rs.getString("lead_company");
		String leadEmail = rs.getString("lead_email");

		UUID contactId = rs.getObject("contact_id", UUID.class);
		String contactName = rs.getString("contact_name");
		String contactEmail = rs.getString("contact_email");

		String statusStr = rs.getString("member_status");
		CampaignMemberStatus memberStatus = statusStr != null ? CampaignMemberStatus.valueOf(statusStr) : CampaignMemberStatus.PLANNED;

		String sourceDetail = rs.getString("source_detail");

		Timestamp firstRespondedAtTs = rs.getTimestamp("first_responded_at");
		Instant firstRespondedAt = firstRespondedAtTs != null ? firstRespondedAtTs.toInstant() : null;

		Timestamp lastEngagedAtTs = rs.getTimestamp("last_engaged_at");
		Instant lastEngagedAt = lastEngagedAtTs != null ? lastEngagedAtTs.toInstant() : null;

		String metadata = rs.getString("metadata");

		UUID createdBy = rs.getObject("created_by", UUID.class);
		Timestamp createdAtTs = rs.getTimestamp("created_at");
		Instant createdAt = createdAtTs != null ? createdAtTs.toInstant() : Instant.now();

		UUID updatedBy = rs.getObject("updated_by", UUID.class);
		Timestamp updatedAtTs = rs.getTimestamp("updated_at");
		Instant updatedAt = updatedAtTs != null ? updatedAtTs.toInstant() : createdAt;

		long version = rs.getLong("version");

		return new CampaignMemberDetails(id, campaignId, leadId, leadName, leadCompany,
				leadEmail, contactId, contactName, contactEmail, memberStatus,
				sourceDetail, firstRespondedAt, lastEngagedAt, metadata,
				createdBy, createdAt, updatedBy, updatedAt, version);
	}

	public static CampaignMember mapMember(ResultSet rs, int rowNum) throws SQLException {
		TenantId tenantId = TenantId.from(rs.getObject("tenant_id", UUID.class));
		CampaignMemberId id = CampaignMemberId.from(rs.getObject("id", UUID.class));
		CampaignId campaignId = CampaignId.from(rs.getObject("campaign_id", UUID.class));

		UUID leadUuid = rs.getObject("lead_id", UUID.class);
		LeadId leadId = leadUuid != null ? LeadId.from(leadUuid) : null;

		UUID contactUuid = rs.getObject("contact_id", UUID.class);
		ContactId contactId = contactUuid != null ? ContactId.from(contactUuid) : null;

		String statusStr = rs.getString("member_status");
		CampaignMemberStatus memberStatus = statusStr != null ? CampaignMemberStatus.valueOf(statusStr) : CampaignMemberStatus.PLANNED;

		String sourceDetail = rs.getString("source_detail");

		Timestamp firstRespondedAtTs = rs.getTimestamp("first_responded_at");
		Instant firstRespondedAt = firstRespondedAtTs != null ? firstRespondedAtTs.toInstant() : null;

		Timestamp lastEngagedAtTs = rs.getTimestamp("last_engaged_at");
		Instant lastEngagedAt = lastEngagedAtTs != null ? lastEngagedAtTs.toInstant() : null;

		String metadata = rs.getString("metadata");

		UUID createdByUuid = rs.getObject("created_by", UUID.class);
		ActorId createdBy = createdByUuid != null ? new ActorId(createdByUuid) : null;
		Timestamp createdAtTs = rs.getTimestamp("created_at");
		Instant createdAt = createdAtTs != null ? createdAtTs.toInstant() : Instant.now();

		UUID updatedByUuid = rs.getObject("updated_by", UUID.class);
		ActorId updatedBy = updatedByUuid != null ? new ActorId(updatedByUuid) : null;
		Timestamp updatedAtTs = rs.getTimestamp("updated_at");
		Instant updatedAt = updatedAtTs != null ? updatedAtTs.toInstant() : createdAt;

		long version = rs.getLong("version");

		AuditInfo auditInfo = AuditInfo.restore(createdBy, createdAt, updatedBy, updatedAt);

		return new CampaignMember(tenantId, id, campaignId, leadId, contactId,
				memberStatus, sourceDetail, firstRespondedAt, lastEngagedAt,
				metadata, auditInfo, version);
	}

}
