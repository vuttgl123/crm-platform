package com.crm.integration.presentation.web;

import java.util.UUID;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import com.crm.integration.application.query.OutboxSearchQuery;
import com.crm.integration.application.usecase.OutboxFacade;
import com.crm.integration.domain.OutboxEventStatus;
import com.crm.sharedkernel.application.PageQuery;
import com.crm.sharedkernel.application.PageResult;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/integration/outbox")
public final class OutboxEventController {

	private final OutboxFacade outbox;
	private final OutboxWebMapper mapper;

	public OutboxEventController(OutboxFacade outbox, OutboxWebMapper mapper) {
		this.outbox = outbox;
		this.mapper = mapper;
	}

	@GetMapping
	public PageResult<OutboxEventSummaryResponse> search(
			@RequestParam(required = false) String aggregateType,
			@RequestParam(required = false) UUID aggregateId,
			@RequestParam(required = false) String eventType,
			@RequestParam(required = false) OutboxEventStatus status,
			@RequestParam(defaultValue = "0") @Min(0) int page,
			@RequestParam(defaultValue = "20") @Min(1) @Max(100) int size) {
		OutboxSearchQuery query = new OutboxSearchQuery(aggregateType, aggregateId, eventType, status, PageQuery.of(page, size));
		return mapper.toSummaryPage(outbox.search(query));
	}

}
