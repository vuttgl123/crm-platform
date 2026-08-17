package com.crm.marketing.campaign.domain;

import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

import com.crm.customer.contact.domain.ContactId;
import com.crm.customer.lead.domain.LeadId;
import com.crm.sharedkernel.domain.ActorId;
import com.crm.sharedkernel.domain.AuditInfo;
import com.crm.sharedkernel.domain.TenantId;

public final class CampaignMember {

	private final TenantId tenantId;
	private final CampaignMemberId id;
	private final CampaignId campaignId;
	private final LeadId leadId;
	private final ContactId contactId;
	private CampaignMemberStatus memberStatus;
	private String sourceDetail;
	private Instant firstRespondedAt;
	private Instant lastEngagedAt;
	private String metadata;
	private final AuditInfo auditInfo;
	private long version;

	public CampaignMember(TenantId tenantId, CampaignMemberId id, CampaignId campaignId,
			LeadId leadId, ContactId contactId, CampaignMemberStatus memberStatus,
			String sourceDetail, Instant firstRespondedAt, Instant lastEngagedAt,
			String metadata, AuditInfo auditInfo, long version) {
		this.tenantId = Objects.requireNonNull(tenantId, "tenantId must not be null");
		this.id = Objects.requireNonNull(id, "id must not be null");
		this.campaignId = Objects.requireNonNull(campaignId, "campaignId must not be null");
		if ((leadId == null && contactId == null) || (leadId != null && contactId != null)) {
			throw new IllegalArgumentException("Campaign member must be either a Lead or a Contact, but not both or neither");
		}
		this.leadId = leadId;
		this.contactId = contactId;
		this.memberStatus = memberStatus != null ? memberStatus : CampaignMemberStatus.PLANNED;
		this.sourceDetail = sourceDetail;
		this.firstRespondedAt = firstRespondedAt;
		this.lastEngagedAt = lastEngagedAt;
		this.metadata = metadata != null ? metadata : "{}";
		this.auditInfo = Objects.requireNonNull(auditInfo, "auditInfo must not be null");
		this.version = version;
	}

	public static CampaignMember create(TenantId tenantId, CampaignMemberId id,
			CampaignId campaignId, LeadId leadId, ContactId contactId,
			CampaignMemberStatus memberStatus, String sourceDetail, String metadata,
			ActorId actorId, Instant now) {
		return new CampaignMember(tenantId, id, campaignId, leadId, contactId,
				memberStatus != null ? memberStatus : CampaignMemberStatus.PLANNED,
				sourceDetail, null, null,
				metadata != null ? metadata : "{}",
				AuditInfo.create(actorId, now), 1L);
	}

	public void updateStatus(CampaignMemberStatus newStatus, String sourceDetail,
			String metadata, ActorId actorId, Instant now) {
		this.memberStatus = Objects.requireNonNull(newStatus, "newStatus must not be null");
		this.sourceDetail = sourceDetail;
		if (metadata != null) {
			this.metadata = metadata;
		}
		this.lastEngagedAt = now;
		if ((newStatus == CampaignMemberStatus.RESPONDED || newStatus == CampaignMemberStatus.ATTENDED)
				&& this.firstRespondedAt == null) {
			this.firstRespondedAt = now;
		}
		this.auditInfo.update(actorId, now);
		this.version++;
	}

	public TenantId tenantId() {
		return tenantId;
	}

	public CampaignMemberId id() {
		return id;
	}

	public CampaignId campaignId() {
		return campaignId;
	}

	public LeadId leadId() {
		return leadId;
	}

	public ContactId contactId() {
		return contactId;
	}

	public CampaignMemberStatus memberStatus() {
		return memberStatus;
	}

	public String sourceDetail() {
		return sourceDetail;
	}

	public Instant firstRespondedAt() {
		return firstRespondedAt;
	}

	public Instant lastEngagedAt() {
		return lastEngagedAt;
	}

	public String metadata() {
		return metadata;
	}

	public AuditInfo auditInfo() {
		return auditInfo;
	}

	public long version() {
		return version;
	}

}
