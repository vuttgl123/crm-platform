package com.crm.sales.quote.application.service;

import java.time.Instant;
import java.util.*;

import com.crm.foundation.identifier.IdentifierGenerator;
import com.crm.foundation.security.AuthorizedDataAccess;
import com.crm.foundation.security.CurrentActor;
import com.crm.foundation.security.SystemPermission;
import com.crm.foundation.security.TenantAccessAuthorizer;
import com.crm.foundation.tenancy.CurrentTenant;
import com.crm.foundation.time.TimeProvider;
import com.crm.sales.quote.application.command.AcceptQuoteCommand;
import com.crm.sales.quote.application.command.ApproveQuoteCommand;
import com.crm.sales.quote.application.command.CancelQuoteCommand;
import com.crm.sales.quote.application.command.ConvertQuoteToOrderCommand;
import com.crm.sales.quote.application.command.CreateQuoteCommand;
import com.crm.sales.quote.application.command.DeleteQuoteCommand;
import com.crm.sales.quote.application.command.MarkQuoteSentCommand;
import com.crm.sales.quote.application.command.RejectQuoteCommand;
import com.crm.sales.quote.application.command.RequestQuoteChangesCommand;
import com.crm.sales.quote.application.command.ReviseQuoteCommand;
import com.crm.sales.quote.application.command.SaveQuoteDraftCommand;
import com.crm.sales.quote.application.command.SubmitQuoteCommand;
import com.crm.sales.quote.application.dto.QuoteDetails;
import com.crm.sales.quote.application.dto.QuoteDocumentDto;
import com.crm.sales.quote.application.dto.QuotePulseDto;
import com.crm.sales.quote.application.dto.QuoteRevisionDto;
import com.crm.sales.quote.application.dto.QuoteSummary;
import com.crm.sales.quote.application.port.QuoteRepository;
import com.crm.sales.quote.application.query.QuoteSearchQuery;
import com.crm.sales.quote.application.usecase.QuoteFacade;
import com.crm.sales.quote.domain.Quote;
import com.crm.sales.quote.domain.QuoteCustomerSnapshot;
import com.crm.sales.quote.domain.QuoteErrorCode;
import com.crm.sales.quote.domain.QuoteId;
import com.crm.sales.quote.domain.QuoteLine;
import com.crm.sales.quote.domain.QuoteStatus;
import com.crm.sales.quote.domain.QuoteStatusHistoryEntry;
import com.crm.sharedkernel.application.PageQuery;
import com.crm.sharedkernel.application.PageResult;
import com.crm.sharedkernel.domain.ActorId;
import com.crm.sharedkernel.domain.TenantId;
import com.crm.sharedkernel.domain.exception.DomainResourceNotFound;
import com.crm.sharedkernel.domain.exception.ResourceConflict;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class QuoteApplicationService implements QuoteFacade {

	private static final String ENTITY_TYPE = "QUOTE";

	private final QuoteRepository quoteRepository;
	private final QuotePricingService quotePricingService;
	private final CurrentTenant currentTenant;
	private final CurrentActor currentActor;
	private final TenantAccessAuthorizer authorizer;
	private final IdentifierGenerator identifierGenerator;
	private final TimeProvider timeProvider;
	private final JdbcClient jdbcClient;

	public QuoteApplicationService(
			QuoteRepository quoteRepository,
			QuotePricingService quotePricingService,
			CurrentTenant currentTenant,
			CurrentActor currentActor,
			TenantAccessAuthorizer authorizer,
			IdentifierGenerator identifierGenerator,
			TimeProvider timeProvider,
			JdbcClient jdbcClient) {
		this.quoteRepository = quoteRepository;
		this.quotePricingService = quotePricingService;
		this.currentTenant = currentTenant;
		this.currentActor = currentActor;
		this.authorizer = authorizer;
		this.identifierGenerator = identifierGenerator;
		this.timeProvider = timeProvider;
		this.jdbcClient = jdbcClient;
	}

	@Override
	@Transactional
	public QuoteDetails createDraft(CreateQuoteCommand command) {
		Objects.requireNonNull(command, "command must not be null");
		TenantId tenantId = currentTenant.requireTenantId();
		ActorId actorId = currentActor.requireActorId();
		AuthorizedDataAccess access = authorizer.authorize(SystemPermission.SALES_QUOTE_WRITE, ENTITY_TYPE);

		validateAccount(tenantId, actorId, command.accountId(), access);
		validateContact(tenantId, actorId, command.contactId(), access);
		validateOpportunity(tenantId, actorId, command.opportunityId(), access);
		validatePriceBook(tenantId, command.priceBookId());

		String currencyCode = resolvePriceBookCurrency(tenantId, command.priceBookId());
		String quoteNumber = quoteRepository.generateQuoteNumber(tenantId);
		QuoteId quoteId = new QuoteId(identifierGenerator.nextId());
		Instant now = timeProvider.now();

		UUID ownerUserId = null;
		UUID ownerTeamId = null;
		if ("TEAM".equalsIgnoreCase(command.ownerType())) {
			ownerTeamId = command.ownerId();
		} else {
			ownerUserId = command.ownerId() != null ? command.ownerId() : actorId.value();
		}

		QuoteCustomerSnapshot snapshot = buildInitialCustomerSnapshot(tenantId, command.accountId(), command.contactId());

		Quote quote = Quote.createDraft(
				tenantId,
				quoteId,
				quoteNumber,
				command.name(),
				command.accountId(),
				command.contactId(),
				command.opportunityId(),
				command.priceBookId(),
				ownerUserId,
				ownerTeamId,
				currencyCode,
				snapshot,
				command.issueDate(),
				command.validUntil(),
				actorId,
				now
		);

		quoteRepository.save(quote);
		return quoteRepository.findDetailsById(tenantId, quoteId, actorId, access)
				.orElseThrow(() -> new DomainResourceNotFound(QuoteErrorCode.QUOTE_NOT_FOUND, "Quote not found after create"));
	}

	@Override
	@Transactional
	public QuoteDetails saveDraft(QuoteId quoteId, SaveQuoteDraftCommand command) {
		Objects.requireNonNull(command, "command must not be null");
		TenantId tenantId = currentTenant.requireTenantId();
		ActorId actorId = currentActor.requireActorId();
		AuthorizedDataAccess access = authorizer.authorize(SystemPermission.SALES_QUOTE_WRITE, ENTITY_TYPE);

		Quote quote = loadQuote(tenantId, quoteId, actorId, access);
		validateAccount(tenantId, actorId, command.accountId(), access);
		validateContact(tenantId, actorId, command.contactId(), access);
		validateOpportunity(tenantId, actorId, command.opportunityId(), access);
		validatePriceBook(tenantId, command.priceBookId());

		Instant now = timeProvider.now();
		List<QuoteLine> calculatedLines = quotePricingService.buildAndCalculateLines(
				tenantId,
				quoteId,
				command.priceBookId(),
				command.lines(),
				now
		);

		UUID ownerUserId = null;
		UUID ownerTeamId = null;
		if ("TEAM".equalsIgnoreCase(command.ownerType())) {
			ownerTeamId = command.ownerId();
		} else {
			ownerUserId = command.ownerId() != null ? command.ownerId() : quote.ownerUserId();
		}

		try {
			quote.saveDraft(
					command.name(),
					command.accountId(),
					command.contactId(),
					command.opportunityId(),
					command.priceBookId(),
					ownerUserId,
					ownerTeamId,
					command.customerSnapshot(),
					command.issueDate(),
					command.validUntil(),
					command.paymentTerms(),
					command.deliveryTerms(),
					command.customerReference(),
					command.internalNotes(),
					command.shippingTotal(),
					calculatedLines,
					actorId,
					now,
					command.expectedVersion()
			);
		} catch (IllegalStateException e) {
			if (e.getMessage() != null && e.getMessage().contains("Optimistic lock")) {
				throw new ResourceConflict(QuoteErrorCode.QUOTE_VERSION_CONFLICT, e.getMessage());
			}
			throw e;
		}

		quoteRepository.save(quote);
		return quoteRepository.findDetailsById(tenantId, quoteId, actorId, access)
				.orElseThrow(() -> new DomainResourceNotFound(QuoteErrorCode.QUOTE_NOT_FOUND, "Quote not found"));
	}

	@Override
	@Transactional
	public QuoteDetails submitForApproval(QuoteId quoteId, SubmitQuoteCommand command) {
		TenantId tenantId = currentTenant.requireTenantId();
		ActorId actorId = currentActor.requireActorId();
		AuthorizedDataAccess access = authorizer.authorize(SystemPermission.SALES_QUOTE_WRITE, ENTITY_TYPE);

		Quote quote = loadQuote(tenantId, quoteId, actorId, access);
		long vBefore = quote.version();
		Instant now = timeProvider.now();

		try {
			quote.submitForApproval(actorId, now, command.expectedVersion());
		} catch (IllegalStateException e) {
			if (e.getMessage() != null && e.getMessage().contains("Optimistic lock")) {
				throw new ResourceConflict(QuoteErrorCode.QUOTE_VERSION_CONFLICT, e.getMessage());
			}
			throw e;
		}

		quoteRepository.save(quote);
		recordStatusHistory(tenantId, quoteId, quote.revisionNumber(), "SUBMIT", QuoteStatus.DRAFT, QuoteStatus.PENDING_APPROVAL, actorId, null, vBefore, quote.version(), now);

		return quoteRepository.findDetailsById(tenantId, quoteId, actorId, access).orElseThrow();
	}

	@Override
	@Transactional
	public QuoteDetails approve(QuoteId quoteId, ApproveQuoteCommand command) {
		TenantId tenantId = currentTenant.requireTenantId();
		ActorId actorId = currentActor.requireActorId();
		AuthorizedDataAccess access = authorizer.authorize(SystemPermission.SALES_QUOTE_APPROVE, ENTITY_TYPE);

		Quote quote = loadQuote(tenantId, quoteId, actorId, access);
		long vBefore = quote.version();
		Instant now = timeProvider.now();

		try {
			quote.approve(actorId, now, command.expectedVersion());
		} catch (IllegalStateException e) {
			if (e.getMessage() != null && e.getMessage().contains("Optimistic lock")) {
				throw new ResourceConflict(QuoteErrorCode.QUOTE_VERSION_CONFLICT, e.getMessage());
			}
			throw e;
		}

		quoteRepository.save(quote);
		recordStatusHistory(tenantId, quoteId, quote.revisionNumber(), "APPROVE", QuoteStatus.PENDING_APPROVAL, QuoteStatus.APPROVED, actorId, null, vBefore, quote.version(), now);

		return quoteRepository.findDetailsById(tenantId, quoteId, actorId, access).orElseThrow();
	}

	@Override
	@Transactional
	public QuoteDetails requestChanges(QuoteId quoteId, RequestQuoteChangesCommand command) {
		TenantId tenantId = currentTenant.requireTenantId();
		ActorId actorId = currentActor.requireActorId();
		AuthorizedDataAccess access = authorizer.authorize(SystemPermission.SALES_QUOTE_APPROVE, ENTITY_TYPE);

		Quote quote = loadQuote(tenantId, quoteId, actorId, access);
		long vBefore = quote.version();
		Instant now = timeProvider.now();

		try {
			quote.requestChanges(command.reason(), actorId, now, command.expectedVersion());
		} catch (IllegalStateException e) {
			if (e.getMessage() != null && e.getMessage().contains("Optimistic lock")) {
				throw new ResourceConflict(QuoteErrorCode.QUOTE_VERSION_CONFLICT, e.getMessage());
			}
			throw e;
		}

		quoteRepository.save(quote);
		recordStatusHistory(tenantId, quoteId, quote.revisionNumber(), "REQUEST_CHANGES", QuoteStatus.PENDING_APPROVAL, QuoteStatus.DRAFT, actorId, command.reason(), vBefore, quote.version(), now);

		return quoteRepository.findDetailsById(tenantId, quoteId, actorId, access).orElseThrow();
	}

	@Override
	@Transactional
	public QuoteDetails markSent(QuoteId quoteId, MarkQuoteSentCommand command) {
		TenantId tenantId = currentTenant.requireTenantId();
		ActorId actorId = currentActor.requireActorId();
		AuthorizedDataAccess access = authorizer.authorize(SystemPermission.SALES_QUOTE_WRITE, ENTITY_TYPE);

		Quote quote = loadQuote(tenantId, quoteId, actorId, access);
		long vBefore = quote.version();
		Instant now = timeProvider.now();

		try {
			quote.markSent(actorId, now, command.expectedVersion());
		} catch (IllegalStateException e) {
			if (e.getMessage() != null && e.getMessage().contains("Optimistic lock")) {
				throw new ResourceConflict(QuoteErrorCode.QUOTE_VERSION_CONFLICT, e.getMessage());
			}
			throw e;
		}

		quoteRepository.save(quote);
		recordStatusHistory(tenantId, quoteId, quote.revisionNumber(), "MARK_SENT", QuoteStatus.APPROVED, QuoteStatus.SENT, actorId, null, vBefore, quote.version(), now);

		return quoteRepository.findDetailsById(tenantId, quoteId, actorId, access).orElseThrow();
	}

	@Override
	@Transactional
	public QuoteDetails accept(QuoteId quoteId, AcceptQuoteCommand command) {
		TenantId tenantId = currentTenant.requireTenantId();
		ActorId actorId = currentActor.requireActorId();
		AuthorizedDataAccess access = authorizer.authorize(SystemPermission.SALES_QUOTE_WRITE, ENTITY_TYPE);

		Quote quote = loadQuote(tenantId, quoteId, actorId, access);
		long vBefore = quote.version();
		Instant now = timeProvider.now();

		try {
			quote.accept(command.customerReference(), actorId, now, command.expectedVersion());
		} catch (IllegalStateException e) {
			if (e.getMessage() != null && e.getMessage().contains("Optimistic lock")) {
				throw new ResourceConflict(QuoteErrorCode.QUOTE_VERSION_CONFLICT, e.getMessage());
			}
			throw e;
		}

		quoteRepository.save(quote);
		recordStatusHistory(tenantId, quoteId, quote.revisionNumber(), "ACCEPT", QuoteStatus.SENT, QuoteStatus.ACCEPTED, actorId, command.customerReference(), vBefore, quote.version(), now);

		return quoteRepository.findDetailsById(tenantId, quoteId, actorId, access).orElseThrow();
	}

	@Override
	@Transactional
	public QuoteDetails reject(QuoteId quoteId, RejectQuoteCommand command) {
		TenantId tenantId = currentTenant.requireTenantId();
		ActorId actorId = currentActor.requireActorId();
		AuthorizedDataAccess access = authorizer.authorize(SystemPermission.SALES_QUOTE_WRITE, ENTITY_TYPE);

		Quote quote = loadQuote(tenantId, quoteId, actorId, access);
		long vBefore = quote.version();
		Instant now = timeProvider.now();

		try {
			quote.reject(command.reason(), actorId, now, command.expectedVersion());
		} catch (IllegalStateException e) {
			if (e.getMessage() != null && e.getMessage().contains("Optimistic lock")) {
				throw new ResourceConflict(QuoteErrorCode.QUOTE_VERSION_CONFLICT, e.getMessage());
			}
			throw e;
		}

		quoteRepository.save(quote);
		recordStatusHistory(tenantId, quoteId, quote.revisionNumber(), "REJECT", QuoteStatus.SENT, QuoteStatus.REJECTED, actorId, command.reason(), vBefore, quote.version(), now);

		return quoteRepository.findDetailsById(tenantId, quoteId, actorId, access).orElseThrow();
	}

	@Override
	@Transactional
	public QuoteDetails cancel(QuoteId quoteId, CancelQuoteCommand command) {
		TenantId tenantId = currentTenant.requireTenantId();
		ActorId actorId = currentActor.requireActorId();
		AuthorizedDataAccess access = authorizer.authorize(SystemPermission.SALES_QUOTE_WRITE, ENTITY_TYPE);

		Quote quote = loadQuote(tenantId, quoteId, actorId, access);
		QuoteStatus prevStatus = quote.status();
		long vBefore = quote.version();
		Instant now = timeProvider.now();

		try {
			quote.cancel(command.reason(), actorId, now, command.expectedVersion());
		} catch (IllegalStateException e) {
			if (e.getMessage() != null && e.getMessage().contains("Optimistic lock")) {
				throw new ResourceConflict(QuoteErrorCode.QUOTE_VERSION_CONFLICT, e.getMessage());
			}
			throw e;
		}

		quoteRepository.save(quote);
		recordStatusHistory(tenantId, quoteId, quote.revisionNumber(), "CANCEL", prevStatus, QuoteStatus.CANCELLED, actorId, command.reason(), vBefore, quote.version(), now);

		return quoteRepository.findDetailsById(tenantId, quoteId, actorId, access).orElseThrow();
	}

	@Override
	@Transactional
	public QuoteDetails revise(QuoteId quoteId, ReviseQuoteCommand command) {
		TenantId tenantId = currentTenant.requireTenantId();
		ActorId actorId = currentActor.requireActorId();
		AuthorizedDataAccess access = authorizer.authorize(SystemPermission.SALES_QUOTE_WRITE, ENTITY_TYPE);

		Quote quote = loadQuote(tenantId, quoteId, actorId, access);
		QuoteStatus prevStatus = quote.status();
		long vBefore = quote.version();
		Instant now = timeProvider.now();

		try {
			quote.supersede(actorId, now, command.expectedVersion());
		} catch (IllegalStateException e) {
			if (e.getMessage() != null && e.getMessage().contains("Optimistic lock")) {
				throw new ResourceConflict(QuoteErrorCode.QUOTE_VERSION_CONFLICT, e.getMessage());
			}
			throw e;
		}

		quoteRepository.save(quote);
		recordStatusHistory(tenantId, quoteId, quote.revisionNumber(), "SUPERSEDE", prevStatus, QuoteStatus.SUPERSEDED, actorId, "Superseded by revision " + (quote.revisionNumber() + 1), vBefore, quote.version(), now);

		QuoteId newQuoteId = new QuoteId(identifierGenerator.nextId());
		Quote revisionQuote = quote.createRevision(newQuoteId, actorId, now);
		quoteRepository.save(revisionQuote);

		recordStatusHistory(tenantId, newQuoteId, revisionQuote.revisionNumber(), "CREATE_REVISION", null, QuoteStatus.DRAFT, actorId, "Revised from revision " + quote.revisionNumber(), 0, revisionQuote.version(), now);

		return quoteRepository.findDetailsById(tenantId, newQuoteId, actorId, access).orElseThrow();
	}

	@Override
	@Transactional
	public void deleteDraft(QuoteId quoteId, DeleteQuoteCommand command) {
		TenantId tenantId = currentTenant.requireTenantId();
		ActorId actorId = currentActor.requireActorId();
		AuthorizedDataAccess access = authorizer.authorize(SystemPermission.SALES_QUOTE_WRITE, ENTITY_TYPE);

		Quote quote = loadQuote(tenantId, quoteId, actorId, access);
		if (quote.status() != QuoteStatus.DRAFT) {
			throw new IllegalStateException("Only unsubmitted DRAFT quote can be deleted");
		}
		if (quote.version() != command.expectedVersion()) {
			throw new ResourceConflict(QuoteErrorCode.QUOTE_VERSION_CONFLICT, "Quote version conflict");
		}

		quoteRepository.softDelete(tenantId, quoteId, actorId);
	}

	@Override
	@Transactional
	public UUID convertToOrder(QuoteId quoteId, ConvertQuoteToOrderCommand command) {
		TenantId tenantId = currentTenant.requireTenantId();
		ActorId actorId = currentActor.requireActorId();
		AuthorizedDataAccess quoteAccess = authorizer.authorize(SystemPermission.SALES_QUOTE_WRITE, ENTITY_TYPE);
		authorizer.authorize(SystemPermission.SALES_ORDER_WRITE, "ORDER");

		Quote quote = loadQuote(tenantId, quoteId, actorId, quoteAccess);
		if (quote.status() != QuoteStatus.ACCEPTED) {
			throw new IllegalStateException("Only ACCEPTED quote can be converted to an order");
		}
		if (quote.version() != command.expectedVersion()) {
			throw new ResourceConflict(QuoteErrorCode.QUOTE_VERSION_CONFLICT, "Quote version conflict");
		}

		Instant now = timeProvider.now();
		return quoteRepository.convertToOrder(tenantId, quote, actorId, now);
	}

	@Override
	@Transactional(readOnly = true)
	public QuoteDetails get(QuoteId quoteId) {
		TenantId tenantId = currentTenant.requireTenantId();
		ActorId actorId = currentActor.requireActorId();
		AuthorizedDataAccess access = authorizer.authorize(SystemPermission.SALES_QUOTE_READ, ENTITY_TYPE);
		return quoteRepository.findDetailsById(tenantId, quoteId, actorId, access)
				.orElseThrow(() -> new DomainResourceNotFound(QuoteErrorCode.QUOTE_NOT_FOUND, "Quote not found: " + quoteId));
	}

	@Override
	@Transactional(readOnly = true)
	public QuoteDocumentDto getDocument(QuoteId quoteId) {
		TenantId tenantId = currentTenant.requireTenantId();
		ActorId actorId = currentActor.requireActorId();
		AuthorizedDataAccess access = authorizer.authorize(SystemPermission.SALES_QUOTE_READ, ENTITY_TYPE);
		return quoteRepository.findDocumentById(tenantId, quoteId, actorId, access)
				.orElseThrow(() -> new DomainResourceNotFound(QuoteErrorCode.QUOTE_NOT_FOUND, "Quote not found: " + quoteId));
	}

	@Override
	@Transactional(readOnly = true)
	public PageResult<QuoteSummary> search(QuoteSearchQuery query) {
		TenantId tenantId = currentTenant.requireTenantId();
		ActorId actorId = currentActor.requireActorId();
		AuthorizedDataAccess access = authorizer.authorize(SystemPermission.SALES_QUOTE_READ, ENTITY_TYPE);
		return quoteRepository.search(tenantId, actorId, query, access);
	}

	@Override
	@Transactional(readOnly = true)
	public QuotePulseDto getPulse(QuoteSearchQuery query) {
		TenantId tenantId = currentTenant.requireTenantId();
		ActorId actorId = currentActor.requireActorId();
		AuthorizedDataAccess access = authorizer.authorize(SystemPermission.SALES_QUOTE_READ, ENTITY_TYPE);
		return quoteRepository.getPulse(tenantId, actorId, query, access, "UTC");
	}

	@Override
	@Transactional(readOnly = true)
	public List<QuoteRevisionDto> getRevisions(QuoteId quoteId) {
		TenantId tenantId = currentTenant.requireTenantId();
		ActorId actorId = currentActor.requireActorId();
		AuthorizedDataAccess access = authorizer.authorize(SystemPermission.SALES_QUOTE_READ, ENTITY_TYPE);
		return quoteRepository.findRevisions(tenantId, quoteId, actorId, access);
	}

	@Override
	@Transactional(readOnly = true)
	public PageResult<QuoteStatusHistoryEntry> getHistory(QuoteId quoteId, PageQuery pageQuery) {
		TenantId tenantId = currentTenant.requireTenantId();
		ActorId actorId = currentActor.requireActorId();
		AuthorizedDataAccess access = authorizer.authorize(SystemPermission.SALES_QUOTE_READ, ENTITY_TYPE);
		return quoteRepository.findHistory(tenantId, quoteId, actorId, access, pageQuery);
	}

	private Quote loadQuote(TenantId tenantId, QuoteId quoteId, ActorId actorId, AuthorizedDataAccess access) {
		return quoteRepository.findById(tenantId, quoteId, actorId, access)
				.orElseThrow(() -> new DomainResourceNotFound(QuoteErrorCode.QUOTE_NOT_FOUND, "Quote not found: " + quoteId));
	}

	private void recordStatusHistory(TenantId tenantId, QuoteId quoteId, int revNum, String action,
			QuoteStatus prevStatus, QuoteStatus newStatus, ActorId actorId, String reason, long vBefore, long vAfter, Instant now) {
		quoteRepository.insertStatusHistory(new QuoteStatusHistoryEntry(
				UUID.randomUUID(),
				tenantId,
				quoteId,
				revNum,
				action,
				prevStatus,
				newStatus,
				actorId,
				reason,
				vBefore,
				vAfter,
				now
		));
	}

	private String resolvePriceBookCurrency(TenantId tenantId, UUID priceBookId) {
		List<String> currs = jdbcClient.sql("""
				SELECT pb.currency_code
				FROM catalog.price_books pb
				WHERE pb.tenant_id = :tenantId AND pb.id = :pbId
				""")
				.param("tenantId", tenantId.value())
				.param("pbId", priceBookId.toString())
				.query(String.class)
				.list();
		return currs.isEmpty() ? "USD" : currs.get(0);
	}

	private QuoteCustomerSnapshot buildInitialCustomerSnapshot(TenantId tenantId, UUID accountId, UUID contactId) {
		String accName = "Account";
		String addr1 = null, addr2 = null, loc = null, reg = null, post = null, country = null;

		List<Map<String, Object>> accRows = jdbcClient.sql("""
				SELECT name, address_line1, address_line2, city, state, postal_code, country
				FROM crm_accounts
				WHERE tenant_id = :tenantId AND id = :accountId
				""")
				.param("tenantId", tenantId.value())
				.param("accountId", accountId.toString())
				.query()
				.listOfRows();
		if (!accRows.isEmpty()) {
			Map<String, Object> r = accRows.get(0);
			if (r.get("name") != null) accName = String.valueOf(r.get("name"));
			if (r.get("address_line1") != null) addr1 = String.valueOf(r.get("address_line1"));
			if (r.get("address_line2") != null) addr2 = String.valueOf(r.get("address_line2"));
			if (r.get("city") != null) loc = String.valueOf(r.get("city"));
			if (r.get("state") != null) reg = String.valueOf(r.get("state"));
			if (r.get("postal_code") != null) post = String.valueOf(r.get("postal_code"));
			if (r.get("country") != null) country = String.valueOf(r.get("country"));
		}

		String cName = null, cEmail = null, cPhone = null;
		if (contactId != null) {
			List<Map<String, Object>> cRows = jdbcClient.sql("""
					SELECT first_name, last_name, email, phone
					FROM crm_contacts
					WHERE tenant_id = :tenantId AND id = :contactId
					""")
					.param("tenantId", tenantId.value())
					.param("contactId", contactId.toString())
					.query()
					.listOfRows();
			if (!cRows.isEmpty()) {
				Map<String, Object> cr = cRows.get(0);
				String fn = cr.get("first_name") != null ? String.valueOf(cr.get("first_name")) : "";
				String ln = cr.get("last_name") != null ? String.valueOf(cr.get("last_name")) : "";
				cName = (fn + " " + ln).trim();
				if (cName.isEmpty()) cName = null;
				if (cr.get("email") != null) cEmail = String.valueOf(cr.get("email"));
				if (cr.get("phone") != null) cPhone = String.valueOf(cr.get("phone"));
			}
		}

		return new QuoteCustomerSnapshot(accName, addr1, addr2, loc, reg, post, country, cName, cEmail, cPhone);
	}

	private void validateAccount(TenantId tenantId, ActorId actorId, UUID accountId, AuthorizedDataAccess access) {
		if (accountId != null && !quoteRepository.existsAccount(tenantId, accountId, actorId, access)) {
			throw new DomainResourceNotFound(QuoteErrorCode.QUOTE_ACCOUNT_INVALID, "Account not found or inaccessible");
		}
	}

	private void validateContact(TenantId tenantId, ActorId actorId, UUID contactId, AuthorizedDataAccess access) {
		if (contactId != null && !quoteRepository.existsContact(tenantId, contactId, actorId, access)) {
			throw new DomainResourceNotFound(QuoteErrorCode.QUOTE_CONTACT_INVALID, "Contact not found or inaccessible");
		}
	}

	private void validateOpportunity(TenantId tenantId, ActorId actorId, UUID opportunityId, AuthorizedDataAccess access) {
		if (opportunityId != null && !quoteRepository.existsOpportunity(tenantId, opportunityId, actorId, access)) {
			throw new DomainResourceNotFound(QuoteErrorCode.QUOTE_OPPORTUNITY_INVALID, "Opportunity not found or inaccessible");
		}
	}

	private void validatePriceBook(TenantId tenantId, UUID priceBookId) {
		if (priceBookId != null && !quoteRepository.existsPriceBook(tenantId, priceBookId)) {
			throw new DomainResourceNotFound(QuoteErrorCode.QUOTE_PRICE_BOOK_INVALID, "Price book not found or inactive");
		}
	}

	@Override
	@Transactional(readOnly = true)
	public com.crm.sales.quote.application.dto.QuoteStatsDto getStats() {
		TenantId tenantId = currentTenant.requireTenantId();
		ActorId actorId = currentActor.requireActorId();
		AuthorizedDataAccess access = authorizer.authorize(SystemPermission.SALES_QUOTE_READ, ENTITY_TYPE);
		return quoteRepository.getStats(tenantId, actorId, access);
	}

	@Override
	@Transactional
	public QuoteDetails duplicate(com.crm.sales.quote.application.command.DuplicateQuoteCommand command) {
		Objects.requireNonNull(command, "command must not be null");
		TenantId tenantId = currentTenant.requireTenantId();
		ActorId actorId = currentActor.requireActorId();
		AuthorizedDataAccess access = authorizer.authorize(SystemPermission.SALES_QUOTE_WRITE, ENTITY_TYPE);

		Quote source = quoteRepository.findById(tenantId, command.sourceQuoteId(), actorId, access)
				.orElseThrow(() -> new DomainResourceNotFound(QuoteErrorCode.QUOTE_NOT_FOUND, "Source quote not found"));

		Instant now = timeProvider.now();
		QuoteId newQuoteId = new QuoteId(identifierGenerator.nextId());
		String newQuoteNumber = quoteRepository.generateQuoteNumber(tenantId);

		Quote copy = Quote.createDraft(
				tenantId,
				newQuoteId,
				newQuoteNumber,
				source.name() != null ? source.name() + " (Copy)" : "Copy of " + source.quoteNumber(),
				source.accountId(),
				source.contactId(),
				source.opportunityId(),
				source.priceBookId(),
				source.ownerUserId(),
				source.ownerTeamId(),
				source.currencyCode(),
				source.customerSnapshot(),
				java.time.LocalDate.now(),
				java.time.LocalDate.now().plusDays(30),
				actorId,
				now
		);

		quoteRepository.save(copy);
		return get(newQuoteId);
	}

	@Override
	@Transactional
	public QuoteDetails applyDiscount(com.crm.sales.quote.application.command.ApplyQuoteDiscountCommand command) {
		Objects.requireNonNull(command, "command must not be null");
		TenantId tenantId = currentTenant.requireTenantId();
		ActorId actorId = currentActor.requireActorId();
		authorizer.requirePermission(SystemPermission.SALES_QUOTE_WRITE);

		quoteRepository.applyDiscount(
				tenantId,
				command.id(),
				command.discountPercentage(),
				command.expectedVersion(),
				actorId,
				timeProvider.now()
		);
		return get(command.id());
	}

	@Override
	@Transactional
	public int bulkChangeStatus(com.crm.sales.quote.application.command.BulkChangeQuoteStatusCommand command) {
		Objects.requireNonNull(command, "command must not be null");
		TenantId tenantId = currentTenant.requireTenantId();
		ActorId actorId = currentActor.requireActorId();
		authorizer.requirePermission(SystemPermission.SALES_QUOTE_WRITE);

		java.util.List<QuoteId> ids = command.quoteIds().stream().map(QuoteId::new).toList();
		return quoteRepository.bulkChangeStatus(tenantId, ids, command.status(), actorId, timeProvider.now());
	}

}
