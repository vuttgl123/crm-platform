package com.crm.sales.order.application.command;

import java.time.LocalDate;
import java.util.UUID;
import com.crm.sales.order.domain.OrderAddressSnapshot;

public record CreateDirectOrderCommand(
		UUID accountId,
		UUID contactId,
		UUID opportunityId,
		UUID priceBookId,
		String ownerType,
		UUID ownerId,
		String currencyCode,
		OrderAddressSnapshot billingAddressSnapshot,
		OrderAddressSnapshot shippingAddressSnapshot,
		LocalDate orderDate,
		LocalDate requestedDeliveryDate,
		String customerReference,
		String paymentTerms,
		String deliveryTerms,
		String notes
) {}
