package com.crm.catalog.product.domain;

public enum ProductErrorCode {

	PRODUCT_NOT_FOUND("PRODUCT_NOT_FOUND"),
	PRODUCT_SKU_ALREADY_EXISTS("PRODUCT_SKU_ALREADY_EXISTS"),
	CATEGORY_NOT_FOUND("CATEGORY_NOT_FOUND"),
	PRODUCT_VERSION_CONFLICT("PRODUCT_VERSION_CONFLICT"),
	INVALID_PRODUCT_DATA("INVALID_PRODUCT_DATA");

	private final String code;

	ProductErrorCode(String code) {
		this.code = code;
	}

	public String code() {
		return code;
	}

}
