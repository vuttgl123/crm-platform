package com.crm.customer.opportunity.presentation.web;

import java.util.UUID;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CloseLostRequest(
		UUID lostReasonId,
		@Size(max = 1000) String competitorNotes,
		@NotNull Long version
) {}
