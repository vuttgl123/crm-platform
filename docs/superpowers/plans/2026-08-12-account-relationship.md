# Account Relationship Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver tenant-scoped creation, two-direction listing, and history-preserving ending of relationships between existing Accounts.

**Architecture:** Add `accountrelationship` as a sibling vertical slice in the `customer` bounded context. Extract the existing Account-row data-scope SQL into one focused customer infrastructure object, then reuse it in both JDBC repositories so every operation filters both participating Accounts consistently.

**Tech Stack:** Java 21 release target, Spring Boot 4, Spring MVC, Spring JDBC `JdbcClient`, Jakarta Validation, MySQL 8, existing `ProblemDetail` error contract.

## Global Constraints

- Do not change the `crm_account_relationships` schema.
- Do not read or modify `crm-fe`.
- Do not run tests, builds, application startup, database calls, API calls, or manual runtime checks unless the user gives a new explicit instruction.
- Do not create, stage, or push a Git commit.
- Keep all changes uncommitted for user review.
- Update `docs/api-reference.md` in the same task as the implemented APIs.
- Reuse `SystemPermission.CRM_ACCOUNT_READ`, `SystemPermission.CRM_ACCOUNT_WRITE`, and entity type `ACCOUNT`; do not introduce relationship-specific permission strings.
- Apply the selected Account data scope to both participating Accounts.
- Preserve `Account.parentAccountId` as the only structural hierarchy source; do not introduce `PARENT`, `CHILD`, or `SUBSIDIARY` relationship types.
- Do not create an inverse relationship row automatically.
- Do not expose a hard-delete or general relationship-update endpoint.
- Verification is static only: source inspection, signature searches, schema comparison, documentation comparison, and `git diff --check`.

---

## File Map

### Shared Account data-scope SQL

- Create `crm/src/main/java/com/crm/customer/infrastructure/persistence/AccountScopeSql.java`: immutable resolved Account-scope SQL object used by JDBC repositories.
- Modify `crm/src/main/java/com/crm/customer/account/infrastructure/persistence/JdbcAccountRepository.java`: replace its private `ScopeSql` construction with `AccountScopeSql`.

### Account Relationship domain and application

- Create `crm/src/main/java/com/crm/customer/accountrelationship/domain/AccountRelationship.java`.
- Create `crm/src/main/java/com/crm/customer/accountrelationship/domain/AccountRelationshipId.java`.
- Create `crm/src/main/java/com/crm/customer/accountrelationship/domain/AccountRelationshipType.java`.
- Create `crm/src/main/java/com/crm/customer/accountrelationship/domain/AccountRelationshipDirection.java`.
- Create `crm/src/main/java/com/crm/customer/accountrelationship/domain/AccountRelationshipErrorCode.java`.
- Create `crm/src/main/java/com/crm/customer/accountrelationship/application/command/CreateAccountRelationshipCommand.java`.
- Create `crm/src/main/java/com/crm/customer/accountrelationship/application/command/EndAccountRelationshipCommand.java`.
- Create `crm/src/main/java/com/crm/customer/accountrelationship/application/query/AccountRelationshipSearchQuery.java`.
- Create `crm/src/main/java/com/crm/customer/accountrelationship/application/dto/AccountReference.java`.
- Create `crm/src/main/java/com/crm/customer/accountrelationship/application/dto/AccountRelationshipDetails.java`.
- Create `crm/src/main/java/com/crm/customer/accountrelationship/application/port/AccountRelationshipRepository.java`.
- Create `crm/src/main/java/com/crm/customer/accountrelationship/application/usecase/AccountRelationshipFacade.java`.
- Create `crm/src/main/java/com/crm/customer/accountrelationship/application/service/AccountRelationshipApplicationService.java`.

### JDBC, web, and documentation

