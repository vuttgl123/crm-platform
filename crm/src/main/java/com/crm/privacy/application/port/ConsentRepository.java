package com.crm.privacy.application.port;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import com.crm.privacy.application.dto.ConsentDetails;
import com.crm.privacy.domain.Consent;
import com.crm.privacy.domain.ConsentId;
import com.crm.sharedkernel.domain.TenantId;

public interface ConsentRepository {

	Optional<Consent> findById(TenantId tenantId, ConsentId id);

	List<ConsentDetails> findByTarget(TenantId tenantId, UUID accountId, UUID contactId, UUID leadId);

	void insert(Consent consent);

	void update(Consent consent);

}
