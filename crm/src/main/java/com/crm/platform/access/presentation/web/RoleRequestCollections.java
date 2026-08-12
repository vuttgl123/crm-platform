package com.crm.platform.access.presentation.web;

import java.util.HashSet;
import java.util.List;

final class RoleRequestCollections {

	private RoleRequestCollections() {
	}

	static List<String> permissionCodes(List<String> values) {
		if (values == null) {
			return List.of();
		}
		List<String> normalized = values.stream()
				.map(value -> value == null ? null : value.trim())
				.toList();
		if (new HashSet<>(normalized).size() != normalized.size()) {
			throw new IllegalArgumentException(
					"permissionCodes must not contain duplicates");
		}
		return List.copyOf(normalized);
	}

	static List<RoleDataScopeRequest> dataScopes(
			List<RoleDataScopeRequest> values) {
		if (values == null) {
			return List.of();
		}
		List<RoleDataScopeRequest> copy = List.copyOf(values);
		if (new HashSet<>(copy).size() != copy.size()) {
			throw new IllegalArgumentException(
					"dataScopes must not contain duplicates");
		}
		return copy;
	}

}
