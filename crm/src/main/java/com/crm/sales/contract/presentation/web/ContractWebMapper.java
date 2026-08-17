package com.crm.sales.contract.presentation.web;

import java.util.UUID;

import com.crm.sales.contract.application.command.CreateContractCommand;
import com.crm.sales.contract.application.command.SignContractCommand;
import com.crm.sales.contract.application.command.TerminateContractCommand;
import com.crm.sales.contract.application.command.UpdateContractCommand;
import com.crm.sales.contract.application.dto.ContractDetails;
import com.crm.sales.contract.application.dto.ContractSummary;
import com.crm.sales.contract.application.query.ContractSearchQuery;
import com.crm.sales.contract.domain.ContractId;
import com.crm.sharedkernel.application.PageQuery;
import com.crm.sharedkernel.application.PageResult;
import com.crm.sharedkernel.domain.ActorId;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface ContractWebMapper {

	CreateContractCommand toCreateCommand(CreateContractRequest request);

	default UpdateContractCommand toUpdateCommand(ContractId id, UpdateContractRequest request) {
		return new UpdateContractCommand(
				id,
				request.version(),
				request.accountId(),
				request.contactId(),
				request.opportunityId(),
				request.quoteId(),
				request.orderId(),
				request.ownerUserId(),
				request.contractType(),
				request.currencyCode(),
				request.contractValue(),
				request.effectiveFrom(),
				request.effectiveTo(),
				request.autoRenew(),
				request.renewalNoticeDays(),
				request.documentReference(),
				request.termsSnapshot()
		);
	}

	default SignContractCommand toSignCommand(ContractId id, SignContractRequest request) {
		return new SignContractCommand(
				id,
				request.version(),
				request.signedAt()
		);
	}

	default TerminateContractCommand toTerminateCommand(ContractId id, TerminateContractRequest request) {
		return new TerminateContractCommand(
				id,
				request.version(),
				request.terminationReason()
		);
	}

	default ContractSearchQuery toSearchQuery(ContractSearchRequest request) {
		if (request == null) {
			return new ContractSearchQuery(null, null, null, null, null, null, PageQuery.defaultPage());
		}
		int page = request.page() != null ? request.page() : 0;
		int size = request.size() != null ? request.size() : 20;
		return new ContractSearchQuery(
				request.q(),
				request.accountId(),
				request.status(),
				request.contractType(),
				request.effectiveFrom(),
				request.effectiveTo(),
				PageQuery.of(page, size)
		);
	}

	ContractResponse toResponse(ContractDetails details);

	ContractSummaryResponse toSummaryResponse(ContractSummary summary);

	default PageResult<ContractSummaryResponse> toSummaryPage(PageResult<ContractSummary> page) {
		return page.map(this::toSummaryResponse);
	}

	default UUID map(ActorId value) {
		return value == null ? null : value.value();
	}

	default ActorId map(UUID value) {
		return value == null ? null : new ActorId(value);
	}

	default UUID map(ContractId value) {
		return value == null ? null : value.value();
	}

	default ContractId mapToContractId(UUID value) {
		return value == null ? null : new ContractId(value);
	}

}
