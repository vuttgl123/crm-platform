package com.crm.integration.application.service;

import com.crm.foundation.security.SystemPermission;
import com.crm.foundation.security.TenantAccessAuthorizer;
import com.crm.foundation.tenancy.CurrentTenant;
import com.crm.integration.application.dto.OutboxEventSummary;
import com.crm.integration.application.port.OutboxRepository;
import com.crm.integration.application.query.OutboxSearchQuery;
import com.crm.integration.application.usecase.OutboxFacade;
import com.crm.sharedkernel.application.PageResult;
import com.crm.sharedkernel.domain.TenantId;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class OutboxApplicationService implements OutboxFacade {

	private final OutboxRepository outboxRepository;
	private final CurrentTenant currentTenant;
	private final TenantAccessAuthorizer authorizer;

	public OutboxApplicationService(
			OutboxRepository outboxRepository,
			CurrentTenant currentTenant,
			TenantAccessAuthorizer authorizer) {
		this.outboxRepository = outboxRepository;
		this.currentTenant = currentTenant;
		this.authorizer = authorizer;
	}

	@Override
	@Transactional(readOnly = true)
	public PageResult<OutboxEventSummary> search(OutboxSearchQuery query) {
		TenantId tenantId = currentTenant.requireTenantId();
		authorizer.requirePermission(SystemPermission.INTEGRATION_READ);
		return outboxRepository.search(tenantId, query != null ? query : new OutboxSearchQuery(null, null, null, null, null));
	}

}
