package com.crm.customer.contact.presentation.web;

import jakarta.validation.constraints.NotNull;

public record SetPrimaryContactRequest(
		boolean isPrimary,
		@NotNull Long version
) {}