- Create `crm/src/main/java/com/crm/customer/accountrelationship/infrastructure/persistence/AccountRelationshipJdbcMapper.java`.
- Create `crm/src/main/java/com/crm/customer/accountrelationship/infrastructure/persistence/JdbcAccountRelationshipRepository.java`.
- Create `crm/src/main/java/com/crm/customer/accountrelationship/presentation/web/AccountRelationshipController.java`.
- Create `crm/src/main/java/com/crm/customer/accountrelationship/presentation/web/AccountRelationshipWebMapper.java`.
- Create `crm/src/main/java/com/crm/customer/accountrelationship/presentation/web/CreateAccountRelationshipRequest.java`.
- Create `crm/src/main/java/com/crm/customer/accountrelationship/presentation/web/EndAccountRelationshipRequest.java`.
- Create `crm/src/main/java/com/crm/customer/accountrelationship/presentation/web/AccountRelationshipSearchRequest.java`.
- Create `crm/src/main/java/com/crm/customer/accountrelationship/presentation/web/AccountRelationshipResponse.java`.
- Modify `crm/src/main/resources/messages.properties`, `messages_vi.properties`, and `messages_en.properties`.
- Modify `docs/api-reference.md` and `docs/technical-roadmap.md`.

---

### Task 1: Extract Reusable Account Data-Scope SQL

**Files:**

- Create: `crm/src/main/java/com/crm/customer/infrastructure/persistence/AccountScopeSql.java`
- Modify: `crm/src/main/java/com/crm/customer/account/infrastructure/persistence/JdbcAccountRepository.java`

**Interfaces:**

- Consumes: `ActorId`, `AuthorizedDataAccess`, `DataScopeType`, and `ResolvedDataScope`.
- Produces:

```java
public final class AccountScopeSql {
	public static AccountScopeSql resolve(
			ActorId actorId, AuthorizedDataAccess access);
	public String cte();
	public String predicate(String alias);
	public Map<String, Object> parameters();
	public boolean includes(DataScopeType type);
	public boolean directlyIncludesTeam(UUID teamId);
	public boolean hasTeamTree();
}
```

- [ ] **Step 1: Implement the immutable resolved-scope object**

Move the Account-row scope behavior from `JdbcAccountRepository` into
`AccountScopeSql`. Preserve current semantics exactly:

```java
if (includes(DataScopeType.TENANT)) {
	return "1 = 1";
}
List<String> predicates = new ArrayList<>();
if (includes(DataScopeType.OWN)) {
	predicates.add(column(alias, "owner_user_id") + " = :scopeActorId");
}
if (!directTeamIds.isEmpty()) {
	predicates.add(column(alias, "owner_team_id")
			+ " IN (:scopeTeamIds)");
}
if (!treeRootIds.isEmpty()) {
	predicates.add(column(alias, "owner_team_id")
			+ " IN (SELECT id FROM authorized_account_team_tree)");
}
```

Use CTE name `authorized_account_team_tree`. Copy collections/maps
defensively. Accept an empty alias or a simple identifier matching
`[A-Za-z][A-Za-z0-9_]*`. Throw `AccessDeniedException` when no usable scope
exists. A single resolved object must render source and target predicates with
one shared parameter map and CTE.

- [ ] **Step 2: Replace Account repository scope construction**

Replace private `ScopeSql scopeSql(...)` calls with:

```java
AccountScopeSql scope = AccountScopeSql.resolve(actorId, access);
Map<String, Object> parameters = new HashMap<>(scope.parameters());
String predicate = scope.predicate("a");
```

For unaliased update and soft-delete SQL use `scope.predicate("")`. Remove the
private `ScopeSql` record and Account-row predicate builder. Keep search filter
and persistence behavior unchanged. Refactor `ownerAllowed(...)` to use the
resolved object's tenant, own, direct-team, and tree-root information.

- [ ] **Step 3: Perform static equivalence checks**

