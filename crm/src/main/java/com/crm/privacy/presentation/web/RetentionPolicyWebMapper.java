package com.crm.privacy.presentation.web;

import java.util.List;
import java.util.UUID;

import com.crm.privacy.application.command.CreateRetentionPolicyCommand;
import com.crm.privacy.application.command.UpdateRetentionPolicyCommand;
import com.crm.privacy.application.dto.RetentionPolicyDetails;
import com.crm.privacy.domain.RetentionPolicyId;
import com.crm.sharedkernel.domain.ActorId;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface RetentionPolicyWebMapper {

	CreateRetentionPolicyCommand toCreateCommand(CreateRetentionPolicyRequest request);

	default UpdateRetentionPolicyCommand toUpdateCommand(RetentionPolicyId id, UpdateRetentionPolicyRequest request) {
		return new UpdateRetentionPolicyCommand(
				id,
				request.version(),
				request.retentionDays(),
				request.actionOnExpiry(),
				request.legalBasis(),
				request.active()
		);
	}

	RetentionPolicyResponse toResponse(RetentionPolicyDetails details);

	List<RetentionPolicyResponse> toResponseList(List<RetentionPolicyDetails> list);

	default UUID map(ActorId value) {
		return value == null ? null : value.value();
	}

	default ActorId map(UUID value) {
		return value == null ? null : new ActorId(value);
	}

	default UUID map(RetentionPolicyId value) {
		return value == null ? null : value.value();
	}

	default RetentionPolicyId mapToRetentionPolicyId(UUID value) {
		return value == null ? null : new RetentionPolicyId(value);
	}

}
