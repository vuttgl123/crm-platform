package com.crm.customer.activity.domain;

import java.time.Instant;
import java.util.Objects;

import com.crm.sharedkernel.domain.ActorId;
import com.crm.sharedkernel.domain.TenantId;

public class Activity {

	private final TenantId tenantId;
	private final ActivityId id;
	private ActivityType activityType;
	private String subject;
	private String description;
	private ActivityDirection direction;
	private ActivityStatus status;
	private ActivityPriority priority;
	private ActivityOwner owner;
	private Instant scheduledStartAt;
	private Instant scheduledEndAt;
	private Instant completedAt;
	private Integer durationSeconds;
	private String outcomeCode;
	private String externalReference;
	private String recurrenceRule;

	private final Instant createdAt;
	private final ActorId createdBy;
	private Instant updatedAt;
	private ActorId updatedBy;
	private long version;

	private Activity(
			TenantId tenantId,
			ActivityId id,
			ActivityType activityType,
			String subject,
			String description,
			ActivityDirection direction,
			ActivityStatus status,
			ActivityPriority priority,
			ActivityOwner owner,
			Instant scheduledStartAt,
			Instant scheduledEndAt,
			Instant completedAt,
			Integer durationSeconds,
			String outcomeCode,
			String externalReference,
			String recurrenceRule,
			Instant createdAt,
			ActorId createdBy,
			Instant updatedAt,
			ActorId updatedBy,
			long version) {
		this.tenantId = Objects.requireNonNull(tenantId, "tenantId must not be null");
		this.id = Objects.requireNonNull(id, "id must not be null");
		this.activityType = Objects.requireNonNull(activityType, "activityType must not be null");
		this.subject = validateSubject(subject);
		this.description = trimToNull(description);
		this.direction = direction;
		this.status = status == null ? ActivityStatus.PLANNED : status;
		this.priority = priority == null ? ActivityPriority.NORMAL : priority;
		this.owner = owner == null ? ActivityOwner.unassigned() : owner;
		validateTimeRange(scheduledStartAt, scheduledEndAt);
		this.scheduledStartAt = scheduledStartAt;
		this.scheduledEndAt = scheduledEndAt;
		this.completedAt = completedAt;
		this.durationSeconds = durationSeconds;
		this.outcomeCode = trimToNull(outcomeCode);
		this.externalReference = trimToNull(externalReference);
		this.recurrenceRule = trimToNull(recurrenceRule);
		this.createdAt = Objects.requireNonNull(createdAt, "createdAt must not be null");
		this.createdBy = createdBy;
		this.updatedAt = Objects.requireNonNull(updatedAt, "updatedAt must not be null");
		this.updatedBy = updatedBy;
		this.version = version;
	}

	public static Activity create(
			TenantId tenantId,
			ActivityId id,
			ActivityType activityType,
			String subject,
			String description,
			ActivityDirection direction,
			ActivityPriority priority,
			ActivityOwner owner,
			Instant scheduledStartAt,
			Instant scheduledEndAt,
			Integer durationSeconds,
			String outcomeCode,
			String externalReference,
			String recurrenceRule,
			ActorId actorId,
			Instant now) {
		return new Activity(
				tenantId,
				id,
				activityType,
				subject,
				description,
				direction,
				ActivityStatus.PLANNED,
				priority,
				owner,
				scheduledStartAt,
				scheduledEndAt,
				null,
				durationSeconds,
				outcomeCode,
				externalReference,
				recurrenceRule,
				now,
				actorId,
				now,
				actorId,
				1L);
	}

	public static Activity reconstitute(
			TenantId tenantId,
			ActivityId id,
			ActivityType activityType,
			String subject,
			String description,
			ActivityDirection direction,
			ActivityStatus status,
			ActivityPriority priority,
			ActivityOwner owner,
			Instant scheduledStartAt,
			Instant scheduledEndAt,
			Instant completedAt,
			Integer durationSeconds,
			String outcomeCode,
			String externalReference,
			String recurrenceRule,
			Instant createdAt,
			ActorId createdBy,
			Instant updatedAt,
			ActorId updatedBy,
			long version) {
		return new Activity(
				tenantId,
				id,
				activityType,
				subject,
				description,
				direction,
				status,
				priority,
				owner,
				scheduledStartAt,
				scheduledEndAt,
				completedAt,
				durationSeconds,
				outcomeCode,
				externalReference,
				recurrenceRule,
				createdAt,
				createdBy,
				updatedAt,
				updatedBy,
				version);
	}

