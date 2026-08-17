package com.crm.sales.contract.application.command;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

import com.crm.sales.contract.domain.ContractId;
import com.crm.sales.contract.domain.ContractType;

public record UpdateContractCommand(
		ContractId id,
		long version,
		UUID accountId,
		UUID contactId,
		UUID opportunityId,
		UUID quoteId,
		UUID orderId,
		UUID ownerUserId,
		ContractType contractType,
		String currencyCode,
		BigDecimal contractValue,
		LocalDate effectiveFrom,
		LocalDate effectiveTo,
		Boolean autoRenew,
		Integer renewalNoticeDays,
		String documentReference,
		String termsSnapshot
) {
}
