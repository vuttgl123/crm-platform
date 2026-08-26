# Authentication Password Lifecycle Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give users a self-service route back into a locked or forgotten account, tell them when they are locked without telling an attacker anything, and rebuild the sign-in and registration screens on a shared brand token layer.

**Architecture:** Three new endpoints under `/api/auth/password/` backed by a `platform_password_reset_tokens` table that mirrors the existing `platform_auth_sessions` pattern exactly. The login check order is reversed so the password is verified before the lock is evaluated, which is what lets `ACCOUNT_LOCKED` be returned only to someone who already proved they know the password. Mail delivery sits behind a narrow `PasswordResetMailer` port with an SMTP adapter on an `@Async` boundary.

**Tech Stack:** Java 21 / Spring Boot (Spring Security, JdbcClient, `spring-boot-starter-mail`), MySQL 8.0, React 18 + TypeScript 5.7, Tailwind 3.4, `react-hook-form` + `zod`, `react-i18next`.

**Spec:** `docs/superpowers/specs/2026-08-25-auth-password-lifecycle-design.md`

## Execution status — 2026-08-25

**Backend complete: Tasks 1 to 11 are done and verified.** Nothing is committed.

| Check | Result |
|---|---|
| `./mvnw -q compile` | exit 0 |
| `./mvnw -q test-compile` | exit 0 |
| Java event types present in both SQL files | 4/4 |
| `AuthenticationErrorCode` keys in all three bundles | 12/12 |
| `mail.password_reset.*` keys in all three bundles | 5/5 |
| `/api/auth/password/change` publicly permitted | no |
| `docs/api-reference.md` updated | yes, plus the Endpoint Index |

**Frontend Tasks 14 to 18 are done. Tasks 12 and 13 were dropped by agreement.**
The whole password lifecycle now works end to end in the UI.

Tasks 12 and 13 (extracting a shared brand token layer and renaming `--lp-*` to
`--brand-*`) were dropped because their premise had gone: the landing page moved
to a dark, cyan, hard-coded-Tailwind direction, so a shared token layer would
have served only the auth screens. 369 substitutions for no benefit.

**The auth restyle is done**, and it is not the dark-and-cyan treatment this
plan anticipated. By the time the landing page settled it had become an
*editorial* system: warm stone neutrals (`#1C1917`, `#E7E5E4`, `#57534E`), a
restrained blue accent (`#1D4ED8`), Inter Tight for headings, JetBrains Mono for
labels, and dark regions reserved for a few designated blocks. The dark-cyan
palette seen earlier was a mid-refactor state, not the destination — which is
why the restyle began with a survey rather than an assumption.

The auth gateway now consumes that system:

- `auth.css` keeps every `--auth-*` name but redefines each as an alias onto
  `--ed-*`. No page needed editing; all seven `var(--auth-*)` references across
  the auth pages resolve through the alias block. Radii, shadow, and fonts come
  from `--ed-radius-*`, `--ed-shadow-product`, and `--ed-font-*`.
- `AuthBrandPanel` becomes the gateway's single dark region, matching how the
  landing page reserves `.editorial-dark-region`. All of its colours were
  rewritten as on-dark values, because the `--auth-ink` / `--auth-muted` scale
  is for light surfaces and would have been invisible.
- `PasswordStrengthMeter` was corrected the other way: it had been written with
  on-dark colours, but the form column sits on `--ed-canvas`, so its bars would
  have been nearly invisible against white.

`auth.css` declares `@import '../landing/landing.css'` so the token dependency
is explicit. `landing.css` was already loaded application-wide through
`AppRoutes`' eager import of `LandingLayout`, so this changes nothing at runtime
and the bundler de-duplicates it — but it stops the gateway from silently losing
its palette if the landing bundle is ever made lazy.

Two hard-coded Vietnamese strings in `AuthBrandPanel` were replaced with
translation keys. `verify:english-only` had not caught them: it scans for
locale artefacts, not for literal text.

### Frontend verification

| Check | Result |
|---|---|
| `npm run typecheck` errors in files this work touched | 0 |
| `npm run lint` new errors in `features/auth` or `features/profile` | 0 |
| `package.json` changed | no |
| `npm run verify:english-only` | **fails — 2 violations, both pre-existing** |

The English-only failure is in `features/landing/sections/PricingSection.tsx`
and `ProofStrip.tsx`, two files created during the landing refactor, each
carrying a hard-coded `vi-VN` locale tag. Unrelated to this work and left alone.

Typecheck also reports 27 errors across `features/landing`, all from that same
in-flight refactor, plus one unused `DemoPage` import in `AppRoutes.tsx` left
behind when the `/demo` route was removed.

### Deviation from Task 15

The plan changed `normalizeAuthError`'s return type to carry `lockedUntil`.
On inspection `ApiError` already retains the full `problemDetail`, so a separate
`extractLockedUntil(error)` helper was added instead. Four call sites stay
untouched, and `normalizeAuthError` keeps its single job. `AuthFormError` and
`AuthPageHeader` each gained an optional interpolation prop, which is what
actually lets the unlock time reach the message.

### A pre-existing defect found and fixed

`UserProfilePage` already had a full Change Password card — with a handler that
was a `setTimeout` simulating success. It reported "Password updated
successfully!" and never called any API. It is now wired to
`POST /api/auth/password/change`.

### Environment corrections found during execution

**`mvn` is not on PATH; the repository ships a Maven wrapper.** Every command
in this plan that reads `mvn` must be run as `./mvnw` from `crm/`. Java 21 is
installed at `/usr/lib/jvm/java-21-openjdk-amd64`.

**Use `./mvnw -o` (offline) for routine compiles.** An online `compile` timed
out at five minutes at least once; offline completes in seconds. Run online only
when a new dependency has to be fetched — as `spring-boot-starter-mail` did in
Task 8, and as `test-compile` does the first time.

**Never chain a Maven run into `&&` through a pipe.** `./mvnw ... | tail && echo OK`
reports the exit status of `tail`, not of Maven, and will print a success
message over a failed build. Capture `$?` directly instead.

### Design premise that no longer holds

Tasks 12 and 13 exist to share one brand palette between the landing page and
the sign-in screens, on the argument that following the sign-in link should feel
continuous. Since the plan was written, the landing page has been taken in a
dark, cyan, monospaced direction using hard-coded Tailwind colours rather than
tokens. **That argument no longer applies, and Tasks 12 and 13 should be
re-decided with the user before being executed.** They are severable: Tasks 14
to 19 depend on the token names only, and can use the existing `--auth-*` scale
instead.

## Global Constraints

- **Never create a git commit.** `AGENTS.md` §3 forbids commits, pushes, branches, PRs, and staging. Every task ends with an uncommitted working tree. This overrides the writing-plans skill's default commit step.
- **Never run tests and never start the application.** `AGENTS.md` §4. The user has authorised exactly these commands for this work:
  - Frontend, from `crm-fe/`: `npm run typecheck`, `npm run lint`, `npm run verify:english-only`
  - Backend, from `crm/`: `mvn -q compile`, `mvn -q test-compile`
  - Out of bounds: `npm run build`, `npm run dev`, `mvn verify`, `mvn test`, and starting either application.
- **`npm run lint` is red at baseline** — 293 errors repo-wide, none in `src/features/`auth or `landing` after the preceding landing work. The gate is *no new error in a file this plan touches*, never "lint passes". Check with `npm run lint 2>&1 | grep -A5 "features/auth"`.
- **ESLint `no-undef` fires on TypeScript type names.** `eslint.config.js` lists browser globals by hand. Any new frontend file referencing a type not in that list needs a `/* global ... */` directive, matching the convention already in `AnimatedCounter.tsx` and `LandingHeader.tsx`.
- **No new frontend dependency.** In particular no `zxcvbn`: over 400KB gzipped for a four-level strength bar.
- **`spring-boot-starter-mail` is the only new backend dependency.**
- **Frontend interface copy is English only and goes through `react-i18next`.** `npm run verify:english-only` must keep passing.
- **The backend is bilingual, unlike the frontend.** `src/main/resources/messages.properties`, `messages_en.properties`, and `messages_vi.properties` each carry eight `auth.*` keys today. Every new error code and all mail copy needs an entry in **all three**.
- **`docs/api-reference.md` must be updated in the same work** — `AGENTS.md` §5, for every API addition or behaviour change.
- **Do not touch `application.yaml`'s OAuth2 credentials.** They contain a live Google client secret; rotating it is a separate concern raised with the user and explicitly out of scope here.
- Backend paths are relative to `crm/src/main/java/com/crm/`; frontend paths to `crm-fe/src/`.

### Corrections to the spec, found while planning

**1. `CodedAuthenticationException` is `final`.** The spec (§4.5) says
`AccountLockedException extends CodedAuthenticationException`. That does not
compile. `foundation/security/CodedAuthenticationException.java` is declared
`public final class`.

The fix follows a pattern already in the codebase:
`GlobalExceptionHandler` registers both a general
`@ExceptionHandler(AuthenticationException.class)` (line 183) and a specific
`@ExceptionHandler(CodedAuthenticationException.class)` (line 192), relying on
Spring picking the most specific match. `AccountLockedException` therefore
extends Spring Security's `AuthenticationException` directly, carries its own
`ErrorCode` and `Instant lockedUntil`, and gets its own handler. Nothing about
the existing `final` class changes.

**2. `ApiProblemFactory` already has a message-arguments overload.**
`create(HttpStatus, ErrorCode, Object[] messageArguments, HttpServletRequest, Locale)`
exists at `ApiProblemFactory.java:33`. The `ACCOUNT_LOCKED` handler uses the
plain four-argument overload and then attaches `lockedUntil` with
`setProperty`, because the spec requires the timestamp to travel as structured
data that the frontend formats — not as a server-rendered sentence.

---

## Task 1: Schema — reset-token table and audit-event constraint

**Files:**
- Modify: `docs/crm_mysql80_auth.sql`
- Create: `docs/migrations/2026-08-25-auth-password-lifecycle.sql`

**Interfaces:**
- Consumes: nothing.
- Produces: table `platform_password_reset_tokens`; four new legal values in `platform_auth_events.event_type`.

- [ ] **Step 1: Record the current constraint**

```bash
cd /mnt/d/code/crm
grep -A6 "event_type VARCHAR(32) NOT NULL" docs/crm_mysql80_auth.sql
```

Expected: a `CHECK (event_type IN (...))` listing exactly seven values —
`REGISTER`, `LOGIN_SUCCESS`, `LOGIN_FAILURE`, `REFRESH`, `LOGOUT`,
`SESSION_REVOKED`, `EXTERNAL_IDENTITY_CREATED`. Writing any other value fails at
runtime, and nothing in the Java build detects it.

- [ ] **Step 2: Extend the constraint in `docs/crm_mysql80_auth.sql`**

Replace the `CHECK (event_type IN (...))` list with:

```sql
        CHECK (event_type IN (
            'REGISTER', 'LOGIN_SUCCESS', 'LOGIN_FAILURE',
            'REFRESH', 'LOGOUT', 'SESSION_REVOKED',
            'EXTERNAL_IDENTITY_CREATED',
            'PASSWORD_RESET_REQUESTED', 'PASSWORD_RESET_COMPLETED',
            'PASSWORD_CHANGED', 'LOGIN_BLOCKED_LOCKED'
        )),
```

- [ ] **Step 3: Add the reset-token table to `docs/crm_mysql80_auth.sql`**

Append after the `platform_auth_sessions` definition:

```sql
CREATE TABLE platform_password_reset_tokens (
    id CHAR(36) PRIMARY KEY,
    user_id CHAR(36) NOT NULL,
    token_hash CHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
    issued_at DATETIME(6) NOT NULL,
    expires_at DATETIME(6) NOT NULL,
    consumed_at DATETIME(6),
    invalidated_at DATETIME(6),
    invalidate_reason VARCHAR(64),
    requested_ip VARCHAR(45),
    requested_user_agent VARCHAR(512),
    FOREIGN KEY (user_id) REFERENCES platform_users(id) ON DELETE CASCADE,
    CONSTRAINT uq_password_reset_token_hash UNIQUE (token_hash),
    CHECK (expires_at > issued_at),
    CHECK (invalidated_at IS NULL OR invalidate_reason IS NOT NULL),
    CHECK (consumed_at IS NULL OR invalidated_at IS NULL)
) ENGINE=InnoDB;

CREATE INDEX idx_password_reset_user_active
    ON platform_password_reset_tokens (user_id, consumed_at, expires_at);
```

- [ ] **Step 4: Create the migration for existing databases**

The project has no Flyway or Liquibase. Editing the `CREATE TABLE` above helps
only a fresh install; **an existing database keeps the old constraint and will
reject every new event type.** Create
`docs/migrations/2026-08-25-auth-password-lifecycle.sql`:

```sql
-- Auth password lifecycle: reset tokens and new audit event types.
-- Apply to databases created before 2026-08-25.
-- MySQL 8.0. Run inside a maintenance window; both statements are DDL and
-- cannot be rolled back inside a transaction.

ALTER TABLE platform_auth_events
    DROP CHECK platform_auth_events_chk_1;

ALTER TABLE platform_auth_events
    ADD CONSTRAINT chk_auth_events_event_type CHECK (event_type IN (
        'REGISTER', 'LOGIN_SUCCESS', 'LOGIN_FAILURE',
        'REFRESH', 'LOGOUT', 'SESSION_REVOKED',
        'EXTERNAL_IDENTITY_CREATED',
        'PASSWORD_RESET_REQUESTED', 'PASSWORD_RESET_COMPLETED',
        'PASSWORD_CHANGED', 'LOGIN_BLOCKED_LOCKED'
    ));

CREATE TABLE platform_password_reset_tokens (
    id CHAR(36) PRIMARY KEY,
    user_id CHAR(36) NOT NULL,
    token_hash CHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
    issued_at DATETIME(6) NOT NULL,
    expires_at DATETIME(6) NOT NULL,
    consumed_at DATETIME(6),
    invalidated_at DATETIME(6),
    invalidate_reason VARCHAR(64),
    requested_ip VARCHAR(45),
    requested_user_agent VARCHAR(512),
    FOREIGN KEY (user_id) REFERENCES platform_users(id) ON DELETE CASCADE,
    CONSTRAINT uq_password_reset_token_hash UNIQUE (token_hash),
    CHECK (expires_at > issued_at),
    CHECK (invalidated_at IS NULL OR invalidate_reason IS NOT NULL),
    CHECK (consumed_at IS NULL OR invalidated_at IS NULL)
) ENGINE=InnoDB;

CREATE INDEX idx_password_reset_user_active
    ON platform_password_reset_tokens (user_id, consumed_at, expires_at);
```

The `DROP CHECK` names MySQL's auto-generated constraint identifier. Verify it
against the target database first with:

```sql
SELECT CONSTRAINT_NAME FROM information_schema.CHECK_CONSTRAINTS
WHERE CONSTRAINT_SCHEMA = DATABASE()
  AND TABLE_NAME = 'platform_auth_events';
```

If the name differs, edit the migration to match. Record this in the file as a
comment when applying.

- [ ] **Step 5: Verify both files agree**

```bash
cd /mnt/d/code/crm
for f in docs/crm_mysql80_auth.sql docs/migrations/2026-08-25-auth-password-lifecycle.sql; do
  echo "--- $f"
  grep -o "'[A-Z_]*'" "$f" | grep -E "PASSWORD_RESET|PASSWORD_CHANGED|LOGIN_BLOCKED" | sort -u
done
```

Expected: both print the same four values. Nothing else in the build compares
these two files, so this grep is the only guard against them drifting.

- [ ] **Step 6: Checkpoint — do not commit**

---

## Task 2: Error codes and message bundles

**Files:**
- Modify: `identity/domain/AuthenticationErrorCode.java`
- Modify: `crm/src/main/resources/messages.properties`
- Modify: `crm/src/main/resources/messages_en.properties`
- Modify: `crm/src/main/resources/messages_vi.properties`

**Interfaces:**
- Consumes: nothing.
- Produces: `AuthenticationErrorCode.ACCOUNT_LOCKED`, `.PASSWORD_RESET_TOKEN_INVALID`, `.PASSWORD_RESET_TOKEN_EXPIRED`, `.WEAK_PASSWORD`, each with a `messageKey()` resolvable in all three bundles.

- [ ] **Step 1: Record the current state**

```bash
cd /mnt/d/code/crm/crm
grep -c "^auth\." src/main/resources/messages.properties \
  src/main/resources/messages_en.properties \
  src/main/resources/messages_vi.properties
```

Expected: `8` for each. It must read `12` for each by Step 5.

- [ ] **Step 2: Add the four constants**

In `identity/domain/AuthenticationErrorCode.java`, add after `OAUTH2_LOGIN_FAILED`:

```java
	ACCOUNT_LOCKED("ACCOUNT_LOCKED", "auth.account_locked"),
	PASSWORD_RESET_TOKEN_INVALID("PASSWORD_RESET_TOKEN_INVALID",
			"auth.password_reset_token_invalid"),
	PASSWORD_RESET_TOKEN_EXPIRED("PASSWORD_RESET_TOKEN_EXPIRED",
			"auth.password_reset_token_expired"),
	WEAK_PASSWORD("WEAK_PASSWORD", "auth.weak_password");
```

Change the semicolon after `OAUTH2_LOGIN_FAILED(...)` to a comma.

- [ ] **Step 3: Add the English and default bundles**

Append to **both** `messages.properties` and `messages_en.properties`:

```properties
auth.account_locked=Your account is temporarily locked after too many failed sign-in attempts
auth.password_reset_token_invalid=This password reset link is not valid
auth.password_reset_token_expired=This password reset link has expired
auth.weak_password=Choose a stronger password
mail.password_reset.subject=Reset your VUM CRM password
mail.password_reset.greeting=Hello {0},
mail.password_reset.body=We received a request to reset the password for your VUM CRM account. This link expires in {0} minutes.
mail.password_reset.action=Reset password
mail.password_reset.ignore=If you did not request this, no action is needed and your password stays unchanged.
```

- [ ] **Step 4: Add the Vietnamese bundle**

Append to `messages_vi.properties`:

```properties
auth.account_locked=Tài khoản của bạn tạm thời bị khóa do đăng nhập sai quá nhiều lần
auth.password_reset_token_invalid=Liên kết đặt lại mật khẩu không hợp lệ
auth.password_reset_token_expired=Liên kết đặt lại mật khẩu đã hết hạn
auth.weak_password=Vui lòng chọn mật khẩu mạnh hơn
mail.password_reset.subject=Đặt lại mật khẩu VUM CRM
mail.password_reset.greeting=Xin chào {0},
mail.password_reset.body=Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản VUM CRM của bạn. Liên kết này hết hạn sau {0} phút.
mail.password_reset.action=Đặt lại mật khẩu
mail.password_reset.ignore=Nếu bạn không yêu cầu, hãy bỏ qua email này; mật khẩu của bạn không thay đổi.
```

This file is backend message content, not frontend interface copy, so the
English-only rule does not apply. `scripts/check-english-only.mjs` scans
`crm-fe/src` and will not see it.

- [ ] **Step 5: Verify every messageKey resolves in all three bundles**

```bash
cd /mnt/d/code/crm/crm
for k in auth.account_locked auth.password_reset_token_invalid \
         auth.password_reset_token_expired auth.weak_password; do
  n=$(grep -l "^$k=" src/main/resources/messages.properties \
        src/main/resources/messages_en.properties \
        src/main/resources/messages_vi.properties | wc -l)
  [ "$n" -eq 3 ] && echo "ok  $k" || echo "MISSING ($n/3) $k"
done
```

Expected: four `ok` lines. A missing key compiles and lints cleanly, then
surfaces to the user as a raw key string instead of a message.

- [ ] **Step 6: Compile**

```bash
cd /mnt/d/code/crm/crm && mvn -q compile
```

Expected: success, no output.

- [ ] **Step 7: Checkpoint — do not commit**

---

## Task 3: `AccountLockedException` and its handler

**Files:**
- Create: `foundation/security/AccountLockedException.java`
- Modify: `foundation/web/error/GlobalExceptionHandler.java`

**Interfaces:**
- Consumes: `AuthenticationErrorCode.ACCOUNT_LOCKED` from Task 2.
- Produces: `AccountLockedException(Instant lockedUntil)` with accessors `errorCode(): ErrorCode` and `lockedUntil(): Instant`. Responses carry `lockedUntil` as an ISO-8601 string property on the `ProblemDetail`.

- [ ] **Step 1: Confirm why this cannot extend `CodedAuthenticationException`**

```bash
cd /mnt/d/code/crm/crm
grep -n "public final class CodedAuthenticationException" \
  src/main/java/com/crm/foundation/security/CodedAuthenticationException.java
```

Expected: a match. The class is `final`, so the spec's wording
"extends CodedAuthenticationException" is not implementable. Extending Spring
Security's `AuthenticationException` directly mirrors what
`CodedAuthenticationException` itself does.

- [ ] **Step 2: Create the exception**

```java
package com.crm.foundation.security;

import java.time.Instant;
import java.util.Objects;

import com.crm.sharedkernel.domain.exception.ErrorCode;
import org.springframework.security.core.AuthenticationException;

/**
 * Raised when the supplied password is correct but the account is locked.
 *
 * This is never raised for a wrong password: an attacker guessing always
 * receives INVALID_CREDENTIALS and learns nothing about whether the account
 * exists or is locked.
 */
public final class AccountLockedException extends AuthenticationException {

	private final ErrorCode errorCode;

	private final Instant lockedUntil;

	public AccountLockedException(ErrorCode errorCode, Instant lockedUntil) {
		super(Objects.requireNonNull(errorCode,
				"errorCode must not be null").value());
		this.errorCode = errorCode;
		this.lockedUntil = Objects.requireNonNull(lockedUntil,
				"lockedUntil must not be null");
	}

	public ErrorCode errorCode() {
		return errorCode;
	}

	public Instant lockedUntil() {
		return lockedUntil;
	}

}
```

- [ ] **Step 3: Register the handler**

In `foundation/web/error/GlobalExceptionHandler.java`, add the import:

```java
import com.crm.foundation.security.AccountLockedException;
```

and insert this handler immediately before the existing
`@ExceptionHandler(CodedAuthenticationException.class)` method at line 192:

```java
	@ExceptionHandler(AccountLockedException.class)
	public ResponseEntity<ProblemDetail> handleAccountLocked(
			AccountLockedException exception, HttpServletRequest request) {
		ProblemDetail problem = problemFactory.create(HttpStatus.UNAUTHORIZED,
				exception.errorCode(), request, currentLocale());
		// Structured, not baked into the message: only the frontend knows the
		// viewer's timezone and display language.
		problem.setProperty("lockedUntil", exception.lockedUntil().toString());
		return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(problem);
	}
```

Spring resolves the most specific `@ExceptionHandler`, so this wins over the
general `AuthenticationException` handler at line 183 without any ordering
annotation.

- [ ] **Step 4: Compile**

```bash
cd /mnt/d/code/crm/crm && mvn -q compile
```

Expected: success.

- [ ] **Step 5: Checkpoint — do not commit**

---

## Task 4: Reorder the login checks

This is the smallest change in the plan and the one that closes spec defect 1.2.

**Files:**
- Modify: `identity/application/service/AuthenticationApplicationService.java:95-133`

**Interfaces:**
- Consumes: `AccountLockedException` from Task 3; `AuthenticationErrorCode.ACCOUNT_LOCKED` from Task 2.
- Produces: `login` may now throw `AccountLockedException`.

- [ ] **Step 1: Record the current order**

```bash
cd /mnt/d/code/crm/crm
sed -n '95,131p' src/main/java/com/crm/identity/application/service/AuthenticationApplicationService.java
```

Expected: the lock check `!user.permitsPasswordAuthenticationAt(now)` appears
**before** the password comparison, and both throw `invalidCredentials()`. That
ordering is why a locked user cannot be distinguished from a wrong password.

- [ ] **Step 2: Replace the body of the three checks**

Replace the block that currently runs from
`if (!user.permitsPasswordAuthenticationAt(now)) {` through the closing brace of
`if (!passwordHasher.matches(command.password(), user.passwordHash())) {` with:

```java
		// The password is verified first so that ACCOUNT_LOCKED can be
		// returned only to a caller who has proved they know it. Verifying
		// always, for any existing account, also makes response timing more
		// uniform than the previous ordering.
		boolean passwordMatches = passwordHasher.matches(
				command.password(), user.passwordHash());
		boolean locked = !user.permitsPasswordAuthenticationAt(now);

		if (!passwordMatches) {
			if (locked) {
				// Do not extend an existing lock: the counter stays put,
				// matching the behaviour before this change.
				auditRecorder.recordLoginFailure(
						user.id(), normalizedEmail, metadata, now);
			}
			else {
				recordFailedLogin(user, normalizedEmail, metadata, now);
			}
			throw invalidCredentials();
		}

		if (locked) {
			auditRecorder.recordLoginBlockedByLock(
					user.id(), normalizedEmail, metadata, now);
			throw new AccountLockedException(
					AuthenticationErrorCode.ACCOUNT_LOCKED,
					user.lockedUntil());
		}
```

`user.lockedUntil()` is a record accessor on `UserAccount` (declared at
`identity/domain/UserAccount.java:14`) and is non-null whenever
`permitsPasswordAuthenticationAt` returns false for lock reasons.

Add the import:

```java
import com.crm.foundation.security.AccountLockedException;
```

- [ ] **Step 3: Add the audit method**

In `identity/application/service/AuthenticationAuditRecorder.java`, add a method
alongside `recordLoginFailure` with the same shape, writing event type
`LOGIN_BLOCKED_LOCKED` and failure code `ACCOUNT_LOCKED`:

```java
	public void recordLoginBlockedByLock(UUID userId, String email,
			AuthenticationRequestMetadata metadata, Instant occurredAt) {
		append(userId, null, "LOGIN_BLOCKED_LOCKED", LOCAL_PROVIDER, false,
				email, AuthenticationErrorCode.ACCOUNT_LOCKED.value(),
				metadata, occurredAt);
	}
```

Read `recordLoginFailure` in that file first and match its exact private-helper
name and parameter order; the call above assumes a private `append(...)` helper.
If the class writes `AuthEvent` records inline instead, copy that shape rather
than introducing a helper.

- [ ] **Step 4: Verify the event type is legal in the schema**

