package com.crm.sales.order.application.service;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.*;

import com.crm.foundation.identifier.IdentifierGenerator;
import com.crm.foundation.security.AuthorizedDataAccess;
import com.crm.foundation.security.CurrentActor;
import com.crm.foundation.security.SystemPermission;
import com.crm.foundation.security.TenantAccessAuthorizer;
import com.crm.foundation.tenancy.CurrentTenant;
import com.crm.foundation.time.TimeProvider;
import com.crm.sales.order.application.command.CancelOrderCommand;
import com.crm.sales.order.application.command.CloseRemainingOrderCommand;
import com.crm.sales.order.application.command.ConfirmOrderCommand;
import com.crm.sales.order.application.command.CreateDirectOrderCommand;
import com.crm.sales.order.application.command.DeleteOrderCommand;
import com.crm.sales.order.application.command.FulfillmentLineInputCommand;
import com.crm.sales.order.application.command.OrderLineInputCommand;
import com.crm.sales.order.application.command.RecordOrderFulfillmentCommand;
import com.crm.sales.order.application.command.SaveOrderDraftCommand;
import com.crm.sales.order.application.command.StartOrderProcessingCommand;
import com.crm.sales.order.application.command.VoidOrderFulfillmentCommand;
import com.crm.sales.order.application.dto.OrderDetails;
import com.crm.sales.order.application.dto.OrderDocumentDto;
import com.crm.sales.order.application.dto.OrderFulfillmentDto;
import com.crm.sales.order.application.dto.OrderFulfillmentLineDto;
import com.crm.sales.order.application.dto.OrderLineDetails;
import com.crm.sales.order.application.dto.OrderOwnerReferenceDto;
import com.crm.sales.order.application.dto.OrderPulseDto;
import com.crm.sales.order.application.dto.OrderReferenceDto;
import com.crm.sales.order.application.dto.OrderSummary;
import com.crm.sales.order.application.port.OrderRepository;
import com.crm.sales.order.application.query.OrderSearchQuery;
import com.crm.sales.order.application.usecase.OrderFacade;
import com.crm.sales.order.domain.Order;
import com.crm.sales.order.domain.OrderAddressSnapshot;
import com.crm.sales.order.domain.OrderErrorCode;
import com.crm.sales.order.domain.OrderFulfillmentEvent;
import com.crm.sales.order.domain.OrderFulfillmentEventLine;
import com.crm.sales.order.domain.OrderFulfillmentStatus;
import com.crm.sales.order.domain.OrderId;
import com.crm.sales.order.domain.OrderLine;
import com.crm.sales.order.domain.OrderStatus;
import com.crm.sales.order.domain.OrderStatusHistoryEntry;
import com.crm.sharedkernel.application.PageResult;
import com.crm.sharedkernel.domain.ActorId;
import com.crm.sharedkernel.domain.TenantId;
import com.crm.sharedkernel.domain.exception.DomainResourceNotFound;
import com.crm.sharedkernel.domain.exception.ResourceConflict;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class OrderApplicationService implements OrderFacade {

	private static final String ENTITY_TYPE = "ORDER";

	private final OrderRepository orderRepository;
	private final OrderPricingService orderPricingService;
	private final CurrentTenant currentTenant;
	private final CurrentActor currentActor;
	private final TenantAccessAuthorizer authorizer;
	private final IdentifierGenerator identifierGenerator;
	private final TimeProvider timeProvider;
	private final JdbcClient jdbcClient;

	public OrderApplicationService(
			OrderRepository orderRepository,
			OrderPricingService orderPricingService,
			CurrentTenant currentTenant,
			CurrentActor currentActor,
			TenantAccessAuthorizer authorizer,
			IdentifierGenerator identifierGenerator,
			TimeProvider timeProvider,
			JdbcClient jdbcClient) {
		this.orderRepository = orderRepository;
		this.orderPricingService = orderPricingService;
		this.currentTenant = currentTenant;
		this.currentActor = currentActor;
		this.authorizer = authorizer;
		this.identifierGenerator = identifierGenerator;
		this.timeProvider = timeProvider;
		this.jdbcClient = jdbcClient;
	}

	@Override
	@Transactional
	public OrderDetails createDirectDraft(CreateDirectOrderCommand command) {
		Objects.requireNonNull(command, "command must not be null");
		TenantId tenantId = currentTenant.requireTenantId();
		ActorId actorId = currentActor.requireActorId();
		AuthorizedDataAccess access = authorizer.authorize(SystemPermission.SALES_ORDER_WRITE, ENTITY_TYPE);

		validateAccount(tenantId, actorId, command.accountId(), access);
		validateContact(tenantId, actorId, command.contactId(), access);
		validateOpportunity(tenantId, actorId, command.opportunityId(), access);
		validatePriceBook(tenantId, command.priceBookId());

		String currencyCode = (command.currencyCode() != null && !command.currencyCode().isBlank())
				? command.currencyCode()
				: resolvePriceBookCurrency(tenantId, command.priceBookId());

		String orderNumber = orderRepository.generateOrderNumber(tenantId);
		OrderId orderId = new OrderId(identifierGenerator.nextId());
		Instant now = timeProvider.now();

		UUID ownerUserId = null;
		UUID ownerTeamId = null;
		if ("TEAM".equalsIgnoreCase(command.ownerType())) {
			ownerTeamId = command.ownerId();
		} else {
			ownerUserId = command.ownerId() != null ? command.ownerId() : actorId.value();
		}

		OrderAddressSnapshot billingSnapshot = command.billingAddressSnapshot() != null
				? command.billingAddressSnapshot()
				: OrderAddressSnapshot.empty(resolveAccountName(tenantId, command.accountId()));

		OrderAddressSnapshot shippingSnapshot = command.shippingAddressSnapshot() != null
				? command.shippingAddressSnapshot()
				: billingSnapshot;

		Order order = Order.createDirectDraft(
				tenantId,
				orderId,
				orderNumber,
				command.accountId(),
				command.contactId(),
				command.opportunityId(),
				command.priceBookId(),
				ownerUserId,
				ownerTeamId,
				currencyCode,
				billingSnapshot,
				shippingSnapshot,
				command.orderDate() != null ? command.orderDate() : LocalDate.now(),
				command.requestedDeliveryDate(),
				command.customerReference(),
				command.paymentTerms(),
				command.deliveryTerms(),
				command.notes(),
				actorId,
				now
		);

		orderRepository.save(order);

		OrderStatusHistoryEntry history = new OrderStatusHistoryEntry(
				identifierGenerator.nextId(),
				orderId,
				now,
				actorId,
				"CREATE_DRAFT",
				OrderStatus.DRAFT,
				OrderStatus.DRAFT,
				"Direct order draft created"
		);
		orderRepository.saveStatusHistory(tenantId, history);

		return mapToDetails(tenantId, order);
	}

	@Override
	@Transactional
	public OrderDetails saveDraft(SaveOrderDraftCommand command) {
		Objects.requireNonNull(command, "command must not be null");
		TenantId tenantId = currentTenant.requireTenantId();
		ActorId actorId = currentActor.requireActorId();
		AuthorizedDataAccess access = authorizer.authorize(SystemPermission.SALES_ORDER_WRITE, ENTITY_TYPE);

		Order order = orderRepository.findById(tenantId, command.orderId(), actorId, access)
				.orElseThrow(() -> new DomainResourceNotFound(OrderErrorCode.ORDER_NOT_FOUND));

		if (order.version() != command.expectedVersion()) {
			throw new ResourceConflict(OrderErrorCode.ORDER_VERSION_CONFLICT);
		}

		validateAccount(tenantId, actorId, command.accountId(), access);
		validateContact(tenantId, actorId, command.contactId(), access);
		validateOpportunity(tenantId, actorId, command.opportunityId(), access);
		validatePriceBook(tenantId, command.priceBookId());

		List<OrderLine> inputLines = new ArrayList<>();
		if (command.lines() != null) {
			int pos = 1;
			for (OrderLineInputCommand lc : command.lines()) {
				UUID lineId = lc.id() != null ? lc.id() : identifierGenerator.nextId();
				OrderLine line = new OrderLine(
						lineId,
						pos++,
						lc.productId(),
						lc.quoteItemId(),
						lc.skuSnapshot(),
						lc.nameSnapshot() != null ? lc.nameSnapshot() : "Item",
						lc.descriptionSnapshot(),
						lc.unitOfMeasureSnapshot(),
						lc.quantity() != null ? lc.quantity() : BigDecimal.ONE,
						BigDecimal.ZERO,
						lc.unitPrice() != null ? lc.unitPrice() : BigDecimal.ZERO,
						lc.discountPercent() != null ? lc.discountPercent() : BigDecimal.ZERO,
						lc.discountAmount() != null ? lc.discountAmount() : BigDecimal.ZERO,
						lc.taxPercent() != null ? lc.taxPercent() : BigDecimal.ZERO,
						lc.taxAmount() != null ? lc.taxAmount() : BigDecimal.ZERO,
						BigDecimal.ZERO
				);
				inputLines.add(line);
			}
		}

		var calculated = orderPricingService.calculate(
				order.amounts().currencyCode(),
				inputLines,
				command.shippingTotal() != null ? command.shippingTotal() : order.amounts().shippingTotal()
		);

		UUID ownerUserId = null;
		UUID ownerTeamId = null;
		if ("TEAM".equalsIgnoreCase(command.ownerType())) {
			ownerTeamId = command.ownerId();
		} else {
			ownerUserId = command.ownerId() != null ? command.ownerId() : order.ownerUserId();
		}

		Instant now = timeProvider.now();

		order.saveDraft(
				command.accountId(),
				command.contactId(),
				command.opportunityId(),
				command.priceBookId(),
				ownerUserId,
				ownerTeamId,
				command.billingAddressSnapshot(),
				command.shippingAddressSnapshot(),
				command.orderDate(),
				command.requestedDeliveryDate(),
				command.customerReference(),
				command.paymentTerms(),
				command.deliveryTerms(),
				command.notes(),
				command.shippingTotal(),
				calculated.lines(),
				actorId,
				now,
				command.expectedVersion()
		);
		order.updateAmounts(calculated.amounts());

		orderRepository.save(order);

		return mapToDetails(tenantId, order);
	}

	@Override
	@Transactional(readOnly = true)
	public OrderDetails get(OrderId orderId) {
		TenantId tenantId = currentTenant.requireTenantId();
		ActorId actorId = currentActor.requireActorId();
		AuthorizedDataAccess access = authorizer.authorize(SystemPermission.SALES_ORDER_READ, ENTITY_TYPE);

		Order order = orderRepository.findById(tenantId, orderId, actorId, access)
				.orElseThrow(() -> new DomainResourceNotFound(OrderErrorCode.ORDER_NOT_FOUND));

		return mapToDetails(tenantId, order);
	}

	@Override
	@Transactional(readOnly = true)
	public PageResult<OrderSummary> search(OrderSearchQuery query) {
		TenantId tenantId = currentTenant.requireTenantId();
		ActorId actorId = currentActor.requireActorId();
		AuthorizedDataAccess access = authorizer.authorize(SystemPermission.SALES_ORDER_READ, ENTITY_TYPE);

		return orderRepository.search(tenantId, actorId, query, access);
	}

	@Override
	@Transactional(readOnly = true)
	public OrderPulseDto getPulse() {
		TenantId tenantId = currentTenant.requireTenantId();
		ActorId actorId = currentActor.requireActorId();
		AuthorizedDataAccess access = authorizer.authorize(SystemPermission.SALES_ORDER_READ, ENTITY_TYPE);

		return orderRepository.getPulse(tenantId, actorId, access);
	}

	@Override
	@Transactional(readOnly = true)
	public OrderDocumentDto getDocument(OrderId orderId) {
		TenantId tenantId = currentTenant.requireTenantId();
		ActorId actorId = currentActor.requireActorId();
		AuthorizedDataAccess access = authorizer.authorize(SystemPermission.SALES_ORDER_READ, ENTITY_TYPE);

		Order order = orderRepository.findById(tenantId, orderId, actorId, access)
				.orElseThrow(() -> new DomainResourceNotFound(OrderErrorCode.ORDER_NOT_FOUND));

		OrderDetails details = mapToDetails(tenantId, order);
		return new OrderDocumentDto(
				details.id(),
				details.orderNumber(),
				details.status(),
				details.account(),
				details.contact(),
				details.opportunity(),
				details.quote(),
				details.owner(),
				details.amounts(),
				details.billingAddressSnapshot(),
				details.shippingAddressSnapshot(),
				details.lines(),
				details.progressPercent(),
				details.orderDate(),
				details.requestedDeliveryDate(),
				details.customerReference(),
				details.paymentTerms(),
				details.deliveryTerms(),
				details.notes(),
				details.confirmedAt(),
				details.fulfilledAt(),
				details.createdAt()
		);
	}

	@Override
	@Transactional(readOnly = true)
	public List<OrderStatusHistoryEntry> getStatusHistory(OrderId orderId) {
		TenantId tenantId = currentTenant.requireTenantId();
		ActorId actorId = currentActor.requireActorId();
		AuthorizedDataAccess access = authorizer.authorize(SystemPermission.SALES_ORDER_READ, ENTITY_TYPE);

		orderRepository.findById(tenantId, orderId, actorId, access)
				.orElseThrow(() -> new DomainResourceNotFound(OrderErrorCode.ORDER_NOT_FOUND));

		return orderRepository.findStatusHistory(tenantId, orderId);
	}

	@Override
	@Transactional(readOnly = true)
	public List<OrderFulfillmentDto> getFulfillments(OrderId orderId) {
		TenantId tenantId = currentTenant.requireTenantId();
		ActorId actorId = currentActor.requireActorId();
		AuthorizedDataAccess access = authorizer.authorize(SystemPermission.SALES_ORDER_READ, ENTITY_TYPE);

		Order order = orderRepository.findById(tenantId, orderId, actorId, access)
				.orElseThrow(() -> new DomainResourceNotFound(OrderErrorCode.ORDER_NOT_FOUND));

		Map<UUID, OrderLine> linesById = new HashMap<>();
		for (OrderLine line : order.lines()) {
			linesById.put(line.id(), line);
		}

		List<OrderFulfillmentEvent> events = orderRepository.findFulfillmentsByOrderId(tenantId, orderId);
		List<OrderFulfillmentDto> result = new ArrayList<>();
		for (OrderFulfillmentEvent ev : events) {
			List<OrderFulfillmentLineDto> fLines = new ArrayList<>();
			for (OrderFulfillmentEventLine fl : ev.lines()) {
				OrderLine l = linesById.get(fl.orderLineId());
				fLines.add(new OrderFulfillmentLineDto(
						fl.id(),
						fl.orderLineId(),
						l != null ? l.nameSnapshot() : "Item",
						l != null ? l.skuSnapshot() : null,
						fl.quantity()
				));
			}
			result.add(new OrderFulfillmentDto(
					ev.id(),
					ev.eventNumber(),
					ev.referenceNumber(),
					ev.fulfillmentDate(),
					ev.note(),
					ev.status(),
					ev.occurredAt(),
					ev.recordedBy(),
					ev.voidedAt(),
					ev.voidedBy(),
					ev.voidReason(),
					fLines,
					ev.version()
			));
		}
		return result;
	}

	@Override
	@Transactional
	public OrderDetails confirm(ConfirmOrderCommand command) {
		TenantId tenantId = currentTenant.requireTenantId();
		ActorId actorId = currentActor.requireActorId();
		AuthorizedDataAccess access = authorizer.authorize(SystemPermission.SALES_ORDER_WRITE, ENTITY_TYPE);

		Order order = orderRepository.findById(tenantId, command.orderId(), actorId, access)
				.orElseThrow(() -> new DomainResourceNotFound(OrderErrorCode.ORDER_NOT_FOUND));

		if (order.version() != command.expectedVersion()) {
			throw new ResourceConflict(OrderErrorCode.ORDER_VERSION_CONFLICT);
		}

		Instant now = timeProvider.now();
		order.confirm(actorId, now, command.expectedVersion());
		orderRepository.save(order);

		OrderStatusHistoryEntry history = new OrderStatusHistoryEntry(
				identifierGenerator.nextId(),
				command.orderId(),
				now,
				actorId,
				"CONFIRM",
				OrderStatus.DRAFT,
				OrderStatus.CONFIRMED,
				"Order confirmed"
		);
		orderRepository.saveStatusHistory(tenantId, history);

		return mapToDetails(tenantId, order);
	}

	@Override
	@Transactional
	public OrderDetails startProcessing(StartOrderProcessingCommand command) {
		TenantId tenantId = currentTenant.requireTenantId();
		ActorId actorId = currentActor.requireActorId();
		AuthorizedDataAccess access = authorizer.authorize(SystemPermission.SALES_ORDER_WRITE, ENTITY_TYPE);

		Order order = orderRepository.findById(tenantId, command.orderId(), actorId, access)
				.orElseThrow(() -> new DomainResourceNotFound(OrderErrorCode.ORDER_NOT_FOUND));

		if (order.version() != command.expectedVersion()) {
			throw new ResourceConflict(OrderErrorCode.ORDER_VERSION_CONFLICT);
		}

		Instant now = timeProvider.now();
		order.startProcessing(actorId, now, command.expectedVersion());
		orderRepository.save(order);

		OrderStatusHistoryEntry history = new OrderStatusHistoryEntry(
				identifierGenerator.nextId(),
				command.orderId(),
				now,
				actorId,
				"START_PROCESSING",
				OrderStatus.CONFIRMED,
				OrderStatus.PROCESSING,
				"Order processing started"
		);
		orderRepository.saveStatusHistory(tenantId, history);

		return mapToDetails(tenantId, order);
	}

	@Override
	@Transactional
	public OrderDetails recordFulfillment(RecordOrderFulfillmentCommand command) {
		TenantId tenantId = currentTenant.requireTenantId();
		ActorId actorId = currentActor.requireActorId();
		AuthorizedDataAccess access = authorizer.authorize(SystemPermission.SALES_ORDER_WRITE, ENTITY_TYPE);

		Order order = orderRepository.findById(tenantId, command.orderId(), actorId, access)
				.orElseThrow(() -> new DomainResourceNotFound(OrderErrorCode.ORDER_NOT_FOUND));

		if (order.version() != command.expectedVersion()) {
			throw new ResourceConflict(OrderErrorCode.ORDER_VERSION_CONFLICT);
		}

		if (order.status() != OrderStatus.PROCESSING && order.status() != OrderStatus.PARTIALLY_FULFILLED) {
			throw new IllegalStateException("Fulfillment can only be recorded when order is PROCESSING or PARTIALLY_FULFILLED");
		}

		Map<UUID, OrderLine> linesById = new HashMap<>();
		for (OrderLine l : order.lines()) {
			linesById.put(l.id(), l);
		}

		List<OrderFulfillmentEventLine> eventLines = new ArrayList<>();
		UUID eventId = identifierGenerator.nextId();

		if (command.lines() == null || command.lines().isEmpty()) {
			throw new IllegalArgumentException("Fulfillment must contain at least one line quantity");
		}

		for (FulfillmentLineInputCommand lc : command.lines()) {
			OrderLine line = linesById.get(lc.orderLineId());
			if (line == null) {
				throw new IllegalArgumentException("Invalid order line ID: " + lc.orderLineId());
			}
			if (lc.quantity() == null || lc.quantity().compareTo(BigDecimal.ZERO) <= 0) {
				continue; // Skip zero/negative entries
			}
			if (line.fulfilledQuantity().add(lc.quantity()).compareTo(line.quantity()) > 0) {
				throw new IllegalArgumentException("Fulfilled quantity exceeds remaining quantity for line: " + line.nameSnapshot());
			}
			eventLines.add(new OrderFulfillmentEventLine(
					identifierGenerator.nextId(),
					eventId,
					line.id(),
					lc.quantity()
			));
		}

		if (eventLines.isEmpty()) {
			throw new IllegalArgumentException("No positive fulfillment quantities specified");
		}

		Instant now = timeProvider.now();
		String eventNumber = orderRepository.generateFulfillmentEventNumber(tenantId, command.orderId());

		OrderFulfillmentEvent event = new OrderFulfillmentEvent(
				eventId,
				command.orderId(),
				eventNumber,
				command.referenceNumber(),
				command.fulfillmentDate() != null ? command.fulfillmentDate() : LocalDate.now(),
				command.note(),
				OrderFulfillmentStatus.RECORDED,
				now,
				actorId,
				null,
				null,
				null,
				eventLines,
				1L
		);
		orderRepository.saveFulfillmentEvent(tenantId, event);

		// Recalculate fulfilled quantities
		List<OrderFulfillmentEvent> allEvents = orderRepository.findFulfillmentsByOrderId(tenantId, command.orderId());
		Map<UUID, BigDecimal> totalFulfilledPerLine = new HashMap<>();
		for (OrderFulfillmentEvent ev : allEvents) {
			if (ev.status() == OrderFulfillmentStatus.RECORDED) {
				for (OrderFulfillmentEventLine fl : ev.lines()) {
					totalFulfilledPerLine.merge(fl.orderLineId(), fl.quantity(), BigDecimal::add);
				}
			}
		}

		boolean allFulfilled = true;
		boolean anyFulfilled = false;
		for (OrderLine line : order.lines()) {
			BigDecimal fulfilled = totalFulfilledPerLine.getOrDefault(line.id(), BigDecimal.ZERO);
			line.setFulfilledQuantity(fulfilled);
			if (fulfilled.compareTo(line.quantity()) < 0) {
				allFulfilled = false;
			}
			if (fulfilled.compareTo(BigDecimal.ZERO) > 0) {
				anyFulfilled = true;
			}
		}

		OrderStatus prevStatus = order.status();
		OrderStatus newStatus = allFulfilled ? OrderStatus.FULFILLED : (anyFulfilled ? OrderStatus.PARTIALLY_FULFILLED : OrderStatus.PROCESSING);

		order.applyDerivedFulfillmentStatus(newStatus, actorId, now);
		orderRepository.save(order);

		OrderStatusHistoryEntry history = new OrderStatusHistoryEntry(
				identifierGenerator.nextId(),
				command.orderId(),
				now,
				actorId,
				"RECORD_FULFILLMENT",
				prevStatus,
				newStatus,
				"Fulfillment event " + eventNumber + " recorded"
		);
		orderRepository.saveStatusHistory(tenantId, history);

		return mapToDetails(tenantId, order);
	}

	@Override
	@Transactional
	public OrderDetails voidFulfillment(VoidOrderFulfillmentCommand command) {
		TenantId tenantId = currentTenant.requireTenantId();
		ActorId actorId = currentActor.requireActorId();
		AuthorizedDataAccess access = authorizer.authorize(SystemPermission.SALES_ORDER_WRITE, ENTITY_TYPE);

		Order order = orderRepository.findById(tenantId, command.orderId(), actorId, access)
				.orElseThrow(() -> new DomainResourceNotFound(OrderErrorCode.ORDER_NOT_FOUND));

		if (order.version() != command.expectedVersion()) {
			throw new ResourceConflict(OrderErrorCode.ORDER_VERSION_CONFLICT);
		}

		OrderFulfillmentEvent event = orderRepository.findFulfillmentById(tenantId, command.orderId(), command.fulfillmentId())
				.orElseThrow(() -> new DomainResourceNotFound(OrderErrorCode.ORDER_NOT_FOUND));

		Instant now = timeProvider.now();
		event.voidEvent(command.reason(), actorId, now);
		orderRepository.saveFulfillmentEvent(tenantId, event);

		// Recalculate fulfilled quantities
		List<OrderFulfillmentEvent> allEvents = orderRepository.findFulfillmentsByOrderId(tenantId, command.orderId());
		Map<UUID, BigDecimal> totalFulfilledPerLine = new HashMap<>();
		for (OrderFulfillmentEvent ev : allEvents) {
			if (ev.status() == OrderFulfillmentStatus.RECORDED) {
				for (OrderFulfillmentEventLine fl : ev.lines()) {
					totalFulfilledPerLine.merge(fl.orderLineId(), fl.quantity(), BigDecimal::add);
				}
			}
		}

		boolean allFulfilled = true;
		boolean anyFulfilled = false;
		for (OrderLine line : order.lines()) {
			BigDecimal fulfilled = totalFulfilledPerLine.getOrDefault(line.id(), BigDecimal.ZERO);
			line.setFulfilledQuantity(fulfilled);
			if (fulfilled.compareTo(line.quantity()) < 0) {
				allFulfilled = false;
			}
			if (fulfilled.compareTo(BigDecimal.ZERO) > 0) {
				anyFulfilled = true;
			}
		}

		OrderStatus prevStatus = order.status();
		OrderStatus newStatus = allFulfilled ? OrderStatus.FULFILLED : (anyFulfilled ? OrderStatus.PARTIALLY_FULFILLED : OrderStatus.PROCESSING);

		order.applyDerivedFulfillmentStatus(newStatus, actorId, now);
		orderRepository.save(order);

		OrderStatusHistoryEntry history = new OrderStatusHistoryEntry(
				identifierGenerator.nextId(),
				command.orderId(),
				now,
				actorId,
				"VOID_FULFILLMENT",
				prevStatus,
				newStatus,
				"Fulfillment event " + event.eventNumber() + " voided: " + command.reason()
		);
		orderRepository.saveStatusHistory(tenantId, history);

		return mapToDetails(tenantId, order);
	}

	@Override
	@Transactional
	public OrderDetails closeRemaining(CloseRemainingOrderCommand command) {
		TenantId tenantId = currentTenant.requireTenantId();
		ActorId actorId = currentActor.requireActorId();
		AuthorizedDataAccess access = authorizer.authorize(SystemPermission.SALES_ORDER_WRITE, ENTITY_TYPE);

		Order order = orderRepository.findById(tenantId, command.orderId(), actorId, access)
				.orElseThrow(() -> new DomainResourceNotFound(OrderErrorCode.ORDER_NOT_FOUND));

		if (order.version() != command.expectedVersion()) {
			throw new ResourceConflict(OrderErrorCode.ORDER_VERSION_CONFLICT);
		}

		Instant now = timeProvider.now();
		OrderStatus prev = order.status();
		order.closeRemaining(command.reason(), actorId, now, command.expectedVersion());
		orderRepository.save(order);

		OrderStatusHistoryEntry history = new OrderStatusHistoryEntry(
				identifierGenerator.nextId(),
				command.orderId(),
				now,
				actorId,
				"CLOSE_REMAINING",
				prev,
				OrderStatus.CLOSED_PARTIAL,
				command.reason()
		);
		orderRepository.saveStatusHistory(tenantId, history);

		return mapToDetails(tenantId, order);
	}

	@Override
	@Transactional
	public OrderDetails cancel(CancelOrderCommand command) {
		TenantId tenantId = currentTenant.requireTenantId();
		ActorId actorId = currentActor.requireActorId();
		AuthorizedDataAccess access = authorizer.authorize(SystemPermission.SALES_ORDER_WRITE, ENTITY_TYPE);

		Order order = orderRepository.findById(tenantId, command.orderId(), actorId, access)
				.orElseThrow(() -> new DomainResourceNotFound(OrderErrorCode.ORDER_NOT_FOUND));

		if (order.version() != command.expectedVersion()) {
			throw new ResourceConflict(OrderErrorCode.ORDER_VERSION_CONFLICT);
		}

		Instant now = timeProvider.now();
		OrderStatus prev = order.status();
		order.cancel(command.reason(), actorId, now, command.expectedVersion());
		orderRepository.save(order);

		OrderStatusHistoryEntry history = new OrderStatusHistoryEntry(
				identifierGenerator.nextId(),
				command.orderId(),
				now,
				actorId,
				"CANCEL",
				prev,
				OrderStatus.CANCELLED,
				command.reason()
		);
		orderRepository.saveStatusHistory(tenantId, history);

		return mapToDetails(tenantId, order);
	}

	@Override
	@Transactional
	public void deleteDraft(DeleteOrderCommand command) {
		TenantId tenantId = currentTenant.requireTenantId();
		ActorId actorId = currentActor.requireActorId();
		AuthorizedDataAccess access = authorizer.authorize(SystemPermission.SALES_ORDER_WRITE, ENTITY_TYPE);

		Order order = orderRepository.findById(tenantId, command.orderId(), actorId, access)
				.orElseThrow(() -> new DomainResourceNotFound(OrderErrorCode.ORDER_NOT_FOUND));

		if (order.version() != command.expectedVersion()) {
			throw new ResourceConflict(OrderErrorCode.ORDER_VERSION_CONFLICT);
		}
		if (order.status() != OrderStatus.DRAFT) {
			throw new IllegalStateException("Only DRAFT orders can be deleted");
		}

		orderRepository.delete(tenantId, command.orderId());
	}

	// Reference Resolution and Mapping
	private OrderDetails mapToDetails(TenantId tenantId, Order order) {
		OrderReferenceDto account = new OrderReferenceDto(
				order.accountId(),
				resolveAccountName(tenantId, order.accountId()),
				true
		);
		OrderReferenceDto contact = order.contactId() != null
				? new OrderReferenceDto(order.contactId(), resolveContactName(tenantId, order.contactId()), true)
				: null;
		OrderReferenceDto opportunity = order.opportunityId() != null
				? new OrderReferenceDto(order.opportunityId(), resolveOpportunityName(tenantId, order.opportunityId()), true)
				: null;
		OrderReferenceDto quote = order.quoteId() != null
				? new OrderReferenceDto(order.quoteId(), resolveQuoteNumber(tenantId, order.quoteId()), true)
				: null;
		OrderReferenceDto priceBook = order.priceBookId() != null
				? new OrderReferenceDto(order.priceBookId(), resolvePriceBookName(tenantId, order.priceBookId()), true)
				: null;

		OrderOwnerReferenceDto owner = resolveOwner(tenantId, order.ownerUserId(), order.ownerTeamId());

		List<OrderLineDetails> lineDetails = new ArrayList<>();
		for (OrderLine line : order.lines()) {
			lineDetails.add(new OrderLineDetails(
					line.id(),
					line.lineNumber(),
					line.productId(),
					line.quoteItemId(),
					line.skuSnapshot(),
					line.nameSnapshot(),
					line.descriptionSnapshot(),
					line.unitOfMeasureSnapshot(),
					line.quantity(),
					line.fulfilledQuantity(),
					line.remainingQuantity(),
					line.unitPrice(),
					line.discountPercent(),
					line.discountAmount(),
					line.taxPercent(),
					line.taxAmount(),
					line.lineTotal()
			));
		}

		return new OrderDetails(
				order.id(),
				order.orderNumber(),
				order.sourceType(),
				order.pricingMode(),
				order.status(),
				account,
				contact,
				opportunity,
				quote,
				priceBook,
				owner,
				order.amounts(),
				order.billingAddressSnapshot(),
				order.shippingAddressSnapshot(),
				lineDetails,
				order.calculateFulfilledProgressPercent(),
				order.orderDate(),
				order.requestedDeliveryDate(),
				order.customerReference(),
				order.paymentTerms(),
				order.deliveryTerms(),
				order.notes(),
				order.confirmedAt(),
				order.confirmedBy(),
				order.fulfilledAt(),
				order.cancelledAt(),
				order.cancelledBy(),
				order.cancellationReason(),
				order.closedAt(),
				order.closedBy(),
				order.closedReason(),
				order.createdAt(),
				order.createdBy(),
				order.updatedAt(),
				order.updatedBy(),
				order.version(),
				order.getAvailableActions()
		);
	}

	private String resolveAccountName(TenantId tenantId, UUID accountId) {
		if (accountId == null) return "Account";
		try {
			return jdbcClient.sql("SELECT COALESCE(display_name, legal_name, 'Account') FROM crm_accounts WHERE tenant_id = :t AND id = :id")
					.param("t", tenantId.toString())
					.param("id", accountId.toString())
					.query(String.class)
					.optional()
					.orElse("Account");
		} catch (Exception ex) {
			return "Account";
		}
	}

	private String resolveContactName(TenantId tenantId, UUID contactId) {
		if (contactId == null) return "Contact";
		try {
			return jdbcClient.sql("SELECT COALESCE(display_name, 'Contact') FROM crm_contacts WHERE tenant_id = :t AND id = :id")
					.param("t", tenantId.toString())
					.param("id", contactId.toString())
					.query(String.class)
					.optional()
					.orElse("Contact");
		} catch (Exception ex) {
			return "Contact";
		}
	}

	private String resolveOpportunityName(TenantId tenantId, UUID oppId) {
		if (oppId == null) return "Opportunity";
		try {
			return jdbcClient.sql("SELECT COALESCE(name, 'Opportunity') FROM crm_opportunities WHERE tenant_id = :t AND id = :id")
					.param("t", tenantId.toString())
					.param("id", oppId.toString())
					.query(String.class)
					.optional()
					.orElse("Opportunity");
		} catch (Exception ex) {
			return "Opportunity";
		}
	}

	private String resolveQuoteNumber(TenantId tenantId, UUID quoteId) {
		if (quoteId == null) return "Quote";
		try {
			return jdbcClient.sql("SELECT COALESCE(quote_number, 'Quote') FROM sales_quotes WHERE tenant_id = :t AND id = :id")
					.param("t", tenantId.toString())
					.param("id", quoteId.toString())
					.query(String.class)
					.optional()
					.orElse("Quote");
		} catch (Exception ex) {
			return "Quote";
		}
	}

	private String resolvePriceBookName(TenantId tenantId, UUID priceBookId) {
		if (priceBookId == null) return "Standard Price Book";
		try {
			return jdbcClient.sql("SELECT COALESCE(name, 'Standard Price Book') FROM catalog_price_books WHERE tenant_id = :t AND id = :id")
					.param("t", tenantId.toString())
					.param("id", priceBookId.toString())
					.query(String.class)
					.optional()
					.orElse("Standard Price Book");
		} catch (Exception ex) {
			return "Standard Price Book";
		}
	}

	private String resolvePriceBookCurrency(TenantId tenantId, UUID priceBookId) {
		if (priceBookId == null) return "USD";
		try {
			return jdbcClient.sql("SELECT currency_code FROM catalog_price_books WHERE tenant_id = :t AND id = :id")
					.param("t", tenantId.toString())
					.param("id", priceBookId.toString())
					.query(String.class)
					.optional()
					.orElse("USD");
		} catch (Exception ex) {
			return "USD";
		}
	}

	private OrderOwnerReferenceDto resolveOwner(TenantId tenantId, UUID userId, UUID teamId) {
		if (teamId != null) {
			String name = "Team";
			try {
				name = jdbcClient.sql("SELECT name FROM platform_teams WHERE tenant_id = :t AND id = :id")
						.param("t", tenantId.toString())
						.param("id", teamId.toString())
						.query(String.class)
						.optional()
						.orElse("Team");
			} catch (Exception ignored) {}
			return new OrderOwnerReferenceDto("TEAM", teamId, name);
		}
		if (userId != null) {
			String name = "User";
			try {
				name = jdbcClient.sql("SELECT display_name FROM platform_users WHERE id = :id")
						.param("id", userId.toString())
						.query(String.class)
						.optional()
						.orElse("User");
			} catch (Exception ignored) {}
			return new OrderOwnerReferenceDto("USER", userId, name);
		}
		return null;
	}

	private void validateAccount(TenantId tenantId, ActorId actorId, UUID accountId, AuthorizedDataAccess access) {
		if (accountId != null && !orderRepository.existsAccount(tenantId, accountId, actorId, access)) {
			throw new DomainResourceNotFound(OrderErrorCode.ORDER_ACCOUNT_INVALID);
		}
	}

	private void validateContact(TenantId tenantId, ActorId actorId, UUID contactId, AuthorizedDataAccess access) {
		if (contactId != null && !orderRepository.existsContact(tenantId, contactId, actorId, access)) {
			throw new DomainResourceNotFound(OrderErrorCode.ORDER_NOT_FOUND);
		}
	}

	private void validateOpportunity(TenantId tenantId, ActorId actorId, UUID oppId, AuthorizedDataAccess access) {
		if (oppId != null && !orderRepository.existsOpportunity(tenantId, oppId, actorId, access)) {
			throw new DomainResourceNotFound(OrderErrorCode.ORDER_NOT_FOUND);
		}
	}

	private void validatePriceBook(TenantId tenantId, UUID priceBookId) {
		if (priceBookId != null && !orderRepository.existsPriceBook(tenantId, priceBookId)) {
			throw new DomainResourceNotFound(OrderErrorCode.ORDER_NOT_FOUND);
		}
	}

}
