package com.crm.sales.order.application.port;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import com.crm.foundation.security.AuthorizedDataAccess;
import com.crm.sales.order.application.dto.OrderPulseDto;
import com.crm.sales.order.application.dto.OrderStatsDto;
import com.crm.sales.order.application.dto.OrderSummary;
import com.crm.sales.order.application.query.OrderSearchQuery;
import com.crm.sales.order.domain.Order;
import com.crm.sales.order.domain.OrderFulfillmentEvent;
import com.crm.sales.order.domain.OrderId;
import com.crm.sales.order.domain.OrderStatus;
import com.crm.sales.order.domain.OrderStatusHistoryEntry;
import com.crm.sharedkernel.application.PageResult;
import com.crm.sharedkernel.domain.ActorId;
import com.crm.sharedkernel.domain.TenantId;

public interface OrderRepository {

	Optional<Order> findById(TenantId tenantId, OrderId orderId,
			ActorId actorId, AuthorizedDataAccess access);

	PageResult<OrderSummary> search(TenantId tenantId,
			ActorId actorId, OrderSearchQuery query,
			AuthorizedDataAccess access);

	String generateOrderNumber(TenantId tenantId);

	String generateFulfillmentEventNumber(TenantId tenantId, OrderId orderId);

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

	boolean existsPriceBook(TenantId tenantId, UUID priceBookId);

	void save(Order order);

	void saveFulfillmentEvent(TenantId tenantId, OrderFulfillmentEvent event);

	void saveStatusHistory(TenantId tenantId, OrderStatusHistoryEntry entry);

	List<OrderFulfillmentEvent> findFulfillmentsByOrderId(TenantId tenantId, OrderId orderId);

	Optional<OrderFulfillmentEvent> findFulfillmentById(TenantId tenantId, OrderId orderId, UUID fulfillmentId);

	List<OrderStatusHistoryEntry> findStatusHistory(TenantId tenantId, OrderId orderId);

	OrderPulseDto getPulse(TenantId tenantId, ActorId actorId, AuthorizedDataAccess access);

	OrderStatsDto getStats(TenantId tenantId, ActorId actorId, AuthorizedDataAccess access);

	int bulkChangeStatus(TenantId tenantId, List<UUID> orderIds, OrderStatus status, String reason, ActorId actorId, Instant now);

	void delete(TenantId tenantId, OrderId orderId);

}
