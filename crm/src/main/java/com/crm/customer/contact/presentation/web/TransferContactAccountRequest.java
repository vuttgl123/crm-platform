package com.crm.customer.contact.presentation.web;

import java.util.UUID;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record TransferContactAccountRequest(
		@NotNull UUID newAccountId,
		@Size(max = 100) String jobTitle,
		@NotNull Long version
) {}
