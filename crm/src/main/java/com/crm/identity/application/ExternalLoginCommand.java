package com.crm.identity.application;

import com.crm.identity.domain.ExternalProvider;

public record ExternalLoginCommand(
		ExternalProvider provider,
		String issuer,
		String subject,
		String email,
		boolean emailVerified,
		String displayName) {
}
