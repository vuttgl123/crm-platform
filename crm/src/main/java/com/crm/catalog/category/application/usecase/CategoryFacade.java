package com.crm.catalog.category.application.usecase;

import java.util.List;

import com.crm.catalog.category.application.command.CreateCategoryCommand;
import com.crm.catalog.category.application.command.UpdateCategoryCommand;
import com.crm.catalog.category.application.dto.CategoryDetails;
import com.crm.catalog.category.application.dto.CategorySummary;
import com.crm.catalog.category.domain.CategoryId;

public interface CategoryFacade {

	CategoryDetails create(CreateCategoryCommand command);

	CategoryDetails get(CategoryId id);

	List<CategorySummary> list();

	CategoryDetails update(UpdateCategoryCommand command);

	void delete(CategoryId id, long version);

}
