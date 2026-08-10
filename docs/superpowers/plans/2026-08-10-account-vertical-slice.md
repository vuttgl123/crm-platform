# Account Vertical Slice Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use
> `superpowers:subagent-driven-development` or
> `superpowers:executing-plans` to implement this plan task-by-task. Steps use
> checkbox (`- [ ]`) syntax for tracking. Do not dispatch subagents unless the
> user explicitly selects that execution mode.

**Goal:** Build the first `customer` bounded-context vertical slice with
tenant-scoped, permission-aware, data-scope-aware Account create, detail,
search, update, and soft-delete APIs.

**Architecture:** Keep Account invariants in a Spring-independent aggregate and
value objects, expose orchestration through an application facade and
authorization-aware repository port, and implement persistence with explicit
Spring `JdbcClient` SQL. The REST boundary uses MapStruct, Jakarta Validation,
the existing `ProblemDetail` convention, and a mostly flat JSON contract with
typed nested owner and annual-revenue values.

**Tech Stack:** Java 21, Spring Boot 4.0.7, Spring Framework 7, Spring Security,
Spring JDBC `JdbcClient`, Jakarta Validation, MapStruct 1.6.3, MySQL 8.0.

**Approved design:**
`docs/superpowers/specs/2026-08-10-account-vertical-slice-design.md`

## Global Constraints

- Work only in the backend project under `crm/` and documentation under
  `docs/`; do not read or modify `crm-fe`.
- Keep `crm/src/main/resources/application.yaml` unchanged.
- Keep JWT key files, key locations, and key-loading behavior unchanged.
- Keep `docs/crm_mysql80.sql` and every existing database SQL file unchanged.
- Do not introduce Flyway, Liquibase, JPA entities, or a migration mechanism.
- Do not add `BaseController`, `BaseService`, `BaseRepository`, generic CRUD
  abstractions, speculative domain events, or an outbox workflow.
- Keep Account domain code independent from Spring, JDBC, HTTP, and
  `foundation`.
- Resolve tenant and actor only through `CurrentTenant` and `CurrentActor`;
  never accept a tenant identifier from the Account API.
- Require permission `crm_account.read` or `crm_account.write` and data-scope
  entity code `ACCOUNT` as specified per operation.
- Apply tenant, `deleted_at IS NULL`, and data-scope predicates in SQL for every
  protected Account read and mutation.
- Preserve `source_id` and `custom_summary`; do not expose or update them.
- Keep Account number client-supplied and immutable.
- Use a hybrid JSON contract: only owner and annual revenue are nested.
- Update `docs/api-reference.md` in the same task that adds the HTTP endpoints.
- Do not add or run tests, builds, application startup, API calls, browser
  checks, or database calls; the user performs runtime verification.
- Do not stage, commit, push, create branches, or create pull requests.
- Preserve unrelated user changes, including `.idea` files and
  `target/generated-sources`; never edit generated MapStruct sources.
- Create packages only when a real source file is added.

---

## File Map

### Domain files

- `crm/src/main/java/com/crm/customer/account/domain/Account.java` — Account
  aggregate, creation defaults, normalization, replacement, audit timestamps,
  soft deletion, and version behavior.
- `AccountId.java` — typed UUID identifier.
- `AccountOwner.java` and `AccountOwnerType.java` — optional `USER` or `TEAM`
  owner value.
- `AnnualRevenue.java` — amount/currency invariant.
- `AccountType.java` and `AccountLifecycleStage.java` — schema-backed enums.
- `AccountErrorCode.java` — stable Account error codes and message keys.

### Application files

- `application/command/*` — transport-neutral create, replace, and delete
  inputs.
- `application/query/AccountSearchQuery.java` — normalized filters and
  `PageQuery`.
- `application/dto/AccountDetails.java` and `AccountSummary.java` — outputs
  without tenant or deletion internals.
- `application/port/AccountRepository.java` — authorization-aware persistence
  and reference-validation contract.
- `application/usecase/AccountFacade.java` — public application API.
- `application/service/AccountApplicationService.java` — authorization,
  transaction, reference validation, concurrency, and error orchestration.

### Infrastructure files

- `infrastructure/persistence/AccountJdbcMapper.java` — row mapping and JDBC
  timestamp/UUID conversion.
- `infrastructure/persistence/JdbcAccountRepository.java` — explicit Account
  SQL, pagination, reference validation, and data-scope predicate generation.

### Web and shared error files

- `presentation/web/CreateAccountRequest.java`, `UpdateAccountRequest.java`,
  and `AccountSearchRequest.java` — HTTP input and Jakarta Validation.
- `presentation/web/AccountResponse.java` and `AccountSummaryResponse.java` —
  public JSON output.
- `presentation/web/AccountWebMapper.java` — MapStruct boundary mapping.
- `presentation/web/AccountController.java` — five Account endpoints and
  `If-Match` parsing/validation.
- `foundation/web/error/GlobalExceptionHandler.java` — safe 400 mapping for
  query/path conversion and direct method-parameter validation errors.
- `crm/src/main/resources/messages*.properties` — localized Account errors.
- `docs/api-reference.md` — implemented Account API contract and safe examples.

---

### Task 1: Implement the Account Domain Model and Error Catalogue

**Files:**

- Create:
  `crm/src/main/java/com/crm/customer/account/domain/AccountId.java`
- Create:
  `crm/src/main/java/com/crm/customer/account/domain/AccountOwnerType.java`
- Create:
  `crm/src/main/java/com/crm/customer/account/domain/AccountOwner.java`
- Create:
  `crm/src/main/java/com/crm/customer/account/domain/AnnualRevenue.java`
- Create:
  `crm/src/main/java/com/crm/customer/account/domain/AccountType.java`
- Create:
  `crm/src/main/java/com/crm/customer/account/domain/AccountLifecycleStage.java`
- Create:
  `crm/src/main/java/com/crm/customer/account/domain/AccountErrorCode.java`
- Create:
  `crm/src/main/java/com/crm/customer/account/domain/Account.java`
- Modify: `crm/src/main/resources/messages.properties`
- Modify: `crm/src/main/resources/messages_en.properties`
- Modify: `crm/src/main/resources/messages_vi.properties`

**Interfaces:**

- Produces `AccountId(UUID value)` with `from(String)` and stable `toString()`.
- Produces `AccountOwner(AccountOwnerType type, UUID id)`.
- Produces `AnnualRevenue(BigDecimal amount, String currencyCode)`.
- Produces the exact `Account.create`, `Account.rehydrate`, `Account.replace`,
  and `Account.softDelete` signatures declared in Task 1 Step 4.
- Produces stable Account error codes consumed by the application service and
  global error translator.

- [x] **Step 1: Add the schema-backed enums and typed identifier**

  Create the exact enum values and identifier contract:

  ```java
  public enum AccountOwnerType { USER, TEAM }

  public enum AccountType {
      ORGANIZATION, PERSON, PARTNER, RESELLER, SUPPLIER
  }

  public enum AccountLifecycleStage {
      PROSPECT, QUALIFIED, CUSTOMER, CHURNED, INACTIVE
  }

  public record AccountId(UUID value) {
      public AccountId {
          Objects.requireNonNull(value, "value must not be null");
      }

      public static AccountId from(String value) {
          return new AccountId(UUID.fromString(
                  Objects.requireNonNull(value, "value must not be null")));
      }

      @Override
      public String toString() {
          return value.toString();
      }
  }
  ```

