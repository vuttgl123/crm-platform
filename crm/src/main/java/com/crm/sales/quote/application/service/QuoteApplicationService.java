package com.crm.sales.quote.application.service;

import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

import com.crm.foundation.identifier.IdentifierGenerator;
import com.crm.foundation.security.AuthorizedDataAccess;
import com.crm.foundation.security.CurrentActor;
import com.crm.foundation.security.SystemPermission;
import com.crm.foundation.security.TenantAccessAuthorizer;
import com.crm.foundation.tenancy.CurrentTenant;
import com.crm.foundation.time.TimeProvider;
import com.crm.sales.quote.application.command.ApproveQuoteCommand;
import com.crm.sales.quote.application.command.CreateQuoteCommand;
import com.crm.sales.quote.application.command.DeleteQuoteCommand;
import com.crm.sales.quote.application.command.UpdateQuoteCommand;
import com.crm.sales.quote.application.dto.QuoteDetails;
import com.crm.sales.quote.application.dto.QuoteSummary;
import com.crm.sales.quote.application.port.QuoteRepository;
import com.crm.sales.quote.application.query.QuoteSearchQuery;
import com.crm.sales.quote.application.usecase.QuoteFacade;
import com.crm.sales.quote.domain.Quote;
import com.crm.sales.quote.domain.QuoteErrorCode;
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
public class QuoteApplicationService implements QuoteFacade {

	private static final String ENTITY_TYPE = "QUOTE";

	private final QuoteRepository quoteRepository;
	private final CurrentTenant currentTenant;
	private final CurrentActor currentActor;
	private final TenantAccessAuthorizer authorizer;
	private final IdentifierGenerator identifierGenerator;
	private final TimeProvider timeProvider;

	public QuoteApplicationService(
			QuoteRepository quoteRepository,
			CurrentTenant currentTenant,
			CurrentActor currentActor,
			TenantAccessAuthorizer authorizer,
			IdentifierGenerator identifierGenerator,
			TimeProvider timeProvider) {
		this.quoteRepository = quoteRepository;
		this.currentTenant = currentTenant;
		this.currentActor = currentActor;
		this.authorizer = authorizer;
		this.identifierGenerator = identifierGenerator;
		this.timeProvider = timeProvider;
	}

	@Override
	@Transactional
	public QuoteDetails create(CreateQuoteCommand command) {
		Objects.requireNonNull(command, "command must not be null");
		TenantId tenantId = currentTenant.requireTenantId();
		ActorId actorId = currentActor.requireActorId();
		AuthorizedDataAccess access = authorizer.authorize(
				SystemPermission.SALES_QUOTE_WRITE, ENTITY_TYPE);
		QuoteId quoteId = new QuoteId(identifierGenerator.nextId());
		Instant now = timeProvider.now();

		UUID ownerUserId = command.ownerUserId() == null ? actorId.value() : command.ownerUserId();

		Quote quote = Quote.create(
				tenantId,
				quoteId,
				command.quoteNumber(),
				command.accountId(),
				command.contactId(),
				command.opportunityId(),
				command.priceBookId(),
				ownerUserId,
				command.amounts(),
				command.issueDate(),
				command.validUntil(),
				command.paymentTerms(),
				command.deliveryTerms(),
				command.customerReference(),
				command.notes(),
				actorId,
				now);

		validateAccount(tenantId, actorId, quote.accountId(), access);
		validateContact(tenantId, actorId, quote.contactId(), access);
		validateOpportunity(tenantId, actorId, quote.opportunityId(), access);
		validatePriceBook(tenantId, quote.priceBookId());
		validateUniqueQuoteNumber(tenantId, quote.quoteNumber(), null);

		try {
			quoteRepository.save(quote);
		} catch (DuplicateKeyException ex) {
			throw new ResourceConflict(
					QuoteErrorCode.QUOTE_NUMBER_ALREADY_EXISTS);
		}

		return toDetails(quote);
	}

