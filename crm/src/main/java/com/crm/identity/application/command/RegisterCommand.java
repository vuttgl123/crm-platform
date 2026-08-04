package com.crm.identity.application.command;

public record RegisterCommand(
		String email,
		String password,
		String displayName) {
}
