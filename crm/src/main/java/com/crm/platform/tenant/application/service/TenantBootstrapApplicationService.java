package com.crm.platform.tenant.application.service;

import java.time.Instant;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

import com.crm.foundation.identifier.IdentifierGenerator;
import com.crm.foundation.security.CurrentActor;
import com.crm.foundation.security.SystemPermission;
import com.crm.foundation.time.TimeProvider;
import com.crm.platform.tenant.application.command.BootstrapTenantCommand;
import com.crm.platform.tenant.application.dto.TenantDetails;
import com.crm.platform.tenant.application.port.TenantBootstrapRepository;
import com.crm.platform.tenant.application.usecase.TenantBootstrapFacade;
import com.crm.platform.tenant.domain.Tenant;
import com.crm.platform.tenant.domain.TenantErrorCode;
import com.crm.sharedkernel.domain.ActorId;
import com.crm.sharedkernel.domain.TenantId;
import com.crm.sharedkernel.domain.exception.ResourceConflict;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class TenantBootstrapApplicationService
		implements TenantBootstrapFacade {

	private static final List<SystemPermission> TENANT_ADMIN_PERMISSIONS =
			List.of(
					SystemPermission.PLATFORM_USER_MANAGE,
					SystemPermission.PLATFORM_MEMBERSHIP_READ,
					SystemPermission.PLATFORM_MEMBERSHIP_APPROVE,
					SystemPermission.PLATFORM_ROLE_READ,
					SystemPermission.PLATFORM_ROLE_ASSIGN,
					SystemPermission.PLATFORM_ROLE_MANAGE);

	private final TenantBootstrapRepository repository;
	private final CurrentActor currentActor;
	private final IdentifierGenerator identifierGenerator;
	private final TimeProvider timeProvider;

	public TenantBootstrapApplicationService(
			TenantBootstrapRepository repository,
			CurrentActor currentActor,
			IdentifierGenerator identifierGenerator,
			TimeProvider timeProvider) {
		this.repository = repository;
		this.currentActor = currentActor;
		this.identifierGenerator = identifierGenerator;
		this.timeProvider = timeProvider;
	}

	@Override
	@Transactional
	public TenantDetails bootstrap(BootstrapTenantCommand command) {
		Objects.requireNonNull(command, "command must not be null");
		ActorId actorId = currentActor.requireActorId();

		if (!repository.lockActiveActor(actorId)) {
			throw new AccessDeniedException(
					"Active user is required for tenant bootstrap");
		}
		if (repository.hasNonRemovedMembership(actorId)) {
			throw new ResourceConflict(
					TenantErrorCode.TENANT_BOOTSTRAP_NOT_ALLOWED);
		}
		for (SystemPermission permission : TENANT_ADMIN_PERMISSIONS) {
			if (!repository.permissionExists(permission)) {
				throw new IllegalStateException(
						"Required permission " + permission + " is missing");
			}
		}

		Instant now = timeProvider.now();
		Tenant tenant = Tenant.bootstrap(
				new TenantId(identifierGenerator.nextId()),
				command.tenantCode(),
				command.legalName(),
				command.displayName(),
				command.defaultCurrencyCode(),
				command.defaultCountryCode(),
				command.defaultLanguageCode(),
				command.defaultTimezone(),
				actorId,
				now);
		UUID roleId = identifierGenerator.nextId();

		try {
			repository.insertTenant(tenant);
		}
		catch (DuplicateKeyException exception) {
			throw new ResourceConflict(
					TenantErrorCode.TENANT_CODE_ALREADY_EXISTS);
		}

		repository.insertTenantAdminMembership(tenant, actorId);
		repository.insertSystemRole(tenant.id(), roleId, actorId, now);
		for (SystemPermission permission : TENANT_ADMIN_PERMISSIONS) {
			repository.grantPermission(
					tenant.id(), roleId, permission, actorId, now);
		}
		repository.assignRole(tenant.id(), roleId, actorId, now);

		return TenantDetails.from(tenant);
	}

}
