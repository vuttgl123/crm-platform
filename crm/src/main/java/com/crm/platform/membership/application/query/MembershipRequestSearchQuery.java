package com.crm.platform.membership.application.query;

import java.util.Objects;

import com.crm.platform.membership.domain.MembershipRequestStatus;
import com.crm.sharedkernel.application.PageQuery;

public record MembershipRequestSearchQuery(
		MembershipRequestStatus status,
		PageQuery pageQuery) {

	public MembershipRequestSearchQuery {
		Objects.requireNonNull(status, "status must not be null");
		Objects.requireNonNull(pageQuery, "pageQuery must not be null");
	}

}
