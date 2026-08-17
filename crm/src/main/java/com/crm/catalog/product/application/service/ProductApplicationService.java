package com.crm.catalog.product.application.service;

import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

import com.crm.catalog.category.application.port.CategoryRepository;
import com.crm.catalog.category.domain.CategoryId;
import com.crm.catalog.product.application.command.CreateProductCommand;
import com.crm.catalog.product.application.command.UpdateProductCommand;
import com.crm.catalog.product.application.dto.ProductDetails;
import com.crm.catalog.product.application.dto.ProductSummary;
import com.crm.catalog.product.application.port.ProductRepository;
import com.crm.catalog.product.application.query.ProductSearchQuery;
import com.crm.catalog.product.application.usecase.ProductFacade;
import com.crm.catalog.product.domain.Product;
import com.crm.catalog.product.domain.ProductErrorCode;
import com.crm.catalog.product.domain.ProductId;
import com.crm.foundation.identifier.IdentifierGenerator;
import com.crm.foundation.security.CurrentActor;
import com.crm.foundation.security.SystemPermission;
import com.crm.foundation.security.TenantAccessAuthorizer;
import com.crm.foundation.tenancy.CurrentTenant;
import com.crm.foundation.time.TimeProvider;
import com.crm.sharedkernel.application.PageResult;
import com.crm.sharedkernel.domain.ActorId;
import com.crm.sharedkernel.domain.TenantId;
import com.crm.sharedkernel.domain.exception.DomainResourceNotFound;
import com.crm.sharedkernel.domain.exception.ResourceConflict;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ProductApplicationService implements ProductFacade {

	private final ProductRepository productRepository;
	private final CategoryRepository categoryRepository;
	private final CurrentTenant currentTenant;
	private final CurrentActor currentActor;
	private final TenantAccessAuthorizer authorizer;
	private final IdentifierGenerator identifierGenerator;
	private final TimeProvider timeProvider;

	public ProductApplicationService(
			ProductRepository productRepository,
			CategoryRepository categoryRepository,
			CurrentTenant currentTenant,
			CurrentActor currentActor,
			TenantAccessAuthorizer authorizer,
			IdentifierGenerator identifierGenerator,
			TimeProvider timeProvider) {
		this.productRepository = productRepository;
		this.categoryRepository = categoryRepository;
		this.currentTenant = currentTenant;
		this.currentActor = currentActor;
		this.authorizer = authorizer;
		this.identifierGenerator = identifierGenerator;
		this.timeProvider = timeProvider;
	}

	@Override
	@Transactional
	public ProductDetails create(CreateProductCommand command) {
		Objects.requireNonNull(command, "command must not be null");
		TenantId tenantId = currentTenant.requireTenantId();
		ActorId actorId = currentActor.requireActorId();
		authorizer.requirePermission(SystemPermission.SALES_CATALOG_WRITE);

		String sku = command.sku().trim().toUpperCase();
		if (productRepository.existsBySku(tenantId, sku)) {
			throw new ResourceConflict(ProductErrorCode.PRODUCT_SKU_ALREADY_EXISTS.code());
		}

		CategoryId catId = command.categoryId() != null ? new CategoryId(command.categoryId()) : null;
		if (catId != null && categoryRepository.findById(tenantId, catId).isEmpty()) {
			throw new DomainResourceNotFound(ProductErrorCode.CATEGORY_NOT_FOUND.code());
		}

		Instant now = timeProvider.now();
		ProductId id = new ProductId(identifierGenerator.nextId());
		boolean isActive = command.isActive() == null || command.isActive();

		Product product = Product.create(
				tenantId,
				id,
				sku,
				command.name(),
				command.description(),
				catId,
				command.productType(),
				command.unitOfMeasure(),
				command.taxCategory(),
				command.standardCost(),
				command.costCurrencyCode(),
				isActive,
				command.metadata(),
				actorId,
				now
		);

		try {
			productRepository.insert(product);
		}
		catch (DuplicateKeyException e) {
			throw new ResourceConflict(ProductErrorCode.PRODUCT_SKU_ALREADY_EXISTS.code());
		}

		return ProductDetails.from(product);
	}

	@Override
	@Transactional(readOnly = true)
	public ProductDetails get(ProductId id) {
		Objects.requireNonNull(id, "id must not be null");
		TenantId tenantId = currentTenant.requireTenantId();
		authorizer.requirePermission(SystemPermission.SALES_CATALOG_READ);

		Product product = productRepository.findById(tenantId, id)
				.orElseThrow(() -> new DomainResourceNotFound(ProductErrorCode.PRODUCT_NOT_FOUND.code()));

		return ProductDetails.from(product);
	}

	@Override
	@Transactional(readOnly = true)
	public PageResult<ProductSummary> search(ProductSearchQuery query) {
		TenantId tenantId = currentTenant.requireTenantId();
		authorizer.requirePermission(SystemPermission.SALES_CATALOG_READ);
		return productRepository.search(tenantId, query != null ? query : new ProductSearchQuery(null, null, null, null, null));
	}

	@Override
	@Transactional
	public ProductDetails update(UpdateProductCommand command) {
		Objects.requireNonNull(command, "command must not be null");
		TenantId tenantId = currentTenant.requireTenantId();
		ActorId actorId = currentActor.requireActorId();
		authorizer.requirePermission(SystemPermission.SALES_CATALOG_WRITE);

		Product product = productRepository.findById(tenantId, command.id())
				.orElseThrow(() -> new DomainResourceNotFound(ProductErrorCode.PRODUCT_NOT_FOUND.code()));

		if (product.version() != command.version()) {
			throw new ResourceConflict(ProductErrorCode.PRODUCT_VERSION_CONFLICT.code());
		}

		CategoryId catId = command.categoryId() != null ? new CategoryId(command.categoryId()) : null;
		if (catId != null && categoryRepository.findById(tenantId, catId).isEmpty()) {
			throw new DomainResourceNotFound(ProductErrorCode.CATEGORY_NOT_FOUND.code());
		}

		Instant now = timeProvider.now();
		boolean isActive = command.isActive() != null ? command.isActive() : product.isActive();

		product.update(
				command.name(),
				command.description(),
				catId,
				command.productType(),
				command.unitOfMeasure(),
				command.taxCategory(),
				command.standardCost(),
				command.costCurrencyCode(),
				isActive,
				command.metadata(),
				actorId,
				now
		);

		productRepository.update(product);
		return ProductDetails.from(product);
	}

	@Override
	@Transactional
	public void delete(ProductId id, long version) {
		Objects.requireNonNull(id, "id must not be null");
		TenantId tenantId = currentTenant.requireTenantId();
		ActorId actorId = currentActor.requireActorId();
		authorizer.requirePermission(SystemPermission.SALES_CATALOG_WRITE);

		Product product = productRepository.findById(tenantId, id)
				.orElseThrow(() -> new DomainResourceNotFound(ProductErrorCode.PRODUCT_NOT_FOUND.code()));

		if (product.version() != version) {
			throw new ResourceConflict(ProductErrorCode.PRODUCT_VERSION_CONFLICT.code());
		}

		product.markDeleted(actorId, timeProvider.now());
		productRepository.update(product);
	}

}
