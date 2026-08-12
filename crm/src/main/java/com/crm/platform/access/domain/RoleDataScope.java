package com.crm.platform.access.domain;

import java.util.Locale;
import java.util.Objects;
import java.util.UUID;
import java.util.regex.Pattern;

import com.crm.foundation.security.DataScopeType;

public record RoleDataScope(
		String entityType,
		DataScopeType type,
		UUID teamId) implements Comparable<RoleDataScope> {

	private static final int ENTITY_TYPE_MAX_LENGTH = 191;
	private static final Pattern ENTITY_TYPE_PATTERN =
			Pattern.compile("^[A-Z][A-Z0-9_]*$");

	public RoleDataScope {
		entityType = normalizeEntityType(entityType);
		type = Objects.requireNonNull(type, "type must not be null");
		boolean teamScope = type == DataScopeType.TEAM
				|| type == DataScopeType.TEAM_TREE;
		if (teamScope != (teamId != null)) {
			throw new IllegalArgumentException(
					"teamId presence does not match scope type");
		}
	}

	private static String normalizeEntityType(String value) {
		String normalized = Objects.requireNonNull(
				value, "entityType must not be null")
				.trim()
				.toUpperCase(Locale.ROOT);
		if (normalized.length() > ENTITY_TYPE_MAX_LENGTH
				|| !ENTITY_TYPE_PATTERN.matcher(normalized).matches()) {
			throw new IllegalArgumentException(
					"entityType has an invalid format");
		}
		return normalized;
	}

	@Override
	public int compareTo(RoleDataScope other) {
		int entityComparison = entityType.compareTo(other.entityType);
		if (entityComparison != 0) {
			return entityComparison;
		}
		int typeComparison = type.compareTo(other.type);
		if (typeComparison != 0) {
			return typeComparison;
		}
		String currentTeam = teamId == null ? "" : teamId.toString();
		String otherTeam = other.teamId == null ? "" : other.teamId.toString();
		return currentTeam.compareTo(otherTeam);
	}

}
