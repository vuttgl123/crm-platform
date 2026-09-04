package com.crm.platform.user.domain;

import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

import com.crm.sharedkernel.domain.ActorId;
import com.crm.sharedkernel.domain.TenantId;

public class PlatformUser {

	private final TenantId tenantId;
	private final UUID userId;
	private final String email;
	private String displayName;
	private String phone;
	private String jobTitle;
	private String employeeReference;
	private PlatformUserStatus status;
	private boolean isTenantAdmin;
	private Instant joinedAt;
	private Instant lastLoginAt;
	private Instant updatedAt;
	private ActorId updatedBy;
	private long version;

	public PlatformUser(
			TenantId tenantId,
			UUID userId,
			String email,
			String displayName,
			String phone,
			String jobTitle,
			String employeeReference,
			PlatformUserStatus status,
			boolean isTenantAdmin,
			Instant joinedAt,
			Instant lastLoginAt,
			Instant updatedAt,
			ActorId updatedBy,
			long version) {
		this.tenantId = Objects.requireNonNull(tenantId, "tenantId must not be null");
		this.userId = Objects.requireNonNull(userId, "userId must not be null");
		this.email = Objects.requireNonNull(email, "email must not be null");
		this.displayName = Objects.requireNonNull(displayName, "displayName must not be null");
		this.phone = phone;
		this.jobTitle = jobTitle;
		this.employeeReference = employeeReference;
		this.status = Objects.requireNonNull(status, "status must not be null");
		this.isTenantAdmin = isTenantAdmin;
		this.joinedAt = joinedAt;
		this.lastLoginAt = lastLoginAt;
		this.updatedAt = Objects.requireNonNull(updatedAt, "updatedAt must not be null");
		this.updatedBy = updatedBy;
		this.version = version;
	}

	public void updateProfile(String displayName, String phone, String jobTitle, String employeeReference, boolean isTenantAdmin, ActorId actorId, Instant now) {
		this.displayName = Objects.requireNonNull(displayName, "displayName must not be null");
		this.phone = phone;
		this.jobTitle = jobTitle;
		this.employeeReference = employeeReference;
		this.isTenantAdmin = isTenantAdmin;
		this.updatedBy = actorId;
		this.updatedAt = Objects.requireNonNull(now, "now must not be null");
		this.version++;
	}

	public void changeStatus(PlatformUserStatus newStatus, ActorId actorId, Instant now) {
		this.status = Objects.requireNonNull(newStatus, "newStatus must not be null");
		this.updatedBy = actorId;
		this.updatedAt = Objects.requireNonNull(now, "now must not be null");
		this.version++;
	}

	public TenantId tenantId() {
		return tenantId;
	}

	public UUID userId() {
		return userId;
	}

	public String email() {
		return email;
	}

	public String displayName() {
		return displayName;
	}

	public String phone() {
		return phone;
	}

	public String jobTitle() {
		return jobTitle;
	}

	public String employeeReference() {
		return employeeReference;
	}

	public PlatformUserStatus status() {
		return status;
	}

	public boolean isTenantAdmin() {
		return isTenantAdmin;
	}

	public Instant joinedAt() {
		return joinedAt;
	}

	public Instant lastLoginAt() {
		return lastLoginAt;
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
