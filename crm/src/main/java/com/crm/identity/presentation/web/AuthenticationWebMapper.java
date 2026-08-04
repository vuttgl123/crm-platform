package com.crm.identity.presentation.web;

import java.time.Duration;

import com.crm.foundation.mapping.CrmMapperConfig;
import com.crm.identity.application.command.LoginCommand;
import com.crm.identity.application.command.RegisterCommand;
import com.crm.identity.application.dto.CurrentIdentity;
import com.crm.identity.application.dto.IssuedTokens;
import com.crm.identity.domain.UserAccount;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(config = CrmMapperConfig.class)
public interface AuthenticationWebMapper {

	LoginCommand toLoginCommand(LoginRequest request);

	RegisterCommand toRegisterCommand(RegisterRequest request);

	UserResponse toUserResponse(UserAccount user);

	@Mapping(target = "tokenType", constant = "Bearer")
	@Mapping(target = "expiresIn", source = "accessTokenTtl")
	AccessTokenResponse toAccessTokenResponse(IssuedTokens tokens);

	MeResponse toMeResponse(CurrentIdentity identity);

	default long toSeconds(Duration duration) {
		return duration.toSeconds();
	}

}
