package com.crm.sales.quote.application.usecase;

import java.util.List;
import java.util.UUID;

import com.crm.sales.quote.application.command.AcceptQuoteCommand;
import com.crm.sales.quote.application.command.ApproveQuoteCommand;
import com.crm.sales.quote.application.command.CancelQuoteCommand;
import com.crm.sales.quote.application.command.ConvertQuoteToOrderCommand;
import com.crm.sales.quote.application.command.CreateQuoteCommand;
import com.crm.sales.quote.application.command.DeleteQuoteCommand;
import com.crm.sales.quote.application.command.MarkQuoteSentCommand;
import com.crm.sales.quote.application.command.RejectQuoteCommand;
import com.crm.sales.quote.application.command.RequestQuoteChangesCommand;
import com.crm.sales.quote.application.command.ReviseQuoteCommand;
import com.crm.sales.quote.application.command.SaveQuoteDraftCommand;
import com.crm.sales.quote.application.command.SubmitQuoteCommand;
import com.crm.sales.quote.application.dto.QuoteDetails;
import com.crm.sales.quote.application.dto.QuoteDocumentDto;
import com.crm.sales.quote.application.dto.QuotePulseDto;
import com.crm.sales.quote.application.dto.QuoteRevisionDto;
import com.crm.sales.quote.application.dto.QuoteSummary;
import com.crm.sales.quote.application.query.QuoteSearchQuery;
import com.crm.sales.quote.domain.QuoteId;
import com.crm.sales.quote.domain.QuoteStatusHistoryEntry;
import com.crm.sharedkernel.application.PageQuery;
import com.crm.sharedkernel.application.PageResult;

public interface QuoteFacade {

	QuoteDetails createDraft(CreateQuoteCommand command);

	QuoteDetails saveDraft(QuoteId quoteId, SaveQuoteDraftCommand command);

	QuoteDetails submitForApproval(QuoteId quoteId, SubmitQuoteCommand command);

	QuoteDetails approve(QuoteId quoteId, ApproveQuoteCommand command);

	QuoteDetails requestChanges(QuoteId quoteId, RequestQuoteChangesCommand command);

	QuoteDetails markSent(QuoteId quoteId, MarkQuoteSentCommand command);

	QuoteDetails accept(QuoteId quoteId, AcceptQuoteCommand command);

	QuoteDetails reject(QuoteId quoteId, RejectQuoteCommand command);

	QuoteDetails cancel(QuoteId quoteId, CancelQuoteCommand command);

	QuoteDetails revise(QuoteId quoteId, ReviseQuoteCommand command);

	void deleteDraft(QuoteId quoteId, DeleteQuoteCommand command);

	UUID convertToOrder(QuoteId quoteId, ConvertQuoteToOrderCommand command);

	QuoteDetails get(QuoteId quoteId);

	QuoteDocumentDto getDocument(QuoteId quoteId);

	PageResult<QuoteSummary> search(QuoteSearchQuery query);

	QuotePulseDto getPulse(QuoteSearchQuery query);

	List<QuoteRevisionDto> getRevisions(QuoteId quoteId);

	PageResult<QuoteStatusHistoryEntry> getHistory(QuoteId quoteId, PageQuery pageQuery);

	com.crm.sales.quote.application.dto.QuoteStatsDto getStats();

	QuoteDetails duplicate(com.crm.sales.quote.application.command.DuplicateQuoteCommand command);

	QuoteDetails applyDiscount(com.crm.sales.quote.application.command.ApplyQuoteDiscountCommand command);

	int bulkChangeStatus(com.crm.sales.quote.application.command.BulkChangeQuoteStatusCommand command);

}
