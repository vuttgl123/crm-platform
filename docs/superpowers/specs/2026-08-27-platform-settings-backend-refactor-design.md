# Platform Settings Backend Refactor Design

**Status:** Approved
**Date:** 2026-08-27
**Scope:** Internal structure of the `com.crm.platform.settings` Java module. Backend only.

## 1. Context

The `com.crm.platform.settings` module was added in a single pass. It serves the
`/app/platform/settings` screen through 46 endpoints across five controllers and
persists every section as a JSON document in the `platform_tenant_settings`
key-value table.

The module works, and `docs/api-reference.md` already documents all of its
endpoints. Its problems are structural rather than functional:

- `TenantSettingsApplicationService` is 935 lines and implements a single
  `TenantSettingsFacade` interface of 46 methods covering eight unrelated
  concerns: tenant profile, localization, security policy, automation,
  notifications, document sequences, storage, and backup.
- All five controllers return `application.dto.*Dto` records directly as HTTP
  response bodies. Every other module in the repository (`platform/access`,
  `platform/team`, `platform/membership`) maps application DTOs to
  `presentation/web/*Response` records through a `*WebMapper`. The current
  design locks the public HTTP contract to internal application types, so any
  future DTO change silently becomes a breaking API change with no compiler
  signal.
- JSON serialization lives in the application layer
  (`loadSettingJson`, `saveSettingJson`, a static `ObjectMapper`). The
  established precedent in this repository places JSON codec work in
  infrastructure: `JdbcImportJobRepository` and `ImportJobJdbcMapper` both hold
  their own `static final ObjectMapper` inside `infrastructure/persistence`.
- Request records live in `presentation/web/request/`, whereas every other
  module keeps them flat in `presentation/web/`.
- `TenantAutomationSettingsController` constructs `LeadRoutingRuleDto`
  instances inline (lines 54–87) and passes them to the facade, because
  `addLeadRoutingRule` and `updateLeadRoutingRule` accept a DTO instead of a
  command. Every other write path in the module uses a `*Command` record.

## 2. Goals

- Split `TenantSettingsApplicationService` into one service per concern,
  following the facade-plus-service pairing already used by `platform/access`.
- Introduce a `presentation/web` response layer so the HTTP contract no longer
  depends on application DTO types.
- Move JSON serialization out of the application layer and behind the
  repository port.
- Align the module with repository-wide conventions for request record
  placement and command-based write APIs.
- Keep the serialized JSON of every endpoint byte-identical, so that
  `crm-fe/src/services/api/tenantSettingsApi.ts` and
  `crm-fe/src/features/platform/settings/TenantSettingsPage.tsx` require no
  changes.
- Mark every endpoint that currently returns placeholder data, in code and in
  `docs/api-reference.md`.

## 3. Non-goals

- Any frontend change. `TenantSettingsPage.tsx` is 1036 lines and should be
  decomposed, but that is a separate piece of work.
- Implementing real data behind the placeholder endpoints (active sessions,
  session revocation, storage usage, backup, notification ping test). These
  stay as they are, marked.
- Changing any URL, HTTP method, status code, permission requirement, or JSON
  field name.
- Database schema changes.
- Fixing the secondary defects listed in section 9, except where a fix is a
  direct consequence of the refactor.

## 4. Target structure

### 4.1 Application layer: eight facade and service pairs

Each facade is an interface in `application/usecase`, implemented by a service
in `application/service`, matching `RoleManagementFacade` /
`RoleManagementApplicationService` in `platform/access`.

| Facade | Methods | Backing controller |
| --- | --- | --- |
| `TenantProfileFacade` | `getProfile`, `updateProfile`, `updateLogo`, `resetLogo`, `getBillingInfo`, `updateBillingInfo` | `TenantSettingsController` |
| `TenantLocalizationFacade` | `getLocalization`, `updateLocalization`, `listCurrencies`, `addCurrency`, `updateCurrencyRate`, `deleteCurrency`, `getBusinessHours`, `updateBusinessHours` | `TenantSettingsController` |
| `TenantSecurityPolicyFacade` | `getSecuritySettings`, `updateSecuritySettings`, `listIpWhitelistRules`, `addIpWhitelistRule`, `deleteIpWhitelistRule`, `listActiveSessions`, `revokeAllSessions`, `revokeSession`, `getPasswordPolicy`, `updatePasswordPolicy` | `TenantSecuritySettingsController` |
| `TenantAutomationFacade` | `getAutomationSettings`, `updateAutomationSettings`, `listLeadRoutingRules`, `addLeadRoutingRule`, `updateLeadRoutingRule`, `deleteLeadRoutingRule`, `getAlertRules`, `updateAlertRules` | `TenantAutomationSettingsController` |
| `TenantNotificationFacade` | `getNotificationSettings`, `updateNotificationSettings`, `testNotificationPing`, `getDigestSchedule`, `updateDigestSchedule` | `TenantSettingsController` |
| `DocumentSequenceFacade` | `listDocumentSequences`, `getDocumentSequence`, `updateDocumentSequence`, `resetDocumentSequence` | `TenantSequenceSettingsController` |
| `TenantStorageFacade` | `getStorageUsage`, `triggerBackup`, `listBackupHistory` | `TenantStorageSettingsController` |
| `TenantSettingsOverviewFacade` | `getConsolidatedSettings`, `patchConsolidatedSettings` | `TenantSettingsController` |

