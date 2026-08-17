package com.crm.integration.importjob.presentation.web;

import java.util.List;
import java.util.UUID;

import com.crm.integration.importjob.application.command.CancelImportJobCommand;
import com.crm.integration.importjob.application.command.CompleteImportJobCommand;
import com.crm.integration.importjob.application.command.CreateImportJobCommand;
import com.crm.integration.importjob.application.command.FailImportJobCommand;
import com.crm.integration.importjob.application.command.StartImportJobCommand;
import com.crm.integration.importjob.application.command.UpdateImportProgressCommand;
import com.crm.integration.importjob.application.dto.ImportJobDetails;
import com.crm.integration.importjob.application.dto.ImportJobSummary;
import com.crm.integration.importjob.application.query.ImportJobSearchQuery;
import com.crm.integration.importjob.domain.ImportJobId;
import com.crm.sharedkernel.application.PageResult;
import com.crm.sharedkernel.domain.ActorId;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface ImportJobWebMapper {

	default CreateImportJobCommand toCreateCommand(CreateImportJobRequest request) {
		return new CreateImportJobCommand(
				request.jobType(),
				request.sourceType(),
				request.sourceReference(),
				request.targetEntityType(),
				request.totalRows(),
				request.mappingConfig()
		);
	}

	default StartImportJobCommand toStartCommand(ImportJobId id, StartImportJobRequest request) {
		return new StartImportJobCommand(id, request.version());
	}

	default UpdateImportProgressCommand toUpdateProgressCommand(ImportJobId id, UpdateImportProgressRequest request) {
		return new UpdateImportProgressCommand(
				id,
				request.version(),
				request.processedRows(),
				request.successRows(),
				request.errorRows()
		);
	}

	default CompleteImportJobCommand toCompleteCommand(ImportJobId id, CompleteImportJobRequest request) {
		return new CompleteImportJobCommand(
				id,
				request.version(),
				request.processedRows(),
				request.successRows(),
				request.errorRows(),
				request.errorReportReference()
		);
	}

	default FailImportJobCommand toFailCommand(ImportJobId id, FailImportJobRequest request) {
		return new FailImportJobCommand(
				id,
				request.version(),
				request.errorReportReference()
		);
	}

	default CancelImportJobCommand toCancelCommand(ImportJobId id, CancelImportJobRequest request) {
		return new CancelImportJobCommand(id, request.version());
	}

	default ImportJobSearchQuery toSearchQuery(ImportJobSearchRequest request) {
		return new ImportJobSearchQuery(
				request.status(),
				request.targetEntityType(),
				request.jobType(),
				request.toPageQuery()
		);
	}

	ImportJobResponse toResponse(ImportJobDetails details);

	ImportJobSummaryResponse toSummaryResponse(ImportJobSummary summary);

	List<ImportJobSummaryResponse> toSummaryResponseList(List<ImportJobSummary> summaries);

	default PageResult<ImportJobSummaryResponse> toSummaryPage(PageResult<ImportJobSummary> page) {
		return new PageResult<>(
				toSummaryResponseList(page.items()),
				page.page(),
				page.size(),
				page.totalElements(),
				page.totalPages()
		);
	}

	default UUID map(ActorId value) {
		return value == null ? null : value.value();
	}

	default ActorId map(UUID value) {
		return value == null ? null : new ActorId(value);
	}

	default UUID map(ImportJobId value) {
		return value == null ? null : value.value();
	}

	default ImportJobId mapToImportJobId(UUID value) {
		return value == null ? null : new ImportJobId(value);
	}

}
