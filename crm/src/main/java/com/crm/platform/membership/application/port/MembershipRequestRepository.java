package com.crm.platform.membership.application.port;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import com.crm.platform.membership.application.dto.ApprovedMembershipDetails;
import com.crm.platform.membership.application.dto.MembershipRequestDetails;
import com.crm.platform.membership.application.dto.RoleReference;
import com.crm.platform.membership.application.dto.TenantReference;
import com.crm.platform.membership.application.dto.UserReference;
import com.crm.platform.membership.application.query.MembershipRequestSearchQuery;
import com.crm.platform.membership.domain.MembershipRequest;
import com.crm.platform.membership.domain.MembershipRequestId;
import com.crm.platform.membership.domain.TenantMembershipState;
import com.crm.sharedkernel.application.PageResult;
import com.crm.sharedkernel.domain.ActorId;
import com.crm.sharedkernel.domain.TenantId;

public interface MembershipRequestRepository {

	Optional<TenantReference> findAvailableTenantByCode(String tenantCode);

	Optional<UserReference> lockActiveUser(ActorId userId);

	boolean hasNonRemovedMembership(TenantId tenantId, ActorId userId);

	boolean hasPendingRequest(TenantId tenantId, ActorId userId);

	void insert(MembershipRequest request);

	PageResult<MembershipRequestDetails> search(TenantId tenantId,
			MembershipRequestSearchQuery query);

	Optional<MembershipRequest> findByIdForUpdate(TenantId tenantId,
			MembershipRequestId requestId);

	Optional<TenantMembershipState> findMembershipForUpdate(TenantId tenantId,
			ActorId userId);

	List<RoleReference> findAssignableRolesForUpdate(TenantId tenantId,
			List<UUID> roleIds);

	void insertActiveMembership(TenantId tenantId, ActorId userId,
			ActorId reviewerId, Instant now);

	int reactivateRemovedMembership(TenantId tenantId, ActorId userId,
			ActorId reviewerId, Instant now);

	void deleteRoleAssignments(TenantId tenantId, ActorId userId);

	void insertRoleAssignments(TenantId tenantId, ActorId userId,
			List<RoleReference> roles, ActorId reviewerId, Instant now);

	int updateResolution(MembershipRequest request, long expectedVersion);

	Optional<MembershipRequestDetails> findDetails(TenantId tenantId,
			MembershipRequestId requestId);

	Optional<ApprovedMembershipDetails> findApprovedMembership(TenantId tenantId,
			ActorId userId);

}
