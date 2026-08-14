package com.crm.sales.order.application.service;

import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

import com.crm.foundation.identifier.IdentifierGenerator;
import com.crm.foundation.security.AuthorizedDataAccess;
import com.crm.foundation.security.CurrentActor;
import com.crm.foundation.security.SystemPermission;
import com.crm.foundation.security.TenantAccessAuthorizer;
import com.crm.foundation.tenancy.CurrentTenant;
import com.crm.foundation.time.TimeProvider;
import com.crm.sales.order.application.command.CancelOrderCommand;
import com.crm.sales.order.application.command.ConfirmOrderCommand;
import com.crm.sales.order.application.command.CreateOrderCommand;
import com.crm.sales.order.application.command.DeleteOrderCommand;
import com.crm.sales.order.application.command.UpdateOrderCommand;
import com.crm.sales.order.application.dto.OrderDetails;
import com.crm.sales.order.application.dto.OrderSummary;
import com.crm.sales.order.application.port.OrderRepository;
import com.crm.sales.order.application.query.OrderSearchQuery;
import com.crm.sales.order.application.usecase.OrderFacade;
import com.crm.sales.order.domain.Order;
import com.crm.sales.order.domain.OrderErrorCode;
import com.crm.sales.order.domain.OrderId;
import com.crm.sharedkernel.application.PageResult;
import com.crm.sharedkernel.domain.ActorId;
import com.crm.sharedkernel.domain.TenantId;
import com.crm.sharedkernel.domain.exception.DomainResourceNotFound;
import com.crm.sharedkernel.domain.exception.ResourceConflict;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class OrderApplicationService implements OrderFacade {

	private static final String ENTITY_TYPE = "ORDER";

	private final OrderRepository orderRepository;
	private final CurrentTenant currentTenant;
	private final CurrentActor currentActor;
	private final TenantAccessAuthorizer authorizer;
	private final IdentifierGenerator identifierGenerator;
	private final TimeProvider timeProvider;

	public OrderApplicationService(
			OrderRepository orderRepository,
			CurrentTenant currentTenant,
			CurrentActor currentActor,
			TenantAccessAuthorizer authorizer,
			IdentifierGenerator identifierGenerator,
			TimeProvider timeProvider) {
		this.orderRepository = orderRepository;
		this.currentTenant = currentTenant;
		this.currentActor = currentActor;
		this.authorizer = authorizer;
		this.identifierGenerator = identifierGenerator;
		this.timeProvider = timeProvider;
	}

	@Override
	@Transactional
	public OrderDetails create(CreateOrderCommand command) {
		Objects.requireNonNull(command, "command must not be null");
		TenantId tenantId = currentTenant.requireTenantId();
		ActorId actorId = currentActor.requireActorId();
		AuthorizedDataAccess access = authorizer.authorize(
				SystemPermission.SALES_ORDER_WRITE, ENTITY_TYPE);
		OrderId orderId = new OrderId(identifierGenerator.nextId());
		Instant now = timeProvider.now();

		UUID ownerUserId = command.ownerUserId() == null ? actorId.value() : command.ownerUserId();

		Order order = Order.create(
				tenantId,
				orderId,
				command.orderNumber(),
				command.accountId(),
				command.contactId(),
				command.opportunityId(),
				command.quoteId(),
				ownerUserId,
				command.amounts(),
				command.orderDate(),
				command.requestedDeliveryDate(),
				command.customerReference(),
				actorId,
				now);

		validateAccount(tenantId, actorId, order.accountId(), access);
		validateContact(tenantId, actorId, order.contactId(), access);
		validateOpportunity(tenantId, actorId, order.opportunityId(), access);
		validateQuote(tenantId, actorId, order.quoteId(), access);
		validateUniqueOrderNumber(tenantId, order.orderNumber(), null);

		try {
			orderRepository.save(order);
		} catch (DuplicateKeyException ex) {
			throw new ResourceConflict(
					OrderErrorCode.ORDER_NUMBER_ALREADY_EXISTS);
		}

		return toDetails(order);
	}

	@Override
	@Transactional(readOnly = true)
	public OrderDetails get(OrderId orderId) {
		Objects.requireNonNull(orderId, "orderId must not be null");
		TenantId tenantId = currentTenant.requireTenantId();
		ActorId actorId = currentActor.requireActorId();
		AuthorizedDataAccess access = authorizer.authorize(
				SystemPermission.SALES_ORDER_READ, ENTITY_TYPE);

		Order order = orderRepository.findById(
				tenantId, orderId, actorId, access)
				.orElseThrow(() -> new DomainResourceNotFound(
						OrderErrorCode.ORDER_NOT_FOUND));

		return toDetails(order);
	}

	@Override
	@Transactional(readOnly = true)
	public PageResult<OrderSummary> search(OrderSearchQuery query) {
		Objects.requireNonNull(query, "query must not be null");
		TenantId tenantId = currentTenant.requireTenantId();
		ActorId actorId = currentActor.requireActorId();
		AuthorizedDataAccess access = authorizer.authorize(
				SystemPermission.SALES_ORDER_READ, ENTITY_TYPE);

		return orderRepository.search(tenantId, actorId, query, access);
	}

	@Override
	@Transactional
	public OrderDetails update(UpdateOrderCommand command) {
		Objects.requireNonNull(command, "command must not be null");
		TenantId tenantId = currentTenant.requireTenantId();
		ActorId actorId = currentActor.requireActorId();
		AuthorizedDataAccess access = authorizer.authorize(
				SystemPermission.SALES_ORDER_WRITE, ENTITY_TYPE);

		Order order = orderRepository.findById(
				tenantId, command.orderId(), actorId, access)
				.orElseThrow(() -> new DomainResourceNotFound(
						OrderErrorCode.ORDER_NOT_FOUND));

		Instant now = timeProvider.now();
		try {
			order.update(
					command.accountId(),
					command.contactId(),
					command.opportunityId(),
					command.quoteId(),
					command.ownerUserId(),
					command.status(),
					command.amounts(),
					command.orderDate(),
					command.requestedDeliveryDate(),
					command.customerReference(),
					actorId,
					now,
					command.expectedVersion());
		} catch (IllegalStateException ex) {
			throw new ResourceConflict(
					OrderErrorCode.ORDER_VERSION_CONFLICT);
		}

		validateAccount(tenantId, actorId, order.accountId(), access);
		validateContact(tenantId, actorId, order.contactId(), access);
		validateOpportunity(tenantId, actorId, order.opportunityId(), access);
		validateQuote(tenantId, actorId, order.quoteId(), access);

		try {
			orderRepository.save(order);
		} catch (DuplicateKeyException ex) {
			throw new ResourceConflict(
					OrderErrorCode.ORDER_NUMBER_ALREADY_EXISTS);
		}

		return toDetails(order);
	}

	@Override
	@Transactional
	public OrderDetails confirm(ConfirmOrderCommand command) {
		Objects.requireNonNull(command, "command must not be null");
		TenantId tenantId = currentTenant.requireTenantId();
		ActorId actorId = currentActor.requireActorId();
		AuthorizedDataAccess access = authorizer.authorize(
				SystemPermission.SALES_ORDER_WRITE, ENTITY_TYPE);

		Order order = orderRepository.findById(
				tenantId, command.orderId(), actorId, access)
				.orElseThrow(() -> new DomainResourceNotFound(
						OrderErrorCode.ORDER_NOT_FOUND));

		Instant now = timeProvider.now();
		try {
			order.confirm(actorId, now, command.expectedVersion());
		} catch (IllegalStateException ex) {
			throw new ResourceConflict(
					OrderErrorCode.ORDER_VERSION_CONFLICT);
		}

		orderRepository.save(order);
		return toDetails(order);
	}

	@Override
	@Transactional
	public OrderDetails cancel(CancelOrderCommand command) {
		Objects.requireNonNull(command, "command must not be null");
		TenantId tenantId = currentTenant.requireTenantId();
		ActorId actorId = currentActor.requireActorId();
		AuthorizedDataAccess access = authorizer.authorize(
				SystemPermission.SALES_ORDER_WRITE, ENTITY_TYPE);

		Order order = orderRepository.findById(
				tenantId, command.orderId(), actorId, access)
				.orElseThrow(() -> new DomainResourceNotFound(
						OrderErrorCode.ORDER_NOT_FOUND));

		Instant now = timeProvider.now();
		try {
			order.cancel(command.reason(), actorId, now, command.expectedVersion());
		} catch (IllegalStateException ex) {
			throw new ResourceConflict(
					OrderErrorCode.ORDER_VERSION_CONFLICT);
		}

		orderRepository.save(order);
		return toDetails(order);
	}

	@Override
	@Transactional
	public void delete(DeleteOrderCommand command) {
		Objects.requireNonNull(command, "command must not be null");
		TenantId tenantId = currentTenant.requireTenantId();
		ActorId actorId = currentActor.requireActorId();
		AuthorizedDataAccess access = authorizer.authorize(
				SystemPermission.SALES_ORDER_WRITE, ENTITY_TYPE);

		Order order = orderRepository.findById(
				tenantId, command.orderId(), actorId, access)
				.orElseThrow(() -> new DomainResourceNotFound(
						OrderErrorCode.ORDER_NOT_FOUND));

		if (order.version() != command.expectedVersion()) {
			throw new ResourceConflict(
					OrderErrorCode.ORDER_VERSION_CONFLICT);
		}

		orderRepository.delete(tenantId, command.orderId());
	}

	private void validateAccount(TenantId tenantId, ActorId actorId,
			UUID accountId, AuthorizedDataAccess access) {
		if (accountId == null) {
			return;
		}
		if (!orderRepository.existsAccount(tenantId, accountId, actorId, access)) {
			throw new DomainResourceNotFound(
					OrderErrorCode.ORDER_ACCOUNT_INVALID);
		}
	}

	private void validateContact(TenantId tenantId, ActorId actorId,
			UUID contactId, AuthorizedDataAccess access) {
		if (contactId == null) {
			return;
		}
		if (!orderRepository.existsContact(tenantId, contactId, actorId, access)) {
			throw new DomainResourceNotFound(
					OrderErrorCode.ORDER_ACCOUNT_INVALID);
		}
	}

	private void validateOpportunity(TenantId tenantId, ActorId actorId,
			UUID opportunityId, AuthorizedDataAccess access) {
		if (opportunityId == null) {
			return;
		}
		if (!orderRepository.existsOpportunity(tenantId, opportunityId, actorId, access)) {
			throw new DomainResourceNotFound(
					OrderErrorCode.ORDER_ACCOUNT_INVALID);
		}
	}

	private void validateQuote(TenantId tenantId, ActorId actorId,
			UUID quoteId, AuthorizedDataAccess access) {
		if (quoteId == null) {
			return;
		}
		if (!orderRepository.existsQuote(tenantId, quoteId, actorId, access)) {
			throw new DomainResourceNotFound(
					OrderErrorCode.ORDER_ACCOUNT_INVALID);
		}
	}

	private void validateUniqueOrderNumber(TenantId tenantId,
			String orderNumber, OrderId excludeId) {
		if (orderNumber == null || orderNumber.trim().isEmpty()) {
			return;
		}
		if (orderRepository.existsByOrderNumber(tenantId, orderNumber, excludeId)) {
			throw new ResourceConflict(
					OrderErrorCode.ORDER_NUMBER_ALREADY_EXISTS);
		}
	}

	private OrderDetails toDetails(Order order) {
		return new OrderDetails(
				order.tenantId(),
				order.id(),
				order.orderNumber(),
				order.accountId(),
				order.contactId(),
				order.opportunityId(),
				order.quoteId(),
				order.ownerUserId(),
				order.status(),
				order.amounts(),
				order.orderDate(),
				order.requestedDeliveryDate(),
				order.customerReference(),
				order.confirmedAt(),
				order.fulfilledAt(),
				order.cancelledAt(),
				order.cancellationReason(),
				order.createdAt(),
				order.createdBy(),
				order.updatedAt(),
				order.updatedBy(),
				order.version());
	}

}
