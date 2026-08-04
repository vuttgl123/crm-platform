package com.crm.identity.presentation.web;

import com.crm.identity.application.command.LoginCommand;
import com.crm.identity.application.command.RegisterCommand;
import com.crm.identity.application.dto.CurrentIdentity;
import com.crm.identity.application.dto.IssuedTokens;
import com.crm.identity.domain.TenantMembershipSummary;
import com.crm.identity.domain.UserAccount;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-08-04T14:28:26+0700",
    comments = "version: 1.6.3, compiler: javac, environment: Java 26.0.1 (Oracle Corporation)"
)
@Component
public class AuthenticationWebMapperImpl implements AuthenticationWebMapper {

    @Override
    public LoginCommand toLoginCommand(LoginRequest request) {
        if ( request == null ) {
            return null;
        }

        String email = null;
        String password = null;

        email = request.email();
        password = request.password();

        LoginCommand loginCommand = new LoginCommand( email, password );

        return loginCommand;
    }

    @Override
    public RegisterCommand toRegisterCommand(RegisterRequest request) {
        if ( request == null ) {
            return null;
        }

        String email = null;
        String password = null;
        String displayName = null;

        email = request.email();
        password = request.password();
        displayName = request.displayName();

        RegisterCommand registerCommand = new RegisterCommand( email, password, displayName );

        return registerCommand;
    }

    @Override
    public UserResponse toUserResponse(UserAccount user) {
        if ( user == null ) {
            return null;
        }

        UUID id = null;
        String email = null;
        String displayName = null;

        id = user.id();
        email = user.email();
        displayName = user.displayName();

        UserResponse userResponse = new UserResponse( id, email, displayName );

        return userResponse;
    }

    @Override
    public AccessTokenResponse toAccessTokenResponse(IssuedTokens tokens) {
        if ( tokens == null ) {
            return null;
        }

        long expiresIn = 0L;
        String accessToken = null;
        UserResponse user = null;

        expiresIn = toSeconds( tokens.accessTokenTtl() );
        accessToken = tokens.accessToken();
        user = toUserResponse( tokens.user() );

        String tokenType = "Bearer";

        AccessTokenResponse accessTokenResponse = new AccessTokenResponse( accessToken, tokenType, expiresIn, user );

        return accessTokenResponse;
    }

    @Override
    public MeResponse toMeResponse(CurrentIdentity identity) {
        if ( identity == null ) {
            return null;
        }

        UserResponse user = null;
        List<TenantMembershipSummary> tenants = null;

        user = toUserResponse( identity.user() );
        List<TenantMembershipSummary> list = identity.tenants();
        if ( list != null ) {
            tenants = new ArrayList<TenantMembershipSummary>( list );
        }

        MeResponse meResponse = new MeResponse( user, tenants );

        return meResponse;
    }
}
