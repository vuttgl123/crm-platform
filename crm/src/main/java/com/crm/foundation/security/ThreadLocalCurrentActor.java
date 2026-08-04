package com.crm.foundation.security;

import java.util.Optional;

import com.crm.sharedkernel.domain.ActorId;
import org.springframework.stereotype.Component;

@Component
public final class ThreadLocalCurrentActor implements CurrentActor {

	@Override
	public Optional<ActorId> actorId() {
		return ActorContext.currentActorId();
	}

}
