package com.crm.sales.contract.application.service;

import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

import com.crm.customer.account.domain.AccountId;
import com.crm.customer.contact.domain.ContactId;
import com.crm.customer.opportunity.domain.OpportunityId;
import com.crm.foundation.identifier.IdentifierGenerator;
import com.crm.foundation.security.CurrentActor;
import com.crm.foundation.security.SystemPermission;
import com.crm.foundation.security.TenantAccessAuthorizer;
import com.crm.foundation.tenancy.CurrentTenant;
import com.crm.foundation.time.TimeProvider;
import com.crm.sales.contract.application.command.CreateContractCommand;
import com.crm.sales.contract.application.command.SignContractCommand;
import com.crm.sales.contract.application.command.TerminateContractCommand;
import com.crm.sales.contract.application.command.UpdateContractCommand;
import com.crm.sales.contract.application.dto.ContractDetails;
import com.crm.sales.contract.application.dto.ContractSummary;
import com.crm.sales.contract.application.port.ContractRepository;
import com.crm.sales.contract.application.query.ContractSearchQuery;
import com.crm.sales.contract.application.usecase.ContractFacade;
import com.crm.sales.contract.domain.Contract;
import com.crm.sales.contract.domain.ContractErrorCode;
import com.crm.sales.contract.domain.ContractId;
import com.crm.sales.contract.domain.ContractStatus;
import com.crm.sales.order.domain.OrderId;
import com.crm.sales.quote.domain.QuoteId;
import com.crm.sharedkernel.application.PageResult;
import com.crm.sharedkernel.domain.ActorId;
import com.crm.sharedkernel.domain.TenantId;
import com.crm.sharedkernel.domain.exception.DomainResourceNotFound;
import com.crm.sharedkernel.domain.exception.ResourceConflict;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ContractApplicationService implements ContractFacade {

	private final ContractRepository contractRepository;
	private final CurrentTenant currentTenant;
	private final CurrentActor currentActor;
	private final TenantAccessAuthorizer authorizer;
	private final IdentifierGenerator identifierGenerator;
	private final TimeProvider timeProvider;

	public ContractApplicationService(
			ContractRepository contractRepository,
			CurrentTenant currentTenant,
			CurrentActor currentActor,
			TenantAccessAuthorizer authorizer,
			IdentifierGenerator identifierGenerator,
			TimeProvider timeProvider) {
		this.contractRepository = contractRepository;
		this.currentTenant = currentTenant;
		this.currentActor = currentActor;
		this.authorizer = authorizer;
		this.identifierGenerator = identifierGenerator;
		this.timeProvider = timeProvider;
	}

	@Override
	@Transactional
	public ContractDetails create(CreateContractCommand command) {
		Objects.requireNonNull(command, "command must not be null");
		TenantId tenantId = currentTenant.requireTenantId();
		ActorId actorId = currentActor.requireActorId();
		authorizer.requirePermission(SystemPermission.SALES_CONTRACT_WRITE);

		String number = command.contractNumber().trim().toUpperCase();
		if (contractRepository.existsByContractNumber(tenantId, number)) {
			throw new ResourceConflict(ContractErrorCode.CONTRACT_NUMBER_ALREADY_EXISTS.code());
		}

		Instant now = timeProvider.now();
		ContractId id = new ContractId(identifierGenerator.nextId());
		AccountId accountId = new AccountId(command.accountId());
		ContactId contactId = command.contactId() != null ? new ContactId(command.contactId()) : null;
		OpportunityId opportunityId = command.opportunityId() != null ? new OpportunityId(command.opportunityId()) : null;
		QuoteId quoteId = command.quoteId() != null ? new QuoteId(command.quoteId()) : null;
		OrderId orderId = command.orderId() != null ? new OrderId(command.orderId()) : null;
		ActorId ownerUserId = command.ownerUserId() != null ? new ActorId(command.ownerUserId()) : actorId;
		boolean autoRenew = command.autoRenew() != null ? command.autoRenew() : false;

		Contract contract = Contract.create(
				tenantId,
				id,
				number,
				accountId,
				contactId,
				opportunityId,
				quoteId,
				orderId,
				ownerUserId,
				command.contractType(),
				command.currencyCode(),
				command.contractValue(),
				command.effectiveFrom(),
				command.effectiveTo(),
				autoRenew,
				command.renewalNoticeDays(),
				command.documentReference(),
				command.termsSnapshot(),
				actorId,
				now
		);

		try {
			contractRepository.insert(contract);
		}
		catch (DuplicateKeyException e) {
			throw new ResourceConflict(ContractErrorCode.CONTRACT_NUMBER_ALREADY_EXISTS.code());
		}

		return ContractDetails.from(contract);
	}

	@Override
	@Transactional(readOnly = true)
	public ContractDetails get(ContractId id) {
		Objects.requireNonNull(id, "id must not be null");
		TenantId tenantId = currentTenant.requireTenantId();
		authorizer.requirePermission(SystemPermission.SALES_CONTRACT_READ);

		Contract contract = contractRepository.findById(tenantId, id)
				.orElseThrow(() -> new DomainResourceNotFound(ContractErrorCode.CONTRACT_NOT_FOUND.code()));

		return ContractDetails.from(contract);
	}

	@Override
	@Transactional(readOnly = true)
	public PageResult<ContractSummary> search(ContractSearchQuery query) {
		TenantId tenantId = currentTenant.requireTenantId();
		authorizer.requirePermission(SystemPermission.SALES_CONTRACT_READ);
		return contractRepository.search(tenantId, query != null ? query : new ContractSearchQuery(null, null, null, null, null, null, null));
	}

	@Override
	@Transactional
	public ContractDetails update(UpdateContractCommand command) {
		Objects.requireNonNull(command, "command must not be null");
		TenantId tenantId = currentTenant.requireTenantId();
		ActorId actorId = currentActor.requireActorId();
		authorizer.requirePermission(SystemPermission.SALES_CONTRACT_WRITE);

		Contract contract = contractRepository.findById(tenantId, command.id())
				.orElseThrow(() -> new DomainResourceNotFound(ContractErrorCode.CONTRACT_NOT_FOUND.code()));

		if (contract.version() != command.version()) {
			throw new ResourceConflict(ContractErrorCode.CONTRACT_VERSION_CONFLICT.code());
		}

		AccountId accountId = new AccountId(command.accountId());
		ContactId contactId = command.contactId() != null ? new ContactId(command.contactId()) : null;
		OpportunityId opportunityId = command.opportunityId() != null ? new OpportunityId(command.opportunityId()) : null;
		QuoteId quoteId = command.quoteId() != null ? new QuoteId(command.quoteId()) : null;
		OrderId orderId = command.orderId() != null ? new OrderId(command.orderId()) : null;
		ActorId ownerUserId = command.ownerUserId() != null ? new ActorId(command.ownerUserId()) : contract.ownerUserId();
		boolean autoRenew = command.autoRenew() != null ? command.autoRenew() : contract.autoRenew();

		Instant now = timeProvider.now();
		contract.update(
				accountId,
				contactId,
				opportunityId,
				quoteId,
				orderId,
				ownerUserId,
				command.contractType(),
				command.currencyCode(),
				command.contractValue(),
				command.effectiveFrom(),
				command.effectiveTo(),
				autoRenew,
				command.renewalNoticeDays(),
				command.documentReference(),
				command.termsSnapshot(),
				actorId,
				now
		);

		contractRepository.update(contract);
		return ContractDetails.from(contract);
	}

	@Override
	@Transactional
	public ContractDetails submitForReview(ContractId id, long version) {
		Objects.requireNonNull(id, "id must not be null");
		TenantId tenantId = currentTenant.requireTenantId();
		ActorId actorId = currentActor.requireActorId();
		authorizer.requirePermission(SystemPermission.SALES_CONTRACT_WRITE);

		Contract contract = contractRepository.findById(tenantId, id)
				.orElseThrow(() -> new DomainResourceNotFound(ContractErrorCode.CONTRACT_NOT_FOUND.code()));

		if (contract.version() != version) {
			throw new ResourceConflict(ContractErrorCode.CONTRACT_VERSION_CONFLICT.code());
		}

		contract.submitForReview(actorId, timeProvider.now());
		contractRepository.update(contract);
		return ContractDetails.from(contract);
	}

	@Override
	@Transactional
	public ContractDetails approve(ContractId id, long version) {
		Objects.requireNonNull(id, "id must not be null");
		TenantId tenantId = currentTenant.requireTenantId();
		ActorId actorId = currentActor.requireActorId();
		authorizer.requirePermission(SystemPermission.SALES_CONTRACT_WRITE);

		Contract contract = contractRepository.findById(tenantId, id)
				.orElseThrow(() -> new DomainResourceNotFound(ContractErrorCode.CONTRACT_NOT_FOUND.code()));

		if (contract.version() != version) {
			throw new ResourceConflict(ContractErrorCode.CONTRACT_VERSION_CONFLICT.code());
		}

		contract.approve(actorId, timeProvider.now());
		contractRepository.update(contract);
		return ContractDetails.from(contract);
	}

	@Override
	@Transactional
	public ContractDetails sendForSignature(ContractId id, long version) {
		Objects.requireNonNull(id, "id must not be null");
		TenantId tenantId = currentTenant.requireTenantId();
		ActorId actorId = currentActor.requireActorId();
		authorizer.requirePermission(SystemPermission.SALES_CONTRACT_WRITE);

		Contract contract = contractRepository.findById(tenantId, id)
				.orElseThrow(() -> new DomainResourceNotFound(ContractErrorCode.CONTRACT_NOT_FOUND.code()));

		if (contract.version() != version) {
			throw new ResourceConflict(ContractErrorCode.CONTRACT_VERSION_CONFLICT.code());
		}

		contract.sendForSignature(actorId, timeProvider.now());
		contractRepository.update(contract);
		return ContractDetails.from(contract);
	}

	@Override
	@Transactional
	public ContractDetails sign(SignContractCommand command) {
		Objects.requireNonNull(command, "command must not be null");
		TenantId tenantId = currentTenant.requireTenantId();
		ActorId actorId = currentActor.requireActorId();
		authorizer.requirePermission(SystemPermission.SALES_CONTRACT_SIGN);

		Contract contract = contractRepository.findById(tenantId, command.id())
				.orElseThrow(() -> new DomainResourceNotFound(ContractErrorCode.CONTRACT_NOT_FOUND.code()));

		if (contract.version() != command.version()) {
			throw new ResourceConflict(ContractErrorCode.CONTRACT_VERSION_CONFLICT.code());
		}

		contract.sign(command.signedAt(), actorId, timeProvider.now());
		contractRepository.update(contract);
		return ContractDetails.from(contract);
	}

	@Override
	@Transactional
	public ContractDetails terminate(TerminateContractCommand command) {
		Objects.requireNonNull(command, "command must not be null");
		TenantId tenantId = currentTenant.requireTenantId();
		ActorId actorId = currentActor.requireActorId();
		authorizer.requirePermission(SystemPermission.SALES_CONTRACT_WRITE);

		Contract contract = contractRepository.findById(tenantId, command.id())
				.orElseThrow(() -> new DomainResourceNotFound(ContractErrorCode.CONTRACT_NOT_FOUND.code()));

		if (contract.version() != command.version()) {
			throw new ResourceConflict(ContractErrorCode.CONTRACT_VERSION_CONFLICT.code());
		}

		contract.terminate(command.terminationReason(), actorId, timeProvider.now());
		contractRepository.update(contract);
		return ContractDetails.from(contract);
	}

	@Override
	@Transactional
	public void delete(ContractId id, long version) {
		Objects.requireNonNull(id, "id must not be null");
		TenantId tenantId = currentTenant.requireTenantId();
		authorizer.requirePermission(SystemPermission.SALES_CONTRACT_WRITE);

		Contract contract = contractRepository.findById(tenantId, id)
				.orElseThrow(() -> new DomainResourceNotFound(ContractErrorCode.CONTRACT_NOT_FOUND.code()));

		if (contract.version() != version) {
			throw new ResourceConflict(ContractErrorCode.CONTRACT_VERSION_CONFLICT.code());
		}

		if (contract.status() != ContractStatus.DRAFT && contract.status() != ContractStatus.CANCELLED) {
			throw new ResourceConflict(ContractErrorCode.INVALID_CONTRACT_STATUS_TRANSITION.code());
		}

		contractRepository.delete(tenantId, id, version);
	}

}
