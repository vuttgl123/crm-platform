# Account Address Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add tenant-scoped create, current/history list, replace, and end APIs for Account addresses with two-table persistence, atomic primary switching, UTC-date lifecycle rules, and optimistic concurrency.

**Architecture:** Implement a sibling vertical slice at `com.crm.customer.accountaddress`. One `AccountAddress` aggregate presents `crm_addresses` content and `crm_account_addresses` association state as one resource; mutations lock the authorized Account at `READ_COMMITTED`, update both tables transactionally, and use the address-row trigger-backed version as the aggregate version.

**Tech Stack:** Java 21 release target, Spring Boot 4, Spring MVC, Spring Security, Spring JDBC `JdbcClient`, Jakarta Bean Validation, MySQL 8, RFC 9457 `ProblemDetail`.

## Global Constraints

- Do not inspect or modify `crm-fe`.
- Do not change `docs/crm_mysql80.sql` or introduce a database migration.
- Do not change the current key files or application configuration.
- Use the existing `crm_addresses`, `crm_account_addresses`, `uq_account_addresses_primary_type`, and `trg_touch_crm_addresses` definitions unchanged.
- Model one Account Address aggregate across the two existing tables; do not expose separate address-content and association CRUD APIs.
- Each address identifier created by this API has one Account association and one address type. Do not accept, share, or relink an existing address identifier.
- Do not add Contact Address behavior or a generic Account/Contact owner abstraction.
- Do not add geocoding, verification mutations, formatted-address generation, duplicate detection, merge, future-association cancellation, deletion, or restoration.
- `validationStatus` is read-only and new addresses start as `UNVERIFIED`.
- `countryCode` is required, uppercased, and must be an actual ISO 3166-1 alpha-2 code. Do not derive it from the tenant.
- Coordinates are optional but must be supplied as a latitude/longitude pair, remain inside the schema ranges, and use no more than six fractional digits.
- Use `SystemPermission.CRM_ACCOUNT_READ` for list and `CRM_ACCOUNT_WRITE` for create, replace, and end.
- Every read and mutation must constrain tenant, active Account, active address content, path Account ownership, and `ACCOUNT` data scope.
- Create, replace, and end use `Isolation.READ_COMMITTED` and lock the authorized Account before inspecting address state.
- Update and end require one strong quoted positive signed-long `If-Match` value.
- Derive lifecycle `currentDate` as the UTC calendar date from the single `TimeProvider.now()` value captured for a mutation or list request.
- Keep `docs/api-reference.md` synchronized with the implemented API in this implementation task.
- Do not run or add unit, integration, database, API, smoke, browser, or manual runtime tests. Do not run a build or start the application unless the user explicitly overrides the repository rule.
- Do not stage or commit changes. All plan steps leave changes uncommitted for user review.
- Use static inspection commands only for verification.

---

## File Structure

### Account Address domain

- Create `crm/src/main/java/com/crm/customer/accountaddress/domain/AccountAddressId.java`: UUID value object.
- Create `crm/src/main/java/com/crm/customer/accountaddress/domain/AccountAddressType.java`: Account association type enum.
- Create `crm/src/main/java/com/crm/customer/accountaddress/domain/AddressValidationStatus.java`: read-only database verification-state enum.
- Create `crm/src/main/java/com/crm/customer/accountaddress/domain/AddressContent.java`: text normalization, ISO country, meaningful-component, and coordinate invariants.
- Create `crm/src/main/java/com/crm/customer/accountaddress/domain/AccountAddressErrorCode.java`: stable address errors.
- Create `crm/src/main/java/com/crm/customer/accountaddress/domain/AccountAddress.java`: aggregate lifecycle, primary, audit, and version behavior.

### Application contract and workflow

- Create `crm/src/main/java/com/crm/customer/accountaddress/application/command/CreateAccountAddressCommand.java`.
- Create `crm/src/main/java/com/crm/customer/accountaddress/application/command/UpdateAccountAddressCommand.java`.
- Create `crm/src/main/java/com/crm/customer/accountaddress/application/command/EndAccountAddressCommand.java`.
- Create `crm/src/main/java/com/crm/customer/accountaddress/application/query/AccountAddressSearchQuery.java`.
- Create `crm/src/main/java/com/crm/customer/accountaddress/application/dto/AccountAddressDetails.java`.
- Create `crm/src/main/java/com/crm/customer/accountaddress/application/port/AccountAddressRepository.java`.
- Create `crm/src/main/java/com/crm/customer/accountaddress/application/usecase/AccountAddressFacade.java`.
- Create `crm/src/main/java/com/crm/customer/accountaddress/application/service/AccountAddressApplicationService.java`.

### Persistence adapter

- Create `crm/src/main/java/com/crm/customer/accountaddress/infrastructure/persistence/AccountAddressJdbcMapper.java`: map the joined two-table row into the aggregate.
- Create `crm/src/main/java/com/crm/customer/accountaddress/infrastructure/persistence/JdbcAccountAddressRepository.java`: scoped Account access/locking, current/history reads, primary lookup, two-row insert, and versioned two-table update.

### Web adapter and public documentation

- Create `crm/src/main/java/com/crm/customer/accountaddress/presentation/web/ValidAccountAddress.java`.
- Create `crm/src/main/java/com/crm/customer/accountaddress/presentation/web/AccountAddressValidator.java`.
- Create `crm/src/main/java/com/crm/customer/accountaddress/presentation/web/CreateAccountAddressRequest.java`.
- Create `crm/src/main/java/com/crm/customer/accountaddress/presentation/web/UpdateAccountAddressRequest.java`.
- Create `crm/src/main/java/com/crm/customer/accountaddress/presentation/web/AccountAddressSearchRequest.java`.
- Create `crm/src/main/java/com/crm/customer/accountaddress/presentation/web/AccountAddressResponse.java`.
- Create `crm/src/main/java/com/crm/customer/accountaddress/presentation/web/AccountAddressWebMapper.java`.
- Create `crm/src/main/java/com/crm/customer/accountaddress/presentation/web/AccountAddressController.java`.
- Modify `crm/src/main/resources/messages.properties`, `messages_en.properties`, and `messages_vi.properties`: localized address errors.
- Modify `docs/api-reference.md`: add the four implemented routes and complete contract.
- Modify `docs/technical-roadmap.md`: mark Account Address delivered while retaining deferred work.

---

### Task 1: Implement the Account Address domain

**Files:**

