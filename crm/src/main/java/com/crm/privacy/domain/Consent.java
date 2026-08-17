package com.crm.privacy.domain;

import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

import com.crm.sharedkernel.domain.ActorId;
import com.crm.sharedkernel.domain.TenantId;

public final class Consent {

	private final TenantId tenantId;
	private final ConsentId id;
	private final UUID accountId;
	private final UUID contactId;
	private final UUID leadId;
	private final ConsentChannel channel;
	private final String purpose;
	private final LawfulBasis lawfulBasis;
	private ConsentStatus consentStatus;
	private final String policyVersion;
	private final String source;
	private final String proofReference;
	private final Instant capturedAt;
	private final Instant effectiveFrom;
	private final Instant expiresAt;
	private Instant withdrawnAt;
	private final ActorId recordedBy;
	private final String metadata;
	private final Instant createdAt;

	public Consent(TenantId tenantId, ConsentId id, UUID accountId, UUID contactId,
			UUID leadId, ConsentChannel channel, String purpose, LawfulBasis lawfulBasis,
			ConsentStatus consentStatus, String policyVersion, String source,
			String proofReference, Instant capturedAt, Instant effectiveFrom,
			Instant expiresAt, Instant withdrawnAt, ActorId recordedBy,
			String metadata, Instant createdAt) {
		this.tenantId = Objects.requireNonNull(tenantId, "tenantId must not be null");
		this.id = Objects.requireNonNull(id, "id must not be null");
		int targets = (accountId != null ? 1 : 0) + (contactId != null ? 1 : 0) + (leadId != null ? 1 : 0);
		if (targets != 1) {
			throw new IllegalArgumentException("Exactly one target (accountId, contactId, leadId) must be provided");
		}
		this.accountId = accountId;
		this.contactId = contactId;
		this.leadId = leadId;
		this.channel = Objects.requireNonNull(channel, "channel must not be null");
		this.purpose = Objects.requireNonNull(purpose, "purpose must not be null").trim();
		this.lawfulBasis = Objects.requireNonNull(lawfulBasis, "lawfulBasis must not be null");
		this.consentStatus = consentStatus != null ? consentStatus : ConsentStatus.GRANTED;
		this.policyVersion = policyVersion;
		this.source = source;
		this.proofReference = proofReference;
		this.capturedAt = capturedAt != null ? capturedAt : Instant.now();
		this.effectiveFrom = effectiveFrom != null ? effectiveFrom : this.capturedAt;
		this.expiresAt = expiresAt;
		this.withdrawnAt = withdrawnAt;
		this.recordedBy = recordedBy;
		this.metadata = metadata != null ? metadata : "{}";
		this.createdAt = createdAt != null ? createdAt : Instant.now();
	}

	public static Consent create(TenantId tenantId, ConsentId id, UUID accountId,
			UUID contactId, UUID leadId, ConsentChannel channel, String purpose,
			LawfulBasis lawfulBasis, ConsentStatus status, String policyVersion,
			String source, String proofReference, Instant effectiveFrom,
			Instant expiresAt, String metadata, ActorId actorId, Instant now) {
		return new Consent(tenantId, id, accountId, contactId, leadId, channel,
				purpose, lawfulBasis, status != null ? status : ConsentStatus.GRANTED,
				policyVersion, source, proofReference, now,
				effectiveFrom != null ? effectiveFrom : now, expiresAt, null,
				actorId, metadata != null ? metadata : "{}", now);
	}

	public void withdraw(Instant now) {
		this.consentStatus = ConsentStatus.WITHDRAWN;
		this.withdrawnAt = now;
	}

	public TenantId tenantId() {
		return tenantId;
	}

	public ConsentId id() {
		return id;
	}

	public UUID accountId() {
		return accountId;
	}

	public UUID contactId() {
		return contactId;
	}

	public UUID leadId() {
		return leadId;
	}

	public ConsentChannel channel() {
		return channel;
	}

	public String purpose() {
		return purpose;
	}

	public LawfulBasis lawfulBasis() {
		return lawfulBasis;
	}

	public ConsentStatus consentStatus() {
		return consentStatus;
	}

	public String policyVersion() {
		return policyVersion;
	}

	public String source() {
		return source;
	}

	public String proofReference() {
		return proofReference;
	}

	public Instant capturedAt() {
		return capturedAt;
	}

	public Instant effectiveFrom() {
		return effectiveFrom;
	}

	public Instant expiresAt() {
		return expiresAt;
	}

	public Instant withdrawnAt() {
		return withdrawnAt;
	}

	public ActorId recordedBy() {
		return recordedBy;
	}

	public String metadata() {
		return metadata;
	}

	public Instant createdAt() {
		return createdAt;
	}

}
