package com.crm.foundation.time;

import java.time.Clock;
import java.time.Instant;

import org.springframework.stereotype.Component;

@Component
public final class SystemTimeProvider implements TimeProvider {

	private final Clock clock;

	public SystemTimeProvider() {
		this(Clock.systemUTC());
	}

	SystemTimeProvider(Clock clock) {
		this.clock = clock;
	}

	@Override
	public Instant now() {
		return clock.instant();
	}

}
