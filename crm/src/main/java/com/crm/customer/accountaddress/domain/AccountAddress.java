package com.crm.customer.accountaddress.domain;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.Objects;

import com.crm.customer.account.domain.AccountId;
import com.crm.sharedkernel.domain.ActorId;
import com.crm.sharedkernel.domain.TenantId;
import com.crm.sharedkernel.domain.exception.BusinessRuleViolation;
import com.crm.sharedkernel.domain.exception.ResourceConflict;

public final class AccountAddress {

	private final TenantId tenantId;
	private final AccountAddressId id;
	private final AccountId accountId;
	private AddressContent content;
	private AddressValidationStatus validationStatus;
	private AccountAddressType addressType;
	private boolean primary;
	private LocalDate validFrom;
	private LocalDate validTo;
	private final Instant createdAt;
	private final ActorId createdBy;
	private Instant updatedAt;
	private ActorId updatedBy;
	private long version;

	private AccountAddress(TenantId tenantId, AccountAddressId id,
			AccountId accountId, AddressContent content,
			AddressValidationStatus validationStatus,
			AccountAddressType addressType, boolean primary,
			LocalDate validFrom, LocalDate validTo, Instant createdAt,
			ActorId createdBy, Instant updatedAt, ActorId updatedBy,
			long version) {
		this.tenantId = Objects.requireNonNull(tenantId,
				"tenantId must not be null");
		this.id = Objects.requireNonNull(id, "id must not be null");
		this.accountId = Objects.requireNonNull(accountId,
				"accountId must not be null");
		this.content = Objects.requireNonNull(content, "content must not be null");
		this.validationStatus = Objects.requireNonNull(validationStatus,
				"validationStatus must not be null");
		this.addressType = Objects.requireNonNull(addressType,
				"addressType must not be null");
		if (validFrom != null && validTo != null && validTo.isBefore(validFrom)) {
			throw new IllegalArgumentException(
					"validTo must not be before validFrom");
		}
		this.primary = primary;
		this.validFrom = validFrom;
		this.validTo = validTo;
		this.createdAt = Objects.requireNonNull(createdAt,
				"createdAt must not be null");
		this.createdBy = createdBy;
		this.updatedAt = Objects.requireNonNull(updatedAt,
				"updatedAt must not be null");
		this.updatedBy = updatedBy;
		if (version < 1) {
			throw new IllegalArgumentException("version must be positive");
		}
		this.version = version;
	}

	public static AccountAddress create(TenantId tenantId, AccountAddressId id,
			AccountId accountId, AddressContent content,
			AccountAddressType addressType, boolean requestedPrimary,
			LocalDate validFrom, ActorId actorId, Instant now,
			LocalDate currentDate) {
		ActorId requiredActorId = Objects.requireNonNull(actorId,
				"actorId must not be null");
		Instant requiredNow = Objects.requireNonNull(now, "now must not be null");
		LocalDate requiredCurrentDate = Objects.requireNonNull(currentDate,
				"currentDate must not be null");
		rejectFuturePrimary(requestedPrimary, validFrom, requiredCurrentDate);
		return new AccountAddress(tenantId, id, accountId, content,
				AddressValidationStatus.UNVERIFIED, addressType, requestedPrimary,
				validFrom, null, requiredNow, requiredActorId, requiredNow,
				requiredActorId, 1L);
	}

	public static AccountAddress rehydrate(TenantId tenantId,
			AccountAddressId id, AccountId accountId, AddressContent content,
			AddressValidationStatus validationStatus,
			AccountAddressType addressType, boolean primary, LocalDate validFrom,
			LocalDate validTo, Instant createdAt, ActorId createdBy,
			Instant updatedAt, ActorId updatedBy, long version) {
		return new AccountAddress(tenantId, id, accountId, content,
				validationStatus, addressType, primary, validFrom, validTo,
				createdAt, createdBy, updatedAt, updatedBy, version);
	}

