package com.crm.foundation.security;

import java.util.Optional;

import com.crm.sharedkernel.domain.ActorId;

public interface CurrentActor {

	Optional<ActorId> actorId();

	default ActorId requireActorId() {
		return actorId().orElseThrow(MissingActorContextException::new);
	}

}
