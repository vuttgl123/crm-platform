package com.crm.marketing.campaign.domain;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

import com.crm.sharedkernel.domain.ActorId;
import com.crm.sharedkernel.domain.AuditInfo;
import com.crm.sharedkernel.domain.TenantId;

public final class Campaign {

	private final TenantId tenantId;
	private final CampaignId id;
	private String campaignCode;
	private String name;
	private CampaignType campaignType;
	private CampaignStatus status;
	private ActorId ownerUserId;
	private Instant startAt;
	private Instant endAt;
	private BigDecimal budget;
	private BigDecimal actualCost;
	private String currencyCode;
	private BigDecimal expectedRevenue;
	private String description;
	private String utmSource;
	private String utmMedium;
	private String utmCampaign;
	private final AuditInfo auditInfo;
	private Instant deletedAt;
	private ActorId deletedBy;
	private long version;

	public Campaign(TenantId tenantId, CampaignId id, String campaignCode,
			String name, CampaignType campaignType, CampaignStatus status,
			ActorId ownerUserId, Instant startAt, Instant endAt,
			BigDecimal budget, BigDecimal actualCost, String currencyCode,
			BigDecimal expectedRevenue, String description, String utmSource,
			String utmMedium, String utmCampaign, AuditInfo auditInfo,
			Instant deletedAt, ActorId deletedBy, long version) {
		this.tenantId = Objects.requireNonNull(tenantId, "tenantId must not be null");
		this.id = Objects.requireNonNull(id, "id must not be null");
		this.campaignCode = Objects.requireNonNull(campaignCode, "campaignCode must not be null");
		this.name = Objects.requireNonNull(name, "name must not be null");
		this.campaignType = campaignType != null ? campaignType : CampaignType.OTHER;
		this.status = status != null ? status : CampaignStatus.PLANNED;
		this.ownerUserId = ownerUserId;
		if (startAt != null && endAt != null && endAt.isBefore(startAt)) {
			throw new IllegalArgumentException("endAt must be after or equal to startAt");
		}
		this.startAt = startAt;
		this.endAt = endAt;
		this.budget = budget != null ? budget : BigDecimal.ZERO;
		this.actualCost = actualCost != null ? actualCost : BigDecimal.ZERO;
		this.currencyCode = currencyCode != null ? currencyCode : "VND";
		this.expectedRevenue = expectedRevenue != null ? expectedRevenue : BigDecimal.ZERO;
		this.description = description;
		this.utmSource = utmSource;
		this.utmMedium = utmMedium;
		this.utmCampaign = utmCampaign;
		this.auditInfo = Objects.requireNonNull(auditInfo, "auditInfo must not be null");
		this.deletedAt = deletedAt;
		this.deletedBy = deletedBy;
		this.version = version;
	}

	public static Campaign create(TenantId tenantId, CampaignId id, String campaignCode,
			String name, CampaignType campaignType, ActorId ownerUserId,
			Instant startAt, Instant endAt, BigDecimal budget, BigDecimal expectedRevenue,
			String currencyCode, String description, String utmSource, String utmMedium,
			String utmCampaign, ActorId actorId, Instant now) {
		return new Campaign(tenantId, id, campaignCode.trim().toUpperCase(),
				name.trim(), campaignType, CampaignStatus.PLANNED,
				ownerUserId != null ? ownerUserId : actorId, startAt, endAt,
				budget != null ? budget : BigDecimal.ZERO, BigDecimal.ZERO,
				currencyCode != null ? currencyCode : "VND",
				expectedRevenue != null ? expectedRevenue : BigDecimal.ZERO,
				description, utmSource, utmMedium, utmCampaign,
				AuditInfo.create(actorId, now), null, null, 1L);
	}

	public void update(String name, CampaignType campaignType, CampaignStatus status,
			ActorId ownerUserId, Instant startAt, Instant endAt, BigDecimal budget,
			BigDecimal actualCost, BigDecimal expectedRevenue, String currencyCode,
			String description, String utmSource, String utmMedium, String utmCampaign,
			ActorId actorId, Instant now) {
		if (startAt != null && endAt != null && endAt.isBefore(startAt)) {
			throw new IllegalArgumentException("endAt must be after or equal to startAt");
		}
		this.name = Objects.requireNonNull(name, "name must not be null").trim();
		this.campaignType = campaignType != null ? campaignType : this.campaignType;
		this.status = status != null ? status : this.status;
		this.ownerUserId = ownerUserId;
		this.startAt = startAt;
		this.endAt = endAt;
		this.budget = budget != null ? budget : this.budget;
		this.actualCost = actualCost != null ? actualCost : this.actualCost;
		this.expectedRevenue = expectedRevenue != null ? expectedRevenue : this.expectedRevenue;
		this.currencyCode = currencyCode != null ? currencyCode : this.currencyCode;
		this.description = description;
		this.utmSource = utmSource;
		this.utmMedium = utmMedium;
		this.utmCampaign = utmCampaign;
		this.auditInfo.update(actorId, now);
		this.version++;
	}

	public void markDeleted(ActorId actorId, Instant now) {
		this.deletedAt = now;
		this.deletedBy = actorId;
		this.auditInfo.update(actorId, now);
		this.version++;
	}

	public TenantId tenantId() {
		return tenantId;
	}

	public CampaignId id() {
		return id;
	}

	public String campaignCode() {
		return campaignCode;
	}

	public String name() {
		return name;
	}

	public CampaignType campaignType() {
		return campaignType;
	}

	public CampaignStatus status() {
		return status;
	}

	public ActorId ownerUserId() {
		return ownerUserId;
	}

	public Instant startAt() {
		return startAt;
	}

	public Instant endAt() {
		return endAt;
	}

	public BigDecimal budget() {
		return budget;
	}

	public BigDecimal actualCost() {
		return actualCost;
	}

	public String currencyCode() {
		return currencyCode;
	}

	public BigDecimal expectedRevenue() {
		return expectedRevenue;
	}

	public String description() {
		return description;
	}

	public String utmSource() {
		return utmSource;
	}

	public String utmMedium() {
		return utmMedium;
	}

	public String utmCampaign() {
		return utmCampaign;
	}

	public AuditInfo auditInfo() {
		return auditInfo;
	}

	public Instant deletedAt() {
		return deletedAt;
	}

	public ActorId deletedBy() {
		return deletedBy;
	}

	public long version() {
		return version;
	}

}
