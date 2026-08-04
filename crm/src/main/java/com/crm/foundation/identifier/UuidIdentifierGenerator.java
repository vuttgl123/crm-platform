package com.crm.foundation.identifier;

import java.util.UUID;

import org.springframework.stereotype.Component;

@Component
public final class UuidIdentifierGenerator implements IdentifierGenerator {

	@Override
	public UUID nextId() {
		return UUID.randomUUID();
	}

}