`TenantSettingsFacade` and `TenantSettingsApplicationService` are deleted once
all methods have moved.

### 4.2 Composition and authorization of the consolidated endpoints

`TenantSettingsOverviewFacade` composes the first five facades rather than
reading the repository directly. This keeps `GET /platform/settings` and the
per-section `GET` endpoints permanently consistent, because both read through
the same code path.

Composition raises an authorization question that the current implementation
gets wrong and that the split must resolve explicitly.

`patchConsolidatedSettings` today authorizes `PLATFORM_SETTINGS_MANAGE` once,
then calls its own public methods, each of which re-runs `authorize(...)`.
Two of those, `updateSecuritySettings` and `updatePasswordPolicy`, require
`PLATFORM_SECURITY_MANAGE`. An actor holding `platform_settings.manage` but not
`platform_security.manage` who submits a PATCH containing a `security` block is
therefore rejected only after the profile and localization blocks have been
written. The method is `@Transactional`, so the writes roll back and no data is
corrupted, but the failure is a late 403 rather than an upfront one.

The refactor resolves this as follows:

- Each concern service exposes package-private `*Internal(AccessContext, ...)`
  methods that perform no authorization, plus the public facade methods that
  authorize and delegate to them. This mirrors the existing
  `getProfileInternal(TenantId)` helpers.
- All eight services live in the single package
  `com.crm.platform.settings.application.service`, matching how
  `RoleManagementApplicationService` and `EffectiveAccessApplicationService`
  share `com.crm.platform.access.application.service`. Package-private
  visibility therefore reaches across the concern services without any extra
  interface, while controllers — which live in `presentation.web` and depend
  only on the public facade interfaces — cannot see the unauthorized methods.
- `TenantSettingsOverviewApplicationService` depends on the seven concern
  service classes directly rather than on their facade interfaces, because the
  `*Internal` methods are not part of those interfaces.
- It computes the set of permissions the submitted patch actually requires —
  `PLATFORM_SETTINGS_MANAGE` always, plus `PLATFORM_SECURITY_MANAGE` when the
  command carries a `security` or `passwordPolicy` block — and requires all of
  them before writing anything.

This is the first of the two places where the refactor deliberately changes
observable behavior: a partially-permitted PATCH now fails before any write
instead of after a rolled-back one. The HTTP status remains 403 and the response
body shape is unchanged. The second is the serialization-failure error code in
section 5.

### 4.3 Shared components

- **`TenantSettingsAccessGuard`** (`application/service`, `@Component`).
  Replaces the `private AccessContext authorize(SystemPermission)` helper that
  44 of the 46 methods call today. The two exceptions, `resetLogo` and
  `updateCurrencyRate`, delegate to `updateLogo` and `addCurrency` respectively
  and are authorized there; both delegations stay inside a single concern
  service after the split, so neither crosses a new boundary. Exposes
  `AccessContext require(SystemPermission)` and
  `AccessContext require(SystemPermission...)`. `AccessContext(TenantId, ActorId)`
  is promoted from a private nested record to a package-level record in
  `application/service`.
- **`TenantSettingsStore`** (new port in `application/port`). Replaces the
  application-level JSON helpers:
  - `<T> T read(TenantId tenantId, TenantSettingKey key, Class<T> type, T fallback)`
  - `<T> T read(TenantId tenantId, TenantSettingKey key, TypeReference<T> type, T fallback)`
  - `void write(TenantId tenantId, TenantSettingKey key, Object value, ActorId actorId)`

  Implemented by `JdbcTenantSettingsStore` in `infrastructure/persistence`,
  which owns the `static final ObjectMapper` and delegates row access to the
  existing `TenantSettingsRepository`. `TenantSettingsRepository` keeps its
  current four raw-row methods and is no longer touched by application code.
