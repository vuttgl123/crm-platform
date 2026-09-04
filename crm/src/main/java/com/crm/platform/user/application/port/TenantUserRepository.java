package com.crm.platform.user.application.port;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import com.crm.platform.user.application.dto.TenantUserDetailsDto;
import com.crm.platform.user.application.dto.TenantUserStatsDto;
import com.crm.platform.user.application.dto.TenantUserSummaryDto;
import com.crm.platform.user.application.query.TenantUserSearchQuery;
import com.crm.platform.user.domain.PlatformUser;
import com.crm.sharedkernel.application.PageResult;
import com.crm.sharedkernel.domain.ActorId;
import com.crm.sharedkernel.domain.TenantId;

public interface TenantUserRepository {

	PageResult<TenantUserSummaryDto> search(TenantId tenantId, TenantUserSearchQuery query);

	Optional<TenantUserDetailsDto> findDetailsById(TenantId tenantId, UUID userId);

	Optional<PlatformUser> findByIdForUpdate(TenantId tenantId, UUID userId);

	boolean existsByEmail(String email);

	Optional<UUID> findUserIdByEmail(String email);

	UUID insertUser(String email, String passwordHash, String displayName, String phone, ActorId actorId, Instant now);

	void insertMembership(TenantId tenantId, UUID userId, String employeeReference, String jobTitle, boolean isTenantAdmin, ActorId actorId, Instant now);

	int updateMembership(PlatformUser user, long expectedVersion);

	void replaceUserRoles(TenantId tenantId, UUID userId, List<UUID> roleIds, ActorId actorId, Instant now);

	void replacePrimaryTeam(TenantId tenantId, UUID userId, UUID teamId, ActorId actorId, Instant now);

	void softRemoveMembership(TenantId tenantId, UUID userId, ActorId actorId, Instant now);

	TenantUserStatsDto getStats(TenantId tenantId);
}
