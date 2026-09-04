package com.crm.platform.settings.infrastructure.persistence;

import com.crm.foundation.time.TimeProvider;
import com.crm.platform.settings.application.port.TenantSettingsRepository;
import com.crm.platform.settings.application.port.TenantSettingsStore;
import com.crm.platform.settings.domain.TenantSetting;
import com.crm.platform.settings.domain.TenantSettingKey;
import com.crm.platform.settings.domain.TenantSettingsErrorCode;
import com.crm.sharedkernel.domain.ActorId;
import com.crm.sharedkernel.domain.TenantId;
import com.crm.sharedkernel.domain.exception.BusinessRuleViolation;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Component
public class JdbcTenantSettingsStore implements TenantSettingsStore {

	private static final Logger LOGGER = LoggerFactory.getLogger(JdbcTenantSettingsStore.class);
	private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

	private final TenantSettingsRepository settingsRepository;
	private final TimeProvider timeProvider;

	public JdbcTenantSettingsStore(
			TenantSettingsRepository settingsRepository,
			TimeProvider timeProvider) {
		this.settingsRepository = settingsRepository;
		this.timeProvider = timeProvider;
	}

	@Override
	public <T> T read(TenantId tenantId, TenantSettingKey key, Class<T> type, T fallback) {
		return settingsRepository.findByKey(tenantId, key)
				.map(setting -> {
					try {
						return OBJECT_MAPPER.readValue(setting.settingValue(), type);
					}
					catch (Exception e) {
						logUnreadable(tenantId, key, e);
						return fallback;
					}
				})
				.orElse(fallback);
	}

	@Override
	public <T> T read(TenantId tenantId, TenantSettingKey key, TypeReference<T> type, T fallback) {
		return settingsRepository.findByKey(tenantId, key)
				.map(setting -> {
					try {
						return OBJECT_MAPPER.readValue(setting.settingValue(), type);
					}
					catch (Exception e) {
						logUnreadable(tenantId, key, e);
						return fallback;
					}
				})
				.orElse(fallback);
	}

	@Override
	public void write(TenantId tenantId, TenantSettingKey key, Object value, ActorId actorId) {
		String json;
		try {
			json = OBJECT_MAPPER.writeValueAsString(value);
		}
		catch (Exception e) {
			throw new BusinessRuleViolation(TenantSettingsErrorCode.INVALID_SETTING_PAYLOAD);
		}
		TenantSetting setting = settingsRepository.findByKey(tenantId, key)
				.orElseGet(() -> TenantSetting.create(
						tenantId, key, json, false, actorId, timeProvider.now()));
		setting.updateValue(json, actorId, timeProvider.now());
		settingsRepository.save(setting);
	}

	/**
	 * A stored document that no longer deserializes silently reverts the tenant
	 * to defaults. That fallback is preserved from the original implementation,
	 * but it must not be invisible.
	 */
	private static void logUnreadable(TenantId tenantId, TenantSettingKey key, Exception e) {
		LOGGER.warn(
				"Unreadable tenant setting, falling back to default. tenantId={} settingKey={}",
				tenantId.value(), key.code(), e);
	}
}
