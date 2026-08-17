package com.crm.privacy.application.service;

import java.time.Instant;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

import com.crm.foundation.identifier.IdentifierGenerator;
import com.crm.foundation.security.CurrentActor;
import com.crm.foundation.security.SystemPermission;
import com.crm.foundation.security.TenantAccessAuthorizer;
import com.crm.foundation.tenancy.CurrentTenant;
import com.crm.foundation.time.TimeProvider;
import com.crm.privacy.application.command.CaptureConsentCommand;
import com.crm.privacy.application.command.WithdrawConsentCommand;
import com.crm.privacy.application.dto.ConsentDetails;
import com.crm.privacy.application.port.ConsentRepository;
import com.crm.privacy.application.usecase.ConsentFacade;
import com.crm.privacy.domain.Consent;
import com.crm.privacy.domain.ConsentId;
import com.crm.privacy.domain.ConsentStatus;
import com.crm.privacy.domain.PrivacyErrorCode;
import com.crm.sharedkernel.domain.ActorId;
import com.crm.sharedkernel.domain.TenantId;
import com.crm.sharedkernel.domain.exception.DomainResourceNotFound;
import com.crm.sharedkernel.domain.exception.ResourceConflict;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ConsentApplicationService implements ConsentFacade {

	private final ConsentRepository consentRepository;
	private final CurrentTenant currentTenant;
	private final CurrentActor currentActor;
	private final TenantAccessAuthorizer authorizer;
	private final IdentifierGenerator identifierGenerator;
	private final TimeProvider timeProvider;

	public ConsentApplicationService(
			ConsentRepository consentRepository,
			CurrentTenant currentTenant,
			CurrentActor currentActor,
			TenantAccessAuthorizer authorizer,
			IdentifierGenerator identifierGenerator,
			TimeProvider timeProvider) {
		this.consentRepository = consentRepository;
		this.currentTenant = currentTenant;
		this.currentActor = currentActor;
		this.authorizer = authorizer;
		this.identifierGenerator = identifierGenerator;
		this.timeProvider = timeProvider;
	}

	@Override
	@Transactional
	public ConsentDetails capture(CaptureConsentCommand command) {
		Objects.requireNonNull(command, "command must not be null");
		TenantId tenantId = currentTenant.requireTenantId();
		ActorId actorId = currentActor.requireActorId();
		authorizer.requirePermission(SystemPermission.PRIVACY_CONSENT_WRITE);

		int targets = (command.accountId() != null ? 1 : 0) + (command.contactId() != null ? 1 : 0) + (command.leadId() != null ? 1 : 0);
		if (targets != 1) {
			throw new ResourceConflict(PrivacyErrorCode.INVALID_CONSENT_TARGET.code());
		}

		Instant now = timeProvider.now();
		ConsentId id = new ConsentId(identifierGenerator.nextId());

		Consent consent = Consent.create(
				tenantId,
				id,
				command.accountId(),
				command.contactId(),
				command.leadId(),
				command.channel(),
				command.purpose(),
				command.lawfulBasis(),
				command.consentStatus(),
				command.policyVersion(),
				command.source(),
				command.proofReference(),
				command.effectiveFrom(),
				command.expiresAt(),
				command.metadata(),
				actorId,
				now
		);

		consentRepository.insert(consent);
		return ConsentDetails.from(consent);
	}

	@Override
	@Transactional
	public ConsentDetails withdraw(WithdrawConsentCommand command) {
		Objects.requireNonNull(command, "command must not be null");
		TenantId tenantId = currentTenant.requireTenantId();
		authorizer.requirePermission(SystemPermission.PRIVACY_CONSENT_WRITE);

		Consent consent = consentRepository.findById(tenantId, command.id())
				.orElseThrow(() -> new DomainResourceNotFound(PrivacyErrorCode.CONSENT_NOT_FOUND.code()));

		if (consent.consentStatus() == ConsentStatus.WITHDRAWN) {
			throw new ResourceConflict(PrivacyErrorCode.CONSENT_ALREADY_WITHDRAWN.code());
		}

		consent.withdraw(timeProvider.now());
		consentRepository.update(consent);
		return ConsentDetails.from(consent);
	}

	@Override
	@Transactional(readOnly = true)
	public ConsentDetails get(ConsentId id) {
		Objects.requireNonNull(id, "id must not be null");
		TenantId tenantId = currentTenant.requireTenantId();
		authorizer.requirePermission(SystemPermission.PRIVACY_CONSENT_READ);

		Consent consent = consentRepository.findById(tenantId, id)
				.orElseThrow(() -> new DomainResourceNotFound(PrivacyErrorCode.CONSENT_NOT_FOUND.code()));

		return ConsentDetails.from(consent);
	}

	@Override
	@Transactional(readOnly = true)
	public List<ConsentDetails> findByTarget(UUID accountId, UUID contactId, UUID leadId) {
		TenantId tenantId = currentTenant.requireTenantId();
		authorizer.requirePermission(SystemPermission.PRIVACY_CONSENT_READ);
		return consentRepository.findByTarget(tenantId, accountId, contactId, leadId);
	}

}
