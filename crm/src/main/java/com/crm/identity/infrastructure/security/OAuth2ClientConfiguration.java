package com.crm.identity.infrastructure.security;

import java.util.ArrayList;
import java.util.List;

import com.crm.identity.infrastructure.config.CrmSecurityProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.oauth2.client.CommonOAuth2Provider;
import org.springframework.security.oauth2.client.registration.ClientRegistration;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.core.AuthorizationGrantType;
import org.springframework.security.oauth2.core.ClientAuthenticationMethod;
import org.springframework.security.oauth2.core.oidc.IdTokenClaimNames;

@Configuration
public class OAuth2ClientConfiguration {

	@Bean
	ClientRegistrationRepository clientRegistrationRepository(
			CrmSecurityProperties properties) {
		List<ClientRegistration> registrations = new ArrayList<>();
		if (properties.oauth2().google().configured()) {
			registrations.add(google(properties.oauth2().google()));
		}
		if (properties.oauth2().microsoft().configured()) {
			registrations.add(microsoft(properties.oauth2().microsoft()));
		}
		return new ConfiguredClientRegistrationRepository(registrations);
	}

	private static ClientRegistration google(
			CrmSecurityProperties.Provider provider) {
		return CommonOAuth2Provider.GOOGLE.getBuilder("google")
				.clientId(provider.clientId())
				.clientSecret(provider.clientSecret())
				.scope("openid", "profile", "email")
				.build();
	}

	private static ClientRegistration microsoft(
			CrmSecurityProperties.MicrosoftProvider provider) {
		String tenant = provider.tenant() == null || provider.tenant().isBlank()
				? "common"
				: provider.tenant().trim();
		String baseUrl = "https://login.microsoftonline.com/" + tenant;
		return ClientRegistration.withRegistrationId("microsoft")
				.clientId(provider.clientId())
				.clientSecret(provider.clientSecret())
				.clientAuthenticationMethod(
						ClientAuthenticationMethod.CLIENT_SECRET_POST)
				.authorizationGrantType(AuthorizationGrantType.AUTHORIZATION_CODE)
				.redirectUri("{baseUrl}/login/oauth2/code/{registrationId}")
				.scope("openid", "profile", "email")
				.authorizationUri(baseUrl + "/oauth2/v2.0/authorize")
				.tokenUri(baseUrl + "/oauth2/v2.0/token")
				.jwkSetUri(baseUrl + "/discovery/v2.0/keys")
				.userInfoUri("https://graph.microsoft.com/oidc/userinfo")
				.userNameAttributeName(IdTokenClaimNames.SUB)
				.clientName("Microsoft")
				.build();
	}

}
