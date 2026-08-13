# Account Communication Channel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add tenant-scoped create, list, replace, and soft-delete APIs for Account communication channels with backend normalization, duplicate prevention, atomic primary switching, and optimistic concurrency.

**Architecture:** Implement a sibling vertical slice at `com.crm.customer.accountcommunicationchannel`. Mutations acquire an authorization-aware lock on the owning Account before checking duplicates or changing primary state; the slice uses the existing Account permissions, `ACCOUNT` data scopes, JDBC schema, error infrastructure, and audit/time providers.

**Tech Stack:** Java 21 release target, Spring Boot 4, Spring MVC, Spring Security, Spring JDBC `JdbcClient`, Jakarta Bean Validation, MySQL 8, RFC 9457 `ProblemDetail`.

## Global Constraints

- Do not inspect or modify `crm-fe`.
- Do not change `docs/crm_mysql80.sql` or introduce a database migration.
- Do not change the current key or application configuration.
- Do not add Contact communication-channel behavior or a generic owner abstraction.
- Do not expose writable `normalizedValue`, `isVerified`, `verifiedAt`, or `metadata` fields.
- Use `SystemPermission.CRM_ACCOUNT_READ` for list and `CRM_ACCOUNT_WRITE` for create, replace, and delete.
- Every query must constrain tenant, Account, active state, `account_id`, `contact_id IS NULL`, and Account scope as applicable.
- Create, replace, and delete use `Isolation.READ_COMMITTED` and lock the authorized Account before inspecting channel state.
- Update and delete require one strong quoted positive signed-long `If-Match` value.
- Keep `docs/api-reference.md` synchronized with the implemented API in this implementation task.
- Do not run or add unit, integration, database, API, smoke, browser, or manual runtime tests. Do not run a build or start the application unless the user explicitly overrides the repository rule.
- Do not stage or commit changes. All plan steps leave changes uncommitted for user review.
- Use static inspection commands only for verification.

---

## File Structure

### Shared web validation

- Create `crm/src/main/java/com/crm/foundation/web/http/IfMatchVersion.java`: validate and parse the strong quoted version header.
- Create `crm/src/main/java/com/crm/foundation/web/validation/ValidIfMatchVersion.java`: reusable Jakarta validation annotation.
- Create `crm/src/main/java/com/crm/foundation/web/validation/IfMatchVersionValidator.java`: annotation validator delegating to `IfMatchVersion`.
- Modify `crm/src/main/java/com/crm/customer/account/presentation/web/AccountController.java`: replace its nested validator with the shared types without changing the Account API.

### Account Communication Channel domain

- Create `crm/src/main/java/com/crm/customer/accountcommunicationchannel/domain/AccountCommunicationChannelId.java`: UUID value object.
- Create `crm/src/main/java/com/crm/customer/accountcommunicationchannel/domain/ChannelType.java`: database-backed channel-type enum.
- Create `crm/src/main/java/com/crm/customer/accountcommunicationchannel/domain/ChannelValue.java`: trimming, normalization, E.164/email validation, and canonical identity.
- Create `crm/src/main/java/com/crm/customer/accountcommunicationchannel/domain/AccountCommunicationChannelErrorCode.java`: stable channel error codes.
- Create `crm/src/main/java/com/crm/customer/accountcommunicationchannel/domain/AccountCommunicationChannel.java`: channel state and mutation invariants.

### Application contract and workflow

- Create `crm/src/main/java/com/crm/customer/accountcommunicationchannel/application/command/CreateAccountCommunicationChannelCommand.java`.
- Create `crm/src/main/java/com/crm/customer/accountcommunicationchannel/application/command/UpdateAccountCommunicationChannelCommand.java`.
- Create `crm/src/main/java/com/crm/customer/accountcommunicationchannel/application/command/DeleteAccountCommunicationChannelCommand.java`.
- Create `crm/src/main/java/com/crm/customer/accountcommunicationchannel/application/dto/AccountCommunicationChannelDetails.java`.
- Create `crm/src/main/java/com/crm/customer/accountcommunicationchannel/application/port/AccountCommunicationChannelRepository.java`.
- Create `crm/src/main/java/com/crm/customer/accountcommunicationchannel/application/usecase/AccountCommunicationChannelFacade.java`.
- Create `crm/src/main/java/com/crm/customer/accountcommunicationchannel/application/service/AccountCommunicationChannelApplicationService.java`.

### Persistence adapter

- Create `crm/src/main/java/com/crm/customer/accountcommunicationchannel/infrastructure/persistence/AccountCommunicationChannelJdbcMapper.java`: map JDBC rows and timestamp/actor values.
- Create `crm/src/main/java/com/crm/customer/accountcommunicationchannel/infrastructure/persistence/JdbcAccountCommunicationChannelRepository.java`: Account locking, scoped reads, duplicate/primary lookup, insert, versioned update, and soft delete.

### Web adapter and public documentation

