package com.crm.customer.contact.presentation.web;

import java.util.UUID;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.PositiveOrZero;
import com.crm.customer.account.domain.AccountOwnerType;
import com.crm.customer.contact.domain.ContactLifecycleStage;

public record ContactSearchRequest(
		String q,
		UUID accountId,
		ContactLifecycleStage lifecycleStage,
		AccountOwnerType ownerType,
		UUID ownerId,
		@PositiveOrZero @Min(0) Integer page,
		@PositiveOrZero @Min(1) @Max(100) Integer size) {
}
