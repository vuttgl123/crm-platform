package com.crm.identity.infrastructure.security;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.interfaces.RSAPrivateKey;
import java.security.interfaces.RSAPublicKey;
import java.util.Base64;

import com.crm.identity.infrastructure.config.CrmSecurityProperties;
import com.nimbusds.jose.jwk.JWKSet;
import com.nimbusds.jose.jwk.RSAKey;
import com.nimbusds.jose.jwk.source.ImmutableJWKSet;
import com.nimbusds.jose.jwk.source.JWKSource;
import com.nimbusds.jose.proc.SecurityContext;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.oauth2.core.DelegatingOAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidatorResult;
import org.springframework.security.oauth2.jose.jws.SignatureAlgorithm;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtValidators;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;

@Configuration
@EnableConfigurationProperties(CrmSecurityProperties.class)
public class JwtSecurityConfiguration {

	@Bean
	RSAPrivateKey jwtPrivateKey(CrmSecurityProperties properties) {
		return PemKeyLoader.loadPrivateKey(properties.jwt().privateKeyLocation());
	}

	@Bean
	RSAPublicKey jwtPublicKey(CrmSecurityProperties properties) {
		return PemKeyLoader.loadPublicKey(properties.jwt().publicKeyLocation());
	}

	@Bean
	JwtEncoder jwtEncoder(RSAPublicKey publicKey, RSAPrivateKey privateKey) {
		RSAKey rsaKey = new RSAKey.Builder(publicKey)
				.privateKey(privateKey)
				.keyID(keyId(publicKey))
				.build();
		JWKSource<SecurityContext> source =
				new ImmutableJWKSet<>(new JWKSet(rsaKey));
		return new NimbusJwtEncoder(source);
	}

	@Bean
	JwtDecoder jwtDecoder(RSAPublicKey publicKey,
			CrmSecurityProperties properties) {
		NimbusJwtDecoder decoder = NimbusJwtDecoder.withPublicKey(publicKey)
				.signatureAlgorithm(SignatureAlgorithm.RS256)
				.build();
		OAuth2TokenValidator<Jwt> issuer =
				JwtValidators.createDefaultWithIssuer(properties.issuer());
		OAuth2TokenValidator<Jwt> audience = token -> token.getAudience()
				.contains(properties.audience())
				? OAuth2TokenValidatorResult.success()
				: failure("JWT audience is invalid");
		OAuth2TokenValidator<Jwt> tokenType = token -> "access".equals(
				token.getClaimAsString("token_type"))
				? OAuth2TokenValidatorResult.success()
				: failure("JWT token type is invalid");
		decoder.setJwtValidator(new DelegatingOAuth2TokenValidator<>(
				issuer, audience, tokenType));
		return decoder;
	}

	private static OAuth2TokenValidatorResult failure(String description) {
		return OAuth2TokenValidatorResult.failure(
				new OAuth2Error("invalid_token", description, null));
	}

	private static String keyId(RSAPublicKey publicKey) {
		try {
			byte[] digest = MessageDigest.getInstance("SHA-256")
					.digest(publicKey.getEncoded());
			return Base64.getUrlEncoder().withoutPadding()
					.encodeToString(digest)
					.substring(0, 16);
		}
		catch (NoSuchAlgorithmException exception) {
			throw new IllegalStateException("SHA-256 is not available", exception);
		}
	}

}
