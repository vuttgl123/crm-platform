package com.crm.platform.access.presentation.web;

import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;

import com.crm.foundation.security.DataScopeType;

public record EffectiveAccessResponse(
		Tenant tenant,
		Membership membership,
		List<String> permissions,
		DataAccess dataAccess) {

	public EffectiveAccessResponse {
		tenant = Objects.requireNonNull(tenant, "tenant must not be null");
		membership = Objects.requireNonNull(
				membership, "membership must not be null");
		permissions = List.copyOf(
				Objects.requireNonNull(
						permissions, "permissions must not be null"));
		dataAccess = Objects.requireNonNull(
				dataAccess, "dataAccess must not be null");
	}

	public record Tenant(
			UUID id,
			String tenantCode,
			String displayName) {
	}

	public record Membership(
			String status,
			boolean tenantAdmin) {
	}

	public record DataAccess(
			DataScopeType defaultScope,
			Map<String, List<Scope>> entities) {

		public DataAccess {
			Objects.requireNonNull(entities, "entities must not be null");
			Map<String, List<Scope>> copy = new LinkedHashMap<>();
			entities.forEach((entityType, scopes) -> copy.put(
					entityType,
					List.copyOf(scopes)));
			entities = Collections.unmodifiableMap(copy);
		}

	}

	public record Scope(
			DataScopeType type,
			UUID teamId) {
	}

}
