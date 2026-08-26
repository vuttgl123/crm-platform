package com.crm.identity.application.command;

public record ResetPasswordCommand(String rawToken, String newPassword) {
}
