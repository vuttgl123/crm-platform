package com.crm.platform.settings.presentation.web;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AddIpWhitelistRequest(
		@NotBlank @Size(max = 64) String cidrBlock,
		@Size(max = 255) String description
) {}
