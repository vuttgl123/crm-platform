package com.crm.integration.importjob.domain;

public enum ImportJobErrorCode {

	IMPORT_JOB_NOT_FOUND("IMPORT_JOB_NOT_FOUND"),
	INVALID_IMPORT_STATUS_TRANSITION("INVALID_IMPORT_STATUS_TRANSITION"),
	IMPORT_JOB_CANNOT_BE_CANCELLED("IMPORT_JOB_CANNOT_BE_CANCELLED"),
	INVALID_MAPPING_CONFIG("INVALID_MAPPING_CONFIG"),
	IMPORT_VERSION_CONFLICT("IMPORT_VERSION_CONFLICT");

	private final String code;

	ImportJobErrorCode(String code) {
		this.code = code;
	}

	public String code() {
		return code;
	}

}
