package com.crm.customer.activity.application.service;

import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

import com.crm.customer.activity.application.command.CompleteActivityCommand;
import com.crm.customer.activity.application.command.CreateActivityCommand;
import com.crm.customer.activity.application.command.DeleteActivityCommand;
import com.crm.customer.activity.application.command.UpdateActivityCommand;
import com.crm.customer.activity.application.dto.ActivityDetails;
import com.crm.customer.activity.application.dto.ActivitySummary;
import com.crm.customer.activity.application.port.ActivityRepository;
import com.crm.customer.activity.application.query.ActivitySearchQuery;
import com.crm.customer.activity.application.usecase.ActivityFacade;
import com.crm.customer.activity.domain.Activity;
import com.crm.customer.activity.domain.ActivityErrorCode;
import com.crm.customer.activity.domain.ActivityId;
import com.crm.customer.activity.domain.ActivityOwner;
import com.crm.foundation.identifier.IdentifierGenerator;
import com.crm.foundation.security.AuthorizedDataAccess;
import com.crm.foundation.security.CurrentActor;
import com.crm.foundation.security.SystemPermission;
import com.crm.foundation.security.TenantAccessAuthorizer;
import com.crm.foundation.tenancy.CurrentTenant;
import com.crm.foundation.time.TimeProvider;
import com.crm.sharedkernel.application.PageResult;
import com.crm.sharedkernel.domain.ActorId;
import com.crm.sharedkernel.domain.TenantId;
import com.crm.sharedkernel.domain.exception.DomainResourceNotFound;
import com.crm.sharedkernel.domain.exception.ResourceConflict;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ActivityApplicationService implements ActivityFacade {

	private static final String ENTITY_TYPE = "ACTIVITY";

	private final ActivityRepository activityRepository;
	private final CurrentTenant currentTenant;
	private final CurrentActor currentActor;
	private final TenantAccessAuthorizer authorizer;
	private final IdentifierGenerator identifierGenerator;
	private final TimeProvider timeProvider;

	public ActivityApplicationService(
			ActivityRepository activityRepository,
			CurrentTenant currentTenant,
			CurrentActor currentActor,
			TenantAccessAuthorizer authorizer,
			IdentifierGenerator identifierGenerator,
			TimeProvider timeProvider) {
		this.activityRepository = activityRepository;
		this.currentTenant = currentTenant;
		this.currentActor = currentActor;
		this.authorizer = authorizer;
		this.identifierGenerator = identifierGenerator;
		this.timeProvider = timeProvider;
	}

	@Override
	@Transactional
	public ActivityDetails create(CreateActivityCommand command) {
		Objects.requireNonNull(command, "command must not be null");
		TenantId tenantId = currentTenant.requireTenantId();
		ActorId actorId = currentActor.requireActorId();
		authorizer.authorize(SystemPermission.CRM_ACTIVITY_WRITE, ENTITY_TYPE);
		ActivityId activityId = new ActivityId(identifierGenerator.nextId());
		Instant now = timeProvider.now();

		ActivityOwner owner = command.owner();
		if (owner == null || !owner.isAssigned()) {
			owner = ActivityOwner.forActor(actorId);
		}

		validateOwner(tenantId, owner);

		Activity activity = Activity.create(
				tenantId,
				activityId,
				command.activityType(),
				command.subject(),
				command.description(),
				command.direction(),
				command.priority(),
				owner,
				command.scheduledStartAt(),
				command.scheduledEndAt(),
				command.durationSeconds(),
				command.outcomeCode(),
				command.externalReference(),
				command.recurrenceRule(),
				actorId,
				now);

		activityRepository.save(activity);
		return toDetails(activity);
	}

	@Override
	@Transactional(readOnly = true)
	public ActivityDetails get(ActivityId activityId) {
		Objects.requireNonNull(activityId, "activityId must not be null");
		TenantId tenantId = currentTenant.requireTenantId();
		ActorId actorId = currentActor.requireActorId();
		AuthorizedDataAccess access = authorizer.authorize(
				SystemPermission.CRM_ACTIVITY_READ, ENTITY_TYPE);

		Activity activity = activityRepository.findById(
				tenantId, activityId, actorId, access)
				.orElseThrow(() -> new DomainResourceNotFound(
						ActivityErrorCode.ACTIVITY_NOT_FOUND));

		return toDetails(activity);
	}

	@Override
	@Transactional(readOnly = true)
	public PageResult<ActivitySummary> search(ActivitySearchQuery query) {
		Objects.requireNonNull(query, "query must not be null");
		TenantId tenantId = currentTenant.requireTenantId();
		ActorId actorId = currentActor.requireActorId();
		AuthorizedDataAccess access = authorizer.authorize(
				SystemPermission.CRM_ACTIVITY_READ, ENTITY_TYPE);

		return activityRepository.search(tenantId, actorId, query, access);
	}

	@Override
	@Transactional
	public ActivityDetails update(UpdateActivityCommand command) {
		Objects.requireNonNull(command, "command must not be null");
		TenantId tenantId = currentTenant.requireTenantId();
		ActorId actorId = currentActor.requireActorId();
		AuthorizedDataAccess access = authorizer.authorize(
				SystemPermission.CRM_ACTIVITY_WRITE, ENTITY_TYPE);

		Activity activity = activityRepository.findById(
				tenantId, command.activityId(), actorId, access)
				.orElseThrow(() -> new DomainResourceNotFound(
						ActivityErrorCode.ACTIVITY_NOT_FOUND));

		validateOwner(tenantId, command.owner());

		Instant now = timeProvider.now();
		try {
			activity.update(
					command.activityType(),
					command.subject(),
					command.description(),
					command.direction(),
					command.status(),
					command.priority(),
					command.owner(),
					command.scheduledStartAt(),
					command.scheduledEndAt(),
					command.durationSeconds(),
					command.outcomeCode(),
					command.externalReference(),
					command.recurrenceRule(),
					actorId,
					now,
					command.expectedVersion());
		} catch (IllegalStateException ex) {
			throw new ResourceConflict(
					ActivityErrorCode.ACTIVITY_VERSION_CONFLICT);
		}

		activityRepository.save(activity);
		return toDetails(activity);
	}

	@Override
	@Transactional
	public ActivityDetails complete(CompleteActivityCommand command) {
		Objects.requireNonNull(command, "command must not be null");
		TenantId tenantId = currentTenant.requireTenantId();
		ActorId actorId = currentActor.requireActorId();
		AuthorizedDataAccess access = authorizer.authorize(
				SystemPermission.CRM_ACTIVITY_WRITE, ENTITY_TYPE);

		Activity activity = activityRepository.findById(
				tenantId, command.activityId(), actorId, access)
				.orElseThrow(() -> new DomainResourceNotFound(
						ActivityErrorCode.ACTIVITY_NOT_FOUND));

		Instant now = timeProvider.now();
		try {
			activity.complete(command.outcomeCode(), actorId, now, command.expectedVersion());
		} catch (IllegalStateException ex) {
			throw new ResourceConflict(
					ActivityErrorCode.ACTIVITY_VERSION_CONFLICT);
		}

		activityRepository.save(activity);
		return toDetails(activity);
	}

	@Override
	@Transactional
	public void delete(DeleteActivityCommand command) {
		Objects.requireNonNull(command, "command must not be null");
		TenantId tenantId = currentTenant.requireTenantId();
		ActorId actorId = currentActor.requireActorId();
		AuthorizedDataAccess access = authorizer.authorize(
				SystemPermission.CRM_ACTIVITY_WRITE, ENTITY_TYPE);

		Activity activity = activityRepository.findById(
				tenantId, command.activityId(), actorId, access)
				.orElseThrow(() -> new DomainResourceNotFound(
						ActivityErrorCode.ACTIVITY_NOT_FOUND));

		if (activity.version() != command.expectedVersion()) {
			throw new ResourceConflict(
					ActivityErrorCode.ACTIVITY_VERSION_CONFLICT);
		}

		activityRepository.delete(tenantId, command.activityId());
	}

	private void validateOwner(TenantId tenantId, ActivityOwner owner) {
		if (owner == null) {
			return;
		}
		if (owner.ownerUserId() != null && !activityRepository.existsUser(tenantId, owner.ownerUserId())) {
			throw new DomainResourceNotFound(
					ActivityErrorCode.ACTIVITY_OWNER_INVALID);
		}
		if (owner.assignedTeamId() != null && !activityRepository.existsTeam(tenantId, owner.assignedTeamId())) {
			throw new DomainResourceNotFound(
					ActivityErrorCode.ACTIVITY_OWNER_INVALID);
		}
	}

	private ActivityDetails toDetails(Activity activity) {
		return new ActivityDetails(
				activity.tenantId(),
				activity.id(),
				activity.activityType(),
				activity.subject(),
				activity.description(),
				activity.direction(),
				activity.status(),
				activity.priority(),
				activity.owner(),
				activity.scheduledStartAt(),
				activity.scheduledEndAt(),
				activity.completedAt(),
				activity.durationSeconds(),
				activity.outcomeCode(),
				activity.externalReference(),
				activity.recurrenceRule(),
				activity.createdAt(),
				activity.createdBy(),
				activity.updatedAt(),
				activity.updatedBy(),
				activity.version());
	}

	@Override
	@Transactional(readOnly = true)
	public com.crm.customer.activity.application.dto.ActivityStatsDto getStats() {
		TenantId tenantId = currentTenant.requireTenantId();
		ActorId actorId = currentActor.requireActorId();
		AuthorizedDataAccess access = authorizer.requireAccess(
				SystemPermission.CRM_ACTIVITY_READ, ENTITY_TYPE);
		return activityRepository.getStats(tenantId, actorId, access);
	}

	@Override
	@Transactional
	public ActivityDetails reschedule(com.crm.customer.activity.application.command.RescheduleActivityCommand command) {
		Objects.requireNonNull(command, "command must not be null");
		TenantId tenantId = currentTenant.requireTenantId();
		ActorId actorId = currentActor.requireActorId();
		authorizer.requireAccess(SystemPermission.CRM_ACTIVITY_WRITE, ENTITY_TYPE);

		activityRepository.reschedule(
				tenantId,
				command.id(),
				command.startsAt(),
				command.dueAt(),
				command.expectedVersion(),
				actorId,
				timeProvider.now()
		);
		return get(command.id());
	}

	@Override
	@Transactional
	public ActivityDetails cancel(com.crm.customer.activity.application.command.CancelActivityCommand command) {
		Objects.requireNonNull(command, "command must not be null");
		TenantId tenantId = currentTenant.requireTenantId();
		ActorId actorId = currentActor.requireActorId();
		authorizer.requireAccess(SystemPermission.CRM_ACTIVITY_WRITE, ENTITY_TYPE);

		activityRepository.cancel(
				tenantId,
				command.id(),
				command.cancelReason(),
				command.expectedVersion(),
				actorId,
				timeProvider.now()
		);
		return get(command.id());
	}

	@Override
	@Transactional
	public int bulkComplete(com.crm.customer.activity.application.command.BulkCompleteActivitiesCommand command) {
		Objects.requireNonNull(command, "command must not be null");
		TenantId tenantId = currentTenant.requireTenantId();
		ActorId actorId = currentActor.requireActorId();
		authorizer.requireAccess(SystemPermission.CRM_ACTIVITY_WRITE, ENTITY_TYPE);

		java.util.List<ActivityId> ids = command.activityIds().stream().map(ActivityId::new).toList();
		return activityRepository.bulkComplete(tenantId, ids, command.outcomeCode(), actorId, timeProvider.now());
	}

}