- [x] **Step 2: Add the two justified value objects**

  `AccountOwner` requires both parts. `AnnualRevenue` requires a nonnegative
  amount fitting `DECIMAL(20,6)` and an uppercase three-letter currency:

  ```java
  public record AccountOwner(AccountOwnerType type, UUID id) {
      public AccountOwner {
          Objects.requireNonNull(type, "type must not be null");
          Objects.requireNonNull(id, "id must not be null");
      }
  }

  public record AnnualRevenue(BigDecimal amount, String currencyCode) {
      public AnnualRevenue {
          Objects.requireNonNull(amount, "amount must not be null");
          if (amount.signum() < 0 || amount.scale() > 6
                  || amount.precision() - amount.scale() > 14) {
              throw new IllegalArgumentException(
                      "amount must fit nonnegative DECIMAL(20,6)");
          }
          if (currencyCode == null || currencyCode.isBlank()) {
              throw new BusinessRuleViolation(
                      AccountErrorCode.ACCOUNT_REVENUE_CURRENCY_REQUIRED);
          }
          currencyCode = currencyCode.trim();
          if (!currencyCode.matches("^[A-Z]{3}$")) {
              throw new IllegalArgumentException(
                      "currencyCode must contain three uppercase letters");
          }
      }
  }
  ```

- [x] **Step 3: Add the stable Account error catalogue**

  Implement `ErrorCode` exactly with these values and keys:

  ```java
  public enum AccountErrorCode implements ErrorCode {
      ACCOUNT_NOT_FOUND("ACCOUNT_NOT_FOUND", "account.not_found"),
      ACCOUNT_NUMBER_ALREADY_EXISTS(
              "ACCOUNT_NUMBER_ALREADY_EXISTS",
              "account.number_already_exists"),
      ACCOUNT_VERSION_CONFLICT(
              "ACCOUNT_VERSION_CONFLICT", "account.version_conflict"),
      ACCOUNT_OWNER_INVALID(
              "ACCOUNT_OWNER_INVALID", "account.owner_invalid"),
      ACCOUNT_PARENT_INVALID(
              "ACCOUNT_PARENT_INVALID", "account.parent_invalid"),
      ACCOUNT_REVENUE_CURRENCY_REQUIRED(
              "ACCOUNT_REVENUE_CURRENCY_REQUIRED",
              "account.revenue_currency_required");

      private final String value;
      private final String messageKey;

      AccountErrorCode(String value, String messageKey) {
          this.value = value;
          this.messageKey = messageKey;
      }

      @Override public String value() { return value; }
      @Override public String messageKey() { return messageKey; }
  }
  ```

- [x] **Step 4: Implement the aggregate state and construction paths**

  `Account` is a normal Java class, not a Spring bean or persistence entity.
  Give it a private constructor plus these exact public entry points:

  ```java
  public static Account create(
          TenantId tenantId,
          AccountId id,
          String accountNumber,
          AccountType accountType,
          String legalName,
          String displayName,
          AccountId parentAccountId,
          AccountOwner owner,
          AccountLifecycleStage lifecycleStage,
          String industryCode,
          String taxIdentifier,
          String registrationNumber,
          String website,
          AnnualRevenue annualRevenue,
          Integer employeeCount,
          String description,
          String preferredLanguageCode,
          Boolean doNotContact,
          ActorId actorId,
          Instant now)

  public static Account rehydrate(
          TenantId tenantId,
          AccountId id,
          String accountNumber,
          AccountType accountType,
          String legalName,
          String displayName,
          AccountId parentAccountId,
          AccountOwner owner,
          AccountLifecycleStage lifecycleStage,
          String industryCode,
          String taxIdentifier,
          String registrationNumber,
          String website,
          AnnualRevenue annualRevenue,
          Integer employeeCount,
          String description,
          String preferredLanguageCode,
          boolean doNotContact,
          Instant createdAt,
          ActorId createdBy,
          Instant updatedAt,
          ActorId updatedBy,
          Instant deletedAt,
          ActorId deletedBy,
          long version)

  public void replace(
          AccountType accountType,
          String legalName,
          String displayName,
          AccountId parentAccountId,
          AccountOwner owner,
          AccountLifecycleStage lifecycleStage,
          String industryCode,
          String taxIdentifier,
          String registrationNumber,
          String website,
          AnnualRevenue annualRevenue,
          Integer employeeCount,
          String description,
          String preferredLanguageCode,
          boolean doNotContact,
          ActorId actorId,
          Instant now)

  public void softDelete(ActorId actorId, Instant now)
  ```

  `create` applies `ORGANIZATION`, `PROSPECT`, and `false` only when nullable
  create values are absent, initializes creation/update audit data, and sets
  version `1`. `rehydrate` preserves database values. `replace` changes every
  mutable field, updates audit data, and increments the version once.
  `softDelete` sets delete/update audit data and increments the version once.

  Centralize normalization in private helpers with these rules:

  ```java
  private static String requiredText(String value, int maxLength,
          String fieldName)

  private static String optionalText(String value, int maxLength,
          String fieldName)

  private static String optionalUnboundedText(String value)

  private static void requireNonnegative(Integer value, String fieldName)

  private static void requireLanguageCode(String value)
  ```

  `requiredText` trims and rejects null/blank/oversize values.
  `optionalText` trims, converts blank to null, and enforces the schema length.
  Preserve Account-number letter case. Enforce legal/tax length `255`,
  industry/registration length `191`, preferred-language length `10`, employee
  count nonnegative, and the schema language regex. Keep website and description
  as optional unbounded strings for this API design. Reject a self-parent in
  `replace`; creation performs the same check after its generated ID is known.

- [x] **Step 5: Expose focused getters required by mapping and persistence**

  Add getters for every aggregate field using the exact domain types above.
  Do not expose setters, persistence column names, `sourceId`, or
  `customSummary`. Include:

  ```java
  public TenantId tenantId()
  public AccountId id()
  public String accountNumber()
  public AccountType accountType()
  public String legalName()
  public String displayName()
  public AccountId parentAccountId()
  public AccountOwner owner()
  public AccountLifecycleStage lifecycleStage()
  public String industryCode()
  public String taxIdentifier()
  public String registrationNumber()
  public String website()
  public AnnualRevenue annualRevenue()
  public Integer employeeCount()
  public String description()
  public String preferredLanguageCode()
  public boolean doNotContact()
  public Instant createdAt()
  public ActorId createdBy()
  public Instant updatedAt()
  public ActorId updatedBy()
  public Instant deletedAt()
  public ActorId deletedBy()
  public long version()
  public boolean deleted()
  ```