```bash
rg -n "record ScopeSql|scopeSql\(|authorized_team_tree" \
  crm/src/main/java/com/crm/customer/account \
  crm/src/main/java/com/crm/customer/infrastructure
rg -n "AccountScopeSql.resolve|predicate\(" \
  crm/src/main/java/com/crm/customer/account/infrastructure/persistence/JdbcAccountRepository.java
git diff --check -- \
  crm/src/main/java/com/crm/customer/infrastructure/persistence/AccountScopeSql.java \
  crm/src/main/java/com/crm/customer/account/infrastructure/persistence/JdbcAccountRepository.java
```

Expected: no private `ScopeSql`; the shared object covers detail, search,
parent validation, update, delete, and owner-team tree validation. Do not run
compilation or tests.

---

### Task 2: Add the Domain and Application Contracts

**Files:**

- Create: all `domain`, `application/command`, `application/query`,
  `application/dto`, `application/port`, and `application/usecase` files listed
  in the File Map.

**Interfaces:**

```java
public enum AccountRelationshipType {
	PARTNER, DISTRIBUTOR, RESELLER, SUPPLIER, AFFILIATE, OTHER
}

public enum AccountRelationshipDirection {
	INBOUND, OUTBOUND
}

public record CreateAccountRelationshipCommand(
		AccountId accountId,
		AccountId relatedAccountId,
		AccountRelationshipType relationshipType,
		LocalDate validFrom,
		LocalDate validTo,
		String description) {
}

public record EndAccountRelationshipCommand(
		AccountId accountId,
		AccountRelationshipId relationshipId,
		LocalDate validTo) {
}

public record AccountRelationshipSearchQuery(
		AccountId accountId,
		PageQuery pageQuery) {
}
```

Repository and facade contracts:

```java
public interface AccountRelationshipRepository {
	boolean accountAccessible(TenantId tenantId, AccountId accountId,
			ActorId actorId, AuthorizedDataAccess access);
	void insert(AccountRelationship relationship);
	Optional<AccountRelationship> findForEnd(TenantId tenantId,
			AccountId pathAccountId, AccountRelationshipId relationshipId,
			ActorId actorId, AuthorizedDataAccess access);
	int end(AccountRelationship relationship,
			ActorId actorId, AuthorizedDataAccess access);
	Optional<AccountRelationshipDetails> findDetails(TenantId tenantId,
			AccountId pathAccountId, AccountRelationshipId relationshipId,
			ActorId actorId, AuthorizedDataAccess access);
	PageResult<AccountRelationshipDetails> search(TenantId tenantId,
			ActorId actorId, AccountRelationshipSearchQuery query,
			AuthorizedDataAccess access);
}

public interface AccountRelationshipFacade {
	AccountRelationshipDetails create(
			CreateAccountRelationshipCommand command);
	PageResult<AccountRelationshipDetails> search(
			AccountRelationshipSearchQuery query);
	AccountRelationshipDetails end(
			EndAccountRelationshipCommand command);
}
```

- [ ] **Step 1: Add typed identifiers and enums**

Model `AccountRelationshipId` like `AccountId`: non-null UUID, `from(String)`,
and `toString()`. Add exactly the six approved types and two directions. Do not
include hierarchy values.

- [ ] **Step 2: Implement the relationship aggregate**

Expose `create(...)`, `rehydrate(...)`, accessors, and `end(LocalDate)`.
Normalize optional description with trim-to-null and enforce a 4,000-character
maximum. Creation rejects self-reference and `validTo < validFrom` using stable
business errors.

```java
public void end(LocalDate requestedValidTo) {
	Objects.requireNonNull(requestedValidTo,
			"requestedValidTo must not be null");
	if (validTo != null) {
		if (validTo.equals(requestedValidTo)) {
			return;
		}
		throw new ResourceConflict(
				AccountRelationshipErrorCode.ACCOUNT_RELATIONSHIP_ALREADY_ENDED);
	}
	if (validFrom != null && requestedValidTo.isBefore(validFrom)) {
		throw new BusinessRuleViolation(
				AccountRelationshipErrorCode.ACCOUNT_RELATIONSHIP_PERIOD_INVALID);
	}
	validTo = requestedValidTo;
}
```

