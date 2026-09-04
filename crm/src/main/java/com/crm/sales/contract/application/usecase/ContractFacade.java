package com.crm.sales.contract.application.usecase;

import com.crm.sales.contract.application.command.CreateContractCommand;
import com.crm.sales.contract.application.command.SignContractCommand;
import com.crm.sales.contract.application.command.TerminateContractCommand;
import com.crm.sales.contract.application.command.UpdateContractCommand;
import com.crm.sales.contract.application.dto.ContractDetails;
import com.crm.sales.contract.application.dto.ContractSummary;
import com.crm.sales.contract.application.query.ContractSearchQuery;
import com.crm.sales.contract.domain.ContractId;
import com.crm.sharedkernel.application.PageResult;

public interface ContractFacade {

	ContractDetails create(CreateContractCommand command);

	ContractDetails get(ContractId id);

	PageResult<ContractSummary> search(ContractSearchQuery query);

	ContractDetails update(UpdateContractCommand command);

	ContractDetails submitForReview(ContractId id, long version);

	ContractDetails approve(ContractId id, long version);

	ContractDetails sendForSignature(ContractId id, long version);

	ContractDetails sign(SignContractCommand command);

	ContractDetails terminate(TerminateContractCommand command);

	void delete(ContractId id, long version);

	com.crm.sales.contract.application.dto.ContractStatsDto getStats();

	ContractDetails activate(ContractId id, long version);

	ContractDetails renew(com.crm.sales.contract.application.command.RenewContractCommand command);

	int bulkSubmitReview(com.crm.sales.contract.application.command.BulkSubmitContractReviewCommand command);

}
