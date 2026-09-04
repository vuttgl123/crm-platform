package com.crm.platform.settings.application.service;

import com.crm.sharedkernel.domain.ActorId;
import com.crm.sharedkernel.domain.TenantId;

record AccessContext(TenantId tenantId, ActorId actorId) {
}