- Create `crm/src/main/java/com/crm/customer/accountcommunicationchannel/presentation/web/CreateAccountCommunicationChannelRequest.java`.
- Create `crm/src/main/java/com/crm/customer/accountcommunicationchannel/presentation/web/UpdateAccountCommunicationChannelRequest.java`.
- Create `crm/src/main/java/com/crm/customer/accountcommunicationchannel/presentation/web/AccountCommunicationChannelResponse.java`.
- Create `crm/src/main/java/com/crm/customer/accountcommunicationchannel/presentation/web/AccountCommunicationChannelWebMapper.java`.
- Create `crm/src/main/java/com/crm/customer/accountcommunicationchannel/presentation/web/AccountCommunicationChannelController.java`.
- Modify `crm/src/main/resources/messages.properties`, `messages_en.properties`, and `messages_vi.properties`: localized channel errors.
- Modify `docs/api-reference.md`: complete implemented API contract and fictitious examples.
- Modify `docs/technical-roadmap.md`: mark Account Communication Channel delivered and retain later work.

---

### Task 1: Extract reusable `If-Match` validation

**Files:**

- Create: `crm/src/main/java/com/crm/foundation/web/http/IfMatchVersion.java`
- Create: `crm/src/main/java/com/crm/foundation/web/validation/ValidIfMatchVersion.java`
- Create: `crm/src/main/java/com/crm/foundation/web/validation/IfMatchVersionValidator.java`
- Modify: `crm/src/main/java/com/crm/customer/account/presentation/web/AccountController.java`

**Interfaces:**

- Consumes: existing Account `If-Match` syntax, for example `"2"`.
- Produces: `IfMatchVersion.isValid(String): boolean`, `IfMatchVersion.parse(String): long`, and reusable `@ValidIfMatchVersion`.

- [ ] **Step 1: Add the shared parser**

Create a non-instantiable utility whose validation also rejects signed-long overflow:

```java
package com.crm.foundation.web.http;

import java.util.regex.Pattern;

public final class IfMatchVersion {

	private static final Pattern STRONG_VERSION =
			Pattern.compile("^\\\"[1-9][0-9]*\\\"$");

	private IfMatchVersion() {
	}

	public static boolean isValid(String value) {
		if (value == null || !STRONG_VERSION.matcher(value).matches()) {
			return false;
		}
		try {
			Long.parseLong(value.substring(1, value.length() - 1));
			return true;
		}
		catch (NumberFormatException exception) {
			return false;
		}
	}

	public static long parse(String value) {
		if (!isValid(value)) {
			throw new IllegalArgumentException(
					"If-Match must be a strong quoted positive long");
		}
		return Long.parseLong(value.substring(1, value.length() - 1));
	}

}
```

- [ ] **Step 2: Add the reusable constraint annotation and validator**

Use `ElementType.PARAMETER` and `ElementType.FIELD`, runtime retention, and the
existing `{validation.invalid}` message:

```java
@Target({ ElementType.PARAMETER, ElementType.FIELD })
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = IfMatchVersionValidator.class)
public @interface ValidIfMatchVersion {
	String message() default "{validation.invalid}";
	Class<?>[] groups() default {};
	Class<? extends Payload>[] payload() default {};
}
```

The validator contains only:

```java
@Override
public boolean isValid(String value, ConstraintValidatorContext context) {
	return IfMatchVersion.isValid(value);
}
```

- [ ] **Step 3: Replace the nested Account validator**

Remove `ValidIfMatchVersion`, `IfMatchVersionValidator`, and their Jakarta
constraint imports from `AccountController`. Import the shared annotation and
parser, keep the same `If-Match` header, and replace the substring parsing with:

```java
accounts.delete(new DeleteAccountCommand(
		new AccountId(id), IfMatchVersion.parse(ifMatch)));
```

- [ ] **Step 4: Statically verify the extraction**

Run:

```bash
rg -n "ValidIfMatchVersion|IfMatchVersion\.parse|class IfMatchVersionValidator" \
  crm/src/main/java/com/crm/foundation \
  crm/src/main/java/com/crm/customer/account/presentation/web/AccountController.java
```

Expected: one shared annotation, one shared validator, one parser utility, and
no nested constraint declaration in `AccountController`.

### Task 2: Implement the channel domain model

**Files:**

- Create: `crm/src/main/java/com/crm/customer/accountcommunicationchannel/domain/AccountCommunicationChannelId.java`
- Create: `crm/src/main/java/com/crm/customer/accountcommunicationchannel/domain/ChannelType.java`
- Create: `crm/src/main/java/com/crm/customer/accountcommunicationchannel/domain/ChannelValue.java`
- Create: `crm/src/main/java/com/crm/customer/accountcommunicationchannel/domain/AccountCommunicationChannelErrorCode.java`
- Create: `crm/src/main/java/com/crm/customer/accountcommunicationchannel/domain/AccountCommunicationChannel.java`

**Interfaces:**

- Consumes: `TenantId`, `ActorId`, `AccountId`, `Instant`.
- Produces: normalized immutable `ChannelValue`; mutable channel aggregate methods `create`, `rehydrate`, `replace`, `demote`, and `softDelete`.

