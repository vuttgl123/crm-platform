package com.crm.catalog.category.application.service;

import java.time.Instant;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

import com.crm.catalog.category.application.command.CreateCategoryCommand;
import com.crm.catalog.category.application.command.UpdateCategoryCommand;
import com.crm.catalog.category.application.dto.CategoryDetails;
import com.crm.catalog.category.application.dto.CategorySummary;
import com.crm.catalog.category.application.port.CategoryRepository;
import com.crm.catalog.category.application.usecase.CategoryFacade;
import com.crm.catalog.category.domain.CategoryErrorCode;
import com.crm.catalog.category.domain.CategoryId;
import com.crm.catalog.category.domain.ProductCategory;
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
public class CategoryApplicationService implements CategoryFacade {

	private final CategoryRepository categoryRepository;
	private final CurrentTenant currentTenant;
	private final CurrentActor currentActor;
	private final TenantAccessAuthorizer authorizer;
	private final IdentifierGenerator identifierGenerator;
	private final TimeProvider timeProvider;

	public CategoryApplicationService(
			CategoryRepository categoryRepository,
			CurrentTenant currentTenant,
			CurrentActor currentActor,
			TenantAccessAuthorizer authorizer,
			IdentifierGenerator identifierGenerator,
			TimeProvider timeProvider) {
		this.categoryRepository = categoryRepository;
		this.currentTenant = currentTenant;
		this.currentActor = currentActor;
		this.authorizer = authorizer;
		this.identifierGenerator = identifierGenerator;
		this.timeProvider = timeProvider;
	}

	@Override
	@Transactional
	public CategoryDetails create(CreateCategoryCommand command) {
		Objects.requireNonNull(command, "command must not be null");
		TenantId tenantId = currentTenant.requireTenantId();
		ActorId actorId = currentActor.requireActorId();
		authorizer.requirePermission(SystemPermission.SALES_CATALOG_WRITE);

		String code = command.categoryCode().trim().toUpperCase();
		if (categoryRepository.existsByCode(tenantId, code)) {
			throw new ResourceConflict(CategoryErrorCode.CATEGORY_CODE_ALREADY_EXISTS.code());
		}

		CategoryId parentId = command.parentCategoryId() != null ? new CategoryId(command.parentCategoryId()) : null;
		if (parentId != null && categoryRepository.findById(tenantId, parentId).isEmpty()) {
			throw new DomainResourceNotFound(CategoryErrorCode.PARENT_CATEGORY_NOT_FOUND.code());
		}

		Instant now = timeProvider.now();
		CategoryId id = new CategoryId(identifierGenerator.nextId());
		boolean isActive = command.isActive() == null || command.isActive();

		ProductCategory category = ProductCategory.create(
				tenantId,
				id,
				code,
				command.name(),
				parentId,
				command.description(),
				isActive,
				actorId,
				now
		);

		try {
			categoryRepository.insert(category);
		}
		catch (DuplicateKeyException e) {
			throw new ResourceConflict(CategoryErrorCode.CATEGORY_CODE_ALREADY_EXISTS.code());
		}

		return CategoryDetails.from(category);
	}

	@Override
	@Transactional(readOnly = true)
	public CategoryDetails get(CategoryId id) {
		Objects.requireNonNull(id, "id must not be null");
		TenantId tenantId = currentTenant.requireTenantId();
		authorizer.requirePermission(SystemPermission.SALES_CATALOG_READ);

		ProductCategory category = categoryRepository.findById(tenantId, id)
				.orElseThrow(() -> new DomainResourceNotFound(CategoryErrorCode.CATEGORY_NOT_FOUND.code()));

		return CategoryDetails.from(category);
	}

	@Override
	@Transactional(readOnly = true)
	public List<CategorySummary> list() {
		TenantId tenantId = currentTenant.requireTenantId();
		authorizer.requirePermission(SystemPermission.SALES_CATALOG_READ);
		return categoryRepository.findAll(tenantId);
	}

	@Override
	@Transactional
	public CategoryDetails update(UpdateCategoryCommand command) {
		Objects.requireNonNull(command, "command must not be null");
		TenantId tenantId = currentTenant.requireTenantId();
		ActorId actorId = currentActor.requireActorId();
		authorizer.requirePermission(SystemPermission.SALES_CATALOG_WRITE);

		ProductCategory category = categoryRepository.findById(tenantId, command.id())
				.orElseThrow(() -> new DomainResourceNotFound(CategoryErrorCode.CATEGORY_NOT_FOUND.code()));

		if (category.version() != command.version()) {
			throw new ResourceConflict(CategoryErrorCode.CATEGORY_VERSION_CONFLICT.code());
		}

		CategoryId parentId = command.parentCategoryId() != null ? new CategoryId(command.parentCategoryId()) : null;
		if (parentId != null) {
			if (parentId.equals(command.id())) {
				throw new ResourceConflict(CategoryErrorCode.CYCLIC_CATEGORY_HIERARCHY.code());
			}
			if (categoryRepository.findById(tenantId, parentId).isEmpty()) {
				throw new DomainResourceNotFound(CategoryErrorCode.PARENT_CATEGORY_NOT_FOUND.code());
			}
		}

		Instant now = timeProvider.now();
		boolean isActive = command.isActive() != null ? command.isActive() : category.isActive();

		category.update(
				command.name(),
				parentId,
				command.description(),
				isActive,
				actorId,
				now
		);

		categoryRepository.update(category);
		return CategoryDetails.from(category);
	}

	@Override
	@Transactional
	public void delete(CategoryId id, long version) {
		Objects.requireNonNull(id, "id must not be null");
		TenantId tenantId = currentTenant.requireTenantId();
		authorizer.requirePermission(SystemPermission.SALES_CATALOG_WRITE);

		ProductCategory category = categoryRepository.findById(tenantId, id)
				.orElseThrow(() -> new DomainResourceNotFound(CategoryErrorCode.CATEGORY_NOT_FOUND.code()));

		if (category.version() != version) {
			throw new ResourceConflict(CategoryErrorCode.CATEGORY_VERSION_CONFLICT.code());
		}

		categoryRepository.delete(tenantId, id, version);
	}

}
