package com.crm.identity.infrastructure.web;

import java.util.Arrays;
import java.util.Optional;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import com.crm.identity.infrastructure.config.CrmSecurityProperties;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;

@Component
public final class RefreshTokenCookie {

	private static final String COOKIE_PATH = "/api/auth";

	private final CrmSecurityProperties properties;

	public RefreshTokenCookie(CrmSecurityProperties properties) {
		this.properties = properties;
	}

	public Optional<String> read(HttpServletRequest request) {
		Cookie[] cookies = request.getCookies();
		if (cookies == null) {
			return Optional.empty();
		}
		return Arrays.stream(cookies)
				.filter(cookie -> properties.refreshCookie().name()
						.equals(cookie.getName()))
				.map(Cookie::getValue)
				.findFirst();
	}

	public void write(HttpServletResponse response, String refreshToken) {
		ResponseCookie cookie = baseCookie(refreshToken)
				.maxAge(properties.refreshTokenTtl())
				.build();
		response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
	}

	public void clear(HttpServletResponse response) {
		ResponseCookie cookie = baseCookie("")
				.maxAge(0)
				.build();
		response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
	}

	private ResponseCookie.ResponseCookieBuilder baseCookie(String value) {
		return ResponseCookie.from(properties.refreshCookie().name(), value)
				.httpOnly(true)
				.secure(properties.refreshCookie().secure())
				.sameSite(properties.refreshCookie().sameSite())
				.path(COOKIE_PATH);
	}

}
