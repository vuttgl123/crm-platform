package com.crm.platform.access.domain;

import java.time.Instant;
import java.util.List;
import java.util.Locale;
import java.util.Objects;
import java.util.regex.Pattern;

import com.crm.sharedkernel.domain.ActorId;
import com.crm.sharedkernel.domain.TenantId;

public final class Role {

	private static final int ROLE_CODE_MAX_LENGTH = 191;
	private static final int NAME_MAX_LENGTH = 255;
	private static final int DESCRIPTION_MAX_LENGTH = 4_000;
	private static final Pattern ROLE_CODE_PATTERN =
			Pattern.compile("^[A-Z][A-Z0-9_]*$");

	private final TenantId tenantId;
	private final RoleId id;
	private final String roleCode;
	private String name;
	private String description;
	private final boolean system;
	private RoleStatus status;
	private List<String> permissionCodes;
	private List<RoleDataScope> dataScopes;
	private final Instant createdAt;
	private final ActorId createdBy;
	private Instant updatedAt;
	private ActorId updatedBy;
	private Instant deletedAt;
	private ActorId deletedBy;
	private long version;

	private Role(TenantId tenantId, RoleId id, String roleCode, String name,
			String description, boolean system, RoleStatus status,
			List<String> permissionCodes, List<RoleDataScope> dataScopes,
			Instant createdAt, ActorId createdBy, Instant updatedAt,
			ActorId updatedBy, Instant deletedAt, ActorId deletedBy,
			long version) {
		this.tenantId = Objects.requireNonNull(
				tenantId, "tenantId must not be null");
		this.id = Objects.requireNonNull(id, "id must not be null");
		this.roleCode = normalizeRoleCode(roleCode);
		this.name = requiredText(name, NAME_MAX_LENGTH, "name");
		this.description = optionalText(
				description, DESCRIPTION_MAX_LENGTH, "description");
		this.system = system;
		this.status = Objects.requireNonNull(
				status, "status must not be null");
		this.permissionCodes = normalizePermissionCodes(permissionCodes);
		this.dataScopes = normalizeDataScopes(dataScopes);
		this.createdAt = Objects.requireNonNull(
				createdAt, "createdAt must not be null");
		this.createdBy = createdBy;
		this.updatedAt = Objects.requireNonNull(
				updatedAt, "updatedAt must not be null");
		this.updatedBy = updatedBy;
		this.deletedAt = deletedAt;
		this.deletedBy = deletedBy;
		if ((deletedAt == null) != (deletedBy == null)) {
			throw new IllegalArgumentException(
					"deletedAt and deletedBy must be provided together");
		}
		if (version < 1) {
			throw new IllegalArgumentException("version must be positive");
		}
		this.version = version;
	}

	public static Role create(TenantId tenantId, RoleId id, String roleCode,
			String name, String description, List<String> permissionCodes,
			List<RoleDataScope> dataScopes, ActorId actorId, Instant now) {
		ActorId requiredActor = Objects.requireNonNull(
				actorId, "actorId must not be null");
		Instant requiredNow = Objects.requireNonNull(
				now, "now must not be null");
		return new Role(tenantId, id, roleCode, name, description, false,
				RoleStatus.ACTIVE, permissionCodes, dataScopes, requiredNow,
				requiredActor, requiredNow, requiredActor, null, null, 1L);
	}

	public static Role rehydrate(TenantId tenantId, RoleId id, String roleCode,
			String name, String description, boolean system, RoleStatus status,
			List<String> permissionCodes, List<RoleDataScope> dataScopes,
			Instant createdAt, ActorId createdBy, Instant updatedAt,
			ActorId updatedBy, Instant deletedAt, ActorId deletedBy,
			long version) {
		return new Role(tenantId, id, roleCode, name, description, system,
				status, permissionCodes, dataScopes, createdAt, createdBy,
				updatedAt, updatedBy, deletedAt, deletedBy, version);
	}

