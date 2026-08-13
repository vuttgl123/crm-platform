package com.crm.platform.membership.presentation.web;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.UUID;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record UpdateUserRolesRequest(
		@NotEmpty @Size(max = 20) List<@NotNull UUID> roleIds) {

	public UpdateUserRolesRequest {
		roleIds = roleIds == null ? null
				: Collections.unmodifiableList(new ArrayList<>(roleIds));
	}

	@AssertTrue
	public boolean isRoleIdsDistinct() {
		return roleIds == null
				|| new HashSet<>(roleIds).size() == roleIds.size();
	}

}
