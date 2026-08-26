package com.crm.overview.application.service;

import java.util.Optional;

import com.crm.foundation.security.AuthorizedDataAccess;
import com.crm.foundation.security.SystemPermission;
import com.crm.foundation.security.TenantAccessAuthorizer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Component;

/**
 * Answers "may this actor see this block at all?" without throwing.
 *
 * <p>The overview omits blocks the reader has no access to rather than failing
 * the whole request, so it needs a question the authorizer does not directly
 * offer. {@link TenantAccessAuthorizer#hasPermission} alone is not enough: an
 * actor may hold a permission and still have no data scope assigned for the
 * entity, in which case {@code authorize} throws. Both outcomes mean the same
 * thing here, so both collapse into an empty result in one place, leaving
 * {@code OverviewService} free of exception handling.
 */
@Component
public class OverviewAccessResolver {

	private static final Logger LOGGER =
			LoggerFactory.getLogger(OverviewAccessResolver.class);

	private final TenantAccessAuthorizer authorizer;

	public OverviewAccessResolver(TenantAccessAuthorizer authorizer) {
		this.authorizer = authorizer;
	}

	public Optional<AuthorizedDataAccess> resolve(SystemPermission permission,
			String entityType) {
		if (!authorizer.hasPermission(permission)) {
			return Optional.empty();
		}
		try {
			return Optional.of(authorizer.authorize(permission, entityType));
		} catch (AccessDeniedException e) {
			LOGGER.debug("Omitting the {} overview block: permission {} is held "
					+ "but no data scope is assigned", entityType, permission, e);
			return Optional.empty();
		}
	}

}
