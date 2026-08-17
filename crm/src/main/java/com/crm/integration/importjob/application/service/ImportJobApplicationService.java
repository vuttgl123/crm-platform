package com.crm.integration.importjob.application.service;

import java.time.Instant;
import java.util.Objects;

import com.crm.foundation.identifier.IdentifierGenerator;
import com.crm.foundation.security.CurrentActor;
import com.crm.foundation.security.SystemPermission;
import com.crm.foundation.security.TenantAccessAuthorizer;
import com.crm.foundation.tenancy.CurrentTenant;
import com.crm.foundation.time.TimeProvider;
import com.crm.integration.importjob.application.command.CancelImportJobCommand;
import com.crm.integration.importjob.application.command.CompleteImportJobCommand;
import com.crm.integration.importjob.application.command.CreateImportJobCommand;
import com.crm.integration.importjob.application.command.FailImportJobCommand;
import com.crm.integration.importjob.application.command.StartImportJobCommand;
import com.crm.integration.importjob.application.command.UpdateImportProgressCommand;
import com.crm.integration.importjob.application.dto.ImportJobDetails;
import com.crm.integration.importjob.application.dto.ImportJobSummary;
import com.crm.integration.importjob.application.port.ImportJobRepository;
import com.crm.integration.importjob.application.query.ImportJobSearchQuery;
import com.crm.integration.importjob.application.usecase.ImportJobFacade;
import com.crm.integration.importjob.domain.ImportJob;
import com.crm.integration.importjob.domain.ImportJobErrorCode;
import com.crm.integration.importjob.domain.ImportJobId;
import com.crm.sharedkernel.application.PageResult;
import com.crm.sharedkernel.domain.ActorId;
import com.crm.sharedkernel.domain.TenantId;
import com.crm.sharedkernel.domain.exception.DomainResourceNotFound;
import com.crm.sharedkernel.domain.exception.ResourceConflict;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ImportJobApplicationService implements ImportJobFacade {

	private final ImportJobRepository repository;
	private final CurrentTenant currentTenant;
	private final CurrentActor currentActor;
	private final TenantAccessAuthorizer authorizer;
	private final IdentifierGenerator identifierGenerator;
	private final TimeProvider timeProvider;

	public ImportJobApplicationService(
			ImportJobRepository repository,
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
	public ImportJobDetails create(CreateImportJobCommand command) {
		Objects.requireNonNull(command, "command must not be null");
		TenantId tenantId = currentTenant.requireTenantId();
		ActorId actorId = currentActor.requireActorId();
		authorizer.requirePermission(SystemPermission.INTEGRATION_MANAGE);

		Instant now = timeProvider.now();
		ImportJobId id = new ImportJobId(identifierGenerator.nextId());

		ImportJob job = ImportJob.create(
				tenantId,
				id,
				command.jobType(),
				command.sourceType(),
				command.sourceReference(),
				command.targetEntityType(),
				command.totalRows(),
				command.mappingConfig(),
				actorId,
				now
		);

		repository.insert(job);
		return ImportJobDetails.from(job);
	}

	@Override
	@Transactional(readOnly = true)
	public ImportJobDetails get(ImportJobId id) {
		Objects.requireNonNull(id, "id must not be null");
		TenantId tenantId = currentTenant.requireTenantId();
		authorizer.requirePermission(SystemPermission.INTEGRATION_READ);

		ImportJob job = repository.findById(tenantId, id)
				.orElseThrow(() -> new DomainResourceNotFound(ImportJobErrorCode.IMPORT_JOB_NOT_FOUND.code()));

		return ImportJobDetails.from(job);
	}

	@Override
	@Transactional(readOnly = true)
	public PageResult<ImportJobSummary> search(ImportJobSearchQuery query) {
		Objects.requireNonNull(query, "query must not be null");
		TenantId tenantId = currentTenant.requireTenantId();
		authorizer.requirePermission(SystemPermission.INTEGRATION_READ);

		return repository.findPage(tenantId, query);
	}

	@Override
	@Transactional
	public ImportJobDetails start(StartImportJobCommand command) {
		Objects.requireNonNull(command, "command must not be null");
		TenantId tenantId = currentTenant.requireTenantId();
		ActorId actorId = currentActor.requireActorId();
		authorizer.requirePermission(SystemPermission.INTEGRATION_MANAGE);

		ImportJob job = repository.findById(tenantId, command.id())
				.orElseThrow(() -> new DomainResourceNotFound(ImportJobErrorCode.IMPORT_JOB_NOT_FOUND.code()));

		if (job.version() != command.version()) {
			throw new ResourceConflict(ImportJobErrorCode.IMPORT_VERSION_CONFLICT.code());
		}

		job.start(timeProvider.now(), actorId);
		repository.update(job);
		return ImportJobDetails.from(job);
	}

	@Override
	@Transactional
	public ImportJobDetails updateProgress(UpdateImportProgressCommand command) {
		Objects.requireNonNull(command, "command must not be null");
		TenantId tenantId = currentTenant.requireTenantId();
		ActorId actorId = currentActor.requireActorId();
		authorizer.requirePermission(SystemPermission.INTEGRATION_MANAGE);

		ImportJob job = repository.findById(tenantId, command.id())
				.orElseThrow(() -> new DomainResourceNotFound(ImportJobErrorCode.IMPORT_JOB_NOT_FOUND.code()));

		if (job.version() != command.version()) {
			throw new ResourceConflict(ImportJobErrorCode.IMPORT_VERSION_CONFLICT.code());
		}

		job.updateProgress(command.processedRows(), command.successRows(), command.errorRows(), actorId, timeProvider.now());
		repository.update(job);
		return ImportJobDetails.from(job);
	}

	@Override
	@Transactional
	public ImportJobDetails complete(CompleteImportJobCommand command) {
		Objects.requireNonNull(command, "command must not be null");
		TenantId tenantId = currentTenant.requireTenantId();
		ActorId actorId = currentActor.requireActorId();
		authorizer.requirePermission(SystemPermission.INTEGRATION_MANAGE);

		ImportJob job = repository.findById(tenantId, command.id())
				.orElseThrow(() -> new DomainResourceNotFound(ImportJobErrorCode.IMPORT_JOB_NOT_FOUND.code()));

		if (job.version() != command.version()) {
			throw new ResourceConflict(ImportJobErrorCode.IMPORT_VERSION_CONFLICT.code());
		}

		job.complete(command.processedRows(), command.successRows(), command.errorRows(), command.errorReportReference(), actorId, timeProvider.now());
		repository.update(job);
		return ImportJobDetails.from(job);
	}

	@Override
	@Transactional
	public ImportJobDetails fail(FailImportJobCommand command) {
		Objects.requireNonNull(command, "command must not be null");
		TenantId tenantId = currentTenant.requireTenantId();
		ActorId actorId = currentActor.requireActorId();
		authorizer.requirePermission(SystemPermission.INTEGRATION_MANAGE);

		ImportJob job = repository.findById(tenantId, command.id())
				.orElseThrow(() -> new DomainResourceNotFound(ImportJobErrorCode.IMPORT_JOB_NOT_FOUND.code()));

		if (job.version() != command.version()) {
			throw new ResourceConflict(ImportJobErrorCode.IMPORT_VERSION_CONFLICT.code());
		}

		job.fail(command.errorReportReference(), actorId, timeProvider.now());
		repository.update(job);
		return ImportJobDetails.from(job);
	}

	@Override
	@Transactional
	public ImportJobDetails cancel(CancelImportJobCommand command) {
		Objects.requireNonNull(command, "command must not be null");
		TenantId tenantId = currentTenant.requireTenantId();
		ActorId actorId = currentActor.requireActorId();
		authorizer.requirePermission(SystemPermission.INTEGRATION_MANAGE);

		ImportJob job = repository.findById(tenantId, command.id())
				.orElseThrow(() -> new DomainResourceNotFound(ImportJobErrorCode.IMPORT_JOB_NOT_FOUND.code()));

		if (job.version() != command.version()) {
			throw new ResourceConflict(ImportJobErrorCode.IMPORT_VERSION_CONFLICT.code());
		}

		try {
			job.cancel(actorId, timeProvider.now());
		}
		catch (IllegalStateException e) {
			throw new ResourceConflict(ImportJobErrorCode.IMPORT_JOB_CANNOT_BE_CANCELLED.code());
		}

		repository.update(job);
		return ImportJobDetails.from(job);
	}

}