```bash
cd /mnt/d/code/crm
grep -c "LOGIN_BLOCKED_LOCKED" docs/crm_mysql80_auth.sql \
  docs/migrations/2026-08-25-auth-password-lifecycle.sql
```

Expected: `1` for each. Task 1 must be complete or every locked-account sign-in
attempt will fail on the `CHECK` constraint at runtime.

- [ ] **Step 5: Compile**

```bash
cd /mnt/d/code/crm/crm && mvn -q compile
```

Expected: success.

- [ ] **Step 6: Checkpoint — do not commit**

---

## Task 5: `PasswordPolicy` domain service

**Files:**
- Create: `identity/domain/PasswordPolicy.java`
- Create: `identity/domain/PasswordPolicyViolation.java`

**Interfaces:**
- Consumes: `AuthenticationErrorCode.WEAK_PASSWORD` from Task 2.
- Produces:
  - `PasswordPolicy.validate(String password, String email, String displayName)` — returns `Optional<PasswordPolicyViolation>`, empty when acceptable.
  - `PasswordPolicyViolation` — enum `TOO_SHORT`, `TOO_LONG`, `COMMON`, `CONTAINS_IDENTITY`.
  - `PasswordPolicy.MIN_LENGTH = 12`, `MAX_LENGTH = 128`.

- [ ] **Step 1: Confirm the existing length rule agrees on both sides**

```bash
cd /mnt/d/code/crm
grep -n "min = 12" crm/src/main/java/com/crm/identity/presentation/web/RegisterRequest.java
grep -n "min(12)" crm-fe/src/features/auth/RegisterPage.tsx
```

Expected: one match each. The two already agree; this task keeps the length
rule and adds content rules around it.

- [ ] **Step 2: Create the violation enum**

```java
package com.crm.identity.domain;

public enum PasswordPolicyViolation {
	TOO_SHORT,
	TOO_LONG,
	COMMON,
	CONTAINS_IDENTITY
}
```

- [ ] **Step 3: Create the policy**

```java
package com.crm.identity.domain;

import java.util.Locale;
import java.util.Optional;
import java.util.Set;

/**
 * The single enforcement point for password strength, applied by registration,
 * reset, and change alike.
 *
 * Character-composition rules are deliberately absent. NIST SP 800-63B
 * recommends against them: requiring an uppercase letter, a digit, and a symbol
 * pushes users toward predictable shapes such as "Password1!" without adding
 * real entropy. A twelve-character floor plus a deny-list targets what real
 * attacks use, which is dictionaries rather than exhaustive search.
 */
public final class PasswordPolicy {

	public static final int MIN_LENGTH = 12;

	public static final int MAX_LENGTH = 128;

	/** The shortest identity fragment worth rejecting inside a password. */
	private static final int MIN_IDENTITY_FRAGMENT = 4;

	private static final Set<String> COMMON_PASSWORDS = Set.of(
			"password", "password1", "password123", "passw0rd",
			"123456", "1234567", "12345678", "123456789", "1234567890",
			"qwerty", "qwerty123", "qwertyuiop", "asdfghjkl",
			"letmein", "welcome", "welcome1", "welcome123",
			"admin", "admin123", "administrator", "root", "toor",
			"iloveyou", "sunshine", "princess", "dragon", "monkey",
			"football", "baseball", "superman", "batman",
			"trustno1", "changeme", "secret", "master", "shadow",
			"abc123", "abcd1234", "a1b2c3d4", "zaq12wsx", "1q2w3e4r",
			"qazwsx", "michael", "jennifer", "jordan", "hunter",
			"vumcrm", "vumcrm123", "crmadmin", "salespassword",
			"companyname", "january", "february", "december",
			"summer2025", "summer2026", "winter2025", "winter2026",
			"p@ssword", "p@ssw0rd", "passw0rd123", "test1234",
			"demo1234", "demopassword", "temporary", "temppassword");

	private PasswordPolicy() {
	}

	public static Optional<PasswordPolicyViolation> validate(
			String password, String email, String displayName) {
		if (password == null || password.length() < MIN_LENGTH) {
			return Optional.of(PasswordPolicyViolation.TOO_SHORT);
		}
		if (password.length() > MAX_LENGTH) {
			return Optional.of(PasswordPolicyViolation.TOO_LONG);
		}

		String lower = password.toLowerCase(Locale.ROOT);
		if (COMMON_PASSWORDS.contains(lower)) {
			return Optional.of(PasswordPolicyViolation.COMMON);
		}
		if (containsIdentity(lower, email, displayName)) {
			return Optional.of(PasswordPolicyViolation.CONTAINS_IDENTITY);
		}
		return Optional.empty();
	}

	private static boolean containsIdentity(String lowerPassword,
			String email, String displayName) {
		if (email != null) {
			int at = email.indexOf('@');
			String local = (at > 0 ? email.substring(0, at) : email)
					.toLowerCase(Locale.ROOT);
			if (local.length() >= MIN_IDENTITY_FRAGMENT
					&& lowerPassword.contains(local)) {
				return true;
			}
		}
		if (displayName != null) {
			for (String part : displayName.toLowerCase(Locale.ROOT).split("\\s+")) {
				if (part.length() >= MIN_IDENTITY_FRAGMENT
						&& lowerPassword.contains(part)) {
					return true;
				}
			}
		}
		return false;
	}

}
```

- [ ] **Step 4: Apply the policy to registration**

The spec requires all three flows — register, reset, and change — to share one
enforcement point. Reset and change are wired in Task 9; registration is wired
here, because otherwise `@Size(min = 12)` remains the only barrier and
`password123456` would still be accepted despite being on the deny-list.

In `identity/application/service/AuthenticationApplicationService.java`, inside
`register(...)`, immediately before the password is hashed:

```java
		PasswordPolicy.validate(command.password(), command.email(),
				command.displayName())
				.ifPresent(violation -> {
					throw new BusinessRuleViolation(
							AuthenticationErrorCode.WEAK_PASSWORD);
				});
```

Add the imports:

```java
import com.crm.identity.domain.PasswordPolicy;
import com.crm.sharedkernel.domain.exception.BusinessRuleViolation;
```

Confirm `BusinessRuleViolation` accepts an `ErrorCode` in its constructor before
writing this — `GlobalExceptionHandler` imports it from
`com.crm.sharedkernel.domain.exception`, so read that class first. If it takes a
different shape, match whatever `emailAlreadyRegistered()` already does in this
same file for `ResourceConflict`.

- [ ] **Step 5: Verify all three flows are covered**

```bash
cd /mnt/d/code/crm/crm
grep -rn "PasswordPolicy.validate" src/main/java/com/crm/identity/
```

Expected after Task 9: three call sites — one in
`AuthenticationApplicationService.register`, and two in
`PasswordResetApplicationService` (reached through its private
`enforcePolicy` helper, which counts as one occurrence used by both
`resetPassword` and `changePassword`). At the end of *this* task, expect one.

- [ ] **Step 6: Compile**

```bash
cd /mnt/d/code/crm/crm && mvn -q compile
```

Expected: success.

- [ ] **Step 7: Checkpoint — do not commit**

---

## Task 6: Token hashing helper and reset-token domain

**Files:**
- Create: `identity/infrastructure/security/TokenHashing.java`
- Create: `identity/domain/PasswordResetToken.java`
- Create: `identity/application/port/PasswordResetTokenRepository.java`
- Modify: `identity/infrastructure/security/RefreshTokenCodec.java`

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `TokenHashing.sha256Hex(String raw): String`
  - `TokenHashing.matches(String expectedHash, String actualHash): boolean`
  - `TokenHashing.generateSecret(): String` — 32 random bytes, Base64URL, no padding
  - `PasswordResetToken(UUID id, UUID userId, String tokenHash, Instant issuedAt, Instant expiresAt, Instant consumedAt, Instant invalidatedAt, String invalidateReason)`
  - `PasswordResetTokenRepository` — see Step 4.

- [ ] **Step 1: Read what is being extracted**

```bash
cd /mnt/d/code/crm/crm
sed -n '15,72p' src/main/java/com/crm/identity/infrastructure/security/RefreshTokenCodec.java
```

Note that `matches` already uses `MessageDigest.isEqual` for constant-time
comparison. That behaviour must survive the extraction unchanged — this is the
one place in the codebase where a copy-paste divergence becomes a silent
vulnerability.

- [ ] **Step 2: Create the helper**

```java
package com.crm.identity.infrastructure.security;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.HexFormat;

/**
 * Shared opaque-token hashing for refresh tokens and password reset tokens.
 *
 * Extracted rather than copied: cryptographic code is the last place a
 * duplicate is acceptable, because fixing one copy and forgetting the other
 * produces a vulnerability that nothing reports.
 */
final class TokenHashing {

	private static final int SECRET_BYTES = 32;

	private static final SecureRandom SECURE_RANDOM = new SecureRandom();

	private TokenHashing() {
	}

	static String generateSecret() {
		byte[] bytes = new byte[SECRET_BYTES];
		SECURE_RANDOM.nextBytes(bytes);
		return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
	}

	static String sha256Hex(String raw) {
		try {
			byte[] digest = MessageDigest.getInstance("SHA-256")
					.digest(raw.getBytes(StandardCharsets.UTF_8));
			return HexFormat.of().formatHex(digest);
		}
		catch (NoSuchAlgorithmException exception) {
			throw new IllegalStateException("SHA-256 is not available", exception);
		}
	}

	/** Constant-time comparison; never replace with String.equals. */
	static boolean matches(String expectedHash, String actualHash) {
		if (expectedHash == null || actualHash == null) {
			return false;
		}
		return MessageDigest.isEqual(
				expectedHash.getBytes(StandardCharsets.US_ASCII),
				actualHash.getBytes(StandardCharsets.US_ASCII));
	}

}
```

The class is package-private, so both codecs must live in
`identity.infrastructure.security`. They already do.

- [ ] **Step 3: Point `RefreshTokenCodec` at the helper**

In `RefreshTokenCodec.java`, delete its private `hash` method and its
`SecureRandom` / `SECRET_BYTES` fields, and replace the bodies:

- every `hash(rawToken)` call becomes `TokenHashing.sha256Hex(rawToken)`
- the secret generation becomes `TokenHashing.generateSecret()`
- the body of `matches` becomes
  `return TokenHashing.matches(expectedHash, actualHash);`

Remove the now-unused imports (`MessageDigest`, `NoSuchAlgorithmException`,
`SecureRandom`, `Base64`, `StandardCharsets`, `HexFormat`) — leaving them
compiles, but the codebase style is clean imports.

Behaviour must not change: the same SHA-256 hex of the same raw token, and the
same constant-time compare.

- [ ] **Step 4: Create the domain record and the port**

`identity/domain/PasswordResetToken.java`:

```java
package com.crm.identity.domain;

import java.time.Instant;
import java.util.UUID;

public record PasswordResetToken(
		UUID id,
		UUID userId,
		String tokenHash,
		Instant issuedAt,
		Instant expiresAt,
		Instant consumedAt,
		Instant invalidatedAt,
		String invalidateReason) {

	public boolean isConsumed() {
		return consumedAt != null;
	}

	public boolean isInvalidated() {
		return invalidatedAt != null;
	}

	public boolean isExpiredAt(Instant now) {
		return !expiresAt.isAfter(now);
	}

	/** Usable means: not consumed, not invalidated, and not yet expired. */
	public boolean isUsableAt(Instant now) {
		return !isConsumed() && !isInvalidated() && !isExpiredAt(now);
	}

}
```

`identity/application/port/PasswordResetTokenRepository.java`:

```java
package com.crm.identity.application.port;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import com.crm.identity.domain.PasswordResetToken;

public interface PasswordResetTokenRepository {

	void create(PasswordResetToken token, String requestedIp,
			String requestedUserAgent);

	Optional<PasswordResetToken> findByIdForUpdate(UUID tokenId);

	void markConsumed(UUID tokenId, Instant consumedAt);

	/** Invalidates every usable token for the user; used when a new one is issued. */
	void invalidateUsableForUser(UUID userId, Instant invalidatedAt,
			String reason);

	/** Tokens issued to this user at or after the given instant. */
	int countIssuedSince(UUID userId, Instant since);

}
```

- [ ] **Step 5: Compile**

```bash
cd /mnt/d/code/crm/crm && mvn -q compile
```

Expected: success. A failure here most likely means an import left behind in
`RefreshTokenCodec` — `mvn` does not fail on unused imports, so a failure
indicates a genuine reference that was removed too eagerly.

- [ ] **Step 6: Checkpoint — do not commit**

---

## Task 7: `JdbcPasswordResetTokenRepository`

**Files:**
- Create: `identity/infrastructure/persistence/JdbcPasswordResetTokenRepository.java`

**Interfaces:**
- Consumes: `PasswordResetTokenRepository` and `PasswordResetToken` from Task 6; the table from Task 1.
- Produces: a Spring `@Repository` bean implementing the port.

- [ ] **Step 1: Read the existing JDBC style**

```bash
cd /mnt/d/code/crm/crm
sed -n '1,60p' src/main/java/com/crm/identity/infrastructure/persistence/JdbcIdentityRepository.java
```

Match its conventions exactly: constructor-injected `JdbcClient`, text-block
SQL, named `:params`, `Timestamp.from(instant)` for `DATETIME(6)` columns, and
`uuid.toString()` for `CHAR(36)` columns.

- [ ] **Step 2: Create the repository**