- Create: `crm/src/main/java/com/crm/customer/accountaddress/domain/AccountAddressId.java`
- Create: `crm/src/main/java/com/crm/customer/accountaddress/domain/AccountAddressType.java`
- Create: `crm/src/main/java/com/crm/customer/accountaddress/domain/AddressValidationStatus.java`
- Create: `crm/src/main/java/com/crm/customer/accountaddress/domain/AddressContent.java`
- Create: `crm/src/main/java/com/crm/customer/accountaddress/domain/AccountAddressErrorCode.java`
- Create: `crm/src/main/java/com/crm/customer/accountaddress/domain/AccountAddress.java`

**Interfaces:**

- Consumes: `TenantId`, `ActorId`, `AccountId`, `Instant`, `LocalDate`, and `BigDecimal`.
- Produces: normalized immutable `AddressContent`; aggregate factories `create` and `rehydrate`; mutations `replace`, `demote`, and `end`; stable domain errors.

- [ ] **Step 1: Add the identifier and schema-backed enums**

`AccountAddressId` follows the existing Account child-resource identifier
pattern: require a non-null UUID, provide `from(String)`, and return the UUID
string from `toString()`.

Define the enums exactly as stored by MySQL:

```java
public enum AccountAddressType {
	BILLING,
	SHIPPING,
	OFFICE,
	REGISTERED,
	OTHER
}

public enum AddressValidationStatus {
	UNVERIFIED,
	VALID,
	INVALID,
	PARTIAL
}
```

- [ ] **Step 2: Add stable Account Address errors**

Implement `ErrorCode` with these exact values and message keys:

```java
ACCOUNT_ADDRESS_NOT_FOUND(
		"ACCOUNT_ADDRESS_NOT_FOUND", "account_address.not_found"),
ACCOUNT_ADDRESS_VERSION_CONFLICT(
		"ACCOUNT_ADDRESS_VERSION_CONFLICT",
		"account_address.version_conflict"),
ACCOUNT_ADDRESS_ALREADY_ENDED(
		"ACCOUNT_ADDRESS_ALREADY_ENDED",
		"account_address.already_ended"),
ACCOUNT_ADDRESS_PERIOD_INVALID(
		"ACCOUNT_ADDRESS_PERIOD_INVALID",
		"account_address.period_invalid"),
ACCOUNT_ADDRESS_PRIMARY_INVALID(
		"ACCOUNT_ADDRESS_PRIMARY_INVALID",
		"account_address.primary_invalid");
```

`NOT_FOUND`, `VERSION_CONFLICT`, and `ALREADY_ENDED` are used with 404/409
exceptions. `PERIOD_INVALID` and `PRIMARY_INVALID` are used with
`BusinessRuleViolation` and therefore map to 422 through the existing global
handler.

- [ ] **Step 3: Implement `AddressContent` normalization and invariants**

Use an immutable record with this exact public shape:

```java
public record AddressContent(
		String addressLine1,
		String addressLine2,
		String locality,
		String administrativeArea,
		String postalCode,
		String countryCode,
		BigDecimal latitude,
		BigDecimal longitude,
		String formattedAddress) {
}
```

The compact constructor trims all text, converts blank optional text to null,
uppercases country code with `Locale.ROOT`, and applies these exact maximums:

```java
private static final int TEXT_MAX_LENGTH = 255;
private static final int POSTAL_CODE_MAX_LENGTH = 191;
private static final int COORDINATE_MAX_SCALE = 6;
private static final BigDecimal MIN_LATITUDE = new BigDecimal("-90");
private static final BigDecimal MAX_LATITUDE = new BigDecimal("90");
private static final BigDecimal MIN_LONGITUDE = new BigDecimal("-180");
private static final BigDecimal MAX_LONGITUDE = new BigDecimal("180");
private static final Set<String> ISO_COUNTRY_CODES =
		Set.of(Locale.getISOCountries());
```

Expose the same checks to the web validator without weakening domain
construction:

```java
public static boolean hasMeaningfulComponent(
		String addressLine1, String locality,
		String administrativeArea, String postalCode,
		String formattedAddress)

public static boolean isCountryCodeValid(String countryCode)

public static boolean isCoordinatePairPresent(
		BigDecimal latitude, BigDecimal longitude)

public static boolean isLatitudeValid(BigDecimal latitude)

public static boolean isLongitudeValid(BigDecimal longitude)
```

Meaningful fields are `addressLine1`, `locality`, `administrativeArea`,
`postalCode`, and `formattedAddress`; `addressLine2` and coordinates do not
count. Country validation accepts only the two-letter values in
`Locale.getISOCountries()`. Pair validation returns true only when both
coordinates are null or both are non-null. Range checks are inclusive and each
coordinate rejects `scale() > 6`.

The constructor throws `IllegalArgumentException` for invalid textual,
country, or coordinate content. Bean Validation in Task 5 converts public HTTP
input failures into the common 400 contract before the domain factory runs.

- [ ] **Step 4: Implement aggregate state and factories**

Store exactly this state:

```java
TenantId tenantId;
AccountAddressId id;
AccountId accountId;
AddressContent content;
AddressValidationStatus validationStatus;
AccountAddressType addressType;
boolean primary;
LocalDate validFrom;
LocalDate validTo;
Instant createdAt;
ActorId createdBy;
Instant updatedAt;
ActorId updatedBy;
long version;
```

Provide these public factories:

```java
public static AccountAddress create(
		TenantId tenantId, AccountAddressId id, AccountId accountId,
		AddressContent content, AccountAddressType addressType,
		boolean requestedPrimary, LocalDate validFrom,
		ActorId actorId, Instant now, LocalDate currentDate)

public static AccountAddress rehydrate(
		TenantId tenantId, AccountAddressId id, AccountId accountId,
		AddressContent content, AddressValidationStatus validationStatus,
		AccountAddressType addressType, boolean primary,
		LocalDate validFrom, LocalDate validTo,
		Instant createdAt, ActorId createdBy,
		Instant updatedAt, ActorId updatedBy, long version)
```

Creation requires all identifiers, actor/time/date values, starts with
`UNVERIFIED`, `validTo=null`, `version=1`, and sets both audit times/actors to
the request context. It throws this error when a scheduled association is
requested as primary:

```java
throw new BusinessRuleViolation(
		AccountAddressErrorCode.ACCOUNT_ADDRESS_PRIMARY_INVALID);
```

Rehydration preserves the stored validation status and rejects non-positive
versions or `validTo` before a non-null `validFrom`.

- [ ] **Step 5: Implement aggregate mutations and queries**

Provide these exact methods:

```java
public void replace(AddressContent content,
		AccountAddressType addressType, boolean requestedPrimary,
		LocalDate validFrom, LocalDate currentDate,
		ActorId actorId, Instant now)

public void demote(ActorId actorId, Instant now)

public void end(LocalDate currentDate, ActorId actorId, Instant now)

public boolean isEnded()

public boolean isCurrent(LocalDate currentDate)
```

