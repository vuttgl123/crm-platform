package com.crm.integration.importjob.application.port;

import java.util.Optional;

import com.crm.integration.importjob.application.dto.ImportJobSummary;
import com.crm.integration.importjob.application.query.ImportJobSearchQuery;
import com.crm.integration.importjob.domain.ImportJob;
import com.crm.integration.importjob.domain.ImportJobId;
import com.crm.sharedkernel.application.PageResult;
import com.crm.sharedkernel.domain.TenantId;

public interface ImportJobRepository {

	Optional<ImportJob> findById(TenantId tenantId, ImportJobId id);

	PageResult<ImportJobSummary> findPage(TenantId tenantId, ImportJobSearchQuery query);

	void insert(ImportJob job);

	void update(ImportJob job);

}
