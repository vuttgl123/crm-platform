package com.crm.sales.contract.domain;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.Objects;
import java.util.UUID;

import com.crm.customer.account.domain.AccountId;
import com.crm.customer.contact.domain.ContactId;
import com.crm.customer.opportunity.domain.OpportunityId;
import com.crm.sales.order.domain.OrderId;
import com.crm.sales.quote.domain.QuoteId;
import com.crm.sharedkernel.domain.ActorId;
import com.crm.sharedkernel.domain.AuditInfo;
import com.crm.sharedkernel.domain.TenantId;

public final class Contract {

	private final TenantId tenantId;
	private final ContractId id;
	private String contractNumber;
	private AccountId accountId;
	private ContactId contactId;
	private OpportunityId opportunityId;
	private QuoteId quoteId;
	private OrderId orderId;
	private ActorId ownerUserId;
	private ContractType contractType;
	private ContractStatus status;
	private String currencyCode;
	private BigDecimal contractValue;
	private LocalDate effectiveFrom;
	private LocalDate effectiveTo;
	private boolean autoRenew;
	private Integer renewalNoticeDays;
	private Instant signedAt;
	private Instant terminatedAt;
	private String terminationReason;
	private String documentReference;
	private String termsSnapshot;
	private final AuditInfo auditInfo;
	private long version;

	public Contract(TenantId tenantId, ContractId id, String contractNumber,
			AccountId accountId, ContactId contactId, OpportunityId opportunityId,
			QuoteId quoteId, OrderId orderId, ActorId ownerUserId,
			ContractType contractType, ContractStatus status, String currencyCode,
			BigDecimal contractValue, LocalDate effectiveFrom, LocalDate effectiveTo,
			boolean autoRenew, Integer renewalNoticeDays, Instant signedAt,
			Instant terminatedAt, String terminationReason, String documentReference,
			String termsSnapshot, AuditInfo auditInfo, long version) {
		this.tenantId = Objects.requireNonNull(tenantId, "tenantId must not be null");
		this.id = Objects.requireNonNull(id, "id must not be null");
		this.contractNumber = Objects.requireNonNull(contractNumber, "contractNumber must not be null");
		this.accountId = Objects.requireNonNull(accountId, "accountId must not be null");
		this.contactId = contactId;
		this.opportunityId = opportunityId;
		this.quoteId = quoteId;
		this.orderId = orderId;
		this.ownerUserId = ownerUserId;
		this.contractType = contractType != null ? contractType : ContractType.CUSTOMER;
		this.status = status != null ? status : ContractStatus.DRAFT;
		this.currencyCode = currencyCode;
		this.contractValue = contractValue;
		this.effectiveFrom = effectiveFrom;
		this.effectiveTo = effectiveTo;
		this.autoRenew = autoRenew;
		this.renewalNoticeDays = renewalNoticeDays;
		this.signedAt = signedAt;
		this.terminatedAt = terminatedAt;
		this.terminationReason = terminationReason;
		this.documentReference = documentReference;
		this.termsSnapshot = termsSnapshot != null ? termsSnapshot : "{}";
		this.auditInfo = Objects.requireNonNull(auditInfo, "auditInfo must not be null");
		this.version = version;
	}

	public static Contract create(TenantId tenantId, ContractId id, String contractNumber,
			AccountId accountId, ContactId contactId, OpportunityId opportunityId,
			QuoteId quoteId, OrderId orderId, ActorId ownerUserId,
			ContractType contractType, String currencyCode, BigDecimal contractValue,
			LocalDate effectiveFrom, LocalDate effectiveTo, boolean autoRenew,
			Integer renewalNoticeDays, String documentReference, String termsSnapshot,
			ActorId actorId, Instant now) {
		return new Contract(tenantId, id, contractNumber.trim().toUpperCase(),
				accountId, contactId, opportunityId, quoteId, orderId, ownerUserId,
				contractType != null ? contractType : ContractType.CUSTOMER,
				ContractStatus.DRAFT,
				currencyCode != null ? currencyCode.trim().toUpperCase() : null,
				contractValue, effectiveFrom, effectiveTo, autoRenew,
				renewalNoticeDays, null, null, null, documentReference,
				termsSnapshot, AuditInfo.create(actorId, now), 1L);
	}

