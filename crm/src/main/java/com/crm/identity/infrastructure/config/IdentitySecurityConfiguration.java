package com.crm.identity.infrastructure.config;

import java.util.List;

import com.crm.foundation.logging.RequestTracingFilter;
import com.crm.identity.application.AuthenticationPolicy;
import com.crm.foundation.identifier.IdentifierGenerator;
import com.crm.foundation.time.TimeProvider;
import com.crm.identity.application.port.IdentityRepository;
import com.crm.identity.application.port.PasswordHasher;
import com.crm.identity.application.port.PasswordResetMailer;
import com.crm.identity.application.port.PasswordResetTokenRepository;
import com.crm.identity.application.service.AuthenticationAuditRecorder;
import com.crm.identity.application.service.PasswordResetApplicationService;
import com.crm.identity.infrastructure.security.AuthCookieOriginFilter;
import com.crm.identity.infrastructure.security.CurrentIdentityContextFilter;
import com.crm.identity.presentation.web.OAuth2LoginFailureHandler;
import com.crm.identity.presentation.web.OAuth2LoginSuccessHandler;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.factory.PasswordEncoderFactories;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.server.resource.web.authentication.BearerTokenAuthenticationFilter;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.security.web.access.intercept.AuthorizationFilter;
import org.springframework.security.web.context.NullSecurityContextRepository;
import org.springframework.security.web.savedrequest.NullRequestCache;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.CorsUtils;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.servlet.HandlerExceptionResolver;

@Configuration
@EnableMethodSecurity
@EnableAsync
public class IdentitySecurityConfiguration {

	@Bean
	SecurityFilterChain securityFilterChain(HttpSecurity http,
			@Qualifier("handlerExceptionResolver")
			HandlerExceptionResolver exceptionResolver,
			IdentityRepository identityRepository,
			CrmSecurityProperties securityProperties,
			OAuth2LoginSuccessHandler oauth2SuccessHandler,
			OAuth2LoginFailureHandler oauth2FailureHandler) throws Exception {
		AuthenticationEntryPoint authenticationEntryPoint =
				(request, response, exception) -> exceptionResolver
						.resolveException(request, response, null, exception);
		AccessDeniedHandler accessDeniedHandler =
				(request, response, exception) -> exceptionResolver
						.resolveException(request, response, null, exception);
		CurrentIdentityContextFilter identityContextFilter =
				new CurrentIdentityContextFilter(
						identityRepository, exceptionResolver);
		AuthCookieOriginFilter authCookieOriginFilter =
				new AuthCookieOriginFilter(
						securityProperties, exceptionResolver);

		return http
				.cors(Customizer.withDefaults())
				.csrf(AbstractHttpConfigurer::disable)
				.authorizeHttpRequests(authorize -> authorize
						.requestMatchers(CorsUtils::isPreFlightRequest)
						.permitAll()
						// Listed one by one on purpose. A wildcard such as
						// /api/auth/password/** would also expose
						// /password/change, which must stay authenticated.
						.requestMatchers(HttpMethod.POST,
								"/api/auth/register", "/api/auth/login",
								"/api/auth/refresh", "/api/auth/logout",
								"/api/auth/password/forgot",
								"/api/auth/password/reset")
						.permitAll()
						.requestMatchers("/oauth2/**", "/login/oauth2/**",
								"/actuator/health")
						.permitAll()
						.anyRequest().authenticated())
				.httpBasic(AbstractHttpConfigurer::disable)
				.formLogin(AbstractHttpConfigurer::disable)
				.logout(AbstractHttpConfigurer::disable)
				.oauth2Login(oauth2 -> oauth2
						.successHandler(oauth2SuccessHandler)
						.failureHandler(oauth2FailureHandler))
				.oauth2ResourceServer(oauth2 -> oauth2
						.jwt(Customizer.withDefaults())
						.authenticationEntryPoint(authenticationEntryPoint)
						.accessDeniedHandler(accessDeniedHandler))
				.sessionManagement(session -> session
						.sessionCreationPolicy(
								SessionCreationPolicy.IF_REQUIRED))
				.securityContext(context -> context
						.securityContextRepository(
								new NullSecurityContextRepository()))
				.requestCache(cache -> cache
						.requestCache(new NullRequestCache()))
				.exceptionHandling(exceptions -> exceptions
						.authenticationEntryPoint(authenticationEntryPoint)
						.accessDeniedHandler(accessDeniedHandler))
				.addFilterBefore(
						authCookieOriginFilter, AuthorizationFilter.class)
				.addFilterAfter(new RequestTracingFilter(),
						BearerTokenAuthenticationFilter.class)
				.addFilterAfter(identityContextFilter,
						RequestTracingFilter.class)
				.build();
	}

	@Bean
	AuthenticationPolicy authenticationPolicy(
			CrmSecurityProperties properties) {
		return new AuthenticationPolicy(
				properties.accessTokenTtl(),
				properties.refreshTokenTtl(),
				properties.selfRegistrationEnabled(),
				properties.maxFailedAttempts(),
				properties.lockDuration());
	}

	/**
	 * Built by hand because the last four constructor arguments are plain
	 * values from configuration rather than beans.
	 */
	@Bean
	PasswordResetApplicationService passwordResetApplicationService(
			IdentityRepository identityRepository,
			PasswordResetTokenRepository tokenRepository,
			PasswordResetMailer mailer,
			PasswordHasher passwordHasher,
			AuthenticationAuditRecorder auditRecorder,
			IdentifierGenerator identifierGenerator,
			TimeProvider timeProvider,
			CrmSecurityProperties properties) {
		CrmSecurityProperties.PasswordResetLimits limits =
				properties.passwordResetLimits();
		return new PasswordResetApplicationService(
				identityRepository,
				tokenRepository,
				mailer,
				passwordHasher,
				auditRecorder,
				identifierGenerator,
				timeProvider,
				properties.passwordResetTtl(),
				limits.minimumInterval(),
				limits.maxPerHour(),
				limits.resetUrlTemplate());
	}

	@Bean
	PasswordEncoder passwordEncoder() {
		return PasswordEncoderFactories.createDelegatingPasswordEncoder();
	}

	@Bean
	CorsConfigurationSource corsConfigurationSource(
			CrmSecurityProperties properties) {
		CorsConfiguration configuration = new CorsConfiguration();
		configuration.setAllowedOrigins(properties.allowedOrigins());
		configuration.setAllowedMethods(List.of(
				"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
		configuration.setAllowedHeaders(List.of(
				HttpHeaders.AUTHORIZATION,
				HttpHeaders.CONTENT_TYPE,
				HttpHeaders.ACCEPT,
				HttpHeaders.ACCEPT_LANGUAGE,
				HttpHeaders.IF_MATCH,
				CurrentIdentityContextFilter.TENANT_ID_HEADER,
				RequestTracingFilter.REQUEST_ID_HEADER));
		configuration.setExposedHeaders(
				List.of(RequestTracingFilter.REQUEST_ID_HEADER));
		configuration.setAllowCredentials(true);
		configuration.setMaxAge(3600L);
		UrlBasedCorsConfigurationSource source =
				new UrlBasedCorsConfigurationSource();
		source.registerCorsConfiguration("/**", configuration);
		return source;
	}

}