The aggregate has no Spring, JDBC, HTTP, or foundation imports.

- [ ] **Step 3: Add stable error codes**

Implement these exact values/message keys:

```java
ACCOUNT_RELATIONSHIP_NOT_FOUND(
		"ACCOUNT_RELATIONSHIP_NOT_FOUND", "account_relationship.not_found"),
ACCOUNT_RELATIONSHIP_ALREADY_EXISTS(
		"ACCOUNT_RELATIONSHIP_ALREADY_EXISTS", "account_relationship.already_exists"),
ACCOUNT_RELATIONSHIP_ALREADY_ENDED(
		"ACCOUNT_RELATIONSHIP_ALREADY_ENDED", "account_relationship.already_ended"),
ACCOUNT_RELATIONSHIP_ACCOUNT_INVALID(
		"ACCOUNT_RELATIONSHIP_ACCOUNT_INVALID", "account_relationship.account_invalid"),
ACCOUNT_RELATIONSHIP_SELF_REFERENCE(
		"ACCOUNT_RELATIONSHIP_SELF_REFERENCE", "account_relationship.self_reference"),
ACCOUNT_RELATIONSHIP_PERIOD_INVALID(
		"ACCOUNT_RELATIONSHIP_PERIOD_INVALID", "account_relationship.period_invalid");
```

Use existing `AccountErrorCode.ACCOUNT_NOT_FOUND` for the path Account.

- [ ] **Step 4: Add commands, query, DTOs, repository, and facade**

Require identifiers, type, and pagination objects in compact constructors.
`AccountRelationshipDetails` is:

```java
public record AccountRelationshipDetails(
		UUID id,
		AccountReference account,
		AccountReference relatedAccount,
		AccountRelationshipDirection direction,
		AccountRelationshipType relationshipType,
		LocalDate validFrom,
		LocalDate validTo,
		String description,
		Instant createdAt,
		UUID createdBy) {
}
```

- [ ] **Step 5: Perform static domain-boundary checks**

```bash
rg -n "org\.springframework|java\.sql|jakarta\." \
  crm/src/main/java/com/crm/customer/accountrelationship/domain || true
rg -n "PARENT|CHILD|SUBSIDIARY" \
  crm/src/main/java/com/crm/customer/accountrelationship || true
git diff --check -- \
  crm/src/main/java/com/crm/customer/accountrelationship/domain \
  crm/src/main/java/com/crm/customer/accountrelationship/application
```

Expected: clean domain dependency direction, no hierarchy relationship type,
and no whitespace errors. Do not compile or run tests.

---

### Task 3: Implement the Transactional Application Workflows

**Files:**

- Create: `crm/src/main/java/com/crm/customer/accountrelationship/application/service/AccountRelationshipApplicationService.java`
- Modify: `crm/src/main/resources/messages.properties`
- Modify: `crm/src/main/resources/messages_vi.properties`
- Modify: `crm/src/main/resources/messages_en.properties`

**Interfaces:**

- Consumes: Task 2 contracts plus `CurrentTenant`, `CurrentActor`,
  `TenantAccessAuthorizer`, `IdentifierGenerator`, and `TimeProvider`.
- Produces: Spring `@Service` implementation of
  `AccountRelationshipFacade`.

- [ ] **Step 1: Implement create workflow**

Use this sequence in one `@Transactional` method:

```java
TenantId tenantId = currentTenant.requireTenantId();
ActorId actorId = currentActor.requireActorId();
AuthorizedDataAccess access = authorizer.authorize(
		SystemPermission.CRM_ACCOUNT_WRITE, "ACCOUNT");

requirePathAccount(tenantId, command.accountId(), actorId, access);
requireRelatedAccount(
		tenantId, command.relatedAccountId(), actorId, access);

AccountRelationship relationship = AccountRelationship.create(
		tenantId,
		new AccountRelationshipId(identifierGenerator.nextId()),
		command.accountId(),
		command.relatedAccountId(),
		command.relationshipType(),
		command.validFrom(),
		command.validTo(),
		command.description(),
		actorId,
		timeProvider.now());
```