```java
package com.crm.identity.infrastructure.persistence;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import com.crm.identity.application.port.PasswordResetTokenRepository;
import com.crm.identity.domain.PasswordResetToken;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;

@Repository
public class JdbcPasswordResetTokenRepository
		implements PasswordResetTokenRepository {

	private final JdbcClient jdbcClient;

	public JdbcPasswordResetTokenRepository(JdbcClient jdbcClient) {
		this.jdbcClient = jdbcClient;
	}

	@Override
	public void create(PasswordResetToken token, String requestedIp,
			String requestedUserAgent) {
		jdbcClient.sql("""
				INSERT INTO platform_password_reset_tokens
				    (id, user_id, token_hash, issued_at, expires_at,
				     requested_ip, requested_user_agent)
				VALUES
				    (:id, :userId, :tokenHash, :issuedAt, :expiresAt,
				     :requestedIp, :requestedUserAgent)
				""")
				.param("id", token.id().toString())
				.param("userId", token.userId().toString())
				.param("tokenHash", token.tokenHash())
				.param("issuedAt", Timestamp.from(token.issuedAt()))
				.param("expiresAt", Timestamp.from(token.expiresAt()))
				.param("requestedIp", requestedIp)
				.param("requestedUserAgent", requestedUserAgent)
				.update();
	}

	@Override
	public Optional<PasswordResetToken> findByIdForUpdate(UUID tokenId) {
		return jdbcClient.sql("""
				SELECT id, user_id, token_hash, issued_at, expires_at,
				       consumed_at, invalidated_at, invalidate_reason
				FROM platform_password_reset_tokens
				WHERE id = :id
				FOR UPDATE
				""")
				.param("id", tokenId.toString())
				.query((rs, rowNum) -> new PasswordResetToken(
						UUID.fromString(rs.getString("id")),
						UUID.fromString(rs.getString("user_id")),
						rs.getString("token_hash"),
						instant(rs.getTimestamp("issued_at")),
						instant(rs.getTimestamp("expires_at")),
						instant(rs.getTimestamp("consumed_at")),
						instant(rs.getTimestamp("invalidated_at")),
						rs.getString("invalidate_reason")))
				.optional();
	}

	@Override
	public void markConsumed(UUID tokenId, Instant consumedAt) {
		jdbcClient.sql("""
				UPDATE platform_password_reset_tokens
				SET consumed_at = :consumedAt
				WHERE id = :id AND consumed_at IS NULL
				  AND invalidated_at IS NULL
				""")
				.param("consumedAt", Timestamp.from(consumedAt))
				.param("id", tokenId.toString())
				.update();
	}

	@Override
	public void invalidateUsableForUser(UUID userId, Instant invalidatedAt,
			String reason) {
		jdbcClient.sql("""
				UPDATE platform_password_reset_tokens
				SET invalidated_at = :invalidatedAt,
				    invalidate_reason = :reason
				WHERE user_id = :userId
				  AND consumed_at IS NULL
				  AND invalidated_at IS NULL
				""")
				.param("invalidatedAt", Timestamp.from(invalidatedAt))
				.param("reason", reason)
				.param("userId", userId.toString())
				.update();
	}

	@Override
	public int countIssuedSince(UUID userId, Instant since) {
		return jdbcClient.sql("""
				SELECT COUNT(*)
				FROM platform_password_reset_tokens
				WHERE user_id = :userId AND issued_at >= :since
				""")
				.param("userId", userId.toString())
				.param("since", Timestamp.from(since))
				.query(Integer.class)
				.single();
	}

	private static Instant instant(Timestamp timestamp) {
		return timestamp == null ? null : timestamp.toInstant();
	}

}
```

`markConsumed` and `invalidateUsableForUser` carry their guard conditions in the
`WHERE` clause rather than trusting the caller, which mirrors how the
`CHECK (consumed_at IS NULL OR invalidated_at IS NULL)` constraint expresses the
same invariant one layer down.

- [ ] **Step 3: Compile**

```bash
cd /mnt/d/code/crm/crm && mvn -q compile
```

Expected: success.

- [ ] **Step 4: Checkpoint — do not commit**

---

## Task 8: Mail port, SMTP adapter, and configuration

**Files:**
- Modify: `crm/pom.xml`
- Modify: `crm/src/main/resources/application.yaml`
- Modify: `identity/infrastructure/config/CrmSecurityProperties.java`
- Modify: `identity/infrastructure/config/IdentitySecurityConfiguration.java`
- Create: `identity/application/port/PasswordResetMailer.java`
- Create: `identity/infrastructure/mail/SmtpPasswordResetMailer.java`

**Interfaces:**
- Consumes: the `mail.password_reset.*` message keys from Task 2.
- Produces: `PasswordResetMailer.sendResetLink(String email, String displayName, String resetUrl, Instant expiresAt, Locale locale)`.

- [ ] **Step 1: Add the dependency**

In `crm/pom.xml`, beside the other `spring-boot-starter-*` entries:

```xml
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-mail</artifactId>
		</dependency>
```

- [ ] **Step 2: Create the port**

```java
package com.crm.identity.application.port;

import java.time.Instant;
import java.util.Locale;

/**
 * Narrow by design. The application layer says only "send a reset link" and
 * knows nothing about subjects, encodings, or markup — those belong to the
 * adapter. When email verification is added it gets its own narrow port rather
 * than widening this one.
 */
public interface PasswordResetMailer {

	void sendResetLink(String email, String displayName, String resetUrl,
			Instant expiresAt, Locale locale);

}
```

The explicit `Locale` parameter is load-bearing. Spring resolves the request
locale into `LocaleContextHolder`, which is thread-local and does **not**
propagate across an `@Async` boundary; without passing it, every message would
silently fall back to the default locale.

- [ ] **Step 3: Add configuration properties**

In `CrmSecurityProperties`, add two components to the record and a nested type:

```java
		Duration passwordResetTtl,
		PasswordResetLimits passwordResetLimits,
```

```java
	public record PasswordResetLimits(
			Duration minimumInterval,
			int maxPerHour,
			String resetUrlTemplate) {
	}
```

In `application.yaml`, under `crm.security`, after `lock-duration`:

```yaml
    password-reset-ttl: ${CRM_PASSWORD_RESET_TTL:PT30M}
    password-reset-limits:
      minimum-interval: ${CRM_PASSWORD_RESET_MIN_INTERVAL:PT60S}
      max-per-hour: ${CRM_PASSWORD_RESET_MAX_PER_HOUR:5}
      reset-url-template: ${CRM_PASSWORD_RESET_URL:http://localhost:3000/reset-password?token=%s}
```

And a top-level `spring.mail` block:

```yaml
spring:
  mail:
    host: ${CRM_MAIL_HOST:}
    port: ${CRM_MAIL_PORT:587}
    username: ${CRM_MAIL_USERNAME:}
    password: ${CRM_MAIL_PASSWORD:}
    properties:
      mail.smtp.auth: ${CRM_MAIL_SMTP_AUTH:true}
      mail.smtp.starttls.enable: ${CRM_MAIL_STARTTLS:true}
    from: ${CRM_MAIL_FROM:no-reply@vumcrm.local}
```

If `application.yaml` already has a top-level `spring:` key, merge into it
rather than adding a second one — a duplicate top-level key silently drops one
of the blocks in YAML.

- [ ] **Step 4: Create the SMTP adapter**

```java
package com.crm.identity.infrastructure.mail;

import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.util.Locale;

import com.crm.identity.application.port.PasswordResetMailer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.MessageSource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import jakarta.mail.internet.MimeMessage;

@Component
public class SmtpPasswordResetMailer implements PasswordResetMailer {

	private static final Logger log =
			LoggerFactory.getLogger(SmtpPasswordResetMailer.class);

	private final JavaMailSender mailSender;

	private final MessageSource messageSource;

	private final String fromAddress;

	private final String configuredHost;

	public SmtpPasswordResetMailer(JavaMailSender mailSender,
			MessageSource messageSource,
			@Value("${spring.mail.from:no-reply@vumcrm.local}") String fromAddress,
			@Value("${spring.mail.host:}") String configuredHost) {
		this.mailSender = mailSender;
		this.messageSource = messageSource;
		this.fromAddress = fromAddress;
		this.configuredHost = configuredHost;
	}

	@Override
	public void sendResetLink(String email, String displayName, String resetUrl,
			Instant expiresAt, Locale locale) {
		long minutes = Duration.between(Instant.now(), expiresAt).toMinutes();
		String subject = messageSource.getMessage(
				"mail.password_reset.subject", null, locale);
		String body = buildBody(displayName, resetUrl, minutes, locale);

		// Operational hygiene, not a substitute for delivery: local development
		// and CI have no SMTP credentials, and must not fail because of it.
		if (!StringUtils.hasText(configuredHost)) {
			log.warn("spring.mail.host is not configured; "
					+ "password reset link for {} was not sent: {}",
					email, resetUrl);
			return;
		}

		try {
			MimeMessage message = mailSender.createMimeMessage();
			MimeMessageHelper helper = new MimeMessageHelper(
					message, false, StandardCharsets.UTF_8.name());
			helper.setFrom(fromAddress);
			helper.setTo(email);
			helper.setSubject(subject);
			helper.setText(body, false);
			mailSender.send(message);
		}
		catch (Exception exception) {
			// Never rethrow: the caller returned 202 long ago, and a delivery
			// failure must not surface as an enumeration signal.
			log.error("Failed to send password reset mail to {}", email,
					exception);
		}
	}

	private String buildBody(String displayName, String resetUrl, long minutes,
			Locale locale) {
		String greeting = messageSource.getMessage(
				"mail.password_reset.greeting",
				new Object[] { displayName }, locale);
		String intro = messageSource.getMessage("mail.password_reset.body",
				new Object[] { minutes }, locale);
		String action = messageSource.getMessage(
				"mail.password_reset.action", null, locale);
		String ignore = messageSource.getMessage(
				"mail.password_reset.ignore", null, locale);
		return greeting + "\n\n" + intro + "\n\n"
				+ action + ": " + resetUrl + "\n\n" + ignore + "\n";
	}

}
```

Plain text only. An HTML template is deliberately omitted: it doubles the
surface with no functional gain for a link the user clicks once.

- [ ] **Step 5: Enable async**

In `identity/infrastructure/config/IdentitySecurityConfiguration.java`, add:

```java
import org.springframework.scheduling.annotation.EnableAsync;
```

and add `@EnableAsync` to the class-level annotations.

- [ ] **Step 6: Compile**

```bash
cd /mnt/d/code/crm/crm && mvn -q compile
```

Expected: success. If `JavaMailSender` cannot be resolved, `pom.xml` Step 1 was
not applied or the dependency has not been downloaded.

- [ ] **Step 7: Verify no duplicate top-level YAML key**

```bash
cd /mnt/d/code/crm/crm
grep -c "^spring:" src/main/resources/application.yaml
```

Expected: `1`. A value of `2` means the second block silently overwrote the
first.

- [ ] **Step 8: Checkpoint — do not commit**

---

## Task 9: `PasswordResetApplicationService`

The heart of the feature. Three operations, all transactional.

**Files:**
- Create: `identity/application/command/ForgotPasswordCommand.java`
- Create: `identity/application/command/ResetPasswordCommand.java`
- Create: `identity/application/command/ChangePasswordCommand.java`
- Create: `identity/application/service/PasswordResetApplicationService.java`
- Modify: `identity/application/port/IdentityRepository.java`
- Modify: `identity/infrastructure/persistence/JdbcIdentityRepository.java`

**Interfaces:**
- Consumes: everything from Tasks 5, 6, 7, 8.
- Produces:
  - `requestReset(ForgotPasswordCommand, AuthenticationRequestMetadata, Locale)` — void, always succeeds from the caller's view
  - `resetPassword(ResetPasswordCommand, AuthenticationRequestMetadata)` — void
  - `changePassword(UUID userId, ChangePasswordCommand, AuthenticationRequestMetadata)` — void
  - `IdentityRepository.updatePasswordAndClearLock(UUID userId, String passwordHash, Instant now)`
  - `IdentityRepository.revokeAllSessions(UUID userId, Instant now, String reason)`
  - `IdentityRepository.revokeSessionsExcept(UUID userId, UUID keepSessionId, Instant now, String reason)`

- [ ] **Step 1: Add the two repository methods**

Append to the `IdentityRepository` interface:

```java
	void updatePasswordAndClearLock(UUID userId, String passwordHash,
			Instant now);

	void revokeAllSessions(UUID userId, Instant now, String reason);
```

Implement in `JdbcIdentityRepository`:

```java
	@Override
	public void updatePasswordAndClearLock(UUID userId, String passwordHash,
			Instant now) {
		jdbcClient.sql("""
				UPDATE platform_user_credentials
				SET password_hash = :passwordHash,
				    password_changed_at = :now,
				    failed_login_attempts = 0,
				    locked_until = NULL,
				    version = version + 1
				WHERE user_id = :userId
				""")
				.param("passwordHash", passwordHash)
				.param("now", Timestamp.from(now))
				.param("userId", userId.toString())
				.update();
	}

	@Override
	public void revokeAllSessions(UUID userId, Instant now, String reason) {
		jdbcClient.sql("""
				UPDATE platform_auth_sessions
				SET revoked_at = :now, revoke_reason = :reason
				WHERE user_id = :userId AND revoked_at IS NULL
				""")
				.param("now", Timestamp.from(now))
				.param("reason", reason)
				.param("userId", userId.toString())
				.update();
	}
```

