package com.crm.foundation.security;

import java.util.UUID;

public record ResolvedDataScope(
		DataScopeType type,
		UUID teamId) {
}
