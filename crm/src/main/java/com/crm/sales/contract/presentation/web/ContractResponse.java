package com.crm.sales.contract.presentation.web;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

import com.crm.sales.contract.domain.ContractStatus;
import com.crm.sales.contract.domain.ContractType;

public record ContractResponse(
		UUID id,
		String contractNumber,
		UUID accountId,
		UUID contactId,
		UUID opportunityId,
		UUID quoteId,
		UUID orderId,
		UUID ownerUserId,
		ContractType contractType,
		ContractStatus status,
		String currencyCode,
		BigDecimal contractValue,
		LocalDate effectiveFrom,
		LocalDate effectiveTo,
		boolean autoRenew,
		Integer renewalNoticeDays,
		Instant signedAt,
		Instant terminatedAt,
		String terminationReason,
		String documentReference,
		String termsSnapshot,
		UUID createdBy,
		Instant createdAt,
		UUID updatedBy,
		Instant updatedAt,
		long version
) {
}