- [x] **Step 6: Add localized Account messages**

  Append these English entries to `messages_en.properties`:

  ```properties
  account.not_found=The account was not found
  account.number_already_exists=This account number already exists
  account.version_conflict=The account was changed by another operation
  account.owner_invalid=The account owner is invalid
  account.parent_invalid=The parent account is invalid
  account.revenue_currency_required=Revenue currency is required when annual revenue is provided
  ```

  Append these entries to both the Vietnamese default `messages.properties`
  and `messages_vi.properties`:

  ```properties
  account.not_found=Không tìm thấy khách hàng doanh nghiệp
  account.number_already_exists=Mã khách hàng doanh nghiệp đã tồn tại
  account.version_conflict=Dữ liệu khách hàng doanh nghiệp đã được thay đổi bởi thao tác khác
  account.owner_invalid=Người hoặc nhóm phụ trách khách hàng doanh nghiệp không hợp lệ
  account.parent_invalid=Khách hàng doanh nghiệp cấp trên không hợp lệ
  account.revenue_currency_required=Phải cung cấp loại tiền tệ khi có doanh thu hằng năm
  ```

- [x] **Step 7: Perform static domain verification**

  Use `rtk grep` and `rtk read` to confirm no file under
  `customer/account/domain` imports `org.springframework`, `jakarta.persistence`,
  `java.sql`, `com.crm.foundation`, or any web DTO. Inspect normalization,
  defaults, immutable Account number, owner/revenue invariants, audit mutation,
  and one version increment per mutation. Do not compile or run tests.

### Task 2: Define the Application Commands, Outputs, Port, and Facade

**Files:**

- Create:
  `crm/src/main/java/com/crm/customer/account/application/command/CreateAccountCommand.java`
- Create:
  `crm/src/main/java/com/crm/customer/account/application/command/UpdateAccountCommand.java`
- Create:
  `crm/src/main/java/com/crm/customer/account/application/command/DeleteAccountCommand.java`
- Create:
  `crm/src/main/java/com/crm/customer/account/application/query/AccountSearchQuery.java`
- Create:
  `crm/src/main/java/com/crm/customer/account/application/dto/AccountDetails.java`
- Create:
  `crm/src/main/java/com/crm/customer/account/application/dto/AccountSummary.java`
- Create:
  `crm/src/main/java/com/crm/customer/account/application/port/AccountRepository.java`
- Create:
  `crm/src/main/java/com/crm/customer/account/application/usecase/AccountFacade.java`

**Interfaces:**

- Consumes Task 1 domain types and existing `PageQuery`, `PageResult`,
  `TenantId`, `ActorId`, and `AuthorizedDataAccess`.
- Produces every signature consumed by JDBC, service, and web tasks.

- [x] **Step 1: Add command records with the approved hybrid shape**

  Create records with these exact components:

  ```java
  public record CreateAccountCommand(
          String accountNumber,
          AccountType accountType,
          String legalName,
          String displayName,
          AccountId parentAccountId,
          AccountOwner owner,
          AccountLifecycleStage lifecycleStage,
          String industryCode,
          String taxIdentifier,
          String registrationNumber,
          String website,
          AnnualRevenue annualRevenue,
          Integer employeeCount,
          String description,
          String preferredLanguageCode,
          Boolean doNotContact) {
  }

  public record UpdateAccountCommand(
          AccountId accountId,
          long version,
          AccountType accountType,
          String legalName,
          String displayName,
          AccountId parentAccountId,
          AccountOwner owner,
          AccountLifecycleStage lifecycleStage,
          String industryCode,
          String taxIdentifier,
          String registrationNumber,
          String website,
          AnnualRevenue annualRevenue,
          Integer employeeCount,
          String description,
          String preferredLanguageCode,
          boolean doNotContact) {
  }

  public record DeleteAccountCommand(
          AccountId accountId,
          long version) {
  }
  ```

  Require nonnull Account IDs and positive versions in compact constructors for
  update/delete. Leave create defaults nullable so `Account.create` remains the
  authoritative defaulting boundary.

- [x] **Step 2: Add the normalized search query**

  Implement:

  ```java
  public record AccountSearchQuery(
          String keyword,
          AccountType accountType,
          AccountLifecycleStage lifecycleStage,
          AccountOwner owner,
          PageQuery pageQuery) {

      public AccountSearchQuery {
          keyword = normalizeKeyword(keyword);
          Objects.requireNonNull(pageQuery,
                  "pageQuery must not be null");
      }
  }
  ```

  `normalizeKeyword` trims, converts blank to null, and rejects values longer
  than 255 characters. The web layer guarantees owner type and ID pairing;
  this record additionally receives only a complete `AccountOwner` or null.

- [x] **Step 3: Add immutable detail and summary application outputs**

  `AccountDetails` contains every public field from the approved response and
  no tenant/delete internals:

  ```java
  public record AccountDetails(
          UUID id,
          String accountNumber,
          AccountType accountType,
          String legalName,
          String displayName,
          UUID parentAccountId,
          AccountOwner owner,
          AccountLifecycleStage lifecycleStage,
          String industryCode,
          String taxIdentifier,
          String registrationNumber,
          String website,
          AnnualRevenue annualRevenue,
          Integer employeeCount,
          String description,
          String preferredLanguageCode,
          boolean doNotContact,
          Instant createdAt,
          UUID createdBy,
          Instant updatedAt,
          UUID updatedBy,
          long version) {

      public static AccountDetails from(Account account) {
          return new AccountDetails(
                  account.id().value(),
                  account.accountNumber(),
                  account.accountType(),
                  account.legalName(),
                  account.displayName(),
                  uuid(account.parentAccountId()),
                  account.owner(),
                  account.lifecycleStage(),
                  account.industryCode(),
                  account.taxIdentifier(),
                  account.registrationNumber(),
                  account.website(),
                  account.annualRevenue(),
                  account.employeeCount(),
                  account.description(),
                  account.preferredLanguageCode(),
                  account.doNotContact(),
                  account.createdAt(),
                  uuid(account.createdBy()),
                  account.updatedAt(),
                  uuid(account.updatedBy()),
                  account.version());
      }

      private static UUID uuid(AccountId value) {
          return value == null ? null : value.value();
      }

      private static UUID uuid(ActorId value) {
          return value == null ? null : value.value();
      }
  }
  ```

  `AccountSummary` uses this exact reduced contract:

  ```java
  public record AccountSummary(
          UUID id,
          String accountNumber,
          String displayName,
          String legalName,
          AccountType accountType,
          AccountLifecycleStage lifecycleStage,
          AccountOwner owner,
          boolean doNotContact,
          Instant updatedAt,
          long version) {
  }
  ```

- [x] **Step 4: Define the authorization-aware repository port**

  Add these exact methods:

  ```java
  public interface AccountRepository {

      Optional<Account> findById(
              TenantId tenantId,
              AccountId accountId,
              ActorId actorId,
              AuthorizedDataAccess access);

      PageResult<AccountSummary> search(
              TenantId tenantId,
              ActorId actorId,
              AccountSearchQuery query,
              AuthorizedDataAccess access);

      boolean existsActiveNumber(
              TenantId tenantId, String accountNumber);

      boolean ownerReferenceExists(
              TenantId tenantId, AccountOwner owner);

      boolean ownerAllowed(
              TenantId tenantId,
              ActorId actorId,
              AccountOwner owner,
              AuthorizedDataAccess access);

      boolean parentAllowed(
              TenantId tenantId,
              ActorId actorId,
              AccountId parentAccountId,
              AuthorizedDataAccess access);

      void insert(Account account);

      int update(
              Account account,
              long expectedVersion,
              ActorId actorId,
              AuthorizedDataAccess access);

      int softDelete(
              Account account,
              long expectedVersion,
              ActorId actorId,
              AuthorizedDataAccess access);
  }
  ```

  Keeping this port in `application` is intentional because it consumes
  `AuthorizedDataAccess`; do not move it into the domain.

