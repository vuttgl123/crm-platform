package com.crm.platform.tenant.presentation.web;

import com.crm.foundation.mapping.CrmMapperConfig;
import com.crm.platform.tenant.application.command.BootstrapTenantCommand;
import com.crm.platform.tenant.application.dto.TenantDetails;
import org.mapstruct.Mapper;

@Mapper(config = CrmMapperConfig.class)
public interface TenantWebMapper {

	BootstrapTenantCommand toCommand(BootstrapTenantRequest request);

	TenantResponse toResponse(TenantDetails details);

}