`replace` first rejects an ended association with
`ResourceConflict(ACCOUNT_ADDRESS_ALREADY_ENDED)`, then validates future
primary state, replaces all editable state, preserves `validationStatus` and
`validTo`, updates audit values, and increments version exactly once.

`demote` is a no-op when already non-primary. Otherwise it clears primary,
updates audit values, and increments version exactly once.

`end` uses this order:

```java
if (validTo != null) {
	throw new ResourceConflict(
			AccountAddressErrorCode.ACCOUNT_ADDRESS_ALREADY_ENDED);
}
if (validFrom != null && currentDate.isBefore(validFrom)) {
	throw new BusinessRuleViolation(
			AccountAddressErrorCode.ACCOUNT_ADDRESS_PERIOD_INVALID);
}
validTo = currentDate;
primary = false;
updateAudit(actorId, now);
```

`isCurrent` returns `(validFrom == null || !validFrom.isAfter(currentDate)) &&
validTo == null`. Add accessors for every stored field and flattened content
field needed by persistence and DTO mapping.

- [ ] **Step 6: Statically inspect domain completeness**

Run:

```bash
rg -n "enum AccountAddressType|enum AddressValidationStatus|ISO_COUNTRY_CODES|hasMeaningfulComponent|isCoordinatePairPresent|void replace|void demote|void end|ACCOUNT_ADDRESS_" \
  crm/src/main/java/com/crm/customer/accountaddress/domain
```

Expected: five address types, four validation states, all five stable errors,
the ISO/meaningful/coordinate rules, and the three mutation methods are
present. No Spring, JDBC, or web imports appear in the domain package.

### Task 2: Define application commands, query, DTO, port, and facade

**Files:**

- Create: `crm/src/main/java/com/crm/customer/accountaddress/application/command/CreateAccountAddressCommand.java`
- Create: `crm/src/main/java/com/crm/customer/accountaddress/application/command/UpdateAccountAddressCommand.java`
- Create: `crm/src/main/java/com/crm/customer/accountaddress/application/command/EndAccountAddressCommand.java`
- Create: `crm/src/main/java/com/crm/customer/accountaddress/application/query/AccountAddressSearchQuery.java`
- Create: `crm/src/main/java/com/crm/customer/accountaddress/application/dto/AccountAddressDetails.java`
- Create: `crm/src/main/java/com/crm/customer/accountaddress/application/port/AccountAddressRepository.java`
- Create: `crm/src/main/java/com/crm/customer/accountaddress/application/usecase/AccountAddressFacade.java`

**Interfaces:**

- Consumes: domain types from Task 1 and the existing authorization value objects.
- Produces: exact boundaries consumed by persistence, service, and web tasks.

- [ ] **Step 1: Add immutable create, update, and end commands**

Use these exact record components:

```java
public record CreateAccountAddressCommand(
		AccountId accountId,
		AccountAddressType addressType,
		String addressLine1,
		String addressLine2,
		String locality,
		String administrativeArea,
		String postalCode,
		String countryCode,
		BigDecimal latitude,
		BigDecimal longitude,
		String formattedAddress,
		boolean isPrimary,
		LocalDate validFrom) {
}

public record UpdateAccountAddressCommand(
		AccountId accountId,
		AccountAddressId addressId,
		long version,
		AccountAddressType addressType,
		String addressLine1,
		String addressLine2,
		String locality,
		String administrativeArea,
		String postalCode,
		String countryCode,
		BigDecimal latitude,
		BigDecimal longitude,
		String formattedAddress,
		boolean isPrimary,
		LocalDate validFrom) {
}

public record EndAccountAddressCommand(
		AccountId accountId,
		AccountAddressId addressId,
		long version) {
}
```

Compact constructors require the identifiers and require `version >= 1` where
present. Domain construction remains the source of truth for normalized
address values and business invariants.

- [ ] **Step 2: Add the list query**

```java
public record AccountAddressSearchQuery(
		AccountId accountId,
		AccountAddressType addressType,
		boolean includeHistory) {

	public AccountAddressSearchQuery {
		Objects.requireNonNull(accountId,
				"accountId must not be null");
	}
}
```

`addressType=null` means all types. `includeHistory=false` means current rows
only; true means current, scheduled, and ended rows.

- [ ] **Step 3: Add the flattened response DTO**

Use the approved public representation:

```java
public record AccountAddressDetails(
		UUID id,
		UUID accountId,
		AccountAddressType addressType,
		String addressLine1,
		String addressLine2,
		String locality,
		String administrativeArea,
		String postalCode,
		String countryCode,
		BigDecimal latitude,
		BigDecimal longitude,
		String formattedAddress,
		AddressValidationStatus validationStatus,
		boolean isPrimary,
		LocalDate validFrom,
		LocalDate validTo,
		long version,
		Instant createdAt,
		Instant updatedAt) {

	public static AccountAddressDetails from(AccountAddress address)
}
```

`from` copies the two UUID values, flattened `AddressContent`, association
state, validation status, aggregate version, and address-row timestamps. Do
not expose tenant or actor identifiers.

- [ ] **Step 4: Add the repository port**

Define these exact methods:

```java
boolean accountAccessible(TenantId tenantId, AccountId accountId,
		ActorId actorId, AuthorizedDataAccess access);

boolean lockAccount(TenantId tenantId, AccountId accountId,
		ActorId actorId, AuthorizedDataAccess access);

Optional<AccountAddress> findById(
		TenantId tenantId, AccountId accountId,
		AccountAddressId addressId, ActorId actorId,
		AuthorizedDataAccess access);

List<AccountAddress> findAll(
		TenantId tenantId, ActorId actorId,
		AccountAddressSearchQuery query, LocalDate currentDate,
		AuthorizedDataAccess access);

Optional<AccountAddress> findCurrentPrimary(
		TenantId tenantId, AccountId accountId,
		AccountAddressType addressType,
		AccountAddressId excludedAddressId, LocalDate currentDate,
		ActorId actorId, AuthorizedDataAccess access);

void insert(AccountAddress address);

int update(AccountAddress address,
		AccountAddressType persistedAddressType,
		long expectedVersion, ActorId actorId,
		AuthorizedDataAccess access);
```

`findById` includes ended and scheduled rows so update/end can distinguish
not-found, stale-version, and already-ended outcomes. The nullable excluded ID
means no exclusion during create.

- [ ] **Step 5: Add the facade**

