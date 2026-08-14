package com.crm.customer.contact.domain;

import java.time.Instant;
import java.time.LocalDate;
import java.util.Objects;
import java.util.regex.Pattern;

import com.crm.customer.account.domain.AccountId;
import com.crm.sharedkernel.domain.ActorId;
import com.crm.sharedkernel.domain.TenantId;

public final class Contact {

	private static final int CONTACT_NUMBER_MAX_LENGTH = 191;
	private static final int DISPLAY_NAME_MAX_LENGTH = 255;
	private static final int NAME_PART_MAX_LENGTH = 255;
	private static final int JOB_TITLE_MAX_LENGTH = 255;
	private static final int DEPARTMENT_MAX_LENGTH = 255;
	private static final int LANGUAGE_CODE_MAX_LENGTH = 10;
	private static final Pattern LANGUAGE_CODE_PATTERN = Pattern.compile(
			"^[A-Za-z]{2,3}(-[A-Za-z0-9]{2,8})*$");

	private final TenantId tenantId;
	private final ContactId id;
	private final String contactNumber;
	private AccountId accountId;
	private ContactOwner owner;
	private String honorific;
	private String givenName;
	private String middleName;
	private String familyName;
	private String displayName;
	private String jobTitle;
	private String department;
	private String preferredLanguageCode;
	private PreferredContactChannel preferredContactChannel;
	private ContactLifecycleStage lifecycleStage;
	private LocalDate dateOfBirth;
	private boolean doNotContact;
	private String description;
	private final Instant createdAt;
	private final ActorId createdBy;
	private Instant updatedAt;
	private ActorId updatedBy;
	private Instant deletedAt;
	private ActorId deletedBy;
	private long version;

	private Contact(TenantId tenantId, ContactId id, String contactNumber,
			AccountId accountId, ContactOwner owner, String honorific,
			String givenName, String middleName, String familyName,
			String displayName, String jobTitle, String department,
			String preferredLanguageCode,
			PreferredContactChannel preferredContactChannel,
			ContactLifecycleStage lifecycleStage, LocalDate dateOfBirth,
			boolean doNotContact, String description, Instant createdAt,
			ActorId createdBy, Instant updatedAt, ActorId updatedBy,
			Instant deletedAt, ActorId deletedBy, long version) {
		this.tenantId = Objects.requireNonNull(tenantId,
				"tenantId must not be null");
		this.id = Objects.requireNonNull(id, "id must not be null");
		this.contactNumber = requiredText(contactNumber,
				CONTACT_NUMBER_MAX_LENGTH, "contactNumber");
		this.accountId = accountId;
		this.owner = owner;
		this.honorific = optionalText(honorific, NAME_PART_MAX_LENGTH,
				"honorific");
		this.givenName = optionalText(givenName, NAME_PART_MAX_LENGTH,
				"givenName");
		this.middleName = optionalText(middleName, NAME_PART_MAX_LENGTH,
				"middleName");
		this.familyName = optionalText(familyName, NAME_PART_MAX_LENGTH,
				"familyName");
		this.displayName = requiredText(displayName, DISPLAY_NAME_MAX_LENGTH,
				"displayName");
		this.jobTitle = optionalText(jobTitle, JOB_TITLE_MAX_LENGTH,
				"jobTitle");
		this.department = optionalText(department, DEPARTMENT_MAX_LENGTH,
				"department");
		this.preferredLanguageCode = normalizeLanguageCode(
				preferredLanguageCode);
		this.preferredContactChannel = preferredContactChannel;
		this.lifecycleStage = Objects.requireNonNull(lifecycleStage,
				"lifecycleStage must not be null");
		this.dateOfBirth = dateOfBirth;
		this.doNotContact = doNotContact;
		this.description = optionalUnboundedText(description);
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
	}

	public static Contact create(TenantId tenantId, ContactId id,
			String contactNumber, AccountId accountId, ContactOwner owner,
			String honorific, String givenName, String middleName,
			String familyName, String displayName, String jobTitle,
			String department, String preferredLanguageCode,
			PreferredContactChannel preferredContactChannel,
			ContactLifecycleStage lifecycleStage, LocalDate dateOfBirth,
			boolean doNotContact, String description, ActorId createdBy,
			Instant now) {
		Objects.requireNonNull(now, "now must not be null");
		ContactLifecycleStage resolvedStage = lifecycleStage == null
				? ContactLifecycleStage.PROSPECT : lifecycleStage;
		return new Contact(
				tenantId,
				id,
				contactNumber,
				accountId,
				owner,
				honorific,
				givenName,
				middleName,
				familyName,
				displayName,
				jobTitle,
				department,
				preferredLanguageCode,
				preferredContactChannel,
				resolvedStage,
				dateOfBirth,
				doNotContact,
				description,
				now,
				createdBy,
				now,
				createdBy,
				null,
				null,
				1L);
	}

	public static Contact reconstitute(TenantId tenantId, ContactId id,
			String contactNumber, AccountId accountId, ContactOwner owner,
			String honorific, String givenName, String middleName,
			String familyName, String displayName, String jobTitle,
			String department, String preferredLanguageCode,
			PreferredContactChannel preferredContactChannel,
			ContactLifecycleStage lifecycleStage, LocalDate dateOfBirth,
			boolean doNotContact, String description, Instant createdAt,
			ActorId createdBy, Instant updatedAt, ActorId updatedBy,
			Instant deletedAt, ActorId deletedBy, long version) {
		return new Contact(
				tenantId,
				id,
				contactNumber,
				accountId,
				owner,
				honorific,
				givenName,
				middleName,
				familyName,
				displayName,
				jobTitle,
				department,
				preferredLanguageCode,
				preferredContactChannel,
				lifecycleStage,
				dateOfBirth,
				doNotContact,
				description,
				createdAt,
				createdBy,
				updatedAt,
				updatedBy,
				deletedAt,
				deletedBy,
				version);
	}

