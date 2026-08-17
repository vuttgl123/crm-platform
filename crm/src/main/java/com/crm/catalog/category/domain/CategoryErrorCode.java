package com.crm.catalog.category.domain;

public enum CategoryErrorCode {

	CATEGORY_NOT_FOUND("CATEGORY_NOT_FOUND"),
	CATEGORY_CODE_ALREADY_EXISTS("CATEGORY_CODE_ALREADY_EXISTS"),
	PARENT_CATEGORY_NOT_FOUND("PARENT_CATEGORY_NOT_FOUND"),
	CYCLIC_CATEGORY_HIERARCHY("CYCLIC_CATEGORY_HIERARCHY"),
	CATEGORY_VERSION_CONFLICT("CATEGORY_VERSION_CONFLICT");

	private final String code;

	CategoryErrorCode(String code) {
		this.code = code;
	}

	public String code() {
		return code;
	}

}
