package com.crm.platform.team.application.port;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import com.crm.platform.team.application.dto.RoleDataScopeDetails;
import com.crm.platform.team.domain.RoleDataScope;
import com.crm.platform.team.domain.RoleDataScopeId;
import com.crm.sharedkernel.domain.TenantId;

public interface RoleDataScopeRepository {

	Optional<RoleDataScope> findById(TenantId tenantId, RoleDataScopeId id);

	List<RoleDataScopeDetails> findByRoleId(TenantId tenantId, UUID roleId);

	void insert(RoleDataScope scope);

	void delete(TenantId tenantId, RoleDataScopeId id);

}
