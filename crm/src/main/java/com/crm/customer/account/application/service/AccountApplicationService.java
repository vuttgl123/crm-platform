package com.crm.customer.account.application.service;

import java.time.Instant;
import java.util.Objects;

import com.crm.customer.account.application.command.CreateAccountCommand;
import com.crm.customer.account.application.command.DeleteAccountCommand;
import com.crm.customer.account.application.command.UpdateAccountCommand;
import com.crm.customer.account.application.dto.AccountDetails;
import com.crm.customer.account.application.dto.AccountSummary;
import com.crm.customer.account.application.port.AccountRepository;
import com.crm.customer.account.application.query.AccountSearchQuery;
import com.crm.customer.account.application.usecase.AccountFacade;
import com.crm.customer.account.domain.Account;
import com.crm.customer.account.domain.AccountErrorCode;
import com.crm.customer.account.domain.AccountId;
import com.crm.customer.account.domain.AccountOwner;
import com.crm.foundation.identifier.IdentifierGenerator;
import com.crm.foundation.security.AuthorizedDataAccess;
import com.crm.foundation.security.CurrentActor;
import com.crm.foundation.security.DataScopeType;
import com.crm.foundation.security.SystemPermission;
import com.crm.foundation.security.TenantAccessAuthorizer;
import com.crm.foundation.tenancy.CurrentTenant;
import com.crm.foundation.time.TimeProvider;
import com.crm.sharedkernel.application.PageResult;
import com.crm.sharedkernel.domain.ActorId;
import com.crm.sharedkernel.domain.TenantId;
import com.crm.sharedkernel.domain.exception.BusinessRuleViolation;
import com.crm.sharedkernel.domain.exception.DomainResourceNotFound;
import com.crm.sharedkernel.domain.exception.ResourceConflict;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AccountApplicationService implements AccountFacade {

	private static final String ENTITY_TYPE = "ACCOUNT";

	private final AccountRepository accountRepository;
	private final CurrentTenant currentTenant;
	private final CurrentActor currentActor;
	private final TenantAccessAuthorizer authorizer;
	private final IdentifierGenerator identifierGenerator;
	private final TimeProvider timeProvider;

	public AccountApplicationService(AccountRepository accountRepository,
			CurrentTenant currentTenant, CurrentActor currentActor,
			TenantAccessAuthorizer authorizer,
			IdentifierGenerator identifierGenerator,
			TimeProvider timeProvider) {
		this.accountRepository = accountRepository;
		this.currentTenant = currentTenant;
		this.currentActor = currentActor;
		this.authorizer = authorizer;
		this.identifierGenerator = identifierGenerator;
		this.timeProvider = timeProvider;
	}

	@Override
	@Transactional
	public AccountDetails create(CreateAccountCommand command) {
		Objects.requireNonNull(command, "command must not be null");
		TenantId tenantId = currentTenant.requireTenantId();
		ActorId actorId = currentActor.requireActorId();
		AuthorizedDataAccess access = authorizer.authorize(
				SystemPermission.CRM_ACCOUNT_WRITE, ENTITY_TYPE);
		AccountId accountId = new AccountId(identifierGenerator.nextId());
		Instant now = timeProvider.now();

		AccountOwner owner = command.owner();
		if (owner == null && !hasTenantScope(access)) {
			owner = resolveDefaultOwner(actorId, access);
		}

		Account account = Account.create(
				tenantId,
				accountId,
				command.accountNumber(),
				command.accountType(),
				command.legalName(),
				command.displayName(),
				command.parentAccountId(),
				owner,
				command.lifecycleStage(),
				command.industryCode(),
				command.taxIdentifier(),
				command.registrationNumber(),
				command.website(),
				command.annualRevenue(),
				command.employeeCount(),
				command.description(),
				command.preferredLanguageCode(),
				command.doNotContact(),
				actorId,
				now);

		validateOwner(tenantId, actorId, account.owner(), access);
		validateParent(tenantId, actorId, account.id(),
				account.parentAccountId(), access);

		if (accountRepository.existsActiveNumber(
				tenantId, account.accountNumber())) {
			throw new ResourceConflict(
					AccountErrorCode.ACCOUNT_NUMBER_ALREADY_EXISTS);
		}

		try {
			accountRepository.insert(account);
		}
		catch (DuplicateKeyException exception) {
			throw new ResourceConflict(
					AccountErrorCode.ACCOUNT_NUMBER_ALREADY_EXISTS);
		}
		return AccountDetails.from(account);
	}

	@Override
	@Transactional(readOnly = true)
	public AccountDetails get(AccountId accountId) {
		Objects.requireNonNull(accountId, "accountId must not be null");
		TenantId tenantId = currentTenant.requireTenantId();
		ActorId actorId = currentActor.requireActorId();
		AuthorizedDataAccess access = authorizer.authorize(
				SystemPermission.CRM_ACCOUNT_READ, ENTITY_TYPE);
		return accountRepository.findById(
					tenantId, accountId, actorId, access)
				.map(AccountDetails::from)
				.orElseThrow(AccountApplicationService::accountNotFound);
	}

	@Override
	@Transactional(readOnly = true)
	public PageResult<AccountSummary> search(AccountSearchQuery query) {
		Objects.requireNonNull(query, "query must not be null");
		TenantId tenantId = currentTenant.requireTenantId();
		ActorId actorId = currentActor.requireActorId();
		AuthorizedDataAccess access = authorizer.authorize(
				SystemPermission.CRM_ACCOUNT_READ, ENTITY_TYPE);
		return accountRepository.search(tenantId, actorId, query, access);
	}

	@Override
	@Transactional
	public AccountDetails update(UpdateAccountCommand command) {
		Objects.requireNonNull(command, "command must not be null");
		TenantId tenantId = currentTenant.requireTenantId();
		ActorId actorId = currentActor.requireActorId();
		AuthorizedDataAccess access = authorizer.authorize(
				SystemPermission.CRM_ACCOUNT_WRITE, ENTITY_TYPE);
		Account account = findForWrite(
				tenantId, command.accountId(), actorId, access);
		if (command.version() != account.version()) {
			throw versionConflict();
		}

		AccountOwner owner = command.owner() != null ? command.owner() : account.owner();
		if (owner == null && !hasTenantScope(access)) {
			owner = resolveDefaultOwner(actorId, access);
		}

		validateOwner(tenantId, actorId, owner, access);
		validateParent(tenantId, actorId, account.id(),
				command.parentAccountId(), access);

		long expectedVersion = account.version();
		Instant now = timeProvider.now();
		account.replace(
				command.accountType(),
				command.legalName(),
				command.displayName(),
				command.parentAccountId(),
				owner,
				command.lifecycleStage(),
				command.industryCode(),
				command.taxIdentifier(),
				command.registrationNumber(),
				command.website(),
				command.annualRevenue(),
				command.employeeCount(),
				command.description(),
				command.preferredLanguageCode(),
				command.doNotContact(),
				actorId,
				now);

		if (accountRepository.update(
				account, expectedVersion, actorId, access) != 1) {
			throw versionConflict();
		}
		return AccountDetails.from(account);
	}

	@Override
	@Transactional
	public void delete(DeleteAccountCommand command) {
		Objects.requireNonNull(command, "command must not be null");
		TenantId tenantId = currentTenant.requireTenantId();
		ActorId actorId = currentActor.requireActorId();
		AuthorizedDataAccess access = authorizer.authorize(
				SystemPermission.CRM_ACCOUNT_WRITE, ENTITY_TYPE);
		Account account = findForWrite(
				tenantId, command.accountId(), actorId, access);
		if (command.version() != account.version()) {
			throw versionConflict();
		}

		long expectedVersion = account.version();
		account.softDelete(actorId, timeProvider.now());
		if (accountRepository.softDelete(
				account, expectedVersion, actorId, access) != 1) {
			throw versionConflict();
		}
	}

	private Account findForWrite(TenantId tenantId, AccountId accountId,
			ActorId actorId, AuthorizedDataAccess access) {
		return accountRepository.findById(tenantId, accountId, actorId, access)
				.orElseThrow(AccountApplicationService::accountNotFound);
	}

	private void validateOwner(TenantId tenantId, ActorId actorId,
			AccountOwner owner, AuthorizedDataAccess access) {
		if (owner == null) {
			if (!hasTenantScope(access)) {
				throw new AccessDeniedException(
						"Unassigned Account requires TENANT scope");
			}
			return;
		}
		if (!accountRepository.ownerReferenceExists(tenantId, owner)) {
			throw new BusinessRuleViolation(
					AccountErrorCode.ACCOUNT_OWNER_INVALID);
		}
		if (!accountRepository.ownerAllowed(
				tenantId, actorId, owner, access)) {
			throw new AccessDeniedException(
					"Requested Account owner is outside data scope");
		}
	}

	private void validateParent(TenantId tenantId, ActorId actorId,
			AccountId accountId, AccountId parentAccountId,
			AuthorizedDataAccess access) {
		if (parentAccountId == null) {
			return;
		}
		if (accountId.equals(parentAccountId)
				|| !accountRepository.parentAllowed(
					tenantId, actorId, parentAccountId, access)) {
			throw new BusinessRuleViolation(
					AccountErrorCode.ACCOUNT_PARENT_INVALID);
		}
	}

	private static boolean hasTenantScope(AuthorizedDataAccess access) {
		return access.scopes().stream()
				.anyMatch(scope -> scope.type() == DataScopeType.TENANT);
	}

	private static AccountOwner resolveDefaultOwner(ActorId actorId, AuthorizedDataAccess access) {
		for (var scope : access.scopes()) {
			if ((scope.type() == DataScopeType.TEAM || scope.type() == DataScopeType.TEAM_TREE)
					&& scope.teamId() != null) {
				return AccountOwner.team(scope.teamId());
			}
		}
		return AccountOwner.user(actorId.value());
	}

	private static DomainResourceNotFound accountNotFound() {
		return new DomainResourceNotFound(AccountErrorCode.ACCOUNT_NOT_FOUND);
	}

	private static ResourceConflict versionConflict() {
		return new ResourceConflict(
				AccountErrorCode.ACCOUNT_VERSION_CONFLICT);
	}

}
