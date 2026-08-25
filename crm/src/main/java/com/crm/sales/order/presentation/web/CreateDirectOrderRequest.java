package com.crm.sales.order.presentation.web;

import java.time.LocalDate;
import java.util.UUID;
import jakarta.validation.constraints.NotNull;

public record CreateDirectOrderRequest(
		@NotNull UUID accountId,
		UUID contactId,
		UUID opportunityId,
		UUID priceBookId,
		String ownerType,
		UUID ownerId,
		String currencyCode,
		OrderAddressSnapshotRequest billingAddressSnapshot,
		OrderAddressSnapshotRequest shippingAddressSnapshot,
		LocalDate orderDate,
		LocalDate requestedDeliveryDate,
		String customerReference,
		String paymentTerms,
		String deliveryTerms,
		String notes
) {}
