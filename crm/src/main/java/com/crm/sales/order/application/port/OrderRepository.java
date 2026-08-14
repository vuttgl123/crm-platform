package com.crm.sales.order.application.port;

import java.util.Optional;
import java.util.UUID;

import com.crm.foundation.security.AuthorizedDataAccess;
import com.crm.sales.order.application.dto.OrderSummary;
import com.crm.sales.order.application.query.OrderSearchQuery;
import com.crm.sales.order.domain.Order;
import com.crm.sales.order.domain.OrderId;
import com.crm.sharedkernel.application.PageResult;
import com.crm.sharedkernel.domain.ActorId;
import com.crm.sharedkernel.domain.TenantId;

public interface OrderRepository {

	Optional<Order> findById(TenantId tenantId, OrderId orderId,
			ActorId actorId, AuthorizedDataAccess access);

	PageResult<OrderSummary> search(TenantId tenantId,
			ActorId actorId, OrderSearchQuery query,
			AuthorizedDataAccess access);

	boolean existsByOrderNumber(TenantId tenantId, String orderNumber,
			OrderId excludeId);

	boolean existsAccount(TenantId tenantId, UUID accountId,
			ActorId actorId, AuthorizedDataAccess access);

	boolean existsContact(TenantId tenantId, UUID contactId,
			ActorId actorId, AuthorizedDataAccess access);

	boolean existsOpportunity(TenantId tenantId, UUID opportunityId,
			ActorId actorId, AuthorizedDataAccess access);

	boolean existsQuote(TenantId tenantId, UUID quoteId,
			ActorId actorId, AuthorizedDataAccess access);

	void save(Order order);

	void delete(TenantId tenantId, OrderId orderId);

}
