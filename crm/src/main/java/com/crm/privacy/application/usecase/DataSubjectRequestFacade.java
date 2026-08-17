package com.crm.privacy.application.usecase;

import com.crm.privacy.application.command.CreateDataSubjectRequestCommand;
import com.crm.privacy.application.command.UpdateDataSubjectRequestStatusCommand;
import com.crm.privacy.application.dto.DataSubjectRequestDetails;
import com.crm.privacy.application.dto.DataSubjectRequestSummary;
import com.crm.privacy.application.query.DsrSearchQuery;
import com.crm.privacy.domain.DataSubjectRequestId;
import com.crm.sharedkernel.application.PageResult;

public interface DataSubjectRequestFacade {

	DataSubjectRequestDetails create(CreateDataSubjectRequestCommand command);

	DataSubjectRequestDetails get(DataSubjectRequestId id);

	PageResult<DataSubjectRequestSummary> search(DsrSearchQuery query);

	DataSubjectRequestDetails updateStatus(UpdateDataSubjectRequestStatusCommand command);

}
