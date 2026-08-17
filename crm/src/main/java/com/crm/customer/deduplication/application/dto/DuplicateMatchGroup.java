package com.crm.customer.deduplication.application.dto;

import java.util.List;

public record DuplicateMatchGroup(
		String matchReason,
		Integer confidenceScore,
		String matchValue,
		List<DuplicateAccountSummary> accounts
) {}
