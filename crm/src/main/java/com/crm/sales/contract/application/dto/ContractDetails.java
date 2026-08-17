package com.crm.sales.contract.application.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

import com.crm.sales.contract.domain.Contract;
import com.crm.sales.contract.domain.ContractStatus;
import com.crm.sales.contract.domain.ContractType;

public record ContractDetails(
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

	public static ContractDetails from(Contract contract) {
		return new ContractDetails(
				contract.id().value(),
				contract.contractNumber(),
				contract.accountId().value(),
				contract.contactId() != null ? contract.contactId().value() : null,
				contract.opportunityId() != null ? contract.opportunityId().value() : null,
				contract.quoteId() != null ? contract.quoteId().value() : null,
				contract.orderId() != null ? contract.orderId().value() : null,
				contract.ownerUserId() != null ? contract.ownerUserId().value() : null,
				contract.contractType(),
				contract.status(),
				contract.currencyCode(),
				contract.contractValue(),
				contract.effectiveFrom(),
				contract.effectiveTo(),
				contract.autoRenew(),
				contract.renewalNoticeDays(),
				contract.signedAt(),
				contract.terminatedAt(),
				contract.terminationReason(),
				contract.documentReference(),
				contract.termsSnapshot(),
				contract.auditInfo().createdBy() != null ? contract.auditInfo().createdBy().value() : null,
				contract.auditInfo().createdAt(),
				contract.auditInfo().updatedBy() != null ? contract.auditInfo().updatedBy().value() : null,
				contract.auditInfo().updatedAt(),
				contract.version()
		);
	}

}