Clearing `failed_login_attempts` and `locked_until` here is what makes password
reset the self-service unlock path. It reuses exactly the two columns
`recordSuccessfulLogin` already clears.

- [ ] **Step 2: Create the three commands**

```java
package com.crm.identity.application.command;

public record ForgotPasswordCommand(String email) {
}
```

```java
package com.crm.identity.application.command;

public record ResetPasswordCommand(String rawToken, String newPassword) {
}
```

```java
package com.crm.identity.application.command;

public record ChangePasswordCommand(String currentPassword,
		String newPassword) {
}
```

- [ ] **Step 3: Create the service**

```java
package com.crm.identity.application.service;

import java.time.Duration;
import java.time.Instant;
import java.util.Locale;
import java.util.Optional;
import java.util.UUID;

import com.crm.foundation.security.CodedAuthenticationException;
import com.crm.identity.application.command.AuthenticationRequestMetadata;
import com.crm.identity.application.command.ChangePasswordCommand;
import com.crm.identity.application.command.ForgotPasswordCommand;
import com.crm.identity.application.command.ResetPasswordCommand;
import com.crm.identity.application.port.IdentityRepository;
import com.crm.identity.application.port.PasswordResetMailer;
import com.crm.identity.application.port.PasswordResetTokenRepository;
import com.crm.identity.domain.AuthenticationErrorCode;
import com.crm.identity.domain.PasswordPolicy;
import com.crm.identity.domain.PasswordPolicyViolation;
import com.crm.identity.domain.PasswordResetToken;
import com.crm.identity.domain.UserAccount;
import com.crm.sharedkernel.domain.exception.BusinessRuleViolation;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PasswordResetApplicationService {

	private static final Logger log =
			LoggerFactory.getLogger(PasswordResetApplicationService.class);

	private static final String SUPERSEDED = "SUPERSEDED";

	private static final String REVOKE_PASSWORD_RESET = "PASSWORD_RESET";

	private static final String REVOKE_PASSWORD_CHANGED = "PASSWORD_CHANGED";

	private final IdentityRepository identityRepository;

	private final PasswordResetTokenRepository tokenRepository;

	private final PasswordResetMailer mailer;

	private final PasswordHasher passwordHasher;

	private final AuthenticationAuditRecorder auditRecorder;

	private final TimeProvider timeProvider;

	private final Duration tokenTtl;

	private final Duration minimumInterval;

	private final int maxPerHour;

	private final String resetUrlTemplate;

	public PasswordResetApplicationService(
			IdentityRepository identityRepository,
			PasswordResetTokenRepository tokenRepository,
			PasswordResetMailer mailer,
			PasswordHasher passwordHasher,
			AuthenticationAuditRecorder auditRecorder,
			TimeProvider timeProvider,
			Duration tokenTtl,
			Duration minimumInterval,
			int maxPerHour,
			String resetUrlTemplate) {
		this.identityRepository = identityRepository;
		this.tokenRepository = tokenRepository;
		this.mailer = mailer;
		this.passwordHasher = passwordHasher;
		this.auditRecorder = auditRecorder;
		this.timeProvider = timeProvider;
		this.tokenTtl = tokenTtl;
		this.minimumInterval = minimumInterval;
		this.maxPerHour = maxPerHour;
		this.resetUrlTemplate = resetUrlTemplate;
	}

	/**
	 * Runs off the request thread so that response time does not depend on
	 * whether the address belongs to an account. Matching the 202 status alone
	 * would still leak the answer through timing.
	 */
	@Async
	@Transactional
	public void requestReset(ForgotPasswordCommand command,
			AuthenticationRequestMetadata metadata, Locale locale) {
		Instant now = timeProvider.now();
		String normalizedEmail = command.email().trim().toLowerCase(Locale.ROOT);

		Optional<UserAccount> candidate =
				identityRepository.findByEmail(normalizedEmail);
		if (candidate.isEmpty()) {
			return;
		}
		UserAccount user = candidate.get();
		if (!user.permitsAuthentication() || user.passwordHash() == null) {
			return;
		}
		if (isRateLimited(user.id(), now)) {
			log.info("Password reset rate limit reached for user {}", user.id());
			return;
		}

		tokenRepository.invalidateUsableForUser(user.id(), now, SUPERSEDED);

		UUID tokenId = UUID.randomUUID();
		String secret = PasswordResetTokenFactory.generateSecret();
		String rawToken = tokenId + "." + secret;
		Instant expiresAt = now.plus(tokenTtl);

		tokenRepository.create(new PasswordResetToken(tokenId, user.id(),
				PasswordResetTokenFactory.hash(rawToken), now, expiresAt,
				null, null, null),
				metadata.ipAddress(), metadata.userAgent());

		auditRecorder.recordPasswordResetRequested(
				user.id(), normalizedEmail, metadata, now);

		mailer.sendResetLink(user.email(), user.displayName(),
				String.format(resetUrlTemplate, rawToken), expiresAt, locale);
	}

	@Transactional
	public void resetPassword(ResetPasswordCommand command,
			AuthenticationRequestMetadata metadata) {
		Instant now = timeProvider.now();
		PasswordResetToken token = loadUsableToken(command.rawToken(), now);
		UserAccount user = identityRepository.findById(token.userId())
				.orElseThrow(PasswordResetApplicationService::invalidToken);

		enforcePolicy(command.newPassword(), user.email(), user.displayName());

		identityRepository.updatePasswordAndClearLock(user.id(),
				passwordHasher.hash(command.newPassword()), now);
		tokenRepository.markConsumed(token.id(), now);

		// Reset exists because the account may be compromised; leaving live
		// sessions alone would defeat the entire purpose.
		identityRepository.revokeAllSessions(user.id(), now,
				REVOKE_PASSWORD_RESET);

		auditRecorder.recordPasswordResetCompleted(
				user.id(), user.email(), metadata, now);
	}

	@Transactional
	public void changePassword(UUID userId, ChangePasswordCommand command,
			AuthenticationRequestMetadata metadata) {
		Instant now = timeProvider.now();
		UserAccount user = identityRepository.findById(userId)
				.orElseThrow(() -> new CodedAuthenticationException(
						AuthenticationErrorCode.INVALID_CREDENTIALS));

		if (user.passwordHash() == null || !passwordHasher.matches(
				command.currentPassword(), user.passwordHash())) {
			throw new CodedAuthenticationException(
					AuthenticationErrorCode.INVALID_CREDENTIALS);
		}

		enforcePolicy(command.newPassword(), user.email(), user.displayName());

		identityRepository.updatePasswordAndClearLock(user.id(),
				passwordHasher.hash(command.newPassword()), now);
		identityRepository.revokeAllSessions(user.id(), now,
				REVOKE_PASSWORD_CHANGED);

		auditRecorder.recordPasswordChanged(
				user.id(), user.email(), metadata, now);
	}

	private boolean isRateLimited(UUID userId, Instant now) {
		if (tokenRepository.countIssuedSince(
				userId, now.minus(minimumInterval)) > 0) {
			return true;
		}
		return tokenRepository.countIssuedSince(
				userId, now.minus(Duration.ofHours(1))) >= maxPerHour;
	}

	private PasswordResetToken loadUsableToken(String rawToken, Instant now) {
		int separator = rawToken == null ? -1 : rawToken.indexOf('.');
		if (separator <= 0) {
			throw invalidToken();
		}
		UUID tokenId;
		try {
			tokenId = UUID.fromString(rawToken.substring(0, separator));
		}
		catch (IllegalArgumentException exception) {
			throw invalidToken();
		}

		PasswordResetToken token = tokenRepository.findByIdForUpdate(tokenId)
				.orElseThrow(PasswordResetApplicationService::invalidToken);
		if (!PasswordResetTokenFactory.matches(
				token.tokenHash(), PasswordResetTokenFactory.hash(rawToken))) {
			throw invalidToken();
		}
		if (token.isConsumed() || token.isInvalidated()) {
			throw invalidToken();
		}
		if (token.isExpiredAt(now)) {
			throw new CodedAuthenticationException(
					AuthenticationErrorCode.PASSWORD_RESET_TOKEN_EXPIRED);
		}
		return token;
	}

	private static void enforcePolicy(String password, String email,
			String displayName) {
		Optional<PasswordPolicyViolation> violation =
				PasswordPolicy.validate(password, email, displayName);
		if (violation.isPresent()) {
			throw new BusinessRuleViolation(
					AuthenticationErrorCode.WEAK_PASSWORD);
		}
	}

	private static CodedAuthenticationException invalidToken() {
		return new CodedAuthenticationException(
				AuthenticationErrorCode.PASSWORD_RESET_TOKEN_INVALID);
	}

}
```

Three names in this file must be checked against the codebase before writing
it, because they are referenced but not defined by this plan:

- `PasswordHasher` — the interface `AuthenticationApplicationService` already
  injects. Read its exact package and its `hash` / `matches` method names, and
  match them.
- `TimeProvider` — likewise, the `timeProvider.now()` source already used by
  `AuthenticationApplicationService`.
- `BusinessRuleViolation` — confirm its constructor accepts an `ErrorCode`;
  `GlobalExceptionHandler` imports it from
  `com.crm.sharedkernel.domain.exception`.

If `PasswordHasher` exposes different method names, adapt the two call sites
rather than renaming the interface.

- [ ] **Step 4: Add `PasswordResetTokenFactory`**

`TokenHashing` from Task 6 is package-private to
`identity.infrastructure.security`, so the application layer cannot call it
directly — which is correct layering. Create a thin public seam in
`identity/infrastructure/security/PasswordResetTokenFactory.java`:

```java
package com.crm.identity.infrastructure.security;

public final class PasswordResetTokenFactory {

	private PasswordResetTokenFactory() {
	}

	public static String generateSecret() {
		return TokenHashing.generateSecret();
	}

	public static String hash(String rawToken) {
		return TokenHashing.sha256Hex(rawToken);
	}

	public static boolean matches(String expectedHash, String actualHash) {
		return TokenHashing.matches(expectedHash, actualHash);
	}

}
```

Add the import to the service:

```java
import com.crm.identity.infrastructure.security.PasswordResetTokenFactory;
```

An application service reaching into an infrastructure class is a layering
compromise. It is accepted here because the alternative — a port and an adapter
for three static functions — is more ceremony than the problem deserves, and
because `AuthenticationApplicationService` already sets this precedent with its
hashing dependencies.

- [ ] **Step 5: Add the three audit methods**

In `AuthenticationAuditRecorder`, add `recordPasswordResetRequested`,
`recordPasswordResetCompleted`, and `recordPasswordChanged`, each matching the
shape of `recordLoginFailure` and writing event types
`PASSWORD_RESET_REQUESTED`, `PASSWORD_RESET_COMPLETED`, and `PASSWORD_CHANGED`
respectively, with `success = true` for all three.

Note the schema constraint
`CHECK ((success AND failure_code IS NULL) OR (NOT success AND failure_code IS NOT NULL))`
on `platform_auth_events`: a successful event **must** pass `null` as the
failure code, or the insert is rejected at runtime.

- [ ] **Step 6: Wire the service bean**

The constructor takes four plain values that Spring cannot autowire. Add an
`@Bean` method to `IdentitySecurityConfiguration` that builds the service from
`CrmSecurityProperties`, following how `AuthenticationPolicy` is already
constructed there. Read that existing method first and mirror it.

- [ ] **Step 7: Verify the audit event types are legal**

```bash
cd /mnt/d/code/crm
for e in PASSWORD_RESET_REQUESTED PASSWORD_RESET_COMPLETED PASSWORD_CHANGED; do
  n=$(grep -c "$e" docs/crm_mysql80_auth.sql)
  [ "$n" -ge 1 ] && echo "ok  $e" || echo "MISSING FROM SCHEMA  $e"
done
```

Expected: three `ok` lines.

- [ ] **Step 8: Compile**

```bash
cd /mnt/d/code/crm/crm && mvn -q compile
```

Expected: success.

- [ ] **Step 9: Checkpoint — do not commit**

---

## Task 10: Controller endpoints and request DTOs

**Files:**
- Create: `identity/presentation/web/ForgotPasswordRequest.java`
- Create: `identity/presentation/web/ResetPasswordRequest.java`
- Create: `identity/presentation/web/ChangePasswordRequest.java`
- Modify: `identity/presentation/web/AuthenticationController.java`

**Interfaces:**
- Consumes: `PasswordResetApplicationService` from Task 9.
- Produces: `POST /api/auth/password/forgot` (202), `/reset` (204), `/change` (204).

- [ ] **Step 1: Create the three DTOs**

```java
package com.crm.identity.presentation.web;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ForgotPasswordRequest(
		@NotBlank @Email @Size(max = 320) String email) {
}
```

```java
package com.crm.identity.presentation.web;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ResetPasswordRequest(
		@NotBlank @Size(max = 200) String token,
		@NotBlank @Size(min = 12, max = 128) String newPassword) {
}
```

```java
package com.crm.identity.presentation.web;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ChangePasswordRequest(
		@NotBlank @Size(max = 128) String currentPassword,
		@NotBlank @Size(min = 12, max = 128) String newPassword) {
}
```

