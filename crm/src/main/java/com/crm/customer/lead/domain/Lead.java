package com.crm.customer.lead.domain;

import java.time.Instant;
import java.util.Objects;
import java.util.UUID;
import java.util.regex.Pattern;

import com.crm.sharedkernel.domain.ActorId;
import com.crm.sharedkernel.domain.TenantId;

public class Lead {

	private static final Pattern COUNTRY_CODE_PATTERN = Pattern.compile("^[A-Z]{2}$");
	private static final Pattern PHONE_E164_PATTERN = Pattern.compile("^\\+[1-9][0-9]{1,14}$");
	private static final Pattern LANGUAGE_CODE_PATTERN = Pattern.compile("^[A-Za-z]{2,3}(-[A-Za-z0-9]{2,8})*$");

	private final TenantId tenantId;
	private final LeadId id;
	private final String leadNumber;
	private UUID statusId;
	private UUID sourceId;
	private LeadOwner owner;
	private LeadRating rating;
	private String accountName;
	private String companyName;
	private String honorific;
	private String givenName;
	private String familyName;
	private String displayName;
	private String email;
	private String phoneE164;
	private String jobTitle;
	private String website;
	private String countryCode;
	private String preferredLanguageCode;
	private LeadEstimatedValue estimatedValue;
	private String qualificationNotes;
	private String disqualificationReason;
	private Instant convertedAt;
	private ActorId convertedBy;
	private UUID convertedAccountId;
	private UUID convertedContactId;
	private UUID convertedOpportunityId;

	private final Instant createdAt;
	private final ActorId createdBy;
	private Instant updatedAt;
	private ActorId updatedBy;
	private Instant deletedAt;
	private ActorId deletedBy;
	private long version;

	private Lead(
			TenantId tenantId,
			LeadId id,
			String leadNumber,
			UUID statusId,
			UUID sourceId,
			LeadOwner owner,
			LeadRating rating,
			String accountName,
			String companyName,
			String honorific,
			String givenName,
			String familyName,
			String displayName,
			String email,
			String phoneE164,
			String jobTitle,
			String website,
			String countryCode,
			String preferredLanguageCode,
			LeadEstimatedValue estimatedValue,
			String qualificationNotes,
			String disqualificationReason,
			Instant convertedAt,
			ActorId convertedBy,
			UUID convertedAccountId,
			UUID convertedContactId,
			UUID convertedOpportunityId,
			Instant createdAt,
			ActorId createdBy,
			Instant updatedAt,
			ActorId updatedBy,
			Instant deletedAt,
			ActorId deletedBy,
			long version) {
		this.tenantId = Objects.requireNonNull(tenantId, "tenantId must not be null");
		this.id = Objects.requireNonNull(id, "id must not be null");
		this.leadNumber = validateLeadNumber(leadNumber);
		this.statusId = Objects.requireNonNull(statusId, "statusId must not be null");
		this.sourceId = sourceId;
		this.owner = owner;
		this.rating = rating;
		this.accountName = trimToNull(accountName);
		this.companyName = trimToNull(companyName);
		this.honorific = trimToNull(honorific);
		this.givenName = trimToNull(givenName);
		this.familyName = trimToNull(familyName);
		this.displayName = validateDisplayName(displayName);
		this.email = trimToNull(email);
		this.phoneE164 = validatePhone(phoneE164);
		this.jobTitle = trimToNull(jobTitle);
		this.website = trimToNull(website);
		this.countryCode = validateCountryCode(countryCode);
		this.preferredLanguageCode = validateLanguageCode(preferredLanguageCode);
		this.estimatedValue = estimatedValue;
		this.qualificationNotes = trimToNull(qualificationNotes);
		this.disqualificationReason = trimToNull(disqualificationReason);
		this.convertedAt = convertedAt;
		this.convertedBy = convertedBy;
		this.convertedAccountId = convertedAccountId;
		this.convertedContactId = convertedContactId;
		this.convertedOpportunityId = convertedOpportunityId;
		this.createdAt = Objects.requireNonNull(createdAt, "createdAt must not be null");
		this.createdBy = createdBy;
		this.updatedAt = Objects.requireNonNull(updatedAt, "updatedAt must not be null");
		this.updatedBy = updatedBy;
		this.deletedAt = deletedAt;
		this.deletedBy = deletedBy;
		this.version = version;
	}