- [x] **Step 5: Define the public Account application facade**

  Implement:

  ```java
  public interface AccountFacade {

      AccountDetails create(CreateAccountCommand command);

      AccountDetails get(AccountId accountId);

      PageResult<AccountSummary> search(AccountSearchQuery query);

      AccountDetails update(UpdateAccountCommand command);

      void delete(DeleteAccountCommand command);
  }
  ```

- [x] **Step 6: Perform static contract verification**

  Inspect every signature for exact type consistency. Confirm commands and
  outputs contain no Spring MVC or JDBC imports, tenant ID is absent from all
  client-facing commands, and only the repository port imports foundation
  authorization types. Do not compile or add tests.

### Task 3: Implement JDBC Persistence and Data-Scope SQL

**Files:**

- Create:
  `crm/src/main/java/com/crm/customer/account/infrastructure/persistence/AccountJdbcMapper.java`
- Create:
  `crm/src/main/java/com/crm/customer/account/infrastructure/persistence/JdbcAccountRepository.java`

**Interfaces:**

- Implements every Task 2 `AccountRepository` method.
- Consumes `JdbcClient`, domain/application records, `AuthorizedDataAccess`,
  `ResolvedDataScope`, and `DataScopeType`.
- Produces scoped `Account`, `AccountSummary`, and `PageResult` values.

- [x] **Step 1: Add result-set mapping without Spring bean state**

  Implement `AccountJdbcMapper` as a package-private final utility with these
  static mappings:

  ```java
  static Account mapAccount(ResultSet resultSet, int rowNumber)
          throws SQLException

  static AccountSummary mapSummary(ResultSet resultSet, int rowNumber)
          throws SQLException

  static AccountOwner owner(ResultSet resultSet) throws SQLException

  static AnnualRevenue annualRevenue(ResultSet resultSet)
          throws SQLException

  static Instant instant(Timestamp value)
  static Timestamp timestamp(Instant value)
  static ActorId actorId(String value)
  static AccountId accountId(String value)
  static String uuid(UUID value)
  ```

  Return null when both owner columns are null. Return the matching `USER` or
  `TEAM` owner when exactly one column is nonnull. If both columns are nonnull,
  throw `IllegalStateException` because the stored row violates the Account
  ownership invariant; do not silently prefer one owner. Map annual revenue
  only when `annual_revenue` is nonnull. Map every aggregate/audit column
  needed by `Account.rehydrate`; do not select `source_id` or
  `custom_summary`.

- [x] **Step 2: Add a fixed, parameterized scope-clause builder inside the repository**

  Keep `JdbcAccountRepository` non-final so Spring's repository exception
  translation can proxy it under the current class-proxy configuration. Use a
  private nested result type:

  ```java
  private record ScopeSql(
          String cte,
          String predicate,
          Map<String, Object> parameters) {
  }
  ```

  Build clauses only from enum values, never from client text. Give the builder
  a fixed column-prefix argument: `"a."` for select/count queries and `""` for
  mutation queries. If any scope is `TENANT`, return an empty CTE and predicate
  `1 = 1`. Otherwise combine these fixed predicates with `OR`:

  ```sql
  a.owner_user_id = :scopeActorId
  a.owner_team_id IN (:scopeTeamIds)
  a.owner_team_id IN (SELECT id FROM authorized_team_tree)
  ```

  For `TEAM_TREE`, prefix the query with one recursive CTE rooted at all
  nonnull `TEAM_TREE` scope team IDs:

  ```sql
  WITH RECURSIVE authorized_team_tree AS (
      SELECT t.id
      FROM platform_teams t
      WHERE t.tenant_id = :tenantId
        AND t.id IN (:scopeTreeRootIds)
        AND t.status = 'ACTIVE'
        AND t.deleted_at IS NULL
      UNION ALL
      SELECT child.id
      FROM platform_teams child
      JOIN authorized_team_tree parent
        ON child.parent_team_id = parent.id
      WHERE child.tenant_id = :tenantId
        AND child.status = 'ACTIVE'
        AND child.deleted_at IS NULL
  )
  ```

  `OWN` binds the current actor. `TEAM` binds direct team IDs. Reject an empty
  effective predicate with `AccessDeniedException`; an `AuthorizedDataAccess`
  value must never widen to tenant access accidentally.

- [x] **Step 3: Implement scoped detail and parent visibility queries**

  Use the full Account select with all Task 1 columns and these mandatory
  predicates:

  ```sql
  WHERE a.tenant_id = :tenantId
    AND a.id = :accountId
    AND a.deleted_at IS NULL
    AND (<scope predicate>)
  ```

  `findById` returns `optional()`. `parentAllowed` uses the same tenant,
  active-row, and scope conditions with `COUNT(*)`; it does not disclose why a
  parent is unavailable.

- [x] **Step 4: Implement Account search and count with identical criteria**

  Build one criteria fragment reused by the page select and count. It always
  contains tenant, active row, and scope predicates and conditionally adds:

  ```sql
  AND (
      a.account_number LIKE :accountNumberPrefix
      OR MATCH(
          a.account_number,
          a.display_name,
          a.legal_name,
          a.tax_identifier,
          a.registration_number
      ) AGAINST (:keyword IN NATURAL LANGUAGE MODE)
  )
  AND a.account_type = :accountType
  AND a.lifecycle_stage = :lifecycleStage
  AND a.owner_user_id = :ownerId
  AND a.owner_team_id = :ownerId
  ```

  Add only the relevant owner predicate based on `AccountOwnerType`; never add
  both. Escape `%`, `_`, and the chosen escape character before the Account
  number `LIKE` prefix and declare `ESCAPE '\\'` in SQL. Use this exact helper
  before appending `%`:

  ```java
  private static String escapeLikePrefix(String value) {
      return value
              .replace("\\", "\\\\")
              .replace("%", "\\%")
              .replace("_", "\\_");
  }
  ```

  Bind a normalized full-text keyword separately. Page query:

  ```sql
  ORDER BY a.updated_at DESC, a.id DESC
  LIMIT :pageSize OFFSET :pageOffset
  ```

  Return `PageResult.of(items, query.pageQuery(), totalElements)`.

- [x] **Step 5: Implement tenant-wide uniqueness and owner validation**

  Active-number existence query:

  ```sql
  SELECT COUNT(*)
  FROM crm_accounts a
  WHERE a.tenant_id = :tenantId
    AND a.account_number = :accountNumber
    AND a.deleted_at IS NULL
  ```

  For `USER`, `ownerReferenceExists` must join
  `platform_tenant_memberships` and `platform_users`, requiring active
  membership and active user in the tenant. For `TEAM`, require matching
  tenant, `status='ACTIVE'`, and `deleted_at IS NULL` in `platform_teams`.

  `ownerAllowed` applies the approved ownership matrix:

  ```text
  TENANT      -> any reference-valid USER or TEAM owner
  OWN         -> USER owner equal to current actor
  TEAM        -> TEAM owner equal to a direct granted team
  TEAM_TREE   -> TEAM owner present in the active recursive team tree
  ```

  Multiple scopes combine with OR. Do not infer that a user is writable merely
  because they are a member of a writable team; TEAM scopes assign team owners.

