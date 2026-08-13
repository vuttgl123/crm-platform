package com.crm.platform.membership.application.command;

import java.util.List;
import java.util.Objects;
import java.util.UUID;

import com.crm.platform.membership.domain.MembershipRequestId;

public record ApproveMembershipRequestCommand(
		MembershipRequestId requestId,
		long version,
		List<UUID> roleIds,
		String reviewNote) {

	public ApproveMembershipRequestCommand {
		Objects.requireNonNull(requestId, "requestId must not be null");
		if (version < 1L) {
			throw new IllegalArgumentException("version must be positive");
		}
		roleIds = List.copyOf(Objects.requireNonNull(
				roleIds, "roleIds must not be null"));
	}

}
