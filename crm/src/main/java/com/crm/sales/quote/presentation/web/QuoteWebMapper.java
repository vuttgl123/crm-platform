package com.crm.sales.quote.presentation.web;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

import com.crm.foundation.mapping.CrmMapperConfig;
import com.crm.sales.quote.application.command.CreateQuoteCommand;
import com.crm.sales.quote.application.command.QuoteLineInputCommand;
import com.crm.sales.quote.application.command.SaveQuoteDraftCommand;
import com.crm.sales.quote.application.dto.QuoteDetails;
import com.crm.sales.quote.application.dto.QuoteDocumentDto;
import com.crm.sales.quote.application.dto.QuoteLineDetails;
import com.crm.sales.quote.application.dto.QuoteOwnerReferenceDto;
import com.crm.sales.quote.application.dto.QuotePulseCurrencyGroupDto;
import com.crm.sales.quote.application.dto.QuotePulseDto;
import com.crm.sales.quote.application.dto.QuoteReferenceDto;
import com.crm.sales.quote.application.dto.QuoteRevisionDto;
import com.crm.sales.quote.application.dto.QuoteSummary;
import com.crm.sales.quote.application.query.QuoteSearchQuery;
import com.crm.sales.quote.domain.QuoteAmounts;
import com.crm.sales.quote.domain.QuoteCustomerSnapshot;
import com.crm.sales.quote.domain.QuoteId;
import com.crm.sales.quote.domain.QuoteStatus;
import com.crm.sales.quote.domain.QuoteStatusHistoryEntry;
import com.crm.sharedkernel.application.PageQuery;
import com.crm.sharedkernel.application.PageResult;
import com.crm.sharedkernel.domain.ActorId;
import com.crm.sharedkernel.domain.TenantId;
import org.mapstruct.Mapper;

@Mapper(config = CrmMapperConfig.class)
public interface QuoteWebMapper {

	default CreateQuoteCommand toCreateCommand(CreateQuoteRequest request) {
		String ownerType = request.owner() != null ? request.owner().type() : null;
		UUID ownerId = request.owner() != null ? request.owner().id() : null;
		return new CreateQuoteCommand(
				request.name(),
				request.accountId(),
				request.contactId(),
				request.opportunityId(),
				request.priceBookId(),
				ownerType,
				ownerId,
				request.issueDate(),
				request.validUntil()
		);
	}

	default SaveQuoteDraftCommand toSaveDraftCommand(SaveQuoteDraftRequest request, long expectedVersion) {
		String ownerType = request.owner() != null ? request.owner().type() : null;
		UUID ownerId = request.owner() != null ? request.owner().id() : null;

		QuoteCustomerSnapshot snapshot = null;
		if (request.customerSnapshot() != null) {
			snapshot = new QuoteCustomerSnapshot(
					request.customerSnapshot().legalName(),
					request.customerSnapshot().addressLine1(),
					request.customerSnapshot().addressLine2(),
					request.customerSnapshot().locality(),
					request.customerSnapshot().region(),
					request.customerSnapshot().postalCode(),
					request.customerSnapshot().countryCode(),
					request.customerSnapshot().contactName(),
					request.customerSnapshot().contactEmail(),
					request.customerSnapshot().contactPhone()
			);
		}

		List<QuoteLineInputCommand> lines = new ArrayList<>();
		if (request.lines() != null) {
			for (QuoteLineInputRequest l : request.lines()) {
				lines.add(new QuoteLineInputCommand(
						l.id(),
						l.position(),
						l.productId(),
						l.priceBookItemId(),
						l.quantity(),
						l.salesUnitPrice(),
						l.discountPercent(),
						l.taxPercent(),
						l.description()
				));
			}
		}

		return new SaveQuoteDraftCommand(
				request.name(),
				request.accountId(),
				request.contactId(),
				request.opportunityId(),
				request.priceBookId(),
				ownerType,
				ownerId,
				request.issueDate(),
				request.validUntil(),
				snapshot,
				request.paymentTerms(),
				request.deliveryTerms(),
				request.customerReference(),
				request.internalNotes(),
				request.shippingTotal(),
				lines,
				expectedVersion
		);
	}