- [ ] **Step 1: Add the identifier, type enum, and errors**

`AccountCommunicationChannelId` follows `AccountRelationshipId`: require a
non-null UUID, provide `from(String)`, and return the UUID string from
`toString()`.

Define the enum exactly as stored by MySQL:

```java
public enum ChannelType {
	EMAIL,
	PHONE,
	MOBILE,
	SMS,
	WHATSAPP,
	LINKEDIN,
	OTHER
}
```

Define these error codes and message keys:

```java
ACCOUNT_COMMUNICATION_CHANNEL_NOT_FOUND(
		"ACCOUNT_COMMUNICATION_CHANNEL_NOT_FOUND",
		"account_communication_channel.not_found"),
ACCOUNT_COMMUNICATION_CHANNEL_ALREADY_EXISTS(
		"ACCOUNT_COMMUNICATION_CHANNEL_ALREADY_EXISTS",
		"account_communication_channel.already_exists"),
ACCOUNT_COMMUNICATION_CHANNEL_VERSION_CONFLICT(
		"ACCOUNT_COMMUNICATION_CHANNEL_VERSION_CONFLICT",
		"account_communication_channel.version_conflict");
```

- [ ] **Step 2: Implement `ChannelValue` normalization**

Use exact patterns and `Locale.ROOT`:

```java
private static final int MAX_LENGTH = 255;
private static final Pattern EMAIL = Pattern.compile(
		"^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$");
private static final Pattern E164 = Pattern.compile(
		"^\\+[1-9][0-9]{1,14}$");
```

`ChannelValue.of(ChannelType, String)` must trim first, reject blank or values
longer than 255, then calculate:

```java
String normalized = switch (type) {
	case EMAIL -> requireEmail(raw).toLowerCase(Locale.ROOT);
	case PHONE, MOBILE, SMS, WHATSAPP -> requireE164(raw);
	case LINKEDIN -> raw;
	case OTHER -> null;
};
String canonical = type == ChannelType.OTHER ? raw : normalized;
```

Expose `rawValue()`, `normalizedValue()`, and `canonicalValue()`. Add this
request-validation helper so Bean Validation can defer null/blank handling to
`@NotNull` and `@NotBlank`:

```java
public static boolean isValidWhenPresent(ChannelType type, String value) {
	if (type == null || value == null || value.isBlank()) {
		return true;
	}
	try {
		of(type, value);
		return true;
	}
	catch (IllegalArgumentException exception) {
		return false;
	}
}
```

- [ ] **Step 3: Implement `AccountCommunicationChannel` state and mutations**

Store exactly these fields:

```java
TenantId tenantId;
AccountCommunicationChannelId id;
AccountId accountId;
ChannelType channelType;
ChannelValue value;
String label;
boolean primary;
boolean verified;
Instant verifiedAt;
boolean doNotUse;
Instant createdAt;
ActorId createdBy;
Instant updatedAt;
ActorId updatedBy;
Instant deletedAt;
ActorId deletedBy;
long version;
```

Provide these exact public factories and mutations:

```java
public static AccountCommunicationChannel create(
		TenantId tenantId, AccountCommunicationChannelId id,
		AccountId accountId, ChannelType channelType, String rawValue,
		String label, boolean requestedPrimary, boolean doNotUse,
		ActorId actorId, Instant now)

public static AccountCommunicationChannel rehydrate(
		TenantId tenantId, AccountCommunicationChannelId id,
		AccountId accountId, ChannelType channelType, String rawValue,
		String normalizedValue, String label, boolean primary,
		boolean verified, Instant verifiedAt, boolean doNotUse,
		Instant createdAt, ActorId createdBy, Instant updatedAt,
		ActorId updatedBy, Instant deletedAt, ActorId deletedBy,
		long version)

public void replace(ChannelType channelType, String rawValue, String label,
		boolean requestedPrimary, boolean doNotUse,
		ActorId actorId, Instant now)

public void demote(ActorId actorId, Instant now)

public void softDelete(ActorId actorId, Instant now)
```

Creation sets `verified=false`, `verifiedAt=null`, `version=1`, and both audit
times/actors from the request context. `replace` rebuilds `ChannelValue`,
normalizes the optional label, sets `primary = requestedPrimary && !doNotUse`,
updates audit state, and increments version once. `demote` changes and versions
the entity only when it is currently primary. `softDelete` sets deletion and
update audit state and increments version once. Rehydration rejects
`verifiedAt != null && !verified`, non-positive versions, mismatched stored
normalization, and incomplete deletion audit pairs.

- [ ] **Step 4: Statically inspect domain completeness**

Run:

```bash
rg -n "enum ChannelType|canonicalValue|isValidWhenPresent|void replace|void demote|void softDelete|ACCOUNT_COMMUNICATION_CHANNEL_" \
  crm/src/main/java/com/crm/customer/accountcommunicationchannel/domain
```

Expected: all seven types, three stable errors, canonical normalization, and
the three mutation methods are present; no Spring or JDBC imports appear in the
domain package.

