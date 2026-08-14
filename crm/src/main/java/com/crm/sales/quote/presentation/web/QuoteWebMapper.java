package com.crm.sales.quote.presentation.web;

import java.util.UUID;

import com.crm.foundation.mapping.CrmMapperConfig;
import com.crm.sales.quote.application.command.ApproveQuoteCommand;
import com.crm.sales.quote.application.command.CreateQuoteCommand;
import com.crm.sales.quote.application.command.UpdateQuoteCommand;
import com.crm.sales.quote.application.dto.QuoteDetails;
import com.crm.sales.quote.application.dto.QuoteSummary;
import com.crm.sales.quote.application.query.QuoteSearchQuery;
import com.crm.sales.quote.domain.QuoteAmounts;
import com.crm.sales.quote.domain.QuoteId;
import com.crm.sharedkernel.application.PageQuery;
import com.crm.sharedkernel.application.PageResult;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(config = CrmMapperConfig.class)
public interface QuoteWebMapper {

	CreateQuoteCommand toCreateCommand(CreateQuoteRequest request);

	@Mapping(target = "quoteId", source = "quoteId")
	@Mapping(target = "expectedVersion", source = "request.version")
	UpdateQuoteCommand toUpdateCommand(
			QuoteId quoteId, UpdateQuoteRequest request);

	default ApproveQuoteCommand toApproveCommand(QuoteId quoteId, long version) {
		return new ApproveQuoteCommand(quoteId, version);
	}

	QuoteResponse toResponse(QuoteDetails details);

	QuoteSummaryResponse toSummaryResponse(QuoteSummary summary);

	default QuoteId toQuoteId(UUID value) {
		return value == null ? null : new QuoteId(value);
	}

	default UUID fromQuoteId(QuoteId value) {
		return value == null ? null : value.value();
	}

	default QuoteAmounts toAmounts(CreateQuoteRequest.Amounts value) {
		if (value == null) return null;
		return QuoteAmounts.create(
				value.currencyCode(), value.subtotal(),
				value.discountTotal(), value.taxTotal(), value.shippingTotal());
	}

	default QuoteAmounts toAmounts(UpdateQuoteRequest.Amounts value) {
		if (value == null) return null;
		return QuoteAmounts.create(
				value.currencyCode(), value.subtotal(),
				value.discountTotal(), value.taxTotal(), value.shippingTotal());
	}

	default QuoteResponse.Amounts toResponseAmounts(QuoteAmounts value) {
		if (value == null) return null;
		return new QuoteResponse.Amounts(
				value.currencyCode(), value.subtotal(),
				value.discountTotal(), value.taxTotal(),
				value.shippingTotal(), value.grandTotal());
	}

	default QuoteSummaryResponse.Amounts toSummaryResponseAmounts(QuoteAmounts value) {
		if (value == null) return null;
		return new QuoteSummaryResponse.Amounts(
				value.currencyCode(), value.subtotal(),
				value.discountTotal(), value.taxTotal(),
				value.shippingTotal(), value.grandTotal());
	}

	default QuoteSearchQuery toSearchQuery(QuoteSearchRequest request) {
		int page = request.page() == null ? 0 : request.page();
		int size = request.size() == null
				? PageQuery.DEFAULT_SIZE : request.size();
		return new QuoteSearchQuery(
				request.q(), request.accountId(),
				request.opportunityId(), request.status(),
				request.ownerUserId(), new PageQuery(page, size));
	}

	default PageResult<QuoteSummaryResponse> toSummaryPage(
			PageResult<QuoteSummary> page) {
		return new PageResult<>(
				page.items().stream()
						.map(this::toSummaryResponse)
						.toList(),
				page.page(),
				page.size(),
				page.totalElements(),
				page.totalPages());
	}

}
