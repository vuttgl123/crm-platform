package com.crm.privacy.presentation.web;

import java.util.UUID;

import com.crm.privacy.application.command.CreateDataSubjectRequestCommand;
import com.crm.privacy.application.command.UpdateDataSubjectRequestStatusCommand;
import com.crm.privacy.application.dto.DataSubjectRequestDetails;
import com.crm.privacy.application.dto.DataSubjectRequestSummary;
import com.crm.privacy.domain.DataSubjectRequestId;
import com.crm.sharedkernel.application.PageResult;
import com.crm.sharedkernel.domain.ActorId;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface DsrWebMapper {

	CreateDataSubjectRequestCommand toCreateCommand(CreateDataSubjectRequestRequest request);

	default UpdateDataSubjectRequestStatusCommand toUpdateStatusCommand(DataSubjectRequestId id, UpdateDataSubjectRequestStatusRequest request) {
		return new UpdateDataSubjectRequestStatusCommand(
				id,
				request.version(),
				request.status(),
				request.assignedUserId(),
				request.verificationReference(),
				request.resolutionSummary(),
				request.rejectionReason()
		);
	}

	DataSubjectRequestResponse toResponse(DataSubjectRequestDetails details);

	DataSubjectRequestSummaryResponse toSummaryResponse(DataSubjectRequestSummary summary);

	default PageResult<DataSubjectRequestSummaryResponse> toSummaryPage(PageResult<DataSubjectRequestSummary> page) {
		return page.map(this::toSummaryResponse);
	}

	default UUID map(ActorId value) {
		return value == null ? null : value.value();
	}

	default ActorId map(UUID value) {
		return value == null ? null : new ActorId(value);
	}

	default UUID map(DataSubjectRequestId value) {
		return value == null ? null : value.value();
	}

	default DataSubjectRequestId mapToDataSubjectRequestId(UUID value) {
		return value == null ? null : new DataSubjectRequestId(value);
	}

}
