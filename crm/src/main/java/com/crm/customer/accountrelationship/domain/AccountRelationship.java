package com.crm.customer.accountrelationship.domain;

import java.time.Instant;
import java.time.LocalDate;
import java.util.Objects;

import com.crm.customer.account.domain.AccountId;
import com.crm.sharedkernel.domain.ActorId;
import com.crm.sharedkernel.domain.TenantId;
import com.crm.sharedkernel.domain.exception.BusinessRuleViolation;
import com.crm.sharedkernel.domain.exception.ResourceConflict;

public final class AccountRelationship {

	private static final int DESCRIPTION_MAX_LENGTH = 4_000;

	private final TenantId tenantId;
	private final AccountRelationshipId id;
	private final AccountId accountId;
	private final AccountId relatedAccountId;
	private final AccountRelationshipType relationshipType;
	private final LocalDate validFrom;
	private LocalDate validTo;
	private final String description;
	private final Instant createdAt;
	private final ActorId createdBy;

	private AccountRelationship(TenantId tenantId, AccountRelationshipId id,
			AccountId accountId, AccountId relatedAccountId,
			AccountRelationshipType relationshipType, LocalDate validFrom,
			LocalDate validTo, String description, Instant createdAt,
			ActorId createdBy) {
		this.tenantId = Objects.requireNonNull(tenantId,
				"tenantId must not be null");
		this.id = Objects.requireNonNull(id, "id must not be null");
		this.accountId = Objects.requireNonNull(accountId,
				"accountId must not be null");
		this.relatedAccountId = Objects.requireNonNull(relatedAccountId,
				"relatedAccountId must not be null");
		this.relationshipType = Objects.requireNonNull(relationshipType,
				"relationshipType must not be null");
		rejectSelfReference();
		rejectInvalidPeriod(validFrom, validTo);
		this.validFrom = validFrom;
		this.validTo = validTo;
		this.description = normalizeDescription(description);
		this.createdAt = Objects.requireNonNull(createdAt,
				"createdAt must not be null");
		this.createdBy = createdBy;
	}

	public static AccountRelationship create(TenantId tenantId,
			AccountRelationshipId id, AccountId accountId,
			AccountId relatedAccountId,
			AccountRelationshipType relationshipType, LocalDate validFrom,
			LocalDate validTo, String description, ActorId createdBy,
			Instant createdAt) {
		return new AccountRelationship(tenantId, id, accountId,
				relatedAccountId, relationshipType, validFrom, validTo,
				description, createdAt, Objects.requireNonNull(createdBy,
						"createdBy must not be null"));
	}

	public static AccountRelationship rehydrate(TenantId tenantId,
			AccountRelationshipId id, AccountId accountId,
			AccountId relatedAccountId,
			AccountRelationshipType relationshipType, LocalDate validFrom,
			LocalDate validTo, String description, Instant createdAt,
			ActorId createdBy) {
		return new AccountRelationship(tenantId, id, accountId,
				relatedAccountId, relationshipType, validFrom, validTo,
				description, createdAt, createdBy);
	}

	public void end(LocalDate requestedValidTo) {
		Objects.requireNonNull(requestedValidTo,
				"requestedValidTo must not be null");
		if (validTo != null) {
			if (validTo.equals(requestedValidTo)) {
				return;
			}
			throw new ResourceConflict(
					AccountRelationshipErrorCode.ACCOUNT_RELATIONSHIP_ALREADY_ENDED);
		}
		if (validFrom != null && requestedValidTo.isBefore(validFrom)) {
			throw new BusinessRuleViolation(
					AccountRelationshipErrorCode.ACCOUNT_RELATIONSHIP_PERIOD_INVALID);
		}
		validTo = requestedValidTo;
	}

	public TenantId tenantId() {
		return tenantId;
	}

	public AccountRelationshipId id() {
		return id;
	}

	public AccountId accountId() {
		return accountId;
	}

	public AccountId relatedAccountId() {
		return relatedAccountId;
	}

	public AccountRelationshipType relationshipType() {
		return relationshipType;
	}

	public LocalDate validFrom() {
		return validFrom;
	}

	public LocalDate validTo() {
		return validTo;
	}

	public String description() {
		return description;
	}

	public Instant createdAt() {
		return createdAt;
	}

	public ActorId createdBy() {
		return createdBy;
	}

	private void rejectSelfReference() {
		if (accountId.equals(relatedAccountId)) {
			throw new BusinessRuleViolation(
					AccountRelationshipErrorCode.ACCOUNT_RELATIONSHIP_SELF_REFERENCE);
		}
	}

	private static void rejectInvalidPeriod(LocalDate validFrom,
			LocalDate validTo) {
		if (validFrom != null && validTo != null
				&& validTo.isBefore(validFrom)) {
			throw new BusinessRuleViolation(
					AccountRelationshipErrorCode.ACCOUNT_RELATIONSHIP_PERIOD_INVALID);
		}
	}

	private static String normalizeDescription(String value) {
		if (value == null) {
			return null;
		}
		String normalized = value.trim();
		if (normalized.isEmpty()) {
			return null;
		}
		if (normalized.length() > DESCRIPTION_MAX_LENGTH) {
			throw new IllegalArgumentException(
					"description must not exceed " + DESCRIPTION_MAX_LENGTH
							+ " characters");
		}
		return normalized;
	}

}
