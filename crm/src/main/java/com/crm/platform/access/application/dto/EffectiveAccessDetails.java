package com.crm.platform.access.application.dto;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.TreeMap;
import java.util.UUID;

import com.crm.foundation.security.DataScopeType;

public record EffectiveAccessDetails(
		TenantSummary tenant,
		MembershipSummary membership,
		List<String> permissions,
		DataAccessDetails dataAccess) {

	public EffectiveAccessDetails {
		tenant = Objects.requireNonNull(tenant, "tenant must not be null");
		membership = Objects.requireNonNull(
				membership, "membership must not be null");
		permissions = Objects.requireNonNull(
				permissions, "permissions must not be null")
				.stream()
				.map(EffectiveAccessDetails::requiredText)
				.distinct()
				.sorted()
				.toList();
		dataAccess = Objects.requireNonNull(
				dataAccess, "dataAccess must not be null");
	}

	private static String requiredText(String value) {
		String normalized = Objects.requireNonNull(
				value, "value must not be null").trim();
		if (normalized.isEmpty()) {
			throw new IllegalArgumentException("value must not be blank");
		}
		return normalized;
	}

	public record TenantSummary(
			UUID id,
			String tenantCode,
			String displayName) {

		public TenantSummary {
			id = Objects.requireNonNull(id, "id must not be null");
			tenantCode = requiredText(tenantCode);
			displayName = requiredText(displayName);
		}

	}

	public record MembershipSummary(
			String status,
			boolean tenantAdmin) {

		public MembershipSummary {
			status = requiredText(status);
		}

	}

	public record DataAccessDetails(
			DataScopeType defaultScope,
			Map<String, List<ScopeDetails>> entities) {

		private static final Comparator<ScopeDetails> SCOPE_ORDER =
				Comparator.comparing(ScopeDetails::type)
						.thenComparing(scope -> scope.teamId() == null
								? "" : scope.teamId().toString());

		public DataAccessDetails {
			Objects.requireNonNull(entities, "entities must not be null");
			if (defaultScope != null && defaultScope != DataScopeType.TENANT) {
				throw new IllegalArgumentException(
						"defaultScope must be TENANT or null");
			}
			if (defaultScope != null && !entities.isEmpty()) {
				throw new IllegalArgumentException(
						"global data access must not contain entity scopes");
			}

			Map<String, List<ScopeDetails>> sorted = new TreeMap<>();
			entities.forEach((entityType, scopes) -> {
				String normalizedEntityType = requiredText(entityType);
				List<ScopeDetails> normalizedScopes = new ArrayList<>(
						Objects.requireNonNull(
								scopes, "scopes must not be null"));
				normalizedScopes.forEach(scope -> Objects.requireNonNull(
						scope, "scope must not be null"));
				normalizedScopes = normalizedScopes.stream()
						.distinct()
						.sorted(SCOPE_ORDER)
						.toList();
				sorted.put(normalizedEntityType, normalizedScopes);
			});
			entities = Collections.unmodifiableMap(
					new LinkedHashMap<>(sorted));
		}

	}

	public record ScopeDetails(
			DataScopeType type,
			UUID teamId) {

		public ScopeDetails {
			type = Objects.requireNonNull(type, "type must not be null");
			boolean teamScope = type == DataScopeType.TEAM
					|| type == DataScopeType.TEAM_TREE;
			if (teamScope != (teamId != null)) {
				throw new IllegalArgumentException(
						"teamId presence does not match scope type");
			}
		}

	}

}