- [x] **Step 6: Implement insert without touching deferred columns**

  Insert only these columns and bind UUIDs as strings and instants as
  timestamps:

  ```sql
  INSERT INTO crm_accounts (
      tenant_id, id, account_number, account_type,
      legal_name, display_name, parent_account_id,
      owner_user_id, owner_team_id, lifecycle_stage,
      industry_code, tax_identifier, registration_number,
      website, annual_revenue, revenue_currency_code,
      employee_count, description, preferred_language_code,
      do_not_contact, created_at, updated_at,
      created_by, updated_by, version
  ) VALUES (
      :tenantId, :id, :accountNumber, :accountType,
      :legalName, :displayName, :parentAccountId,
      :ownerUserId, :ownerTeamId, :lifecycleStage,
      :industryCode, :taxIdentifier, :registrationNumber,
      :website, :annualRevenue, :revenueCurrencyCode,
      :employeeCount, :description, :preferredLanguageCode,
      :doNotContact, :createdAt, :updatedAt,
      :createdBy, :updatedBy, :version
  )
  ```

  Omitting `source_id` leaves it null; omitting `custom_summary` preserves its
  database default object.

- [x] **Step 7: Implement scoped optimistic update and soft delete**

  Update every mutable slice field and audit/version column, but never update
  `account_number`, `source_id`, or `custom_summary`. Require:

  ```sql
  WHERE a.tenant_id = :tenantId
    AND a.id = :id
    AND a.version = :expectedVersion
    AND a.deleted_at IS NULL
    AND (<scope predicate>)
  ```

  Because MySQL UPDATE aliases vary by syntax support, construct the scope
  predicates against the unaliased `crm_accounts` columns for mutation queries
  rather than relying on `UPDATE ... AS a`. Return the affected-row count.

  Soft delete updates only:

  ```sql
  SET deleted_at = :deletedAt,
      deleted_by = :deletedBy,
      updated_at = :updatedAt,
      updated_by = :updatedBy,
      version = :newVersion
  ```

  and uses the same tenant, ID, expected-version, active-row, and write-scope
  constraints.

- [x] **Step 8: Perform static persistence verification**

  Inspect every SQL path for bound parameters, tenant predicate, active-row
  predicate, applicable scope predicate, and stable update ordering. Confirm
  both search queries share criteria, mutation SQL preserves deferred columns,
  and `JdbcAccountRepository` is not final. Do not connect to MySQL, compile,
  build, or run tests.

### Task 4: Implement Account Application Orchestration

**Files:**

- Create:
  `crm/src/main/java/com/crm/customer/account/application/service/AccountApplicationService.java`

**Interfaces:**

- Implements Task 2 `AccountFacade`.
- Consumes Task 2 `AccountRepository`, `CurrentTenant`, `CurrentActor`,
  `TenantAccessAuthorizer`, `IdentifierGenerator`, and `TimeProvider`.
- Produces transactional command behavior and read-only queries.

- [x] **Step 1: Add service dependencies and authorization constants**

  Implement a non-final Spring service with constructor injection:

  ```java
  @Service
  public class AccountApplicationService implements AccountFacade {

      private static final String READ_PERMISSION = "crm_account.read";
      private static final String WRITE_PERMISSION = "crm_account.write";
      private static final String ENTITY_TYPE = "ACCOUNT";

      private final AccountRepository accountRepository;
      private final CurrentTenant currentTenant;
      private final CurrentActor currentActor;
      private final TenantAccessAuthorizer authorizer;
      private final IdentifierGenerator identifierGenerator;
      private final TimeProvider timeProvider;
  }
  ```

  Keep the class non-final because transactional Spring AOP uses class proxies
  in the current configuration.

- [x] **Step 2: Implement create orchestration**

  Use one `@Transactional` method with this exact order:

  ```java
  TenantId tenantId = currentTenant.requireTenantId();
  ActorId actorId = currentActor.requireActorId();
  AuthorizedDataAccess access = authorizer.authorize(
          WRITE_PERMISSION, ENTITY_TYPE);
  AccountId accountId = new AccountId(identifierGenerator.nextId());
  Instant now = timeProvider.now();

  Account account = Account.create(
          tenantId,
          accountId,
          command.accountNumber(),
          command.accountType(),
          command.legalName(),
          command.displayName(),
          command.parentAccountId(),
          command.owner(),
          command.lifecycleStage(),
          command.industryCode(),
          command.taxIdentifier(),
          command.registrationNumber(),
          command.website(),
          command.annualRevenue(),
          command.employeeCount(),
          command.description(),
          command.preferredLanguageCode(),
          command.doNotContact(),
          actorId,
          now);

  validateOwner(tenantId, actorId, account.owner(), access);
  validateParent(tenantId, actorId, account.id(),
          account.parentAccountId(), access);

  if (accountRepository.existsActiveNumber(
          tenantId, account.accountNumber())) {
      throw new ResourceConflict(
              AccountErrorCode.ACCOUNT_NUMBER_ALREADY_EXISTS);
  }

  try {
      accountRepository.insert(account);
  }
  catch (DuplicateKeyException exception) {
      throw new ResourceConflict(
              AccountErrorCode.ACCOUNT_NUMBER_ALREADY_EXISTS);
  }
  return AccountDetails.from(account);
  ```

  Catch only `DuplicateKeyException`; do not translate every data integrity
  failure into an Account-number conflict.

- [x] **Step 3: Implement read and search orchestration**

  Both methods use `@Transactional(readOnly = true)`. Detail authorizes read,
  loads by tenant/actor/scope, and hides every unavailable condition behind one
  not-found error:

  ```java
  return accountRepository.findById(
              tenantId, accountId, actorId, access)
          .map(AccountDetails::from)
          .orElseThrow(() -> new DomainResourceNotFound(
                  AccountErrorCode.ACCOUNT_NOT_FOUND));
  ```

  Search authorizes `crm_account.read` and delegates the normalized query and
  resolved access unchanged:

  ```java
  return accountRepository.search(tenantId, actorId, query, access);
  ```

