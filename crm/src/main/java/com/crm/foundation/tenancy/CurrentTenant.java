package com.crm.foundation.tenancy;

import java.util.Optional;

import com.crm.sharedkernel.domain.TenantId;

public interface CurrentTenant {

	Optional<TenantId> tenantId();

	default TenantId requireTenantId() {
		return tenantId().orElseThrow(MissingTenantContextException::new);
	}

}
