package com.crm.sales.quote.domain;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.Objects;
import java.util.UUID;

import com.crm.sharedkernel.domain.ActorId;
import com.crm.sharedkernel.domain.TenantId;

public class Quote {

	private final TenantId tenantId;
	private final QuoteId id;
	private final String quoteNumber;
	private int revisionNumber;
	private UUID previousQuoteId;
	private UUID accountId;
	private UUID contactId;
	private UUID opportunityId;
	private UUID priceBookId;
	private UUID ownerUserId;
	private QuoteStatus status;
	private QuoteAmounts amounts;
	private BigDecimal exchangeRateToTenantCurrency;
	private LocalDate issueDate;
	private LocalDate validUntil;
	private String paymentTerms;
	private String deliveryTerms;
	private String customerReference;
	private String notes;
	private Instant approvedAt;
	private ActorId approvedBy;
	private Instant acceptedAt;
	private Instant rejectedAt;

	private final Instant createdAt;
	private final ActorId createdBy;
	private Instant updatedAt;
	private ActorId updatedBy;
	private long version;

	private Quote(
			TenantId tenantId,
			QuoteId id,
			String quoteNumber,
			int revisionNumber,
			UUID previousQuoteId,
			UUID accountId,
			UUID contactId,
			UUID opportunityId,
			UUID priceBookId,
			UUID ownerUserId,
			QuoteStatus status,
			QuoteAmounts amounts,
			BigDecimal exchangeRateToTenantCurrency,
			LocalDate issueDate,
			LocalDate validUntil,
			String paymentTerms,
			String deliveryTerms,
			String customerReference,
			String notes,
			Instant approvedAt,
			ActorId approvedBy,
			Instant acceptedAt,
			Instant rejectedAt,
			Instant createdAt,
			ActorId createdBy,
			Instant updatedAt,
			ActorId updatedBy,
			long version) {
		this.tenantId = Objects.requireNonNull(tenantId, "tenantId must not be null");
		this.id = Objects.requireNonNull(id, "id must not be null");
		this.quoteNumber = validateQuoteNumber(quoteNumber);
		this.revisionNumber = revisionNumber <= 0 ? 1 : revisionNumber;
		this.previousQuoteId = previousQuoteId;
		this.accountId = Objects.requireNonNull(accountId, "accountId must not be null");
		this.contactId = contactId;
		this.opportunityId = opportunityId;
		this.priceBookId = priceBookId;
		this.ownerUserId = ownerUserId;
		this.status = status == null ? QuoteStatus.DRAFT : status;
		this.amounts = Objects.requireNonNull(amounts, "amounts must not be null");
		this.exchangeRateToTenantCurrency = exchangeRateToTenantCurrency;
		this.issueDate = issueDate == null ? LocalDate.now() : issueDate;
		this.validUntil = validUntil;
		this.paymentTerms = trimToNull(paymentTerms);
		this.deliveryTerms = trimToNull(deliveryTerms);
		this.customerReference = trimToNull(customerReference);
		this.notes = trimToNull(notes);
		this.approvedAt = approvedAt;
		this.approvedBy = approvedBy;
		this.acceptedAt = acceptedAt;
		this.rejectedAt = rejectedAt;
		this.createdAt = Objects.requireNonNull(createdAt, "createdAt must not be null");
		this.createdBy = createdBy;
		this.updatedAt = Objects.requireNonNull(updatedAt, "updatedAt must not be null");
		this.updatedBy = updatedBy;
		this.version = version;
	}

	public static Quote create(
			TenantId tenantId,
			QuoteId id,
			String quoteNumber,
			UUID accountId,
			UUID contactId,
			UUID opportunityId,
			UUID priceBookId,
			UUID ownerUserId,
			QuoteAmounts amounts,
			LocalDate issueDate,
			LocalDate validUntil,
			String paymentTerms,
			String deliveryTerms,
			String customerReference,
			String notes,
			ActorId actorId,
			Instant now) {
		return new Quote(
				tenantId,
				id,
				quoteNumber,
				1,
				null,
				accountId,
				contactId,
				opportunityId,
				priceBookId,
				ownerUserId,
				QuoteStatus.DRAFT,
				amounts,
				null,
				issueDate,
				validUntil,
				paymentTerms,
				deliveryTerms,
				customerReference,
				notes,
				null,
				null,
				null,
				null,
				now,
				actorId,
				now,
				actorId,
				1L);
	}

