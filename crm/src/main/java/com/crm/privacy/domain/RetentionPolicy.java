package com.crm.privacy.domain;

import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

import com.crm.sharedkernel.domain.ActorId;
import com.crm.sharedkernel.domain.AuditInfo;
import com.crm.sharedkernel.domain.TenantId;

public final class RetentionPolicy {

	private final TenantId tenantId;
	private final RetentionPolicyId id;
	private String entityType;
	private String purpose;
	private int retentionDays;
	private RetentionAction actionOnExpiry;
	private String legalBasis;
	private boolean active;
	private final AuditInfo auditInfo;
	private long version;

	public RetentionPolicy(TenantId tenantId, RetentionPolicyId id, String entityType,
			String purpose, int retentionDays, RetentionAction actionOnExpiry,
			String legalBasis, boolean active, AuditInfo auditInfo, long version) {
		this.tenantId = Objects.requireNonNull(tenantId, "tenantId must not be null");
		this.id = Objects.requireNonNull(id, "id must not be null");
		this.entityType = Objects.requireNonNull(entityType, "entityType must not be null").trim().toUpperCase();
		this.purpose = Objects.requireNonNull(purpose, "purpose must not be null").trim();
		if (retentionDays < 0) {
			throw new IllegalArgumentException("retentionDays must be greater than or equal to 0");
		}
		this.retentionDays = retentionDays;
		this.actionOnExpiry = Objects.requireNonNull(actionOnExpiry, "actionOnExpiry must not be null");
		this.legalBasis = legalBasis;
		this.active = active;
		this.auditInfo = Objects.requireNonNull(auditInfo, "auditInfo must not be null");
		this.version = version;
	}

	public static RetentionPolicy create(TenantId tenantId, RetentionPolicyId id,
			String entityType, String purpose, int retentionDays,
			RetentionAction actionOnExpiry, String legalBasis, ActorId actorId, Instant now) {
		return new RetentionPolicy(tenantId, id, entityType, purpose, retentionDays,
				actionOnExpiry, legalBasis, true, AuditInfo.create(actorId, now), 1L);
	}

	public void update(int retentionDays, RetentionAction actionOnExpiry,
			String legalBasis, boolean active, ActorId actorId, Instant now) {
		if (retentionDays < 0) {
			throw new IllegalArgumentException("retentionDays must be greater than or equal to 0");
		}
		this.retentionDays = retentionDays;
		this.actionOnExpiry = Objects.requireNonNull(actionOnExpiry, "actionOnExpiry must not be null");
		this.legalBasis = legalBasis;
		this.active = active;
		this.auditInfo.update(actorId, now);
		this.version++;
	}

	public TenantId tenantId() {
		return tenantId;
	}

	public RetentionPolicyId id() {
		return id;
	}

	public String entityType() {
		return entityType;
	}

	public String purpose() {
		return purpose;
	}

	public int retentionDays() {
		return retentionDays;
	}

	public RetentionAction actionOnExpiry() {
		return actionOnExpiry;
	}

	public String legalBasis() {
		return legalBasis;
	}

	public boolean isActive() {
		return active;
	}

	public AuditInfo auditInfo() {
		return auditInfo;
	}

	public long version() {
		return version;
	}

}
