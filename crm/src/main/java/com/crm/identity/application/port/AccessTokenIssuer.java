package com.crm.identity.application.port;

import java.time.Instant;
import java.util.UUID;

import com.crm.identity.domain.UserAccount;

public interface AccessTokenIssuer {

	String issue(UserAccount user, UUID sessionId, Instant issuedAt);

}
