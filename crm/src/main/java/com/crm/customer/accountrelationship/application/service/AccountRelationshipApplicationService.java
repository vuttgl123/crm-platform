package com.crm.customer.accountrelationship.application.service;

import java.time.LocalDate;
import java.util.Objects;

import com.crm.customer.account.domain.AccountErrorCode;
import com.crm.customer.account.domain.AccountId;
import com.crm.customer.accountrelationship.application.command.CreateAccountRelationshipCommand;
import com.crm.customer.accountrelationship.application.command.EndAccountRelationshipCommand;
import com.crm.customer.accountrelationship.application.dto.AccountRelationshipDetails;
import com.crm.customer.accountrelationship.application.port.AccountRelationshipRepository;
import com.crm.customer.accountrelationship.application.query.AccountRelationshipSearchQuery;
import com.crm.customer.accountrelationship.application.usecase.AccountRelationshipFacade;
import com.crm.customer.accountrelationship.domain.AccountRelationship;
import com.crm.customer.accountrelationship.domain.AccountRelationshipErrorCode;
import com.crm.customer.accountrelationship.domain.AccountRelationshipId;
import com.crm.foundation.identifier.IdentifierGenerator;
import com.crm.foundation.security.AuthorizedDataAccess;
import com.crm.foundation.security.CurrentActor;
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
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AccountRelationshipApplicationService
		implements AccountRelationshipFacade {

	private static final String ENTITY_TYPE = "ACCOUNT";

	private final AccountRelationshipRepository repository;
	private final CurrentTenant currentTenant;
	private final CurrentActor currentActor;
	private final TenantAccessAuthorizer authorizer;
	private final IdentifierGenerator identifierGenerator;
	private final TimeProvider timeProvider;

	public AccountRelationshipApplicationService(
			AccountRelationshipRepository repository,
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
	@Transactional
	public AccountRelationshipDetails create(
			CreateAccountRelationshipCommand command) {
		Objects.requireNonNull(command, "command must not be null");
		TenantId tenantId = currentTenant.requireTenantId();
		ActorId actorId = currentActor.requireActorId();
		AuthorizedDataAccess access = authorizer.authorize(
				SystemPermission.CRM_ACCOUNT_WRITE, ENTITY_TYPE);

		requirePathAccount(tenantId, command.accountId(), actorId, access);
		requireRelatedAccount(
				tenantId, command.relatedAccountId(), actorId, access);

		AccountRelationship relationship = AccountRelationship.create(
				tenantId,
				new AccountRelationshipId(identifierGenerator.nextId()),
				command.accountId(),
				command.relatedAccountId(),
				command.relationshipType(),
				command.validFrom(),
				command.validTo(),
				command.description(),
				actorId,
				timeProvider.now());
		try {
			repository.insert(relationship);
		}
		catch (DuplicateKeyException exception) {
			throw relationshipAlreadyExists();
		}
		return reloadDetails(tenantId, command.accountId(), relationship.id(),
				actorId, access);
	}

	@Override
	@Transactional(readOnly = true)
	public PageResult<AccountRelationshipDetails> search(
			AccountRelationshipSearchQuery query) {
		Objects.requireNonNull(query, "query must not be null");
		TenantId tenantId = currentTenant.requireTenantId();
		ActorId actorId = currentActor.requireActorId();
		AuthorizedDataAccess access = authorizer.authorize(
				SystemPermission.CRM_ACCOUNT_READ, ENTITY_TYPE);

		requirePathAccount(tenantId, query.accountId(), actorId, access);
		return repository.search(tenantId, actorId, query, access);
	}

	@Override
	@Transactional(isolation = Isolation.READ_COMMITTED)
	public AccountRelationshipDetails end(EndAccountRelationshipCommand command) {
		Objects.requireNonNull(command, "command must not be null");
		TenantId tenantId = currentTenant.requireTenantId();
		ActorId actorId = currentActor.requireActorId();
		AuthorizedDataAccess access = authorizer.authorize(
				SystemPermission.CRM_ACCOUNT_WRITE, ENTITY_TYPE);

		requirePathAccount(tenantId, command.accountId(), actorId, access);
		AccountRelationship relationship = findForEnd(tenantId,
				command.accountId(), command.relationshipId(), actorId, access);
		LocalDate previousValidTo = relationship.validTo();
		relationship.end(command.validTo());
		if (command.validTo().equals(previousValidTo)) {
			return reloadDetails(tenantId, command.accountId(),
					command.relationshipId(), actorId, access);
		}

		if (repository.end(relationship, command.accountId(), actorId,
				access) == 1) {
			return reloadDetails(tenantId, command.accountId(),
					command.relationshipId(), actorId, access);
		}

		return repository.findForEnd(tenantId, command.accountId(),
				command.relationshipId(), actorId, access)
				.filter(current -> command.validTo().equals(current.validTo()))
				.map(ignored -> reloadDetails(tenantId, command.accountId(),
						command.relationshipId(), actorId, access))
				.orElseThrow(
						AccountRelationshipApplicationService::relationshipAlreadyEnded);
	}

	private void requirePathAccount(TenantId tenantId, AccountId accountId,
			ActorId actorId, AuthorizedDataAccess access) {
		if (!repository.accountAccessible(tenantId, accountId, actorId, access)) {
			throw accountNotFound();
		}
	}

	private void requireRelatedAccount(TenantId tenantId,
			AccountId relatedAccountId, ActorId actorId,
			AuthorizedDataAccess access) {
		if (!repository.accountAccessible(
				tenantId, relatedAccountId, actorId, access)) {
			throw relatedAccountInvalid();
		}
	}

	private AccountRelationship findForEnd(TenantId tenantId,
			AccountId pathAccountId, AccountRelationshipId relationshipId,
			ActorId actorId, AuthorizedDataAccess access) {
		return repository.findForEnd(tenantId, pathAccountId, relationshipId,
				actorId, access)
				.orElseThrow(AccountRelationshipApplicationService::relationshipNotFound);
	}

	private AccountRelationshipDetails reloadDetails(TenantId tenantId,
			AccountId pathAccountId, AccountRelationshipId relationshipId,
			ActorId actorId, AuthorizedDataAccess access) {
		return repository.findDetails(tenantId, pathAccountId, relationshipId,
				actorId, access)
				.orElseThrow(() -> new IllegalStateException(
						"Persisted Account relationship must remain readable"));
	}

	private static DomainResourceNotFound accountNotFound() {
		return new DomainResourceNotFound(AccountErrorCode.ACCOUNT_NOT_FOUND);
	}

	private static DomainResourceNotFound relationshipNotFound() {
		return new DomainResourceNotFound(
				AccountRelationshipErrorCode.ACCOUNT_RELATIONSHIP_NOT_FOUND);
	}

	private static BusinessRuleViolation relatedAccountInvalid() {
		return new BusinessRuleViolation(
				AccountRelationshipErrorCode.ACCOUNT_RELATIONSHIP_ACCOUNT_INVALID);
	}

	private static ResourceConflict relationshipAlreadyExists() {
		return new ResourceConflict(
				AccountRelationshipErrorCode.ACCOUNT_RELATIONSHIP_ALREADY_EXISTS);
	}

	private static ResourceConflict relationshipAlreadyEnded() {
		return new ResourceConflict(
				AccountRelationshipErrorCode.ACCOUNT_RELATIONSHIP_ALREADY_ENDED);
	}

}