Translate `DuplicateKeyException` to
`ResourceConflict(ACCOUNT_RELATIONSHIP_ALREADY_EXISTS)`. Reload through
`findDetails(...)`; if the inserted row is unexpectedly unreadable, throw an
`IllegalStateException` without sensitive identifiers in its message.

- [ ] **Step 2: Implement list workflow**

Mark it `@Transactional(readOnly = true)`. Resolve
`SystemPermission.CRM_ACCOUNT_READ` and entity `ACCOUNT`, verify the path
Account using `accountAccessible(...)`, then call repository `search(...)`.
An unavailable path Account throws
`DomainResourceNotFound(AccountErrorCode.ACCOUNT_NOT_FOUND)`.

- [ ] **Step 3: Implement end workflow and concurrency reconciliation**

Resolve `CRM_ACCOUNT_WRITE`, verify the path Account, then load through
`findForEnd(...)`. An absent scoped relationship throws
`DomainResourceNotFound(ACCOUNT_RELATIONSHIP_NOT_FOUND)`.

Remember `LocalDate previousValidTo` before `relationship.end(...)`:

- If it already equals the requested date, reload and return without update.
- Otherwise call `repository.end(...)`.
- If one row changed, reload and return.
- If zero rows changed, reload `findForEnd(...)`; return success only when its
  `validTo` equals the requested date, otherwise throw
  `ResourceConflict(ACCOUNT_RELATIONSHIP_ALREADY_ENDED)`.

- [ ] **Step 4: Add localized messages**

Add all six keys to all three bundles. English text:

```properties
account_relationship.not_found=The account relationship was not found
account_relationship.already_exists=This account relationship already exists
account_relationship.already_ended=The account relationship has already ended with a different date
account_relationship.account_invalid=The related account is invalid or unavailable
account_relationship.self_reference=An account cannot have a relationship with itself
account_relationship.period_invalid=The relationship validity period is invalid
```

Use clear Vietnamese equivalents in `messages.properties` and
`messages_vi.properties`, keeping those two files synchronized.

- [ ] **Step 5: Statically inspect workflow order and messages**

```bash
rg -n "CRM_ACCOUNT_(READ|WRITE)|accountAccessible|findForEnd|DuplicateKeyException|@Transactional" \
  crm/src/main/java/com/crm/customer/accountrelationship/application/service/AccountRelationshipApplicationService.java
rg -n "^account_relationship\." crm/src/main/resources/messages*.properties
git diff --check -- \
  crm/src/main/java/com/crm/customer/accountrelationship/application/service/AccountRelationshipApplicationService.java \
  crm/src/main/resources/messages.properties \
  crm/src/main/resources/messages_vi.properties \
  crm/src/main/resources/messages_en.properties
```

Expected: correct permission enums, six keys per bundle, and clean diff. Do not
run tests or build.

---

### Task 4: Implement Authorization-Aware JDBC Persistence

**Files:**

- Create: `crm/src/main/java/com/crm/customer/accountrelationship/infrastructure/persistence/AccountRelationshipJdbcMapper.java`
- Create: `crm/src/main/java/com/crm/customer/accountrelationship/infrastructure/persistence/JdbcAccountRelationshipRepository.java`

**Interfaces:**

- Consumes: Task 1 `AccountScopeSql`, Task 2 contracts, and Spring
  `JdbcClient`.
- Produces: `@Repository` implementation of
  `AccountRelationshipRepository`.

- [ ] **Step 1: Implement row mapping**

Provide:

```java
static AccountRelationship mapRelationship(ResultSet rs, int rowNum)
		throws SQLException;

static AccountRelationshipDetails mapDetails(ResultSet rs, int rowNum)
		throws SQLException;
```

