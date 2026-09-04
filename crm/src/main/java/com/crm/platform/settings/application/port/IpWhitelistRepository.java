package com.crm.platform.settings.application.port;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import com.crm.platform.settings.domain.IpWhitelistRule;
import com.crm.sharedkernel.domain.TenantId;

public interface IpWhitelistRepository {

	List<IpWhitelistRule> findAll(TenantId tenantId);

	Optional<IpWhitelistRule> findById(TenantId tenantId, UUID id);

	void insert(IpWhitelistRule rule);

	void delete(TenantId tenantId, UUID id);
}
