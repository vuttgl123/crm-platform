package com.crm.integration.importjob.domain;

public enum ImportJobStatus {
	PENDING,
	VALIDATING,
	RUNNING,
	COMPLETED,
	COMPLETED_WITH_ERRORS,
	FAILED,
	CANCELLED
}
