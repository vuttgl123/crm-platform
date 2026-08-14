package com.crm.customer.activity.presentation.web;

import jakarta.validation.constraints.Size;

public record CompleteActivityRequest(
		@Size(max = 191) String outcomeCode) {
}