- [x] **Step 4: Implement replace orchestration and optimistic concurrency**

  In one `@Transactional` method:

  1. resolve tenant, actor, and write access;
  2. load the active scoped Account or throw `ACCOUNT_NOT_FOUND`;
  3. compare `command.version()` with `account.version()` and throw
     `ACCOUNT_VERSION_CONFLICT` on mismatch;
  4. validate requested owner and parent;
  5. keep `long expectedVersion = account.version()`;
  6. call `account.replace` with every mutable command field, actor, and one
     `timeProvider.now()` value:

  ```java
  account.replace(
          command.accountType(),
          command.legalName(),
          command.displayName(),
          command.parentAccountId(),
          command.owner(),
          command.lifecycleStage(),
          command.industryCode(),
          command.taxIdentifier(),
          command.registrationNumber(),
          command.website(),
          command.annualRevenue(),
          command.employeeCount(),
          command.description(),
          command.preferredLanguageCode(),
          command.doNotContact(),
          actorId,
          now);
  ```

  7. call repository update and require exactly one affected row.

  Use this zero-row translation:

  ```java
  if (accountRepository.update(
          account, expectedVersion, actorId, access) != 1) {
      throw new ResourceConflict(
              AccountErrorCode.ACCOUNT_VERSION_CONFLICT);
  }
  return AccountDetails.from(account);
  ```

- [x] **Step 5: Implement versioned soft delete**

  Follow the same scoped load and version comparison as update. Keep the
  expected version, call `account.softDelete(actorId, now)`, and require one
  affected row from `softDelete`. A stale or concurrent zero-row result is
  `ACCOUNT_VERSION_CONFLICT`; an unavailable initial load is
  `ACCOUNT_NOT_FOUND`.

- [x] **Step 6: Implement owner and parent validation helpers**

  Owner rules:

  ```java
  private void validateOwner(
          TenantId tenantId,
          ActorId actorId,
          AccountOwner owner,
          AuthorizedDataAccess access) {
      if (owner == null) {
          if (!hasTenantScope(access)) {
              throw new AccessDeniedException(
                      "Unassigned Account requires TENANT scope");
          }
          return;
      }
      if (!accountRepository.ownerReferenceExists(tenantId, owner)) {
          throw new BusinessRuleViolation(
                  AccountErrorCode.ACCOUNT_OWNER_INVALID);
      }
      if (!accountRepository.ownerAllowed(
              tenantId, actorId, owner, access)) {
          throw new AccessDeniedException(
                  "Requested Account owner is outside data scope");
      }
  }
  ```

  `hasTenantScope` checks `scope.type() == DataScopeType.TENANT`.
  Parent validation returns immediately for null, rejects self-reference, and
  calls `parentAllowed`; every false result throws
  `BusinessRuleViolation(AccountErrorCode.ACCOUNT_PARENT_INVALID)`.

- [x] **Step 7: Perform static orchestration verification**

  Inspect annotations and method flow. Confirm permission is checked before
  protected loading, all contexts come from foundation, all command methods are
  transactional, all query methods are read-only, duplicate handling catches
  only `DuplicateKeyException`, owner scope failures are 403, invalid
  references are 422, and zero-row mutations are 409. Do not run the service.

### Task 5: Extend the Shared Validation Error Boundary for Account Parameters

**Files:**

- Modify:
  `crm/src/main/java/com/crm/foundation/web/error/GlobalExceptionHandler.java`

**Interfaces:**

- Preserves every current error response.
- Adds safe `REQUEST_VALIDATION_FAILED` responses for Spring MVC binding/type
  conversion and direct method-parameter validation.
- Supplies the Account controller with controlled handling for invalid UUID,
  enum, query, and `If-Match` values.

- [x] **Step 1: Handle unreadable JSON as request validation**

  Add an `HttpMessageNotReadableException` handler that returns one localized
  `VALIDATION_INVALID` violation named `request` through
  `createValidationProblem`. Do not return the Jackson/Spring exception message;
  malformed JSON, wrong JSON token types, and invalid body enum text remain safe
  `400 REQUEST_VALIDATION_FAILED` responses.

- [x] **Step 2: Handle query/model binding errors using existing field mapping**

  Add a `BindException` handler that maps and sorts its field errors with the
  same `toFieldViolation(FieldError, Locale)` method already used for request
  bodies:

  ```java
  @ExceptionHandler(BindException.class)
  public ResponseEntity<ProblemDetail> handleBindException(
          BindException exception, HttpServletRequest request) {
      Locale locale = currentLocale();
      List<FieldViolation> violations = exception.getFieldErrors()
              .stream()
              .map(error -> toFieldViolation(error, locale))
              .sorted(VIOLATION_ORDER)
              .toList();
      return ResponseEntity.badRequest()
              .body(problemFactory.createValidationProblem(
                      violations, request, locale));
  }
  ```

  Keep the existing more-specific `MethodArgumentNotValidException` handler.

- [x] **Step 3: Handle missing headers and path/query type conversion errors**

  Add a `MissingRequestHeaderException` handler using
  `exception.getHeaderName()` as the field and `VALIDATION_REQUIRED` as the
  field error. This makes an absent required `If-Match` header a controlled 400.

  Add `MethodArgumentTypeMismatchException` handling with one localized
  `VALIDATION_INVALID` field violation:

  ```java
  CommonErrorCode errorCode = CommonErrorCode.VALIDATION_INVALID;
  FieldViolation violation = new FieldViolation(
          exception.getName(),
          errorCode.value(),
          translator.translate(errorCode, NO_ARGUMENTS, locale));
  ```

  Return it through `createValidationProblem`. This covers malformed UUID and
  enum values without exposing conversion exception details.

- [x] **Step 4: Handle direct controller parameter validation**

  Add a handler for
  `org.springframework.web.method.annotation.HandlerMethodValidationException`.
  Convert each `ParameterValidationResult` to one generic invalid violation per
  resolvable error:

  ```java
  String field = result.getMethodParameter().getParameterName();
  if (field == null || field.isBlank()) {
      field = "request";
  }
  CommonErrorCode errorCode = CommonErrorCode.VALIDATION_INVALID;
  return new FieldViolation(
          field,
          errorCode.value(),
          translator.translate(errorCode, NO_ARGUMENTS, locale));
  ```

  Flatten all parameter results, sort with `VIOLATION_ORDER`, and return the
  existing validation `ProblemDetail`. Do not annotate the final controller
  with class-level `@Validated`; Spring MVC native method validation avoids the
  CGLIB-final-class problem previously encountered in this project.

- [x] **Step 5: Perform static error-boundary verification**

  Confirm the three new handlers are more specific than the catch-all handler,
  reuse localized stable error codes, never return exception messages, and do
  not alter current domain/authentication mappings. Do not invoke endpoints.

### Task 6: Add the REST Boundary and Synchronize the API Reference

**Files:**

- Create:
  `crm/src/main/java/com/crm/customer/account/presentation/web/CreateAccountRequest.java`
- Create:
  `crm/src/main/java/com/crm/customer/account/presentation/web/UpdateAccountRequest.java`
- Create:
  `crm/src/main/java/com/crm/customer/account/presentation/web/AccountSearchRequest.java`
- Create:
  `crm/src/main/java/com/crm/customer/account/presentation/web/AccountResponse.java`
- Create:
  `crm/src/main/java/com/crm/customer/account/presentation/web/AccountSummaryResponse.java`
- Create:
  `crm/src/main/java/com/crm/customer/account/presentation/web/AccountWebMapper.java`
- Create:
  `crm/src/main/java/com/crm/customer/account/presentation/web/AccountController.java`
- Modify: `docs/api-reference.md`
- Inspect only:
  `crm/src/main/java/com/crm/identity/infrastructure/config/IdentitySecurityConfiguration.java`

**Interfaces:**

