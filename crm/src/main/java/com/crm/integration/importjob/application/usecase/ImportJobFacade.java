package com.crm.integration.importjob.application.usecase;

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

public interface ImportJobFacade {

	ImportJobDetails create(CreateImportJobCommand command);

	ImportJobDetails get(ImportJobId id);

	PageResult<ImportJobSummary> search(ImportJobSearchQuery query);

	ImportJobDetails start(StartImportJobCommand command);

	ImportJobDetails updateProgress(UpdateImportProgressCommand command);

	ImportJobDetails complete(CompleteImportJobCommand command);

	ImportJobDetails fail(FailImportJobCommand command);

	ImportJobDetails cancel(CancelImportJobCommand command);

}
