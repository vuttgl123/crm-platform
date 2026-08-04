package com.crm.foundation.tenancy;

import java.util.Optional;

import com.crm.sharedkernel.domain.TenantId;
import org.springframework.stereotype.Component;

@Component
public final class ThreadLocalCurrentTenant implements CurrentTenant {

	@Override
	public Optional<TenantId> tenantId() {
		return TenantContext.currentTenantId();
	}

}
