package com.crm.config;

import com.crm.logging.RequestTracingFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.context.SecurityContextHolderFilter;

@Configuration
public class SecurityConfig {

	@Bean
	SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
		return http
				.authorizeHttpRequests(authorize -> authorize
						.requestMatchers("/api/health/database").permitAll()
						.anyRequest().authenticated())
				.httpBasic(Customizer.withDefaults())
				.addFilterAfter(new RequestTracingFilter(), SecurityContextHolderFilter.class)
				.build();
	}

}
