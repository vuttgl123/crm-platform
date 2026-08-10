package com.crm.platform.tenant.domain;

import java.time.DateTimeException;
import java.time.Instant;
import java.time.ZoneId;
import java.util.Objects;
import java.util.regex.Pattern;

import com.crm.sharedkernel.domain.ActorId;
import com.crm.sharedkernel.domain.TenantId;

public final class Tenant {

	private static final int TENANT_CODE_MAX_LENGTH = 320;
	private static final int NAME_MAX_LENGTH = 255;
	private static final int LANGUAGE_CODE_MAX_LENGTH = 10;
	private static final int TIMEZONE_MAX_LENGTH = 255;
	private static final Pattern CURRENCY_CODE_PATTERN =
			Pattern.compile("^[A-Z]{3}$");
	private static final Pattern COUNTRY_CODE_PATTERN =
			Pattern.compile("^[A-Z]{2}$");
	private static final Pattern LANGUAGE_CODE_PATTERN = Pattern.compile(
			"^[A-Za-z]{2,3}(-[A-Za-z0-9]{2,8})*$");

	private final TenantId id;
	private final String tenantCode;
	private final String legalName;
	private final String displayName;
	private final String defaultCurrencyCode;
	private final String defaultCountryCode;
	private final String defaultLanguageCode;
	private final String defaultTimezone;
	private final TenantStatus status;
	private final Instant createdAt;
	private final ActorId createdBy;
	private final Instant updatedAt;
	private final ActorId updatedBy;
	private final long version;

	private Tenant(TenantId id, String tenantCode, String legalName,
			String displayName, String defaultCurrencyCode,
			String defaultCountryCode, String defaultLanguageCode,
			String defaultTimezone, TenantStatus status, Instant createdAt,
			ActorId createdBy, Instant updatedAt, ActorId updatedBy,
			long version) {
		this.id = Objects.requireNonNull(id, "id must not be null");
		this.tenantCode = requiredText(
				tenantCode, TENANT_CODE_MAX_LENGTH, "tenantCode");
		this.legalName = requiredText(
				legalName, NAME_MAX_LENGTH, "legalName");
		this.displayName = requiredText(
				displayName, NAME_MAX_LENGTH, "displayName");
		this.defaultCurrencyCode = requiredPattern(
				defaultCurrencyCode, CURRENCY_CODE_PATTERN,
				"defaultCurrencyCode");
		this.defaultCountryCode = requiredPattern(
				defaultCountryCode, COUNTRY_CODE_PATTERN,
				"defaultCountryCode");
		this.defaultLanguageCode = languageCode(defaultLanguageCode);
		this.defaultTimezone = timezone(defaultTimezone);
		this.status = Objects.requireNonNull(status,
				"status must not be null");
		this.createdAt = Objects.requireNonNull(createdAt,
				"createdAt must not be null");
		this.createdBy = Objects.requireNonNull(createdBy,
				"createdBy must not be null");
		this.updatedAt = Objects.requireNonNull(updatedAt,
				"updatedAt must not be null");
		this.updatedBy = Objects.requireNonNull(updatedBy,
				"updatedBy must not be null");
		if (version < 1L) {
			throw new IllegalArgumentException("version must be positive");
		}
		this.version = version;
	}

	public static Tenant bootstrap(TenantId id, String tenantCode,
			String legalName, String displayName,
			String defaultCurrencyCode, String defaultCountryCode,
			String defaultLanguageCode, String defaultTimezone,
			ActorId actorId, Instant now) {
		ActorId requiredActorId = Objects.requireNonNull(actorId,
				"actorId must not be null");
		Instant requiredNow = Objects.requireNonNull(now,
				"now must not be null");
		return new Tenant(id, tenantCode, legalName, displayName,
				defaultCurrencyCode, defaultCountryCode,
				defaultLanguageCode, defaultTimezone, TenantStatus.ACTIVE,
				requiredNow, requiredActorId, requiredNow, requiredActorId,
				1L);
	}

	private static String requiredText(String value, int maxLength,
			String fieldName) {
		String normalized = Objects.requireNonNull(value,
				fieldName + " must not be null").trim();
		if (normalized.isEmpty()) {
			throw new IllegalArgumentException(fieldName + " must not be blank");
		}
		if (normalized.length() > maxLength) {
			throw new IllegalArgumentException(fieldName
					+ " must not exceed " + maxLength + " characters");
		}
		return normalized;
	}

	private static String requiredPattern(String value, Pattern pattern,
			String fieldName) {
		String normalized = requiredText(value, NAME_MAX_LENGTH, fieldName);
		if (!pattern.matcher(normalized).matches()) {
			throw new IllegalArgumentException(
					fieldName + " has an invalid format");
		}
		return normalized;
	}

	private static String languageCode(String value) {
		String normalized = requiredText(
				value, LANGUAGE_CODE_MAX_LENGTH, "defaultLanguageCode");
		if (!LANGUAGE_CODE_PATTERN.matcher(normalized).matches()) {
			throw new IllegalArgumentException(
					"defaultLanguageCode has an invalid format");
		}
		return normalized;
	}

	private static String timezone(String value) {
		String normalized = requiredText(
				value, TIMEZONE_MAX_LENGTH, "defaultTimezone");
		try {
			ZoneId.of(normalized);
			return normalized;
		}
		catch (DateTimeException exception) {
			throw new IllegalArgumentException(
					"defaultTimezone has an invalid value", exception);
		}
	}

	public TenantId id() {
		return id;
	}

	public String tenantCode() {
		return tenantCode;
	}

	public String legalName() {
		return legalName;
	}

	public String displayName() {
		return displayName;
	}

	public String defaultCurrencyCode() {
		return defaultCurrencyCode;
	}

	public String defaultCountryCode() {
		return defaultCountryCode;
	}

	public String defaultLanguageCode() {
		return defaultLanguageCode;
	}

	public String defaultTimezone() {
		return defaultTimezone;
	}

	public TenantStatus status() {
		return status;
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

	public long version() {
		return version;
	}

}
