package com.crm.platform.access.application.port;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import com.crm.platform.access.application.dto.PermissionCatalogueItem;
import com.crm.platform.access.application.dto.RoleSummary;
import com.crm.platform.access.domain.Role;
import com.crm.platform.access.domain.RoleId;
import com.crm.sharedkernel.domain.TenantId;

public interface RoleManagementRepository {

	List<PermissionCatalogueItem> findPermissions();

	List<RoleSummary> findRoleSummaries(TenantId tenantId);

	Optional<Role> findById(TenantId tenantId, RoleId roleId);

	Optional<Role> findByIdForUpdate(TenantId tenantId, RoleId roleId);

	boolean existsNonDeletedRoleCode(TenantId tenantId, String roleCode);

	Set<String> findKnownPermissionCodes(Set<String> permissionCodes);

	boolean allTeamsAreActive(TenantId tenantId, Set<UUID> teamIds);

	void insert(Role role);

	int update(Role role, long expectedVersion);

	int softDelete(Role role, long expectedVersion);

	void replacePermissionGrants(Role role);

	void replaceDataScopeGrants(Role role);

}
