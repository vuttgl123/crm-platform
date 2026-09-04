package com.crm.catalog.pricebook.application.usecase;

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

public interface PriceBookFacade {

	PriceBookDetails create(CreatePriceBookCommand command);

	PriceBookDetails get(PriceBookId id);

	List<PriceBookSummary> list();

	PriceBookDetails update(UpdatePriceBookCommand command);

	void delete(PriceBookId id, long version);

	PriceBookItemDetails addItem(AddPriceBookItemCommand command);

	void removeItem(PriceBookId priceBookId, PriceBookItemId itemId);

	com.crm.catalog.pricebook.application.dto.PriceBookStatsDto getStats();

	PriceBookDetails clonePriceBook(com.crm.catalog.pricebook.application.command.ClonePriceBookCommand command);

	int bulkAddItems(com.crm.catalog.pricebook.application.command.BulkAddPriceBookItemsCommand command);

	PriceBookDetails updateStatus(com.crm.catalog.pricebook.application.command.ChangePriceBookStatusCommand command);

}
