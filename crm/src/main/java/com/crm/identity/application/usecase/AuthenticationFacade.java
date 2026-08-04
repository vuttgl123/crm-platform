package com.crm.identity.application.usecase;

import java.util.UUID;

import com.crm.identity.application.command.AuthenticationRequestMetadata;
import com.crm.identity.application.command.ExternalLoginCommand;
import com.crm.identity.application.command.LoginCommand;
import com.crm.identity.application.command.RegisterCommand;
import com.crm.identity.application.dto.CurrentIdentity;
import com.crm.identity.application.dto.IssuedTokens;

public interface AuthenticationFacade {

	IssuedTokens register(RegisterCommand command,
			AuthenticationRequestMetadata metadata);

	IssuedTokens login(LoginCommand command,
			AuthenticationRequestMetadata metadata);

	IssuedTokens loginExternal(ExternalLoginCommand command,
			AuthenticationRequestMetadata metadata);

	IssuedTokens refresh(String rawRefreshToken,
			AuthenticationRequestMetadata metadata);

	void logout(String rawRefreshToken,
			AuthenticationRequestMetadata metadata);

	CurrentIdentity currentIdentity(UUID userId);

}