- **`TenantSettingDefaults`** (`application/service`, final class, static
  factory methods). Receives the thirteen `defaultProfile()`,
  `defaultLocalization()`, `defaultCurrencies()` and similar methods, which are
  roughly the last 200 lines of the current service.

### 4.4 Presentation layer

Eighteen response records are added to `presentation/web`, one per application
DTO, with **component names identical to the DTO they mirror** so that Jackson
produces byte-identical JSON:

`TenantProfileResponse`, `BillingInfoResponse`, `LocalizationSettingsResponse`,
`CurrencyRateResponse`, `BusinessHoursResponse`, `SecuritySettingsResponse`,
`PasswordPolicyResponse`, `IpWhitelistRuleResponse`, `ActiveSessionResponse`,
`AutomationSettingsResponse`, `LeadRoutingRuleResponse`, `AlertRulesResponse`,
`NotificationSettingsResponse`, `DigestScheduleResponse`,
`DocumentSequenceResponse`, `StorageUsageResponse`, `BackupSnapshotResponse`,
`ConsolidatedTenantSettingsResponse`.

`ConsolidatedTenantSettingsResponse` nests the other response records, not the
DTOs.

The single `TenantSettingsWebMapper` is split into three, so it does not become
a second god-class:

- `TenantSettingsWebMapper` — profile, billing, localization, currencies,
  business hours, notifications, digest, consolidated.
- `TenantSecurityWebMapper` — security settings, password policy, IP whitelist,
  active sessions.
- `TenantAutomationWebMapper` — automation settings, lead routing rules, alert
  rules.

Each gains a DTO-to-response direction alongside the existing
request-to-command direction. `DocumentSequenceResponse` and the storage
responses are mapped by `TenantSettingsWebMapper` as well; splitting further is
not worth a two-method class.

All request records move from `presentation/web/request/` up to
`presentation/web/`, and the now-empty `request` package is removed.

### 4.5 Command-based lead routing writes

Two new commands are added in `application/command`:

- `AddLeadRoutingRuleCommand(String ruleName, int priority, String conditionField, String conditionOperator, String conditionValue, UUID assignToUserId, UUID assignToTeamId, boolean active)`
- `UpdateLeadRoutingRuleCommand(UUID ruleId, String ruleName, int priority, String conditionField, String conditionOperator, String conditionValue, UUID assignToUserId, UUID assignToTeamId, boolean active)`

`TenantAutomationFacade.addLeadRoutingRule` and `updateLeadRoutingRule` take
these instead of `LeadRoutingRuleDto`. The inline DTO construction in
`TenantAutomationSettingsController` moves into `TenantAutomationWebMapper`.

### 4.6 Placeholder marking

The following return invented data or do nothing. They keep their current
behavior and are marked in two ways: a `PLACEHOLDER` Javadoc block on the facade
method stating what real source it must eventually read from, and a warning line
against each endpoint in `docs/api-reference.md` as required by `AGENTS.md`
section 5. Each stays in whichever facade owns its concern — storage and backup
in `TenantStorageFacade`, sessions in `TenantSecurityPolicyFacade`, ping test in
`TenantNotificationFacade` — rather than being collected into one class, so the
split stays driven by concern rather than by maturity.

| Location | Current behavior |
| --- | --- |
| `ConsolidatedTenantSettingsDto.tenantCode` | Hard-coded string `"ACME_CORP"` |
| `listActiveSessions` | Returns one fabricated session built from the current actor |
| `revokeAllSessions` | Empty method body |
| `revokeSession` | Empty method body |
| `testNotificationPing` | Always returns `true` |
| `getStorageUsage` | Fixed byte counts and a fixed module breakdown |
| `triggerBackup` | Fabricated snapshot with a `https://cdn.crm.com/...` URL |
| `listBackupHistory` | One fabricated historical snapshot |

`tenantCode` is the one item here that has a real source available today; it is
still left as-is to keep this refactor free of behavior change, and is recorded
in section 9 instead.

## 5. Error handling

The refactor does not introduce new error semantics, with two exceptions that
are direct consequences of moving code:

- `saveSettingJson` currently throws `new RuntimeException("Failed to serialize tenant setting: " + key, e)`.
  Moving it into `JdbcTenantSettingsStore` is the moment to replace it with the
  module's own `TenantSettingsErrorCode.INVALID_SETTING_PAYLOAD`, which is
  declared but never thrown anywhere.

  Concretely, throw `new BusinessRuleViolation(TenantSettingsErrorCode.INVALID_SETTING_PAYLOAD)`.
  `BusinessRuleViolation` has an `(ErrorCode, Object...)` constructor and
  `TenantSettingsErrorCode` already implements `ErrorCode`, so it can be passed
  directly — unlike `TeamErrorCode`, which is a plain enum and forces callers
  through the `String` overload. `GlobalExceptionHandler` and
  `ApiProblemFactory` then render it as a `ProblemDetail` with a stable
  `errorCode` and a message localized from `messageKey()`.

  This is an observable change: an unserializable payload currently surfaces as
  a generic 500, and afterwards surfaces through the standard `ProblemDetail`
  contract. It is the second and last intentional behavior change in this
  refactor, alongside the PATCH authorization ordering in section 4.2.

- **The `settings.*` message keys do not exist.** None of the nine message keys
  declared by `TenantSettingsErrorCode` are present in `messages.properties`,
  `messages_en.properties`, or `messages_vi.properties` — all three contain zero
  `settings.` entries. Wiring up `INVALID_SETTING_PAYLOAD` therefore requires
  adding `settings.invalid_payload` to all three bundles, in Vietnamese and
  English, or the localized message will not resolve. The remaining eight keys
  are added at the same time, since the cost is three lines each and leaving
  them out guarantees the same gap resurfaces when those codes are eventually
  thrown.
- `loadSettingJson` catches every exception and silently returns the default
  value. A tenant whose stored JSON has become unreadable therefore sees their
  settings revert to defaults with no trace. `JdbcTenantSettingsStore.read`
  keeps the fallback behavior — changing it would alter observable behavior —
  but logs the failure at `WARN` with tenant id and setting key.

All nine constants in `TenantSettingsErrorCode` are currently unused. Beyond
`INVALID_SETTING_PAYLOAD` above, wiring the rest up is deferred to section 9.

## 6. Contract stability

The refactor must not change a single byte of any response. The following are
the specific risks and how each is controlled:

- **Field renaming.** Every response record component must be spelled exactly
  as its DTO counterpart. `ActiveSessionDto.isCurrentSession` in particular
  serializes as `isCurrentSession`, not `currentSession`, because Java records
  use the component name verbatim; the response record must repeat the
  `isCurrentSession` name.
- **Field ordering.** Jackson emits record components in declaration order.
  Response records must declare components in the same order as the DTO.
  Ordering does not affect correctness for the frontend, but keeping it
  identical makes any accidental divergence visible in a diff of captured
  responses.
- **Null handling.** No `@JsonInclude` annotations exist today, so nulls are
  emitted. Response records must not add any.
- **Verification.** `AGENTS.md` section 4 forbids running the application to
  test. Verification is therefore a static field-by-field comparison of each
  response record against its DTO and against the TypeScript interface in
  `crm-fe/src/services/api/tenantSettingsApi.ts`, recorded as a checklist in
  the implementation plan.

## 7. File inventory

**New — 43 files**

- `application/usecase/` — 8 facade interfaces.
- `application/service/` — 8 service implementations,
  `TenantSettingsAccessGuard`, `AccessContext`, `TenantSettingDefaults`. 11 files.
- `application/port/TenantSettingsStore.java`. 1 file.
- `application/command/` — `AddLeadRoutingRuleCommand`,
  `UpdateLeadRoutingRuleCommand`. 2 files.
- `infrastructure/persistence/JdbcTenantSettingsStore.java`. 1 file.
- `presentation/web/` — 18 response records, `TenantSecurityWebMapper`,
  `TenantAutomationWebMapper`. 20 files.

**Modified**

- All five controllers: switch to their own facade, return response records.
- `TenantSettingsWebMapper`: add DTO-to-response methods, drop what moves to the
  two new mappers.
- 18 request records: move package from `presentation/web/request` to
  `presentation/web`.
- `docs/api-reference.md`: placeholder warnings only.
- `messages.properties`, `messages_en.properties`, `messages_vi.properties`: add
  the nine missing `settings.*` keys per section 5.

**Deleted**

- `application/usecase/TenantSettingsFacade.java`
- `application/service/TenantSettingsApplicationService.java`
- `presentation/web/request/` package

**Untouched**

