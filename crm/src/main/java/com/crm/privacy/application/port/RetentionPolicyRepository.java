package com.crm.privacy.application.port;

import java.util.List;
import java.util.Optional;

import com.crm.privacy.application.dto.RetentionPolicyDetails;
import com.crm.privacy.domain.RetentionPolicy;
import com.crm.privacy.domain.RetentionPolicyId;
import com.crm.sharedkernel.domain.TenantId;

public interface RetentionPolicyRepository {

	Optional<RetentionPolicy> findById(TenantId tenantId, RetentionPolicyId id);

	Optional<RetentionPolicy> findByEntityAndPurpose(TenantId tenantId, String entityType, String purpose);

	List<RetentionPolicyDetails> findAll(TenantId tenantId);

	void insert(RetentionPolicy policy);

	void update(RetentionPolicy policy);

	void delete(TenantId tenantId, RetentionPolicyId id, long version);

}