### Task 3: Define application commands, DTO, port, and facade

**Files:**

- Create: `crm/src/main/java/com/crm/customer/accountcommunicationchannel/application/command/CreateAccountCommunicationChannelCommand.java`
- Create: `crm/src/main/java/com/crm/customer/accountcommunicationchannel/application/command/UpdateAccountCommunicationChannelCommand.java`
- Create: `crm/src/main/java/com/crm/customer/accountcommunicationchannel/application/command/DeleteAccountCommunicationChannelCommand.java`
- Create: `crm/src/main/java/com/crm/customer/accountcommunicationchannel/application/dto/AccountCommunicationChannelDetails.java`
- Create: `crm/src/main/java/com/crm/customer/accountcommunicationchannel/application/port/AccountCommunicationChannelRepository.java`
- Create: `crm/src/main/java/com/crm/customer/accountcommunicationchannel/application/usecase/AccountCommunicationChannelFacade.java`

**Interfaces:**

- Consumes: domain types from Task 2 and existing authorization value objects.
- Produces: the exact application boundary used by persistence, service, and web tasks.

- [ ] **Step 1: Add immutable commands**

Use these exact record shapes and validate identifiers/version in compact
constructors:

```java
public record CreateAccountCommunicationChannelCommand(
		AccountId accountId,
		ChannelType channelType,
		String rawValue,
		String label,
		boolean isPrimary,
		boolean doNotUse) {}

public record UpdateAccountCommunicationChannelCommand(
		AccountId accountId,
		AccountCommunicationChannelId channelId,
		long version,
		ChannelType channelType,
		String rawValue,
		String label,
		boolean isPrimary,
		boolean doNotUse) {}

public record DeleteAccountCommunicationChannelCommand(
		AccountId accountId,
		AccountCommunicationChannelId channelId,
		long version) {}
```

Require both identifiers and require `version >= 1` where present. Domain
normalization remains the source of truth for values and labels.

- [ ] **Step 2: Add the response DTO**

Use the public response fields approved in the spec:

```java
public record AccountCommunicationChannelDetails(
		UUID id,
		UUID accountId,
		ChannelType channelType,
		String rawValue,
		String normalizedValue,
		String label,
		boolean isPrimary,
		boolean isVerified,
		Instant verifiedAt,
		boolean doNotUse,
		long version,
		Instant createdAt,
		Instant updatedAt) {

	public static AccountCommunicationChannelDetails from(
			AccountCommunicationChannel channel) {
		return new AccountCommunicationChannelDetails(
				channel.id().value(), channel.accountId().value(),
				channel.channelType(), channel.rawValue(),
				channel.normalizedValue(), channel.label(),
				channel.isPrimary(), channel.isVerified(),
				channel.verifiedAt(), channel.doNotUse(), channel.version(),
				channel.createdAt(), channel.updatedAt());
	}
}
```

- [ ] **Step 3: Add the repository port**

Define these exact methods; every scoped method receives the actor and resolved
access object:

```java
boolean accountAccessible(TenantId tenantId, AccountId accountId,
		ActorId actorId, AuthorizedDataAccess access);

boolean lockAccount(TenantId tenantId, AccountId accountId,
		ActorId actorId, AuthorizedDataAccess access);

Optional<AccountCommunicationChannel> findById(
		TenantId tenantId, AccountId accountId,
		AccountCommunicationChannelId channelId,
		ActorId actorId, AuthorizedDataAccess access);

List<AccountCommunicationChannel> findAll(
		TenantId tenantId, AccountId accountId,
		ActorId actorId, AuthorizedDataAccess access);

boolean existsActiveDuplicate(TenantId tenantId, AccountId accountId,
		ChannelType channelType, String canonicalValue,
		AccountCommunicationChannelId excludedChannelId,
		ActorId actorId, AuthorizedDataAccess access);

Optional<AccountCommunicationChannel> findPrimary(
		TenantId tenantId, AccountId accountId, ChannelType channelType,
		AccountCommunicationChannelId excludedChannelId,
		ActorId actorId, AuthorizedDataAccess access);

void insert(AccountCommunicationChannel channel);

int update(AccountCommunicationChannel channel, long expectedVersion,
		ActorId actorId, AuthorizedDataAccess access);

int softDelete(AccountCommunicationChannel channel, long expectedVersion,
		ActorId actorId, AuthorizedDataAccess access);
```

The nullable `excludedChannelId` means “do not exclude a row” on create.

- [ ] **Step 4: Add the facade**

```java
AccountCommunicationChannelDetails create(
		CreateAccountCommunicationChannelCommand command);

List<AccountCommunicationChannelDetails> list(AccountId accountId);

AccountCommunicationChannelDetails update(
		UpdateAccountCommunicationChannelCommand command);

void delete(DeleteAccountCommunicationChannelCommand command);
```

- [ ] **Step 5: Statically verify type consistency**

Run:

