package com.crm.foundation.event;

import java.util.Collection;

import com.crm.sharedkernel.domain.DomainEvent;

public interface DomainEventPublisher {

	void publishAll(Collection<? extends DomainEvent> domainEvents);

}