	public static Quote reconstitute(
			TenantId tenantId,
			QuoteId id,
			String quoteNumber,
			int revisionNumber,
			UUID previousQuoteId,
			UUID accountId,
			UUID contactId,
			UUID opportunityId,
			UUID priceBookId,
			UUID ownerUserId,
			QuoteStatus status,
			QuoteAmounts amounts,
			BigDecimal exchangeRateToTenantCurrency,
			LocalDate issueDate,
			LocalDate validUntil,
			String paymentTerms,
			String deliveryTerms,
			String customerReference,
			String notes,
			Instant approvedAt,
			ActorId approvedBy,
			Instant acceptedAt,
			Instant rejectedAt,
			Instant createdAt,
			ActorId createdBy,
			Instant updatedAt,
			ActorId updatedBy,
			long version) {
		return new Quote(
				tenantId,
				id,
				quoteNumber,
				revisionNumber,
				previousQuoteId,
				accountId,
				contactId,
				opportunityId,
				priceBookId,
				ownerUserId,
				status,
				amounts,
				exchangeRateToTenantCurrency,
				issueDate,
				validUntil,
				paymentTerms,
				deliveryTerms,
				customerReference,
				notes,
				approvedAt,
				approvedBy,
				acceptedAt,
				rejectedAt,
				createdAt,
				createdBy,
				updatedAt,
				updatedBy,
				version);
	}

	public void update(
			UUID accountId,
			UUID contactId,
			UUID opportunityId,
			UUID priceBookId,
			UUID ownerUserId,
			QuoteStatus status,
			QuoteAmounts amounts,
			LocalDate issueDate,
			LocalDate validUntil,
			String paymentTerms,
			String deliveryTerms,
			String customerReference,
			String notes,
			ActorId actorId,
			Instant now,
			long expectedVersion) {
		checkVersion(expectedVersion);
		if (this.status != QuoteStatus.DRAFT && this.status != QuoteStatus.PENDING_APPROVAL) {
			throw new IllegalStateException("Quote cannot be modified in status " + this.status);
		}
		this.accountId = Objects.requireNonNull(accountId, "accountId must not be null");
		this.contactId = contactId;
		this.opportunityId = opportunityId;
		this.priceBookId = priceBookId;
		this.ownerUserId = ownerUserId;
		this.status = status == null ? this.status : status;
		this.amounts = Objects.requireNonNull(amounts, "amounts must not be null");
		this.issueDate = issueDate == null ? this.issueDate : issueDate;
		this.validUntil = validUntil;
		this.paymentTerms = trimToNull(paymentTerms);
		this.deliveryTerms = trimToNull(deliveryTerms);
		this.customerReference = trimToNull(customerReference);
		this.notes = trimToNull(notes);
		this.updatedAt = Objects.requireNonNull(now, "now must not be null");
		this.updatedBy = actorId;
		this.version++;
	}

	public void approve(ActorId actorId, Instant now, long expectedVersion) {
		checkVersion(expectedVersion);
		this.status = QuoteStatus.APPROVED;
		this.approvedAt = now;
		this.approvedBy = actorId;
		this.updatedAt = now;
		this.updatedBy = actorId;
		this.version++;
	}

	public void cancel(ActorId actorId, Instant now, long expectedVersion) {
		checkVersion(expectedVersion);
		this.status = QuoteStatus.CANCELLED;
		this.updatedAt = now;
		this.updatedBy = actorId;
		this.version++;
	}

	private void checkVersion(long expectedVersion) {
		if (this.version != expectedVersion) {
			throw new IllegalStateException("Optimistic lock version mismatch");
		}
	}

	private static String validateQuoteNumber(String quoteNumber) {
		Objects.requireNonNull(quoteNumber, "quoteNumber must not be null");
		String trimmed = quoteNumber.trim();
		if (trimmed.isEmpty()) {
			throw new IllegalArgumentException("quoteNumber must not be blank");
		}
		if (trimmed.length() > 191) {
			throw new IllegalArgumentException("quoteNumber must be <= 191 chars");
		}
		return trimmed;
	}

	private static String trimToNull(String value) {
		if (value == null) return null;
		String trimmed = value.trim();
		return trimmed.isEmpty() ? null : trimmed;
	}

	public TenantId tenantId() { return tenantId; }
	public QuoteId id() { return id; }
	public String quoteNumber() { return quoteNumber; }
	public int revisionNumber() { return revisionNumber; }
	public UUID previousQuoteId() { return previousQuoteId; }
	public UUID accountId() { return accountId; }
	public UUID contactId() { return contactId; }
	public UUID opportunityId() { return opportunityId; }
	public UUID priceBookId() { return priceBookId; }
	public UUID ownerUserId() { return ownerUserId; }
	public QuoteStatus status() { return status; }
	public QuoteAmounts amounts() { return amounts; }
	public BigDecimal exchangeRateToTenantCurrency() { return exchangeRateToTenantCurrency; }
	public LocalDate issueDate() { return issueDate; }
	public LocalDate validUntil() { return validUntil; }
	public String paymentTerms() { return paymentTerms; }
	public String deliveryTerms() { return deliveryTerms; }
	public String customerReference() { return customerReference; }
	public String notes() { return notes; }
	public Instant approvedAt() { return approvedAt; }
	public ActorId approvedBy() { return approvedBy; }
	public Instant acceptedAt() { return acceptedAt; }
	public Instant rejectedAt() { return rejectedAt; }
	public Instant createdAt() { return createdAt; }
	public ActorId createdBy() { return createdBy; }
	public Instant updatedAt() { return updatedAt; }
	public ActorId updatedBy() { return updatedBy; }
	public long version() { return version; }

}
