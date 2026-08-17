package com.crm.customer.customfield.domain;

import java.time.Instant;
import java.util.Objects;

import com.crm.sharedkernel.domain.ActorId;
import com.crm.sharedkernel.domain.AuditInfo;
import com.crm.sharedkernel.domain.TenantId;

public final class CustomFieldDefinition {

	private final TenantId tenantId;
	private final CustomFieldDefinitionId id;
	private final String entityType;
	private final String fieldKey;
	private String displayName;
	private final CustomFieldDataType dataType;
	private String description;
	private String validationRulesJson;
	private String optionValuesJson;
	private boolean required;
	private boolean searchable;
	private boolean sensitive;
	private boolean active;
	private int displayOrder;
	private final AuditInfo auditInfo;
	private long version;

	public CustomFieldDefinition(
			TenantId tenantId,
			CustomFieldDefinitionId id,
			String entityType,
			String fieldKey,
			String displayName,
			CustomFieldDataType dataType,
			String description,
			String validationRulesJson,
			String optionValuesJson,
			boolean required,
			boolean searchable,
			boolean sensitive,
			boolean active,
			int displayOrder,
			AuditInfo auditInfo,
			long version) {
		this.tenantId = Objects.requireNonNull(tenantId, "tenantId must not be null");
		this.id = Objects.requireNonNull(id, "id must not be null");
		this.entityType = Objects.requireNonNull(entityType, "entityType must not be null").trim().toUpperCase();
		this.fieldKey = Objects.requireNonNull(fieldKey, "fieldKey must not be null").trim().toLowerCase();
		this.displayName = Objects.requireNonNull(displayName, "displayName must not be null").trim();
		this.dataType = Objects.requireNonNull(dataType, "dataType must not be null");
		this.description = description;
		this.validationRulesJson = validationRulesJson != null && !validationRulesJson.isBlank() ? validationRulesJson : "{}";
		this.optionValuesJson = optionValuesJson != null && !optionValuesJson.isBlank() ? optionValuesJson : "[]";
		this.required = required;
		this.searchable = searchable;
		this.sensitive = sensitive;
		this.active = active;
		this.displayOrder = displayOrder;
		this.auditInfo = Objects.requireNonNull(auditInfo, "auditInfo must not be null");
		this.version = version;
	}

	public static CustomFieldDefinition create(
			TenantId tenantId,
			CustomFieldDefinitionId id,
			String entityType,
			String fieldKey,
			String displayName,
			CustomFieldDataType dataType,
			String description,
			String validationRulesJson,
			String optionValuesJson,
			boolean required,
			boolean searchable,
			boolean sensitive,
			int displayOrder,
			ActorId actorId,
			Instant now) {
		return new CustomFieldDefinition(
				tenantId,
				id,
				entityType,
				fieldKey,
				displayName,
				dataType,
				description,
				validationRulesJson,
				optionValuesJson,
				required,
				searchable,
				sensitive,
				true,
				displayOrder,
				AuditInfo.create(actorId, now),
				1L
		);
	}

	public void update(
			String displayName,
			String description,
			String validationRulesJson,
			String optionValuesJson,
			boolean required,
			boolean searchable,
			boolean sensitive,
			boolean active,
			int displayOrder,
			ActorId actorId,
			Instant now) {
		this.displayName = Objects.requireNonNull(displayName, "displayName must not be null").trim();
		this.description = description;
		this.validationRulesJson = validationRulesJson != null && !validationRulesJson.isBlank() ? validationRulesJson : "{}";
		this.optionValuesJson = optionValuesJson != null && !optionValuesJson.isBlank() ? optionValuesJson : "[]";
		this.required = required;
		this.searchable = searchable;
		this.sensitive = sensitive;
		this.active = active;
		this.displayOrder = displayOrder;
		this.auditInfo.update(actorId, now);
		this.version++;
	}

	public TenantId tenantId() {
		return tenantId;
	}

	public CustomFieldDefinitionId id() {
		return id;
	}

	public String entityType() {
		return entityType;
	}

	public String fieldKey() {
		return fieldKey;
	}

	public String displayName() {
		return displayName;
	}

	public CustomFieldDataType dataType() {
		return dataType;
	}

	public String description() {
		return description;
	}

	public String validationRulesJson() {
		return validationRulesJson;
	}

	public String optionValuesJson() {
		return optionValuesJson;
	}

	public boolean isRequired() {
		return required;
	}

	public boolean isSearchable() {
		return searchable;
	}

	public boolean isSensitive() {
		return sensitive;
	}

	public boolean isActive() {
		return active;
	}

	public int displayOrder() {
		return displayOrder;
	}

	public AuditInfo auditInfo() {
		return auditInfo;
	}

	public long version() {
		return version;
	}

}
