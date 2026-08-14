package com.crm.sales.order.domain;

import java.time.Instant;
import java.time.LocalDate;
import java.util.Objects;
import java.util.UUID;

import com.crm.sharedkernel.domain.ActorId;
import com.crm.sharedkernel.domain.TenantId;

public class Order {

	private final TenantId tenantId;
	private final OrderId id;
	private final String orderNumber;
	private UUID accountId;
	private UUID contactId;
	private UUID opportunityId;
	private UUID quoteId;
	private UUID ownerUserId;
	private OrderStatus status;
	private OrderAmounts amounts;
	private LocalDate orderDate;
	private LocalDate requestedDeliveryDate;
	private String customerReference;
	private Instant confirmedAt;
	private Instant fulfilledAt;
	private Instant cancelledAt;
	private String cancellationReason;

	private final Instant createdAt;
	private final ActorId createdBy;
	private Instant updatedAt;
	private ActorId updatedBy;
	private long version;

	private Order(
			TenantId tenantId,
			OrderId id,
			String orderNumber,
			UUID accountId,
			UUID contactId,
			UUID opportunityId,
			UUID quoteId,
			UUID ownerUserId,
			OrderStatus status,
			OrderAmounts amounts,
			LocalDate orderDate,
			LocalDate requestedDeliveryDate,
			String customerReference,
			Instant confirmedAt,
			Instant fulfilledAt,
			Instant cancelledAt,
			String cancellationReason,
			Instant createdAt,
			ActorId createdBy,
			Instant updatedAt,
			ActorId updatedBy,
			long version) {
		this.tenantId = Objects.requireNonNull(tenantId, "tenantId must not be null");
		this.id = Objects.requireNonNull(id, "id must not be null");
		this.orderNumber = validateOrderNumber(orderNumber);
		this.accountId = Objects.requireNonNull(accountId, "accountId must not be null");
		this.contactId = contactId;
		this.opportunityId = opportunityId;
		this.quoteId = quoteId;
		this.ownerUserId = ownerUserId;
		this.status = status == null ? OrderStatus.DRAFT : status;
		this.amounts = Objects.requireNonNull(amounts, "amounts must not be null");
		this.orderDate = orderDate == null ? LocalDate.now() : orderDate;
		this.requestedDeliveryDate = requestedDeliveryDate;
		this.customerReference = trimToNull(customerReference);
		this.confirmedAt = confirmedAt;
		this.fulfilledAt = fulfilledAt;
		this.cancelledAt = cancelledAt;
		this.cancellationReason = trimToNull(cancellationReason);
		this.createdAt = Objects.requireNonNull(createdAt, "createdAt must not be null");
		this.createdBy = createdBy;
		this.updatedAt = Objects.requireNonNull(updatedAt, "updatedAt must not be null");
		this.updatedBy = updatedBy;
		this.version = version;
	}

