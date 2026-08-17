package com.crm.sales.contract.presentation.web;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

import com.crm.sales.contract.domain.ContractStatus;
import com.crm.sales.contract.domain.ContractType;

public record ContractSummaryResponse(
		UUID id,
		String contractNumber,
		UUID accountId,
		String accountName,
		UUID contactId,
		String contactName,
		ContractType contractType,
		ContractStatus status,
		String currencyCode,
		BigDecimal contractValue,
		LocalDate effectiveFrom,
		LocalDate effectiveTo,
		boolean autoRenew,
		Instant signedAt,
		Instant updatedAt,
		long version
) {
}
