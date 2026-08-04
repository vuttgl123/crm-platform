package com.crm.identity.presentation.web;

import java.util.UUID;

public record UserResponse(
		UUID id,
		String email,
		String displayName) {
}
