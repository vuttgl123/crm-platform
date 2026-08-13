package com.crm.customer.accountcommunicationchannel.application.service;

import java.time.Instant;
import java.util.List;
import java.util.Objects;

import com.crm.customer.account.domain.AccountErrorCode;
import com.crm.customer.account.domain.AccountId;
import com.crm.customer.accountcommunicationchannel.application.command.CreateAccountCommunicationChannelCommand;
import com.crm.customer.accountcommunicationchannel.application.command.DeleteAccountCommunicationChannelCommand;
import com.crm.customer.accountcommunicationchannel.application.command.UpdateAccountCommunicationChannelCommand;
import com.crm.customer.accountcommunicationchannel.application.dto.AccountCommunicationChannelDetails;
import com.crm.customer.accountcommunicationchannel.application.port.AccountCommunicationChannelRepository;
import com.crm.customer.accountcommunicationchannel.application.usecase.AccountCommunicationChannelFacade;
import com.crm.customer.accountcommunicationchannel.domain.AccountCommunicationChannel;
import com.crm.customer.accountcommunicationchannel.domain.AccountCommunicationChannelErrorCode;
import com.crm.customer.accountcommunicationchannel.domain.AccountCommunicationChannelId;
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
public class AccountCommunicationChannelApplicationService
		implements AccountCommunicationChannelFacade {

	private static final String ENTITY_TYPE = "ACCOUNT";

	private final AccountCommunicationChannelRepository repository;
	private final CurrentTenant currentTenant;
	private final CurrentActor currentActor;
	private final TenantAccessAuthorizer authorizer;
	private final IdentifierGenerator identifierGenerator;
	private final TimeProvider timeProvider;

	public AccountCommunicationChannelApplicationService(
			AccountCommunicationChannelRepository repository,
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
	public List<AccountCommunicationChannelDetails> list(AccountId accountId) {
		Objects.requireNonNull(accountId, "accountId must not be null");
		TenantId tenantId = currentTenant.requireTenantId();
		ActorId actorId = currentActor.requireActorId();
		AuthorizedDataAccess access = authorizer.authorize(
				SystemPermission.CRM_ACCOUNT_READ, ENTITY_TYPE);
		requireAccessibleAccount(tenantId, accountId, actorId, access);
		return repository.findAll(tenantId, accountId, actorId, access)
				.stream()
				.map(AccountCommunicationChannelDetails::from)
				.toList();
	}

	@Override
	@Transactional(isolation = Isolation.READ_COMMITTED)
	public AccountCommunicationChannelDetails create(
			CreateAccountCommunicationChannelCommand command) {
		Objects.requireNonNull(command, "command must not be null");
		TenantId tenantId = currentTenant.requireTenantId();
		ActorId actorId = currentActor.requireActorId();
		AuthorizedDataAccess access = authorizer.authorize(
				SystemPermission.CRM_ACCOUNT_WRITE, ENTITY_TYPE);

		requireLockedAccount(tenantId, command.accountId(), actorId, access);
		Instant now = timeProvider.now();
		AccountCommunicationChannel channel = AccountCommunicationChannel.create(
				tenantId,
				new AccountCommunicationChannelId(identifierGenerator.nextId()),
				command.accountId(), command.channelType(), command.rawValue(),
				command.label(), command.isPrimary(), command.doNotUse(),
				actorId, now);
		rejectDuplicate(channel, null, actorId, access);
		demoteExistingPrimary(channel, null, actorId, access, now);
		repository.insert(channel);
		return reloadPersistedDetails(tenantId, command.accountId(), channel.id(),
				actorId, access);
	}

	@Override
	@Transactional(isolation = Isolation.READ_COMMITTED)
	public AccountCommunicationChannelDetails update(
			UpdateAccountCommunicationChannelCommand command) {
		Objects.requireNonNull(command, "command must not be null");
		TenantId tenantId = currentTenant.requireTenantId();
		ActorId actorId = currentActor.requireActorId();
		AuthorizedDataAccess access = authorizer.authorize(
				SystemPermission.CRM_ACCOUNT_WRITE, ENTITY_TYPE);

		requireLockedAccount(tenantId, command.accountId(), actorId, access);
		AccountCommunicationChannel channel = repository.findById(
				tenantId, command.accountId(), command.channelId(), actorId, access)
				.orElseThrow(AccountCommunicationChannelApplicationService::channelNotFound);
		if (command.version() != channel.version()) {
			throw versionConflict();
		}
		long expectedVersion = channel.version();
		Instant now = timeProvider.now();
		channel.replace(command.channelType(), command.rawValue(), command.label(),
				command.isPrimary(), command.doNotUse(), actorId, now);
		rejectDuplicate(channel, channel.id(), actorId, access);
		demoteExistingPrimary(channel, channel.id(), actorId, access, now);
		if (repository.update(channel, expectedVersion, actorId, access) != 1) {
			throw versionConflict();
		}
		return reloadPersistedDetails(tenantId, command.accountId(), channel.id(),
				actorId, access);
	}

	@Override
	@Transactional(isolation = Isolation.READ_COMMITTED)
	public void delete(DeleteAccountCommunicationChannelCommand command) {
		Objects.requireNonNull(command, "command must not be null");
		TenantId tenantId = currentTenant.requireTenantId();
		ActorId actorId = currentActor.requireActorId();
		AuthorizedDataAccess access = authorizer.authorize(
				SystemPermission.CRM_ACCOUNT_WRITE, ENTITY_TYPE);

		requireLockedAccount(tenantId, command.accountId(), actorId, access);
		AccountCommunicationChannel channel = repository.findById(
				tenantId, command.accountId(), command.channelId(), actorId, access)
				.orElseThrow(AccountCommunicationChannelApplicationService::channelNotFound);
		if (command.version() != channel.version()) {
			throw versionConflict();
		}
		long expectedVersion = channel.version();
		channel.softDelete(actorId, timeProvider.now());
		if (repository.softDelete(channel, expectedVersion, actorId, access) != 1) {
			throw versionConflict();
		}
	}

	private void requireAccessibleAccount(TenantId tenantId, AccountId accountId,
			ActorId actorId, AuthorizedDataAccess access) {
		if (!repository.accountAccessible(tenantId, accountId, actorId, access)) {
			throw accountNotFound();
		}
	}

	private void requireLockedAccount(TenantId tenantId, AccountId accountId,
			ActorId actorId, AuthorizedDataAccess access) {
		if (!repository.lockAccount(tenantId, accountId, actorId, access)) {
			throw accountNotFound();
		}
	}

	private void rejectDuplicate(AccountCommunicationChannel channel,
			AccountCommunicationChannelId excludedChannelId, ActorId actorId,
			AuthorizedDataAccess access) {
		if (repository.existsActiveDuplicate(channel.tenantId(),
				channel.accountId(), channel.channelType(),
				channel.canonicalValue(), excludedChannelId, actorId, access)) {
			throw channelAlreadyExists();
		}
	}

	private void demoteExistingPrimary(AccountCommunicationChannel channel,
			AccountCommunicationChannelId excludedChannelId, ActorId actorId,
			AuthorizedDataAccess access, Instant now) {
		if (!channel.isPrimary()) {
			return;
		}
		repository.findPrimary(channel.tenantId(), channel.accountId(),
				channel.channelType(), excludedChannelId, actorId, access)
				.ifPresent(existingPrimary -> {
					long expectedVersion = existingPrimary.version();
					existingPrimary.demote(actorId, now);
					if (repository.update(existingPrimary, expectedVersion, actorId,
							access) != 1) {
						throw versionConflict();
					}
				});
	}

	private AccountCommunicationChannelDetails reloadPersistedDetails(
			TenantId tenantId, AccountId accountId,
			AccountCommunicationChannelId channelId, ActorId actorId,
			AuthorizedDataAccess access) {
		return repository.findById(tenantId, accountId, channelId, actorId, access)
				.map(AccountCommunicationChannelDetails::from)
				.orElseThrow(() -> new IllegalStateException(
						"Persisted account communication channel could not be reloaded"));
	}

	private static DomainResourceNotFound accountNotFound() {
		return new DomainResourceNotFound(AccountErrorCode.ACCOUNT_NOT_FOUND);
	}

	private static DomainResourceNotFound channelNotFound() {
		return new DomainResourceNotFound(
				AccountCommunicationChannelErrorCode
						.ACCOUNT_COMMUNICATION_CHANNEL_NOT_FOUND);
	}

	private static ResourceConflict channelAlreadyExists() {
		return new ResourceConflict(
				AccountCommunicationChannelErrorCode
						.ACCOUNT_COMMUNICATION_CHANNEL_ALREADY_EXISTS);
	}

	private static ResourceConflict versionConflict() {
		return new ResourceConflict(
				AccountCommunicationChannelErrorCode
						.ACCOUNT_COMMUNICATION_CHANNEL_VERSION_CONFLICT);
	}

}
