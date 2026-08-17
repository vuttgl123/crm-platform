package com.crm.integration.presentation.web;

import com.crm.integration.application.dto.OutboxEventSummary;
import com.crm.sharedkernel.application.PageResult;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface OutboxWebMapper {

	OutboxEventSummaryResponse toSummaryResponse(OutboxEventSummary summary);

	default PageResult<OutboxEventSummaryResponse> toSummaryPage(PageResult<OutboxEventSummary> page) {
		return page.map(this::toSummaryResponse);
	}

}
