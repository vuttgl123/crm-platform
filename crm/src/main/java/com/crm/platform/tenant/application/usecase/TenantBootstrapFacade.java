package com.crm.platform.tenant.application.usecase;

import com.crm.platform.tenant.application.command.BootstrapTenantCommand;
import com.crm.platform.tenant.application.dto.TenantDetails;

public interface TenantBootstrapFacade {

	TenantDetails bootstrap(BootstrapTenantCommand command);

}
