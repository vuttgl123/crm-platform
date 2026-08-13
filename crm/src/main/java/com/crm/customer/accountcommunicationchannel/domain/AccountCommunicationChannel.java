package com.crm.customer.accountcommunicationchannel.domain;

import java.time.Instant;
import java.util.Objects;

import com.crm.customer.account.domain.AccountId;
import com.crm.sharedkernel.domain.ActorId;
import com.crm.sharedkernel.domain.TenantId;

public final class AccountCommunicationChannel {

	private static final int LABEL_MAX_LENGTH = 255;

	private final TenantId tenantId;
	private final AccountCommunicationChannelId id;
	private final AccountId accountId;
	private ChannelType channelType;
	private ChannelValue value;
	private String label;
	private boolean primary;
	private final boolean verified;
	private final Instant verifiedAt;
	private boolean doNotUse;
	private final Instant createdAt;
	private final ActorId createdBy;
	private Instant updatedAt;
	private ActorId updatedBy;
	private Instant deletedAt;
	private ActorId deletedBy;
	private long version;

	private AccountCommunicationChannel(TenantId tenantId,
			AccountCommunicationChannelId id, AccountId accountId,
			ChannelType channelType, ChannelValue value, String label,
			boolean primary, boolean verified, Instant verifiedAt,
			boolean doNotUse, Instant createdAt, ActorId createdBy,
			Instant updatedAt, ActorId updatedBy, Instant deletedAt,
			ActorId deletedBy, long version) {
		this.tenantId = Objects.requireNonNull(tenantId,
				"tenantId must not be null");
		this.id = Objects.requireNonNull(id, "id must not be null");
		this.accountId = Objects.requireNonNull(accountId,
				"accountId must not be null");
		this.channelType = Objects.requireNonNull(channelType,
				"channelType must not be null");
		this.value = Objects.requireNonNull(value, "value must not be null");
		this.label = normalizeLabel(label);
		this.primary = primary;
		this.verified = verified;
		this.verifiedAt = verifiedAt;
		this.doNotUse = doNotUse;
		this.createdAt = Objects.requireNonNull(createdAt,
				"createdAt must not be null");
		this.createdBy = createdBy;
		this.updatedAt = Objects.requireNonNull(updatedAt,
				"updatedAt must not be null");
		this.updatedBy = updatedBy;
		this.deletedAt = deletedAt;
		this.deletedBy = deletedBy;
		if (verifiedAt != null && !verified) {
			throw new IllegalArgumentException(
					"verifiedAt requires verified to be true");
		}
		if (doNotUse && primary) {
			throw new IllegalArgumentException(
					"doNotUse channels must not be primary");
		}
		if ((deletedAt == null) != (deletedBy == null)) {
			throw new IllegalArgumentException(
					"deletedAt and deletedBy must be provided together");
		}
		if (version < 1) {
			throw new IllegalArgumentException("version must be positive");
		}
		this.version = version;
	}

	public static AccountCommunicationChannel create(TenantId tenantId,
			AccountCommunicationChannelId id, AccountId accountId,
			ChannelType channelType, String rawValue, String label,
			boolean requestedPrimary, boolean doNotUse, ActorId actorId,
			Instant now) {
		ActorId requiredActorId = Objects.requireNonNull(actorId,
				"actorId must not be null");
		Instant requiredNow = Objects.requireNonNull(now, "now must not be null");
		return new AccountCommunicationChannel(tenantId, id, accountId,
				channelType, ChannelValue.of(channelType, rawValue), label,
				requestedPrimary && !doNotUse, false, null, doNotUse,
				requiredNow, requiredActorId, requiredNow, requiredActorId, null,
				null, 1L);
	}

