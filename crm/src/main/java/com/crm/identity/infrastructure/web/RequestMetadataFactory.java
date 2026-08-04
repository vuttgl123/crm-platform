package com.crm.identity.infrastructure.web;

import jakarta.servlet.http.HttpServletRequest;
import com.crm.identity.application.AuthenticationRequestMetadata;

final class RequestMetadataFactory {

	private RequestMetadataFactory() {
	}

	static AuthenticationRequestMetadata from(HttpServletRequest request) {
		return new AuthenticationRequestMetadata(request.getRemoteAddr(),
				request.getHeader("User-Agent"));
	}

}
