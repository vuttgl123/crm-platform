package com.crm.platform.settings.domain;

import java.time.Instant;
import java.util.Objects;

import com.crm.sharedkernel.domain.TenantId;

public class DocumentSequence {

	private final TenantId tenantId;
	private final String entityType;
	private String prefix;
	private String dateFormatPattern;
	private int paddingLength;
	private long currentValue;
	private Instant updatedAt;

	public DocumentSequence(
			TenantId tenantId,
			String entityType,
			String prefix,
			String dateFormatPattern,
			int paddingLength,
			long currentValue,
			Instant updatedAt) {
		this.tenantId = Objects.requireNonNull(tenantId, "tenantId must not be null");
		this.entityType = Objects.requireNonNull(entityType, "entityType must not be null");
		this.prefix = prefix != null ? prefix : "";
		this.dateFormatPattern = dateFormatPattern != null ? dateFormatPattern : "";
		this.paddingLength = paddingLength > 0 ? paddingLength : 4;
		this.currentValue = Math.max(0, currentValue);
		this.updatedAt = Objects.requireNonNull(updatedAt, "updatedAt must not be null");
	}

	public TenantId tenantId() {
		return tenantId;
	}

	public String entityType() {
		return entityType;
	}

	public String prefix() {
		return prefix;
	}

	public String dateFormatPattern() {
		return dateFormatPattern;
	}

	public int paddingLength() {
		return paddingLength;
	}

	public long currentValue() {
		return currentValue;
	}

	public Instant updatedAt() {
		return updatedAt;
	}

	public void updateConfiguration(String prefix, String dateFormatPattern, int paddingLength, Instant now) {
		this.prefix = prefix != null ? prefix : "";
		this.dateFormatPattern = dateFormatPattern != null ? dateFormatPattern : "";
		this.paddingLength = paddingLength > 0 ? paddingLength : 4;
		this.updatedAt = Objects.requireNonNull(now, "now must not be null");
	}

	public void resetCounter(long newCounter, Instant now) {
		this.currentValue = Math.max(0, newCounter);
		this.updatedAt = Objects.requireNonNull(now, "now must not be null");
	}
}
