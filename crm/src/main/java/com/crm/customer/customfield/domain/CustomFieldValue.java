package com.crm.customer.customfield.domain;

import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

import com.crm.sharedkernel.domain.ActorId;
import com.crm.sharedkernel.domain.AuditInfo;
import com.crm.sharedkernel.domain.TenantId;

public final class CustomFieldValue {

	private final TenantId tenantId;
	private final CustomFieldValueId id;
	private final CustomFieldDefinitionId definitionId;
	private final String entityType;
	private final UUID entityId;
	private String valueJson;
	private String searchText;
	private final AuditInfo auditInfo;
	private long version;

	public CustomFieldValue(
			TenantId tenantId,
			CustomFieldValueId id,
			CustomFieldDefinitionId definitionId,
			String entityType,
			UUID entityId,
			String valueJson,
			String searchText,
			AuditInfo auditInfo,
			long version) {
		this.tenantId = Objects.requireNonNull(tenantId, "tenantId must not be null");
		this.id = Objects.requireNonNull(id, "id must not be null");
		this.definitionId = Objects.requireNonNull(definitionId, "definitionId must not be null");
		this.entityType = Objects.requireNonNull(entityType, "entityType must not be null").trim().toUpperCase();
		this.entityId = Objects.requireNonNull(entityId, "entityId must not be null");
		this.valueJson = Objects.requireNonNull(valueJson, "valueJson must not be null");
		this.searchText = searchText;
		this.auditInfo = Objects.requireNonNull(auditInfo, "auditInfo must not be null");
		this.version = version;
	}

	public static CustomFieldValue create(
			TenantId tenantId,
			CustomFieldValueId id,
			CustomFieldDefinitionId definitionId,
			String entityType,
			UUID entityId,
			String valueJson,
			String searchText,
			ActorId actorId,
			Instant now) {
		return new CustomFieldValue(
				tenantId,
				id,
				definitionId,
				entityType,
				entityId,
				valueJson,
				searchText,
				AuditInfo.create(actorId, now),
				1L
		);
	}

	public void updateValue(String valueJson, String searchText, ActorId actorId, Instant now) {
		this.valueJson = Objects.requireNonNull(valueJson, "valueJson must not be null");
		this.searchText = searchText;
		this.auditInfo.update(actorId, now);
		this.version++;
	}

	public TenantId tenantId() {
		return tenantId;
	}

	public CustomFieldValueId id() {
		return id;
	}

	public CustomFieldDefinitionId definitionId() {
		return definitionId;
	}

	public String entityType() {
		return entityType;
	}

	public UUID entityId() {
		return entityId;
	}

	public String valueJson() {
		return valueJson;
	}

	public String searchText() {
		return searchText;
	}

	public AuditInfo auditInfo() {
		return auditInfo;
	}

	public long version() {
		return version;
	}

}
