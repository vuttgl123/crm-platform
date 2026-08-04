package com.crm.identity.infrastructure.web;

import java.util.UUID;

import com.crm.identity.domain.UserAccount;

public record UserResponse(
		UUID id,
		String email,
		String displayName) {

	public static UserResponse from(UserAccount user) {
		return new UserResponse(user.id(), user.email(), user.displayName());
	}

}
