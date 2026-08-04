package com.crm.identity.infrastructure.security;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import com.crm.identity.application.port.AccessTokenIssuer;
import com.crm.identity.domain.UserAccount;
import com.crm.identity.infrastructure.config.CrmSecurityProperties;
import org.springframework.security.oauth2.jose.jws.SignatureAlgorithm;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.stereotype.Component;

@Component
public final class JwtAccessTokenIssuer implements AccessTokenIssuer {

	private final JwtEncoder jwtEncoder;
	private final CrmSecurityProperties properties;

	public JwtAccessTokenIssuer(JwtEncoder jwtEncoder,
			CrmSecurityProperties properties) {
		this.jwtEncoder = jwtEncoder;
		this.properties = properties;
	}

	@Override
	public String issue(UserAccount user, UUID sessionId, Instant issuedAt) {
		Instant expiresAt = issuedAt.plus(properties.accessTokenTtl());
		JwsHeader header = JwsHeader.with(SignatureAlgorithm.RS256)
				.type("JWT")
				.build();
		JwtClaimsSet claims = JwtClaimsSet.builder()
				.issuer(properties.issuer())
				.subject(user.id().toString())
				.audience(List.of(properties.audience()))
				.issuedAt(issuedAt)
				.expiresAt(expiresAt)
				.id(UUID.randomUUID().toString())
				.claim("token_type", "access")
				.claim("sid", sessionId.toString())
				.claim("email", user.email())
				.build();
		return jwtEncoder.encode(JwtEncoderParameters.from(header, claims))
				.getTokenValue();
	}

}
