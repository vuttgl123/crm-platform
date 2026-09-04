package com.crm.customer.contact.presentation.web;

import java.util.List;
import java.util.UUID;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;

public record BulkUpdateContactLifecycleRequest(
		@NotEmpty List<UUID> contactIds,
		@NotBlank String lifecycleStage
) {}
