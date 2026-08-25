package com.crm.foundation.security;

import java.util.Optional;
import java.util.UUID;

import com.crm.sharedkernel.domain.ActorId;

public interface CurrentActor {

	Optional<ActorId> actorId();

	default ActorId requireActorId() {
		return actorId().orElseThrow(MissingActorContextException::new);
	}

	default ActorId require() {
		return requireActorId();
	}

	default ActorId get() {
		return requireActorId();
	}

}
