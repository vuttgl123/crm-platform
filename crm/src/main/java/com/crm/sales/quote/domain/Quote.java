package com.crm.sales.quote.domain;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
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
	private String name;
	private UUID accountId;
	private UUID contactId;
	private UUID opportunityId;
	private UUID priceBookId;
	private UUID ownerUserId;
	private UUID ownerTeamId;
	private QuoteStatus status;
	private QuotePricingMode pricingMode;
	private QuoteAmounts amounts;
	private QuoteCustomerSnapshot customerSnapshot;
	private List<QuoteLine> lines;
	private BigDecimal exchangeRateToTenantCurrency;
	private LocalDate issueDate;
	private LocalDate validUntil;
	private String paymentTerms;
	private String deliveryTerms;
	private String customerReference;
	private String notes;
	private Instant approvedAt;
	private ActorId approvedBy;
	private Instant sentAt;
	private Instant acceptedAt;
	private Instant rejectedAt;
	private Instant cancelledAt;

	private final Instant createdAt;
	private final ActorId createdBy;
	private Instant updatedAt;
	private ActorId updatedBy;
	private long version;

	public Quote(
			TenantId tenantId,
			QuoteId id,
			String quoteNumber,
			int revisionNumber,
			UUID previousQuoteId,
			String name,
			UUID accountId,
			UUID contactId,
			UUID opportunityId,
			UUID priceBookId,
			UUID ownerUserId,
			UUID ownerTeamId,
			QuoteStatus status,
			QuotePricingMode pricingMode,
			QuoteAmounts amounts,
			QuoteCustomerSnapshot customerSnapshot,
			List<QuoteLine> lines,
			BigDecimal exchangeRateToTenantCurrency,
			LocalDate issueDate,
			LocalDate validUntil,
			String paymentTerms,
			String deliveryTerms,
			String customerReference,
			String notes,
			Instant approvedAt,
			ActorId approvedBy,
			Instant sentAt,
			Instant acceptedAt,
			Instant rejectedAt,
			Instant cancelledAt,
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
		this.name = name != null && !name.trim().isEmpty() ? name.trim() : quoteNumber;
		this.accountId = Objects.requireNonNull(accountId, "accountId must not be null");
		this.contactId = contactId;
		this.opportunityId = opportunityId;
		this.priceBookId = priceBookId;
		this.ownerUserId = ownerUserId;
		this.ownerTeamId = ownerTeamId;
		this.status = status == null ? QuoteStatus.DRAFT : status;
		this.pricingMode = pricingMode == null ? QuotePricingMode.LINE_ITEM : pricingMode;
		this.amounts = Objects.requireNonNull(amounts, "amounts must not be null");
		this.customerSnapshot = customerSnapshot != null ? customerSnapshot : QuoteCustomerSnapshot.empty(name);
		this.lines = lines != null ? new ArrayList<>(lines) : new ArrayList<>();
		this.exchangeRateToTenantCurrency = exchangeRateToTenantCurrency;
		this.issueDate = issueDate == null ? LocalDate.now() : issueDate;
		this.validUntil = validUntil;
		this.paymentTerms = trimToNull(paymentTerms);
		this.deliveryTerms = trimToNull(deliveryTerms);
		this.customerReference = trimToNull(customerReference);
		this.notes = trimToNull(notes);
		this.approvedAt = approvedAt;
		this.approvedBy = approvedBy;
		this.sentAt = sentAt;
		this.acceptedAt = acceptedAt;
		this.rejectedAt = rejectedAt;
		this.cancelledAt = cancelledAt;
		this.createdAt = Objects.requireNonNull(createdAt, "createdAt must not be null");
		this.createdBy = createdBy;
		this.updatedAt = Objects.requireNonNull(updatedAt, "updatedAt must not be null");
		this.updatedBy = updatedBy;
		this.version = version;
	}

	public static Quote createDraft(
			TenantId tenantId,
			QuoteId id,
			String quoteNumber,
			String name,
			UUID accountId,
			UUID contactId,
			UUID opportunityId,
			UUID priceBookId,
			UUID ownerUserId,
			UUID ownerTeamId,
			String currencyCode,
			QuoteCustomerSnapshot customerSnapshot,
			LocalDate issueDate,
			LocalDate validUntil,
			ActorId actorId,
			Instant now) {
		QuoteAmounts initialAmounts = QuoteAmounts.create(
				currencyCode != null ? currencyCode : "USD",
				BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO
		);
		return new Quote(
				tenantId,
				id,
				quoteNumber,
				1,
				null,
				name,
				accountId,
				contactId,
				opportunityId,
				priceBookId,
				ownerUserId,
				ownerTeamId,
				QuoteStatus.DRAFT,
				QuotePricingMode.LINE_ITEM,
				initialAmounts,
				customerSnapshot,
				Collections.emptyList(),
				null,
				issueDate,
				validUntil,
				null,
				null,
				null,
				null,
				null,
				null,
				null,
				null,
				null,
				null,
				now,
				actorId,
				now,
				actorId,
				1L
		);
	}

	public static Quote reconstitute(
			TenantId tenantId,
			QuoteId id,
			String quoteNumber,
			int revisionNumber,
			UUID previousQuoteId,
			String name,
			UUID accountId,
			UUID contactId,
			UUID opportunityId,
			UUID priceBookId,
			UUID ownerUserId,
			UUID ownerTeamId,
			QuoteStatus status,
			QuotePricingMode pricingMode,
			QuoteAmounts amounts,
			QuoteCustomerSnapshot customerSnapshot,
			List<QuoteLine> lines,
			BigDecimal exchangeRateToTenantCurrency,
			LocalDate issueDate,
			LocalDate validUntil,
			String paymentTerms,
			String deliveryTerms,
			String customerReference,
			String notes,
			Instant approvedAt,
			ActorId approvedBy,
			Instant sentAt,
			Instant acceptedAt,
			Instant rejectedAt,
			Instant cancelledAt,
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
				name,
				accountId,
				contactId,
				opportunityId,
				priceBookId,
				ownerUserId,
				ownerTeamId,
				status,
				pricingMode,
				amounts,
				customerSnapshot,
				lines,
				exchangeRateToTenantCurrency,
				issueDate,
				validUntil,
				paymentTerms,
				deliveryTerms,
				customerReference,
				notes,
				approvedAt,
				approvedBy,
				sentAt,
				acceptedAt,
				rejectedAt,
				cancelledAt,
				createdAt,
				createdBy,
				updatedAt,
				updatedBy,
				version
		);
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
				quoteNumber,
				accountId,
				contactId,
				opportunityId,
				priceBookId,
				ownerUserId,
				null,
				status,
				QuotePricingMode.LINE_ITEM,
				amounts,
				QuoteCustomerSnapshot.empty(quoteNumber),
				Collections.emptyList(),
				exchangeRateToTenantCurrency,
				issueDate,
				validUntil,
				paymentTerms,
				deliveryTerms,
				customerReference,
				notes,
				approvedAt,
				approvedBy,
				null,
				acceptedAt,
				rejectedAt,
				null,
				createdAt,
				createdBy,
				updatedAt,
				updatedBy,
				version
		);
	}

	public void saveDraft(
			String name,
			UUID accountId,
			UUID contactId,
			UUID opportunityId,
			UUID priceBookId,
			UUID ownerUserId,
			UUID ownerTeamId,
			QuoteCustomerSnapshot customerSnapshot,
			LocalDate issueDate,
			LocalDate validUntil,
			String paymentTerms,
			String deliveryTerms,
			String customerReference,
			String notes,
			BigDecimal shippingTotal,
			List<QuoteLine> newLines,
			ActorId actorId,
			Instant now,
			long expectedVersion) {
		checkVersion(expectedVersion);
		if (this.status != QuoteStatus.DRAFT) {
			throw new IllegalStateException("Quote cannot be modified in status " + this.status);
		}
		this.name = name != null && !name.trim().isEmpty() ? name.trim() : this.quoteNumber;
		this.accountId = Objects.requireNonNull(accountId, "accountId must not be null");
		this.contactId = contactId;
		this.opportunityId = opportunityId;
		this.priceBookId = priceBookId;
		this.ownerUserId = ownerUserId;
		this.ownerTeamId = ownerTeamId;
		this.customerSnapshot = customerSnapshot != null ? customerSnapshot : this.customerSnapshot;
		this.issueDate = issueDate != null ? issueDate : this.issueDate;
		this.validUntil = validUntil;
		this.paymentTerms = trimToNull(paymentTerms);
		this.deliveryTerms = trimToNull(deliveryTerms);
		this.customerReference = trimToNull(customerReference);
		this.notes = trimToNull(notes);

		this.lines = new ArrayList<>(newLines != null ? newLines : Collections.emptyList());
		recalculateTotals(shippingTotal);

		this.updatedAt = Objects.requireNonNull(now, "now must not be null");
		this.updatedBy = actorId;
		this.version++;
	}

	public void submitForApproval(ActorId actorId, Instant now, long expectedVersion) {
		checkVersion(expectedVersion);
		if (this.status != QuoteStatus.DRAFT) {
			throw new IllegalStateException("Only DRAFT quote can be submitted for approval");
		}
		if (this.pricingMode == QuotePricingMode.LINE_ITEM && this.lines.isEmpty()) {
			throw new IllegalStateException("Quote must have at least one line item before submitting");
		}
		this.status = QuoteStatus.PENDING_APPROVAL;
		this.updatedAt = now;
		this.updatedBy = actorId;
		this.version++;
	}

	public void approve(ActorId actorId, Instant now, long expectedVersion) {
		checkVersion(expectedVersion);
		if (this.status != QuoteStatus.PENDING_APPROVAL) {
			throw new IllegalStateException("Only PENDING_APPROVAL quote can be approved");
		}
		this.status = QuoteStatus.APPROVED;
		this.approvedAt = now;
		this.approvedBy = actorId;
		this.updatedAt = now;
		this.updatedBy = actorId;
		this.version++;
	}

	public void requestChanges(String reason, ActorId actorId, Instant now, long expectedVersion) {
		checkVersion(expectedVersion);
		if (this.status != QuoteStatus.PENDING_APPROVAL) {
			throw new IllegalStateException("Only PENDING_APPROVAL quote can have changes requested");
		}
		if (reason == null || reason.trim().isEmpty()) {
			throw new IllegalArgumentException("Reason is required when requesting changes");
		}
		this.status = QuoteStatus.DRAFT;
		this.updatedAt = now;
		this.updatedBy = actorId;
		this.version++;
	}

	public void markSent(ActorId actorId, Instant now, long expectedVersion) {
		checkVersion(expectedVersion);
		if (this.status != QuoteStatus.APPROVED) {
			throw new IllegalStateException("Only APPROVED quote can be marked as SENT");
		}
		this.status = QuoteStatus.SENT;
		this.sentAt = now;
		this.updatedAt = now;
		this.updatedBy = actorId;
		this.version++;
	}

	public void accept(String customerReference, ActorId actorId, Instant now, long expectedVersion) {
		checkVersion(expectedVersion);
		if (this.status != QuoteStatus.SENT) {
			throw new IllegalStateException("Only SENT quote can be accepted");
		}
		this.status = QuoteStatus.ACCEPTED;
		if (customerReference != null && !customerReference.trim().isEmpty()) {
			this.customerReference = customerReference.trim();
		}
		this.acceptedAt = now;
		this.updatedAt = now;
		this.updatedBy = actorId;
		this.version++;
	}

	public void reject(String reason, ActorId actorId, Instant now, long expectedVersion) {
		checkVersion(expectedVersion);
		if (this.status != QuoteStatus.SENT) {
			throw new IllegalStateException("Only SENT quote can be rejected");
		}
		if (reason == null || reason.trim().isEmpty()) {
			throw new IllegalArgumentException("Reason is required when rejecting a quote");
		}
		this.status = QuoteStatus.REJECTED;
		this.rejectedAt = now;
		this.updatedAt = now;
		this.updatedBy = actorId;
		this.version++;
	}

	public void cancel(String reason, ActorId actorId, Instant now, long expectedVersion) {
		checkVersion(expectedVersion);
		if (this.status == QuoteStatus.CANCELLED || this.status == QuoteStatus.SUPERSEDED) {
			throw new IllegalStateException("Cannot cancel a terminal or superseded quote");
		}
		this.status = QuoteStatus.CANCELLED;
		this.cancelledAt = now;
		this.updatedAt = now;
		this.updatedBy = actorId;
		this.version++;
	}

	public void supersede(ActorId actorId, Instant now, long expectedVersion) {
		checkVersion(expectedVersion);
		this.status = QuoteStatus.SUPERSEDED;
		this.updatedAt = now;
		this.updatedBy = actorId;
		this.version++;
	}

	public Quote createRevision(QuoteId newQuoteId, ActorId actorId, Instant now) {
		if (this.status == QuoteStatus.ACCEPTED || this.status == QuoteStatus.CANCELLED || this.status == QuoteStatus.SUPERSEDED) {
			throw new IllegalStateException("Cannot revise an accepted, cancelled or superseded quote");
		}
		List<QuoteLine> copiedLines = new ArrayList<>();
		for (QuoteLine l : this.lines) {
			copiedLines.add(new QuoteLine(
					UUID.randomUUID(),
					newQuoteId,
					l.position(),
					l.productId(),
					l.priceBookItemId(),
					l.skuSnapshot(),
					l.productNameSnapshot(),
					l.unitSnapshot(),
					l.descriptionSnapshot(),
					l.quantity(),
					l.listUnitPrice(),
					l.salesUnitPrice(),
					l.discountPercent(),
					l.taxPercent(),
					l.lineSubtotal(),
					l.lineDiscount(),
					l.lineTax(),
					l.lineTotal(),
					now,
					now
			));
		}

		return new Quote(
				this.tenantId,
				newQuoteId,
				this.quoteNumber,
				this.revisionNumber + 1,
				this.id.value(),
				this.name,
				this.accountId,
				this.contactId,
				this.opportunityId,
				this.priceBookId,
				this.ownerUserId,
				this.ownerTeamId,
				QuoteStatus.DRAFT,
				QuotePricingMode.LINE_ITEM,
				this.amounts,
				this.customerSnapshot,
				copiedLines,
				this.exchangeRateToTenantCurrency,
				LocalDate.now(),
				this.validUntil,
				this.paymentTerms,
				this.deliveryTerms,
				this.customerReference,
				this.notes,
				null,
				null,
				null,
				null,
				null,
				null,
				now,
				actorId,
				now,
				actorId,
				1L
		);
	}

	public void recalculateTotals(BigDecimal shippingTotal) {
		BigDecimal subtotal = BigDecimal.ZERO;
		BigDecimal discountTotal = BigDecimal.ZERO;
		BigDecimal taxTotal = BigDecimal.ZERO;

		int pos = 1;
		for (QuoteLine line : this.lines) {
			line.setPosition(pos++);
			subtotal = subtotal.add(line.lineSubtotal());
			discountTotal = discountTotal.add(line.lineDiscount());
			taxTotal = taxTotal.add(line.lineTax());
		}

		BigDecimal shipping = (shippingTotal != null && shippingTotal.compareTo(BigDecimal.ZERO) >= 0)
				? shippingTotal.setScale(6, RoundingMode.HALF_UP)
				: (this.amounts != null ? this.amounts.shippingTotal() : BigDecimal.ZERO);

		this.amounts = QuoteAmounts.create(
				this.amounts != null ? this.amounts.currencyCode() : "USD",
				subtotal.setScale(6, RoundingMode.HALF_UP),
				discountTotal.setScale(6, RoundingMode.HALF_UP),
				taxTotal.setScale(6, RoundingMode.HALF_UP),
				shipping
		);
	}

	private void checkVersion(long expectedVersion) {
		if (this.version != expectedVersion) {
			throw new IllegalStateException("Optimistic lock version mismatch: expected " + expectedVersion + " but found " + this.version);
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
	public String name() { return name; }
	public UUID accountId() { return accountId; }
	public UUID contactId() { return contactId; }
	public UUID opportunityId() { return opportunityId; }
	public UUID priceBookId() { return priceBookId; }
	public UUID ownerUserId() { return ownerUserId; }
	public UUID ownerTeamId() { return ownerTeamId; }
	public QuoteStatus status() { return status; }
	public QuotePricingMode pricingMode() { return pricingMode; }
	public QuoteAmounts amounts() { return amounts; }
	public QuoteCustomerSnapshot customerSnapshot() { return customerSnapshot; }
	public List<QuoteLine> lines() { return Collections.unmodifiableList(lines); }
	public BigDecimal exchangeRateToTenantCurrency() { return exchangeRateToTenantCurrency; }
	public LocalDate issueDate() { return issueDate; }
	public LocalDate validUntil() { return validUntil; }
	public String paymentTerms() { return paymentTerms; }
	public String deliveryTerms() { return deliveryTerms; }
	public String customerReference() { return customerReference; }
	public String notes() { return notes; }
	public Instant approvedAt() { return approvedAt; }
	public ActorId approvedBy() { return approvedBy; }
	public Instant sentAt() { return sentAt; }
	public Instant acceptedAt() { return acceptedAt; }
	public Instant rejectedAt() { return rejectedAt; }
	public Instant cancelledAt() { return cancelledAt; }
	public Instant createdAt() { return createdAt; }
	public ActorId createdBy() { return createdBy; }
	public Instant updatedAt() { return updatedAt; }
	public ActorId updatedBy() { return updatedBy; }
	public long version() { return version; }
}