```bash
rg -n "record (Create|Update|Delete)AccountCommunicationChannel|interface AccountCommunicationChannelRepository|interface AccountCommunicationChannelFacade|record AccountCommunicationChannelDetails" \
  crm/src/main/java/com/crm/customer/accountcommunicationchannel/application
```

Expected: all command, port, DTO, and facade types exist with the exact names
consumed by Tasks 4–6.

### Task 4: Implement authorization-aware JDBC persistence

**Files:**

- Create: `crm/src/main/java/com/crm/customer/accountcommunicationchannel/infrastructure/persistence/AccountCommunicationChannelJdbcMapper.java`
- Create: `crm/src/main/java/com/crm/customer/accountcommunicationchannel/infrastructure/persistence/JdbcAccountCommunicationChannelRepository.java`

**Interfaces:**

- Consumes: `AccountCommunicationChannelRepository`, `AccountScopeSql`, `JdbcClient`, and the domain rehydration factory.
- Produces: complete repository behavior for Task 5.

- [ ] **Step 1: Add the JDBC row mapper**

Map the active row projection into `AccountCommunicationChannel.rehydrate`:

```sql
c.tenant_id, c.id, c.account_id, c.channel_type,
c.raw_value, c.normalized_value, c.label,
c.is_primary, c.is_verified, c.verified_at, c.do_not_use,
c.created_at, c.created_by, c.updated_at, c.updated_by,
c.deleted_at, c.deleted_by, c.version
```

Use the existing mapper conventions for nullable `Timestamp`, `Instant`, and
`ActorId`. Keep the mapper package-private and non-instantiable.

- [ ] **Step 2: Implement Account access and locking**

Both methods resolve `AccountScopeSql` and use the same active, tenant-scoped
Account predicate. `lockAccount` changes the projection and adds the lock:

```java
String sql = scope.cte() + """
SELECT a.id
FROM crm_accounts a
WHERE a.tenant_id = :tenantId
  AND a.id = :accountId
  AND a.deleted_at IS NULL
  AND (%s)
FOR UPDATE
""".formatted(scope.predicate("a"));
```

Return whether one authorized Account row exists. Do not lock on list.

- [ ] **Step 3: Implement scoped channel reads**

`findById`, `findAll`, and `findPrimary` join `crm_accounts a` so every query
rechecks the Account scope:

```sql
FROM crm_communication_channels c
JOIN crm_accounts a
  ON a.tenant_id = c.tenant_id
 AND a.id = c.account_id
 AND a.deleted_at IS NULL
WHERE c.tenant_id = :tenantId
  AND c.account_id = :accountId
  AND c.contact_id IS NULL
  AND c.deleted_at IS NULL
  AND (%s)
```

Append `.formatted(scope.predicate("a"))` to each query text.

`findById` also matches `c.id = :channelId`. `findPrimary` matches channel type
and `c.is_primary = true`, dynamically adding `c.id <> :excludedChannelId`
only when the exclusion is non-null. `findAll` orders by:

```sql
ORDER BY c.channel_type ASC,
         c.is_primary DESC,
         c.created_at ASC,
         c.id ASC
```

- [ ] **Step 4: Implement exact duplicate lookup**

Reuse the scoped join above, match channel type, dynamically exclude the update
target, and compare the appropriate canonical column with binary equality:

```sql
AND (
  (:channelType = 'OTHER'
    AND BINARY c.raw_value = BINARY :canonicalValue)
  OR
  (:channelType <> 'OTHER'
    AND BINARY c.normalized_value = BINARY :canonicalValue)
)
```

The lookup counts only active Account-owned rows. `EMAIL` input is already
lowercased by `ChannelValue`; `LINKEDIN` and `OTHER` therefore retain exact
case-sensitive identity.

- [ ] **Step 5: Implement insert and versioned mutations**

Insert these values and rely on `metadata`'s database default JSON object:

```sql
INSERT INTO crm_communication_channels (
  tenant_id, id, account_id, contact_id, channel_type,
  raw_value, normalized_value, label,
  is_primary, is_verified, verified_at, do_not_use,
  created_at, updated_at, created_by, updated_by, version
) VALUES (
  :tenantId, :id, :accountId, NULL, :channelType,
  :rawValue, :normalizedValue, :label,
  :isPrimary, :isVerified, :verifiedAt, :doNotUse,
  :createdAt, :updatedAt, :createdBy, :updatedBy, :version
)
```

`update` changes only editable channel state plus update audit/version; it must
not modify verification or metadata. `softDelete` changes deletion and update
audit/version. Both statements include:

```sql
WHERE c.tenant_id = :tenantId
  AND c.id = :channelId
  AND c.account_id = :accountId
  AND c.contact_id IS NULL
  AND c.deleted_at IS NULL
  AND c.version = :expectedVersion
  AND (%s)
```

Format the predicate with `scope.predicate("a")` and use an Account join or
scoped `EXISTS` compatible with MySQL update syntax.
Return the affected-row count. Throw `IllegalStateException` if insert affects
anything other than exactly one row.

- [ ] **Step 6: Statically inspect every ownership and mutation predicate**

Run:

