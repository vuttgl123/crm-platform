package com.crm.overview.infrastructure.persistence;

/** The tenant-wide currency and timezone every overview figure is measured in. */
public record TenantDefaults(String currencyCode, String timezone) {
}
