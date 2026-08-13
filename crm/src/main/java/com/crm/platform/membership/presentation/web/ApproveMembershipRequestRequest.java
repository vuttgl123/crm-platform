package com.crm.platform.membership.presentation.web;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.UUID;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public record ApproveMembershipRequestRequest(
		@NotNull @Positive Long version,
		@NotEmpty @Size(max = 20) List<@NotNull UUID> roleIds,
		@Size(max = 2000) String reviewNote) {

	public ApproveMembershipRequestRequest {
		roleIds = roleIds == null ? null
				: Collections.unmodifiableList(new ArrayList<>(roleIds));
		reviewNote = normalizeOptional(reviewNote);
	}

	@AssertTrue
	public boolean isRoleIdsDistinct() {
		return roleIds == null
				|| new HashSet<>(roleIds).size() == roleIds.size();
	}

	private static String normalizeOptional(String value) {
		if (value == null) {
			return null;
		}
		String normalized = value.trim();
		return normalized.isEmpty() ? null : normalized;
	}

}
