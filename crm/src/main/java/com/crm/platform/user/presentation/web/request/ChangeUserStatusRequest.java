package com.crm.platform.user.presentation.web.request;

import jakarta.validation.constraints.NotNull;
import com.crm.platform.user.domain.PlatformUserStatus;

public record ChangeUserStatusRequest(
		@NotNull PlatformUserStatus status
) {}