	public static Lead create(
			TenantId tenantId,
			LeadId id,
			String leadNumber,
			UUID statusId,
			UUID sourceId,
			LeadOwner owner,
			LeadRating rating,
			String accountName,
			String companyName,
			String honorific,
			String givenName,
			String familyName,
			String displayName,
			String email,
			String phoneE164,
			String jobTitle,
			String website,
			String countryCode,
			String preferredLanguageCode,
			LeadEstimatedValue estimatedValue,
			String qualificationNotes,
			ActorId actorId,
			Instant now) {
		return new Lead(
				tenantId,
				id,
				leadNumber,
				statusId,
				sourceId,
				owner,
				rating,
				accountName,
				companyName,
				honorific,
				givenName,
				familyName,
				displayName,
				email,
				phoneE164,
				jobTitle,
				website,
				countryCode,
				preferredLanguageCode,
				estimatedValue,
				qualificationNotes,
				null,
				null,
				null,
				null,
				null,
				null,
				now,
				actorId,
				now,
				actorId,
				null,
				null,
				1L);
	}

	public static Lead reconstitute(
			TenantId tenantId,
			LeadId id,
			String leadNumber,
			UUID statusId,
			UUID sourceId,
			LeadOwner owner,
			LeadRating rating,
			String accountName,
			String companyName,
			String honorific,
			String givenName,
			String familyName,
			String displayName,
			String email,
			String phoneE164,
			String jobTitle,
			String website,
			String countryCode,
			String preferredLanguageCode,
			LeadEstimatedValue estimatedValue,
			String qualificationNotes,
			String disqualificationReason,
			Instant convertedAt,
			ActorId convertedBy,
			UUID convertedAccountId,
			UUID convertedContactId,
			UUID convertedOpportunityId,
			Instant createdAt,
			ActorId createdBy,
			Instant updatedAt,
			ActorId updatedBy,
			Instant deletedAt,
			ActorId deletedBy,
			long version) {
		return new Lead(
				tenantId,
				id,
				leadNumber,
				statusId,
				sourceId,
				owner,
				rating,
				accountName,
				companyName,
				honorific,
				givenName,
				familyName,
				displayName,
				email,
				phoneE164,
				jobTitle,
				website,
				countryCode,
				preferredLanguageCode,
				estimatedValue,
				qualificationNotes,
				disqualificationReason,
				convertedAt,
				convertedBy,
				convertedAccountId,
				convertedContactId,
				convertedOpportunityId,
				createdAt,
				createdBy,
				updatedAt,
				updatedBy,
				deletedAt,
				deletedBy,
				version);
	}

	public void update(
			UUID statusId,
			UUID sourceId,
			LeadOwner owner,
			LeadRating rating,
			String accountName,
			String companyName,
			String honorific,
			String givenName,
			String familyName,
			String displayName,
			String email,
			String phoneE164,
			String jobTitle,
			String website,
			String countryCode,
			String preferredLanguageCode,
			LeadEstimatedValue estimatedValue,
			String qualificationNotes,
			String disqualificationReason,
			ActorId actorId,
			Instant now,
			long expectedVersion) {
		checkVersion(expectedVersion);
		this.statusId = Objects.requireNonNull(statusId, "statusId must not be null");
		this.sourceId = sourceId;
		this.owner = owner;
		this.rating = rating;
		this.accountName = trimToNull(accountName);
		this.companyName = trimToNull(companyName);
		this.honorific = trimToNull(honorific);
		this.givenName = trimToNull(givenName);
		this.familyName = trimToNull(familyName);
		this.displayName = validateDisplayName(displayName);
		this.email = trimToNull(email);
		this.phoneE164 = validatePhone(phoneE164);
		this.jobTitle = trimToNull(jobTitle);
		this.website = trimToNull(website);
		this.countryCode = validateCountryCode(countryCode);
		this.preferredLanguageCode = validateLanguageCode(preferredLanguageCode);
		this.estimatedValue = estimatedValue;
		this.qualificationNotes = trimToNull(qualificationNotes);
		this.disqualificationReason = trimToNull(disqualificationReason);
		this.updatedAt = Objects.requireNonNull(now, "now must not be null");
		this.updatedBy = actorId;
		this.version++;
	}