	default QuoteSearchQuery toSearchQuery(QuoteSearchRequest request) {
		int page = request.page() == null ? 0 : request.page();
		int size = request.size() == null ? PageQuery.DEFAULT_SIZE : request.size();

		List<QuoteStatus> statusEnums = null;
		if (request.status() != null && !request.status().isEmpty()) {
			statusEnums = new ArrayList<>();
			for (String s : request.status()) {
				try {
					statusEnums.add(QuoteStatus.valueOf(s.trim().toUpperCase()));
				} catch (Exception ignored) {
				}
			}
		}

		boolean latestOnly = request.latestOnly() == null || Boolean.TRUE.equals(request.latestOnly());

		return new QuoteSearchQuery(
				request.q(),
				statusEnums,
				request.accountId(),
				request.opportunityId(),
				request.ownerType(),
				request.ownerId(),
				request.currencyCode(),
				request.validity(),
				request.issueFrom(),
				request.issueTo(),
				request.validFrom(),
				request.validTo(),
				latestOnly,
				request.sort(),
				request.direction(),
				new PageQuery(page, size)
		);
	}

	default QuoteResponse toResponse(QuoteDetails d) {
		if (d == null) return null;
		return new QuoteResponse(
				map(d.id()),
				d.quoteNumber(),
				d.revisionNumber(),
				d.previousQuoteId(),
				d.name(),
				d.latestRevision(),
				d.legacyAmountOnly(),
				d.effectiveStatus(),
				d.storedStatus(),
				d.pricingMode(),
				toRefResponse(d.account()),
				toRefResponse(d.contact()),
				toRefResponse(d.opportunity()),
				toRefResponse(d.priceBook()),
				toOwnerRefResponse(d.owner()),
				toAmountsResponse(d.amounts()),
				toSnapshotResponse(d.customerSnapshot()),
				toLineResponses(d.lines()),
				d.exchangeRateToTenantCurrency(),
				d.issueDate(),
				d.validUntil(),
				d.paymentTerms(),
				d.deliveryTerms(),
				d.customerReference(),
				d.notes(),
				d.approvedAt(),
				map(d.approvedBy()),
				d.sentAt(),
				d.acceptedAt(),
				d.rejectedAt(),
				d.cancelledAt(),
				d.relatedOrderId(),
				d.availableActions(),
				d.createdAt(),
				map(d.createdBy()),
				d.updatedAt(),
				map(d.updatedBy()),
				d.version()
		);
	}

	default QuoteSummaryResponse toSummaryResponse(QuoteSummary s) {
		if (s == null) return null;
		return new QuoteSummaryResponse(
				map(s.id()),
				s.quoteNumber(),
				s.revisionNumber(),
				s.name(),
				s.latestRevision(),
				s.legacyAmountOnly(),
				s.effectiveStatus(),
				toRefResponse(s.account()),
				toRefResponse(s.opportunity()),
				toOwnerRefResponse(s.owner()),
				toAmountsResponse(s.amounts()),
				s.lineCount(),
				s.issueDate(),
				s.validUntil(),
				s.updatedAt(),
				s.version(),
				s.availableActions()
		);
	}

	default QuotePulseResponse toPulseResponse(QuotePulseDto pulse) {
		if (pulse == null) return null;
		List<QuotePulseResponse.CurrencyGroup> groups = new ArrayList<>();
		if (pulse.currencyGroups() != null) {
			for (QuotePulseCurrencyGroupDto g : pulse.currencyGroups()) {
				groups.add(new QuotePulseResponse.CurrencyGroup(
						g.currencyCode(),
						g.draftCount(),
						g.pendingApprovalCount(),
						g.sentAmount(),
						g.sentCount(),
						g.acceptedAmount(),
						g.acceptedCount(),
						g.expiringSoonAmount(),
						g.expiringSoonCount()
				));
			}
		}
		return new QuotePulseResponse(
				pulse.revisionScope(),
				pulse.asOf(),
				pulse.tenantTimezone(),
				groups
		);
	}

	default QuoteDocumentResponse toDocumentResponse(QuoteDocumentDto doc) {
		if (doc == null) return null;
		return new QuoteDocumentResponse(
				map(doc.quoteId()),
				doc.quoteNumber(),
				doc.revisionNumber(),
				doc.name(),
				doc.effectiveStatus(),
				doc.storedStatus(),
				doc.issueDate(),
				doc.validUntil(),
				toSnapshotResponse(doc.customerSnapshot()),
				toLineResponses(doc.lines()),
				toAmountsResponse(doc.amounts()),
				doc.paymentTerms(),
				doc.deliveryTerms(),
				doc.customerReference()
		);
	}