```java
AccountAddressDetails create(CreateAccountAddressCommand command);

List<AccountAddressDetails> list(AccountAddressSearchQuery query);

AccountAddressDetails update(UpdateAccountAddressCommand command);

AccountAddressDetails end(EndAccountAddressCommand command);
```

- [ ] **Step 6: Statically verify type consistency**

Run:

```bash
rg -n "record (Create|Update|End)AccountAddressCommand|record AccountAddressSearchQuery|record AccountAddressDetails|interface AccountAddressRepository|interface AccountAddressFacade" \
  crm/src/main/java/com/crm/customer/accountaddress/application
```

Expected: every command/query/DTO/port/facade type exists with the exact names
and field types consumed by Tasks 3–5.

### Task 3: Implement authorization-aware two-table JDBC persistence

**Files:**

- Create: `crm/src/main/java/com/crm/customer/accountaddress/infrastructure/persistence/AccountAddressJdbcMapper.java`
- Create: `crm/src/main/java/com/crm/customer/accountaddress/infrastructure/persistence/JdbcAccountAddressRepository.java`

**Interfaces:**

- Consumes: `AccountAddressRepository`, `AccountScopeSql`, `JdbcClient`, and `AccountAddress.rehydrate`.
- Produces: Account locking, scoped current/history reads, primary lookup, atomic insert, and versioned aggregate update for Task 4.

- [ ] **Step 1: Add the joined JDBC row mapper**

Use this exact projection alias set:

```sql
SELECT ad.tenant_id, ad.id, aa.account_id,
       ad.address_line_1, ad.address_line_2,
       ad.locality, ad.administrative_area, ad.postal_code,
       ad.country_code, ad.latitude, ad.longitude,
       ad.formatted_address, ad.validation_status,
       aa.address_type, aa.is_primary, aa.valid_from, aa.valid_to,
       ad.created_at, ad.created_by,
       ad.updated_at, ad.updated_by, ad.version
```

Map the row through:

```java
AccountAddress.rehydrate(
		TenantId.from(resultSet.getString("tenant_id")),
		AccountAddressId.from(resultSet.getString("id")),
		AccountId.from(resultSet.getString("account_id")),
		new AddressContent(
				resultSet.getString("address_line_1"),
				resultSet.getString("address_line_2"),
				resultSet.getString("locality"),
				resultSet.getString("administrative_area"),
				resultSet.getString("postal_code"),
				resultSet.getString("country_code"),
				resultSet.getBigDecimal("latitude"),
				resultSet.getBigDecimal("longitude"),
				resultSet.getString("formatted_address")),
		AddressValidationStatus.valueOf(
				resultSet.getString("validation_status")),
		AccountAddressType.valueOf(
				resultSet.getString("address_type")),
		resultSet.getBoolean("is_primary"),
		resultSet.getObject("valid_from", LocalDate.class),
		resultSet.getObject("valid_to", LocalDate.class),
		instant(resultSet.getTimestamp("created_at")),
		actorId(resultSet.getString("created_by")),
		instant(resultSet.getTimestamp("updated_at")),
		actorId(resultSet.getString("updated_by")),
		resultSet.getLong("version"));
```

Use `getBigDecimal` for coordinates and the established nullable
`Timestamp`/`ActorId` mapper helpers. Keep the mapper package-private and
non-instantiable.

- [ ] **Step 2: Implement Account access and locking**

Both methods resolve `AccountScopeSql`, constrain tenant/id/active state, and
format `scope.predicate("a")`. The mutation lock is exactly:

```sql
SELECT a.id
FROM crm_accounts a
WHERE a.tenant_id = :tenantId
  AND a.id = :accountId
  AND a.deleted_at IS NULL
  AND (%s)
FOR UPDATE
```

Return whether one authorized Account row exists. List uses the non-locking
access check.

- [ ] **Step 3: Implement the shared scoped join and historical ID lookup**

Use this join for address reads:

```sql
FROM crm_account_addresses aa
JOIN crm_addresses ad
  ON ad.tenant_id = aa.tenant_id
 AND ad.id = aa.address_id
 AND ad.deleted_at IS NULL
JOIN crm_accounts a
  ON a.tenant_id = aa.tenant_id
 AND a.id = aa.account_id
 AND a.deleted_at IS NULL
```

`findById` adds:

```sql
WHERE aa.tenant_id = :tenantId
  AND aa.account_id = :accountId
  AND aa.address_id = :addressId
  AND (%s)
```

Do not filter `valid_from` or `valid_to` in this lookup. This API-created data
has one association per address ID, so the query must return zero or one row.

- [ ] **Step 4: Implement current/history listing and deterministic ordering**

Build filter fragments from `AccountAddressSearchQuery` rather than binding a
nullable enum into a universal predicate:

```java
String typeFilter = query.addressType() == null
		? ""
		: "  AND aa.address_type = :addressType\n";
String currentFilter = query.includeHistory()
		? ""
		: "  AND (aa.valid_from IS NULL OR aa.valid_from <= :currentDate)\n"
				+ "  AND aa.valid_to IS NULL\n";
```

Apply tenant, path Account, active joined rows, and Account scope before these
filters. Bind `currentDate` whenever the current predicate or current-ordering
expression uses it. Order exactly as follows:

```sql
ORDER BY aa.address_type ASC,
         CASE
           WHEN (aa.valid_from IS NULL OR aa.valid_from <= :currentDate)
                AND aa.valid_to IS NULL THEN 0
           ELSE 1
         END ASC,
         aa.is_primary DESC,
         (aa.valid_from IS NULL) ASC,
         aa.valid_from DESC,
         ad.created_at ASC,
         ad.id ASC
```

The `(aa.valid_from IS NULL) ASC` expression makes null dates sort last without
using unsupported MySQL `NULLS LAST` syntax.

- [ ] **Step 5: Implement current-primary lookup**

Reuse the scoped join and match:

```sql
AND aa.address_type = :addressType
AND aa.is_primary = true
AND (aa.valid_from IS NULL OR aa.valid_from <= :currentDate)
AND aa.valid_to IS NULL
```

Dynamically add `aa.address_id <> :excludedAddressId` when the exclusion is
non-null. Return the complete aggregate so system demotion can version both
association and address-row state.

- [ ] **Step 6: Insert both rows atomically**

First insert address content and audit/version state:

```sql
INSERT INTO crm_addresses (
  tenant_id, id, address_line_1, address_line_2,
  locality, administrative_area, postal_code, country_code,
  latitude, longitude, formatted_address, validation_status,
  created_at, updated_at, created_by, updated_by, version
) VALUES (
  :tenantId, :addressId, :addressLine1, :addressLine2,
  :locality, :administrativeArea, :postalCode, :countryCode,
  :latitude, :longitude, :formattedAddress, :validationStatus,
  :createdAt, :updatedAt, :createdBy, :updatedBy, :version
)
```