	public void convert(
			UUID convertedAccountId,
			UUID convertedContactId,
			UUID convertedOpportunityId,
			UUID convertedStatusId,
			ActorId actorId,
			Instant now,
			long expectedVersion) {
		checkVersion(expectedVersion);
		if (this.convertedAt != null) {
			throw new IllegalStateException("Lead is already converted");
		}
		this.convertedAt = Objects.requireNonNull(now, "now must not be null");
		this.convertedBy = actorId;
		this.convertedAccountId = convertedAccountId;
		this.convertedContactId = convertedContactId;
		this.convertedOpportunityId = convertedOpportunityId;
		if (convertedStatusId != null) {
			this.statusId = convertedStatusId;
		}
		this.updatedAt = now;
		this.updatedBy = actorId;
		this.version++;
	}

	public void delete(ActorId actorId, Instant now, long expectedVersion) {
		checkVersion(expectedVersion);
		this.deletedAt = Objects.requireNonNull(now, "now must not be null");
		this.deletedBy = actorId;
		this.updatedAt = now;
		this.updatedBy = actorId;
		this.version++;
	}

	private void checkVersion(long expectedVersion) {
		if (this.version != expectedVersion) {
			throw new IllegalStateException("Optimistic lock version mismatch");
		}
	}

	private static String validateLeadNumber(String leadNumber) {
		Objects.requireNonNull(leadNumber, "leadNumber must not be null");
		String trimmed = leadNumber.trim();
		if (trimmed.isEmpty()) {
			throw new IllegalArgumentException("leadNumber must not be blank");
		}
		if (trimmed.length() > 191) {
			throw new IllegalArgumentException("leadNumber must be <= 191 chars");
		}
		return trimmed;
	}

	private static String validateDisplayName(String displayName) {
		Objects.requireNonNull(displayName, "displayName must not be null");
		String trimmed = displayName.trim();
		if (trimmed.isEmpty()) {
			throw new IllegalArgumentException("displayName must not be blank");
		}
		if (trimmed.length() > 255) {
			throw new IllegalArgumentException("displayName must be <= 255 chars");
		}
		return trimmed;
	}

	private static String validateCountryCode(String countryCode) {
		String trimmed = trimToNull(countryCode);
		if (trimmed != null && !COUNTRY_CODE_PATTERN.matcher(trimmed).matches()) {
			throw new IllegalArgumentException("Country code must be 2 uppercase letters");
		}
		return trimmed;
	}

	private static String validateLanguageCode(String languageCode) {
		String trimmed = trimToNull(languageCode);
		if (trimmed != null && !LANGUAGE_CODE_PATTERN.matcher(trimmed).matches()) {
			throw new IllegalArgumentException("Language code format is invalid");
		}
		return trimmed;
	}

	private static String validatePhone(String phone) {
		String trimmed = trimToNull(phone);
		if (trimmed != null && !PHONE_E164_PATTERN.matcher(trimmed).matches()) {
			throw new IllegalArgumentException("Phone format must be E.164 (e.g. +84901234567)");
		}
		return trimmed;
	}

	private static String trimToNull(String value) {
		if (value == null) return null;
		String trimmed = value.trim();
		return trimmed.isEmpty() ? null : trimmed;
	}

	public TenantId tenantId() { return tenantId; }
	public LeadId id() { return id; }
	public String leadNumber() { return leadNumber; }
	public UUID statusId() { return statusId; }
	public UUID sourceId() { return sourceId; }
	public LeadOwner owner() { return owner; }
	public LeadRating rating() { return rating; }
	public String accountName() { return accountName; }
	public String companyName() { return companyName; }
	public String honorific() { return honorific; }
	public String givenName() { return givenName; }
	public String familyName() { return familyName; }
	public String displayName() { return displayName; }
	public String email() { return email; }
	public String phoneE164() { return phoneE164; }
	public String jobTitle() { return jobTitle; }
	public String website() { return website; }
	public String countryCode() { return countryCode; }
	public String preferredLanguageCode() { return preferredLanguageCode; }
	public LeadEstimatedValue estimatedValue() { return estimatedValue; }
	public String qualificationNotes() { return qualificationNotes; }
	public String disqualificationReason() { return disqualificationReason; }
	public Instant convertedAt() { return convertedAt; }
	public ActorId convertedBy() { return convertedBy; }
	public UUID convertedAccountId() { return convertedAccountId; }
	public UUID convertedContactId() { return convertedContactId; }
	public UUID convertedOpportunityId() { return convertedOpportunityId; }
	public Instant createdAt() { return createdAt; }
	public ActorId createdBy() { return createdBy; }
	public Instant updatedAt() { return updatedAt; }
	public ActorId updatedBy() { return updatedBy; }
	public Instant deletedAt() { return deletedAt; }
	public ActorId deletedBy() { return deletedBy; }
	public long version() { return version; }

}
