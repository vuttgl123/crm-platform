package com.crm.customer.lead.presentation.web;

import java.util.UUID;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.PositiveOrZero;
import com.crm.customer.account.domain.AccountOwnerType;
import com.crm.customer.lead.domain.LeadRating;

public record LeadSearchRequest(
		String q,
		UUID statusId,
		UUID sourceId,
		LeadRating rating,
		AccountOwnerType ownerType,
		UUID ownerId,
		Boolean converted,
		@PositiveOrZero @Min(0) Integer page,
		@PositiveOrZero @Min(1) @Max(100) Integer size) {
}
