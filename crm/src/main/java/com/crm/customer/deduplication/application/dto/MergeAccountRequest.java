package com.crm.customer.deduplication.application.dto;

import java.util.Map;
import java.util.UUID;

public record MergeAccountRequest(
		UUID sourceAccountId,
		UUID targetAccountId,
		Map<String, String> selectedFields
) {}
