package com.crm.identity.application.command;

public record LoginCommand(
		String email,
		String password) {
}
