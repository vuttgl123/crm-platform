package com.crm.platform.access.presentation.web;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import com.crm.platform.access.application.dto.EffectiveAccessDetails;
import org.springframework.stereotype.Component;

@Component
public final class EffectiveAccessWebMapper {

	public EffectiveAccessResponse toResponse(EffectiveAccessDetails details) {
		EffectiveAccessResponse.Tenant tenant =
				new EffectiveAccessResponse.Tenant(
						details.tenant().id(),
						details.tenant().tenantCode(),
						details.tenant().displayName());
		EffectiveAccessResponse.Membership membership =
				new EffectiveAccessResponse.Membership(
						details.membership().status(),
						details.membership().tenantAdmin());
		Map<String, List<EffectiveAccessResponse.Scope>> entities =
				new LinkedHashMap<>();
		details.dataAccess().entities().forEach((entityType, scopes) ->
				entities.put(entityType, scopes.stream()
						.map(scope -> new EffectiveAccessResponse.Scope(
								scope.type(), scope.teamId()))
						.toList()));
		EffectiveAccessResponse.DataAccess dataAccess =
				new EffectiveAccessResponse.DataAccess(
						details.dataAccess().defaultScope(),
						entities);
		return new EffectiveAccessResponse(
				tenant,
				membership,
				details.permissions(),
				dataAccess);
	}

}
