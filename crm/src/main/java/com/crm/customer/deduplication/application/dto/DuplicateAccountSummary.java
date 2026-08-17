package com.crm.customer.deduplication.application.dto;

import java.util.UUID;

public record DuplicateAccountSummary(
		UUID id,
		String accountNumber,
		String displayName,
		String legalName,
		String taxIdentifier,
		String phone,
		String email,
		String lifecycleStage,
		String updatedAt
) {}
