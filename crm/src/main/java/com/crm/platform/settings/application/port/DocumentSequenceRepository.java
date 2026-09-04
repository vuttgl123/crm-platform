package com.crm.platform.settings.application.port;

import java.util.List;
import java.util.Optional;

import com.crm.platform.settings.domain.DocumentSequence;
import com.crm.sharedkernel.domain.TenantId;

public interface DocumentSequenceRepository {

	List<DocumentSequence> findAll(TenantId tenantId);

	Optional<DocumentSequence> findByEntityType(TenantId tenantId, String entityType);

	void save(DocumentSequence sequence);
}