Use aliased projection columns `source_id`, `source_number`, `source_name`,
`target_id`, `target_number`, `target_name`, and `direction`. Convert SQL date
with `toLocalDate()` and timestamp with `toInstant()`. Preserve nullable
`created_by`.

- [ ] **Step 2: Implement scoped Account existence**

Resolve one `AccountScopeSql` and query:

```sql
SELECT COUNT(*)
FROM crm_accounts a
WHERE a.tenant_id = :tenantId
  AND a.id = :accountId
  AND a.deleted_at IS NULL
  AND (<scope predicate for alias a>)
```

The service uses this method to distinguish an unavailable path Account from a
safe related-Account validation failure.

- [ ] **Step 3: Implement insert**

```sql
INSERT INTO crm_account_relationships (
    tenant_id, id, account_id, related_account_id,
    relationship_type, valid_from, valid_to,
    description, created_at, created_by
) VALUES (
    :tenantId, :id, :accountId, :relatedAccountId,
    :relationshipType, :validFrom, :validTo,
    :description, :createdAt, :createdBy
)
```

Require exactly one affected row. Let `DuplicateKeyException` reach the
application service for translation.

- [ ] **Step 4: Implement scoped domain loading for end**

Join both active Account aliases and require path involvement:

```sql
JOIN crm_accounts source
  ON source.tenant_id = r.tenant_id
 AND source.id = r.account_id
 AND source.deleted_at IS NULL
JOIN crm_accounts target
  ON target.tenant_id = r.tenant_id
 AND target.id = r.related_account_id
 AND target.deleted_at IS NULL
WHERE r.tenant_id = :tenantId
  AND r.id = :relationshipId
  AND (r.account_id = :pathAccountId
       OR r.related_account_id = :pathAccountId)
  AND (<scope predicate for source>)
  AND (<scope predicate for target>)
```

Use one resolved scope object and one parameter map for both predicates.

- [ ] **Step 5: Implement conditional end update**

Use a scoped MySQL `UPDATE ... JOIN` with both active Account aliases, both
scope predicates, relationship/tenant identifiers, and:

```sql
SET r.valid_to = :validTo
WHERE r.valid_to IS NULL
```

Return the affected-row count. Never overwrite an existing end date.

- [ ] **Step 6: Implement detail and paginated two-direction listing**

The projection preserves stored source/target orientation and calculates:

```sql
CASE
  WHEN r.account_id = :pathAccountId THEN 'OUTBOUND'
  ELSE 'INBOUND'
END AS direction
```

Search applies tenant, path involvement, both active Account joins, and both
scope predicates in both count and item queries. Fetch with:

```sql
ORDER BY r.created_at DESC, r.id DESC
LIMIT :pageSize OFFSET :pageOffset
```

Return `PageResult.of(items, query.pageQuery(), totalElements)`.

- [ ] **Step 7: Compare SQL to the MySQL schema**

```bash
sed -n '340,410p' docs/crm_mysql80.sql
rg -n "crm_account_relationships|tenant_id|account_id|related_account_id|relationship_type|valid_from|valid_to|created_at|created_by" \
  crm/src/main/java/com/crm/customer/accountrelationship/infrastructure/persistence
rg -n "predicate\(\"source\"\)|predicate\(\"target\"\)" \
  crm/src/main/java/com/crm/customer/accountrelationship/infrastructure/persistence/JdbcAccountRelationshipRepository.java
git diff --check -- \
  crm/src/main/java/com/crm/customer/accountrelationship/infrastructure/persistence
```

Expected: only real columns; both Account scope predicates on every disclosing
read/mutation; clean diff. Do not execute SQL, tests, or build.

---

### Task 5: Expose the HTTP API and Synchronize Documentation

**Files:**

- Create: all `presentation/web` files listed in the File Map.
- Modify: `docs/api-reference.md`
- Modify: `docs/technical-roadmap.md`

**Interfaces:**