- Consumes Task 2 `AccountFacade`, command/query/output types, and existing
  `CrmMapperConfig`.
- Produces the five approved `/api/accounts` endpoints and documented JSON
  contract.

- [x] **Step 1: Add create and update requests with nested typed values**

  Use these field validations in both records:

  ```java
  @NotBlank @Size(max = 191) String accountNumber       // create only
  @NotNull AccountType accountType                      // update; create nullable
  @Size(max = 255) String legalName
  @NotBlank @Size(max = 255) String displayName
  UUID parentAccountId
  @Valid Owner owner
  @NotNull AccountLifecycleStage lifecycleStage         // update; create nullable
  @Size(max = 191) String industryCode
  @Size(max = 255) String taxIdentifier
  @Size(max = 191) String registrationNumber
  String website
  @Valid Revenue annualRevenue
  @PositiveOrZero Integer employeeCount
  String description
  @Size(max = 10)
  @Pattern(regexp = "^[A-Za-z]{2,3}(-[A-Za-z0-9]{2,8})*$")
  String preferredLanguageCode
  @NotNull Boolean doNotContact                         // update; create nullable
  @NotNull @Positive Long version                       // update only
  ```

  Each request defines its own nested records so request validation is not
  coupled to response types:

  ```java
  public record Owner(
          @NotNull AccountOwnerType type,
          @NotNull UUID id) {
  }

  public record Revenue(
          @NotNull @PositiveOrZero
          @Digits(integer = 14, fraction = 6) BigDecimal amount,
          @Pattern(regexp = "^[A-Z]{3}$")
          String currencyCode) {
  }
  ```

  A missing currency reaches `AnnualRevenue` and produces the approved
  `422 ACCOUNT_REVENUE_CURRENCY_REQUIRED`; a present but malformed code is a
  field-level 400 validation failure.

  The create record leaves `accountType`, `lifecycleStage`, and
  `doNotContact` nullable for domain defaults. The update record does not
  contain `accountNumber` and requires all four replacement fields noted
  above.

- [x] **Step 2: Add the query-binding request**

  Implement nullable wrapper fields so absent query parameters can receive
  defaults during mapping:

  ```java
  public record AccountSearchRequest(
          @Size(max = 255) String q,
          AccountType accountType,
          AccountLifecycleStage lifecycleStage,
          AccountOwnerType ownerType,
          UUID ownerId,
          @Min(0) Integer page,
          @Min(1) @Max(100) Integer size) {

      @AssertTrue
      public boolean isOwnerFilterComplete() {
          return (ownerType == null) == (ownerId == null);
      }
  }
  ```

  Do not add JSON annotations to this query-only model; it is never serialized
  as an API response.

- [x] **Step 3: Add detail and summary response records**

  `AccountResponse` mirrors `AccountDetails` exactly and defines nested
  `Owner` and `Revenue` response records. `AccountSummaryResponse` mirrors
  `AccountSummary` and defines its own nested `Owner`; it does not depend on
  `AccountResponse` internals. Neither response includes tenant ID, source,
  custom summary, deletion data, or authorization data.

  The detail component order is:

  ```java
  UUID id,
  String accountNumber,
  AccountType accountType,
  String legalName,
  String displayName,
  UUID parentAccountId,
  Owner owner,
  AccountLifecycleStage lifecycleStage,
  String industryCode,
  String taxIdentifier,
  String registrationNumber,
  String website,
  Revenue annualRevenue,
  Integer employeeCount,
  String description,
  String preferredLanguageCode,
  boolean doNotContact,
  Instant createdAt,
  UUID createdBy,
  Instant updatedAt,
  UUID updatedBy,
  long version
  ```

- [x] **Step 4: Add the MapStruct web mapper**

  Use `@Mapper(config = CrmMapperConfig.class)` and declare exact boundary
  methods:

  ```java
  CreateAccountCommand toCreateCommand(CreateAccountRequest request);

  @Mapping(target = "accountId", source = "accountId")
  UpdateAccountCommand toUpdateCommand(
          AccountId accountId, UpdateAccountRequest request);

  AccountResponse toResponse(AccountDetails details);

  AccountSummaryResponse toSummaryResponse(AccountSummary summary);
  ```

  Add these exact type conversions so MapStruct never has to infer
  `UUID -> AccountId` or choose between the two owner response target types:

  ```java
  default AccountId toAccountId(UUID value) {
      return value == null ? null : new AccountId(value);
  }

  default AccountOwner toAccountOwner(CreateAccountRequest.Owner value) {
      return value == null ? null
              : new AccountOwner(value.type(), value.id());
  }

  default AccountOwner toAccountOwner(UpdateAccountRequest.Owner value) {
      return value == null ? null
              : new AccountOwner(value.type(), value.id());
  }

  default AnnualRevenue toAnnualRevenue(
          CreateAccountRequest.Revenue value) {
      return value == null ? null
              : new AnnualRevenue(value.amount(), value.currencyCode());
  }

  default AnnualRevenue toAnnualRevenue(
          UpdateAccountRequest.Revenue value) {
      return value == null ? null
              : new AnnualRevenue(value.amount(), value.currencyCode());
  }

  default AccountResponse.Owner toDetailOwner(AccountOwner value) {
      return value == null ? null
              : new AccountResponse.Owner(value.type(), value.id());
  }

  default AccountSummaryResponse.Owner toSummaryOwner(AccountOwner value) {
      return value == null ? null
              : new AccountSummaryResponse.Owner(value.type(), value.id());
  }

  default AccountResponse.Revenue toRevenueResponse(AnnualRevenue value) {
      return value == null ? null
              : new AccountResponse.Revenue(
                      value.amount(), value.currencyCode());
  }
  ```

  Add the normalized query and page conversions:

  ```java
  default AccountSearchQuery toSearchQuery(AccountSearchRequest request) {
      AccountOwner owner = request.ownerType() == null
              ? null
              : new AccountOwner(request.ownerType(), request.ownerId());
      int page = request.page() == null ? 0 : request.page();
      int size = request.size() == null
              ? PageQuery.DEFAULT_SIZE : request.size();
      return new AccountSearchQuery(
              request.q(), request.accountType(),
              request.lifecycleStage(), owner,
              new PageQuery(page, size));
  }

  default PageResult<AccountSummaryResponse> toSummaryPage(
          PageResult<AccountSummary> page) {
      return new PageResult<>(
              page.items().stream()
                      .map(this::toSummaryResponse)
                      .toList(),
              page.page(), page.size(),
              page.totalElements(), page.totalPages());
  }
  ```

  Do not edit generated mapper output under `target`.

- [x] **Step 5: Add strict reusable-in-file `If-Match` validation**

  Inside `AccountController`, define a public nested Bean Validation annotation
  and validator dedicated to the header. The validator accepts exactly one
  strong quoted positive signed-long value and rejects null, wildcard, weak,
  zero, negative, malformed, and overflow values:

  ```java
  @Target(ElementType.PARAMETER)
  @Retention(RetentionPolicy.RUNTIME)
  @Constraint(validatedBy = IfMatchVersionValidator.class)
  public @interface ValidIfMatchVersion {
      String message() default "{validation.invalid}";
      Class<?>[] groups() default {};
      Class<? extends Payload>[] payload() default {};
  }

  public static final class IfMatchVersionValidator
          implements ConstraintValidator<ValidIfMatchVersion, String> {
      @Override
      public boolean isValid(String value,
              ConstraintValidatorContext context) {
          if (value == null || !value.matches("^\"[1-9][0-9]*\"$")) {
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
  }
  ```

  After validation succeeds, parse by removing the first and last quote. Do not
  put `@Validated` on the final controller class; rely on Spring MVC native
  method validation and Task 5's handler.

