package com.crm.privacy.application.service;

import java.time.Instant;
import java.util.Objects;

import com.crm.foundation.identifier.IdentifierGenerator;
import com.crm.foundation.security.CurrentActor;
import com.crm.foundation.security.SystemPermission;
import com.crm.foundation.security.TenantAccessAuthorizer;
import com.crm.foundation.tenancy.CurrentTenant;
import com.crm.foundation.time.TimeProvider;
import com.crm.privacy.application.command.CreateDataSubjectRequestCommand;
import com.crm.privacy.application.command.UpdateDataSubjectRequestStatusCommand;
import com.crm.privacy.application.dto.DataSubjectRequestDetails;
import com.crm.privacy.application.dto.DataSubjectRequestSummary;
import com.crm.privacy.application.port.DataSubjectRequestRepository;
import com.crm.privacy.application.query.DsrSearchQuery;
import com.crm.privacy.application.usecase.DataSubjectRequestFacade;
import com.crm.privacy.domain.DataSubjectRequest;
import com.crm.privacy.domain.DataSubjectRequestId;
import com.crm.privacy.domain.PrivacyErrorCode;
import com.crm.sharedkernel.application.PageResult;
import com.crm.sharedkernel.domain.ActorId;
import com.crm.sharedkernel.domain.TenantId;
import com.crm.sharedkernel.domain.exception.DomainResourceNotFound;
import com.crm.sharedkernel.domain.exception.ResourceConflict;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class DataSubjectRequestApplicationService implements DataSubjectRequestFacade {

	private final DataSubjectRequestRepository dsrRepository;
	private final CurrentTenant currentTenant;
	private final CurrentActor currentActor;
	private final TenantAccessAuthorizer authorizer;
	private final IdentifierGenerator identifierGenerator;
	private final TimeProvider timeProvider;

	public DataSubjectRequestApplicationService(
			DataSubjectRequestRepository dsrRepository,
			CurrentTenant currentTenant,
			CurrentActor currentActor,
			TenantAccessAuthorizer authorizer,
			IdentifierGenerator identifierGenerator,
			TimeProvider timeProvider) {
		this.dsrRepository = dsrRepository;
		this.currentTenant = currentTenant;
		this.currentActor = currentActor;
		this.authorizer = authorizer;
		this.identifierGenerator = identifierGenerator;
		this.timeProvider = timeProvider;
	}

	@Override
	@Transactional
	public DataSubjectRequestDetails create(CreateDataSubjectRequestCommand command) {
		Objects.requireNonNull(command, "command must not be null");
		TenantId tenantId = currentTenant.requireTenantId();
		ActorId actorId = currentActor.requireActorId();
		authorizer.requirePermission(SystemPermission.PRIVACY_CONSENT_WRITE);

		if (dsrRepository.existsByRequestNumber(tenantId, command.requestNumber())) {
			throw new ResourceConflict(PrivacyErrorCode.DSR_NUMBER_ALREADY_EXISTS.code());
		}

		Instant now = timeProvider.now();
		DataSubjectRequestId id = new DataSubjectRequestId(identifierGenerator.nextId());

		DataSubjectRequest request = DataSubjectRequest.create(
				tenantId,
				id,
				command.requestNumber(),
				command.requestType(),
				command.accountId(),
				command.contactId(),
				command.leadId(),
				command.requesterEmail(),
				command.dueAt(),
				command.assignedUserId(),
				command.verificationReference(),
				actorId,
				now
		);

		try {
			dsrRepository.insert(request);
		}
		catch (DuplicateKeyException e) {
			throw new ResourceConflict(PrivacyErrorCode.DSR_NUMBER_ALREADY_EXISTS.code());
		}

		return DataSubjectRequestDetails.from(request);
	}

	@Override
	@Transactional(readOnly = true)
	public DataSubjectRequestDetails get(DataSubjectRequestId id) {
		Objects.requireNonNull(id, "id must not be null");
		TenantId tenantId = currentTenant.requireTenantId();
		authorizer.requirePermission(SystemPermission.PRIVACY_CONSENT_READ);

		DataSubjectRequest request = dsrRepository.findById(tenantId, id)
				.orElseThrow(() -> new DomainResourceNotFound(PrivacyErrorCode.DSR_NOT_FOUND.code()));

		return DataSubjectRequestDetails.from(request);
	}

	@Override
	@Transactional(readOnly = true)
	public PageResult<DataSubjectRequestSummary> search(DsrSearchQuery query) {
		TenantId tenantId = currentTenant.requireTenantId();
		authorizer.requirePermission(SystemPermission.PRIVACY_CONSENT_READ);
		return dsrRepository.search(tenantId, query != null ? query : new DsrSearchQuery(null, null, null, null));
	}

	@Override
	@Transactional
	public DataSubjectRequestDetails updateStatus(UpdateDataSubjectRequestStatusCommand command) {
		Objects.requireNonNull(command, "command must not be null");
		TenantId tenantId = currentTenant.requireTenantId();
		ActorId actorId = currentActor.requireActorId();
		authorizer.requirePermission(SystemPermission.PRIVACY_CONSENT_WRITE);

		DataSubjectRequest request = dsrRepository.findById(tenantId, command.id())
				.orElseThrow(() -> new DomainResourceNotFound(PrivacyErrorCode.DSR_NOT_FOUND.code()));

		if (request.version() != command.version()) {
			throw new ResourceConflict(PrivacyErrorCode.PRIVACY_VERSION_CONFLICT.code());
		}

		request.updateStatus(
				command.status(),
				command.assignedUserId(),
				command.verificationReference(),
				command.resolutionSummary(),
				command.rejectionReason(),
				actorId,
				timeProvider.now()
		);

		dsrRepository.update(request);
		return DataSubjectRequestDetails.from(request);
	}

}
