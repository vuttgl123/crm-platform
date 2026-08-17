package com.crm.privacy.application.service;

import java.time.Instant;
import java.util.List;
import java.util.Objects;

import com.crm.foundation.identifier.IdentifierGenerator;
import com.crm.foundation.security.CurrentActor;
import com.crm.foundation.security.SystemPermission;
import com.crm.foundation.security.TenantAccessAuthorizer;
import com.crm.foundation.tenancy.CurrentTenant;
import com.crm.foundation.time.TimeProvider;
import com.crm.privacy.application.command.CreateRetentionPolicyCommand;
import com.crm.privacy.application.command.UpdateRetentionPolicyCommand;
import com.crm.privacy.application.dto.RetentionPolicyDetails;
import com.crm.privacy.application.port.RetentionPolicyRepository;
import com.crm.privacy.application.usecase.RetentionPolicyFacade;
import com.crm.privacy.domain.PrivacyErrorCode;
import com.crm.privacy.domain.RetentionPolicy;
import com.crm.privacy.domain.RetentionPolicyId;
import com.crm.sharedkernel.domain.ActorId;
import com.crm.sharedkernel.domain.TenantId;
import com.crm.sharedkernel.domain.exception.DomainResourceNotFound;
import com.crm.sharedkernel.domain.exception.ResourceConflict;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class RetentionPolicyApplicationService implements RetentionPolicyFacade {

	private final RetentionPolicyRepository retentionPolicyRepository;
	private final CurrentTenant currentTenant;
	private final CurrentActor currentActor;
	private final TenantAccessAuthorizer authorizer;
	private final IdentifierGenerator identifierGenerator;
	private final TimeProvider timeProvider;

	public RetentionPolicyApplicationService(
			RetentionPolicyRepository retentionPolicyRepository,
			CurrentTenant currentTenant,
			CurrentActor currentActor,
			TenantAccessAuthorizer authorizer,
			IdentifierGenerator identifierGenerator,
			TimeProvider timeProvider) {
		this.retentionPolicyRepository = retentionPolicyRepository;
		this.currentTenant = currentTenant;
		this.currentActor = currentActor;
		this.authorizer = authorizer;
		this.identifierGenerator = identifierGenerator;
		this.timeProvider = timeProvider;
	}

	@Override
	@Transactional
	public RetentionPolicyDetails create(CreateRetentionPolicyCommand command) {
		Objects.requireNonNull(command, "command must not be null");
		TenantId tenantId = currentTenant.requireTenantId();
		ActorId actorId = currentActor.requireActorId();
		authorizer.requirePermission(SystemPermission.PRIVACY_CONSENT_WRITE);

		if (retentionPolicyRepository.findByEntityAndPurpose(tenantId, command.entityType(), command.purpose()).isPresent()) {
			throw new ResourceConflict(PrivacyErrorCode.RETENTION_POLICY_ALREADY_EXISTS.code());
		}

		Instant now = timeProvider.now();
		RetentionPolicyId id = new RetentionPolicyId(identifierGenerator.nextId());

		RetentionPolicy policy = RetentionPolicy.create(
				tenantId,
				id,
				command.entityType(),
				command.purpose(),
				command.retentionDays(),
				command.actionOnExpiry(),
				command.legalBasis(),
				actorId,
				now
		);

		try {
			retentionPolicyRepository.insert(policy);
		}
		catch (DuplicateKeyException e) {
			throw new ResourceConflict(PrivacyErrorCode.RETENTION_POLICY_ALREADY_EXISTS.code());
		}

		return RetentionPolicyDetails.from(policy);
	}

	@Override
	@Transactional(readOnly = true)
	public RetentionPolicyDetails get(RetentionPolicyId id) {
		Objects.requireNonNull(id, "id must not be null");
		TenantId tenantId = currentTenant.requireTenantId();
		authorizer.requirePermission(SystemPermission.PRIVACY_CONSENT_READ);

		RetentionPolicy policy = retentionPolicyRepository.findById(tenantId, id)
				.orElseThrow(() -> new DomainResourceNotFound(PrivacyErrorCode.RETENTION_POLICY_NOT_FOUND.code()));

		return RetentionPolicyDetails.from(policy);
	}

	@Override
	@Transactional(readOnly = true)
	public List<RetentionPolicyDetails> list() {
		TenantId tenantId = currentTenant.requireTenantId();
		authorizer.requirePermission(SystemPermission.PRIVACY_CONSENT_READ);
		return retentionPolicyRepository.findAll(tenantId);
	}

	@Override
	@Transactional
	public RetentionPolicyDetails update(UpdateRetentionPolicyCommand command) {
		Objects.requireNonNull(command, "command must not be null");
		TenantId tenantId = currentTenant.requireTenantId();
		ActorId actorId = currentActor.requireActorId();
		authorizer.requirePermission(SystemPermission.PRIVACY_CONSENT_WRITE);

		RetentionPolicy policy = retentionPolicyRepository.findById(tenantId, command.id())
				.orElseThrow(() -> new DomainResourceNotFound(PrivacyErrorCode.RETENTION_POLICY_NOT_FOUND.code()));

		if (policy.version() != command.version()) {
			throw new ResourceConflict(PrivacyErrorCode.PRIVACY_VERSION_CONFLICT.code());
		}

		policy.update(
				command.retentionDays(),
				command.actionOnExpiry(),
				command.legalBasis(),
				command.active(),
				actorId,
				timeProvider.now()
		);

		retentionPolicyRepository.update(policy);
		return RetentionPolicyDetails.from(policy);
	}

	@Override
	@Transactional
	public void delete(RetentionPolicyId id, long version) {
		Objects.requireNonNull(id, "id must not be null");
		TenantId tenantId = currentTenant.requireTenantId();
		authorizer.requirePermission(SystemPermission.PRIVACY_CONSENT_WRITE);

		RetentionPolicy policy = retentionPolicyRepository.findById(tenantId, id)
				.orElseThrow(() -> new DomainResourceNotFound(PrivacyErrorCode.RETENTION_POLICY_NOT_FOUND.code()));

		if (policy.version() != version) {
			throw new ResourceConflict(PrivacyErrorCode.PRIVACY_VERSION_CONFLICT.code());
		}

		retentionPolicyRepository.delete(tenantId, id, version);
	}

}