- Consumes: `AccountRelationshipFacade`, commands/query/DTOs, `PageQuery`, and
  `PageResult`.
- Produces:

```java
@RestController
@RequestMapping("/api/accounts/{accountId}/relationships")
public final class AccountRelationshipController {
	@PostMapping
	public ResponseEntity<AccountRelationshipResponse> create(...);
	@GetMapping
	public PageResult<AccountRelationshipResponse> search(...);
	@PostMapping("/{relationshipId}/end")
	public AccountRelationshipResponse end(...);
}
```

- [ ] **Step 1: Define validated request records**

```java
public record CreateAccountRelationshipRequest(
		@NotNull UUID relatedAccountId,
		@NotNull AccountRelationshipType relationshipType,
		LocalDate validFrom,
		LocalDate validTo,
		@Size(max = 4000) String description) {
}

public record EndAccountRelationshipRequest(
		@NotNull LocalDate validTo) {
}

public record AccountRelationshipSearchRequest(
		@Min(0) Integer page,
		@Min(1) @Max(100) Integer size) {
}
```

Period validation remains in the domain so HTTP and non-HTTP callers receive
the same stable business error.

- [ ] **Step 2: Define the response and manual mapper**

`AccountRelationshipResponse` mirrors the approved spec with nested source and
target Account references. Use a manual Spring `@Component` mapper because
pagination and nested projections benefit from explicit mapping and do not
require generated MapStruct code.

```java
CreateAccountRelationshipCommand toCreateCommand(
		AccountId accountId, CreateAccountRelationshipRequest request);
AccountRelationshipSearchQuery toSearchQuery(
		AccountId accountId, AccountRelationshipSearchRequest request);
EndAccountRelationshipCommand toEndCommand(
		AccountId accountId,
		AccountRelationshipId relationshipId,
		EndAccountRelationshipRequest request);
AccountRelationshipResponse toResponse(
		AccountRelationshipDetails details);
PageResult<AccountRelationshipResponse> toPage(
		PageResult<AccountRelationshipDetails> page);
```

Default pagination is page `0`, size `PageQuery.DEFAULT_SIZE`.

- [ ] **Step 3: Implement three controller endpoints**

- Create returns `201 Created` with body.
- Search returns the page directly.
- End returns `200 OK` with body.
- Convert path UUIDs immediately to typed identifiers.
- Keep authorization in the application service; do not put permission strings
  or `@PreAuthorize` expressions in the controller.

- [ ] **Step 4: Update the endpoint summary table**

Add exactly these contracts to `docs/api-reference.md`:

| Method | Path | Access | Success |
|---|---|---|---|
| `POST` | `/api/accounts/{accountId}/relationships` | Bearer token, tenant, `crm_account.write` | `201 Created` |
| `GET` | `/api/accounts/{accountId}/relationships` | Bearer token, tenant, `crm_account.read` | `200 OK` |
| `POST` | `/api/accounts/{accountId}/relationships/{relationshipId}/end` | Bearer token, tenant, `crm_account.write` | `200 OK` |

- [ ] **Step 5: Add the complete API reference section**

Document only implemented behavior:

- Required headers and database-backed authorization.
- Direction semantics and preserved source/target orientation.
- Exactly six relationship types.
- Create validation and `201` example.
- Pagination defaults/limits, stable ordering, and page example.
- End request, same-date idempotency, different-date conflict, and `200`.
- No inverse-row creation and no hard-delete endpoint.
- Every error/status from the approved design.
- Safe curl examples using placeholder UUIDs and `${ACCESS_TOKEN}` only.

- [ ] **Step 6: Update the technical roadmap**

Record Account Relationship as delivered after core Account. Preserve this
future order without presenting it as implemented API:

1. Account Communication Channel.
2. Account Address.
3. Contact management, then Contact Communication Channel and Address.
4. Duplicate detection/merge and lifecycle history after concrete rules exist.

