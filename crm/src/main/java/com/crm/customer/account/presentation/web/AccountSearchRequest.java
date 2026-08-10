package com.crm.customer.account.presentation.web;

import java.util.UUID;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import com.crm.customer.account.domain.AccountLifecycleStage;
import com.crm.customer.account.domain.AccountOwnerType;
import com.crm.customer.account.domain.AccountType;

public record AccountSearchRequest(
		@Size(max = 255) String q,
		AccountType accountType,
		AccountLifecycleStage lifecycleStage,
		AccountOwnerType ownerType,
		UUID ownerId,
		@Min(0) Integer page,
		@Min(1) @Max(100) Integer size) {

	@AssertTrue
	public boolean isOwnerFilterComplete() {
		return (ownerType == null) == (ownerId == null);
	}

}