```bash
rg -n "FOR UPDATE|contact_id IS NULL|deleted_at IS NULL|expectedVersion|BINARY c\.(raw_value|normalized_value)|ORDER BY c\.channel_type" \
  crm/src/main/java/com/crm/customer/accountcommunicationchannel/infrastructure/persistence
```

Expected: Account locking, Account-only ownership, active filtering, exact
duplicates, stable ordering, and optimistic predicates are all visible. No SQL
or migration file is modified.

### Task 5: Implement transactional application workflows

**Files:**

- Create: `crm/src/main/java/com/crm/customer/accountcommunicationchannel/application/service/AccountCommunicationChannelApplicationService.java`

**Interfaces:**

- Consumes: facade/port from Task 3, domain from Task 2, current tenant/actor, authorizer, identifier generator, and time provider.
- Produces: all four application workflows used by the controller.

- [ ] **Step 1: Wire the service and list workflow**

Use `ENTITY_TYPE = "ACCOUNT"`. `list` is read-only, authorizes
`CRM_ACCOUNT_READ`, requires
`repository.accountAccessible(tenantId, accountId, actorId, access)`, and maps
the stable repository list through `AccountCommunicationChannelDetails::from`:

```java
@Override
@Transactional(readOnly = true)
public List<AccountCommunicationChannelDetails> list(AccountId accountId) {
	Objects.requireNonNull(accountId, "accountId must not be null");
	TenantId tenantId = currentTenant.requireTenantId();
	ActorId actorId = currentActor.requireActorId();
	AuthorizedDataAccess access = authorizer.authorize(
			SystemPermission.CRM_ACCOUNT_READ, ENTITY_TYPE);
	requireAccessibleAccount(tenantId, accountId, actorId, access);
	return repository.findAll(tenantId, accountId, actorId, access)
			.stream()
			.map(AccountCommunicationChannelDetails::from)
			.toList();
}
```

- [ ] **Step 2: Implement create under the Account lock**

Use `@Transactional(isolation = Isolation.READ_COMMITTED)`, authorize write,
then follow this exact order:

```java
requireLockedAccount(tenantId, command.accountId(), actorId, access);
Instant now = timeProvider.now();
AccountCommunicationChannel channel = AccountCommunicationChannel.create(
		tenantId,
		new AccountCommunicationChannelId(identifierGenerator.nextId()),
		command.accountId(), command.channelType(), command.rawValue(),
		command.label(), command.isPrimary(), command.doNotUse(),
		actorId, now);
rejectDuplicate(channel, null, actorId, access);
demoteExistingPrimary(channel, null, actorId, access, now);
repository.insert(channel);
return AccountCommunicationChannelDetails.from(channel);
```

`demoteExistingPrimary` returns immediately unless the requested channel is
primary.

- [ ] **Step 3: Implement replace with optimistic concurrency**

Use the same isolation, authorization, Account lock, and this order:

```java
AccountCommunicationChannel channel = repository.findById(
		tenantId, command.accountId(), command.channelId(), actorId, access)
		.orElseThrow(AccountCommunicationChannelApplicationService::channelNotFound);
if (command.version() != channel.version()) {
	throw versionConflict();
}
long expectedVersion = channel.version();
Instant now = timeProvider.now();
channel.replace(command.channelType(), command.rawValue(), command.label(),
		command.isPrimary(), command.doNotUse(), actorId, now);
rejectDuplicate(channel, channel.id(), actorId, access);
demoteExistingPrimary(channel, channel.id(), actorId, access, now);
if (repository.update(channel, expectedVersion, actorId, access) != 1) {
	throw versionConflict();
}
return AccountCommunicationChannelDetails.from(channel);
```

Changing type while retaining primary demotes the primary of the new type; the
old type is not backfilled.

- [ ] **Step 4: Implement soft delete**

Use write authorization, `READ_COMMITTED`, and the Account lock before the
channel lookup. Check command version, call `softDelete(actorId, now)`, and
require the repository mutation to affect exactly one row. Do not call primary
lookup and do not choose a replacement.

- [ ] **Step 5: Add focused helpers and stable errors**

Implement helpers with these outcomes:

```java
private static DomainResourceNotFound accountNotFound() {
	return new DomainResourceNotFound(AccountErrorCode.ACCOUNT_NOT_FOUND);
}

private static DomainResourceNotFound channelNotFound() {
	return new DomainResourceNotFound(
			AccountCommunicationChannelErrorCode
					.ACCOUNT_COMMUNICATION_CHANNEL_NOT_FOUND);
}

private static ResourceConflict channelAlreadyExists() {
	return new ResourceConflict(
			AccountCommunicationChannelErrorCode
					.ACCOUNT_COMMUNICATION_CHANNEL_ALREADY_EXISTS);
}

private static ResourceConflict versionConflict() {
	return new ResourceConflict(
			AccountCommunicationChannelErrorCode
					.ACCOUNT_COMMUNICATION_CHANNEL_VERSION_CONFLICT);
}
```

