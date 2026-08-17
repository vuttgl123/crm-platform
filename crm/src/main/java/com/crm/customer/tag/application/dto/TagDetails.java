package com.crm.customer.tag.application.dto;

import java.time.Instant;
import java.util.UUID;

import com.crm.customer.tag.domain.Tag;

public record TagDetails(
		UUID id,
		String tagKey,
		String name,
		String description,
		String colorHex,
		boolean active,
		UUID createdBy,
		Instant createdAt,
		UUID updatedBy,
		Instant updatedAt,
		long version
) {

	public static TagDetails from(Tag tag) {
		return new TagDetails(
				tag.id().value(),
				tag.tagKey(),
				tag.name(),
				tag.description(),
				tag.colorHex(),
				tag.isActive(),
				tag.auditInfo().createdBy() != null ? tag.auditInfo().createdBy().value() : null,
				tag.auditInfo().createdAt(),
				tag.auditInfo().updatedBy() != null ? tag.auditInfo().updatedBy().value() : null,
				tag.auditInfo().updatedAt(),
				tag.version()
		);
	}

}
