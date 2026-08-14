package com.crm.customer.opportunity.domain;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.Objects;
import java.util.UUID;

import com.crm.sharedkernel.domain.ActorId;
import com.crm.sharedkernel.domain.TenantId;

public class Opportunity {

	private final TenantId tenantId;
	private final OpportunityId id;
	private final String opportunityNumber;
	private String name;
	private UUID accountId;
	private UUID pipelineId;
	private UUID currentStageId;
	private OpportunityOwner owner;
	private UUID sourceId;
	private UUID primaryContactId;
	private OpportunityType opportunityType;
	private OpportunityStatus status;
	private OpportunityAmount amount;
	private BigDecimal probability;
	private LocalDate expectedCloseDate;
	private LocalDate actualCloseDate;
	private String nextStep;
	private String description;
	private UUID lostReasonId;
	private String lostReasonNotes;
	private UUID campaignId;

	private final Instant createdAt;
	private final ActorId createdBy;
	private Instant updatedAt;
	private ActorId updatedBy;
	private Instant deletedAt;
	private ActorId deletedBy;
	private long version;

	private Opportunity(
			TenantId tenantId,
			OpportunityId id,
			String opportunityNumber,
			String name,
			UUID accountId,
			UUID pipelineId,
			UUID currentStageId,
			OpportunityOwner owner,
			UUID sourceId,
			UUID primaryContactId,
			OpportunityType opportunityType,
			OpportunityStatus status,
			OpportunityAmount amount,
			BigDecimal probability,
			LocalDate expectedCloseDate,
			LocalDate actualCloseDate,
			String nextStep,
			String description,
			UUID lostReasonId,
			String lostReasonNotes,
			UUID campaignId,
			Instant createdAt,
			ActorId createdBy,
			Instant updatedAt,
			ActorId updatedBy,
			Instant deletedAt,
			ActorId deletedBy,
			long version) {
		this.tenantId = Objects.requireNonNull(tenantId, "tenantId must not be null");
		this.id = Objects.requireNonNull(id, "id must not be null");
		this.opportunityNumber = validateOpportunityNumber(opportunityNumber);
		this.name = validateName(name);
		this.accountId = Objects.requireNonNull(accountId, "accountId must not be null");
		this.pipelineId = Objects.requireNonNull(pipelineId, "pipelineId must not be null");
		this.currentStageId = Objects.requireNonNull(currentStageId, "currentStageId must not be null");
		this.owner = owner;
		this.sourceId = sourceId;
		this.primaryContactId = primaryContactId;
		this.opportunityType = opportunityType == null ? OpportunityType.NEW_BUSINESS : opportunityType;
		this.status = status == null ? OpportunityStatus.OPEN : status;
		this.amount = Objects.requireNonNull(amount, "amount must not be null");
		this.probability = validateProbability(probability);
		this.expectedCloseDate = expectedCloseDate;
		this.actualCloseDate = actualCloseDate;
		this.nextStep = trimToNull(nextStep);
		this.description = trimToNull(description);
		this.lostReasonId = lostReasonId;
		this.lostReasonNotes = trimToNull(lostReasonNotes);
		this.campaignId = campaignId;
		this.createdAt = Objects.requireNonNull(createdAt, "createdAt must not be null");
		this.createdBy = createdBy;
		this.updatedAt = Objects.requireNonNull(updatedAt, "updatedAt must not be null");
		this.updatedBy = updatedBy;
		this.deletedAt = deletedAt;
		this.deletedBy = deletedBy;
		this.version = version;
	}

	public static Opportunity create(
			TenantId tenantId,
			OpportunityId id,
			String opportunityNumber,
			String name,
			UUID accountId,
			UUID pipelineId,
			UUID currentStageId,
			OpportunityOwner owner,
			UUID sourceId,
			UUID primaryContactId,
			OpportunityType opportunityType,
			OpportunityAmount amount,
			BigDecimal probability,
			LocalDate expectedCloseDate,
			String nextStep,
			String description,
			UUID campaignId,
			ActorId actorId,
			Instant now) {
		return new Opportunity(
				tenantId,
				id,
				opportunityNumber,
				name,
				accountId,
				pipelineId,
				currentStageId,
				owner,
				sourceId,
				primaryContactId,
				opportunityType,
				OpportunityStatus.OPEN,
				amount,
				probability,
				expectedCloseDate,
				null,
				nextStep,
				description,
				null,
				null,
				campaignId,
				now,
				actorId,
				now,
				actorId,
				null,
				null,
				1L);
	}

	public static Opportunity reconstitute(
			TenantId tenantId,
			OpportunityId id,
			String opportunityNumber,
			String name,
			UUID accountId,
			UUID pipelineId,
			UUID currentStageId,
			OpportunityOwner owner,
			UUID sourceId,
			UUID primaryContactId,
			OpportunityType opportunityType,
			OpportunityStatus status,
			OpportunityAmount amount,
			BigDecimal probability,
			LocalDate expectedCloseDate,
			LocalDate actualCloseDate,
			String nextStep,
			String description,
			UUID lostReasonId,
			String lostReasonNotes,
			UUID campaignId,
			Instant createdAt,
			ActorId createdBy,
			Instant updatedAt,
			ActorId updatedBy,
			Instant deletedAt,
			ActorId deletedBy,
			long version) {
		return new Opportunity(
				tenantId,
				id,
				opportunityNumber,
				name,
				accountId,
				pipelineId,
				currentStageId,
				owner,
				sourceId,
				primaryContactId,
				opportunityType,
				status,
				amount,
				probability,
				expectedCloseDate,
				actualCloseDate,
				nextStep,
				description,
				lostReasonId,
				lostReasonNotes,
				campaignId,
				createdAt,
				createdBy,
				updatedAt,
				updatedBy,
				deletedAt,
				deletedBy,
				version);
	}

