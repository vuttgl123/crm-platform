package com.crm.sharedkernel.application;

import java.util.List;
import java.util.Objects;
import java.util.function.Function;

public record PageResult<T>(
		List<T> items,
		int page,
		int size,
		long totalElements,
		int totalPages) {

	public PageResult {
		items = List.copyOf(Objects.requireNonNull(items,
				"items must not be null"));
		if (page < 0 || size < 1 || totalElements < 0 || totalPages < 0) {
			throw new IllegalArgumentException("page metadata must not be negative");
		}
	}

	public static <T> PageResult<T> of(List<T> items, PageQuery query,
			long totalElements) {
		Objects.requireNonNull(query, "query must not be null");
		if (totalElements < 0) {
			throw new IllegalArgumentException("totalElements must not be negative");
		}
		long pageCount = totalElements == 0
				? 0
				: ((totalElements - 1) / query.size()) + 1;
		return new PageResult<>(items, query.page(), query.size(), totalElements,
				Math.toIntExact(pageCount));
	}

	public static <T> PageResult<T> of(List<T> items, long totalElements, PageQuery query) {
		return of(items, query, totalElements);
	}

	public <R> PageResult<R> map(Function<? super T, R> mapper) {
		Objects.requireNonNull(mapper, "mapper must not be null");
		List<R> mappedItems = items.stream().map(mapper).toList();
		return new PageResult<>(mappedItems, page, size, totalElements, totalPages);
	}

	public boolean first() {
		return page == 0;
	}

	public boolean last() {
		return totalPages == 0 || page >= totalPages - 1;
	}

}
