package com.crm.platform.user.application.command;

import java.util.UUID;

import com.crm.platform.user.domain.PlatformUserStatus;

public record ChangeUserStatusCommand(
		UUID userId,
		PlatformUserStatus status
) {}