	@Override
	@Transactional(readOnly = true)
	public QuoteDetails get(QuoteId quoteId) {
		Objects.requireNonNull(quoteId, "quoteId must not be null");
		TenantId tenantId = currentTenant.requireTenantId();
		ActorId actorId = currentActor.requireActorId();
		AuthorizedDataAccess access = authorizer.authorize(
				SystemPermission.SALES_QUOTE_READ, ENTITY_TYPE);

		Quote quote = quoteRepository.findById(
				tenantId, quoteId, actorId, access)
				.orElseThrow(() -> new DomainResourceNotFound(
						QuoteErrorCode.QUOTE_NOT_FOUND));

		return toDetails(quote);
	}

	@Override
	@Transactional(readOnly = true)
	public PageResult<QuoteSummary> search(QuoteSearchQuery query) {
		Objects.requireNonNull(query, "query must not be null");
		TenantId tenantId = currentTenant.requireTenantId();
		ActorId actorId = currentActor.requireActorId();
		AuthorizedDataAccess access = authorizer.authorize(
				SystemPermission.SALES_QUOTE_READ, ENTITY_TYPE);

		return quoteRepository.search(tenantId, actorId, query, access);
	}

	@Override
	@Transactional
	public QuoteDetails update(UpdateQuoteCommand command) {
		Objects.requireNonNull(command, "command must not be null");
		TenantId tenantId = currentTenant.requireTenantId();
		ActorId actorId = currentActor.requireActorId();
		AuthorizedDataAccess access = authorizer.authorize(
				SystemPermission.SALES_QUOTE_WRITE, ENTITY_TYPE);

		Quote quote = quoteRepository.findById(
				tenantId, command.quoteId(), actorId, access)
				.orElseThrow(() -> new DomainResourceNotFound(
						QuoteErrorCode.QUOTE_NOT_FOUND));

		Instant now = timeProvider.now();
		try {
			quote.update(
					command.accountId(),
					command.contactId(),
					command.opportunityId(),
					command.priceBookId(),
					command.ownerUserId(),
					command.status(),
					command.amounts(),
					command.issueDate(),
					command.validUntil(),
					command.paymentTerms(),
					command.deliveryTerms(),
					command.customerReference(),
					command.notes(),
					actorId,
					now,
					command.expectedVersion());
		} catch (IllegalStateException ex) {
			throw new ResourceConflict(
					QuoteErrorCode.QUOTE_VERSION_CONFLICT);
		}

		validateAccount(tenantId, actorId, quote.accountId(), access);
		validateContact(tenantId, actorId, quote.contactId(), access);
		validateOpportunity(tenantId, actorId, quote.opportunityId(), access);
		validatePriceBook(tenantId, quote.priceBookId());

		try {
			quoteRepository.save(quote);
		} catch (DuplicateKeyException ex) {
			throw new ResourceConflict(
					QuoteErrorCode.QUOTE_NUMBER_ALREADY_EXISTS);
		}

		return toDetails(quote);
	}

	@Override
	@Transactional
	public QuoteDetails approve(ApproveQuoteCommand command) {
		Objects.requireNonNull(command, "command must not be null");
		TenantId tenantId = currentTenant.requireTenantId();
		ActorId actorId = currentActor.requireActorId();
		authorizer.authorize(
				SystemPermission.SALES_QUOTE_APPROVE, ENTITY_TYPE);
		AuthorizedDataAccess readAccess = authorizer.authorize(
				SystemPermission.SALES_QUOTE_READ, ENTITY_TYPE);

		Quote quote = quoteRepository.findById(
				tenantId, command.quoteId(), actorId, readAccess)
				.orElseThrow(() -> new DomainResourceNotFound(
						QuoteErrorCode.QUOTE_NOT_FOUND));

		Instant now = timeProvider.now();
		try {
			quote.approve(actorId, now, command.expectedVersion());
		} catch (IllegalStateException ex) {
			throw new ResourceConflict(
					QuoteErrorCode.QUOTE_VERSION_CONFLICT);
		}

		quoteRepository.save(quote);
		return toDetails(quote);
	}

