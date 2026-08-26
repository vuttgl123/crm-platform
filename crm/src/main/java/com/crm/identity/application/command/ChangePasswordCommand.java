package com.crm.identity.application.command;

public record ChangePasswordCommand(String currentPassword,
		String newPassword) {
}
