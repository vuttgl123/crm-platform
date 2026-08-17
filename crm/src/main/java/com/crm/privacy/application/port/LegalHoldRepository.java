package com.crm.privacy.application.port;

import java.util.List;
import java.util.Optional;

import com.crm.privacy.application.dto.LegalHoldDetails;
import com.crm.privacy.domain.LegalHold;
import com.crm.privacy.domain.LegalHoldId;
import com.crm.sharedkernel.domain.TenantId;

public interface LegalHoldRepository {

	Optional<LegalHold> findById(TenantId tenantId, LegalHoldId id);

	Optional<LegalHold> findByHoldCode(TenantId tenantId, String holdCode);

	boolean existsByHoldCode(TenantId tenantId, String holdCode);

	List<LegalHoldDetails> findAll(TenantId tenantId);

	void insert(LegalHold hold);

	void update(LegalHold hold);

}