`@Size(min = 12)` duplicates the floor in `PasswordPolicy`. Keeping it gives a
clean field-level validation error for the common case; `PasswordPolicy` remains
the authority and catches everything else.

- [ ] **Step 2: Add the endpoints**

In `AuthenticationController`, add the service to the constructor and these
three methods:

```java
	@PostMapping("/password/forgot")
	public ResponseEntity<Void> forgotPassword(
			@Valid @RequestBody ForgotPasswordRequest request,
			HttpServletRequest servletRequest) {
		// Always 202, and the work runs async, so neither the status nor the
		// response time reveals whether the address belongs to an account.
		passwordReset.requestReset(
				new ForgotPasswordCommand(request.email()),
				RequestMetadataFactory.from(servletRequest),
				LocaleContextHolder.getLocale());
		return ResponseEntity.accepted().build();
	}

	@PostMapping("/password/reset")
	public ResponseEntity<Void> resetPassword(
			@Valid @RequestBody ResetPasswordRequest request,
			HttpServletRequest servletRequest) {
		passwordReset.resetPassword(
				new ResetPasswordCommand(request.token(), request.newPassword()),
				RequestMetadataFactory.from(servletRequest));
		return ResponseEntity.noContent().build();
	}

	@PostMapping("/password/change")
	public ResponseEntity<Void> changePassword(
			@Valid @RequestBody ChangePasswordRequest request,
			@AuthenticationPrincipal Jwt jwt,
			HttpServletRequest servletRequest) {
		passwordReset.changePassword(UUID.fromString(jwt.getSubject()),
				new ChangePasswordCommand(request.currentPassword(),
						request.newPassword()),
				RequestMetadataFactory.from(servletRequest));
		return ResponseEntity.noContent().build();
	}
```

`LocaleContextHolder.getLocale()` is read **here**, on the request thread, and
passed as an argument. Reading it inside the `@Async` method would return the
default locale for every user.

Add imports:

```java
import org.springframework.context.i18n.LocaleContextHolder;
import com.crm.identity.application.command.ChangePasswordCommand;
import com.crm.identity.application.command.ForgotPasswordCommand;
import com.crm.identity.application.command.ResetPasswordCommand;
import com.crm.identity.application.service.PasswordResetApplicationService;
```

- [ ] **Step 3: Open the two public routes in security config**

`/api/auth/password/forgot` and `/api/auth/password/reset` must be permitted
without authentication, while `/api/auth/password/change` must require it.
Find the `SecurityFilterChain` that currently permits `/api/auth/register` and
`/api/auth/login`:

```bash
cd /mnt/d/code/crm/crm
grep -rn "api/auth" src/main/java/com/crm/identity/infrastructure/security/JwtSecurityConfiguration.java
```

Add the two new paths to the same `permitAll` matcher. **Do not** add
`/password/change`, and do not use a wildcard such as `/api/auth/password/**`,
which would expose the authenticated endpoint.

- [ ] **Step 4: Compile**

```bash
cd /mnt/d/code/crm/crm && mvn -q compile
```

Expected: success.

- [ ] **Step 5: Verify the change endpoint is not publicly permitted**

```bash
cd /mnt/d/code/crm/crm
grep -rn "password/change\|api/auth/password/\*\*" \
  src/main/java/com/crm/identity/infrastructure/security/
```

Expected: no output. Any match means the authenticated endpoint was exposed.

- [ ] **Step 6: Checkpoint — do not commit**

---

## Task 11: API reference documentation

`AGENTS.md` §5 makes this mandatory in the same work, not a follow-up.

**Files:**
- Modify: `docs/api-reference.md`

- [ ] **Step 1: Read the existing endpoint format**

```bash
cd /mnt/d/code/crm
sed -n '231,330p' docs/api-reference.md
```

Match the structure of "Register a local user" and "Log in with local
credentials" exactly: heading, method and path, auth requirement, request body
table, response, and error codes.

- [ ] **Step 2: Document the three endpoints**

Add three sections after "Log in with local credentials", covering for each:
the method and path, whether authentication is required, the request fields with
their constraints from Task 10, the success status (202, 204, 204), and the
possible error codes.

For `POST /api/auth/password/forgot`, state explicitly that the response is
**always 202 regardless of whether the address is registered**, and that this is
deliberate anti-enumeration behaviour so integrators do not treat it as a bug.

- [ ] **Step 3: Document the four new error codes**

Add `ACCOUNT_LOCKED`, `PASSWORD_RESET_TOKEN_INVALID`,
`PASSWORD_RESET_TOKEN_EXPIRED`, and `WEAK_PASSWORD` to the authentication error
code table, and note that `ACCOUNT_LOCKED` responses carry an extra
`lockedUntil` property containing an ISO-8601 instant.

- [ ] **Step 4: Document the login behaviour change**

Under "Log in with local credentials", record that a correct password against a
locked account now returns `ACCOUNT_LOCKED` rather than `INVALID_CREDENTIALS`,
and that an incorrect password still returns `INVALID_CREDENTIALS` in every
case, locked or not.

- [ ] **Step 5: Verify**

```bash
cd /mnt/d/code/crm
for p in "password/forgot" "password/reset" "password/change" \
         ACCOUNT_LOCKED PASSWORD_RESET_TOKEN_INVALID \
         PASSWORD_RESET_TOKEN_EXPIRED WEAK_PASSWORD lockedUntil; do
  n=$(grep -c "$p" docs/api-reference.md)
  [ "$n" -ge 1 ] && echo "ok  $p" || echo "MISSING  $p"
done
```

Expected: eight `ok` lines.

- [ ] **Step 6: Checkpoint — do not commit**

---

## Task 12: Extract the shared brand token layer

**Files:**
- Create: `crm-fe/src/styles/brand-tokens.css`
- Modify: `crm-fe/src/features/landing/landing.css`
- Modify: `crm-fe/src/features/landing/LandingLayout.tsx`

**Interfaces:**
- Consumes: nothing.
- Produces: `--brand-*` custom properties and the generic utilities, scoped `.landing-theme, .auth-theme`.

- [ ] **Step 1: Measure the rename surface and confirm no edits are in flight**

```bash
cd /mnt/d/code/crm
git status --porcelain crm-fe/src/features/landing/ | head
cd crm-fe/src && grep -ro -- "--lp-" . | wc -l
```

The count was 369 across 21 files at planning time. **If the user is actively
editing landing files, stop and confirm before running the rename in Step 3** —
a bulk substitution over work in progress will collide with it.

- [ ] **Step 2: Create `crm-fe/src/styles/brand-tokens.css`**

Move — do not copy — these blocks out of `landing.css` into the new file,
changing the selector from `.landing-theme` to `.landing-theme, .auth-theme`:

- the entire custom-property block
- the type utilities: `lp-display`, `lp-h2`, `lp-h3`, `lp-lead`, `lp-eyebrow`
  and its `::before`, `lp-caption`
- the card utilities: `lp-card`, `lp-surface`, `lp-surface-sunk`,
  `lp-surface-dark-raised`, `lp-elev-flat`, `lp-elev-sm`, `lp-elev-md`,
  `lp-elev-lg`, `lp-card-interactive` and its `:hover`
- the actions: `landing-primary-action`, `landing-secondary-action` and their
  states
- the focus-visible rules, including the dark-tone override
- `lp-reveal` and `lp-reveal-in`
- the `prefers-reduced-motion` block

Add the danger scale that `auth.css` needs and `landing.css` lacks:

```css
  --brand-danger:      #BE123C;
  --brand-danger-soft: #FFF1F2;
```

**Leave in `landing.css`:** `.landing-container`, `.landing-section`, the
`.lp-size-*` rules, all `.lp-tone-*` rules and their `::before`, the mock-card
and fade keyframes, the `--landing-*` alias block, and every decorative class
the user has added — `lp-btn-sheen`, `lp-glass-card-dark`, `lp-animate-float`,
`lp-animate-float-slow`, `lp-flow-pulse-particle`, `lp-gradient-text`.

- [ ] **Step 3: Rename the custom properties only**

```bash
cd /mnt/d/code/crm/crm-fe/src
grep -rl -- "--lp-" . | xargs sed -i 's/--lp-/--brand-/g'
```

This targets `--lp-` with the leading double hyphen, so it renames **custom
properties only** and leaves class names such as `lp-card` and
`lp-glass-card-dark` untouched. That is intentional: the decorative classes
genuinely belong to the landing page, and renaming them to `brand-*` would
misstate where they live.

- [ ] **Step 4: Rename the generic utility classes**

Only the ones that moved to the shared file:

```bash
cd /mnt/d/code/crm/crm-fe/src
grep -rl -E "lp-(display|h2|h3|lead|eyebrow|caption|card|surface|elev-|reveal)" . \
  | xargs sed -i -E 's/\blp-(display|h2|h3|lead|eyebrow|caption|card|card-interactive|surface|surface-sunk|surface-dark-raised|elev-flat|elev-sm|elev-md|elev-lg|reveal|reveal-in)\b/brand-\1/g'
```

Note that `lp-card-interactive` must be listed before `lp-card` would match it;
the alternation above handles this by listing the longer names, and `\b`
anchors prevent partial matches.

- [ ] **Step 5: Import the shared file**

In `landing.css`, add as the very first line:

```css
@import '../../styles/brand-tokens.css';
```

- [ ] **Step 6: Verify nothing was missed and nothing over-matched**

```bash
cd /mnt/d/code/crm/crm-fe/src
echo -n "leftover --lp- (expect 0): "; grep -ro -- "--lp-" . | wc -l
echo -n "brand tokens present (expect >300): "; grep -ro -- "--brand-" . | wc -l
echo "decorative classes that must survive with lp- prefix:"
grep -rho "lp-\(btn-sheen\|glass-card-dark\|animate-float\|flow-pulse-particle\|gradient-text\|tone-[a-z]*\|size-[a-z]*\|fade-in\|mock-card\)" . | sort -u
```

Expected: `0` leftovers, a large `--brand-` count, and the decorative and
landing-structural classes still listed with their `lp-` prefix.

- [ ] **Step 7: Typecheck and lint**

```bash
cd /mnt/d/code/crm/crm-fe
npm run typecheck && npm run lint 2>&1 | grep -A5 "features/landing"
```

Expected: typecheck passes; no new lint error in `features/landing`.

- [ ] **Step 8: Checkpoint — do not commit**

---

## Task 13: `auth.css` consumes the shared layer

**Files:**
- Modify: `crm-fe/src/features/auth/auth.css`

- [ ] **Step 1: Record the drift being removed**

```bash
cd /mnt/d/code/crm/crm-fe/src/features/auth
grep -E "^\s+--auth-(canvas|line|blue-soft)" auth.css
```

Expected: `#F6F9FC`, `#DCE5F0`, `#EAF2FC` — one step away from the current brand
values `#F5F8FC`, `#DFE7F1`, `#EEF5FE`. This is the drift the task removes.

- [ ] **Step 2: Replace the token block with an import and aliases**

At the top of `auth.css`:

```css
@import '../../styles/brand-tokens.css';
```

Replace the `--auth-*` declarations inside `.auth-theme` with aliases onto the
shared scale, so the rest of the file keeps working unchanged:

```css
.auth-theme {
  --auth-canvas:      var(--brand-canvas);
  --auth-surface:     var(--brand-surface);
  --auth-ink:         var(--brand-ink);
  --auth-muted:       var(--brand-ink-muted);
  --auth-line:        var(--brand-line);
  --auth-blue:        var(--brand-blue-500);
  --auth-blue-hover:  var(--brand-blue-600);
  --auth-blue-soft:   var(--brand-blue-50);
  --auth-danger:      var(--brand-danger);
  --auth-danger-soft: var(--brand-danger-soft);
  /* ...the rest of the existing .auth-theme rules stay as they are... */
}
```

Aliasing rather than a mass rewrite of every `var(--auth-*)` reference keeps
this task small and reviewable. The aliases are the same mechanism that already
lets the three landing sub-pages inherit new values untouched.

- [ ] **Step 3: Verify the values now agree**

```bash
cd /mnt/d/code/crm/crm-fe/src
grep -c "var(--brand-" features/auth/auth.css
grep -c "#F6F9FC\|#DCE5F0\|#EAF2FC" features/auth/auth.css
```

Expected: a non-zero first count and `0` for the second — the forked hex values
are gone.

- [ ] **Step 4: Typecheck and lint**

```bash
cd /mnt/d/code/crm/crm-fe
npm run typecheck && npm run lint 2>&1 | grep -A5 "features/auth"
```

Expected: typecheck passes; no new lint error in `features/auth`.

- [ ] **Step 5: Checkpoint — do not commit**

---

## Task 14: Frontend password policy and strength meter

**Files:**
- Create: `crm-fe/src/features/auth/utils/passwordPolicy.ts`
- Create: `crm-fe/src/features/auth/components/PasswordStrengthMeter.tsx`

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `PASSWORD_MIN_LENGTH = 12`, `PASSWORD_MAX_LENGTH = 128`
  - `evaluatePassword(password: string, email?: string, displayName?: string): PasswordAssessment`
  - `PasswordAssessment = { score: 0 | 1 | 2 | 3 | 4; violation?: PasswordViolation }`
  - `PasswordViolation = 'TOO_SHORT' | 'TOO_LONG' | 'COMMON' | 'CONTAINS_IDENTITY'`
  - `PasswordStrengthMeter` with props `{ password: string; email?: string; displayName?: string }`