	public void update(
			ActivityType activityType,
			String subject,
			String description,
			ActivityDirection direction,
			ActivityStatus status,
			ActivityPriority priority,
			ActivityOwner owner,
			Instant scheduledStartAt,
			Instant scheduledEndAt,
			Integer durationSeconds,
			String outcomeCode,
			String externalReference,
			String recurrenceRule,
			ActorId actorId,
			Instant now,
			long expectedVersion) {
		checkVersion(expectedVersion);
		validateTimeRange(scheduledStartAt, scheduledEndAt);
		this.activityType = Objects.requireNonNull(activityType, "activityType must not be null");
		this.subject = validateSubject(subject);
		this.description = trimToNull(description);
		this.direction = direction;
		this.status = status == null ? this.status : status;
		this.priority = priority == null ? this.priority : priority;
		this.owner = owner == null ? this.owner : owner;
		this.scheduledStartAt = scheduledStartAt;
		this.scheduledEndAt = scheduledEndAt;
		this.durationSeconds = durationSeconds;
		this.outcomeCode = trimToNull(outcomeCode);
		this.externalReference = trimToNull(externalReference);
		this.recurrenceRule = trimToNull(recurrenceRule);
		this.updatedAt = Objects.requireNonNull(now, "now must not be null");
		this.updatedBy = actorId;
		this.version++;
	}

	public void complete(String outcomeCode, ActorId actorId, Instant now, long expectedVersion) {
		checkVersion(expectedVersion);
		this.status = ActivityStatus.COMPLETED;
		this.completedAt = now;
		this.outcomeCode = trimToNull(outcomeCode);
		this.updatedAt = now;
		this.updatedBy = actorId;
		this.version++;
	}

	private void checkVersion(long expectedVersion) {
		if (this.version != expectedVersion) {
			throw new IllegalStateException("Optimistic lock version mismatch");
		}
	}

	private static void validateTimeRange(Instant start, Instant end) {
		if (start != null && end != null && end.isBefore(start)) {
			throw new IllegalArgumentException("scheduledEndAt must not be before scheduledStartAt");
		}
	}

	private static String validateSubject(String subject) {
		Objects.requireNonNull(subject, "subject must not be null");
		String trimmed = subject.trim();
		if (trimmed.isEmpty()) {
			throw new IllegalArgumentException("subject must not be blank");
		}
		if (trimmed.length() > 255) {
			throw new IllegalArgumentException("subject must be <= 255 chars");
		}
		return trimmed;
	}

	private static String trimToNull(String value) {
		if (value == null) return null;
		String trimmed = value.trim();
		return trimmed.isEmpty() ? null : trimmed;
	}

	public TenantId tenantId() { return tenantId; }
	public ActivityId id() { return id; }
	public ActivityType activityType() { return activityType; }
	public String subject() { return subject; }
	public String description() { return description; }
	public ActivityDirection direction() { return direction; }
	public ActivityStatus status() { return status; }
	public ActivityPriority priority() { return priority; }
	public ActivityOwner owner() { return owner; }
	public Instant scheduledStartAt() { return scheduledStartAt; }
	public Instant scheduledEndAt() { return scheduledEndAt; }
	public Instant completedAt() { return completedAt; }
	public Integer durationSeconds() { return durationSeconds; }
	public String outcomeCode() { return outcomeCode; }
	public String externalReference() { return externalReference; }
	public String recurrenceRule() { return recurrenceRule; }
	public Instant createdAt() { return createdAt; }
	public ActorId createdBy() { return createdBy; }
	public Instant updatedAt() { return updatedAt; }
	public ActorId updatedBy() { return updatedBy; }
	public long version() { return version; }

}
