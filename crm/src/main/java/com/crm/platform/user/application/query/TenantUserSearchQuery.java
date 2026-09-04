package com.crm.platform.user.application.query;

import java.util.UUID;

import com.crm.platform.user.domain.PlatformUserStatus;
import com.crm.sharedkernel.application.PageQuery;

public record TenantUserSearchQuery(
		String query,
		PlatformUserStatus status,
		UUID roleId,
		UUID teamId,
		PageQuery pageQuery
) {}
