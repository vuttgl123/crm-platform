package com.crm.platform.membership.application.dto;

import java.util.Objects;

import com.crm.sharedkernel.domain.ActorId;

public record UserReference(
		ActorId id,
		String email,
		String displayName) {

	public UserReference {
		Objects.requireNonNull(id, "id must not be null");
		Objects.requireNonNull(email, "email must not be null");
		Objects.requireNonNull(displayName, "displayName must not be null");
	}

}