Then insert the only Account association:

```sql
INSERT INTO crm_account_addresses (
  tenant_id, account_id, address_id, address_type,
  is_primary, valid_from, valid_to, created_at, created_by
) VALUES (
  :tenantId, :accountId, :addressId, :addressType,
  :isPrimary, :validFrom, NULL, :createdAt, :createdBy
)
```

Require each insert to affect exactly one row. A runtime exception after either
statement rolls back the service transaction.

- [ ] **Step 7: Implement one versioned aggregate update across both tables**

The method receives `persistedAddressType` because `addressType` is part of the
association primary key and may change. First update the address row through
the scoped association and Account joins:

```sql
UPDATE crm_addresses ad
JOIN crm_account_addresses aa
  ON aa.tenant_id = ad.tenant_id
 AND aa.address_id = ad.id
JOIN crm_accounts a
  ON a.tenant_id = aa.tenant_id
 AND a.id = aa.account_id
 AND a.deleted_at IS NULL
SET ad.address_line_1 = :addressLine1,
    ad.address_line_2 = :addressLine2,
    ad.locality = :locality,
    ad.administrative_area = :administrativeArea,
    ad.postal_code = :postalCode,
    ad.country_code = :countryCode,
    ad.latitude = :latitude,
    ad.longitude = :longitude,
    ad.formatted_address = :formattedAddress,
    ad.updated_by = :updatedBy
WHERE ad.tenant_id = :tenantId
  AND ad.id = :addressId
  AND ad.deleted_at IS NULL
  AND ad.version = :expectedVersion
  AND aa.account_id = :accountId
  AND aa.address_type = :persistedAddressType
  AND (%s)
```

Do not set `ad.version` or `ad.updated_at`; `trg_touch_crm_addresses` sets them
to `OLD.version + 1` and `CURRENT_TIMESTAMP(6)`. If this statement affects zero
rows, return zero without changing the association.

After a successful address update, replace association state:

```sql
UPDATE crm_account_addresses aa
JOIN crm_accounts a
  ON a.tenant_id = aa.tenant_id
 AND a.id = aa.account_id
 AND a.deleted_at IS NULL
JOIN crm_addresses ad
  ON ad.tenant_id = aa.tenant_id
 AND ad.id = aa.address_id
 AND ad.deleted_at IS NULL
SET aa.address_type = :addressType,
    aa.is_primary = :isPrimary,
    aa.valid_from = :validFrom,
    aa.valid_to = :validTo
WHERE aa.tenant_id = :tenantId
  AND aa.account_id = :accountId
  AND aa.address_id = :addressId
  AND aa.address_type = :persistedAddressType
  AND (%s)
```

Require the association statement to match exactly one row using the current
Connector/J found-row behavior already assumed by repository mutations. A
unique-primary violation propagates as an unexpected persistence failure and
the transaction rolls back; normal service ordering prevents it.

- [ ] **Step 8: Statically inspect scope, lifecycle, and version predicates**

Run:

```bash
rg -n "FOR UPDATE|crm_account_addresses|crm_addresses|deleted_at IS NULL|valid_from|valid_to|is_primary|persistedAddressType|expectedVersion|ORDER BY aa\.address_type" \
  crm/src/main/java/com/crm/customer/accountaddress/infrastructure/persistence
```

Expected: Account locking, two-table joins, active-content filtering,
current/history logic, exact primary lookup, trigger-compatible versioning,
and deterministic ordering are visible. No schema or migration file is
modified.

### Task 4: Implement transactional Account Address workflows

**Files:**

- Create: `crm/src/main/java/com/crm/customer/accountaddress/application/service/AccountAddressApplicationService.java`

**Interfaces:**

- Consumes: contracts from Task 2, repository from Task 3, current tenant/actor, authorizer, identifier generator, and time provider.
- Produces: all four application workflows consumed by the controller.

- [ ] **Step 1: Wire the service and the UTC date helper**

Use `ENTITY_TYPE = "ACCOUNT"` and inject:

```java
AccountAddressRepository repository;
CurrentTenant currentTenant;
CurrentActor currentActor;
TenantAccessAuthorizer authorizer;
IdentifierGenerator identifierGenerator;
TimeProvider timeProvider;
```

Convert a captured instant without reading the clock twice:

```java
private static LocalDate utcDate(Instant now) {
	return LocalDate.ofInstant(now, ZoneOffset.UTC);
}
```

- [ ] **Step 2: Implement read-only current/history listing**

Authorize `CRM_ACCOUNT_READ`, require the scoped Account before the child query,
capture one instant, and pass its UTC date to persistence:

```java
@Override
@Transactional(readOnly = true)
public List<AccountAddressDetails> list(AccountAddressSearchQuery query) {
	Objects.requireNonNull(query, "query must not be null");
	TenantId tenantId = currentTenant.requireTenantId();
	ActorId actorId = currentActor.requireActorId();
	AuthorizedDataAccess access = authorizer.authorize(
			SystemPermission.CRM_ACCOUNT_READ, ENTITY_TYPE);
	requireAccessibleAccount(
			tenantId, query.accountId(), actorId, access);
	LocalDate currentDate = utcDate(timeProvider.now());
	return repository.findAll(tenantId, actorId, query, currentDate, access)
			.stream()
			.map(AccountAddressDetails::from)
			.toList();
}
```

- [ ] **Step 3: Implement create under the Account lock**

Use `@Transactional(isolation = Isolation.READ_COMMITTED)`, authorize write,
then follow this exact order:

```java
requireLockedAccount(tenantId, command.accountId(), actorId, access);
Instant now = timeProvider.now();
LocalDate currentDate = utcDate(now);
AddressContent content = contentFrom(command);
AccountAddress address = AccountAddress.create(
		tenantId, new AccountAddressId(identifierGenerator.nextId()),
		command.accountId(), content, command.addressType(),
		command.isPrimary(), command.validFrom(), actorId, now, currentDate);
demoteExistingPrimary(address, null, currentDate, actorId, access, now);
repository.insert(address);
return reloadPersistedDetails(
		tenantId, command.accountId(), address.id(), actorId, access);
```

`contentFrom` constructs `AddressContent` from all nine content command fields.
There is no duplicate lookup.

Define both overloads explicitly:

```java
private static AddressContent contentFrom(
		CreateAccountAddressCommand command) {
	return new AddressContent(command.addressLine1(), command.addressLine2(),
			command.locality(), command.administrativeArea(),
			command.postalCode(), command.countryCode(), command.latitude(),
			command.longitude(), command.formattedAddress());
}

private static AddressContent contentFrom(
		UpdateAccountAddressCommand command) {
	return new AddressContent(command.addressLine1(), command.addressLine2(),
			command.locality(), command.administrativeArea(),
			command.postalCode(), command.countryCode(), command.latitude(),
			command.longitude(), command.formattedAddress());
}
```

- [ ] **Step 4: Implement replace with version-first state checking**

Use write authorization, `READ_COMMITTED`, and the Account lock before loading
the historical-capable row:

```java
AccountAddress address = repository.findById(
		tenantId, command.accountId(), command.addressId(), actorId, access)
		.orElseThrow(AccountAddressApplicationService::addressNotFound);
if (command.version() != address.version()) {
	throw versionConflict();
}
long expectedVersion = address.version();
AccountAddressType persistedAddressType = address.addressType();
Instant now = timeProvider.now();
LocalDate currentDate = utcDate(now);
address.replace(contentFrom(command), command.addressType(),
		command.isPrimary(), command.validFrom(), currentDate, actorId, now);
demoteExistingPrimary(address, address.id(), currentDate,
		actorId, access, now);
if (repository.update(address, persistedAddressType, expectedVersion,
		actorId, access) != 1) {
	throw versionConflict();
}
return reloadPersistedDetails(
		tenantId, command.accountId(), address.id(), actorId, access);
```

Because version comparison occurs before `replace`, stale updates to ended
rows return version conflict; a current-version update to an ended row returns
already-ended from the domain.

- [ ] **Step 5: Implement end with no request body**

Use write authorization, the Account lock, historical lookup, and this complete
version-first sequence:

```java
requireLockedAccount(tenantId, command.accountId(), actorId, access);
AccountAddress address = repository.findById(
		tenantId, command.accountId(), command.addressId(), actorId, access)
		.orElseThrow(AccountAddressApplicationService::addressNotFound);
if (command.version() != address.version()) {
	throw versionConflict();
}
long expectedVersion = address.version();
AccountAddressType persistedAddressType = address.addressType();
Instant now = timeProvider.now();
LocalDate currentDate = utcDate(now);
address.end(currentDate, actorId, now);
if (repository.update(address, persistedAddressType, expectedVersion,
		actorId, access) != 1) {
	throw versionConflict();
}
return reloadPersistedDetails(
		tenantId, command.accountId(), address.id(), actorId, access);
```

The domain sets `validTo=currentDate` and `isPrimary=false`. It returns
already-ended for a current-version ended row and period-invalid when
`currentDate` precedes a scheduled `validFrom`. Do not choose a replacement
primary.

- [ ] **Step 6: Implement atomic primary demotion**

Return immediately unless the requested aggregate is primary. Otherwise:

```java
repository.findCurrentPrimary(address.tenantId(), address.accountId(),
		address.addressType(), excludedAddressId, currentDate,
		actorId, access)
		.ifPresent(existingPrimary -> {
			long expectedVersion = existingPrimary.version();
			AccountAddressType persistedType =
					existingPrimary.addressType();
			existingPrimary.demote(actorId, now);
			if (repository.update(existingPrimary, persistedType,
					expectedVersion, actorId, access) != 1) {
				throw versionConflict();
			}
		});
```

Changing a primary target's type demotes the current primary of the new type;
the old type is not backfilled. The demoted resource receives a new address-row
version through the same repository update.

- [ ] **Step 7: Add scoped not-found, reload, and conflict helpers**

Use these exact exception factories:

```java
private static DomainResourceNotFound accountNotFound() {
	return new DomainResourceNotFound(AccountErrorCode.ACCOUNT_NOT_FOUND);
}

private static DomainResourceNotFound addressNotFound() {
	return new DomainResourceNotFound(
			AccountAddressErrorCode.ACCOUNT_ADDRESS_NOT_FOUND);
}

private static ResourceConflict versionConflict() {
	return new ResourceConflict(
			AccountAddressErrorCode.ACCOUNT_ADDRESS_VERSION_CONFLICT);
}
```

`reloadPersistedDetails` calls the scoped `findById`, maps through
`AccountAddressDetails::from`, and throws `IllegalStateException` if a committed
mutation cannot be read back. This reload is mandatory because the database
trigger owns the final version and timestamp.

Implement the helpers with these exact shapes:

```java
private void requireAccessibleAccount(TenantId tenantId,
		AccountId accountId, ActorId actorId,
		AuthorizedDataAccess access) {
	if (!repository.accountAccessible(
			tenantId, accountId, actorId, access)) {
		throw accountNotFound();
	}
}

private void requireLockedAccount(TenantId tenantId,
		AccountId accountId, ActorId actorId,
		AuthorizedDataAccess access) {
	if (!repository.lockAccount(tenantId, accountId, actorId, access)) {
		throw accountNotFound();
	}
}

private AccountAddressDetails reloadPersistedDetails(
		TenantId tenantId, AccountId accountId,
		AccountAddressId addressId, ActorId actorId,
		AuthorizedDataAccess access) {
	return repository.findById(
			tenantId, accountId, addressId, actorId, access)
			.map(AccountAddressDetails::from)
			.orElseThrow(() -> new IllegalStateException(
					"Persisted Account address could not be reloaded"));
}
```

- [ ] **Step 8: Statically verify transaction and lock ordering**

Run:

```bash
rg -n "Isolation.READ_COMMITTED|readOnly = true|CRM_ACCOUNT_(READ|WRITE)|requireLockedAccount|findById|command\.version|demoteExistingPrimary|reloadPersistedDetails|ZoneOffset.UTC" \
  crm/src/main/java/com/crm/customer/accountaddress/application/service/AccountAddressApplicationService.java
```

Expected: three `READ_COMMITTED` mutations, one read-only list, one Account lock
before each mutation lookup, version comparison before ended-state evaluation,
atomic demotion, UTC dates, and post-write reloads.

### Task 5: Add request validation, REST adapter, and localized errors

**Files:**

