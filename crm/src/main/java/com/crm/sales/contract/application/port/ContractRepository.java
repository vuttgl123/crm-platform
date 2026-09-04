package com.crm.sales.contract.application.port;

import java.util.Optional;

import com.crm.sales.contract.application.dto.ContractSummary;
import com.crm.sales.contract.application.query.ContractSearchQuery;
import com.crm.sales.contract.domain.Contract;
import com.crm.sales.contract.domain.ContractId;
import com.crm.sharedkernel.application.PageResult;
import com.crm.sharedkernel.domain.TenantId;

public interface ContractRepository {

	Optional<Contract> findById(TenantId tenantId, ContractId id);

	Optional<Contract> findByContractNumber(TenantId tenantId, String contractNumber);

	boolean existsByContractNumber(TenantId tenantId, String contractNumber);

	PageResult<ContractSummary> search(TenantId tenantId, ContractSearchQuery query);

	void insert(Contract contract);

	void update(Contract contract);

	void delete(TenantId tenantId, ContractId id, long version);

	com.crm.sales.contract.application.dto.ContractStatsDto getStats(
			TenantId tenantId,
			com.crm.sharedkernel.domain.ActorId actorId,
			com.crm.foundation.security.AuthorizedDataAccess access);

	int bulkSubmitReview(
			TenantId tenantId,
			java.util.List<ContractId> ids,
			com.crm.sharedkernel.domain.ActorId actorId,
			java.time.Instant now);

}
