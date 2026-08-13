package com.crm.platform.membership.application.command;

import java.util.Objects;

import com.crm.platform.membership.domain.MembershipRequestId;

public record RejectMembershipRequestCommand(
		MembershipRequestId requestId,
		long version,
		String reason) {

	public RejectMembershipRequestCommand {
		Objects.requireNonNull(requestId, "requestId must not be null");
		if (version < 1L) {
			throw new IllegalArgumentException("version must be positive");
		}
	}

}
