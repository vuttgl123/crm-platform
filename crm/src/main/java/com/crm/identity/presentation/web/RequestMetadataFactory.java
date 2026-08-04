package com.crm.identity.presentation.web;

import jakarta.servlet.http.HttpServletRequest;
import com.crm.identity.application.command.AuthenticationRequestMetadata;

final class RequestMetadataFactory {

	private RequestMetadataFactory() {
	}

	static AuthenticationRequestMetadata from(HttpServletRequest request) {
		return new AuthenticationRequestMetadata(request.getRemoteAddr(),
				request.getHeader("User-Agent"));
	}

}
