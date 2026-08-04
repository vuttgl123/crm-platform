package com.crm.identity.infrastructure.security;

import java.util.Iterator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.security.oauth2.client.registration.ClientRegistration;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;

final class ConfiguredClientRegistrationRepository
		implements ClientRegistrationRepository, Iterable<ClientRegistration> {

	private final List<ClientRegistration> registrations;
	private final Map<String, ClientRegistration> registrationsById;

	ConfiguredClientRegistrationRepository(
			List<ClientRegistration> registrations) {
		this.registrations = List.copyOf(registrations);
		Map<String, ClientRegistration> indexed = new LinkedHashMap<>();
		for (ClientRegistration registration : registrations) {
			indexed.put(registration.getRegistrationId(), registration);
		}
		this.registrationsById = Map.copyOf(indexed);
	}

	@Override
	public ClientRegistration findByRegistrationId(String registrationId) {
		return registrationsById.get(registrationId);
	}

	@Override
	public Iterator<ClientRegistration> iterator() {
		return registrations.iterator();
	}

}
