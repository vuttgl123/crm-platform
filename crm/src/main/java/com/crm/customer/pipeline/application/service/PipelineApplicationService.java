package com.crm.customer.pipeline.application.service;

import java.time.Instant;
import java.util.List;
import java.util.Objects;

import com.crm.customer.pipeline.application.command.CreatePipelineCommand;
import com.crm.customer.pipeline.application.command.CreatePipelineStageCommand;
import com.crm.customer.pipeline.application.command.UpdatePipelineCommand;
import com.crm.customer.pipeline.application.command.UpdatePipelineStageCommand;
import com.crm.customer.pipeline.application.dto.PipelineDetails;
import com.crm.customer.pipeline.application.dto.PipelineStageDetails;
import com.crm.customer.pipeline.application.dto.PipelineSummary;
import com.crm.customer.pipeline.application.port.PipelineRepository;
import com.crm.customer.pipeline.application.usecase.PipelineFacade;
import com.crm.customer.pipeline.domain.Pipeline;
import com.crm.customer.pipeline.domain.PipelineErrorCode;
import com.crm.customer.pipeline.domain.PipelineId;
import com.crm.customer.pipeline.domain.PipelineStage;
import com.crm.customer.pipeline.domain.PipelineStageId;
import com.crm.foundation.identifier.IdentifierGenerator;
import com.crm.foundation.security.CurrentActor;
import com.crm.foundation.security.SystemPermission;
import com.crm.foundation.security.TenantAccessAuthorizer;
import com.crm.foundation.tenancy.CurrentTenant;
import com.crm.foundation.time.TimeProvider;
import com.crm.sharedkernel.domain.ActorId;
import com.crm.sharedkernel.domain.TenantId;
import com.crm.sharedkernel.domain.exception.DomainResourceNotFound;
import com.crm.sharedkernel.domain.exception.ResourceConflict;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PipelineApplicationService implements PipelineFacade {

	private final PipelineRepository repository;
	private final CurrentTenant currentTenant;
	private final CurrentActor currentActor;
	private final TenantAccessAuthorizer authorizer;
	private final IdentifierGenerator identifierGenerator;
	private final TimeProvider timeProvider;

	public PipelineApplicationService(
			PipelineRepository repository,
			CurrentTenant currentTenant,
			CurrentActor currentActor,
			TenantAccessAuthorizer authorizer,
			IdentifierGenerator identifierGenerator,
			TimeProvider timeProvider) {
		this.repository = repository;
		this.currentTenant = currentTenant;
		this.currentActor = currentActor;
		this.authorizer = authorizer;
		this.identifierGenerator = identifierGenerator;
		this.timeProvider = timeProvider;
	}

	@Override
	@Transactional
	public PipelineDetails createPipeline(CreatePipelineCommand command) {
		Objects.requireNonNull(command, "command must not be null");
		TenantId tenantId = currentTenant.requireTenantId();
		ActorId actorId = currentActor.requireActorId();
		authorizer.requirePermission(SystemPermission.CRM_OPPORTUNITY_WRITE);

		if (repository.existsByCode(tenantId, command.pipelineCode())) {
			throw new ResourceConflict(PipelineErrorCode.PIPELINE_CODE_ALREADY_EXISTS.code());
		}

		Instant now = timeProvider.now();
		PipelineId id = new PipelineId(identifierGenerator.nextId());

		Pipeline pipeline = Pipeline.create(
				tenantId,
				id,
				command.pipelineCode(),
				command.name(),
				command.pipelineType(),
				command.defaultPipeline(),
				actorId,
				now
		);

		try {
			repository.insert(pipeline);
		}
		catch (DuplicateKeyException e) {
			throw new ResourceConflict(PipelineErrorCode.PIPELINE_CODE_ALREADY_EXISTS.code());
		}

		return PipelineDetails.from(pipeline, List.of());
	}

	@Override
	@Transactional(readOnly = true)
	public PipelineDetails getPipeline(PipelineId id) {
		Objects.requireNonNull(id, "id must not be null");
		TenantId tenantId = currentTenant.requireTenantId();
		authorizer.requirePermission(SystemPermission.CRM_OPPORTUNITY_READ);

		Pipeline pipeline = repository.findById(tenantId, id)
				.orElseThrow(() -> new DomainResourceNotFound(PipelineErrorCode.PIPELINE_NOT_FOUND.code()));

		List<PipelineStageDetails> stages = repository.findStagesByPipeline(tenantId, id);
		return PipelineDetails.from(pipeline, stages);
	}

	@Override
	@Transactional(readOnly = true)
	public List<PipelineSummary> listPipelines() {
		TenantId tenantId = currentTenant.requireTenantId();
		authorizer.requirePermission(SystemPermission.CRM_OPPORTUNITY_READ);

		return repository.findAll(tenantId);
	}

	@Override
	@Transactional
	public PipelineDetails updatePipeline(UpdatePipelineCommand command) {
		Objects.requireNonNull(command, "command must not be null");
		TenantId tenantId = currentTenant.requireTenantId();
		ActorId actorId = currentActor.requireActorId();
		authorizer.requirePermission(SystemPermission.CRM_OPPORTUNITY_WRITE);

		Pipeline pipeline = repository.findById(tenantId, command.id())
				.orElseThrow(() -> new DomainResourceNotFound(PipelineErrorCode.PIPELINE_NOT_FOUND.code()));

		if (pipeline.version() != command.version()) {
			throw new ResourceConflict(PipelineErrorCode.PIPELINE_VERSION_CONFLICT.code());
		}

		pipeline.update(command.name(), command.pipelineType(), command.defaultPipeline(), command.active(), actorId, timeProvider.now());
		repository.update(pipeline);

		List<PipelineStageDetails> stages = repository.findStagesByPipeline(tenantId, pipeline.id());
		return PipelineDetails.from(pipeline, stages);
	}

	@Override
	@Transactional
	public PipelineStageDetails addStage(CreatePipelineStageCommand command) {
		Objects.requireNonNull(command, "command must not be null");
		TenantId tenantId = currentTenant.requireTenantId();
		ActorId actorId = currentActor.requireActorId();
		authorizer.requirePermission(SystemPermission.CRM_OPPORTUNITY_WRITE);

		Pipeline pipeline = repository.findById(tenantId, command.pipelineId())
				.orElseThrow(() -> new DomainResourceNotFound(PipelineErrorCode.PIPELINE_NOT_FOUND.code()));

		if (repository.existsStageByCode(tenantId, command.pipelineId(), command.stageCode())) {
			throw new ResourceConflict(PipelineErrorCode.STAGE_CODE_ALREADY_EXISTS.code());
		}

		Instant now = timeProvider.now();
		PipelineStageId stageId = new PipelineStageId(identifierGenerator.nextId());

		PipelineStage stage = PipelineStage.create(
				tenantId,
				stageId,
				pipeline.id(),
				command.stageCode(),
				command.name(),
				command.displayOrder(),
				command.defaultProbability(),
				command.stageCategory(),
				command.forecastCategory(),
				actorId,
				now
		);

		try {
			repository.insertStage(stage);
		}
		catch (DuplicateKeyException e) {
			throw new ResourceConflict(PipelineErrorCode.STAGE_CODE_ALREADY_EXISTS.code());
		}

		return PipelineStageDetails.from(stage);
	}

	@Override
	@Transactional
	public PipelineStageDetails updateStage(UpdatePipelineStageCommand command) {
		Objects.requireNonNull(command, "command must not be null");
		TenantId tenantId = currentTenant.requireTenantId();
		ActorId actorId = currentActor.requireActorId();
		authorizer.requirePermission(SystemPermission.CRM_OPPORTUNITY_WRITE);

		PipelineStage stage = repository.findStageById(tenantId, command.pipelineId(), command.stageId())
				.orElseThrow(() -> new DomainResourceNotFound(PipelineErrorCode.PIPELINE_STAGE_NOT_FOUND.code()));

		if (stage.version() != command.version()) {
			throw new ResourceConflict(PipelineErrorCode.PIPELINE_STAGE_VERSION_CONFLICT.code());
		}

		stage.update(
				command.name(),
				command.displayOrder(),
				command.defaultProbability(),
				command.stageCategory(),
				command.forecastCategory(),
				command.active(),
				actorId,
				timeProvider.now()
		);

		repository.updateStage(stage);
		return PipelineStageDetails.from(stage);
	}

	@Override
	@Transactional
	public void deleteStage(PipelineId pipelineId, PipelineStageId stageId) {
		Objects.requireNonNull(pipelineId, "pipelineId must not be null");
		Objects.requireNonNull(stageId, "stageId must not be null");
		TenantId tenantId = currentTenant.requireTenantId();
		authorizer.requirePermission(SystemPermission.CRM_OPPORTUNITY_WRITE);

		repository.findStageById(tenantId, pipelineId, stageId)
				.orElseThrow(() -> new DomainResourceNotFound(PipelineErrorCode.PIPELINE_STAGE_NOT_FOUND.code()));

		repository.deleteStage(tenantId, pipelineId, stageId);
	}

}
