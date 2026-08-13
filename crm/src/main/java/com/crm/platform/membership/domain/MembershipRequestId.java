package com.crm.platform.membership.domain;

import java.util.Objects;
import java.util.UUID;

public record MembershipRequestId(UUID value) {

	public MembershipRequestId {
		Objects.requireNonNull(value, "value must not be null");
	}

	public static MembershipRequestId from(String value) {
		return new MembershipRequestId(UUID.fromString(Objects.requireNonNull(
				value, "value must not be null")));
	}

	@Override
	public String toString() {
		return value.toString();
	}

}