- Create: `crm/src/main/java/com/crm/customer/accountaddress/presentation/web/ValidAccountAddress.java`
- Create: `crm/src/main/java/com/crm/customer/accountaddress/presentation/web/AccountAddressValidator.java`
- Create: `crm/src/main/java/com/crm/customer/accountaddress/presentation/web/CreateAccountAddressRequest.java`
- Create: `crm/src/main/java/com/crm/customer/accountaddress/presentation/web/UpdateAccountAddressRequest.java`
- Create: `crm/src/main/java/com/crm/customer/accountaddress/presentation/web/AccountAddressSearchRequest.java`
- Create: `crm/src/main/java/com/crm/customer/accountaddress/presentation/web/AccountAddressResponse.java`
- Create: `crm/src/main/java/com/crm/customer/accountaddress/presentation/web/AccountAddressWebMapper.java`
- Create: `crm/src/main/java/com/crm/customer/accountaddress/presentation/web/AccountAddressController.java`
- Modify: `crm/src/main/resources/messages.properties`
- Modify: `crm/src/main/resources/messages_en.properties`
- Modify: `crm/src/main/resources/messages_vi.properties`

**Interfaces:**

- Consumes: facade/DTO from Task 2 and existing shared `IfMatchVersion` plus `@ValidIfMatchVersion`.
- Produces: four approved routes, field-level 400 validation, and localized 404/409/422 domain errors.

- [ ] **Step 1: Add the shared address-input contract and class constraint**

`@ValidAccountAddress` uses `ElementType.TYPE`, runtime retention, the existing
`{validation.invalid}` message, and `AccountAddressValidator`.

Declare this package-private interface at the bottom of the validator file so
both request records implement the same cross-field contract:

```java
interface AccountAddressInput {
	String addressLine1();
	String locality();
	String administrativeArea();
	String postalCode();
	String countryCode();
	BigDecimal latitude();
	BigDecimal longitude();
	String formattedAddress();
}
```

The validator uses `AddressContent` helpers, accumulates every failing rule,
and adds these property-specific violations:

```java
boolean valid = true;
if (!AddressContent.hasMeaningfulComponent(
		input.addressLine1(), input.locality(),
		input.administrativeArea(), input.postalCode(),
		input.formattedAddress())) {
	addViolation(context, "addressLine1");
	valid = false;
}
if (input.countryCode() != null && !input.countryCode().isBlank()
		&& !AddressContent.isCountryCodeValid(input.countryCode())) {
	addViolation(context, "countryCode");
	valid = false;
}
if (!AddressContent.isCoordinatePairPresent(
		input.latitude(), input.longitude())) {
	addViolation(context, "latitude");
	valid = false;
}
return valid;
```

The helper disables the class-level default and attaches the common validation
message to the concrete property:

```java
private static void addViolation(ConstraintValidatorContext context,
		String property) {
	context.disableDefaultConstraintViolation();
	context.buildConstraintViolationWithTemplate("{validation.invalid}")
			.addPropertyNode(property)
			.addConstraintViolation();
}
```

Do not classify future-primary state as request validation; it must reach the
domain and return `422 ACCOUNT_ADDRESS_PRIMARY_INVALID`.

- [ ] **Step 2: Add create and update request records**

Both records use this exact editable field set and constraints:

```java
@NotNull AccountAddressType addressType,
@Size(max = 255) String addressLine1,
@Size(max = 255) String addressLine2,
@Size(max = 255) String locality,
@Size(max = 255) String administrativeArea,
@Size(max = 191) String postalCode,
@NotBlank @Size(min = 2, max = 2) String countryCode,
@DecimalMin("-90") @DecimalMax("90")
@Digits(integer = 2, fraction = 6) BigDecimal latitude,
@DecimalMin("-180") @DecimalMax("180")
@Digits(integer = 3, fraction = 6) BigDecimal longitude,
@Size(max = 255) String formattedAddress,
boolean isPrimary,
LocalDate validFrom
```

Annotate both records with `@ValidAccountAddress`. Their compact constructors
trim every text field, convert blank optional text to null, and uppercase the
trimmed country code with `Locale.ROOT`. An omitted boolean remains false;
omitted optional fields remain null, giving `PUT` replacement semantics.

- [ ] **Step 3: Add the list query request and response**

```java
public record AccountAddressSearchRequest(
		AccountAddressType addressType,
		boolean includeHistory) {
}
```

`AccountAddressResponse` mirrors every field in `AccountAddressDetails`
exactly and introduces no writable validation/audit properties.

- [ ] **Step 4: Add the manual web mapper**

Use a final `@Component` with these exact methods:

```java
CreateAccountAddressCommand toCreateCommand(
		AccountId accountId, CreateAccountAddressRequest request);

AccountAddressSearchQuery toSearchQuery(
		AccountId accountId, AccountAddressSearchRequest request);

UpdateAccountAddressCommand toUpdateCommand(
		AccountId accountId, AccountAddressId addressId,
		long version, UpdateAccountAddressRequest request);

AccountAddressResponse toResponse(AccountAddressDetails details);

List<AccountAddressResponse> toResponses(
		List<AccountAddressDetails> details);
```

Map every request and response field explicitly. Do not use MapStruct-generated
sources for this slice.

- [ ] **Step 5: Add the nested Account Address controller**

Use this exact base mapping and method signatures:

```java
@RestController
@RequestMapping("/api/accounts/{accountId}/addresses")
public final class AccountAddressController {

	@PostMapping
	public ResponseEntity<AccountAddressResponse> create(
			@PathVariable UUID accountId,
			@Valid @RequestBody CreateAccountAddressRequest request)

	@GetMapping
	public List<AccountAddressResponse> list(
			@PathVariable UUID accountId,
			@Valid @ModelAttribute AccountAddressSearchRequest request)

	@PutMapping("/{addressId}")
	public AccountAddressResponse update(
			@PathVariable UUID accountId,
			@PathVariable UUID addressId,
			@RequestHeader("If-Match")
			@ValidIfMatchVersion String ifMatch,
			@Valid @RequestBody UpdateAccountAddressRequest request)

	@PostMapping("/{addressId}/end")
	public AccountAddressResponse end(
			@PathVariable UUID accountId,
			@PathVariable UUID addressId,
			@RequestHeader("If-Match")
			@ValidIfMatchVersion String ifMatch)
}
```

Create returns `201 Created`; list, update, and end return `200 OK`. Parse both
mutation headers with `IfMatchVersion.parse(ifMatch)`. The end method creates
`EndAccountAddressCommand` directly and has no request body. Do not add
single-address GET or DELETE mappings.

- [ ] **Step 6: Add localized domain messages**

Add all five keys to every bundle. English values:

```properties
account_address.not_found=The account address was not found
account_address.version_conflict=The account address was changed by another operation
account_address.already_ended=The account address association has already ended
account_address.period_invalid=The account address validity period is invalid
account_address.primary_invalid=A future account address cannot be primary
```

Vietnamese/default values:

