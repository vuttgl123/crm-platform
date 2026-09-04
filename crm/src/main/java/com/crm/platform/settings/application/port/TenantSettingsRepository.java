package com.crm.platform.settings.application.port;

import java.util.Map;
import java.util.Optional;

import com.crm.platform.settings.domain.TenantSetting;
import com.crm.platform.settings.domain.TenantSettingKey;
import com.crm.sharedkernel.domain.TenantId;

public interface TenantSettingsRepository {

	Optional<TenantSetting> findByKey(TenantId tenantId, TenantSettingKey key);

	Map<TenantSettingKey, TenantSetting> findAllSettings(TenantId tenantId);

	void save(TenantSetting setting);

	void deleteByKey(TenantId tenantId, TenantSettingKey key);
}
