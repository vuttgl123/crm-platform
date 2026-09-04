package com.crm.platform.settings.domain;

import java.time.Instant;
import java.util.Objects;

import com.crm.sharedkernel.domain.ActorId;
import com.crm.sharedkernel.domain.TenantId;

public class TenantSetting {

	private final TenantId tenantId;
	private final TenantSettingKey settingKey;
	private String settingValue;
	private boolean isSecretReference;
	private Instant updatedAt;
	private ActorId updatedBy;
	private long version;

	public TenantSetting(
			TenantId tenantId,
			TenantSettingKey settingKey,
			String settingValue,
			boolean isSecretReference,
			Instant updatedAt,
			ActorId updatedBy,
			long version) {
		this.tenantId = Objects.requireNonNull(tenantId, "tenantId must not be null");
		this.settingKey = Objects.requireNonNull(settingKey, "settingKey must not be null");
		this.settingValue = Objects.requireNonNull(settingValue, "settingValue must not be null");
		this.isSecretReference = isSecretReference;
		this.updatedAt = Objects.requireNonNull(updatedAt, "updatedAt must not be null");
		this.updatedBy = updatedBy;
		this.version = version;
	}

	public static TenantSetting create(
			TenantId tenantId,
			TenantSettingKey settingKey,
			String settingValue,
			boolean isSecretReference,
			ActorId updatedBy,
			Instant now) {
		return new TenantSetting(tenantId, settingKey, settingValue, isSecretReference, now, updatedBy, 1L);
	}

	public void updateValue(String newValue, ActorId actorId, Instant now) {
		this.settingValue = Objects.requireNonNull(newValue, "newValue must not be null");
		this.updatedBy = actorId;
		this.updatedAt = Objects.requireNonNull(now, "now must not be null");
		this.version++;
	}

	public TenantId tenantId() {
		return tenantId;
	}

	public TenantSettingKey settingKey() {
		return settingKey;
	}

	public String settingValue() {
		return settingValue;
	}

	public boolean isSecretReference() {
		return isSecretReference;
	}

	public Instant updatedAt() {
		return updatedAt;
	}

	public ActorId updatedBy() {
		return updatedBy;
	}

	public long version() {
		return version;
	}
}