`rejectDuplicate` calls `existsActiveDuplicate` with the entity's type and
canonical value. `demoteExistingPrimary` loads a different primary, records its
expected version, calls `demote`, and requires
`repository.update(existingPrimary, expectedVersion, actorId, access) == 1`;
a zero-row demotion returns the stable version conflict. Do not catch
unexpected database constraint errors as canonical duplicates.

- [ ] **Step 6: Statically verify transaction and lock ordering**

Run:

```bash
rg -n "Transactional|CRM_ACCOUNT_(READ|WRITE)|requireLockedAccount|rejectDuplicate|demoteExistingPrimary|versionConflict" \
  crm/src/main/java/com/crm/customer/accountcommunicationchannel/application/service/AccountCommunicationChannelApplicationService.java
```

Expected: three `READ_COMMITTED` mutations, one read-only list, Account lock
before channel inspection, duplicate check before primary demotion, and stable
not-found/conflict factories.

### Task 6: Add the nested REST adapter and localized errors

**Files:**

- Create: `crm/src/main/java/com/crm/customer/accountcommunicationchannel/presentation/web/CreateAccountCommunicationChannelRequest.java`
- Create: `crm/src/main/java/com/crm/customer/accountcommunicationchannel/presentation/web/UpdateAccountCommunicationChannelRequest.java`
- Create: `crm/src/main/java/com/crm/customer/accountcommunicationchannel/presentation/web/AccountCommunicationChannelResponse.java`
- Create: `crm/src/main/java/com/crm/customer/accountcommunicationchannel/presentation/web/AccountCommunicationChannelWebMapper.java`
- Create: `crm/src/main/java/com/crm/customer/accountcommunicationchannel/presentation/web/AccountCommunicationChannelController.java`
- Modify: `crm/src/main/resources/messages.properties`
- Modify: `crm/src/main/resources/messages_en.properties`
- Modify: `crm/src/main/resources/messages_vi.properties`

**Interfaces:**

- Consumes: facade and DTO from Task 3, shared `If-Match` types from Task 1.
- Produces: the four approved HTTP endpoints and localized error details.

- [ ] **Step 1: Add create and update request records**

Both request records contain the same editable components:

```java
@NotNull ChannelType channelType,
@NotBlank @Size(max = 255) String rawValue,
@Size(max = 255) String label,
boolean isPrimary,
boolean doNotUse
```

In each compact constructor, trim `rawValue`; trim `label` and convert blank to
null before Bean Validation checks size. Add conditional validation using the
existing request-record convention:

```java
@AssertTrue
public boolean isRawValueValid() {
	return ChannelValue.isValidWhenPresent(channelType, rawValue);
}
```

This yields `400 REQUEST_VALIDATION_FAILED` for invalid email/E.164 input while
`@NotNull`, `@NotBlank`, and `@Size` retain their common field-error codes.

- [ ] **Step 2: Add response and manual mapper**

`AccountCommunicationChannelResponse` mirrors
`AccountCommunicationChannelDetails` exactly. The mapper is a final
`@Component`, uses explicit constructors rather than MapStruct-generated
sources, and exposes:

```java
CreateAccountCommunicationChannelCommand toCreateCommand(
		AccountId accountId, CreateAccountCommunicationChannelRequest request);

UpdateAccountCommunicationChannelCommand toUpdateCommand(
		AccountId accountId, AccountCommunicationChannelId channelId,
		long version, UpdateAccountCommunicationChannelRequest request);

AccountCommunicationChannelResponse toResponse(
		AccountCommunicationChannelDetails details);

List<AccountCommunicationChannelResponse> toResponses(
		List<AccountCommunicationChannelDetails> details);
```

- [ ] **Step 3: Add the controller**

Use this base mapping and signatures:

```java
@RestController
@RequestMapping("/api/accounts/{accountId}/communication-channels")
public final class AccountCommunicationChannelController {

	@PostMapping
	public ResponseEntity<AccountCommunicationChannelResponse> create(
			@PathVariable UUID accountId,
			@Valid @RequestBody CreateAccountCommunicationChannelRequest request)

	@GetMapping
	public List<AccountCommunicationChannelResponse> list(
			@PathVariable UUID accountId)

	@PutMapping("/{channelId}")
	public AccountCommunicationChannelResponse update(
			@PathVariable UUID accountId,
			@PathVariable UUID channelId,
			@RequestHeader("If-Match")
			@ValidIfMatchVersion String ifMatch,
			@Valid @RequestBody UpdateAccountCommunicationChannelRequest request)

	@DeleteMapping("/{channelId}")
	public ResponseEntity<Void> delete(
			@PathVariable UUID accountId,
			@PathVariable UUID channelId,
			@RequestHeader("If-Match")
			@ValidIfMatchVersion String ifMatch)
}
```

Create returns `201`, list returns the array directly, update returns `200`,
and delete returns `204`. Parse both mutation headers through
`IfMatchVersion.parse(ifMatch)`.

- [ ] **Step 4: Add localized domain messages**

Add all three keys to every bundle. English values:

