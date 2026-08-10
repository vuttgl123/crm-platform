package com.crm.customer.account.domain;

import java.time.Instant;
import java.util.Objects;
import java.util.regex.Pattern;

import com.crm.sharedkernel.domain.ActorId;
import com.crm.sharedkernel.domain.TenantId;

public final class Account {

	private static final int ACCOUNT_NUMBER_MAX_LENGTH = 191;
	private static final int DISPLAY_NAME_MAX_LENGTH = 255;
	private static final int LEGAL_NAME_MAX_LENGTH = 255;
	private static final int INDUSTRY_CODE_MAX_LENGTH = 191;
	private static final int TAX_IDENTIFIER_MAX_LENGTH = 255;
	private static final int REGISTRATION_NUMBER_MAX_LENGTH = 191;
	private static final int LANGUAGE_CODE_MAX_LENGTH = 10;
	private static final Pattern LANGUAGE_CODE_PATTERN = Pattern.compile(
			"^[A-Za-z]{2,3}(-[A-Za-z0-9]{2,8})*$");

	private final TenantId tenantId;
	private final AccountId id;
	private final String accountNumber;
	private AccountType accountType;
	private String legalName;
	private String displayName;
	private AccountId parentAccountId;
	private AccountOwner owner;
	private AccountLifecycleStage lifecycleStage;
	private String industryCode;
	private String taxIdentifier;
	private String registrationNumber;
	private String website;
	private AnnualRevenue annualRevenue;
	private Integer employeeCount;
	private String description;
	private String preferredLanguageCode;
	private boolean doNotContact;
	private final Instant createdAt;
	private final ActorId createdBy;
	private Instant updatedAt;
	private ActorId updatedBy;
	private Instant deletedAt;
	private ActorId deletedBy;
	private long version;

	private Account(TenantId tenantId, AccountId id, String accountNumber,
			AccountType accountType, String legalName, String displayName,
			AccountId parentAccountId, AccountOwner owner,
			AccountLifecycleStage lifecycleStage, String industryCode,
			String taxIdentifier, String registrationNumber, String website,
			AnnualRevenue annualRevenue, Integer employeeCount,
			String description, String preferredLanguageCode,
			boolean doNotContact, Instant createdAt, ActorId createdBy,
			Instant updatedAt, ActorId updatedBy, Instant deletedAt,
			ActorId deletedBy, long version) {
		this.tenantId = Objects.requireNonNull(tenantId,
				"tenantId must not be null");
		this.id = Objects.requireNonNull(id, "id must not be null");
		this.accountNumber = requiredText(accountNumber,
				ACCOUNT_NUMBER_MAX_LENGTH, "accountNumber");
		this.accountType = Objects.requireNonNull(accountType,
				"accountType must not be null");
		this.legalName = optionalText(legalName, LEGAL_NAME_MAX_LENGTH,
				"legalName");
		this.displayName = requiredText(displayName, DISPLAY_NAME_MAX_LENGTH,
				"displayName");
		this.parentAccountId = parentAccountId;
		this.owner = owner;
		this.lifecycleStage = Objects.requireNonNull(lifecycleStage,
				"lifecycleStage must not be null");
		this.industryCode = optionalText(industryCode,
				INDUSTRY_CODE_MAX_LENGTH, "industryCode");
		this.taxIdentifier = optionalText(taxIdentifier,
				TAX_IDENTIFIER_MAX_LENGTH, "taxIdentifier");
		this.registrationNumber = optionalText(registrationNumber,
				REGISTRATION_NUMBER_MAX_LENGTH, "registrationNumber");
		this.website = optionalUnboundedText(website);
		this.annualRevenue = annualRevenue;
		requireNonnegative(employeeCount, "employeeCount");
		this.employeeCount = employeeCount;
		this.description = optionalUnboundedText(description);
		this.preferredLanguageCode = normalizeLanguageCode(
				preferredLanguageCode);
		this.doNotContact = doNotContact;
		this.createdAt = Objects.requireNonNull(createdAt,
				"createdAt must not be null");
		this.createdBy = createdBy;
		this.updatedAt = Objects.requireNonNull(updatedAt,
				"updatedAt must not be null");
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
		rejectSelfParent(parentAccountId);
	}

	public static Account create(TenantId tenantId, AccountId id,
			String accountNumber, AccountType accountType, String legalName,
			String displayName, AccountId parentAccountId, AccountOwner owner,
			AccountLifecycleStage lifecycleStage, String industryCode,
			String taxIdentifier, String registrationNumber, String website,
			AnnualRevenue annualRevenue, Integer employeeCount,
			String description, String preferredLanguageCode,
			Boolean doNotContact, ActorId actorId, Instant now) {
		ActorId requiredActorId = Objects.requireNonNull(actorId,
				"actorId must not be null");
		Instant requiredNow = Objects.requireNonNull(now,
				"now must not be null");
		return new Account(
				tenantId,
				id,
				accountNumber,
				accountType == null ? AccountType.ORGANIZATION : accountType,
				legalName,
				displayName,
				parentAccountId,
				owner,
				lifecycleStage == null
						? AccountLifecycleStage.PROSPECT : lifecycleStage,
				industryCode,
				taxIdentifier,
				registrationNumber,
				website,
				annualRevenue,
				employeeCount,
				description,
				preferredLanguageCode,
				doNotContact != null && doNotContact,
				requiredNow,
				requiredActorId,
				requiredNow,
				requiredActorId,
				null,
				null,
				1L);
	}