	public void replace(String name, String description, RoleStatus status,
			List<String> permissionCodes, List<RoleDataScope> dataScopes,
			ActorId actorId, Instant now) {
		this.name = requiredText(name, NAME_MAX_LENGTH, "name");
		this.description = optionalText(
				description, DESCRIPTION_MAX_LENGTH, "description");
		this.status = Objects.requireNonNull(
				status, "status must not be null");
		this.permissionCodes = normalizePermissionCodes(permissionCodes);
		this.dataScopes = normalizeDataScopes(dataScopes);
		this.updatedBy = Objects.requireNonNull(
				actorId, "actorId must not be null");
		this.updatedAt = Objects.requireNonNull(now, "now must not be null");
		this.version = Math.incrementExact(version);
	}

	public void softDelete(ActorId actorId, Instant now) {
		ActorId requiredActor = Objects.requireNonNull(
				actorId, "actorId must not be null");
		Instant requiredNow = Objects.requireNonNull(
				now, "now must not be null");
		deletedAt = requiredNow;
		deletedBy = requiredActor;
		updatedAt = requiredNow;
		updatedBy = requiredActor;
		version = Math.incrementExact(version);
	}

	public static String normalizeRoleCode(String value) {
		String normalized = Objects.requireNonNull(
				value, "roleCode must not be null")
				.trim()
				.toUpperCase(Locale.ROOT);
		if (normalized.length() > ROLE_CODE_MAX_LENGTH
				|| !ROLE_CODE_PATTERN.matcher(normalized).matches()) {
			throw new IllegalArgumentException(
					"roleCode has an invalid format");
		}
		return normalized;
	}

	private static List<String> normalizePermissionCodes(List<String> values) {
		return Objects.requireNonNull(values,
				"permissionCodes must not be null")
				.stream()
				.map(value -> requiredText(
						value, ROLE_CODE_MAX_LENGTH, "permissionCode"))
				.distinct()
				.sorted()
				.toList();
	}

	private static List<RoleDataScope> normalizeDataScopes(
			List<RoleDataScope> values) {
		return Objects.requireNonNull(values, "dataScopes must not be null")
				.stream()
				.map(value -> Objects.requireNonNull(
						value, "dataScope must not be null"))
				.distinct()
				.sorted()
				.toList();
	}

	private static String requiredText(String value, int maxLength,
			String fieldName) {
		String normalized = Objects.requireNonNull(
				value, fieldName + " must not be null").trim();
		if (normalized.isEmpty()) {
			throw new IllegalArgumentException(
					fieldName + " must not be blank");
		}
		if (normalized.length() > maxLength) {
			throw new IllegalArgumentException(fieldName
					+ " must not exceed " + maxLength + " characters");
		}
		return normalized;
	}

	private static String optionalText(String value, int maxLength,
			String fieldName) {
		if (value == null) {
			return null;
		}
		String normalized = value.trim();
		if (normalized.isEmpty()) {
			return null;
		}
		if (normalized.length() > maxLength) {
			throw new IllegalArgumentException(fieldName
					+ " must not exceed " + maxLength + " characters");
		}
		return normalized;
	}

	public TenantId tenantId() {
		return tenantId;
	}

	public RoleId id() {
		return id;
	}

	public String roleCode() {
		return roleCode;
	}

	public String name() {
		return name;
	}

	public String description() {
		return description;
	}

	public boolean system() {
		return system;
	}

	public RoleStatus status() {
		return status;
	}

	public List<String> permissionCodes() {
		return permissionCodes;
	}

	public List<RoleDataScope> dataScopes() {
		return dataScopes;
	}

	public Instant createdAt() {
		return createdAt;
	}

	public ActorId createdBy() {
		return createdBy;
	}

	public Instant updatedAt() {
		return updatedAt;
	}

	public ActorId updatedBy() {
		return updatedBy;
	}

	public Instant deletedAt() {
		return deletedAt;
	}

	public ActorId deletedBy() {
		return deletedBy;
	}

	public long version() {
		return version;
	}

}
