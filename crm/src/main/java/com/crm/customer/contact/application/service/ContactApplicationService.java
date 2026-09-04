package com.crm.customer.contact.application.service;

import java.time.Instant;
import java.util.Objects;

import com.crm.customer.account.domain.AccountId;
import com.crm.customer.contact.application.command.CreateContactCommand;
import com.crm.customer.contact.application.command.DeleteContactCommand;
import com.crm.customer.contact.application.command.UpdateContactCommand;
import com.crm.customer.contact.application.dto.ContactDetails;
import com.crm.customer.contact.application.dto.ContactSummary;
import com.crm.customer.contact.application.port.ContactRepository;
import com.crm.customer.contact.application.query.ContactSearchQuery;
import com.crm.customer.contact.application.usecase.ContactFacade;
import com.crm.customer.contact.domain.Contact;
import com.crm.customer.contact.domain.ContactErrorCode;
import com.crm.customer.contact.domain.ContactId;
import com.crm.customer.contact.domain.ContactOwner;
import com.crm.customer.account.domain.AccountOwnerType;
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
import com.crm.sharedkernel.domain.exception.DomainResourceNotFound;
import com.crm.sharedkernel.domain.exception.ResourceConflict;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ContactApplicationService implements ContactFacade {

	private static final String ENTITY_TYPE = "CONTACT";

	private final ContactRepository contactRepository;
	private final CurrentTenant currentTenant;
	private final CurrentActor currentActor;
	private final TenantAccessAuthorizer authorizer;
	private final IdentifierGenerator identifierGenerator;
	private final TimeProvider timeProvider;

	public ContactApplicationService(ContactRepository contactRepository,
			CurrentTenant currentTenant, CurrentActor currentActor,
			TenantAccessAuthorizer authorizer,
			IdentifierGenerator identifierGenerator,
			TimeProvider timeProvider) {
		this.contactRepository = contactRepository;
		this.currentTenant = currentTenant;
		this.currentActor = currentActor;
		this.authorizer = authorizer;
		this.identifierGenerator = identifierGenerator;
		this.timeProvider = timeProvider;
	}

	@Override
	@Transactional
	public ContactDetails create(CreateContactCommand command) {
		Objects.requireNonNull(command, "command must not be null");
		TenantId tenantId = currentTenant.requireTenantId();
		ActorId actorId = currentActor.requireActorId();
		AuthorizedDataAccess access = authorizer.authorize(
				SystemPermission.CRM_CONTACT_WRITE, ENTITY_TYPE);
		ContactId contactId = new ContactId(identifierGenerator.nextId());
		Instant now = timeProvider.now();

		ContactOwner owner = command.owner();
		if (owner == null && !hasTenantScope(access)) {
			owner = resolveDefaultOwner(actorId, access);
		}

		Contact contact = Contact.create(
				tenantId,
				contactId,
				command.contactNumber(),
				command.accountId(),
				owner,
				command.honorific(),
				command.givenName(),
				command.middleName(),
				command.familyName(),
				command.displayName(),
				command.jobTitle(),
				command.department(),
				command.preferredLanguageCode(),
				command.preferredContactChannel(),
				command.lifecycleStage(),
				command.dateOfBirth(),
				command.doNotContact(),
				command.description(),
				actorId,
				now);

		validateOwner(tenantId, actorId, contact.owner(), access);
		validateAccount(tenantId, actorId, contact.accountId(), access);
		validateUniqueContactNumber(tenantId, contact.contactNumber(), null);

		try {
			contactRepository.save(contact);
		} catch (DuplicateKeyException ex) {
			throw new ResourceConflict(
					ContactErrorCode.CONTACT_NUMBER_ALREADY_EXISTS);
		}

		return toDetails(contact);
	}

	@Override
	@Transactional(readOnly = true)
	public ContactDetails get(ContactId contactId) {
		Objects.requireNonNull(contactId, "contactId must not be null");
		TenantId tenantId = currentTenant.requireTenantId();
		ActorId actorId = currentActor.requireActorId();
		AuthorizedDataAccess access = authorizer.authorize(
				SystemPermission.CRM_CONTACT_READ, ENTITY_TYPE);

		Contact contact = contactRepository.findById(
				tenantId, contactId, actorId, access)
				.orElseThrow(() -> new DomainResourceNotFound(
						ContactErrorCode.CONTACT_NOT_FOUND));

		return toDetails(contact);
	}

	@Override
	@Transactional(readOnly = true)
	public PageResult<ContactSummary> search(ContactSearchQuery query) {
		Objects.requireNonNull(query, "query must not be null");
		TenantId tenantId = currentTenant.requireTenantId();
		ActorId actorId = currentActor.requireActorId();
		AuthorizedDataAccess access = authorizer.authorize(
				SystemPermission.CRM_CONTACT_READ, ENTITY_TYPE);

		return contactRepository.search(tenantId, actorId, query, access);
	}

	@Override
	@Transactional
	public ContactDetails update(UpdateContactCommand command) {
		Objects.requireNonNull(command, "command must not be null");
		TenantId tenantId = currentTenant.requireTenantId();
		ActorId actorId = currentActor.requireActorId();
		AuthorizedDataAccess access = authorizer.authorize(
				SystemPermission.CRM_CONTACT_WRITE, ENTITY_TYPE);

		Contact contact = contactRepository.findById(
				tenantId, command.contactId(), actorId, access)
				.orElseThrow(() -> new DomainResourceNotFound(
						ContactErrorCode.CONTACT_NOT_FOUND));

		Instant now = timeProvider.now();
		try {
			contact.update(
					command.accountId(),
					command.owner(),
					command.honorific(),
					command.givenName(),
					command.middleName(),
					command.familyName(),
					command.displayName(),
					command.jobTitle(),
					command.department(),
					command.preferredLanguageCode(),
					command.preferredContactChannel(),
					command.lifecycleStage(),
					command.dateOfBirth(),
					command.doNotContact(),
					command.description(),
					actorId,
					now,
					command.expectedVersion());
		} catch (IllegalStateException ex) {
			throw new ResourceConflict(
					ContactErrorCode.CONTACT_VERSION_CONFLICT);
		}

		validateOwner(tenantId, actorId, contact.owner(), access);
		validateAccount(tenantId, actorId, contact.accountId(), access);

		try {
			contactRepository.save(contact);
		} catch (DuplicateKeyException ex) {
			throw new ResourceConflict(
					ContactErrorCode.CONTACT_NUMBER_ALREADY_EXISTS);
		}

		return toDetails(contact);
	}

	@Override
	@Transactional
	public void delete(DeleteContactCommand command) {
		Objects.requireNonNull(command, "command must not be null");
		TenantId tenantId = currentTenant.requireTenantId();
		ActorId actorId = currentActor.requireActorId();
		AuthorizedDataAccess access = authorizer.authorize(
				SystemPermission.CRM_CONTACT_WRITE, ENTITY_TYPE);

		Contact contact = contactRepository.findById(
				tenantId, command.contactId(), actorId, access)
				.orElseThrow(() -> new DomainResourceNotFound(
						ContactErrorCode.CONTACT_NOT_FOUND));

		Instant now = timeProvider.now();
		try {
			contact.delete(actorId, now, command.expectedVersion());
		} catch (IllegalStateException ex) {
			throw new ResourceConflict(
					ContactErrorCode.CONTACT_VERSION_CONFLICT);
		}

		contactRepository.save(contact);
	}

	private void validateAccount(TenantId tenantId, ActorId actorId,
			AccountId accountId, AuthorizedDataAccess access) {
		if (accountId == null) {
			return;
		}
		if (!contactRepository.existsAccount(tenantId, accountId, actorId, access)) {
			throw new DomainResourceNotFound(
					ContactErrorCode.CONTACT_ACCOUNT_INVALID);
		}
	}

	private void validateUniqueContactNumber(TenantId tenantId,
			String contactNumber, ContactId excludeId) {
		if (contactNumber == null || contactNumber.trim().isEmpty()) {
			return;
		}
		if (contactRepository.existsByContactNumber(
				tenantId, contactNumber, excludeId)) {
			throw new ResourceConflict(
					ContactErrorCode.CONTACT_NUMBER_ALREADY_EXISTS);
		}
	}

	private void validateOwner(TenantId tenantId, ActorId actorId,
			ContactOwner owner, AuthorizedDataAccess access) {
		if (owner == null) {
			return;
		}
		if (hasTenantScope(access)) {
			return;
		}
		if (owner.type() == AccountOwnerType.USER
				&& owner.id().equals(actorId.value())) {
			return;
		}
		if (owner.type() == AccountOwnerType.TEAM
				&& isTeamInScope(owner.id(), access)) {
			return;
		}
		throw new AccessDeniedException(
				"Assigned contact owner is outside the current authorized data scope");
	}

	private boolean isTeamInScope(java.util.UUID teamId,
			AuthorizedDataAccess access) {
		return access.scopes().stream()
				.anyMatch(scope -> scope.teamId() != null
						&& scope.teamId().equals(teamId));
	}

	private boolean hasTenantScope(AuthorizedDataAccess access) {
		return access.scopes().stream()
				.anyMatch(scope -> scope.type() == DataScopeType.TENANT);
	}

	private ContactOwner resolveDefaultOwner(ActorId actorId,
			AuthorizedDataAccess access) {
		boolean hasOwnScope = access.scopes().stream()
				.anyMatch(scope -> scope.type() == DataScopeType.OWN);
		if (hasOwnScope) {
			return ContactOwner.user(actorId.value());
		}
		return access.scopes().stream()
				.filter(scope -> scope.type() == DataScopeType.TEAM
						|| scope.type() == DataScopeType.TEAM_TREE)
				.map(scope -> ContactOwner.team(scope.teamId()))
				.findFirst()
				.orElseGet(() -> ContactOwner.user(actorId.value()));
	}

	private ContactDetails toDetails(Contact contact) {
		return new ContactDetails(
				contact.tenantId(),
				contact.id(),
				contact.contactNumber(),
				contact.accountId(),
				contact.owner(),
				contact.honorific(),
				contact.givenName(),
				contact.middleName(),
				contact.familyName(),
				contact.displayName(),
				contact.jobTitle(),
				contact.department(),
				contact.preferredLanguageCode(),
				contact.preferredContactChannel(),
				contact.lifecycleStage(),
				contact.dateOfBirth(),
				contact.isDoNotContact(),
				contact.description(),
				contact.createdAt(),
				contact.createdBy(),
				contact.updatedAt(),
				contact.updatedBy(),
				contact.version());
	}

	@Override
	@Transactional(readOnly = true)
	public com.crm.customer.contact.application.dto.ContactStatsDto getStats() {
		TenantId tenantId = currentTenant.requireTenantId();
		ActorId actorId = currentActor.requireActorId();
		AuthorizedDataAccess access = authorizer.requireAccess(
				SystemPermission.CRM_CONTACT_READ, ENTITY_TYPE);
		return contactRepository.getStats(tenantId, actorId, access);
	}

	@Override
	@Transactional
	public ContactDetails setPrimary(com.crm.customer.contact.application.command.SetPrimaryContactCommand command) {
		Objects.requireNonNull(command, "command must not be null");
		TenantId tenantId = currentTenant.requireTenantId();
		ActorId actorId = currentActor.requireActorId();
		authorizer.requireAccess(SystemPermission.CRM_CONTACT_WRITE, ENTITY_TYPE);

		contactRepository.setPrimary(tenantId, command.id(), command.isPrimary(), command.expectedVersion(), actorId, timeProvider.now());
		return get(command.id());
	}

	@Override
	@Transactional
	public ContactDetails transferAccount(com.crm.customer.contact.application.command.TransferContactAccountCommand command) {
		Objects.requireNonNull(command, "command must not be null");
		TenantId tenantId = currentTenant.requireTenantId();
		ActorId actorId = currentActor.requireActorId();
		authorizer.requireAccess(SystemPermission.CRM_CONTACT_WRITE, ENTITY_TYPE);

		contactRepository.transferAccount(
				tenantId,
				command.id(),
				new AccountId(command.newAccountId()),
				command.jobTitle(),
				command.expectedVersion(),
				actorId,
				timeProvider.now()
		);
		return get(command.id());
	}

	@Override
	@Transactional
	public int bulkUpdateLifecycle(com.crm.customer.contact.application.command.BulkUpdateContactLifecycleCommand command) {
		Objects.requireNonNull(command, "command must not be null");
		TenantId tenantId = currentTenant.requireTenantId();
		ActorId actorId = currentActor.requireActorId();
		authorizer.requireAccess(SystemPermission.CRM_CONTACT_WRITE, ENTITY_TYPE);

		java.util.List<ContactId> ids = command.contactIds().stream().map(ContactId::new).toList();
		return contactRepository.bulkUpdateLifecycle(tenantId, ids, command.lifecycleStage(), actorId, timeProvider.now());
	}

}