	public static Account rehydrate(TenantId tenantId, AccountId id,
			String accountNumber, AccountType accountType, String legalName,
			String displayName, AccountId parentAccountId, AccountOwner owner,
			AccountLifecycleStage lifecycleStage, String industryCode,
			String taxIdentifier, String registrationNumber, String website,
			AnnualRevenue annualRevenue, Integer employeeCount,
			String description, String preferredLanguageCode,
			boolean doNotContact, Instant createdAt, ActorId createdBy,
			Instant updatedAt, ActorId updatedBy, Instant deletedAt,
			ActorId deletedBy, long version) {
		return new Account(tenantId, id, accountNumber, accountType,
				legalName, displayName, parentAccountId, owner, lifecycleStage,
				industryCode, taxIdentifier, registrationNumber, website,
				annualRevenue, employeeCount, description,
				preferredLanguageCode, doNotContact, createdAt, createdBy,
				updatedAt, updatedBy, deletedAt, deletedBy, version);
	}

	public void replace(AccountType accountType, String legalName,
			String displayName, AccountId parentAccountId, AccountOwner owner,
			AccountLifecycleStage lifecycleStage, String industryCode,
			String taxIdentifier, String registrationNumber, String website,
			AnnualRevenue annualRevenue, Integer employeeCount,
			String description, String preferredLanguageCode,
			boolean doNotContact, ActorId actorId, Instant now) {
		rejectSelfParent(parentAccountId);
		this.accountType = Objects.requireNonNull(accountType,
				"accountType must not be null");
		this.legalName = optionalText(legalName, LEGAL_NAME_MAX_LENGTH,
				"legalName");
		this.displayName = requiredText(displayName, DISPLAY_NAME_MAX_LENGTH,
				"displayName");
		this.parentAccountId = parentAccountId;
		this.owner = owner;
		this.lifecycleStage = Objects.requireNonNull(lifecycleStage,
				"lifecycleStage must not be null");
		this.industryCode = optionalText(industryCode,
				INDUSTRY_CODE_MAX_LENGTH, "industryCode");
		this.taxIdentifier = optionalText(taxIdentifier,
				TAX_IDENTIFIER_MAX_LENGTH, "taxIdentifier");
		this.registrationNumber = optionalText(registrationNumber,
				REGISTRATION_NUMBER_MAX_LENGTH, "registrationNumber");
		this.website = optionalUnboundedText(website);
		this.annualRevenue = annualRevenue;
		requireNonnegative(employeeCount, "employeeCount");
		this.employeeCount = employeeCount;
		this.description = optionalUnboundedText(description);
		this.preferredLanguageCode = normalizeLanguageCode(
				preferredLanguageCode);
		this.doNotContact = doNotContact;
		this.updatedAt = Objects.requireNonNull(now, "now must not be null");
		this.updatedBy = Objects.requireNonNull(actorId,
				"actorId must not be null");
		this.version = Math.incrementExact(version);
	}

	public void softDelete(ActorId actorId, Instant now) {
		ActorId requiredActorId = Objects.requireNonNull(actorId,
				"actorId must not be null");
		Instant requiredNow = Objects.requireNonNull(now,
				"now must not be null");
		this.deletedAt = requiredNow;
		this.deletedBy = requiredActorId;
		this.updatedAt = requiredNow;
		this.updatedBy = requiredActorId;
		this.version = Math.incrementExact(version);
	}

	private void rejectSelfParent(AccountId candidateParentId) {
		if (id.equals(candidateParentId)) {
			throw new IllegalArgumentException(
					"parentAccountId must not reference the same Account");
		}
	}

	private static String requiredText(String value, int maxLength,
			String fieldName) {
		String requiredValue = Objects.requireNonNull(value,
				fieldName + " must not be null").trim();
		if (requiredValue.isEmpty()) {
			throw new IllegalArgumentException(fieldName + " must not be blank");
		}
		if (requiredValue.length() > maxLength) {
			throw new IllegalArgumentException(fieldName
					+ " must not exceed " + maxLength + " characters");
		}
		return requiredValue;
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

	private static String optionalUnboundedText(String value) {
		if (value == null) {
			return null;
		}
		String normalized = value.trim();
		return normalized.isEmpty() ? null : normalized;
	}

	private static void requireNonnegative(Integer value, String fieldName) {
		if (value != null && value < 0) {
			throw new IllegalArgumentException(
					fieldName + " must not be negative");
		}
	}

	private static String normalizeLanguageCode(String value) {
		String normalized = optionalText(value, LANGUAGE_CODE_MAX_LENGTH,
				"preferredLanguageCode");
		if (normalized != null && !LANGUAGE_CODE_PATTERN.matcher(normalized)
				.matches()) {
			throw new IllegalArgumentException(
					"preferredLanguageCode has an invalid format");
		}
		return normalized;
	}

	public TenantId tenantId() {
		return tenantId;
	}

	public AccountId id() {
		return id;
	}

	public String accountNumber() {
		return accountNumber;
	}

	public AccountType accountType() {
		return accountType;
	}

	public String legalName() {
		return legalName;
	}

	public String displayName() {
		return displayName;
	}

	public AccountId parentAccountId() {
		return parentAccountId;
	}

	public AccountOwner owner() {
		return owner;
	}

	public AccountLifecycleStage lifecycleStage() {
		return lifecycleStage;
	}

	public String industryCode() {
		return industryCode;
	}

	public String taxIdentifier() {
		return taxIdentifier;
	}

	public String registrationNumber() {
		return registrationNumber;
	}

	public String website() {
		return website;
	}

	public AnnualRevenue annualRevenue() {
		return annualRevenue;
	}

	public Integer employeeCount() {
		return employeeCount;
	}

	public String description() {
		return description;
	}

	public String preferredLanguageCode() {
		return preferredLanguageCode;
	}

	public boolean doNotContact() {
		return doNotContact;
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

}
