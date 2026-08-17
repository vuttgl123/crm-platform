package com.crm.catalog.category.presentation.web;

import java.util.List;
import java.util.UUID;

import com.crm.catalog.category.application.command.CreateCategoryCommand;
import com.crm.catalog.category.application.command.UpdateCategoryCommand;
import com.crm.catalog.category.application.dto.CategoryDetails;
import com.crm.catalog.category.application.dto.CategorySummary;
import com.crm.catalog.category.domain.CategoryId;
import com.crm.sharedkernel.domain.ActorId;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface CategoryWebMapper {

	CreateCategoryCommand toCreateCommand(CreateCategoryRequest request);

	default UpdateCategoryCommand toUpdateCommand(CategoryId id, UpdateCategoryRequest request) {
		return new UpdateCategoryCommand(
				id,
				request.version(),
				request.name(),
				request.parentCategoryId(),
				request.description(),
				request.isActive()
		);
	}

	CategoryResponse toResponse(CategoryDetails details);

	CategorySummaryResponse toSummaryResponse(CategorySummary summary);

	List<CategorySummaryResponse> toSummaryResponseList(List<CategorySummary> summaries);

	default UUID map(ActorId value) {
		return value == null ? null : value.value();
	}

	default ActorId map(UUID value) {
		return value == null ? null : new ActorId(value);
	}

	default UUID map(CategoryId value) {
		return value == null ? null : value.value();
	}

	default CategoryId mapToCategoryId(UUID value) {
		return value == null ? null : new CategoryId(value);
	}

}
