package com.crm.catalog.pricebook.application.service;

import java.time.Instant;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

import com.crm.catalog.pricebook.application.command.AddPriceBookItemCommand;
import com.crm.catalog.pricebook.application.command.CreatePriceBookCommand;
import com.crm.catalog.pricebook.application.command.UpdatePriceBookCommand;
import com.crm.catalog.pricebook.application.dto.PriceBookDetails;
import com.crm.catalog.pricebook.application.dto.PriceBookItemDetails;
import com.crm.catalog.pricebook.application.dto.PriceBookSummary;
import com.crm.catalog.pricebook.application.port.PriceBookRepository;
import com.crm.catalog.pricebook.application.usecase.PriceBookFacade;
import com.crm.catalog.pricebook.domain.PriceBook;
import com.crm.catalog.pricebook.domain.PriceBookErrorCode;
import com.crm.catalog.pricebook.domain.PriceBookId;
import com.crm.catalog.pricebook.domain.PriceBookItem;
import com.crm.catalog.pricebook.domain.PriceBookItemId;
import com.crm.catalog.product.application.port.ProductRepository;
import com.crm.catalog.product.domain.Product;
import com.crm.catalog.product.domain.ProductId;
import com.crm.foundation.identifier.IdentifierGenerator;
import com.crm.foundation.security.CurrentActor;
import com.crm.foundation.security.SystemPermission;
import com.crm.foundation.security.TenantAccessAuthorizer;
import com.crm.foundation.tenancy.CurrentTenant;
import com.crm.foundation.time.TimeProvider;
import com.crm.sharedkernel.domain.ActorId;
import com.crm.sharedkernel.domain.TenantId;
import com.crm.sharedkernel.domain.exception.DomainResourceNotFound;
import com.crm.sharedkernel.domain.exception.ResourceConflict;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PriceBookApplicationService implements PriceBookFacade {

	private final PriceBookRepository priceBookRepository;
	private final ProductRepository productRepository;
	private final CurrentTenant currentTenant;
	private final CurrentActor currentActor;
	private final TenantAccessAuthorizer authorizer;
	private final IdentifierGenerator identifierGenerator;
	private final TimeProvider timeProvider;

	public PriceBookApplicationService(
			PriceBookRepository priceBookRepository,
			ProductRepository productRepository,
			CurrentTenant currentTenant,
			CurrentActor currentActor,
			TenantAccessAuthorizer authorizer,
			IdentifierGenerator identifierGenerator,
			TimeProvider timeProvider) {
		this.priceBookRepository = priceBookRepository;
		this.productRepository = productRepository;
		this.currentTenant = currentTenant;
		this.currentActor = currentActor;
		this.authorizer = authorizer;
		this.identifierGenerator = identifierGenerator;
		this.timeProvider = timeProvider;
	}

	@Override
	@Transactional
	public PriceBookDetails create(CreatePriceBookCommand command) {
		Objects.requireNonNull(command, "command must not be null");
		TenantId tenantId = currentTenant.requireTenantId();
		ActorId actorId = currentActor.requireActorId();
		authorizer.requirePermission(SystemPermission.SALES_CATALOG_WRITE);

		String code = command.priceBookCode().trim().toUpperCase();
		if (priceBookRepository.existsByCode(tenantId, code)) {
			throw new ResourceConflict(PriceBookErrorCode.PRICE_BOOK_CODE_ALREADY_EXISTS.code());
		}

		Instant now = timeProvider.now();
		PriceBookId id = new PriceBookId(identifierGenerator.nextId());
		boolean isDefault = command.isDefault() != null ? command.isDefault() : false;
		boolean isActive = command.isActive() == null || command.isActive();

		PriceBook priceBook = PriceBook.create(
				tenantId,
				id,
				code,
				command.name(),
				command.currencyCode(),
				command.validFrom(),
				command.validTo(),
				isDefault,
				isActive,
				actorId,
				now
		);

		try {
			priceBookRepository.insert(priceBook);
		}
		catch (DuplicateKeyException e) {
			throw new ResourceConflict(PriceBookErrorCode.PRICE_BOOK_CODE_ALREADY_EXISTS.code());
		}

		return PriceBookDetails.from(priceBook, List.of());
	}

	@Override
	@Transactional(readOnly = true)
	public PriceBookDetails get(PriceBookId id) {
		Objects.requireNonNull(id, "id must not be null");
		TenantId tenantId = currentTenant.requireTenantId();
		authorizer.requirePermission(SystemPermission.SALES_CATALOG_READ);

		PriceBook priceBook = priceBookRepository.findById(tenantId, id)
				.orElseThrow(() -> new DomainResourceNotFound(PriceBookErrorCode.PRICE_BOOK_NOT_FOUND.code()));

		List<PriceBookItemDetails> items = priceBookRepository.findItemsByPriceBookId(tenantId, id);
		return PriceBookDetails.from(priceBook, items);
	}

	@Override
	@Transactional(readOnly = true)
	public List<PriceBookSummary> list() {
		TenantId tenantId = currentTenant.requireTenantId();
		authorizer.requirePermission(SystemPermission.SALES_CATALOG_READ);
		return priceBookRepository.findAll(tenantId);
	}

	@Override
	@Transactional
	public PriceBookDetails update(UpdatePriceBookCommand command) {
		Objects.requireNonNull(command, "command must not be null");
		TenantId tenantId = currentTenant.requireTenantId();
		ActorId actorId = currentActor.requireActorId();
		authorizer.requirePermission(SystemPermission.SALES_CATALOG_WRITE);

		PriceBook priceBook = priceBookRepository.findById(tenantId, command.id())
				.orElseThrow(() -> new DomainResourceNotFound(PriceBookErrorCode.PRICE_BOOK_NOT_FOUND.code()));

		if (priceBook.version() != command.version()) {
			throw new ResourceConflict(PriceBookErrorCode.PRICE_BOOK_VERSION_CONFLICT.code());
		}

		Instant now = timeProvider.now();
		boolean isDefault = command.isDefault() != null ? command.isDefault() : priceBook.isDefault();
		boolean isActive = command.isActive() != null ? command.isActive() : priceBook.isActive();

		priceBook.update(
				command.name(),
				command.currencyCode(),
				command.validFrom(),
				command.validTo(),
				isDefault,
				isActive,
				actorId,
				now
		);

		priceBookRepository.update(priceBook);
		List<PriceBookItemDetails> items = priceBookRepository.findItemsByPriceBookId(tenantId, command.id());
		return PriceBookDetails.from(priceBook, items);
	}

	@Override
	@Transactional
	public void delete(PriceBookId id, long version) {
		Objects.requireNonNull(id, "id must not be null");
		TenantId tenantId = currentTenant.requireTenantId();
		authorizer.requirePermission(SystemPermission.SALES_CATALOG_WRITE);

		PriceBook priceBook = priceBookRepository.findById(tenantId, id)
				.orElseThrow(() -> new DomainResourceNotFound(PriceBookErrorCode.PRICE_BOOK_NOT_FOUND.code()));

		if (priceBook.version() != version) {
			throw new ResourceConflict(PriceBookErrorCode.PRICE_BOOK_VERSION_CONFLICT.code());
		}

		priceBookRepository.delete(tenantId, id, version);
	}

	@Override
	@Transactional
	public PriceBookItemDetails addItem(AddPriceBookItemCommand command) {
		Objects.requireNonNull(command, "command must not be null");
		TenantId tenantId = currentTenant.requireTenantId();
		ActorId actorId = currentActor.requireActorId();
		authorizer.requirePermission(SystemPermission.SALES_CATALOG_WRITE);

		PriceBook priceBook = priceBookRepository.findById(tenantId, command.priceBookId())
				.orElseThrow(() -> new DomainResourceNotFound(PriceBookErrorCode.PRICE_BOOK_NOT_FOUND.code()));

		ProductId prodId = new ProductId(command.productId());
		Product product = productRepository.findById(tenantId, prodId)
				.orElseThrow(() -> new DomainResourceNotFound(PriceBookErrorCode.PRODUCT_NOT_FOUND.code()));

		PriceBookItemId itemId = new PriceBookItemId(identifierGenerator.nextId());
		Instant now = timeProvider.now();
		int minQty = command.minimumQuantity() != null ? command.minimumQuantity() : 1;

		PriceBookItem item = PriceBookItem.create(
				tenantId,
				itemId,
				command.priceBookId(),
				prodId,
				command.unitPrice(),
				minQty,
				command.validFrom(),
				command.validTo(),
				actorId,
				now
		);

		try {
			priceBookRepository.insertItem(item);
		}
		catch (DuplicateKeyException e) {
			throw new ResourceConflict(PriceBookErrorCode.DUPLICATE_PRICE_BOOK_ITEM.code());
		}

		return new PriceBookItemDetails(
				item.id().value(),
				item.priceBookId().value(),
				product.id().value(),
				product.sku(),
				product.name(),
				item.unitPrice(),
				item.minimumQuantity(),
				item.validFrom(),
				item.validTo(),
				actorId.value(),
				now,
				actorId.value(),
				now,
				item.version()
		);
	}

	@Override
	@Transactional
	public void removeItem(PriceBookId priceBookId, PriceBookItemId itemId) {
		Objects.requireNonNull(priceBookId, "priceBookId must not be null");
		Objects.requireNonNull(itemId, "itemId must not be null");
		TenantId tenantId = currentTenant.requireTenantId();
		authorizer.requirePermission(SystemPermission.SALES_CATALOG_WRITE);

		PriceBookItem item = priceBookRepository.findItemById(tenantId, itemId)
				.orElseThrow(() -> new DomainResourceNotFound(PriceBookErrorCode.PRICE_BOOK_ITEM_NOT_FOUND.code()));

		if (!item.priceBookId().equals(priceBookId)) {
			throw new DomainResourceNotFound(PriceBookErrorCode.PRICE_BOOK_ITEM_NOT_FOUND.code());
		}

		priceBookRepository.deleteItem(tenantId, itemId);
	}

	@Override
	@Transactional(readOnly = true)
	public com.crm.catalog.pricebook.application.dto.PriceBookStatsDto getStats() {
		TenantId tenantId = currentTenant.requireTenantId();
		authorizer.requirePermission(SystemPermission.SALES_CATALOG_READ);
		return priceBookRepository.getStats(tenantId);
	}

	@Override
	@Transactional
	public PriceBookDetails clonePriceBook(com.crm.catalog.pricebook.application.command.ClonePriceBookCommand command) {
		Objects.requireNonNull(command, "command must not be null");
		TenantId tenantId = currentTenant.requireTenantId();
		ActorId actorId = currentActor.requireActorId();
		authorizer.requirePermission(SystemPermission.SALES_CATALOG_WRITE);

		PriceBook source = priceBookRepository.findById(tenantId, command.sourceId())
				.orElseThrow(() -> new DomainResourceNotFound(PriceBookErrorCode.PRICE_BOOK_NOT_FOUND.code()));

		if (priceBookRepository.existsByCode(tenantId, command.newCode())) {
			throw new ResourceConflict(PriceBookErrorCode.PRICE_BOOK_CODE_EXISTS.code());
		}

		Instant now = timeProvider.now();
		PriceBookId targetId = new PriceBookId(identifierGenerator.generate());
		PriceBook target = PriceBook.create(
				tenantId,
				targetId,
				command.newCode(),
				command.newName(),
				source.currencyCode(),
				source.validFrom(),
				source.validTo(),
				false,
				true,
				actorId,
				now
		);
		priceBookRepository.insert(target);

		List<PriceBookItemDetails> sourceItems = priceBookRepository.findItemsByPriceBookId(tenantId, command.sourceId());
		java.math.BigDecimal multiplier = command.adjustmentPercentage() != null
				? java.math.BigDecimal.ONE.add(command.adjustmentPercentage().divide(new java.math.BigDecimal("100"), 4, java.math.RoundingMode.HALF_UP))
				: java.math.BigDecimal.ONE;

		List<PriceBookItem> newItems = sourceItems.stream().map(item -> {
			PriceBookItemId newItemId = new PriceBookItemId(identifierGenerator.generate());
			java.math.BigDecimal adjustedPrice = item.unitPrice().multiply(multiplier).setScale(2, java.math.RoundingMode.HALF_UP);
			return PriceBookItem.create(
					tenantId,
					newItemId,
					targetId,
					new ProductId(item.productId()),
					adjustedPrice,
					item.minimumQuantity(),
					item.validFrom(),
					item.validTo(),
					actorId,
					now
			);
		}).toList();

		priceBookRepository.insertItemsBatch(tenantId, newItems);
		return get(targetId);
	}

	@Override
	@Transactional
	public int bulkAddItems(com.crm.catalog.pricebook.application.command.BulkAddPriceBookItemsCommand command) {
		Objects.requireNonNull(command, "command must not be null");
		TenantId tenantId = currentTenant.requireTenantId();
		ActorId actorId = currentActor.requireActorId();
		authorizer.requirePermission(SystemPermission.SALES_CATALOG_WRITE);

		priceBookRepository.findById(tenantId, command.priceBookId())
				.orElseThrow(() -> new DomainResourceNotFound(PriceBookErrorCode.PRICE_BOOK_NOT_FOUND.code()));

		Instant now = timeProvider.now();
		List<PriceBookItem> items = command.items().stream().map(entry -> {
			PriceBookItemId itemId = new PriceBookItemId(identifierGenerator.generate());
			int minQty = entry.minimumQuantity() != null ? entry.minimumQuantity() : 1;
			return PriceBookItem.create(
					tenantId,
					itemId,
					command.priceBookId(),
					new ProductId(entry.productId()),
					entry.unitPrice(),
					minQty,
					null,
					null,
					actorId,
					now
			);
		}).toList();

		priceBookRepository.insertItemsBatch(tenantId, items);
		return items.size();
	}

	@Override
	@Transactional
	public PriceBookDetails updateStatus(com.crm.catalog.pricebook.application.command.ChangePriceBookStatusCommand command) {
		Objects.requireNonNull(command, "command must not be null");
		TenantId tenantId = currentTenant.requireTenantId();
		ActorId actorId = currentActor.requireActorId();
		authorizer.requirePermission(SystemPermission.SALES_CATALOG_WRITE);

		priceBookRepository.updateStatus(tenantId, command.id(), command.active(), actorId, timeProvider.now());
		return get(command.id());
	}

}