```properties
account_communication_channel.not_found=The account communication channel was not found
account_communication_channel.already_exists=This account communication channel already exists
account_communication_channel.version_conflict=The account communication channel was changed by another operation
```

Vietnamese/default values:

```properties
account_communication_channel.not_found=Không tìm thấy kênh liên lạc của khách hàng doanh nghiệp
account_communication_channel.already_exists=Kênh liên lạc này đã tồn tại cho khách hàng doanh nghiệp
account_communication_channel.version_conflict=Kênh liên lạc đã được thay đổi bởi thao tác khác
```

No `GlobalExceptionHandler` change is required: existing
`DomainResourceNotFound` and `ResourceConflict` mappings already produce 404
and 409.

- [ ] **Step 5: Statically inspect the public adapter**

Run:

```bash
rg -n "communication-channels|@PostMapping|@GetMapping|@PutMapping|@DeleteMapping|IfMatchVersion\.parse|isRawValueValid" \
  crm/src/main/java/com/crm/customer/accountcommunicationchannel/presentation/web
rg -n "account_communication_channel\.(not_found|already_exists|version_conflict)" \
  crm/src/main/resources/messages*.properties
```

Expected: four routes, two strong-header parses, conditional value validation,
and three keys in each of the three message bundles. No security-filter route
exception is added because all routes remain authenticated and authorization is
performed by the application service.

### Task 7: Synchronize documentation and perform the static handoff

**Files:**

- Modify: `docs/api-reference.md`
- Modify: `docs/technical-roadmap.md`
- Inspect: all files created or modified by Tasks 1–6

**Interfaces:**

- Consumes: implemented controller, requests, response, service authorization, normalization rules, messages, and stable errors.
- Produces: accurate public documentation and static-only completion evidence.

- [ ] **Step 1: Add the API reference section**

Insert `## Account Communication Channels` after Account Relationships and
before OAuth2 Login. Document only implemented behavior:

```http
POST   /api/accounts/{accountId}/communication-channels
GET    /api/accounts/{accountId}/communication-channels
PUT    /api/accounts/{accountId}/communication-channels/{channelId}
DELETE /api/accounts/{accountId}/communication-channels/{channelId}
```

Include authentication, `X-Tenant-ID`, `crm_account.read/write`, request and
response JSON, all seven enum values, normalization table, exact E.164 pattern,
case-sensitive `LINKEDIN`/`OTHER` duplicate behavior, primary switching,
`doNotUse`, verification/metadata exclusions, stable list ordering, strong
`If-Match`, status codes, and the three channel errors plus common 400/401/403/
404/500 behavior. Use only fictitious UUIDs, emails, phone numbers, and tokens.

- [ ] **Step 2: Update the roadmap**

Change Account-adjacent delivery text to state that Account Communication
Channel is delivered. Preserve the deferred order as:

```text
1. Account Address.
2. Contact management, then Contact Communication Channel and Address.
3. Duplicate detection/merge and lifecycle history after concrete rules exist.
```

Do not modify the deferred database credentials, JWT keys, migrations, or UTC
configuration sections.

- [ ] **Step 3: Run static consistency searches**

Run only read-only checks:

```bash
rg -n "ACCOUNT_COMMUNICATION_CHANNEL_(NOT_FOUND|ALREADY_EXISTS|VERSION_CONFLICT)" \
  crm/src/main/java crm/src/main/resources docs/api-reference.md
rg -n "crm_account\.(read|write)|CRM_ACCOUNT_(READ|WRITE)" \
  crm/src/main/java/com/crm/customer/accountcommunicationchannel docs/api-reference.md
rg -n "normalizedValue|isVerified|verifiedAt|metadata|If-Match|doNotUse|isPrimary" \
  crm/src/main/java/com/crm/customer/accountcommunicationchannel docs/api-reference.md
rg -n "contact_id IS NULL|account_id = :accountId|tenant_id = :tenantId|FOR UPDATE|Isolation.READ_COMMITTED" \
  crm/src/main/java/com/crm/customer/accountcommunicationchannel
rg -n "TB[D]|TO[D]O|FIXM[E]|PLACEHOLDE[R]" \
  crm/src/main/java/com/crm/customer/accountcommunicationchannel \
  docs/api-reference.md docs/technical-roadmap.md
git diff --check
git status --short
```

Expected: code/docs use identical routes, permissions, fields, and errors;
mutation SQL is Account-only and locked; no placeholders or whitespace errors
exist; all changes remain unstaged and uncommitted.

- [ ] **Step 4: Record the runtime verification boundary**

In the handoff, explicitly state that no tests, build, application startup,
database calls, or API calls were performed. Give the user this manual checklist
without executing it:

```text
- Email lowercase normalization while preserving trimmed raw case.
- E.164 acceptance and formatted/local-number rejection.
- Duplicate create and update conflict.
- Atomic primary switch and previous-primary version increment.
- doNotUse demotion without automatic replacement.
- Type change of a primary channel.
- Stale If-Match on update and delete.
- Soft-delete invisibility and recreation.
- Cross-tenant and Account-scope non-disclosure.
```
