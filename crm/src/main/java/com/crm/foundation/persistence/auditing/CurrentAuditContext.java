package com.crm.foundation.persistence.auditing;

import com.crm.foundation.security.CurrentActor;
import com.crm.foundation.time.TimeProvider;
import org.springframework.stereotype.Component;

@Component
public final class CurrentAuditContext implements AuditContext {

	private final TimeProvider timeProvider;
	private final CurrentActor currentActor;

	public CurrentAuditContext(TimeProvider timeProvider, CurrentActor currentActor) {
		this.timeProvider = timeProvider;
		this.currentActor = currentActor;
	}

	@Override
	public AuditStamp capture() {
		return new AuditStamp(timeProvider.now(), currentActor.actorId());
	}

}
