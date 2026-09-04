package com.crm.customer.lead.presentation.web;

import java.util.List;
import java.util.UUID;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

public record BulkChangeLeadStatusRequest(
		@NotEmpty List<UUID> leadIds,
		@NotNull UUID statusId
) {}