- [x] **Step 6: Add the five Account endpoints**

  Implement a final controller with constructor injection and base mapping:

  ```java
  @RestController
  @RequestMapping("/api/accounts")
  public final class AccountController {
      private final AccountFacade accounts;
      private final AccountWebMapper mapper;
  }
  ```

  Endpoint signatures and behavior:

  ```java
  @PostMapping
  ResponseEntity<AccountResponse> create(
          @Valid @RequestBody CreateAccountRequest request)

  @GetMapping("/{id}")
  AccountResponse get(@PathVariable UUID id)

  @GetMapping
  PageResult<AccountSummaryResponse> search(
          @Valid @ModelAttribute AccountSearchRequest request)

  @PutMapping("/{id}")
  AccountResponse update(
          @PathVariable UUID id,
          @Valid @RequestBody UpdateAccountRequest request)

  @DeleteMapping("/{id}")
  ResponseEntity<Void> delete(
          @PathVariable UUID id,
          @RequestHeader("If-Match")
          @ValidIfMatchVersion String ifMatch)
  ```

  Create returns `201`. Detail/update return mapped details. Search returns the
  mapped page. Delete calls the facade with a parsed `DeleteAccountCommand` and
  returns `204`. Convert path UUIDs to `new AccountId(id)`; never accept tenant
  data in these methods.

- [x] **Step 7: Inspect security coverage without changing configuration**

  Confirm `IdentitySecurityConfiguration` leaves only the existing public auth
  and OAuth2 paths permitted and applies `.anyRequest().authenticated()` to
  `/api/accounts`. Do not add route-specific permission rules there; Account
  permission and data-scope checks belong in the application service.

- [x] **Step 8: Synchronize `docs/api-reference.md` with implemented source**

  In the same task as the controller, add Account endpoints to the endpoint
  index and an Account section documenting:

  - Bearer authentication and required `X-Tenant-ID`.
  - `crm_account.read`, `crm_account.write`, and `ACCOUNT` scope behavior.
  - All five methods, paths, success statuses, and delete `If-Match: "<version>"`.
  - Complete create/update field tables, nullable/default behavior, nested owner
    and annual-revenue shapes, validation limits, and immutable Account number.
  - Detail, summary-page, and pagination response shapes.
  - Search filters, owner pair, defaults, maximum size, and fixed ordering.
  - Soft-delete and optimistic-concurrency behavior.
  - Every stable Account/common error and status from the design.
  - Safe `curl` examples using `${ACCESS_TOKEN}`, example UUIDs, and no real
    credential, token, secret, key, connection value, or personal data.

  Document only fields and behavior present in the completed source. Do not
  document deferred Account relationships, contacts, source integration,
  custom fields, merge, numbering, events, or lifecycle state machines as
  implemented.

- [x] **Step 9: Perform static REST/documentation verification**

  Inspect DTO annotations, MapStruct source/target names, controller statuses,
  validation handler coverage, and API-reference examples. Confirm Account
  responses are mostly flat, owner/revenue alone are nested, and the API docs
  match source exactly. Do not generate MapStruct output, compile, build, start
  Spring, or call the endpoints.

### Task 7: Perform Cross-Layer Static Verification and Prepare Handoff

**Files:**

- Inspect: every file created or modified by Tasks 1-6.
- Verify unchanged: `crm/src/main/resources/application.yaml`.
- Verify unchanged: `crm/src/main/resources/keys/**`.
- Verify unchanged: `docs/crm_mysql80.sql` and other SQL files.
- Verify untouched: `.idea/**`, `target/**`, and every `crm-fe` path.

**Interfaces:**

- Produces an evidence-based static handoff without claiming build, runtime,
  database, or API success.
- Produces the exact user-run verification checklist from the approved design.

- [x] **Step 1: Inspect the scoped diff and whitespace**

  Use `rtk git status --short`, `rtk diff`, and read-only
  `git diff --check -- <owned paths>` for only the Account, global handler,
  message, API-reference, spec, and plan files. Separate pre-existing `.idea`
  and generated-source changes from Account-owned changes. Do not repair or
  revert unrelated files.

- [x] **Step 2: Verify dependency direction and type consistency**

  Use `rtk grep` to verify:

  ```text
  domain          -> sharedkernel only
  application     -> domain, sharedkernel, foundation contracts
  infrastructure  -> application/domain/foundation + Spring JDBC
  presentation    -> application/domain/sharedkernel + Spring MVC/validation
  ```

  Check every interface signature from Task 2 against its Task 3, 4, and 6
  consumer. Confirm no source imports another business context repository or
  persistence type.

- [x] **Step 3: Verify every security and persistence invariant**

  Inspect source to confirm:

  - read permission guards detail/search and write permission guards
    create/update/delete;
  - entity code is exactly `ACCOUNT`;
  - tenant and actor never come from request data;
  - data scope is applied in SQL to detail, search, parent lookup, update, and
    delete;
  - create owner rules enforce TENANT/OWN/TEAM/TEAM_TREE behavior;
  - every normal query hides soft-deleted rows;
  - Account number is immutable and active-tenant unique;
  - update/delete use the expected version and increment once;
  - insert/update omit `source_id` and `custom_summary`;
  - inaccessible resources return `ACCOUNT_NOT_FOUND` without disclosure.

- [x] **Step 4: Verify API and error synchronization**

  Compare controller, requests, responses, validation annotations,
  `AccountErrorCode`, all three message bundles, `GlobalExceptionHandler`, and
  `docs/api-reference.md`. Confirm every documented status/error/field exists
  in source and no planned-only behavior is documented as available.

- [x] **Step 5: Verify protected scope remained untouched**

  Confirm no change was made to application configuration, key material, key
  loading, SQL schema, identity behavior, generated sources, IDE state, or
  frontend files. Confirm no tests, builds, app startup, API requests, database
  calls, staging, or commits were performed.

- [x] **Step 6: Hand runtime verification to the user**

  State explicitly that only static inspection was performed. Ask the user to
  verify these scenarios with their environment:

  1. create with user owner, team owner, and authorized unassigned owner;
  2. independent read/write permission denial;
  3. OWN, TEAM, TEAM_TREE, and TENANT visibility and mutation;
  4. cross-tenant and outside-scope non-disclosure;
  5. duplicate active Account number conflict and reuse after soft delete;
  6. stale update and delete version conflicts;
  7. soft-deleted rows absent from detail/search;
  8. owner, parent, revenue/currency, employee, language, enum, UUID,
     `If-Match`, and pagination validation;
  9. keyword/filter search, stable ordering, and page metadata;
  10. English and Vietnamese `ProblemDetail` localization.
