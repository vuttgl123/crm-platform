package com.crm.foundation.persistence.auditing;

import java.time.Instant;
import java.util.Objects;
import java.util.Optional;

import com.crm.sharedkernel.domain.ActorId;

public record AuditStamp(Instant occurredAt, Optional<ActorId> actorId) {

	public AuditStamp {
		Objects.requireNonNull(occurredAt, "occurredAt must not be null");
		actorId = Objects.requireNonNull(actorId, "actorId must not be null");
	}

}
