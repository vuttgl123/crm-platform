package com.crm.customer.accountaddress.application.service;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Objects;

import com.crm.customer.account.domain.AccountErrorCode;
import com.crm.customer.account.domain.AccountId;
import com.crm.customer.accountaddress.application.command.CreateAccountAddressCommand;
import com.crm.customer.accountaddress.application.command.EndAccountAddressCommand;
import com.crm.customer.accountaddress.application.command.UpdateAccountAddressCommand;
import com.crm.customer.accountaddress.application.dto.AccountAddressDetails;
import com.crm.customer.accountaddress.application.port.AccountAddressRepository;
import com.crm.customer.accountaddress.application.query.AccountAddressSearchQuery;
import com.crm.customer.accountaddress.application.usecase.AccountAddressFacade;
import com.crm.customer.accountaddress.domain.AccountAddress;
import com.crm.customer.accountaddress.domain.AccountAddressErrorCode;
import com.crm.customer.accountaddress.domain.AccountAddressId;
import com.crm.customer.accountaddress.domain.AccountAddressType;
import com.crm.customer.accountaddress.domain.AddressContent;
import com.crm.foundation.identifier.IdentifierGenerator;
import com.crm.foundation.security.AuthorizedDataAccess;
import com.crm.foundation.security.CurrentActor;
import com.crm.foundation.security.SystemPermission;
import com.crm.foundation.security.TenantAccessAuthorizer;
import com.crm.foundation.tenancy.CurrentTenant;
import com.crm.foundation.time.TimeProvider;
import com.crm.sharedkernel.domain.ActorId;
import com.crm.sharedkernel.domain.TenantId;
import com.crm.sharedkernel.domain.exception.DomainResourceNotFound;
import com.crm.sharedkernel.domain.exception.ResourceConflict;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AccountAddressApplicationService implements AccountAddressFacade {

	private static final String ENTITY_TYPE = "ACCOUNT";

	private final AccountAddressRepository repository;
	private final CurrentTenant currentTenant;
	private final CurrentActor currentActor;
	private final TenantAccessAuthorizer authorizer;
	private final IdentifierGenerator identifierGenerator;
	private final TimeProvider timeProvider;

	public AccountAddressApplicationService(AccountAddressRepository repository,
			CurrentTenant currentTenant, CurrentActor currentActor,
			TenantAccessAuthorizer authorizer,
			IdentifierGenerator identifierGenerator,
			TimeProvider timeProvider) {
		this.repository = repository;
		this.currentTenant = currentTenant;
		this.currentActor = currentActor;
		this.authorizer = authorizer;
		this.identifierGenerator = identifierGenerator;
		this.timeProvider = timeProvider;
	}

	@Override
	@Transactional(readOnly = true)
	public List<AccountAddressDetails> list(AccountAddressSearchQuery query) {
		Objects.requireNonNull(query, "query must not be null");
		TenantId tenantId = currentTenant.requireTenantId();
		ActorId actorId = currentActor.requireActorId();
		AuthorizedDataAccess access = authorizer.authorize(
				SystemPermission.CRM_ACCOUNT_READ, ENTITY_TYPE);
		requireAccessibleAccount(
				tenantId, query.accountId(), actorId, access);
		LocalDate currentDate = utcDate(timeProvider.now());
		return repository.findAll(tenantId, actorId, query, currentDate, access)
				.stream()
				.map(AccountAddressDetails::from)
				.toList();
	}

	@Override
	@Transactional(isolation = Isolation.READ_COMMITTED)
	public AccountAddressDetails create(CreateAccountAddressCommand command) {
		Objects.requireNonNull(command, "command must not be null");
		TenantId tenantId = currentTenant.requireTenantId();
		ActorId actorId = currentActor.requireActorId();
		AuthorizedDataAccess access = authorizer.authorize(
				SystemPermission.CRM_ACCOUNT_WRITE, ENTITY_TYPE);

		requireLockedAccount(tenantId, command.accountId(), actorId, access);
		Instant now = timeProvider.now();
		LocalDate currentDate = utcDate(now);
		AddressContent content = contentFrom(command);
		AccountAddress address = AccountAddress.create(
				tenantId, new AccountAddressId(identifierGenerator.nextId()),
				command.accountId(), content, command.addressType(),
				command.isPrimary(), command.validFrom(), actorId, now, currentDate);
		demoteExistingPrimary(address, null, currentDate, actorId, access, now);
		repository.insert(address);
		return reloadPersistedDetails(
				tenantId, command.accountId(), address.id(), actorId, access);
	}

	@Override
	@Transactional(isolation = Isolation.READ_COMMITTED)
	public AccountAddressDetails update(UpdateAccountAddressCommand command) {
		Objects.requireNonNull(command, "command must not be null");
		TenantId tenantId = currentTenant.requireTenantId();
		ActorId actorId = currentActor.requireActorId();
		AuthorizedDataAccess access = authorizer.authorize(
				SystemPermission.CRM_ACCOUNT_WRITE, ENTITY_TYPE);

		requireLockedAccount(tenantId, command.accountId(), actorId, access);
		AccountAddress address = repository.findById(
				tenantId, command.accountId(), command.addressId(), actorId, access)
				.orElseThrow(AccountAddressApplicationService::addressNotFound);
		if (command.version() != address.version()) {
			throw versionConflict();
		}
		long expectedVersion = address.version();
		AccountAddressType persistedAddressType = address.addressType();
		Instant now = timeProvider.now();
		LocalDate currentDate = utcDate(now);
		address.replace(contentFrom(command), command.addressType(),
				command.isPrimary(), command.validFrom(), currentDate, actorId, now);
		demoteExistingPrimary(address, address.id(), currentDate,
				actorId, access, now);
		if (repository.update(address, persistedAddressType, expectedVersion,
				actorId, access) != 1) {
			throw versionConflict();
		}
		return reloadPersistedDetails(
				tenantId, command.accountId(), address.id(), actorId, access);
	}

	@Override
	@Transactional(isolation = Isolation.READ_COMMITTED)
	public AccountAddressDetails end(EndAccountAddressCommand command) {
		Objects.requireNonNull(command, "command must not be null");
		TenantId tenantId = currentTenant.requireTenantId();
		ActorId actorId = currentActor.requireActorId();
		AuthorizedDataAccess access = authorizer.authorize(
				SystemPermission.CRM_ACCOUNT_WRITE, ENTITY_TYPE);

		requireLockedAccount(tenantId, command.accountId(), actorId, access);
		AccountAddress address = repository.findById(
				tenantId, command.accountId(), command.addressId(), actorId, access)
				.orElseThrow(AccountAddressApplicationService::addressNotFound);
		if (command.version() != address.version()) {
			throw versionConflict();
		}
		long expectedVersion = address.version();
		AccountAddressType persistedAddressType = address.addressType();
		Instant now = timeProvider.now();
		LocalDate currentDate = utcDate(now);
		address.end(currentDate, actorId, now);
		if (repository.update(address, persistedAddressType, expectedVersion,
				actorId, access) != 1) {
			throw versionConflict();
		}
		return reloadPersistedDetails(
				tenantId, command.accountId(), address.id(), actorId, access);
	}

	private static AddressContent contentFrom(
			CreateAccountAddressCommand command) {
		return new AddressContent(command.addressLine1(), command.addressLine2(),
				command.locality(), command.administrativeArea(),
				command.postalCode(), command.countryCode(), command.latitude(),
				command.longitude(), command.formattedAddress());
	}

	private static AddressContent contentFrom(
			UpdateAccountAddressCommand command) {
		return new AddressContent(command.addressLine1(), command.addressLine2(),
				command.locality(), command.administrativeArea(),
				command.postalCode(), command.countryCode(), command.latitude(),
				command.longitude(), command.formattedAddress());
	}

	private void demoteExistingPrimary(AccountAddress address,
			AccountAddressId excludedAddressId, LocalDate currentDate,
			ActorId actorId, AuthorizedDataAccess access, Instant now) {
		if (!address.isPrimary()) {
			return;
		}
		repository.findCurrentPrimary(address.tenantId(), address.accountId(),
				address.addressType(), excludedAddressId, currentDate,
				actorId, access)
				.ifPresent(existingPrimary -> {
					long expectedVersion = existingPrimary.version();
					AccountAddressType persistedType =
							existingPrimary.addressType();
					existingPrimary.demote(actorId, now);
					if (repository.update(existingPrimary, persistedType,
							expectedVersion, actorId, access) != 1) {
						throw versionConflict();
					}
				});
	}

	private void requireAccessibleAccount(TenantId tenantId,
			AccountId accountId, ActorId actorId,
			AuthorizedDataAccess access) {
		if (!repository.accountAccessible(
				tenantId, accountId, actorId, access)) {
			throw accountNotFound();
		}
	}

	private void requireLockedAccount(TenantId tenantId,
			AccountId accountId, ActorId actorId,
			AuthorizedDataAccess access) {
		if (!repository.lockAccount(tenantId, accountId, actorId, access)) {
			throw accountNotFound();
		}
	}

	private AccountAddressDetails reloadPersistedDetails(
			TenantId tenantId, AccountId accountId,
			AccountAddressId addressId, ActorId actorId,
			AuthorizedDataAccess access) {
		return repository.findById(
				tenantId, accountId, addressId, actorId, access)
				.map(AccountAddressDetails::from)
				.orElseThrow(() -> new IllegalStateException(
						"Persisted Account address could not be reloaded"));
	}

	private static LocalDate utcDate(Instant now) {
		return LocalDate.ofInstant(now, ZoneOffset.UTC);
	}

	private static DomainResourceNotFound accountNotFound() {
		return new DomainResourceNotFound(AccountErrorCode.ACCOUNT_NOT_FOUND);
	}

	private static DomainResourceNotFound addressNotFound() {
		return new DomainResourceNotFound(
				AccountAddressErrorCode.ACCOUNT_ADDRESS_NOT_FOUND);
	}

	private static ResourceConflict versionConflict() {
		return new ResourceConflict(
				AccountAddressErrorCode.ACCOUNT_ADDRESS_VERSION_CONFLICT);
	}

}
