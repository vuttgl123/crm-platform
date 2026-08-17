package com.crm.catalog.pricebook.presentation.web;

import java.util.List;
import java.util.UUID;

import com.crm.catalog.pricebook.application.command.AddPriceBookItemCommand;
import com.crm.catalog.pricebook.application.command.CreatePriceBookCommand;
import com.crm.catalog.pricebook.application.command.UpdatePriceBookCommand;
import com.crm.catalog.pricebook.application.dto.PriceBookDetails;
import com.crm.catalog.pricebook.application.dto.PriceBookItemDetails;
import com.crm.catalog.pricebook.application.dto.PriceBookSummary;
import com.crm.catalog.pricebook.domain.PriceBookId;
import com.crm.catalog.pricebook.domain.PriceBookItemId;
import com.crm.sharedkernel.domain.ActorId;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface PriceBookWebMapper {

	CreatePriceBookCommand toCreateCommand(CreatePriceBookRequest request);

	default UpdatePriceBookCommand toUpdateCommand(PriceBookId id, UpdatePriceBookRequest request) {
		return new UpdatePriceBookCommand(
				id,
				request.version(),
				request.name(),
				request.currencyCode(),
				request.validFrom(),
				request.validTo(),
				request.isDefault(),
				request.isActive()
		);
	}

	default AddPriceBookItemCommand toAddItemCommand(PriceBookId priceBookId, AddPriceBookItemRequest request) {
		return new AddPriceBookItemCommand(
				priceBookId,
				request.productId(),
				request.unitPrice(),
				request.minimumQuantity(),
				request.validFrom(),
				request.validTo()
		);
	}

	PriceBookResponse toResponse(PriceBookDetails details);

	PriceBookSummaryResponse toSummaryResponse(PriceBookSummary summary);

	List<PriceBookSummaryResponse> toSummaryResponseList(List<PriceBookSummary> summaries);

	PriceBookItemResponse toItemResponse(PriceBookItemDetails details);

	List<PriceBookItemResponse> toItemResponseList(List<PriceBookItemDetails> items);

	default UUID map(ActorId value) {
		return value == null ? null : value.value();
	}

	default ActorId map(UUID value) {
		return value == null ? null : new ActorId(value);
	}

	default UUID map(PriceBookId value) {
		return value == null ? null : value.value();
	}

	default PriceBookId mapToPriceBookId(UUID value) {
		return value == null ? null : new PriceBookId(value);
	}

	default UUID map(PriceBookItemId value) {
		return value == null ? null : value.value();
	}

	default PriceBookItemId mapToPriceBookItemId(UUID value) {
		return value == null ? null : new PriceBookItemId(value);
	}

}