- [ ] **Step 1: Create the policy mirror**

```ts
export const PASSWORD_MIN_LENGTH = 12;
export const PASSWORD_MAX_LENGTH = 128;

export type PasswordViolation =
  | 'TOO_SHORT'
  | 'TOO_LONG'
  | 'COMMON'
  | 'CONTAINS_IDENTITY';

export interface PasswordAssessment {
  score: 0 | 1 | 2 | 3 | 4;
  violation?: PasswordViolation;
}

const MIN_IDENTITY_FRAGMENT = 4;

/**
 * Mirrors PasswordPolicy.java for immediate feedback. The backend stays
 * authoritative; this exists so the user is not told about a problem only
 * after submitting. Duplication across a language boundary cannot be avoided,
 * so both sides are kept in one file each and the lists are kept in step.
 */
const COMMON_PASSWORDS = new Set([
  'password', 'password1', 'password123', 'passw0rd',
  '123456', '1234567', '12345678', '123456789', '1234567890',
  'qwerty', 'qwerty123', 'qwertyuiop', 'asdfghjkl',
  'letmein', 'welcome', 'welcome1', 'welcome123',
  'admin', 'admin123', 'administrator', 'root', 'toor',
  'iloveyou', 'sunshine', 'princess', 'dragon', 'monkey',
  'football', 'baseball', 'superman', 'batman',
  'trustno1', 'changeme', 'secret', 'master', 'shadow',
  'abc123', 'abcd1234', 'a1b2c3d4', 'zaq12wsx', '1q2w3e4r',
  'qazwsx', 'michael', 'jennifer', 'jordan', 'hunter',
  'vumcrm', 'vumcrm123', 'crmadmin', 'salespassword',
  'companyname', 'january', 'february', 'december',
  'summer2025', 'summer2026', 'winter2025', 'winter2026',
  'p@ssword', 'p@ssw0rd', 'passw0rd123', 'test1234',
  'demo1234', 'demopassword', 'temporary', 'temppassword',
]);

function containsIdentity(
  lower: string,
  email?: string,
  displayName?: string
): boolean {
  if (email) {
    const at = email.indexOf('@');
    const local = (at > 0 ? email.slice(0, at) : email).toLowerCase();
    if (local.length >= MIN_IDENTITY_FRAGMENT && lower.includes(local)) {
      return true;
    }
  }
  if (displayName) {
    for (const part of displayName.toLowerCase().split(/\s+/)) {
      if (part.length >= MIN_IDENTITY_FRAGMENT && lower.includes(part)) {
        return true;
      }
    }
  }
  return false;
}

export function evaluatePassword(
  password: string,
  email?: string,
  displayName?: string
): PasswordAssessment {
  if (!password) return { score: 0, violation: 'TOO_SHORT' };

  const lower = password.toLowerCase();

  if (password.length < PASSWORD_MIN_LENGTH) {
    return { score: 0, violation: 'TOO_SHORT' };
  }
  if (password.length > PASSWORD_MAX_LENGTH) {
    return { score: 0, violation: 'TOO_LONG' };
  }
  if (COMMON_PASSWORDS.has(lower)) {
    return { score: 0, violation: 'COMMON' };
  }
  if (containsIdentity(lower, email, displayName)) {
    return { score: 0, violation: 'CONTAINS_IDENTITY' };
  }

  // Length dominates, because it is what actually expands the search space.
  // Variety is a secondary signal, never a requirement.
  let score = 1;
  if (password.length >= 16) score += 1;
  if (password.length >= 20) score += 1;

  const classes = [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/].filter((re) =>
    re.test(password)
  ).length;
  if (classes >= 3) score += 1;

  return { score: Math.min(score, 4) as PasswordAssessment['score'] };
}
```

- [ ] **Step 2: Create the meter**

```tsx
import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { evaluatePassword } from '../utils/passwordPolicy';

const LEVEL_KEYS = [
  'auth.gateway.password.strength.veryWeak',
  'auth.gateway.password.strength.weak',
  'auth.gateway.password.strength.fair',
  'auth.gateway.password.strength.good',
  'auth.gateway.password.strength.strong',
] as const;

const VIOLATION_KEYS = {
  TOO_SHORT: 'auth.gateway.password.violation.tooShort',
  TOO_LONG: 'auth.gateway.password.violation.tooLong',
  COMMON: 'auth.gateway.password.violation.common',
  CONTAINS_IDENTITY: 'auth.gateway.password.violation.containsIdentity',
} as const;

const BAR_COLORS = [
  'bg-[var(--brand-danger)]',
  'bg-[var(--brand-danger)]',
  'bg-amber-500',
  'bg-[var(--brand-blue-400)]',
  'bg-emerald-500',
];

export interface PasswordStrengthMeterProps {
  password: string;
  email?: string;
  displayName?: string;
}

export function PasswordStrengthMeter({
  password,
  email,
  displayName,
}: PasswordStrengthMeterProps): ReactElement | null {
  const { t } = useTranslation();

  if (!password) return null;

  const { score, violation } = evaluatePassword(password, email, displayName);

  return (
    <div className="mt-2">
      <div className="flex gap-1" aria-hidden="true">
        {[0, 1, 2, 3].map((index) => (
          <span
            key={index}
            className={`h-1 flex-1 rounded-full ${
              index < score ? BAR_COLORS[score] : 'bg-[var(--brand-line)]'
            }`}
          />
        ))}
      </div>
      <p
        className="mt-1.5 text-xs text-[var(--brand-ink-muted)]"
        aria-live="polite"
      >
        {violation ? t(VIOLATION_KEYS[violation]) : t(LEVEL_KEYS[score])}
      </p>
    </div>
  );
}

export default PasswordStrengthMeter;
```

The bars are `aria-hidden` and the text carries `aria-live="polite"`, so a
screen reader hears the assessment once as words rather than reading four
decorative spans.

- [ ] **Step 3: Typecheck and lint**

```bash
cd /mnt/d/code/crm/crm-fe
npm run typecheck && npm run lint 2>&1 | grep -A5 "features/auth"
```

Expected: typecheck passes; no new lint error. The i18n keys do not exist yet —
that is Task 18, and a missing key renders as the key string rather than
failing.

- [ ] **Step 4: Checkpoint — do not commit**

---

## Task 15: Error mapping and the `normalizeAuthError` signature change

**Files:**
- Modify: `crm-fe/src/features/auth/utils/authErrorMessages.ts`
- Modify: `crm-fe/src/features/auth/LoginPage.tsx`
- Modify: `crm-fe/src/features/auth/RegisterPage.tsx`
- Modify: `crm-fe/src/features/auth/AuthCallbackPage.tsx`

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `AUTH_ERROR_CODES` grows by `ACCOUNT_LOCKED`, `PASSWORD_RESET_TOKEN_INVALID`, `PASSWORD_RESET_TOKEN_EXPIRED`, `WEAK_PASSWORD`
  - `normalizeAuthError(error: unknown): NormalizedAuthError` where `NormalizedAuthError = { code: AuthErrorCode; lockedUntil?: string }`

- [ ] **Step 1: Record every current call site**

```bash
cd /mnt/d/code/crm/crm-fe/src
grep -rn "normalizeAuthError" features/
```

Expected: the definition plus three call sites — `LoginPage`, `RegisterPage`,
`AuthCallbackPage`. All must be updated in this task or the frontend will not
typecheck.

- [ ] **Step 2: Extend the codes and change the return type**

In `authErrorMessages.ts`, add the four codes to `AUTH_ERROR_CODES` and their
entries to `AUTH_ERROR_MESSAGE_KEYS`:

```ts
  ACCOUNT_LOCKED: 'auth.gateway.errors.accountLocked',
  PASSWORD_RESET_TOKEN_INVALID: 'auth.gateway.errors.resetTokenInvalid',
  PASSWORD_RESET_TOKEN_EXPIRED: 'auth.gateway.errors.resetTokenExpired',
  WEAK_PASSWORD: 'auth.gateway.errors.weakPassword',
```

Replace `normalizeAuthError` with:

```ts
export interface NormalizedAuthError {
  code: AuthErrorCode;
  /** ISO-8601 instant, present only for ACCOUNT_LOCKED. */
  lockedUntil?: string;
}

export function normalizeAuthError(error: unknown): NormalizedAuthError {
  if (error instanceof ApiError && AUTH_ERROR_CODE_SET.has(error.errorCode)) {
    const code = error.errorCode as AuthErrorCode;
    if (code === 'ACCOUNT_LOCKED') {
      const raw = (error as unknown as { body?: Record<string, unknown> }).body;
      const lockedUntil = typeof raw?.lockedUntil === 'string'
        ? raw.lockedUntil
        : undefined;
      return { code, lockedUntil };
    }
    return { code };
  }
  if (error instanceof TypeError) return { code: 'NETWORK_ERROR' };
  return { code: 'UNKNOWN_ERROR' };
}
```

Read `services/api/apiClient.ts` first and use whatever property `ApiError`
actually exposes for the parsed `ProblemDetail` body. If it does not retain the
body, add a `body` field to `ApiError` — `lockedUntil` cannot reach the UI
otherwise, and that is the whole point of sending it as structured data.

- [ ] **Step 3: Update the three call sites**

Each currently does something equivalent to
`setLocalErrorCode(normalizeAuthError(error))`. Change each to destructure:

```ts
      const { code, lockedUntil } = normalizeAuthError(error);
      setLocalErrorCode(code);
```

`LoginPage` additionally stores `lockedUntil` in state for Task 16 to render.
`RegisterPage` and `AuthCallbackPage` ignore it.

- [ ] **Step 4: Typecheck**

```bash
cd /mnt/d/code/crm/crm-fe && npm run typecheck
```

Expected: passes. A failure naming one of the three pages means a call site was
missed — which is exactly the guard this step exists for.

- [ ] **Step 5: Checkpoint — do not commit**

---

## Task 16: Password reset service and the two new screens

**Files:**
- Create: `crm-fe/src/features/auth/services/passwordResetService.ts`
- Create: `crm-fe/src/features/auth/ForgotPasswordPage.tsx`
- Create: `crm-fe/src/features/auth/ResetPasswordPage.tsx`
- Modify: `crm-fe/src/routes/AppRoutes.tsx`

**Interfaces:**
- Consumes: `evaluatePassword` and `PasswordStrengthMeter` from Task 14; `normalizeAuthError` from Task 15.
- Produces: `requestPasswordReset(email: string): Promise<void>`, `confirmPasswordReset(token: string, newPassword: string): Promise<void>`, `changePassword(currentPassword: string, newPassword: string): Promise<void>`.

- [ ] **Step 1: Read the existing service pattern**

```bash
cd /mnt/d/code/crm/crm-fe/src
ls services/api/
sed -n '1,40p' services/api/apiClient.ts
```

Match how existing services call `apiClient` — the base path, the error shape,
and whether a helper wraps `POST`.

- [ ] **Step 2: Create the service**

```ts
import { apiClient } from '@/services/api/apiClient';

export async function requestPasswordReset(email: string): Promise<void> {
  // Always resolves for a well-formed request: the server answers 202 whether
  // or not the address is registered.
  await apiClient.post('/auth/password/forgot', { email });
}

export async function confirmPasswordReset(
  token: string,
  newPassword: string
): Promise<void> {
  await apiClient.post('/auth/password/reset', { token, newPassword });
}

export async function changePassword(
  currentPassword: string,
  newPassword: string
): Promise<void> {
  await apiClient.post('/auth/password/change', {
    currentPassword,
    newPassword,
  });
}
```

Adjust the call shape to the real `apiClient` signature found in Step 1.

- [ ] **Step 3: Create `ForgotPasswordPage.tsx`**

Build it from `AuthShell` with `brandVariant="compact"`, `react-hook-form` and
`zod` matching how `LoginPage` is structured, a single email field, and a
submitted state.

The submitted state is the important part: **render the identical confirmation
whether or not the address exists**, mirroring the server's behaviour. Show the
address back to the user, a note that the link expires in 30 minutes, and a
"send again" control that is disabled for 60 seconds to match the server's rate
limit.

```tsx
  const [submitted, setSubmitted] = useState(false);

  const onSubmit = async (values: ForgotFormValues) => {
    setLocalErrorCode(undefined);
    try {
      await requestPasswordReset(values.email);
    }
    catch (error) {
      // A network failure is worth showing; anything else is deliberately
      // indistinguishable, so the screen advances regardless.
      const { code } = normalizeAuthError(error);
      if (code === 'NETWORK_ERROR') {
        setLocalErrorCode(code);
        return;
      }
    }
    setSubmitted(true);
  };
```

- [ ] **Step 4: Create `ResetPasswordPage.tsx`**

Read the token with `useSearchParams()`:

```tsx
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';
```

If the token is empty, render the invalid-link state immediately without calling
the API. Otherwise render a new-password field with `PasswordStrengthMeter`, a
confirm-password field validated by a `zod` `.refine` that the two match, and on
success navigate to `/login` with a success flag.

`PASSWORD_RESET_TOKEN_EXPIRED` renders a distinct state offering a link back to
`/forgot-password`; `PASSWORD_RESET_TOKEN_INVALID` does not offer it. That
distinction is the entire reason the two codes are separate.

- [ ] **Step 5: Add the routes**

In `AppRoutes.tsx`, beside the existing public `/login` and `/register` routes:

```tsx
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
```

with the matching imports. Place them in the same public block — **not** inside
`ProtectedRoute`.

- [ ] **Step 6: Verify the routes are public**

```bash
cd /mnt/d/code/crm/crm-fe/src
grep -n -B8 "forgot-password" routes/AppRoutes.tsx | grep -c "ProtectedRoute"
```

Expected: `0`. A non-zero result means the reset routes landed inside the
authenticated block, which would make them unreachable by exactly the users who
need them.

- [ ] **Step 7: Typecheck and lint**

```bash
cd /mnt/d/code/crm/crm-fe
npm run typecheck && npm run lint 2>&1 | grep -A5 "features/auth"
```

Expected: typecheck passes; no new lint error.

- [ ] **Step 8: Checkpoint — do not commit**

---

## Task 17: Redesign `LoginPage` and `RegisterPage`

**Files:**
- Modify: `crm-fe/src/features/auth/LoginPage.tsx`
- Modify: `crm-fe/src/features/auth/RegisterPage.tsx`

**Interfaces:**
- Consumes: `PasswordStrengthMeter` from Task 14; the `lockedUntil` state added in Task 15.

- [ ] **Step 1: Add the forgot-password link to `LoginPage`**

Beside the password field label:

```tsx
              <Link
                to="/forgot-password"
                className="text-xs font-semibold text-[var(--brand-blue-600)] hover:underline underline-offset-4"
              >
                {t('auth.gateway.login.forgotPassword')}
              </Link>
```

This is the single highest-value line in the whole frontend half of the plan:
without it the recovery flow exists but nobody can find it.

- [ ] **Step 2: Render `ACCOUNT_LOCKED` with its unlock time**

Where the form error is rendered, special-case the locked state:

```tsx
        {localErrorCode === 'ACCOUNT_LOCKED' && lockedUntil ? (
          <AuthFormError
            message={t('auth.gateway.errors.accountLockedUntil', {
              time: new Date(lockedUntil).toLocaleTimeString(undefined, {
                hour: '2-digit',
                minute: '2-digit',
              }),
            })}
          />
        ) : null}
```

The timestamp is formatted here, in the browser, because only the browser knows
the viewer's timezone and locale. This is why the server sends an ISO instant as
a structured property instead of a finished sentence.

Adapt the props to whatever `AuthFormError` actually accepts — read it first.

- [ ] **Step 3: Add the strength meter to `RegisterPage`**

Below the password field, wired to the live form values:

```tsx
        <PasswordStrengthMeter
          password={watch('password') ?? ''}
          email={watch('email')}
          displayName={watch('displayName')}
        />
```

`watch` comes from the existing `useForm` destructuring; add it there if it is
not already pulled out.

- [ ] **Step 4: Apply the shared visual language**

On both pages, replace ad-hoc card and heading classes with the shared
utilities: `brand-card brand-surface brand-elev-lg` for the form container, and
`brand-h2` / `brand-lead` for the heading and supporting line. Keep every
existing form control, validation rule, submit handler, and OAuth button exactly
as it is — this step is styling only.

- [ ] **Step 5: Typecheck and lint**

```bash
cd /mnt/d/code/crm/crm-fe
npm run typecheck && npm run lint 2>&1 | grep -A5 "features/auth"
```

Expected: typecheck passes; no new lint error.

- [ ] **Step 6: Verify the demo panel gating survived**

```bash
cd /mnt/d/code/crm/crm-fe/src
grep -n "env.useMocks" features/auth/LoginPage.tsx
```

Expected: at least one match wrapping `DemoAccountPanel`. Losing this gate would
publish demo credentials in production.

- [ ] **Step 7: Checkpoint — do not commit**

---

## Task 18: Change-password card and i18n keys

**Files:**
- Modify: `crm-fe/src/features/profile/UserProfilePage.tsx`
- Modify: `crm-fe/src/i18n/locales/en/translation.json`

**Interfaces:**
- Consumes: `changePassword` from Task 16; `PasswordStrengthMeter` from Task 14.

- [ ] **Step 1: Add the change-password card**

Read `UserProfilePage.tsx` and add a card matching its existing section
structure, containing three fields — current password, new password, confirm new
password — the strength meter, and a submit handler calling `changePassword`.

On success, show a notice that other sessions were signed out, because
`/password/change` revokes every other session and the user should not discover
that by being logged out elsewhere without explanation.

- [ ] **Step 2: Add the translation keys**

Add under `auth.gateway` in `crm-fe/src/i18n/locales/en/translation.json`. Edit
the file by line-anchored text insertion, **not** by `json.load` + `json.dump`:
the file mixes compact single-line objects with expanded ones, and a Python
round-trip reformats large parts of it, turning a four-line change into a
ninety-line diff.

Keys required:

```
auth.gateway.login.forgotPassword          = "Forgot password?"
auth.gateway.forgot.title                  = "Reset your password"
auth.gateway.forgot.description            = "Enter the email address for your account and we will send a reset link."
auth.gateway.forgot.submit                 = "Send reset link"
auth.gateway.forgot.sentTitle              = "Check your email"
auth.gateway.forgot.sentDescription        = "If an account exists for {{email}}, a reset link is on its way. The link expires in 30 minutes."
auth.gateway.forgot.resend                 = "Send again"
auth.gateway.forgot.backToLogin            = "Back to sign in"
auth.gateway.reset.title                   = "Choose a new password"
auth.gateway.reset.description             = "Your new password must be at least 12 characters."
auth.gateway.reset.newPassword             = "New password"
auth.gateway.reset.confirmPassword         = "Confirm new password"
auth.gateway.reset.submit                  = "Update password"
auth.gateway.reset.mismatch                = "The two passwords do not match"
auth.gateway.reset.successTitle            = "Password updated"
auth.gateway.reset.successDescription      = "Sign in with your new password. Any other active sessions have been signed out."
auth.gateway.reset.invalidTitle            = "This link is not valid"
auth.gateway.reset.expiredTitle            = "This link has expired"
auth.gateway.reset.requestNew              = "Request a new link"
auth.gateway.change.title                  = "Change password"
auth.gateway.change.currentPassword        = "Current password"
auth.gateway.change.submit                 = "Change password"
auth.gateway.change.success                = "Password changed. Your other sessions have been signed out."
auth.gateway.password.strength.veryWeak    = "Very weak"
auth.gateway.password.strength.weak        = "Weak"
auth.gateway.password.strength.fair        = "Fair"
auth.gateway.password.strength.good        = "Good"
auth.gateway.password.strength.strong      = "Strong"
auth.gateway.password.violation.tooShort   = "Use at least 12 characters"
auth.gateway.password.violation.tooLong    = "Use at most 128 characters"
auth.gateway.password.violation.common     = "This password is too common"
auth.gateway.password.violation.containsIdentity = "Do not use your name or email in the password"
auth.gateway.errors.accountLocked          = "Your account is temporarily locked after too many failed sign-in attempts"
auth.gateway.errors.accountLockedUntil     = "Your account is locked until {{time}} after too many failed sign-in attempts. You can reset your password to unlock it now."
auth.gateway.errors.resetTokenInvalid      = "This password reset link is not valid"
auth.gateway.errors.resetTokenExpired      = "This password reset link has expired"
auth.gateway.errors.weakPassword           = "Choose a stronger password"
```

`accountLockedUntil` is the key that closes the loop: it names the unlock time
**and** points at the reset flow, which is the self-service unlock.

- [ ] **Step 3: Verify the JSON is valid and the diff is small**

```bash
cd /mnt/d/code/crm/crm-fe
node -e "JSON.parse(require('fs').readFileSync('src/i18n/locales/en/translation.json','utf8')); console.log('valid JSON')"
cd /mnt/d/code/crm
git show HEAD:crm-fe/src/i18n/locales/en/translation.json > /tmp/head-translation.json
diff /tmp/head-translation.json crm-fe/src/i18n/locales/en/translation.json | grep -c "^[<>]"
```

Expected: `valid JSON`, and a changed-line count close to the number of keys
added. A count in the hundreds means the file was reformatted.

`git diff` times out on this repository because `node_modules` is tracked; use
`git show` piped into `diff` as above.

- [ ] **Step 4: Full frontend verification**

```bash
cd /mnt/d/code/crm/crm-fe
npm run typecheck
npm run lint 2>&1 | grep -A5 "features/auth\|features/profile"
npm run verify:english-only
```

Expected: typecheck passes, no new lint errors, English-only passes.

- [ ] **Step 5: Checkpoint — do not commit**

---

## Task 19: Final verification sweep

**Files:** none modified.

- [ ] **Step 1: Backend compiles**

```bash
cd /mnt/d/code/crm/crm && mvn -q compile && mvn -q test-compile && echo "BACKEND OK"
```

Expected: `BACKEND OK`.

- [ ] **Step 2: Every Java audit event type is legal in both SQL files**

```bash
cd /mnt/d/code/crm
for e in PASSWORD_RESET_REQUESTED PASSWORD_RESET_COMPLETED PASSWORD_CHANGED LOGIN_BLOCKED_LOCKED; do
  a=$(grep -c "$e" docs/crm_mysql80_auth.sql)
  b=$(grep -c "$e" docs/migrations/2026-08-25-auth-password-lifecycle.sql)
  [ "$a" -ge 1 ] && [ "$b" -ge 1 ] && echo "ok  $e" || echo "MISSING  $e (schema=$a migration=$b)"
done
```

Expected: four `ok` lines. This pairing has no compile-time protection at all.

- [ ] **Step 3: Every error messageKey resolves in all three bundles**

```bash
cd /mnt/d/code/crm/crm
grep -o '"auth\.[a-z_]*"' src/main/java/com/crm/identity/domain/AuthenticationErrorCode.java \
  | tr -d '"' | while read -r k; do
  n=$(grep -l "^$k=" src/main/resources/messages.properties \
        src/main/resources/messages_en.properties \
        src/main/resources/messages_vi.properties 2>/dev/null | wc -l)
  [ "$n" -eq 3 ] && echo "ok  $k" || echo "MISSING ($n/3)  $k"
done
```

Expected: twelve `ok` lines, no misses.

- [ ] **Step 4: The token rename is complete and did not over-reach**

```bash
cd /mnt/d/code/crm/crm-fe/src
echo -n "leftover --lp- (expect 0): "; grep -ro -- "--lp-" . | wc -l
echo -n "leftover --auth- hex values (expect 0): "; grep -c "#F6F9FC\|#DCE5F0\|#EAF2FC" features/auth/auth.css
echo "decorative landing classes still prefixed lp- (expected, not a failure):"
grep -rho "lp-\(btn-sheen\|glass-card-dark\|tone-[a-z]*\|size-[a-z]*\)" . | sort -u
```

- [ ] **Step 5: The authenticated endpoint is not publicly exposed**

```bash
cd /mnt/d/code/crm/crm
grep -rn "password/change\|api/auth/password/\*\*" src/main/java/com/crm/identity/infrastructure/security/ \
  && echo "SCOPE VIOLATION" || echo "ok — change endpoint requires auth"
```

- [ ] **Step 6: Full frontend gate**

```bash
cd /mnt/d/code/crm/crm-fe
npm run typecheck && npm run verify:english-only
npm run lint 2>&1 | grep -A5 "features/auth\|features/profile\|features/landing"
```

Expected: typecheck and English-only pass; no new lint errors in the three
feature areas.

- [ ] **Step 7: No unintended dependency**

```bash
cd /mnt/d/code/crm
diff <(git show HEAD:crm-fe/package.json) crm-fe/package.json && echo "frontend deps unchanged"
git show HEAD:crm/pom.xml | diff - crm/pom.xml | grep "^>" | head
```

Expected: the frontend line prints; the backend diff shows only the
`spring-boot-starter-mail` addition.

- [ ] **Step 8: Report and stop**

Summarise what changed, state plainly that nothing is committed, and list what
the user must do before the feature works end to end:

1. Apply `docs/migrations/2026-08-25-auth-password-lifecycle.sql` to any
   existing database, checking the `DROP CHECK` constraint name first.
2. Set `CRM_MAIL_HOST`, `CRM_MAIL_USERNAME`, `CRM_MAIL_PASSWORD`, and
   `CRM_MAIL_FROM`. Until then the adapter logs the reset link at WARN and sends
   nothing.
3. Set `CRM_PASSWORD_RESET_URL` for any non-local frontend origin.

Do not claim the flow works: it has not been run.

---

## Appendix: Adaptations to the writing-plans skill

**Commits.** The skill ends each task with `git add` and `git commit`.
`AGENTS.md` §3 forbids commits, staging, branches, pushes, and pull requests.
Every task ends with an uncommitted checkpoint instead.

**Test-driven development.** The skill's red-green cycle assumes a test runner.
`AGENTS.md` §4 forbids running tests and starting the application; the user
authorised only `npm run typecheck`, `npm run lint`,
`npm run verify:english-only`, `mvn -q compile`, and `mvn -q test-compile`. Each
task therefore opens with a command whose output changes once the task is done —
the closest available analogue to a failing test — and closes by re-running it
clean plus compiling.

**No test file is created anywhere in this plan.** That is a consequence of the
repository rule, not an oversight. The invariants with no compile-time guard —
the audit-event `CHECK` list, the three message bundles, the public-route
matcher — are covered by the explicit greps in Task 19 precisely because no test
can cover them here.
