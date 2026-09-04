package com.crm.platform.user.presentation.web.request;

import java.util.UUID;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import com.crm.platform.user.domain.PlatformUserStatus;

public record TenantUserSearchRequest(
		String query,
		PlatformUserStatus status,
		UUID roleId,
		UUID teamId,
		@Min(0) Integer page,
		@Min(1) @Max(100) Integer size
) {
	public int resolvePage() {
		return page != null ? page : 0;
	}

	public int resolveSize() {
		return size != null ? size : 20;
	}
}
