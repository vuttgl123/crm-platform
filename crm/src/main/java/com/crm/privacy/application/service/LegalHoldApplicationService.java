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
import com.crm.privacy.application.command.CreateLegalHoldCommand;
import com.crm.privacy.application.command.ReleaseLegalHoldCommand;
import com.crm.privacy.application.dto.LegalHoldDetails;
import com.crm.privacy.application.port.LegalHoldRepository;
import com.crm.privacy.application.usecase.LegalHoldFacade;
import com.crm.privacy.domain.LegalHold;
import com.crm.privacy.domain.LegalHoldId;
import com.crm.privacy.domain.PrivacyErrorCode;
import com.crm.sharedkernel.domain.ActorId;
import com.crm.sharedkernel.domain.TenantId;
import com.crm.sharedkernel.domain.exception.DomainResourceNotFound;
import com.crm.sharedkernel.domain.exception.ResourceConflict;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class LegalHoldApplicationService implements LegalHoldFacade {

	private final LegalHoldRepository legalHoldRepository;
	private final CurrentTenant currentTenant;
	private final CurrentActor currentActor;
	private final TenantAccessAuthorizer authorizer;
	private final IdentifierGenerator identifierGenerator;
	private final TimeProvider timeProvider;

	public LegalHoldApplicationService(
			LegalHoldRepository legalHoldRepository,
			CurrentTenant currentTenant,
			CurrentActor currentActor,
			TenantAccessAuthorizer authorizer,
			IdentifierGenerator identifierGenerator,
			TimeProvider timeProvider) {
		this.legalHoldRepository = legalHoldRepository;
		this.currentTenant = currentTenant;
		this.currentActor = currentActor;
		this.authorizer = authorizer;
		this.identifierGenerator = identifierGenerator;
		this.timeProvider = timeProvider;
	}

	@Override
	@Transactional
	public LegalHoldDetails create(CreateLegalHoldCommand command) {
		Objects.requireNonNull(command, "command must not be null");
		TenantId tenantId = currentTenant.requireTenantId();
		ActorId actorId = currentActor.requireActorId();
		authorizer.requirePermission(SystemPermission.PRIVACY_CONSENT_WRITE);

		if (legalHoldRepository.existsByHoldCode(tenantId, command.holdCode())) {
			throw new ResourceConflict(PrivacyErrorCode.LEGAL_HOLD_CODE_ALREADY_EXISTS.code());
		}

		Instant now = timeProvider.now();
		LegalHoldId id = new LegalHoldId(identifierGenerator.nextId());

		LegalHold hold = LegalHold.create(
				tenantId,
				id,
				command.holdCode(),
				command.name(),
				command.entityType(),
				command.entityId(),
				command.scopeFilter(),
				command.reason(),
				actorId,
				now
		);

		try {
			legalHoldRepository.insert(hold);
		}
		catch (DuplicateKeyException e) {
			throw new ResourceConflict(PrivacyErrorCode.LEGAL_HOLD_CODE_ALREADY_EXISTS.code());
		}

		return LegalHoldDetails.from(hold);
	}

	@Override
	@Transactional(readOnly = true)
	public LegalHoldDetails get(LegalHoldId id) {
		Objects.requireNonNull(id, "id must not be null");
		TenantId tenantId = currentTenant.requireTenantId();
		authorizer.requirePermission(SystemPermission.PRIVACY_CONSENT_READ);

		LegalHold hold = legalHoldRepository.findById(tenantId, id)
				.orElseThrow(() -> new DomainResourceNotFound(PrivacyErrorCode.LEGAL_HOLD_NOT_FOUND.code()));

		return LegalHoldDetails.from(hold);
	}

	@Override
	@Transactional(readOnly = true)
	public List<LegalHoldDetails> list() {
		TenantId tenantId = currentTenant.requireTenantId();
		authorizer.requirePermission(SystemPermission.PRIVACY_CONSENT_READ);
		return legalHoldRepository.findAll(tenantId);
	}

	@Override
	@Transactional
	public LegalHoldDetails release(ReleaseLegalHoldCommand command) {
		Objects.requireNonNull(command, "command must not be null");
		TenantId tenantId = currentTenant.requireTenantId();
		ActorId actorId = currentActor.requireActorId();
		authorizer.requirePermission(SystemPermission.PRIVACY_CONSENT_WRITE);

		LegalHold hold = legalHoldRepository.findById(tenantId, command.id())
				.orElseThrow(() -> new DomainResourceNotFound(PrivacyErrorCode.LEGAL_HOLD_NOT_FOUND.code()));

		if (hold.isReleased()) {
			throw new ResourceConflict(PrivacyErrorCode.LEGAL_HOLD_ALREADY_RELEASED.code());
		}

		hold.release(actorId, timeProvider.now());
		legalHoldRepository.update(hold);
		return LegalHoldDetails.from(hold);
	}

}
