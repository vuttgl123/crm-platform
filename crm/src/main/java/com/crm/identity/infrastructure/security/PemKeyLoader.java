package com.crm.identity.infrastructure.security;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.KeyFactory;
import java.security.NoSuchAlgorithmException;
import java.security.interfaces.RSAPrivateKey;
import java.security.interfaces.RSAPublicKey;
import java.security.spec.InvalidKeySpecException;
import java.security.spec.PKCS8EncodedKeySpec;
import java.security.spec.X509EncodedKeySpec;
import java.util.Base64;

import org.springframework.core.io.Resource;

final class PemKeyLoader {

	private PemKeyLoader() {
	}

	static RSAPrivateKey loadPrivateKey(Resource resource) {
		byte[] encoded = decode(resource, "PRIVATE KEY");
		try {
			return (RSAPrivateKey) KeyFactory.getInstance("RSA")
					.generatePrivate(new PKCS8EncodedKeySpec(encoded));
		}
		catch (NoSuchAlgorithmException | InvalidKeySpecException exception) {
			throw new IllegalStateException("Invalid PKCS#8 RSA private key", exception);
		}
	}

	static RSAPublicKey loadPublicKey(Resource resource) {
		byte[] encoded = decode(resource, "PUBLIC KEY");
		try {
			return (RSAPublicKey) KeyFactory.getInstance("RSA")
					.generatePublic(new X509EncodedKeySpec(encoded));
		}
		catch (NoSuchAlgorithmException | InvalidKeySpecException exception) {
			throw new IllegalStateException("Invalid X.509 RSA public key", exception);
		}
	}

	private static byte[] decode(Resource resource, String label) {
		if (resource == null) {
			throw new IllegalStateException(label + " resource is required");
		}
		try (var inputStream = resource.getInputStream()) {
			String pem = new String(inputStream.readAllBytes(),
					StandardCharsets.US_ASCII);
			String content = pem
					.replace("-----BEGIN " + label + "-----", "")
					.replace("-----END " + label + "-----", "")
					.replaceAll("\\s", "");
			return Base64.getDecoder().decode(content);
		}
		catch (IOException | IllegalArgumentException exception) {
			throw new IllegalStateException("Unable to read " + label + " resource",
					exception);
		}
	}

}
