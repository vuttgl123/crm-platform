package com.crm.sales.contract.application.command;

import com.crm.sales.contract.domain.ContractId;

public record TerminateContractCommand(
		ContractId id,
		long version,
		String terminationReason
) {
}
