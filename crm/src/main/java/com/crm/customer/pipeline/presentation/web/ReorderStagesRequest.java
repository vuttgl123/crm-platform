package com.crm.customer.pipeline.presentation.web;

import java.util.List;
import java.util.UUID;

import jakarta.validation.constraints.NotEmpty;

public record ReorderStagesRequest(
		@NotEmpty List<UUID> orderedStageIds
) {}
