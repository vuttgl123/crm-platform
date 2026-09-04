package com.crm.sales.contract.application.command;

import java.math.BigDecimal;
import java.time.LocalDate;

import com.crm.sales.contract.domain.ContractId;

public record RenewContractCommand(
		ContractId id,
		String newContractNumber,
		LocalDate effectiveFrom,
		LocalDate effectiveTo,
		BigDecimal contractValue,
		Boolean autoRenew,
		long expectedVersion
) {}