- [ ] **Step 7: Perform static API-document checks**

```bash
rg -n "@(PostMapping|GetMapping)|/end|RequestMapping" \
  crm/src/main/java/com/crm/customer/accountrelationship/presentation/web/AccountRelationshipController.java
rg -n "/api/accounts/\{accountId\}/relationships|ACCOUNT_RELATIONSHIP_|crm_account\.(read|write)" \
  docs/api-reference.md
rg -n "Account Communication Channel|Account Address|Contact management" \
  docs/technical-roadmap.md
git diff --check -- \
  crm/src/main/java/com/crm/customer/accountrelationship/presentation/web \
  docs/api-reference.md docs/technical-roadmap.md
```

Expected: three mappings have three summary rows and full documentation; future
items remain deferred; clean diff. Do not run API, application, tests, or build.

---

### Task 6: Final Static Cross-Layer Verification

**Files:**

- Inspect: all files created or modified by Tasks 1-5.
- Modify only where a static check identifies a concrete mismatch.

**Interfaces:**

- Consumes: complete implementation and approved design.
- Produces: static verification report only; it does not claim compilation or
  runtime success.

- [ ] **Step 1: Verify permission centralization and endpoint count**

```bash
rg -n '"crm_account\.(read|write)"' \
  crm/src/main/java/com/crm/customer/accountrelationship || true
rg -n "SystemPermission\.CRM_ACCOUNT_(READ|WRITE)" \
  crm/src/main/java/com/crm/customer/accountrelationship
rg -n "@(PostMapping|GetMapping)" \
  crm/src/main/java/com/crm/customer/accountrelationship/presentation/web/AccountRelationshipController.java
```

Expected: no permission string literal, enum usage present, and exactly three
route mappings.

- [ ] **Step 2: Verify no schema or hierarchy drift**

```bash
git diff -- docs/crm_mysql80.sql docs/crm_mysql80_auth.sql
rg -n "PARENT|CHILD|SUBSIDIARY" \
  crm/src/main/java/com/crm/customer/accountrelationship || true
rg -n "DeleteMapping|PutMapping|PatchMapping" \
  crm/src/main/java/com/crm/customer/accountrelationship || true
```

Expected: no schema diff caused by this feature, no hierarchy type, and no
hard-delete/general-update mapping.

- [ ] **Step 3: Verify dependency direction and shared scope usage**

```bash
rg -n "org\.springframework|java\.sql|jakarta\." \
  crm/src/main/java/com/crm/customer/accountrelationship/domain || true
rg -n "record ScopeSql|scopeSql\(" \
  crm/src/main/java/com/crm/customer/account/infrastructure/persistence/JdbcAccountRepository.java || true
rg -n "AccountScopeSql" \
  crm/src/main/java/com/crm/customer/account/infrastructure/persistence/JdbcAccountRepository.java \
  crm/src/main/java/com/crm/customer/accountrelationship/infrastructure/persistence/JdbcAccountRelationshipRepository.java
```

Expected: clean domain boundary, no old private scope implementation, and both
repositories use the shared scope object.

- [ ] **Step 4: Verify contract sets against design and API docs**

Cross-check these exact sets with `rg` and file reads:

- Types: `PARTNER`, `DISTRIBUTOR`, `RESELLER`, `SUPPLIER`, `AFFILIATE`, `OTHER`.
- Directions: `INBOUND`, `OUTBOUND`.
- Endpoints: create, search, end.
- Errors: not found, already exists, already ended, related Account invalid,
  self-reference, and period invalid.
- Search: page `0`, size `20`, maximum `100`, ordering
  `created_at DESC, id DESC`.
- Security: both Accounts use the same tenant and resolved scope.

Do not execute code.

- [ ] **Step 5: Run final diff hygiene check**

```bash
git diff --check
git status --short
```

Report that static verification was performed. Explicitly state that tests,
build, application startup, database execution, and API calls were skipped by
repository rule. Do not claim compilation or runtime success.
