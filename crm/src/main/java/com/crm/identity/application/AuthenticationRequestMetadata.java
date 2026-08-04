package com.crm.identity.application;

public record AuthenticationRequestMetadata(
		String ipAddress,
		String userAgent) {
}
