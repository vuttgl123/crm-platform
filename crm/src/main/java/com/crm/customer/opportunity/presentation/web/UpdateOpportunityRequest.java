package com.crm.customer.opportunity.presentation.web;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import com.crm.customer.account.domain.AccountOwnerType;
import com.crm.customer.opportunity.domain.OpportunityStatus;
import com.crm.customer.opportunity.domain.OpportunityType;

public record UpdateOpportunityRequest(
		@NotNull @Positive Long version,
		@NotBlank @Size(max = 255) String name,
		@NotNull UUID accountId,
		@NotNull UUID pipelineId,
		@NotNull UUID currentStageId,
		@Valid Owner owner,
		UUID sourceId,
		UUID primaryContactId,
		OpportunityType opportunityType,
		OpportunityStatus status,
		@Valid @NotNull Amount amount,
		@DecimalMin("0.0") BigDecimal probability,
		LocalDate expectedCloseDate,
		LocalDate actualCloseDate,
		@Size(max = 255) String nextStep,
		String description,
		UUID lostReasonId,
		@Size(max = 255) String lostReasonNotes,
		UUID campaignId) {

	public record Owner(
			@NotNull AccountOwnerType type,
			@NotNull UUID id) {
	}

	public record Amount(
			@NotNull @DecimalMin("0.0") @Digits(integer = 14, fraction = 6) BigDecimal amount,
			@NotBlank @Pattern(regexp = "^[A-Z]{3}$") String currencyCode) {
	}

}
