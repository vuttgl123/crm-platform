package com.crm.catalog.pricebook.application.dto;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import com.crm.catalog.pricebook.domain.PriceBook;

public record PriceBookDetails(
		UUID id,
		String priceBookCode,
		String name,
		String currencyCode,
		LocalDate validFrom,
		LocalDate validTo,
		boolean isDefault,
		boolean isActive,
		List<PriceBookItemDetails> items,
		UUID createdBy,
		Instant createdAt,
		UUID updatedBy,
		Instant updatedAt,
		long version
) {

	public static PriceBookDetails from(PriceBook priceBook, List<PriceBookItemDetails> items) {
		return new PriceBookDetails(
				priceBook.id().value(),
				priceBook.priceBookCode(),
				priceBook.name(),
				priceBook.currencyCode(),
				priceBook.validFrom(),
				priceBook.validTo(),
				priceBook.isDefault(),
				priceBook.isActive(),
				items != null ? items : List.of(),
				priceBook.auditInfo().createdBy() != null ? priceBook.auditInfo().createdBy().value() : null,
				priceBook.auditInfo().createdAt(),
				priceBook.auditInfo().updatedBy() != null ? priceBook.auditInfo().updatedBy().value() : null,
				priceBook.auditInfo().updatedAt(),
				priceBook.version()
		);
	}

}