	default QuoteRevisionResponse toRevisionResponse(QuoteRevisionDto rev) {
		if (rev == null) return null;
		return new QuoteRevisionResponse(
				rev.id(),
				rev.quoteNumber(),
				rev.revisionNumber(),
				rev.status(),
				rev.effectiveStatus(),
				rev.grandTotal(),
				rev.currencyCode(),
				rev.createdAt(),
				rev.createdBy(),
				rev.isCurrent()
		);
	}

	default QuoteStatusHistoryResponse toStatusHistoryResponse(QuoteStatusHistoryEntry h) {
		if (h == null) return null;
		return new QuoteStatusHistoryResponse(
				h.id(),
				map(h.quoteId()),
				h.quoteRevisionNumber(),
				h.action(),
				h.previousStoredStatus(),
				h.newStoredStatus(),
				map(h.actorId()),
				h.reason(),
				h.quoteVersionBefore(),
				h.quoteVersionAfter(),
				h.occurredAt()
		);
	}

	default QuoteReferenceResponse toRefResponse(QuoteReferenceDto ref) {
		if (ref == null) return null;
		return new QuoteReferenceResponse(ref.id(), ref.label(), ref.routeAvailable());
	}

	default QuoteOwnerReferenceResponse toOwnerRefResponse(QuoteOwnerReferenceDto ref) {
		if (ref == null) return null;
		return new QuoteOwnerReferenceResponse(ref.type(), ref.id(), ref.label());
	}

	default QuoteAmountsResponse toAmountsResponse(QuoteAmounts amounts) {
		if (amounts == null) return null;
		return new QuoteAmountsResponse(
				amounts.currencyCode(),
				amounts.subtotal(),
				amounts.discountTotal(),
				amounts.taxTotal(),
				amounts.shippingTotal(),
				amounts.grandTotal()
		);
	}

	default QuoteCustomerSnapshotResponse toSnapshotResponse(QuoteCustomerSnapshot s) {
		if (s == null) return null;
		return new QuoteCustomerSnapshotResponse(
				s.legalName(),
				s.addressLine1(),
				s.addressLine2(),
				s.locality(),
				s.region(),
				s.postalCode(),
				s.countryCode(),
				s.contactName(),
				s.contactEmail(),
				s.contactPhone()
		);
	}

	default List<QuoteLineResponse> toLineResponses(List<QuoteLineDetails> lines) {
		if (lines == null) return Collections.emptyList();
		List<QuoteLineResponse> res = new ArrayList<>();
		for (QuoteLineDetails l : lines) {
			res.add(new QuoteLineResponse(
					l.id(),
					l.position(),
					l.productId(),
					l.priceBookItemId(),
					l.sku(),
					l.productName(),
					l.unit(),
					l.description(),
					l.quantity(),
					l.listUnitPrice(),
					l.salesUnitPrice(),
					l.discountPercent(),
					l.taxPercent(),
					l.lineSubtotal(),
					l.lineDiscount(),
					l.lineTax(),
					l.lineTotal()
			));
		}
		return res;
	}

	default PageResult<QuoteSummaryResponse> toSummaryPage(PageResult<QuoteSummary> page) {
		return new PageResult<>(
				page.items().stream().map(this::toSummaryResponse).toList(),
				page.page(),
				page.size(),
				page.totalElements(),
				page.totalPages()
		);
	}

	default PageResult<QuoteStatusHistoryResponse> toHistoryPage(PageResult<QuoteStatusHistoryEntry> page) {
		return new PageResult<>(
				page.items().stream().map(this::toStatusHistoryResponse).toList(),
				page.page(),
				page.size(),
				page.totalElements(),
				page.totalPages()
		);
	}

	default UUID map(ActorId value) {
		return value == null ? null : value.value();
	}

	default ActorId map(UUID value) {
		return value == null ? null : new ActorId(value);
	}

	default UUID map(QuoteId value) {
		return value == null ? null : value.value();
	}

	default QuoteId toQuoteId(UUID value) {
		return value == null ? null : new QuoteId(value);
	}
}
