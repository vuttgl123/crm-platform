package com.crm.customer.lead.presentation.web;

import java.util.UUID;

import com.crm.customer.lead.application.command.ConvertLeadCommand;
import com.crm.customer.lead.application.command.CreateLeadCommand;
import com.crm.customer.lead.application.command.UpdateLeadCommand;
import com.crm.customer.lead.application.dto.LeadDetails;
import com.crm.customer.lead.application.dto.LeadSummary;
import com.crm.customer.lead.application.query.LeadSearchQuery;
import com.crm.customer.lead.domain.LeadEstimatedValue;
import com.crm.customer.lead.domain.LeadId;
import com.crm.customer.lead.domain.LeadOwner;
import com.crm.foundation.mapping.CrmMapperConfig;
import com.crm.sharedkernel.application.PageQuery;
import com.crm.sharedkernel.application.PageResult;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(config = CrmMapperConfig.class)
public interface LeadWebMapper {

	CreateLeadCommand toCreateCommand(CreateLeadRequest request);

	@Mapping(target = "leadId", source = "leadId")
	@Mapping(target = "expectedVersion", source = "request.version")
	UpdateLeadCommand toUpdateCommand(
			LeadId leadId, UpdateLeadRequest request);

	@Mapping(target = "leadId", source = "leadId")
	@Mapping(target = "expectedVersion", source = "request.version")
	ConvertLeadCommand toConvertCommand(
			LeadId leadId, ConvertLeadRequest request);

	LeadResponse toResponse(LeadDetails details);

	LeadSummaryResponse toSummaryResponse(LeadSummary summary);

	default LeadId toLeadId(UUID value) {
		return value == null ? null : new LeadId(value);
	}

	default UUID fromLeadId(LeadId value) {
		return value == null ? null : value.value();
	}

	default LeadOwner toLeadOwner(CreateLeadRequest.Owner value) {
		return value == null ? null : new LeadOwner(value.type(), value.id());
	}

	default LeadOwner toLeadOwner(UpdateLeadRequest.Owner value) {
		return value == null ? null : new LeadOwner(value.type(), value.id());
	}

	default LeadResponse.Owner toDetailOwner(LeadOwner value) {
		return value == null ? null : new LeadResponse.Owner(value.type(), value.id());
	}

	default LeadSummaryResponse.Owner toSummaryOwner(LeadOwner value) {
		return value == null ? null : new LeadSummaryResponse.Owner(value.type(), value.id());
	}

	default LeadEstimatedValue toEstimatedValue(CreateLeadRequest.EstimatedValue value) {
		return value == null ? null : new LeadEstimatedValue(value.amount(), value.currencyCode());
	}

	default LeadEstimatedValue toEstimatedValue(UpdateLeadRequest.EstimatedValue value) {
		return value == null ? null : new LeadEstimatedValue(value.amount(), value.currencyCode());
	}

	default LeadResponse.EstimatedValue toResponseValue(LeadEstimatedValue value) {
		return value == null ? null : new LeadResponse.EstimatedValue(value.amount(), value.currencyCode());
	}

	default LeadSummaryResponse.EstimatedValue toSummaryResponseValue(LeadEstimatedValue value) {
		return value == null ? null : new LeadSummaryResponse.EstimatedValue(value.amount(), value.currencyCode());
	}

	default LeadSearchQuery toSearchQuery(LeadSearchRequest request) {
		LeadOwner owner = request.ownerType() == null
				? null
				: new LeadOwner(request.ownerType(), request.ownerId());
		int page = request.page() == null ? 0 : request.page();
		int size = request.size() == null
				? PageQuery.DEFAULT_SIZE : request.size();
		return new LeadSearchQuery(
				request.q(), request.statusId(), request.sourceId(),
				request.rating(), owner, request.converted(),
				new PageQuery(page, size));
	}

	default PageResult<LeadSummaryResponse> toSummaryPage(
			PageResult<LeadSummary> page) {
		return new PageResult<>(
				page.items().stream()
						.map(this::toSummaryResponse)
						.toList(),
				page.page(),
				page.size(),
				page.totalElements(),
				page.totalPages());
	}

}
