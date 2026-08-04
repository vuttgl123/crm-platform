# Authentication Service Cleanup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Execute inline in the current session. Do not dispatch subagents. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reduce authentication service responsibilities without changing the existing authentication API or security behavior.

**Architecture:** Keep `AuthenticationFacade` as the presentation-facing contract. Extract refresh-session/token lifecycle into `AuthenticationSessionService` and authentication-event creation into `AuthenticationAuditRecorder`; keep user registration/login orchestration in `AuthenticationApplicationService`.

**Tech Stack:** Java 21, Spring Boot 4.0.7, Spring Security, Spring JDBC, MapStruct 1.6.3.

## Global Constraints

- Preserve endpoint paths, response records, cookies, JWT claims, SQL behavior, and stable error codes.
- Keep application and domain packages independent from infrastructure and presentation packages.
- Do not add unused interfaces or generic base classes.
- Do not run tests, builds, application startup, API calls, or database connections.
- Do not stage or commit files.

---

### Task 1: Extract Authentication Audit Recording

**Files:**

- Create: `crm/src/main/java/com/crm/identity/application/service/AuthenticationAuditRecorder.java`
- Modify: `crm/src/main/java/com/crm/identity/application/service/AuthenticationApplicationService.java`

**Interfaces:**

- Produces semantic methods for registration, successful login, failed login, refresh, session revocation, logout, and external-identity creation.
- Consumes `IdentityRepository`, `IdentifierGenerator`, `AuthenticationRequestMetadata`, and the current event data.

- [x] Create a focused recorder that owns event strings, failure codes, identifier generation, and metadata sanitation.
- [x] Replace direct `AuthEvent` construction in the application service with semantic recorder calls.
- [x] Delete `appendEvent`, `appendLoginFailure`, `ip`, `userAgent`, and `truncate` from the application service.

### Task 2: Extract Session and Token Lifecycle

**Files:**

- Create: `crm/src/main/java/com/crm/identity/application/service/AuthenticationSessionService.java`
- Modify: `crm/src/main/java/com/crm/identity/application/service/AuthenticationApplicationService.java`

**Interfaces:**

- Produces `issueLogin(UserAccount, String, AuthenticationRequestMetadata, Instant)`.
- Produces transactional `refresh(String, AuthenticationRequestMetadata)` and `logout(String, AuthenticationRequestMetadata)`.
- Consumes existing access-token, refresh-token, session repository, policy, time, identifier, identity repository, and audit contracts.

- [x] Move session creation and successful token issuance without changing token contents or expiry calculations.
- [x] Move refresh rotation, reuse detection, expiration revocation, and audit behavior with the existing no-rollback transaction rule.
- [x] Move logout revocation and audit behavior.
- [x] Replace facade refresh/logout bodies with direct delegation.
- [x] Delete the extracted token/session methods, imports, fields, and constants from the application service.

### Task 3: Perform Static Cleanup Verification

**Files:**

- Inspect: all Java files under `identity/application/service`.
- Inspect: `identity/application/usecase/AuthenticationFacade.java`.
- Inspect: generated-class locations under `crm/target/classes` without starting the application.

- [x] Confirm the application service no longer constructs `RefreshSession`, `IssuedTokens`, or `AuthEvent` directly.
- [x] Confirm application and domain code do not import infrastructure or presentation packages.
- [x] Confirm stale controller, service, OAuth-handler, and security-configuration bytecode is absent.
- [x] Run a scoped `git diff --check` and report that runtime verification was intentionally omitted.
