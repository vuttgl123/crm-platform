package com.crm.identity.domain;

import com.crm.sharedkernel.domain.exception.ErrorCode;

public enum AuthenticationErrorCode implements ErrorCode {

	INVALID_CREDENTIALS("INVALID_CREDENTIALS", "auth.invalid_credentials"),
	INVALID_REFRESH_TOKEN("INVALID_REFRESH_TOKEN", "auth.invalid_refresh_token"),
	REFRESH_TOKEN_REUSED("REFRESH_TOKEN_REUSED", "auth.refresh_token_reused"),
	EMAIL_ALREADY_REGISTERED("EMAIL_ALREADY_REGISTERED", "auth.email_already_registered"),
	SELF_REGISTRATION_DISABLED("SELF_REGISTRATION_DISABLED", "auth.self_registration_disabled"),
	EXTERNAL_EMAIL_NOT_VERIFIED("EXTERNAL_EMAIL_NOT_VERIFIED", "auth.external_email_not_verified"),
	EXTERNAL_IDENTITY_LINK_REQUIRED("EXTERNAL_IDENTITY_LINK_REQUIRED", "auth.external_identity_link_required"),
	OAUTH2_LOGIN_FAILED("OAUTH2_LOGIN_FAILED", "auth.oauth2_login_failed"),
	ACCOUNT_LOCKED("ACCOUNT_LOCKED", "auth.account_locked"),
	PASSWORD_RESET_TOKEN_INVALID("PASSWORD_RESET_TOKEN_INVALID",
			"auth.password_reset_token_invalid"),
	PASSWORD_RESET_TOKEN_EXPIRED("PASSWORD_RESET_TOKEN_EXPIRED",
			"auth.password_reset_token_expired"),
	WEAK_PASSWORD("WEAK_PASSWORD", "auth.weak_password");

	private final String value;
	private final String messageKey;

	AuthenticationErrorCode(String value, String messageKey) {
		this.value = value;
		this.messageKey = messageKey;
	}

	@Override
	public String value() {
		return value;
	}

	@Override
	public String messageKey() {
		return messageKey;
	}

}
