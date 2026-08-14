package com.crm.sales.quote.application.usecase;

import com.crm.sales.quote.application.command.ApproveQuoteCommand;
import com.crm.sales.quote.application.command.CreateQuoteCommand;
import com.crm.sales.quote.application.command.DeleteQuoteCommand;
import com.crm.sales.quote.application.command.UpdateQuoteCommand;
import com.crm.sales.quote.application.dto.QuoteDetails;
import com.crm.sales.quote.application.dto.QuoteSummary;
import com.crm.sales.quote.application.query.QuoteSearchQuery;
import com.crm.sales.quote.domain.QuoteId;
import com.crm.sharedkernel.application.PageResult;

public interface QuoteFacade {

	QuoteDetails create(CreateQuoteCommand command);

	QuoteDetails get(QuoteId quoteId);

	PageResult<QuoteSummary> search(QuoteSearchQuery query);

	QuoteDetails update(UpdateQuoteCommand command);

	QuoteDetails approve(ApproveQuoteCommand command);

	void delete(DeleteQuoteCommand command);

}