```properties
account_address.not_found=Không tìm thấy địa chỉ của khách hàng doanh nghiệp
account_address.version_conflict=Địa chỉ của khách hàng doanh nghiệp đã được thay đổi bởi thao tác khác
account_address.already_ended=Liên kết địa chỉ của khách hàng doanh nghiệp đã kết thúc
account_address.period_invalid=Khoảng thời gian hiệu lực của địa chỉ khách hàng doanh nghiệp không hợp lệ
account_address.primary_invalid=Địa chỉ có ngày bắt đầu trong tương lai không thể là địa chỉ chính
```

No `GlobalExceptionHandler` change is required. Its existing exception mapping
already produces 404 for `DomainResourceNotFound`, 409 for `ResourceConflict`,
and 422 for `BusinessRuleViolation`.

- [ ] **Step 7: Statically inspect the public adapter**

Run:

```bash
rg -n "accounts/\{accountId\}/addresses|@PostMapping|@GetMapping|@PutMapping|@DeleteMapping|IfMatchVersion\.parse|includeHistory|ValidAccountAddress" \
  crm/src/main/java/com/crm/customer/accountaddress/presentation/web
rg -n "account_address\.(not_found|version_conflict|already_ended|period_invalid|primary_invalid)" \
  crm/src/main/resources/messages*.properties
```

Expected: four routes, no DELETE, two strong-header parses, current/history
query fields, cross-field input validation, and five keys in each message
bundle. No security-filter permit rule is added because all routes remain
authenticated and authorization occurs in the application service.

### Task 6: Synchronize API documentation and perform the static handoff

**Files:**

- Modify: `docs/api-reference.md`
- Modify: `docs/technical-roadmap.md`
- Inspect: all files created or modified by Tasks 1–5

**Interfaces:**

- Consumes: implemented controller, requests, response, service authorization, validation, lifecycle rules, messages, and stable errors.
- Produces: an accurate public contract and static-only completion evidence.

- [ ] **Step 1: Add all four routes to the API reference index**

Add these authenticated Account routes with their exact permission summaries:

```text
POST /api/accounts/{accountId}/addresses
GET  /api/accounts/{accountId}/addresses
PUT  /api/accounts/{accountId}/addresses/{addressId}
POST /api/accounts/{accountId}/addresses/{addressId}/end
```

Create/update/end require `crm_account.write`; list requires
`crm_account.read`. Every row also requires the resolved `ACCOUNT` data scope.

- [ ] **Step 2: Add the complete Account Address reference section**

Place `## Account Addresses` after Account Communication Channels and before
the next unrelated module. Document only implemented behavior:

```http
POST /api/accounts/{accountId}/addresses
GET /api/accounts/{accountId}/addresses?addressType=OFFICE&includeHistory=true
PUT /api/accounts/{accountId}/addresses/{addressId}
POST /api/accounts/{accountId}/addresses/{addressId}/end
```

Include:

```text
- Bearer authentication and X-Tenant-ID.
- crm_account.read/write and ACCOUNT data-scope non-disclosure.
- All five AccountAddressType values and four read-only validation states.
- All request/response fields, maximum lengths, and optionality.
- Actual ISO alpha-2 country validation and uppercase normalization.
- Meaningful-component and coordinate pair/range/scale rules.
- PUT replacement semantics and read-only validationStatus/validTo.
- UTC-date current/scheduled/ended definitions.
- Default current-only list, includeHistory, optional type filter, and exact ordering.
- Atomic primary switching, future-primary rejection, and no replacement primary.
- Strong If-Match syntax and version-first error priority.
- 201/200 status codes and every stable 400/401/403/404/409/422/500 error.
- No single GET, DELETE, sharing, relinking, duplicate detection, geocoding, or verification mutation.
```

Use only fictitious UUIDs, addresses, tokens, and tenant values. Never include
the repository's database credentials, refresh tokens, signing keys, or real
personal information.

- [ ] **Step 3: Update the technical roadmap**

Mark Account Address delivered after Account Communication Channel. Preserve
the deferred order as:

```text
1. Contact management.
2. Contact Communication Channel and Contact Address.
3. Address verification/geocoding when concrete providers and workflows exist.
4. Duplicate detection, merge, and advanced lifecycle history.
```

Do not modify deferred key/configuration, migration, database-credential, or UTC
deployment items.

- [ ] **Step 4: Run static contract consistency searches**

Run only read-only checks:

```bash
rg -n "ACCOUNT_ADDRESS_(NOT_FOUND|VERSION_CONFLICT|ALREADY_ENDED|PERIOD_INVALID|PRIMARY_INVALID)" \
  crm/src/main/java crm/src/main/resources docs/api-reference.md
rg -n "crm_account\.(read|write)|CRM_ACCOUNT_(READ|WRITE)" \
  crm/src/main/java/com/crm/customer/accountaddress docs/api-reference.md
rg -n "validationStatus|validFrom|validTo|includeHistory|If-Match|isPrimary|countryCode|latitude|longitude" \
  crm/src/main/java/com/crm/customer/accountaddress docs/api-reference.md
rg -n "crm_account_addresses|crm_addresses|deleted_at IS NULL|FOR UPDATE|Isolation.READ_COMMITTED|ZoneOffset.UTC" \
  crm/src/main/java/com/crm/customer/accountaddress
rg -n "TB[D]|TO[D]O|FIXM[E]|PLACEHOLDE[R]" \
  crm/src/main/java/com/crm/customer/accountaddress \
  docs/api-reference.md docs/technical-roadmap.md
git diff --check
git status --short
```

Expected: code and docs use identical routes, permissions, fields, validation,
lifecycle, ordering, and error names; persistence shows Account scope, locking,
active address filters, and version predicates; no placeholders or whitespace
errors exist; all changes remain unstaged and uncommitted.

- [ ] **Step 5: Record the runtime verification boundary**

In the handoff, explicitly state that no tests, build, application startup,
database calls, or API calls were performed. Give the user this manual checklist
without executing it:

```text
- Create each address type and confirm UNVERIFIED plus version 1.
- Trim/uppercase country code and reject non-ISO codes.
- Reject an address without a meaningful component.
- Reject incomplete, out-of-range, or over-scale coordinates.
- Default current-only list, history list, type filter, and deterministic ordering.
- Atomic primary switch on create, update, and address-type change.
- Reject a future-dated primary address.
- PUT replacement semantics and validation-status preservation.
- End immediately removes the row from the current list and does not select a replacement.
- Reject ending a future association and ending/updating an already-ended association.
- Stale If-Match on update, end, and system-demoted resources.
- Cross-tenant, deleted Account/address, and Account-scope non-disclosure.
- Version and updatedAt changes for association-only updates and primary demotion.
```