- All 18 `application/dto` records.
- All 14 existing `application/command` records.
- `domain/` in its entirety.
- `TenantSettingsRepository`, `JdbcTenantSettingsRepository`,
  `DocumentSequenceRepository`, `JdbcDocumentSequenceRepository`,
  `IpWhitelistRepository`, `JdbcIpWhitelistRepository`.
- The entire frontend.

## 8. Sequencing

The work is ordered so the module compiles at every step.

1. Extract `AccessContext`, `TenantSettingsAccessGuard`, and
   `TenantSettingDefaults`. Point the existing service at them.
2. Add `TenantSettingsStore` and `JdbcTenantSettingsStore`. Replace the private
   JSON helpers in the existing service with store calls. Delete the static
   `ObjectMapper` from the application layer. Add the nine `settings.*` message
   keys to the three bundles, and throw `INVALID_SETTING_PAYLOAD` on
   serialization failure.
3. Move the request records up one package.
4. Add the 18 response records and the two new mappers. Switch controllers to
   return responses. At this point the application service is still monolithic
   but the HTTP contract is decoupled.
5. Split the service, one concern at a time, in this order: profile,
   localization, notifications, sequences, storage, automation, security. Each
   step moves methods out of `TenantSettingsApplicationService` into a new
   facade and service, and repoints the owning controller.
6. Build `TenantSettingsOverviewFacade` on the seven concern facades, including
   the upfront permission union from section 4.2. Delete
   `TenantSettingsFacade` and `TenantSettingsApplicationService`.
7. Introduce the two lead routing commands and move the inline DTO construction
   out of `TenantAutomationSettingsController`.
8. Add placeholder Javadoc and the `docs/api-reference.md` warnings.
9. Static verification pass per section 6.

Steps 1, 3 and 4 are mechanical and independently safe. Step 5 is the bulk of
the work. Steps 2 and 6 carry the two intentional behavior changes — the
serialization error code and the PATCH authorization ordering — and are the two
steps to review most closely.

## 9. Secondary defects found, deliberately out of scope

These were found while surveying the module. None are fixed by this refactor;
each is recorded so it is not lost.

- **`smtpPassword` is silently discarded.** `UpdateNotificationRequest` and
  `UpdateNotificationGatewaysCommand` both carry `smtpPassword`, but
  `updateNotificationSettings` builds a `NotificationSettingsDto` that has no
  password component and never persists the value. A tenant can configure
  custom SMTP host, port, and username, but the password is dropped, so custom
  SMTP cannot work. The read-side omission is correct — a secret should not be
  returned — but the write side needs a separate secret store. This is a
  functional bug, not a structural one.
- **Document sequence lookups never 404.** `getDocumentSequence(entityType)`
  invents a sequence for any string rather than throwing
  `DOCUMENT_SEQUENCE_NOT_FOUND`. `DomainResourceNotFound` is imported by the
  service but never thrown.
- **Sequence previews hard-code the current month.** `toSequenceDto` and the
  `getDocumentSequence` fallback both embed the literal `"202608"` instead of
  formatting `dateFormatPattern` against the current date, so every preview
  will read as August 2026 forever.
- **Optimistic locking is declared but unused.**
  `ConsolidatedTenantSettingsDto.version` is returned to the client and
  `SETTINGS_VERSION_CONFLICT` exists, but `patchConsolidatedSettings` accepts no
  version and performs no check. Concurrent edits from two admin sessions
  silently overwrite each other.
- **Eight of nine `TenantSettingsErrorCode` constants are unused.** After this
  refactor wires up `INVALID_SETTING_PAYLOAD`, the remaining eight still have
  zero usages, even though section 5 adds their translations. Each corresponds
  to a validation the module does not currently perform — invalid CIDR blocks,
  unknown currency codes, duplicate currencies, non-positive exchange rates —
  so wiring them up means adding the missing validation, not just the throw.
- **`deleteCurrency` on an unknown code succeeds silently** rather than raising
  `CURRENCY_NOT_SUPPORTED`.

## 10. Risks

- **Volume.** 43 new files and five rewritten controllers. The risk is
  fatigue-induced typos in the response records, which is precisely where a
  typo silently breaks the frontend. Section 6's field-by-field checklist is the
  control.
- **No test coverage.** The module has no tests, and `AGENTS.md` section 4
  forbids adding or running them in this task. Correctness rests entirely on
  static comparison. This should be stated plainly when the work is reported.
- **`AGENTS.md` section 3 forbids commits.** This document and all resulting
  changes are left uncommitted for review.
