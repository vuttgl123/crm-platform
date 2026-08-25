package com.crm.sales.order.domain;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

import com.crm.sharedkernel.domain.ActorId;
import com.crm.sharedkernel.domain.TenantId;

public class Order {

	private final TenantId tenantId;
	private final OrderId id;
	private final String orderNumber;
	private OrderSourceType sourceType;
	private OrderPricingMode pricingMode;
	private UUID accountId;
	private UUID contactId;
	private UUID opportunityId;
	private UUID quoteId;
	private UUID priceBookId;
	private UUID ownerUserId;
	private UUID ownerTeamId;
	private OrderStatus status;
	private OrderAmounts amounts;
	private OrderAddressSnapshot billingAddressSnapshot;
	private OrderAddressSnapshot shippingAddressSnapshot;
	private List<OrderLine> lines;
	private LocalDate orderDate;
	private LocalDate requestedDeliveryDate;
	private String customerReference;
	private String paymentTerms;
	private String deliveryTerms;
	private String notes;
	private Instant confirmedAt;
	private ActorId confirmedBy;
	private Instant fulfilledAt;
	private Instant cancelledAt;
	private ActorId cancelledBy;
	private String cancellationReason;
	private Instant closedAt;
	private ActorId closedBy;
	private String closedReason;

	private final Instant createdAt;
	private final ActorId createdBy;
	private Instant updatedAt;
	private ActorId updatedBy;
	private long version;

	public Order(
			TenantId tenantId,
			OrderId id,
			String orderNumber,
			OrderSourceType sourceType,
			OrderPricingMode pricingMode,
			UUID accountId,
			UUID contactId,
			UUID opportunityId,
			UUID quoteId,
			UUID priceBookId,
			UUID ownerUserId,
			UUID ownerTeamId,
			OrderStatus status,
			OrderAmounts amounts,
			OrderAddressSnapshot billingAddressSnapshot,
			OrderAddressSnapshot shippingAddressSnapshot,
			List<OrderLine> lines,
			LocalDate orderDate,
			LocalDate requestedDeliveryDate,
			String customerReference,
			String paymentTerms,
			String deliveryTerms,
			String notes,
			Instant confirmedAt,
			ActorId confirmedBy,
			Instant fulfilledAt,
			Instant cancelledAt,
			ActorId cancelledBy,
			String cancellationReason,
			Instant closedAt,
			ActorId closedBy,
			String closedReason,
			Instant createdAt,
			ActorId createdBy,
			Instant updatedAt,
			ActorId updatedBy,
			long version) {
		this.tenantId = Objects.requireNonNull(tenantId, "tenantId must not be null");
		this.id = Objects.requireNonNull(id, "id must not be null");
		this.orderNumber = validateOrderNumber(orderNumber);
		this.sourceType = sourceType != null ? sourceType : (quoteId != null ? OrderSourceType.QUOTE_CONVERTED : OrderSourceType.DIRECT);
		this.pricingMode = pricingMode != null ? pricingMode : OrderPricingMode.LINE_ITEM;
		this.accountId = Objects.requireNonNull(accountId, "accountId must not be null");
		this.contactId = contactId;
		this.opportunityId = opportunityId;
		this.quoteId = quoteId;
		this.priceBookId = priceBookId;
		this.ownerUserId = ownerUserId;
		this.ownerTeamId = ownerTeamId;
		this.status = status == null ? OrderStatus.DRAFT : status;
		this.amounts = Objects.requireNonNull(amounts, "amounts must not be null");
		this.billingAddressSnapshot = billingAddressSnapshot != null ? billingAddressSnapshot : OrderAddressSnapshot.empty("Customer");
		this.shippingAddressSnapshot = shippingAddressSnapshot != null ? shippingAddressSnapshot : OrderAddressSnapshot.empty("Customer");
		this.lines = lines != null ? new ArrayList<>(lines) : new ArrayList<>();
		this.orderDate = orderDate == null ? LocalDate.now() : orderDate;
		this.requestedDeliveryDate = requestedDeliveryDate;
		this.customerReference = trimToNull(customerReference);
		this.paymentTerms = trimToNull(paymentTerms);
		this.deliveryTerms = trimToNull(deliveryTerms);
		this.notes = trimToNull(notes);
		this.confirmedAt = confirmedAt;
		this.confirmedBy = confirmedBy;
		this.fulfilledAt = fulfilledAt;
		this.cancelledAt = cancelledAt;
		this.cancelledBy = cancelledBy;
		this.cancellationReason = trimToNull(cancellationReason);
		this.closedAt = closedAt;
		this.closedBy = closedBy;
		this.closedReason = trimToNull(closedReason);
		this.createdAt = Objects.requireNonNull(createdAt, "createdAt must not be null");
		this.createdBy = createdBy;
		this.updatedAt = Objects.requireNonNull(updatedAt, "updatedAt must not be null");
		this.updatedBy = updatedBy;
		this.version = version;
	}

