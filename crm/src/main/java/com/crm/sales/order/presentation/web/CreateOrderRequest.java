package com.crm.sales.order.presentation.web;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record CreateOrderRequest(
		@NotBlank @Size(max = 191) String orderNumber,
		@NotNull UUID accountId,
		UUID contactId,
		UUID opportunityId,
		UUID quoteId,
		UUID ownerUserId,
		@Valid @NotNull Amounts amounts,
		LocalDate orderDate,
		LocalDate requestedDeliveryDate,
		@Size(max = 191) String customerReference) {

	public record Amounts(
			@NotBlank @Pattern(regexp = "^[A-Z]{3}$") String currencyCode,
			@DecimalMin("0.0") @Digits(integer = 14, fraction = 6) BigDecimal subtotal,
			@DecimalMin("0.0") @Digits(integer = 14, fraction = 6) BigDecimal discountTotal,
			@DecimalMin("0.0") @Digits(integer = 14, fraction = 6) BigDecimal taxTotal,
			@DecimalMin("0.0") @Digits(integer = 14, fraction = 6) BigDecimal shippingTotal) {
	}

}