	public void update(
			String name,
			UUID accountId,
			UUID pipelineId,
			UUID currentStageId,
			OpportunityOwner owner,
			UUID sourceId,
			UUID primaryContactId,
			OpportunityType opportunityType,
			OpportunityStatus status,
			OpportunityAmount amount,
			BigDecimal probability,
			LocalDate expectedCloseDate,
			LocalDate actualCloseDate,
			String nextStep,
			String description,
			UUID lostReasonId,
			String lostReasonNotes,
			UUID campaignId,
			ActorId actorId,
			Instant now,
			long expectedVersion) {
		checkVersion(expectedVersion);
		if (status == OpportunityStatus.LOST && lostReasonId == null) {
			throw new IllegalArgumentException("Lost reason is required when status is LOST");
		}
		this.name = validateName(name);
		this.accountId = Objects.requireNonNull(accountId, "accountId must not be null");
		this.pipelineId = Objects.requireNonNull(pipelineId, "pipelineId must not be null");
		this.currentStageId = Objects.requireNonNull(currentStageId, "currentStageId must not be null");
		this.owner = owner;
		this.sourceId = sourceId;
		this.primaryContactId = primaryContactId;
		this.opportunityType = opportunityType == null ? OpportunityType.NEW_BUSINESS : opportunityType;
		this.status = status == null ? OpportunityStatus.OPEN : status;
		this.amount = Objects.requireNonNull(amount, "amount must not be null");
		this.probability = validateProbability(probability);
		this.expectedCloseDate = expectedCloseDate;
		this.actualCloseDate = actualCloseDate;
		this.nextStep = trimToNull(nextStep);
		this.description = trimToNull(description);
		this.lostReasonId = lostReasonId;
		this.lostReasonNotes = trimToNull(lostReasonNotes);
		this.campaignId = campaignId;
		this.updatedAt = Objects.requireNonNull(now, "now must not be null");
		this.updatedBy = actorId;
		this.version++;
	}

	public void delete(ActorId actorId, Instant now, long expectedVersion) {
		checkVersion(expectedVersion);
		this.deletedAt = Objects.requireNonNull(now, "now must not be null");
		this.deletedBy = actorId;
		this.updatedAt = now;
		this.updatedBy = actorId;
		this.version++;
	}

	private void checkVersion(long expectedVersion) {
		if (this.version != expectedVersion) {
			throw new IllegalStateException("Optimistic lock version mismatch");
		}
	}

	private static String validateOpportunityNumber(String opportunityNumber) {
		Objects.requireNonNull(opportunityNumber, "opportunityNumber must not be null");
		String trimmed = opportunityNumber.trim();
		if (trimmed.isEmpty()) {
			throw new IllegalArgumentException("opportunityNumber must not be blank");
		}
		if (trimmed.length() > 191) {
			throw new IllegalArgumentException("opportunityNumber must be <= 191 chars");
		}
		return trimmed;
	}

	private static String validateName(String name) {
		Objects.requireNonNull(name, "name must not be null");
		String trimmed = name.trim();
		if (trimmed.isEmpty()) {
			throw new IllegalArgumentException("name must not be blank");
		}
		if (trimmed.length() > 255) {
			throw new IllegalArgumentException("name must be <= 255 chars");
		}
		return trimmed;
	}

	private static BigDecimal validateProbability(BigDecimal probability) {
		if (probability == null) {
			return BigDecimal.ZERO;
		}
		if (probability.compareTo(BigDecimal.ZERO) < 0 || probability.compareTo(BigDecimal.valueOf(100)) > 0) {
			throw new IllegalArgumentException("Probability must be between 0 and 100");
		}
		return probability;
	}

	private static String trimToNull(String value) {
		if (value == null) return null;
		String trimmed = value.trim();
		return trimmed.isEmpty() ? null : trimmed;
	}

	public TenantId tenantId() { return tenantId; }
	public OpportunityId id() { return id; }
	public String opportunityNumber() { return opportunityNumber; }
	public String name() { return name; }
	public UUID accountId() { return accountId; }
	public UUID pipelineId() { return pipelineId; }
	public UUID currentStageId() { return currentStageId; }
	public OpportunityOwner owner() { return owner; }
	public UUID sourceId() { return sourceId; }
	public UUID primaryContactId() { return primaryContactId; }
	public OpportunityType opportunityType() { return opportunityType; }
	public OpportunityStatus status() { return status; }
	public OpportunityAmount amount() { return amount; }
	public BigDecimal probability() { return probability; }
	public LocalDate expectedCloseDate() { return expectedCloseDate; }
	public LocalDate actualCloseDate() { return actualCloseDate; }
	public String nextStep() { return nextStep; }
	public String description() { return description; }
	public UUID lostReasonId() { return lostReasonId; }
	public String lostReasonNotes() { return lostReasonNotes; }
	public UUID campaignId() { return campaignId; }
	public Instant createdAt() { return createdAt; }
	public ActorId createdBy() { return createdBy; }
	public Instant updatedAt() { return updatedAt; }
	public ActorId updatedBy() { return updatedBy; }
	public Instant deletedAt() { return deletedAt; }
	public ActorId deletedBy() { return deletedBy; }
	public long version() { return version; }

}
