package com.crm.catalog.pricebook.domain;

import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

import com.crm.sharedkernel.domain.ActorId;
import com.crm.sharedkernel.domain.AuditInfo;
import com.crm.sharedkernel.domain.TenantId;

public final class PriceBook {

	private final TenantId tenantId;
	private final PriceBookId id;
	private String priceBookCode;
	private String name;
	private String currencyCode;
	private LocalDate validFrom;
	private LocalDate validTo;
	private boolean isDefault;
	private boolean isActive;
	private final List<PriceBookItem> items;
	private final AuditInfo auditInfo;
	private long version;

	public PriceBook(TenantId tenantId, PriceBookId id, String priceBookCode,
			String name, String currencyCode, LocalDate validFrom, LocalDate validTo,
			boolean isDefault, boolean isActive, List<PriceBookItem> items,
			AuditInfo auditInfo, long version) {
		this.tenantId = Objects.requireNonNull(tenantId, "tenantId must not be null");
		this.id = Objects.requireNonNull(id, "id must not be null");
		this.priceBookCode = Objects.requireNonNull(priceBookCode, "priceBookCode must not be null");
		this.name = Objects.requireNonNull(name, "name must not be null");
		this.currencyCode = Objects.requireNonNull(currencyCode, "currencyCode must not be null");
		this.validFrom = validFrom;
		this.validTo = validTo;
		this.isDefault = isDefault;
		this.isActive = isActive;
		this.items = items != null ? new ArrayList<>(items) : new ArrayList<>();
		this.auditInfo = Objects.requireNonNull(auditInfo, "auditInfo must not be null");
		this.version = version;
	}

	public static PriceBook create(TenantId tenantId, PriceBookId id,
			String priceBookCode, String name, String currencyCode,
			LocalDate validFrom, LocalDate validTo, boolean isDefault,
			boolean isActive, ActorId actorId, Instant now) {
		return new PriceBook(tenantId, id, priceBookCode.trim().toUpperCase(),
				name.trim(), currencyCode.trim().toUpperCase(), validFrom, validTo,
				isDefault, isActive, new ArrayList<>(),
				AuditInfo.create(actorId, now), 1L);
	}

	public void update(String name, String currencyCode, LocalDate validFrom,
			LocalDate validTo, boolean isDefault, boolean isActive,
			ActorId actorId, Instant now) {
		this.name = Objects.requireNonNull(name, "name must not be null").trim();
		this.currencyCode = Objects.requireNonNull(currencyCode, "currencyCode must not be null").trim().toUpperCase();
		this.validFrom = validFrom;
		this.validTo = validTo;
		this.isDefault = isDefault;
		this.isActive = isActive;
		this.auditInfo.update(actorId, now);
		this.version++;
	}

	public TenantId tenantId() {
		return tenantId;
	}

	public PriceBookId id() {
		return id;
	}

	public String priceBookCode() {
		return priceBookCode;
	}

	public String name() {
		return name;
	}

	public String currencyCode() {
		return currencyCode;
	}

	public LocalDate validFrom() {
		return validFrom;
	}

	public LocalDate validTo() {
		return validTo;
	}

	public boolean isDefault() {
		return isDefault;
	}

	public boolean isActive() {
		return isActive;
	}

	public List<PriceBookItem> items() {
		return Collections.unmodifiableList(items);
	}

	public AuditInfo auditInfo() {
		return auditInfo;
	}

	public long version() {
		return version;
	}

}
