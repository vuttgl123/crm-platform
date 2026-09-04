package com.crm.platform.settings.application.dto;

import java.time.Instant;
import java.util.UUID;

public record IpWhitelistRuleDto(
		UUID id,
		String cidrBlock,
		String description,
		boolean active,
		Instant createdAt,
		UUID createdBy
) {}
