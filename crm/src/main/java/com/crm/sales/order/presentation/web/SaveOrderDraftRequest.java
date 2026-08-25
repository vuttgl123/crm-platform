package com.crm.sales.order.presentation.web;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import jakarta.validation.constraints.NotNull;

public record SaveOrderDraftRequest(
		@NotNull UUID accountId,
		UUID contactId,
		UUID opportunityId,
		UUID priceBookId,
		String ownerType,
		UUID ownerId,
		OrderAddressSnapshotRequest billingAddressSnapshot,
		OrderAddressSnapshotRequest shippingAddressSnapshot,
		LocalDate orderDate,
		LocalDate requestedDeliveryDate,
		String customerReference,
		String paymentTerms,
		String deliveryTerms,
		String notes,
		BigDecimal shippingTotal,
		List<OrderLineInputRequest> lines
) {}
