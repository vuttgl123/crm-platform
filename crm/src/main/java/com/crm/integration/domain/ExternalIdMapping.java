package com.crm.integration.domain;

import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

import com.crm.sharedkernel.domain.ActorId;
import com.crm.sharedkernel.domain.AuditInfo;
import com.crm.sharedkernel.domain.TenantId;

public final class ExternalIdMapping {

	private final TenantId tenantId;
	private final ExternalMappingId id;
	private String integrationKey;
	private String entityType;
	private UUID internalEntityId;
	private String externalEntityId;
	private String externalVersion;
	private Instant lastSyncedAt;
	private String metadata;
	private final AuditInfo auditInfo;
	private long version;

	public ExternalIdMapping(TenantId tenantId, ExternalMappingId id, String integrationKey,
			String entityType, UUID internalEntityId, String externalEntityId,
			String externalVersion, Instant lastSyncedAt, String metadata,
			AuditInfo auditInfo, long version) {
		this.tenantId = Objects.requireNonNull(tenantId, "tenantId must not be null");
		this.id = Objects.requireNonNull(id, "id must not be null");
		this.integrationKey = Objects.requireNonNull(integrationKey, "integrationKey must not be null");
		this.entityType = Objects.requireNonNull(entityType, "entityType must not be null");
		this.internalEntityId = Objects.requireNonNull(internalEntityId, "internalEntityId must not be null");
		this.externalEntityId = Objects.requireNonNull(externalEntityId, "externalEntityId must not be null");
		this.externalVersion = externalVersion;
		this.lastSyncedAt = lastSyncedAt;
		this.metadata = metadata != null ? metadata : "{}";
		this.auditInfo = Objects.requireNonNull(auditInfo, "auditInfo must not be null");
		this.version = version;
	}

	public static ExternalIdMapping create(TenantId tenantId, ExternalMappingId id,
			String integrationKey, String entityType, UUID internalEntityId,
			String externalEntityId, String externalVersion, String metadata,
			ActorId actorId, Instant now) {
		return new ExternalIdMapping(tenantId, id, integrationKey.trim(),
				entityType.trim().toUpperCase(), internalEntityId, externalEntityId.trim(),
				externalVersion, now, metadata != null ? metadata : "{}",
				AuditInfo.create(actorId, now), 1L);
	}

	public void update(String externalVersion, String metadata, ActorId actorId, Instant now) {
		this.externalVersion = externalVersion;
		if (metadata != null) {
			this.metadata = metadata;
		}
		this.lastSyncedAt = now;
		this.auditInfo.update(actorId, now);
		this.version++;
	}

	public TenantId tenantId() {
		return tenantId;
	}

	public ExternalMappingId id() {
		return id;
	}

	public String integrationKey() {
		return integrationKey;
	}

	public String entityType() {
		return entityType;
	}

	public UUID internalEntityId() {
		return internalEntityId;
	}

	public String externalEntityId() {
		return externalEntityId;
	}

	public String externalVersion() {
		return externalVersion;
	}

	public Instant lastSyncedAt() {
		return lastSyncedAt;
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
