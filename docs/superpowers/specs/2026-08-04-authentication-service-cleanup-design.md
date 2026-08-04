# Authentication Service Cleanup Design

**Date:** 2026-08-04

**Status:** Approved
**Scope:** Identity authentication application services and stale build output

## Context

The MapStruct and package-boundary refactor moved the authentication web adapter from `identity.infrastructure.web` to `identity.presentation.web`. IntelliJ incremental compilation retained deleted classes under `target/classes`, causing Spring to discover both controller versions. The stale bytecode has been removed, and source inspection now finds only the presentation controller.

The live source audit found no unreferenced MapStruct mapper, DTO, application port, or security adapter. The remaining maintainability issue is `AuthenticationApplicationService`: it coordinates user registration and login while also implementing refresh-session lifecycle, access-token issuance, audit-event construction, and HTTP metadata sanitization.

## Decision

Use a balanced Pragmatic DDD cleanup:

- Keep `AuthenticationFacade` as the stable inbound application contract.
- Keep existing request commands, application DTOs, MapStruct mappings, and outbound ports.
- Keep `AuthenticationApplicationService` responsible for local registration/login, external login, and current-identity queries.
- Extract refresh-session creation, token issuance, rotation, reuse detection, and logout revocation into `AuthenticationSessionService`.
- Extract authentication-event construction and request metadata sanitization into `AuthenticationAuditRecorder`.
- Delete the extracted methods and constants from `AuthenticationApplicationService` instead of duplicating them.
- Preserve all HTTP endpoints, cookies, JWT claims, database statements, error codes, transaction semantics, and response payloads.

## Responsibilities

### AuthenticationApplicationService

- Normalize email addresses.
- Register local users and create password credentials.
- Validate local password login and lockout rules.
- Link or create external identities.
- Return the current active user and tenant memberships.
- Delegate successful token issuance, refresh, and logout to the session service.
- Delegate audit-event recording to the audit recorder.

### AuthenticationSessionService

- Create refresh sessions and access tokens after successful authentication.
- Parse and rotate refresh tokens.
- Detect refresh-token reuse and revoke affected sessions.
- Revoke a valid session during logout.
- Own session-specific transaction boundaries.

### AuthenticationAuditRecorder

- Own authentication event names, provider names, and failure codes.
- Generate event identifiers.
- Sanitize and truncate IP address and user-agent metadata.
- Persist semantic register, login, refresh, revocation, logout, and external-identity events through `IdentityRepository`.

## Transaction Policy

- Registration, local login, external login, and current-identity query retain their current transaction annotations on `AuthenticationApplicationService`.
- Refresh moves with its `noRollbackFor = CodedAuthenticationException.class` boundary to `AuthenticationSessionService`, preserving reuse-detection audit and revocation updates.
- Logout moves with its transaction boundary to `AuthenticationSessionService`.
- Successful session issuance joins the caller's existing registration/login transaction.

## Deletion Policy

- Delete only source methods, constants, imports, and generated artifacts proven obsolete by references or extraction.
- Do not collapse application ports into Spring infrastructure types merely to reduce file count.
- Do not delete DTO mapping methods called indirectly by generated MapStruct code.
- Do not remove schema-facing fields solely because the first API does not expose them yet.

## Verification

Repository rules prohibit tests, builds, application startup, and API calls. Verification is limited to:

- Source reference scans for deleted methods and stale package names.
- Application/domain dependency-direction scans.
- Confirmation that no stale infrastructure controller remains after build-output cleanup.
- Scoped `git diff --check`.
