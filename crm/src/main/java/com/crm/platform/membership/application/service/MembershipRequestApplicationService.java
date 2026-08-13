package com.crm.platform.membership.application.service;

import java.time.Instant;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import com.crm.foundation.identifier.IdentifierGenerator;
import com.crm.foundation.security.CurrentActor;
import com.crm.foundation.security.PermissionChecker;
import com.crm.foundation.security.SystemPermission;
import com.crm.foundation.tenancy.CurrentTenant;
import com.crm.foundation.time.TimeProvider;
import com.crm.platform.membership.application.command.ApproveMembershipRequestCommand;
import com.crm.platform.membership.application.command.RejectMembershipRequestCommand;
import com.crm.platform.membership.application.command.SubmitMembershipRequestCommand;
import com.crm.platform.membership.application.dto.ApprovedMembershipDetails;
import com.crm.platform.membership.application.dto.MembershipRequestDetails;
import com.crm.platform.membership.application.dto.RoleReference;
import com.crm.platform.membership.application.dto.TenantReference;
import com.crm.platform.membership.application.dto.UserReference;
import com.crm.platform.membership.application.port.MembershipRequestRepository;
import com.crm.platform.membership.application.query.MembershipRequestSearchQuery;
import com.crm.platform.membership.application.usecase.MembershipRequestFacade;
import com.crm.platform.membership.domain.MembershipRequest;
import com.crm.platform.membership.domain.MembershipRequestErrorCode;
import com.crm.platform.membership.domain.MembershipRequestId;
import com.crm.platform.membership.domain.MembershipRequestStatus;
import com.crm.platform.membership.domain.TenantMembershipState;
import com.crm.platform.membership.domain.TenantMembershipStatus;
import com.crm.sharedkernel.application.PageResult;
import com.crm.sharedkernel.domain.ActorId;
import com.crm.sharedkernel.domain.TenantId;
import com.crm.sharedkernel.domain.exception.BusinessRuleViolation;
import com.crm.sharedkernel.domain.exception.DomainResourceNotFound;
import com.crm.sharedkernel.domain.exception.ResourceConflict;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class MembershipRequestApplicationService
		implements MembershipRequestFacade {

	private static final int MAX_ASSIGNABLE_ROLES = 20;

	private final MembershipRequestRepository repository;
	private final CurrentActor currentActor;
	private final CurrentTenant currentTenant;
	private final PermissionChecker permissionChecker;
	private final IdentifierGenerator identifierGenerator;
	private final TimeProvider timeProvider;

	public MembershipRequestApplicationService(
			MembershipRequestRepository repository,
			CurrentActor currentActor,
			CurrentTenant currentTenant,
			PermissionChecker permissionChecker,
			IdentifierGenerator identifierGenerator,
			TimeProvider timeProvider) {
		this.repository = repository;
		this.currentActor = currentActor;
		this.currentTenant = currentTenant;
		this.permissionChecker = permissionChecker;
		this.identifierGenerator = identifierGenerator;
		this.timeProvider = timeProvider;
	}

	@Override
	@Transactional
	public MembershipRequestDetails submit(
			SubmitMembershipRequestCommand command) {
		Objects.requireNonNull(command, "command must not be null");
		ActorId actorId = currentActor.requireActorId();
		UserReference requester = repository.lockActiveUser(actorId)
				.orElseThrow(() -> new AccessDeniedException(
						"Active user is required"));
		TenantReference tenant = repository
				.findAvailableTenantByCode(command.tenantCode().trim())
				.orElseThrow(() -> new DomainResourceNotFound(
						MembershipRequestErrorCode.TENANT_NOT_AVAILABLE));

		if (repository.hasNonRemovedMembership(tenant.id(), requester.id())) {
			throw membershipAlreadyExists();
		}
		if (repository.hasPendingRequest(tenant.id(), requester.id())) {
			throw requestAlreadyPending();
		}

		MembershipRequest request = MembershipRequest.submit(
				tenant.id(),
				new MembershipRequestId(identifierGenerator.nextId()),
				requester.id(),
				command.message(),
				timeProvider.now());
		try {
			repository.insert(request);
		}
		catch (DuplicateKeyException exception) {
			if (repository.hasPendingRequest(tenant.id(), requester.id())) {
				throw requestAlreadyPending();
			}
			throw exception;
		}
		return reloadRequest(tenant.id(), request.id());
	}

	@Override
	@Transactional(readOnly = true)
	public PageResult<MembershipRequestDetails> search(
			MembershipRequestSearchQuery query) {
		Objects.requireNonNull(query, "query must not be null");
		TenantId tenantId = currentTenant.requireTenantId();
		currentActor.requireActorId();
		permissionChecker.requirePermission(
				SystemPermission.PLATFORM_MEMBERSHIP_READ);
		return repository.search(tenantId, query);
	}

	@Override
	@Transactional
	public ApprovedMembershipDetails approve(
			ApproveMembershipRequestCommand command) {
		Objects.requireNonNull(command, "command must not be null");
		TenantId tenantId = currentTenant.requireTenantId();
		ActorId actorId = currentActor.requireActorId();
		permissionChecker.requirePermission(
				SystemPermission.PLATFORM_MEMBERSHIP_APPROVE);
		permissionChecker.requirePermission(
				SystemPermission.PLATFORM_ROLE_ASSIGN);

		List<UUID> roleIds = validatedRoleIds(command.roleIds());
		MembershipRequest request = findRequestForUpdate(
				tenantId, command.requestId());
		requireVersion(request, command.version());
		requirePending(request);

		ActorId requesterId = request.requesterId();
		repository.lockActiveUser(requesterId)
				.orElseThrow(() -> new AccessDeniedException(
						"Active user is required"));
		Optional<TenantMembershipState> membership =
				repository.findMembershipForUpdate(tenantId, requesterId);
		membership.filter(state -> state.status()
					!= TenantMembershipStatus.REMOVED)
				.ifPresent(state -> {
					throw membershipAlreadyExists();
				});

		List<RoleReference> roles = repository
				.findAssignableRolesForUpdate(tenantId, roleIds);
		requireExactRoles(roleIds, roles);

		Instant now = timeProvider.now();
		if (membership.isEmpty()) {
			insertMembership(tenantId, requesterId, actorId, now);
		}
		else if (repository.reactivateRemovedMembership(
				tenantId, requesterId, actorId, now) != 1) {
			throw new IllegalStateException(
					"Membership reactivation must affect exactly one row");
		}

		repository.deleteRoleAssignments(tenantId, requesterId);
		repository.insertRoleAssignments(
				tenantId, requesterId, roles, actorId, now);
		long expectedVersion = request.version();
		request.approve(actorId, command.reviewNote(), now);
		if (repository.updateResolution(request, expectedVersion) != 1) {
			throw requestVersionConflict();
		}
		return repository.findApprovedMembership(tenantId, requesterId)
				.orElseThrow(() -> new IllegalStateException(
						"Approved Membership must remain readable"));
	}

	@Override
	@Transactional
	public MembershipRequestDetails reject(
			RejectMembershipRequestCommand command) {
		Objects.requireNonNull(command, "command must not be null");
		TenantId tenantId = currentTenant.requireTenantId();
		ActorId actorId = currentActor.requireActorId();
		permissionChecker.requirePermission(
				SystemPermission.PLATFORM_MEMBERSHIP_APPROVE);

		MembershipRequest request = findRequestForUpdate(
				tenantId, command.requestId());
		requireVersion(request, command.version());
		requirePending(request);
		long expectedVersion = request.version();
		request.reject(actorId, command.reason(), timeProvider.now());
		if (repository.updateResolution(request, expectedVersion) != 1) {
			throw requestVersionConflict();
		}
		return reloadRequest(tenantId, request.id());
	}

	private void insertMembership(TenantId tenantId, ActorId requesterId,
			ActorId reviewerId, Instant now) {
		try {
			repository.insertActiveMembership(
					tenantId, requesterId, reviewerId, now);
		}
		catch (DuplicateKeyException exception) {
			Optional<TenantMembershipState> concurrentMembership =
					repository.findMembershipForUpdate(tenantId, requesterId);
			if (concurrentMembership.filter(state -> state.status()
						!= TenantMembershipStatus.REMOVED).isPresent()) {
				throw membershipAlreadyExists();
			}
			throw exception;
		}
	}

	private MembershipRequest findRequestForUpdate(TenantId tenantId,
			MembershipRequestId requestId) {
		return repository.findByIdForUpdate(tenantId, requestId)
				.orElseThrow(MembershipRequestApplicationService::requestNotFound);
	}

	private MembershipRequestDetails reloadRequest(TenantId tenantId,
			MembershipRequestId requestId) {
		return repository.findDetails(tenantId, requestId)
				.orElseThrow(() -> new IllegalStateException(
						"Persisted Membership request must remain readable"));
	}

	private static List<UUID> validatedRoleIds(List<UUID> roleIds) {
		if (roleIds.isEmpty()
				|| roleIds.size() > MAX_ASSIGNABLE_ROLES
				|| roleIds.stream().anyMatch(Objects::isNull)
				|| new HashSet<>(roleIds).size() != roleIds.size()) {
			throw roleInvalid();
		}
		return roleIds.stream()
				.sorted(Comparator.comparing(UUID::toString))
				.toList();
	}

	private static void requireExactRoles(List<UUID> roleIds,
			List<RoleReference> roles) {
		Set<UUID> expectedIds = new HashSet<>(roleIds);
		Set<UUID> actualIds = roles.stream()
				.map(RoleReference::id)
				.collect(Collectors.toSet());
		if (!actualIds.equals(expectedIds)) {
			throw roleInvalid();
		}
	}

	private static void requireVersion(MembershipRequest request,
			long version) {
		if (request.version() != version) {
			throw requestVersionConflict();
		}
	}

	private static void requirePending(MembershipRequest request) {
		if (request.status() != MembershipRequestStatus.PENDING) {
			throw requestAlreadyResolved();
		}
	}

	private static DomainResourceNotFound requestNotFound() {
		return new DomainResourceNotFound(
				MembershipRequestErrorCode.MEMBERSHIP_REQUEST_NOT_FOUND);
	}

	private static ResourceConflict requestAlreadyPending() {
		return new ResourceConflict(
				MembershipRequestErrorCode.MEMBERSHIP_REQUEST_ALREADY_PENDING);
	}

	@Override
	@Transactional
	public void updateMemberRoles(ActorId targetUserId, List<UUID> roleIds) {
		Objects.requireNonNull(targetUserId, "targetUserId must not be null");
		TenantId tenantId = currentTenant.requireTenantId();
		ActorId actorId = currentActor.requireActorId();
		permissionChecker.requirePermission(
				SystemPermission.PLATFORM_ROLE_ASSIGN);

		List<UUID> validatedIds = validatedRoleIds(roleIds);
		List<RoleReference> roles = repository
				.findAssignableRolesForUpdate(tenantId, validatedIds);
		requireExactRoles(validatedIds, roles);

		Instant now = timeProvider.now();
		repository.deleteRoleAssignments(tenantId, targetUserId);
		if (!roles.isEmpty()) {
			repository.insertRoleAssignments(
					tenantId, targetUserId, roles, actorId, now);
		}
	}

	private static ResourceConflict membershipAlreadyExists() {
		return new ResourceConflict(
				MembershipRequestErrorCode.MEMBERSHIP_ALREADY_EXISTS);
	}

	private static ResourceConflict requestAlreadyResolved() {
		return new ResourceConflict(
				MembershipRequestErrorCode.MEMBERSHIP_REQUEST_ALREADY_RESOLVED);
	}

	private static ResourceConflict requestVersionConflict() {
		return new ResourceConflict(
				MembershipRequestErrorCode.MEMBERSHIP_REQUEST_VERSION_CONFLICT);
	}

	private static BusinessRuleViolation roleInvalid() {
		return new BusinessRuleViolation(
				MembershipRequestErrorCode.MEMBERSHIP_ROLE_INVALID);
	}

}
