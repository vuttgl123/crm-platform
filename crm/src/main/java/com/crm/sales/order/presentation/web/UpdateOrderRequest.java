package com.crm.sales.order.presentation.web;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import com.crm.sales.order.domain.OrderStatus;

public record UpdateOrderRequest(
		@NotNull @Positive Long version,
		@NotNull UUID accountId,
		UUID contactId,
		UUID opportunityId,
		UUID quoteId,
		UUID ownerUserId,
		OrderStatus status,
		@Valid @NotNull Amounts amounts,
		LocalDate orderDate,
		LocalDate requestedDeliveryDate,
		@Size(max = 191) String customerReference) {

	public record Amounts(
			@Pattern(regexp = "^[A-Z]{3}$") String currencyCode,
			@DecimalMin("0.0") @Digits(integer = 14, fraction = 6) BigDecimal subtotal,
			@DecimalMin("0.0") @Digits(integer = 14, fraction = 6) BigDecimal discountTotal,
			@DecimalMin("0.0") @Digits(integer = 14, fraction = 6) BigDecimal taxTotal,
			@DecimalMin("0.0") @Digits(integer = 14, fraction = 6) BigDecimal shippingTotal) {
	}

}
