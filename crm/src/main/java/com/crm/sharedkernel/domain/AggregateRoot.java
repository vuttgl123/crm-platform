package com.crm.sharedkernel.domain;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

public abstract class AggregateRoot {

	private final List<DomainEvent> domainEvents = new ArrayList<>();

	protected final <T extends DomainEvent> T registerEvent(T domainEvent) {
		domainEvents.add(Objects.requireNonNull(domainEvent,
				"domainEvent must not be null"));
		return domainEvent;
	}

	public final List<DomainEvent> releaseDomainEvents() {
		List<DomainEvent> releasedEvents = List.copyOf(domainEvents);
		domainEvents.clear();
		return releasedEvents;
	}

}