	public static Order create(
			TenantId tenantId,
			OrderId id,
			String orderNumber,
			UUID accountId,
			UUID contactId,
			UUID opportunityId,
			UUID quoteId,
			UUID ownerUserId,
			OrderAmounts amounts,
			LocalDate orderDate,
			LocalDate requestedDeliveryDate,
			String customerReference,
			ActorId actorId,
			Instant now) {
		return new Order(
				tenantId,
				id,
				orderNumber,
				accountId,
				contactId,
				opportunityId,
				quoteId,
				ownerUserId,
				OrderStatus.DRAFT,
				amounts,
				orderDate,
				requestedDeliveryDate,
				customerReference,
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

	public static Order reconstitute(
			TenantId tenantId,
			OrderId id,
			String orderNumber,
			UUID accountId,
			UUID contactId,
			UUID opportunityId,
			UUID quoteId,
			UUID ownerUserId,
			OrderStatus status,
			OrderAmounts amounts,
			LocalDate orderDate,
			LocalDate requestedDeliveryDate,
			String customerReference,
			Instant confirmedAt,
			Instant fulfilledAt,
			Instant cancelledAt,
			String cancellationReason,
			Instant createdAt,
			ActorId createdBy,
			Instant updatedAt,
			ActorId updatedBy,
			long version) {
		return new Order(
				tenantId,
				id,
				orderNumber,
				accountId,
				contactId,
				opportunityId,
				quoteId,
				ownerUserId,
				status,
				amounts,
				orderDate,
				requestedDeliveryDate,
				customerReference,
				confirmedAt,
				fulfilledAt,
				cancelledAt,
				cancellationReason,
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
			UUID quoteId,
			UUID ownerUserId,
			OrderStatus status,
			OrderAmounts amounts,
			LocalDate orderDate,
			LocalDate requestedDeliveryDate,
			String customerReference,
			ActorId actorId,
			Instant now,
			long expectedVersion) {
		checkVersion(expectedVersion);
		if (this.status == OrderStatus.CANCELLED || this.status == OrderStatus.FULFILLED) {
			throw new IllegalStateException("Order cannot be updated in status " + this.status);
		}
		this.accountId = Objects.requireNonNull(accountId, "accountId must not be null");
		this.contactId = contactId;
		this.opportunityId = opportunityId;
		this.quoteId = quoteId;
		this.ownerUserId = ownerUserId;
		this.status = status == null ? this.status : status;
		this.amounts = Objects.requireNonNull(amounts, "amounts must not be null");
		this.orderDate = orderDate == null ? this.orderDate : orderDate;
		this.requestedDeliveryDate = requestedDeliveryDate;
		this.customerReference = trimToNull(customerReference);
		this.updatedAt = Objects.requireNonNull(now, "now must not be null");
		this.updatedBy = actorId;
		this.version++;
	}

	public void confirm(ActorId actorId, Instant now, long expectedVersion) {
		checkVersion(expectedVersion);
		if (this.status != OrderStatus.DRAFT) {
			throw new IllegalStateException("Only DRAFT orders can be confirmed");
		}
		this.status = OrderStatus.CONFIRMED;
		this.confirmedAt = now;
		this.updatedAt = now;
		this.updatedBy = actorId;
		this.version++;
	}

	public void cancel(String reason, ActorId actorId, Instant now, long expectedVersion) {
		checkVersion(expectedVersion);
		if (this.status == OrderStatus.FULFILLED) {
			throw new IllegalStateException("Fulfilled orders cannot be cancelled");
		}
		this.status = OrderStatus.CANCELLED;
		this.cancelledAt = now;
		this.cancellationReason = trimToNull(reason);
		this.updatedAt = now;
		this.updatedBy = actorId;
		this.version++;
	}

	private void checkVersion(long expectedVersion) {
		if (this.version != expectedVersion) {
			throw new IllegalStateException("Optimistic lock version mismatch");
		}
	}

	private static String validateOrderNumber(String orderNumber) {
		Objects.requireNonNull(orderNumber, "orderNumber must not be null");
		String trimmed = orderNumber.trim();
		if (trimmed.isEmpty()) {
			throw new IllegalArgumentException("orderNumber must not be blank");
		}
		if (trimmed.length() > 191) {
			throw new IllegalArgumentException("orderNumber must be <= 191 chars");
		}
		return trimmed;
	}

	private static String trimToNull(String value) {
		if (value == null) return null;
		String trimmed = value.trim();
		return trimmed.isEmpty() ? null : trimmed;
	}

	public TenantId tenantId() { return tenantId; }
	public OrderId id() { return id; }
	public String orderNumber() { return orderNumber; }
	public UUID accountId() { return accountId; }
	public UUID contactId() { return contactId; }
	public UUID opportunityId() { return opportunityId; }
	public UUID quoteId() { return quoteId; }
	public UUID ownerUserId() { return ownerUserId; }
	public OrderStatus status() { return status; }
	public OrderAmounts amounts() { return amounts; }
	public LocalDate orderDate() { return orderDate; }
	public LocalDate requestedDeliveryDate() { return requestedDeliveryDate; }
	public String customerReference() { return customerReference; }
	public Instant confirmedAt() { return confirmedAt; }
	public Instant fulfilledAt() { return fulfilledAt; }
	public Instant cancelledAt() { return cancelledAt; }
	public String cancellationReason() { return cancellationReason; }
	public Instant createdAt() { return createdAt; }
	public ActorId createdBy() { return createdBy; }
	public Instant updatedAt() { return updatedAt; }
	public ActorId updatedBy() { return updatedBy; }
	public long version() { return version; }

}
