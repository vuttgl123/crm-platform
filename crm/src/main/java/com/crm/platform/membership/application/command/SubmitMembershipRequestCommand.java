package com.crm.platform.membership.application.command;

public record SubmitMembershipRequestCommand(
		String tenantCode,
		String message) {
}
