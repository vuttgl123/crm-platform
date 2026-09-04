package com.crm.platform.settings.application.port;

import com.crm.platform.settings.domain.TenantSettingKey;
import com.crm.sharedkernel.domain.ActorId;
import com.crm.sharedkernel.domain.TenantId;
import com.fasterxml.jackson.core.type.TypeReference;

/**
 * Typed access to the JSON documents stored in {@code platform_tenant_settings}.
 * Serialization lives behind this port so the application layer never touches a
 * JSON codec, matching how {@code JdbcImportJobRepository} keeps Jackson inside
 * infrastructure.
 */
public interface TenantSettingsStore {

	<T> T read(TenantId tenantId, TenantSettingKey key, Class<T> type, T fallback);

	<T> T read(TenantId tenantId, TenantSettingKey key, TypeReference<T> type, T fallback);

	void write(TenantId tenantId, TenantSettingKey key, Object value, ActorId actorId);
}
