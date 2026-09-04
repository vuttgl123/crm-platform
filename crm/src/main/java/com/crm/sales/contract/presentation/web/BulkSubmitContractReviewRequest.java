package com.crm.sales.contract.presentation.web;

import java.util.List;
import java.util.UUID;

import jakarta.validation.constraints.NotEmpty;

public record BulkSubmitContractReviewRequest(
		@NotEmpty List<UUID> contractIds
) {}
