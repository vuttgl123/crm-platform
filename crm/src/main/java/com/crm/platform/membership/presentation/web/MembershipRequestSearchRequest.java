package com.crm.platform.membership.presentation.web;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import com.crm.platform.membership.domain.MembershipRequestStatus;

public record MembershipRequestSearchRequest(
		MembershipRequestStatus status,
		@Min(0) Integer page,
		@Min(1) @Max(100) Integer size) {
}