	public void update(AccountId accountId, ContactOwner owner,
			String honorific, String givenName, String middleName,
			String familyName, String displayName, String jobTitle,
			String department, String preferredLanguageCode,
			PreferredContactChannel preferredContactChannel,
			ContactLifecycleStage lifecycleStage, LocalDate dateOfBirth,
			boolean doNotContact, String description, ActorId updatedBy,
			Instant now, long expectedVersion) {
		requireActive();
		checkVersion(expectedVersion);
		this.accountId = accountId;
		this.owner = owner;
		this.honorific = optionalText(honorific, NAME_PART_MAX_LENGTH,
				"honorific");
		this.givenName = optionalText(givenName, NAME_PART_MAX_LENGTH,
				"givenName");
		this.middleName = optionalText(middleName, NAME_PART_MAX_LENGTH,
				"middleName");
		this.familyName = optionalText(familyName, NAME_PART_MAX_LENGTH,
				"familyName");
		this.displayName = requiredText(displayName, DISPLAY_NAME_MAX_LENGTH,
				"displayName");
		this.jobTitle = optionalText(jobTitle, JOB_TITLE_MAX_LENGTH,
				"jobTitle");
		this.department = optionalText(department, DEPARTMENT_MAX_LENGTH,
				"department");
		this.preferredLanguageCode = normalizeLanguageCode(
				preferredLanguageCode);
		this.preferredContactChannel = preferredContactChannel;
		this.lifecycleStage = Objects.requireNonNull(lifecycleStage,
				"lifecycleStage must not be null");
		this.dateOfBirth = dateOfBirth;
		this.doNotContact = doNotContact;
		this.description = optionalUnboundedText(description);
		this.updatedAt = Objects.requireNonNull(now, "now must not be null");
		this.updatedBy = updatedBy;
		this.version++;
	}

	public void delete(ActorId deletedBy, Instant now, long expectedVersion) {
		requireActive();
		checkVersion(expectedVersion);
		this.deletedAt = Objects.requireNonNull(now, "now must not be null");
		this.deletedBy = Objects.requireNonNull(deletedBy,
				"deletedBy must not be null");
		this.updatedAt = now;
		this.updatedBy = deletedBy;
		this.version++;
	}

	public boolean isActive() {
		return deletedAt == null;
	}

	private void requireActive() {
		if (!isActive()) {
			throw new IllegalStateException(
					"Operation is not permitted on deleted contact");
		}
	}

	private void checkVersion(long expectedVersion) {
		if (this.version != expectedVersion) {
			throw new IllegalStateException(
					"Contact version mismatch: expected " + expectedVersion
							+ " but was " + this.version);
		}
	}

	private static String requiredText(String value, int maxLength,
			String fieldName) {
		if (value == null || value.trim().isEmpty()) {
			throw new IllegalArgumentException(
					fieldName + " must not be blank");
		}
		String trimmed = value.trim();
		if (trimmed.length() > maxLength) {
			throw new IllegalArgumentException(fieldName + " length must be <= "
					+ maxLength);
		}
		return trimmed;
	}

	private static String optionalText(String value, int maxLength,
			String fieldName) {
		if (value == null || value.trim().isEmpty()) {
			return null;
		}
		String trimmed = value.trim();
		if (trimmed.length() > maxLength) {
			throw new IllegalArgumentException(fieldName + " length must be <= "
					+ maxLength);
		}
		return trimmed;
	}

	private static String optionalUnboundedText(String value) {
		if (value == null || value.trim().isEmpty()) {
			return null;
		}
		return value.trim();
	}

	private static String normalizeLanguageCode(String value) {
		if (value == null || value.trim().isEmpty()) {
			return null;
		}
		String trimmed = value.trim();
		if (trimmed.length() > LANGUAGE_CODE_MAX_LENGTH
				|| !LANGUAGE_CODE_PATTERN.matcher(trimmed).matches()) {
			throw new IllegalArgumentException(
					"preferredLanguageCode is invalid: " + value);
		}
		return trimmed;
	}

	public TenantId tenantId() {
		return tenantId;
	}

	public ContactId id() {
		return id;
	}

	public String contactNumber() {
		return contactNumber;
	}

	public AccountId accountId() {
		return accountId;
	}

	public ContactOwner owner() {
		return owner;
	}

	public String honorific() {
		return honorific;
	}

	public String givenName() {
		return givenName;
	}

	public String middleName() {
		return middleName;
	}

	public String familyName() {
		return familyName;
	}

	public String displayName() {
		return displayName;
	}

	public String jobTitle() {
		return jobTitle;
	}

	public String department() {
		return department;
	}

	public String preferredLanguageCode() {
		return preferredLanguageCode;
	}

	public PreferredContactChannel preferredContactChannel() {
		return preferredContactChannel;
	}

	public ContactLifecycleStage lifecycleStage() {
		return lifecycleStage;
	}

	public LocalDate dateOfBirth() {
		return dateOfBirth;
	}

	public boolean isDoNotContact() {
		return doNotContact;
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
