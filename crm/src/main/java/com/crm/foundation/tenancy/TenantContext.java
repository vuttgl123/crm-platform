package com.crm.foundation.tenancy;

import java.util.Objects;
import java.util.Optional;

import com.crm.sharedkernel.domain.TenantId;

public final class TenantContext {

	private static final ThreadLocal<TenantId> CURRENT_TENANT = new ThreadLocal<>();

	private TenantContext() {
	}

	public static Optional<TenantId> currentTenantId() {
		return Optional.ofNullable(CURRENT_TENANT.get());
	}

	public static Scope open(TenantId tenantId) {
		TenantId previousTenantId = CURRENT_TENANT.get();
		CURRENT_TENANT.set(Objects.requireNonNull(tenantId,
				"tenantId must not be null"));
		return new Scope(previousTenantId);
	}

	public static final class Scope implements AutoCloseable {

		private final TenantId previousTenantId;
		private boolean closed;

		private Scope(TenantId previousTenantId) {
			this.previousTenantId = previousTenantId;
		}

		@Override
		public void close() {
			if (closed) {
				return;
			}
			closed = true;
			if (previousTenantId == null) {
				CURRENT_TENANT.remove();
			}
			else {
				CURRENT_TENANT.set(previousTenantId);
			}
		}
	}

}