	public static Order createDirectDraft(
			TenantId tenantId,
			OrderId id,
			String orderNumber,
			UUID accountId,
			UUID contactId,
			UUID opportunityId,
			UUID priceBookId,
			UUID ownerUserId,
			UUID ownerTeamId,
			String currencyCode,
			OrderAddressSnapshot billingAddressSnapshot,
			OrderAddressSnapshot shippingAddressSnapshot,
			LocalDate orderDate,
			LocalDate requestedDeliveryDate,
			String customerReference,
			String paymentTerms,
			String deliveryTerms,
			String notes,
			ActorId actorId,
			Instant now) {
		OrderAmounts initialAmounts = OrderAmounts.create(
				currencyCode != null ? currencyCode : "USD",
				BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO
		);
		return new Order(
				tenantId,
				id,
				orderNumber,
				OrderSourceType.DIRECT,
				OrderPricingMode.LINE_ITEM,
				accountId,
				contactId,
				opportunityId,
				null,
				priceBookId,
				ownerUserId,
				ownerTeamId,
				OrderStatus.DRAFT,
				initialAmounts,
				billingAddressSnapshot,
				shippingAddressSnapshot,
				Collections.emptyList(),
				orderDate != null ? orderDate : LocalDate.now(),
				requestedDeliveryDate,
				customerReference,
				paymentTerms,
				deliveryTerms,
				notes,
				null, null, null, null, null, null, null, null, null,
				now, actorId, now, actorId, 1L
		);
	}

	public static Order createFromQuote(
			TenantId tenantId,
			OrderId id,
			String orderNumber,
			UUID accountId,
			UUID contactId,
			UUID opportunityId,
			UUID quoteId,
			UUID priceBookId,
			UUID ownerUserId,
			UUID ownerTeamId,
			OrderAmounts amounts,
			OrderAddressSnapshot billingAddressSnapshot,
			OrderAddressSnapshot shippingAddressSnapshot,
			List<OrderLine> lines,
			LocalDate orderDate,
			LocalDate requestedDeliveryDate,
			String customerReference,
			String paymentTerms,
			String deliveryTerms,
			String notes,
			ActorId actorId,
			Instant now) {
		return new Order(
				tenantId,
				id,
				orderNumber,
				OrderSourceType.QUOTE_CONVERTED,
				OrderPricingMode.LINE_ITEM,
				accountId,
				contactId,
				opportunityId,
				quoteId,
				priceBookId,
				ownerUserId,
				ownerTeamId,
				OrderStatus.CONFIRMED,
				amounts,
				billingAddressSnapshot,
				shippingAddressSnapshot,
				lines,
				orderDate != null ? orderDate : LocalDate.now(),
				requestedDeliveryDate,
				customerReference,
				paymentTerms,
				deliveryTerms,
				notes,
				now, actorId, null, null, null, null, null, null, null,
				now, actorId, now, actorId, 1L
		);
	}

	public static Order reconstitute(
			TenantId tenantId,
			OrderId id,
			String orderNumber,
			OrderSourceType sourceType,
			OrderPricingMode pricingMode,
			UUID accountId,
			UUID contactId,
			UUID opportunityId,
			UUID quoteId,
			UUID priceBookId,
			UUID ownerUserId,
			UUID ownerTeamId,
			OrderStatus status,
			OrderAmounts amounts,
			OrderAddressSnapshot billingAddressSnapshot,
			OrderAddressSnapshot shippingAddressSnapshot,
			List<OrderLine> lines,
			LocalDate orderDate,
			LocalDate requestedDeliveryDate,
			String customerReference,
			String paymentTerms,
			String deliveryTerms,
			String notes,
			Instant confirmedAt,
			ActorId confirmedBy,
			Instant fulfilledAt,
			Instant cancelledAt,
			ActorId cancelledBy,
			String cancellationReason,
			Instant closedAt,
			ActorId closedBy,
			String closedReason,
			Instant createdAt,
			ActorId createdBy,
			Instant updatedAt,
			ActorId updatedBy,
			long version) {
		return new Order(
				tenantId, id, orderNumber, sourceType, pricingMode,
				accountId, contactId, opportunityId, quoteId, priceBookId,
				ownerUserId, ownerTeamId, status, amounts,
				billingAddressSnapshot, shippingAddressSnapshot, lines,
				orderDate, requestedDeliveryDate, customerReference,
				paymentTerms, deliveryTerms, notes,
				confirmedAt, confirmedBy, fulfilledAt,
				cancelledAt, cancelledBy, cancellationReason,
				closedAt, closedBy, closedReason,
				createdAt, createdBy, updatedAt, updatedBy, version
		);
	}

