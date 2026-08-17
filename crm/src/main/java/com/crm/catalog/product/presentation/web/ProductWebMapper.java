package com.crm.catalog.product.presentation.web;

import java.util.UUID;

import com.crm.catalog.product.application.command.CreateProductCommand;
import com.crm.catalog.product.application.command.UpdateProductCommand;
import com.crm.catalog.product.application.dto.ProductDetails;
import com.crm.catalog.product.application.dto.ProductSummary;
import com.crm.catalog.product.application.query.ProductSearchQuery;
import com.crm.catalog.product.domain.ProductId;
import com.crm.sharedkernel.application.PageQuery;
import com.crm.sharedkernel.application.PageResult;
import com.crm.sharedkernel.domain.ActorId;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface ProductWebMapper {

	CreateProductCommand toCreateCommand(CreateProductRequest request);

	default UpdateProductCommand toUpdateCommand(ProductId id, UpdateProductRequest request) {
		return new UpdateProductCommand(
				id,
				request.version(),
				request.name(),
				request.description(),
				request.categoryId(),
				request.productType(),
				request.unitOfMeasure(),
				request.taxCategory(),
				request.standardCost(),
				request.costCurrencyCode(),
				request.isActive(),
				request.metadata()
		);
	}

	default ProductSearchQuery toSearchQuery(ProductSearchRequest request) {
		if (request == null) {
			return new ProductSearchQuery(null, null, null, null, PageQuery.defaultPage());
		}
		int page = request.page() != null ? request.page() : 0;
		int size = request.size() != null ? request.size() : 20;
		return new ProductSearchQuery(
				request.q(),
				request.categoryId(),
				request.productType(),
				request.isActive(),
				PageQuery.of(page, size)
		);
	}

	ProductResponse toResponse(ProductDetails details);

	ProductSummaryResponse toSummaryResponse(ProductSummary summary);

	default PageResult<ProductSummaryResponse> toSummaryPage(PageResult<ProductSummary> page) {
		return page.map(this::toSummaryResponse);
	}

	default UUID map(ActorId value) {
		return value == null ? null : value.value();
	}

	default ActorId map(UUID value) {
		return value == null ? null : new ActorId(value);
	}

	default UUID map(ProductId value) {
		return value == null ? null : value.value();
	}

	default ProductId mapToProductId(UUID value) {
		return value == null ? null : new ProductId(value);
	}

}