	public void replace(AddressContent content, AccountAddressType addressType,
			boolean requestedPrimary, LocalDate validFrom,
			LocalDate currentDate, ActorId actorId, Instant now) {
		if (isEnded()) {
			throw new ResourceConflict(
					AccountAddressErrorCode.ACCOUNT_ADDRESS_ALREADY_ENDED);
		}
		LocalDate requiredCurrentDate = Objects.requireNonNull(currentDate,
				"currentDate must not be null");
		rejectFuturePrimary(requestedPrimary, validFrom, requiredCurrentDate);
		AddressContent replacementContent = Objects.requireNonNull(content,
				"content must not be null");
		AccountAddressType replacementAddressType = Objects.requireNonNull(
				addressType, "addressType must not be null");
		ActorId requiredActorId = Objects.requireNonNull(actorId,
				"actorId must not be null");
		Instant requiredNow = Objects.requireNonNull(now, "now must not be null");
		long nextVersion = Math.incrementExact(version);
		this.content = replacementContent;
		this.addressType = replacementAddressType;
		this.primary = requestedPrimary;
		this.validFrom = validFrom;
		updateAudit(requiredActorId, requiredNow, nextVersion);
	}

	public void demote(ActorId actorId, Instant now) {
		if (!primary) {
			return;
		}
		if (isEnded()) {
			throw new ResourceConflict(
					AccountAddressErrorCode.ACCOUNT_ADDRESS_ALREADY_ENDED);
		}
		ActorId requiredActorId = Objects.requireNonNull(actorId,
				"actorId must not be null");
		Instant requiredNow = Objects.requireNonNull(now, "now must not be null");
		long nextVersion = Math.incrementExact(version);
		primary = false;
		updateAudit(requiredActorId, requiredNow, nextVersion);
	}

	public void end(LocalDate currentDate, ActorId actorId, Instant now) {
		if (validTo != null) {
			throw new ResourceConflict(
					AccountAddressErrorCode.ACCOUNT_ADDRESS_ALREADY_ENDED);
		}
		LocalDate requiredCurrentDate = Objects.requireNonNull(currentDate,
				"currentDate must not be null");
		if (validFrom != null && requiredCurrentDate.isBefore(validFrom)) {
			throw new BusinessRuleViolation(
					AccountAddressErrorCode.ACCOUNT_ADDRESS_PERIOD_INVALID);
		}
		ActorId requiredActorId = Objects.requireNonNull(actorId,
				"actorId must not be null");
		Instant requiredNow = Objects.requireNonNull(now, "now must not be null");
		long nextVersion = Math.incrementExact(version);
		validTo = requiredCurrentDate;
		primary = false;
		updateAudit(requiredActorId, requiredNow, nextVersion);
	}

	public boolean isEnded() {
		return validTo != null;
	}

	public boolean isCurrent(LocalDate currentDate) {
		LocalDate requiredCurrentDate = Objects.requireNonNull(currentDate,
				"currentDate must not be null");
		return (validFrom == null || !validFrom.isAfter(requiredCurrentDate))
				&& validTo == null;
	}

	public TenantId tenantId() {
		return tenantId;
	}

	public AccountAddressId id() {
		return id;
	}

	public AccountId accountId() {
		return accountId;
	}

	public AddressContent content() {
		return content;
	}

	public AddressValidationStatus validationStatus() {
		return validationStatus;
	}

	public AccountAddressType addressType() {
		return addressType;
	}

	public boolean isPrimary() {
		return primary;
	}

	public LocalDate validFrom() {
		return validFrom;
	}

	public LocalDate validTo() {
		return validTo;
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

	public String addressLine1() {
		return content.addressLine1();
	}

	public String addressLine2() {
		return content.addressLine2();
	}

	public String locality() {
		return content.locality();
	}

	public String administrativeArea() {
		return content.administrativeArea();
	}

	public String postalCode() {
		return content.postalCode();
	}

	public String countryCode() {
		return content.countryCode();
	}

	public BigDecimal latitude() {
		return content.latitude();
	}

	public BigDecimal longitude() {
		return content.longitude();
	}

	public String formattedAddress() {
		return content.formattedAddress();
	}

	private static void rejectFuturePrimary(boolean requestedPrimary,
			LocalDate validFrom, LocalDate currentDate) {
		if (requestedPrimary && validFrom != null
				&& validFrom.isAfter(currentDate)) {
			throw new BusinessRuleViolation(
					AccountAddressErrorCode.ACCOUNT_ADDRESS_PRIMARY_INVALID);
		}
	}

	private void updateAudit(ActorId actorId, Instant now, long nextVersion) {
		updatedAt = now;
		updatedBy = actorId;
		version = nextVersion;
	}

}
