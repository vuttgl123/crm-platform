package com.crm.identity.application.port;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import com.crm.identity.domain.AuthEvent;
import com.crm.identity.domain.ExternalProvider;
import com.crm.identity.domain.TenantMembershipSummary;
import com.crm.identity.domain.UserAccount;

public interface IdentityRepository {

	Optional<UserAccount> findLocalByEmailForUpdate(String normalizedEmail);

	Optional<UserAccount> findById(UUID userId);

	Optional<UserAccount> findByEmail(String normalizedEmail);

	Optional<UserAccount> findByExternalIdentity(String issuer, String subject);

	void createUser(UUID userId, String email, String displayName,
			Instant emailVerifiedAt, Instant now);

	void createCredential(UUID userId, String passwordHash, Instant now);

	void createExternalIdentity(UUID identityId, UUID userId,
			ExternalProvider provider, String issuer, String subject,
			String providerEmail, boolean emailVerified, Instant now);

	void recordFailedLogin(UUID userId, int failedAttempts, Instant lockedUntil);

	void recordSuccessfulLogin(UUID userId, Instant now);

	void recordExternalLogin(UUID userId, String issuer, String subject,
			String displayName, Instant now);

	List<TenantMembershipSummary> findActiveTenantMemberships(UUID userId);

	boolean hasActiveTenantMembership(UUID userId, UUID tenantId);

	/**
	 * Sets a new password hash and clears the lock state in one statement.
	 * Clearing the lock is what makes password reset the self-service unlock
	 * path: it reuses exactly the two columns recordSuccessfulLogin clears.
	 */
	void updatePasswordAndClearLock(UUID userId, String passwordHash,
			Instant now);

	void revokeAllSessions(UUID userId, Instant now, String reason);

	void appendAuthEvent(AuthEvent event);

}
