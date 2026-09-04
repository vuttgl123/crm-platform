package com.crm.platform.settings.infrastructure.persistence;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import com.crm.platform.settings.application.port.TenantSettingsRepository;
import com.crm.platform.settings.domain.TenantSetting;
import com.crm.platform.settings.domain.TenantSettingKey;
import com.crm.sharedkernel.domain.ActorId;
import com.crm.sharedkernel.domain.TenantId;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;

@Repository
public class JdbcTenantSettingsRepository implements TenantSettingsRepository {

	private final JdbcClient jdbcClient;

	public JdbcTenantSettingsRepository(JdbcClient jdbcClient) {
		this.jdbcClient = jdbcClient;
	}

	@Override
	public Optional<TenantSetting> findByKey(TenantId tenantId, TenantSettingKey key) {
		return jdbcClient.sql("""
				SELECT tenant_id, setting_key, setting_value, is_secret_reference,
				       updated_at, updated_by, version
				FROM platform_tenant_settings
				WHERE tenant_id = :tenantId AND setting_key = :settingKey
				""")
				.param("tenantId", tenantId.value().toString())
				.param("settingKey", key.code())
				.query(this::mapRow)
				.optional();
	}

	@Override
	public Map<TenantSettingKey, TenantSetting> findAllSettings(TenantId tenantId) {
		List<TenantSetting> list = jdbcClient.sql("""
				SELECT tenant_id, setting_key, setting_value, is_secret_reference,
				       updated_at, updated_by, version
				FROM platform_tenant_settings
				WHERE tenant_id = :tenantId
				""")
				.param("tenantId", tenantId.value().toString())
				.query(this::mapRow)
				.list();

		Map<TenantSettingKey, TenantSetting> map = new HashMap<>();
		for (TenantSetting s : list) {
			map.put(s.settingKey(), s);
		}
		return map;
	}

	@Override
	public void save(TenantSetting setting) {
		jdbcClient.sql("""
				INSERT INTO platform_tenant_settings (
				    tenant_id, setting_key, setting_value, is_secret_reference,
				    updated_at, updated_by, version
				) VALUES (
				    :tenantId, :settingKey, :settingValue, :isSecretReference,
				    :updatedAt, :updatedBy, :version
				)
				ON DUPLICATE KEY UPDATE
				    setting_value = VALUES(setting_value),
				    is_secret_reference = VALUES(is_secret_reference),
				    updated_at = VALUES(updated_at),
				    updated_by = VALUES(updated_by),
				    version = platform_tenant_settings.version + 1
				""")
				.param("tenantId", setting.tenantId().value().toString())
				.param("settingKey", setting.settingKey().code())
				.param("settingValue", setting.settingValue())
				.param("isSecretReference", setting.isSecretReference())
				.param("updatedAt", Timestamp.from(setting.updatedAt()))
				.param("updatedBy", setting.updatedBy() != null ? setting.updatedBy().value().toString() : null)
				.param("version", setting.version())
				.update();
	}

	@Override
	public void deleteByKey(TenantId tenantId, TenantSettingKey key) {
		jdbcClient.sql("""
				DELETE FROM platform_tenant_settings
				WHERE tenant_id = :tenantId AND setting_key = :settingKey
				""")
				.param("tenantId", tenantId.value().toString())
				.param("settingKey", key.code())
				.update();
	}

	private TenantSetting mapRow(ResultSet rs, int rowNum) throws SQLException {
		String keyStr = rs.getString("setting_key");
		TenantSettingKey settingKey;
		try {
			settingKey = TenantSettingKey.fromCode(keyStr);
		} catch (IllegalArgumentException e) {
			settingKey = TenantSettingKey.PROFILE;
		}

		String updatedByStr = rs.getString("updated_by");
		ActorId updatedBy = updatedByStr != null ? new ActorId(UUID.fromString(updatedByStr)) : null;

		return new TenantSetting(
				new TenantId(UUID.fromString(rs.getString("tenant_id"))),
				settingKey,
				rs.getString("setting_value"),
				rs.getBoolean("is_secret_reference"),
				rs.getTimestamp("updated_at").toInstant(),
				updatedBy,
				rs.getLong("version")
		);
	}
}
