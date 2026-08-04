package com.crm.identity.application.command;

public record AuthenticationRequestMetadata(
		String ipAddress,
		String userAgent) {
}