	public static AccountCommunicationChannel rehydrate(TenantId tenantId,
			AccountCommunicationChannelId id, AccountId accountId,
			ChannelType channelType, String rawValue, String normalizedValue,
			String label, boolean primary, boolean verified, Instant verifiedAt,
			boolean doNotUse, Instant createdAt, ActorId createdBy,
			Instant updatedAt, ActorId updatedBy, Instant deletedAt,
			ActorId deletedBy, long version) {
		ChannelValue value = ChannelValue.of(channelType, rawValue);
		if (!Objects.equals(value.normalizedValue(), normalizedValue)) {
			throw new IllegalArgumentException(
					"normalizedValue must match the normalized rawValue");
		}
		return new AccountCommunicationChannel(tenantId, id, accountId,
				channelType, value, label, primary, verified, verifiedAt, doNotUse,
				createdAt, createdBy, updatedAt, updatedBy, deletedAt, deletedBy,
				version);
	}

	public void replace(ChannelType channelType, String rawValue, String label,
			boolean requestedPrimary, boolean doNotUse, ActorId actorId,
			Instant now) {
		ChannelType replacementChannelType = Objects.requireNonNull(channelType,
				"channelType must not be null");
		ChannelValue replacementValue = ChannelValue.of(
				replacementChannelType, rawValue);
		String replacementLabel = normalizeLabel(label);
		ActorId requiredActorId = Objects.requireNonNull(actorId,
				"actorId must not be null");
		Instant requiredNow = Objects.requireNonNull(now, "now must not be null");
		long nextVersion = Math.incrementExact(version);
		this.channelType = replacementChannelType;
		this.value = replacementValue;
		this.label = replacementLabel;
		this.doNotUse = doNotUse;
		this.primary = requestedPrimary && !doNotUse;
		updateAudit(requiredActorId, requiredNow, nextVersion);
	}

	public void demote(ActorId actorId, Instant now) {
		if (!primary) {
			return;
		}
		ActorId requiredActorId = Objects.requireNonNull(actorId,
				"actorId must not be null");
		Instant requiredNow = Objects.requireNonNull(now, "now must not be null");
		long nextVersion = Math.incrementExact(version);
		primary = false;
		updateAudit(requiredActorId, requiredNow, nextVersion);
	}

	public void softDelete(ActorId actorId, Instant now) {
		ActorId requiredActorId = Objects.requireNonNull(actorId,
				"actorId must not be null");
		Instant requiredNow = Objects.requireNonNull(now, "now must not be null");
		long nextVersion = Math.incrementExact(version);
		deletedAt = requiredNow;
		deletedBy = requiredActorId;
		updatedAt = requiredNow;
		updatedBy = requiredActorId;
		version = nextVersion;
	}

	public TenantId tenantId() {
		return tenantId;
	}

	public AccountCommunicationChannelId id() {
		return id;
	}

	public AccountId accountId() {
		return accountId;
	}

	public ChannelType channelType() {
		return channelType;
	}

	public String rawValue() {
		return value.rawValue();
	}

	public String normalizedValue() {
		return value.normalizedValue();
	}

	public String canonicalValue() {
		return value.canonicalValue();
	}

	public String label() {
		return label;
	}

	public boolean isPrimary() {
		return primary;
	}

	public boolean isVerified() {
		return verified;
	}

	public Instant verifiedAt() {
		return verifiedAt;
	}

	public boolean doNotUse() {
		return doNotUse;
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

	public boolean deleted() {
		return deletedAt != null;
	}

	private void updateAudit(ActorId actorId, Instant now, long nextVersion) {
		updatedAt = now;
		updatedBy = actorId;
		version = nextVersion;
	}

	private static String normalizeLabel(String value) {
		if (value == null) {
			return null;
		}
		String normalized = value.trim();
		if (normalized.isEmpty()) {
			return null;
		}
		if (normalized.length() > LABEL_MAX_LENGTH) {
			throw new IllegalArgumentException("label must not exceed "
					+ LABEL_MAX_LENGTH + " characters");
		}
		return normalized;
	}

}
