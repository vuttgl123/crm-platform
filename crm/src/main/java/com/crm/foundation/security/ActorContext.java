package com.crm.foundation.security;

import java.util.Objects;
import java.util.Optional;

import com.crm.sharedkernel.domain.ActorId;

public final class ActorContext {

	private static final ThreadLocal<ActorId> CURRENT_ACTOR = new ThreadLocal<>();

	private ActorContext() {
	}

	public static Optional<ActorId> currentActorId() {
		return Optional.ofNullable(CURRENT_ACTOR.get());
	}

	public static Scope open(ActorId actorId) {
		ActorId previousActorId = CURRENT_ACTOR.get();
		CURRENT_ACTOR.set(Objects.requireNonNull(actorId,
				"actorId must not be null"));
		return new Scope(previousActorId);
	}

	public static final class Scope implements AutoCloseable {

		private final ActorId previousActorId;
		private boolean closed;

		private Scope(ActorId previousActorId) {
			this.previousActorId = previousActorId;
		}

		@Override
		public void close() {
			if (closed) {
				return;
			}
			closed = true;
			if (previousActorId == null) {
				CURRENT_ACTOR.remove();
			}
			else {
				CURRENT_ACTOR.set(previousActorId);
			}
		}
	}

}
