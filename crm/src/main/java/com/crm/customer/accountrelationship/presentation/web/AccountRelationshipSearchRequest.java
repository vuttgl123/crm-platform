package com.crm.customer.accountrelationship.presentation.web;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

public record AccountRelationshipSearchRequest(
		@Min(0) Integer page,
		@Min(1) @Max(100) Integer size) {
}
