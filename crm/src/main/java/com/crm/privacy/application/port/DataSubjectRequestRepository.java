package com.crm.privacy.application.port;

import java.util.Optional;

import com.crm.privacy.application.dto.DataSubjectRequestDetails;
import com.crm.privacy.application.dto.DataSubjectRequestSummary;
import com.crm.privacy.application.query.DsrSearchQuery;
import com.crm.privacy.domain.DataSubjectRequest;
import com.crm.privacy.domain.DataSubjectRequestId;
import com.crm.sharedkernel.application.PageResult;
import com.crm.sharedkernel.domain.TenantId;

public interface DataSubjectRequestRepository {

	Optional<DataSubjectRequest> findById(TenantId tenantId, DataSubjectRequestId id);

	Optional<DataSubjectRequest> findByRequestNumber(TenantId tenantId, String requestNumber);

	boolean existsByRequestNumber(TenantId tenantId, String requestNumber);

	PageResult<DataSubjectRequestSummary> search(TenantId tenantId, DsrSearchQuery query);

	void insert(DataSubjectRequest request);

	void update(DataSubjectRequest request);

}