	public void update(AccountId accountId, ContactId contactId, OpportunityId opportunityId,
			QuoteId quoteId, OrderId orderId, ActorId ownerUserId, ContractType contractType,
			String currencyCode, BigDecimal contractValue, LocalDate effectiveFrom,
			LocalDate effectiveTo, boolean autoRenew, Integer renewalNoticeDays,
			String documentReference, String termsSnapshot, ActorId actorId, Instant now) {
		if (this.status != ContractStatus.DRAFT && this.status != ContractStatus.IN_REVIEW) {
			throw new IllegalStateException("Only DRAFT or IN_REVIEW contracts can be updated");
		}
		this.accountId = Objects.requireNonNull(accountId, "accountId must not be null");
		this.contactId = contactId;
		this.opportunityId = opportunityId;
		this.quoteId = quoteId;
		this.orderId = orderId;
		this.ownerUserId = ownerUserId;
		this.contractType = contractType != null ? contractType : this.contractType;
		this.currencyCode = currencyCode != null ? currencyCode.trim().toUpperCase() : null;
		this.contractValue = contractValue;
		this.effectiveFrom = effectiveFrom;
		this.effectiveTo = effectiveTo;
		this.autoRenew = autoRenew;
		this.renewalNoticeDays = renewalNoticeDays;
		this.documentReference = documentReference;
		this.termsSnapshot = termsSnapshot != null ? termsSnapshot : this.termsSnapshot;
		this.auditInfo.update(actorId, now);
		this.version++;
	}

	public void submitForReview(ActorId actorId, Instant now) {
		if (this.status != ContractStatus.DRAFT) {
			throw new IllegalStateException("Only DRAFT contracts can be submitted for review");
		}
		this.status = ContractStatus.IN_REVIEW;
		this.auditInfo.update(actorId, now);
		this.version++;
	}

	public void approve(ActorId actorId, Instant now) {
		if (this.status != ContractStatus.IN_REVIEW) {
			throw new IllegalStateException("Only IN_REVIEW contracts can be approved");
		}
		this.status = ContractStatus.APPROVED;
		this.auditInfo.update(actorId, now);
		this.version++;
	}

	public void sendForSignature(ActorId actorId, Instant now) {
		if (this.status != ContractStatus.APPROVED) {
			throw new IllegalStateException("Only APPROVED contracts can be sent for signature");
		}
		this.status = ContractStatus.SENT_FOR_SIGNATURE;
		this.auditInfo.update(actorId, now);
		this.version++;
	}

	public void sign(Instant signedAtTime, ActorId actorId, Instant now) {
		if (this.status != ContractStatus.SENT_FOR_SIGNATURE && this.status != ContractStatus.APPROVED) {
			throw new IllegalStateException("Contract must be APPROVED or SENT_FOR_SIGNATURE to be signed");
		}
		this.signedAt = signedAtTime != null ? signedAtTime : now;
		this.status = ContractStatus.ACTIVE;
		this.auditInfo.update(actorId, now);
		this.version++;
	}

	public void terminate(String reason, ActorId actorId, Instant now) {
		if (this.status != ContractStatus.ACTIVE) {
			throw new IllegalStateException("Only ACTIVE contracts can be terminated");
		}
		this.terminatedAt = now;
		this.terminationReason = reason;
		this.status = ContractStatus.TERMINATED;
		this.auditInfo.update(actorId, now);
		this.version++;
	}

	public void cancel(ActorId actorId, Instant now) {
		if (this.status == ContractStatus.ACTIVE || this.status == ContractStatus.TERMINATED) {
			throw new IllegalStateException("Active or terminated contracts cannot be cancelled");
		}
		this.status = ContractStatus.CANCELLED;
		this.auditInfo.update(actorId, now);
		this.version++;
	}

	public TenantId tenantId() {
		return tenantId;
	}

	public ContractId id() {
		return id;
	}

	public String contractNumber() {
		return contractNumber;
	}

	public AccountId accountId() {
		return accountId;
	}

	public ContactId contactId() {
		return contactId;
	}

	public OpportunityId opportunityId() {
		return opportunityId;
	}

	public QuoteId quoteId() {
		return quoteId;
	}

	public OrderId orderId() {
		return orderId;
	}

	public ActorId ownerUserId() {
		return ownerUserId;
	}

	public ContractType contractType() {
		return contractType;
	}

	public ContractStatus status() {
		return status;
	}

	public String currencyCode() {
		return currencyCode;
	}

	public BigDecimal contractValue() {
		return contractValue;
	}

	public LocalDate effectiveFrom() {
		return effectiveFrom;
	}

	public LocalDate effectiveTo() {
		return effectiveTo;
	}

	public boolean autoRenew() {
		return autoRenew;
	}

	public Integer renewalNoticeDays() {
		return renewalNoticeDays;
	}

	public Instant signedAt() {
		return signedAt;
	}

	public Instant terminatedAt() {
		return terminatedAt;
	}

	public String terminationReason() {
		return terminationReason;
	}

	public String documentReference() {
		return documentReference;
	}

	public String termsSnapshot() {
		return termsSnapshot;
	}

	public AuditInfo auditInfo() {
		return auditInfo;
	}

	public long version() {
		return version;
	}

}
