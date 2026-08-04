package com.crm.foundation.config;

import com.crm.foundation.logging.RequestTracingFilter;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.context.SecurityContextHolderFilter;
import org.springframework.web.servlet.HandlerExceptionResolver;

@Configuration
public class SecurityConfig {

	@Bean
	SecurityFilterChain securityFilterChain(HttpSecurity http,
			@Qualifier("handlerExceptionResolver")
			HandlerExceptionResolver exceptionResolver) throws Exception {
		return http
				.authorizeHttpRequests(authorize -> authorize
						.anyRequest().authenticated())
				.httpBasic(Customizer.withDefaults())
				.exceptionHandling(exceptions -> exceptions
						.authenticationEntryPoint((request, response, exception) ->
								exceptionResolver.resolveException(request, response,
										null, exception))
						.accessDeniedHandler((request, response, exception) ->
								exceptionResolver.resolveException(request, response,
										null, exception)))
				.addFilterAfter(new RequestTracingFilter(), SecurityContextHolderFilter.class)
				.build();
	}

}