	@Override
	@Transactional
	public void delete(DeleteQuoteCommand command) {
		Objects.requireNonNull(command, "command must not be null");
		TenantId tenantId = currentTenant.requireTenantId();
		ActorId actorId = currentActor.requireActorId();
		AuthorizedDataAccess access = authorizer.authorize(
				SystemPermission.SALES_QUOTE_WRITE, ENTITY_TYPE);

		Quote quote = quoteRepository.findById(
				tenantId, command.quoteId(), actorId, access)
				.orElseThrow(() -> new DomainResourceNotFound(
						QuoteErrorCode.QUOTE_NOT_FOUND));

		if (quote.version() != command.expectedVersion()) {
			throw new ResourceConflict(
					QuoteErrorCode.QUOTE_VERSION_CONFLICT);
		}

		quoteRepository.delete(tenantId, command.quoteId());
	}

	private void validateAccount(TenantId tenantId, ActorId actorId,
			UUID accountId, AuthorizedDataAccess access) {
		if (accountId == null) {
			return;
		}
		if (!quoteRepository.existsAccount(tenantId, accountId, actorId, access)) {
			throw new DomainResourceNotFound(
					QuoteErrorCode.QUOTE_ACCOUNT_INVALID);
		}
	}

	private void validateContact(TenantId tenantId, ActorId actorId,
			UUID contactId, AuthorizedDataAccess access) {
		if (contactId == null) {
			return;
		}
		if (!quoteRepository.existsContact(tenantId, contactId, actorId, access)) {
			throw new DomainResourceNotFound(
					QuoteErrorCode.QUOTE_ACCOUNT_INVALID);
		}
	}

	private void validateOpportunity(TenantId tenantId, ActorId actorId,
			UUID opportunityId, AuthorizedDataAccess access) {
		if (opportunityId == null) {
			return;
		}
		if (!quoteRepository.existsOpportunity(tenantId, opportunityId, actorId, access)) {
			throw new DomainResourceNotFound(
					QuoteErrorCode.QUOTE_ACCOUNT_INVALID);
		}
	}

	private void validatePriceBook(TenantId tenantId, UUID priceBookId) {
		if (priceBookId == null) {
			return;
		}
		if (!quoteRepository.existsPriceBook(tenantId, priceBookId)) {
			throw new DomainResourceNotFound(
					QuoteErrorCode.QUOTE_ACCOUNT_INVALID);
		}
	}

	private void validateUniqueQuoteNumber(TenantId tenantId,
			String quoteNumber, QuoteId excludeId) {
		if (quoteNumber == null || quoteNumber.trim().isEmpty()) {
			return;
		}
		if (quoteRepository.existsByQuoteNumber(tenantId, quoteNumber, excludeId)) {
			throw new ResourceConflict(
					QuoteErrorCode.QUOTE_NUMBER_ALREADY_EXISTS);
		}
	}

	private QuoteDetails toDetails(Quote quote) {
		return new QuoteDetails(
				quote.tenantId(),
				quote.id(),
				quote.quoteNumber(),
				quote.revisionNumber(),
				quote.previousQuoteId(),
				quote.accountId(),
				quote.contactId(),
				quote.opportunityId(),
				quote.priceBookId(),
				quote.ownerUserId(),
				quote.status(),
				quote.amounts(),
				quote.exchangeRateToTenantCurrency(),
				quote.issueDate(),
				quote.validUntil(),
				quote.paymentTerms(),
				quote.deliveryTerms(),
				quote.customerReference(),
				quote.notes(),
				quote.approvedAt(),
				quote.approvedBy(),
				quote.acceptedAt(),
				quote.rejectedAt(),
				quote.createdAt(),
				quote.createdBy(),
				quote.updatedAt(),
				quote.updatedBy(),
				quote.version());
	}

}
