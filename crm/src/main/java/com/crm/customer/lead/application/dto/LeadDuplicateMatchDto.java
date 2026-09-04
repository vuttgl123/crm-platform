package com.crm.customer.lead.application.dto;

import java.util.UUID;

public record LeadDuplicateMatchDto(
		UUID id,
		String leadNumber,
		String title,
		String fullName,
		String email,
		String phone,
		String companyName,
		String matchReason
) {}
