package com.crm.platform.settings.presentation.web;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdateProfileRequest(
		@NotBlank @Size(max = 255) String tenantName,
		@Size(max = 255) String legalName,
		@Size(max = 50) String taxCode,
		@Email @Size(max = 320) String contactEmail,
		@Size(max = 50) String contactPhone,
		@Size(max = 500) String address,
		@Size(max = 255) String website,
		@Size(max = 500) String logoUrl
) {}
