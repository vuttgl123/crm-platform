package com.crm.sales.contract.application.dto;

import java.math.BigDecimal;

public record ContractStatsDto(
		long totalContracts,
		long draftContracts,
		long inReviewContracts,
		long approvedContracts,
		long activeContracts,
		long expiringSoonContracts,
		long terminatedContracts,
		BigDecimal totalActiveValue
) {}
