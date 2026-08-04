# Authentication MapStruct and Architecture Refactor Implementation Plan

> **For agentic workers:** Implement inline in the current session. Do not dispatch subagents. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Use generated MapStruct mappings at the HTTP boundary and align the identity module with the approved Pragmatic DDD dependency direction.

**Architecture:** The REST and OAuth2 HTTP adapters live under `identity.presentation`, depend on an application facade, and use a strict Spring MapStruct mapper for request/response conversion. The application exposes commands, results, and outbound ports; Spring Security, configuration properties, JWT, refresh-token encoding, and JDBC remain infrastructure adapters.

**Tech Stack:** Java 21, Spring Boot 4.0.7, Spring Security, MapStruct 1.6.3, Maven.

## Global Constraints

- Preserve the existing HTTP endpoints and response contract.
- Do not add a generic base controller, base service, or base mapper.
- Do not expose credentials, refresh tokens, password hashes, or key material.
- Do not run tests, builds, the application, API calls, or database connections.
- Do not stage or commit any file.

---

### Task 1: Define the application boundary

**Files:**

- Create `identity/application/command/LoginCommand.java`.
- Create `identity/application/command/RegisterCommand.java`.
- Move external login and request metadata records into `identity/application/command`.
- Move issued-token output into `identity/application/dto` and add a current-identity result.
- Create `identity/application/usecase/AuthenticationFacade.java`.

- [x] Expose register, local login, external login, refresh, logout, and current-identity operations through one intentional authentication facade.
- [x] Replace primitive request parameters with immutable command records.

### Task 2: Invert security dependencies

**Files:**

- Create `identity/application/port/PasswordHasher.java`.
- Create `identity/application/port/RefreshTokenManager.java`.
- Create `identity/application/AuthenticationPolicy.java`.
- Modify the refresh-token infrastructure adapter to implement its application port.
- Create a Spring Security password-hasher adapter.

- [x] Ensure application code no longer imports `CrmSecurityProperties`, `RefreshTokenCodec`, or Spring Security's `PasswordEncoder`.
- [x] Keep all hashing, token parsing, and configuration binding behavior unchanged.

### Task 3: Refactor the application service

**Files:**

- Create `identity/application/service/AuthenticationApplicationService.java`.
- Delete the former flat `identity/application/AuthenticationService.java` after migrating its behavior.

- [x] Implement `AuthenticationFacade` and retain command transaction boundaries.
- [x] Return one `CurrentIdentity` result so the controller does not orchestrate multiple repository queries.

### Task 4: Add generated MapStruct web mappings

**Files:**

- Create `foundation/mapping/CrmMapperConfig.java`.
- Create `identity/presentation/web/AuthenticationWebMapper.java`.
- Move authentication request/response records to `identity/presentation/web` and remove static `from(...)` factories.

- [x] Generate Spring mapper implementations with constructor injection and fail on unmapped target properties.
- [x] Map request records to application commands and application results to response records.

### Task 5: Clean the HTTP adapter boundary

**Files:**

- Move the authentication controller, refresh-token cookie, request metadata factory, and OAuth2 handlers to `identity/presentation/web`.
- Move the application security filter-chain configuration to `identity/infrastructure/config/IdentitySecurityConfiguration.java`.
- Update imports from security configuration and adapters.

- [x] Keep HTTP details out of application and domain packages.
- [x] Preserve endpoint paths, cookies, redirects, CORS, JWT resource-server behavior, and error handling.

### Task 6: Static verification

- [x] Inspect the final package tree and source imports.
- [x] Confirm the old manual DTO factories and old packages have no references.
- [x] Confirm MapStruct runtime and annotation processor remain configured in `pom.xml`.
- [x] Run `git diff --check` only; do not compile or test.