	public void saveDraft(
			UUID accountId,
			UUID contactId,
			UUID opportunityId,
			UUID priceBookId,
			UUID ownerUserId,
			UUID ownerTeamId,
			OrderAddressSnapshot billingAddressSnapshot,
			OrderAddressSnapshot shippingAddressSnapshot,
			LocalDate orderDate,
			LocalDate requestedDeliveryDate,
			String customerReference,
			String paymentTerms,
			String deliveryTerms,
			String notes,
			BigDecimal shippingTotal,
			List<OrderLine> newLines,
			ActorId actorId,
			Instant now,
			long expectedVersion) {
		checkVersion(expectedVersion);
		if (this.status != OrderStatus.DRAFT) {
			throw new IllegalStateException("Order can only be modified in DRAFT status");
		}
		this.accountId = Objects.requireNonNull(accountId, "accountId must not be null");
		this.contactId = contactId;
		this.opportunityId = opportunityId;
		this.priceBookId = priceBookId;
		this.ownerUserId = ownerUserId;
		this.ownerTeamId = ownerTeamId;
		this.billingAddressSnapshot = billingAddressSnapshot != null ? billingAddressSnapshot : this.billingAddressSnapshot;
		this.shippingAddressSnapshot = shippingAddressSnapshot != null ? shippingAddressSnapshot : this.shippingAddressSnapshot;
		this.orderDate = orderDate != null ? orderDate : this.orderDate;
		this.requestedDeliveryDate = requestedDeliveryDate;
		this.customerReference = trimToNull(customerReference);
		this.paymentTerms = trimToNull(paymentTerms);
		this.deliveryTerms = trimToNull(deliveryTerms);
		this.notes = trimToNull(notes);

		if (newLines != null) {
			this.lines = new ArrayList<>(newLines);
		}
		this.updatedBy = actorId;
		this.updatedAt = now;
		this.version++;
	}

	public void confirm(ActorId actorId, Instant now, long expectedVersion) {
		checkVersion(expectedVersion);
		if (this.status != OrderStatus.DRAFT) {
			throw new IllegalStateException("Only DRAFT orders can be confirmed");
		}
		if (this.lines.isEmpty()) {
			throw new IllegalStateException("Cannot confirm an order without order lines");
		}
		this.status = OrderStatus.CONFIRMED;
		this.confirmedAt = now;
		this.confirmedBy = actorId;
		this.updatedBy = actorId;
		this.updatedAt = now;
		this.version++;
	}

	public void startProcessing(ActorId actorId, Instant now, long expectedVersion) {
		checkVersion(expectedVersion);
		if (this.status != OrderStatus.CONFIRMED) {
			throw new IllegalStateException("Only CONFIRMED orders can start processing");
		}
		this.status = OrderStatus.PROCESSING;
		this.updatedBy = actorId;
		this.updatedAt = now;
		this.version++;
	}

	public void applyDerivedFulfillmentStatus(OrderStatus newStatus, ActorId actorId, Instant now) {
		if (this.status == OrderStatus.CANCELLED || this.status == OrderStatus.CLOSED_PARTIAL) {
			throw new IllegalStateException("Cannot apply fulfillment to a terminal order");
		}
		this.status = newStatus;
		if (newStatus == OrderStatus.FULFILLED) {
			this.fulfilledAt = now;
		} else {
			this.fulfilledAt = null;
		}
		this.updatedBy = actorId;
		this.updatedAt = now;
		this.version++;
	}

	public void closeRemaining(String reason, ActorId actorId, Instant now, long expectedVersion) {
		checkVersion(expectedVersion);
		if (this.status != OrderStatus.PARTIALLY_FULFILLED && this.status != OrderStatus.PROCESSING) {
			throw new IllegalStateException("Only PROCESSING or PARTIALLY_FULFILLED orders can be closed with remainder");
		}
		this.status = OrderStatus.CLOSED_PARTIAL;
		this.closedReason = Objects.requireNonNull(trimToNull(reason), "Closing reason must not be blank");
		this.closedAt = now;
		this.closedBy = actorId;
		this.updatedBy = actorId;
		this.updatedAt = now;
		this.version++;
	}

	public void cancel(String reason, ActorId actorId, Instant now, long expectedVersion) {
		checkVersion(expectedVersion);
		if (this.status == OrderStatus.FULFILLED || this.status == OrderStatus.CLOSED_PARTIAL || this.status == OrderStatus.CANCELLED) {
			throw new IllegalStateException("Terminal order cannot be cancelled");
		}
		this.status = OrderStatus.CANCELLED;
		this.cancellationReason = Objects.requireNonNull(trimToNull(reason), "Cancellation reason must not be blank");
		this.cancelledAt = now;
		this.cancelledBy = actorId;
		this.updatedBy = actorId;
		this.updatedAt = now;
		this.version++;
	}

