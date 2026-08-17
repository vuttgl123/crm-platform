package com.crm.sales.contract.application.command;

import java.time.Instant;

import com.crm.sales.contract.domain.ContractId;

public record SignContractCommand(
		ContractId id,
		long version,
		Instant signedAt
) {
}