	public void updateAmounts(OrderAmounts amounts) {
		this.amounts = Objects.requireNonNull(amounts, "amounts must not be null");
	}

	public BigDecimal calculateFulfilledProgressPercent() {
		if (lines.isEmpty()) return BigDecimal.ZERO;
		BigDecimal totalOrdered = BigDecimal.ZERO;
		BigDecimal totalFulfilled = BigDecimal.ZERO;
		for (OrderLine line : lines) {
			totalOrdered = totalOrdered.add(line.quantity());
			totalFulfilled = totalFulfilled.add(line.fulfilledQuantity());
		}
		if (totalOrdered.compareTo(BigDecimal.ZERO) <= 0) return BigDecimal.ZERO;
		return totalFulfilled.multiply(BigDecimal.valueOf(100)).divide(totalOrdered, 2, BigDecimal.ROUND_HALF_UP);
	}

	public List<OrderAction> getAvailableActions() {
		List<OrderAction> actions = new ArrayList<>();
		switch (this.status) {
			case DRAFT -> {
				actions.add(OrderAction.EDIT_DRAFT);
				actions.add(OrderAction.CONFIRM);
				actions.add(OrderAction.CANCEL);
				actions.add(OrderAction.DELETE_DRAFT);
			}
			case CONFIRMED -> {
				actions.add(OrderAction.START_PROCESSING);
				actions.add(OrderAction.CANCEL);
			}
			case PROCESSING -> {
				actions.add(OrderAction.RECORD_FULFILLMENT);
				actions.add(OrderAction.CLOSE_REMAINING);
				actions.add(OrderAction.CANCEL);
			}
			case PARTIALLY_FULFILLED -> {
				actions.add(OrderAction.RECORD_FULFILLMENT);
				actions.add(OrderAction.VOID_FULFILLMENT);
				actions.add(OrderAction.CLOSE_REMAINING);
			}
			case FULFILLED -> {
				actions.add(OrderAction.VOID_FULFILLMENT);
			}
			case CLOSED_PARTIAL, CANCELLED -> {
				// Terminal states
			}
		}
		return Collections.unmodifiableList(actions);
	}

	private void checkVersion(long expectedVersion) {
		if (this.version != expectedVersion) {
			throw new IllegalStateException("Order version mismatch: expected " + expectedVersion + " but found " + this.version);
		}
	}

	private static String validateOrderNumber(String value) {
		Objects.requireNonNull(value, "orderNumber must not be null");
		String trimmed = value.trim();
		if (trimmed.isEmpty()) {
			throw new IllegalArgumentException("orderNumber must not be blank");
		}
		return trimmed;
	}

	private static String trimToNull(String value) {
		if (value == null) return null;
		String trimmed = value.trim();
		return trimmed.isEmpty() ? null : trimmed;
	}

	// Getters
	public TenantId tenantId() { return tenantId; }
	public OrderId id() { return id; }
	public String orderNumber() { return orderNumber; }
	public OrderSourceType sourceType() { return sourceType; }
	public OrderPricingMode pricingMode() { return pricingMode; }
	public UUID accountId() { return accountId; }
	public UUID contactId() { return contactId; }
	public UUID opportunityId() { return opportunityId; }
	public UUID quoteId() { return quoteId; }
	public UUID priceBookId() { return priceBookId; }
	public UUID ownerUserId() { return ownerUserId; }
	public UUID ownerTeamId() { return ownerTeamId; }
	public OrderStatus status() { return status; }
	public OrderAmounts amounts() { return amounts; }
	public OrderAddressSnapshot billingAddressSnapshot() { return billingAddressSnapshot; }
	public OrderAddressSnapshot shippingAddressSnapshot() { return shippingAddressSnapshot; }
	public List<OrderLine> lines() { return Collections.unmodifiableList(lines); }
	public LocalDate orderDate() { return orderDate; }
	public LocalDate requestedDeliveryDate() { return requestedDeliveryDate; }
	public String customerReference() { return customerReference; }
	public String paymentTerms() { return paymentTerms; }
	public String deliveryTerms() { return deliveryTerms; }
	public String notes() { return notes; }
	public Instant confirmedAt() { return confirmedAt; }
	public ActorId confirmedBy() { return confirmedBy; }
	public Instant fulfilledAt() { return fulfilledAt; }
	public Instant cancelledAt() { return cancelledAt; }
	public ActorId cancelledBy() { return cancelledBy; }
	public String cancellationReason() { return cancellationReason; }
	public Instant closedAt() { return closedAt; }
	public ActorId closedBy() { return closedBy; }
	public String closedReason() { return closedReason; }
	public Instant createdAt() { return createdAt; }
	public ActorId createdBy() { return createdBy; }
	public Instant updatedAt() { return updatedAt; }
	public ActorId updatedBy() { return updatedBy; }
	public long version() { return version; }

}
