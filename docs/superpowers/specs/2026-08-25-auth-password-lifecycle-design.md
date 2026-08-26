# Authentication Password Lifecycle and Sign-in Experience Design

**Status:** Approved
**Date:** 2026-08-25
**Scope:** `com.crm.identity` (backend) and `crm-fe/src/features/auth` (frontend) — password reset, password change, account-lock visibility, SMTP infrastructure, and a redesign of the sign-in and registration screens. Email verification and multi-factor authentication are deliberately deferred to a second package.

## 1. Context

Authentication is implemented in `com.crm.identity` as 47 Java files across a
three-layer DDD structure, with a matching `crm-fe/src/features/auth` of 16
files. The foundation is stronger than a first look suggests:

- Five endpoints — `register`, `login`, `refresh`, `logout`, `me`.
- JWT access tokens signed with PEM keys, plus rotating refresh tokens stored
  in an httpOnly cookie with reuse detection.
- OAuth2 sign-in for Google and Microsoft.
- A complete audit trail in `platform_auth_events`.
- On the frontend, `react-hook-form` with `zod` validation, full i18n, and a
  typed mapping of eleven error codes.
- `DemoAccountPanel` is correctly gated behind `env.useMocks`
  (`LoginPage.tsx:289`), so demo credentials never reach production.

This is not code that needs replacing. It has gaps.

### 1.1 There is no password recovery

A search across `features/auth` finds no occurrence of "forgot" or "reset",
and the backend exposes no matching endpoint. A user who forgets their
password has no route back into the system; an administrator must edit the
database by hand. This is the most severe gap.

### 1.2 Account lockout works but is invisible

`platform_user_credentials` carries `failed_login_attempts` and
`locked_until`. `AuthenticationPolicy` carries `maxFailedAttempts` and
`lockDuration`. `AuthenticationApplicationService.recordFailedLogin` increments
the counter and sets the lock correctly.

But at `AuthenticationApplicationService.java:115-121`, a locked account throws
`INVALID_CREDENTIALS` — the same error as a wrong password — and
`AuthenticationErrorCode` has no constant for the locked state at all. A locked
user sees "wrong email or password" for the entire lock window with no
indication of what happened or when it ends.

Retrying does not extend the lock: that branch does not call
`recordFailedLogin`, so the counter stays put. The defect is purely that the
user is never told.

The whole of the difficult work — schema, policy, counter, the
`findLocalByEmailForUpdate` row lock — is already done. What is missing is one
error code and one reordered branch.

### 1.3 There is no way to change a password

An authenticated user cannot change their own password. No endpoint exists.

### 1.4 Password rules check length only

`RegisterRequest` declares `@Size(min = 12, max = 128)` and the frontend `zod`
schema declares `min(12).max(128)`. The two already agree, which is good, but
neither rejects a common password, and the registration form offers no strength
feedback.

### 1.5 There is no email infrastructure of any kind

`pom.xml` has no mail dependency, there is no SMTP configuration, and the only
notification mechanism is `com.crm.notification.InAppNotificationService` —
in-app only, which is useless for password recovery, since reading an in-app
message requires being able to sign in.

`com.crm.integration` contains a complete outbox (`OutboxEvent`,
`OutboxRepository`, `JdbcOutboxRepository`, `OutboxEventStatus`) but the
repository contains no `@Scheduled`, `@Async`, or `@EnableAsync` anywhere. The
outbox is a store with no dispatcher.

## 2. Goals

- Give users a self-service route back into a locked or forgotten account.
- Tell a user their account is locked, without telling an attacker anything.
- Let an authenticated user change their own password.
- Introduce real SMTP delivery behind a narrow port.
- Rebuild the sign-in and registration screens on the shared brand token layer,
  so the public site and the sign-in gate read as one product.

## 3. Non-goals

- **Email verification and MFA are a separate package.** Password recovery adds
  a new flow and touches no existing data. Email verification changes what
  registration *means*, and immediately raises three questions about live data:
  do existing users count as verified, what happens to demo accounts, and does
  an unverified user get blocked from signing in. That is a policy decision on
  production data and belongs in its own cycle.
- OAuth2 sign-in flows are unchanged.
- Administrator-initiated password reset is out of scope.
- `PendingApprovalPage` and the membership-approval flow are unchanged.
- No change to `refresh`, `logout`, or `me`.

## 4. API contract

### 4.1 New endpoints

| Method | Path | Auth | Success |
|---|---|---|---|
| POST | `/api/auth/password/forgot` | none | **202**, empty body, always |
| POST | `/api/auth/password/reset` | none | 204 |
| POST | `/api/auth/password/change` | Bearer | 204 |

### 4.2 `/password/forgot` responds identically in every case

The endpoint returns 202 whether or not the address belongs to an account.
Matching the status code is not sufficient on its own: if the account exists
the server must generate a token, write a row, and send mail, while a
non-existent address returns immediately. That timing difference is itself an
enumeration oracle.

The whole of token generation and mail delivery therefore runs on an `@Async`
boundary. The endpoint returns 202 before any of it starts, so response time
does not depend on whether the account exists. This is also required for an
unrelated reason: SMTP is slow and prone to hanging, and must never block an
HTTP worker.

The existing outbox is deliberately **not** used. It has no dispatcher, so
adding one is an architectural decision for the whole integration package
rather than for this feature. `@EnableAsync` is three lines of standard Spring
configuration and adds no dependency.

### 4.3 `/password/reset` does not sign the user in

It returns 204, and the frontend redirects to the sign-in screen. The reason is
that a successful reset **revokes every open session for that account**.
Issuing a fresh session in the same transaction as a bulk revocation invites
half-applied states for no real gain.

Revoking all sessions is the point of the feature: a user resets their password
because they suspect their account is compromised. Leaving existing sessions
alive would let an attacker holding a stolen session continue unaffected.

`/password/change` revokes every session **except the caller's own**, so a user
changing their password does not sign themselves out.

### 4.4 New error codes

Added to `AuthenticationErrorCode`:

| Code | Meaning |
|---|---|
| `ACCOUNT_LOCKED` | Correct password, but the account is locked. Carries `lockedUntil`. |
| `PASSWORD_RESET_TOKEN_INVALID` | Unknown, malformed, already consumed, or superseded. |
| `PASSWORD_RESET_TOKEN_EXPIRED` | Well-formed and unconsumed, but past `expires_at`. |
| `WEAK_PASSWORD` | Rejected by `PasswordPolicy`. Carries the reason. |

`EXPIRED` is kept distinct from `INVALID` because the UI should offer to send a
fresh link in the first case and not in the second. There is no enumeration
risk here: the token is itself the secret.

### 4.5 `lockedUntil` travels as structured data

`ApiProblemFactory:50-52` already attaches `errorCode`, `path`, and `traceId`
through `problem.setProperty`. `lockedUntil` follows the same mechanism, as an
ISO-8601 instant.

It must **not** be baked into the `detail` string on the server. A server-built
sentence like "locked until 14:32" cannot be translated by the frontend and
cannot be rendered in the viewer's timezone. Structured data travels; the
sentence is assembled where the language and timezone are known.

A new `AccountLockedException extends CodedAuthenticationException` carries
`Instant lockedUntil`, and `GlobalExceptionHandler` reads it. A typed exception
is preferred over a loose property map.

## 5. Reset token model

### 5.1 New table

The design mirrors `platform_auth_sessions` exactly, because that table already
encodes the right pattern.

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

The second `CHECK` copies the `revoked_at` / `revoke_reason` pairing already
used by `platform_auth_sessions`; the third makes "consumed and invalidated at
the same time" unrepresentable. Any invariant expressible as a `CHECK` belongs
in the schema rather than in application discipline, because it then also holds
for hand-written SQL and data-repair scripts.

### 5.2 Token format

Identical in shape to the refresh token: `tokenId.secret`, where the secret is
32 bytes from `SecureRandom` encoded Base64URL, stored as a SHA-256 hex digest.

`RefreshTokenCodec` already implements exactly this, and its `matches` already
uses `MessageDigest.isEqual` for constant-time comparison. The hashing and
comparison are extracted into a package-private helper in
`identity/infrastructure/security/` used by both codecs. Cryptographic code is
the last place duplication is acceptable: fixing one copy and forgetting the
other produces a silent vulnerability.

### 5.3 Lifetime and rate limiting

Tokens live 30 minutes, configurable through `CrmSecurityProperties`.

Rate limiting needs no new infrastructure — the table itself is the ledger. A
user may be issued at most one token per 60 seconds and five per hour, counted
by querying rows for that user. Requesting a new link invalidates any
outstanding one with `invalidate_reason = 'SUPERSEDED'`.

### 5.4 New audit event types

`platform_auth_events.event_type` carries a `CHECK (event_type IN (...))`
listing seven hard-coded values. Recording the new events requires altering that
constraint — adding a Java constant alone is not enough, and the Java side
compiles perfectly either way. The new values are `PASSWORD_RESET_REQUESTED`,
`PASSWORD_RESET_COMPLETED`, `PASSWORD_CHANGED`, and `LOGIN_BLOCKED_LOCKED`.

This is the kind of defect static reading does not catch, and the repository's
no-run rule means it would otherwise surface only at runtime.

**The project has no migration tool.** There is no Flyway or Liquibase
dependency and no migration directory; `docs/crm_mysql80_auth.sql` holds
`CREATE TABLE` statements applied by hand. Editing the `CREATE TABLE` therefore
only helps a fresh installation — **every existing database keeps the old
constraint and will reject the new event types**.

Both artefacts are consequently required, and neither is optional:

1. The updated `CREATE TABLE` in `docs/crm_mysql80_auth.sql`, for new installs.
2. A separate `docs/migrations/2026-08-25-auth-password-lifecycle.sql`
   containing the `ALTER TABLE` for the `CHECK` constraint plus the
   `CREATE TABLE` for `platform_password_reset_tokens`, for existing databases.

The second file is new, and creating `docs/migrations/` establishes a
convention this repository does not yet have. That is a deliberate, minimal
addition: without it, a schema change of this kind has no delivery mechanism at
all for a database already in use.

## 6. Lockout flow

### 6.1 Reordering the login checks

Today the lock is evaluated before the password, so the service cannot tell a
genuine locked-out user from an attacker guessing. The new order:

| Step | Condition | Outcome |
|---|---|---|
| 1 | Email not found | dummy hash, audit, `INVALID_CREDENTIALS` *(unchanged)* |
| 2 | Account does not permit authentication | dummy hash, audit, `INVALID_CREDENTIALS` *(unchanged)* |
| 3 | **Verify the password first** | — |
| 4 | Password wrong **and** locked | audit, `INVALID_CREDENTIALS`, **counter not incremented** |
| 5 | Password wrong, not locked | `recordFailedLogin`, `INVALID_CREDENTIALS` |
| 6 | **Password correct, locked** | audit `LOGIN_BLOCKED_LOCKED`, `ACCOUNT_LOCKED` + `lockedUntil` |
| 7 | Password correct, not locked | sign in *(unchanged)* |

`ACCOUNT_LOCKED` only ever reaches someone who has proved they know the
password. An attacker guessing always receives `INVALID_CREDENTIALS` and learns
nothing.

Step 4 preserves today's behaviour of not extending an existing lock. And
because step 3 now always performs a real hash for an existing account, timing
becomes *more* uniform than it is today, where the locked branch hashes for
real while the not-permitted branch hashes a dummy.

### 6.2 Password reset is the self-service unlock

`JdbcIdentityRepository.recordSuccessfulLogin` already sets
`failed_login_attempts = 0, locked_until = NULL`. `/password/reset` performs the
same two updates.

This makes password reset the unlock path: a locked user who does not want to
wait simply resets their password. No unlock endpoint is needed, and no
administrator is involved. The behaviour falls out of building both features in
one package and is the strongest argument against separating them.

## 7. Password policy

The `min 12, max 128` length rule is kept and already agrees on both sides.
Two content rules are added:

- Reject passwords on a deny-list of roughly 200 common passwords, embedded in
  source rather than loaded from a large file.
- Reject passwords containing the email local-part, or a significant run of
  characters from the display name.

**Character-composition rules are deliberately not added.** NIST SP 800-63B
recommends against them: requiring an uppercase letter, a digit, and a symbol
pushes users toward predictable shapes such as `Password1!` without adding real
entropy. A 12-character floor plus a deny-list targets what real attacks
actually use, which is dictionaries rather than exhaustive search.

The rules live in a `PasswordPolicy` domain service in
`com.crm.identity.domain`, applied by all three flows — register, reset, and
change — so the backend has exactly one enforcement point. Violations raise
`WEAK_PASSWORD` with the reason attached to the `ProblemDetail`.

The frontend mirrors the rules in `passwordPolicy.ts` for immediate feedback,
but the backend remains authoritative. Duplication across a language boundary
cannot be avoided; the honest treatment is to acknowledge it and keep each side
in a single file so the two can be compared.

The strength indicator is hand-written from length, character variety, and a
deny-list hit. `zxcvbn` is not introduced: it costs over 400KB gzipped for a
four-level bar.

## 8. Mail infrastructure

- Add `spring-boot-starter-mail`. Configure through the standard `spring.mail.*`
  properties, sourced from environment variables.
- Port `PasswordResetMailer` in `identity/application/port/`, deliberately
  narrow: `sendResetLink(email, displayName, resetUrl, expiresAt)`. The
  application layer never assembles a subject line or HTML.
- Adapter `SmtpPasswordResetMailer` in `identity/infrastructure/mail/`, with a
  plain-text and a minimal HTML template under `resources/mail/`.
- `@EnableAsync` on the identity configuration; the send path is `@Async`.

**Mail copy is localized, not English-only.** The repository's English-only rule
governs the frontend interface; the backend is bilingual and already has the
machinery. `src/main/resources` carries `messages.properties`,
`messages_en.properties`, and `messages_vi.properties`, each holding eight
`auth.*` keys today, resolved through the existing `ErrorMessageTranslator`.
Mail subject and body text go through the same `MessageSource`.

**The locale must be captured before the async hop.** Spring resolves the
request locale into `LocaleContextHolder`, which is thread-local and does **not**
propagate across an `@Async` boundary. The mail task would silently fall back to
the default locale for every user. `PasswordResetMailer.sendResetLink` therefore
takes an explicit `Locale` parameter, read from the request thread and passed
into the async call.

A narrow port is preferred to a general `MailSender`. The application layer says
only "send a reset link" and knows nothing about subjects, encodings, or
markup. When the deferred package adds email verification it gets its own
narrow port; two shallow, specific ports are easier to reason about and replace
than one wide port that anything can call for anything.

**Development fallback.** When `spring.mail.host` is not configured, the adapter
logs the reset URL at WARN instead of failing. This is operational hygiene so
local development and CI keep working without credentials, not a substitute for
delivery — real SMTP is the design, and a host must be supplied to run for
real.

## 9. Frontend

### 9.1 The brand token layer becomes shared

`auth.css` declares `--auth-*` tokens that are a third copy of the same
palette, forked from the landing values and already drifting from them:

| Role | `--auth-*` | Current landing token |
|---|---|---|
| canvas | `#F6F9FC` | `#F5F8FC` |
| line | `#DCE5F0` | `#DFE7F1` |
| blue-soft | `#EAF2FC` | `#EEF5FE` |
| ink, muted, blue | identical | identical |

This is the worst kind of inconsistency: close enough to read as a rendering
fault rather than a decision. Following the sign-in link from the landing
header shifts the background by one step for no reason a viewer can name.

`auth.css` also declares `--auth-danger` and `--auth-danger-soft`, which the
landing tokens lack because the landing page has no error states. That is a
genuine addition and is folded into the shared layer as `--brand-danger-*`.

The token block and the generic utilities move from `landing.css` into
`src/styles/brand-tokens.css`, scoped `.landing-theme, .auth-theme`:

- **Moves:** all custom properties, the type utilities (`display`, `h2`, `h3`,
  `lead`, `eyebrow`, `caption`), the card utilities (`card`, `surface`,
  `surface-sunk`, `elev-*`), the action buttons, the focus rings, and `reveal`.
- **Stays in `landing.css`:** `.landing-section`, `.landing-container`,
  `.lp-tone-*`, `.lp-size-*`, the mock-card animation, the decorative classes
  (`lp-btn-sheen`, `lp-glass-card-dark`, `lp-animate-float`,
  `lp-flow-pulse-particle`, `lp-gradient-text`), and the `--landing-*` alias
  block.
- **Stays in `auth.css`:** `.auth-frame`, `.auth-brand-panel`, and the other
  auth-specific layout classes.

Auth consumes the shared layer through CSS classes and does **not** import the
landing `Surface` or `Reveal` React components. Sharing at the CSS level costs
nothing — no import, no dependency edge from `features/auth` into
`features/landing`. `Surface` is only a typed React wrapper over the same
classes.

### 9.2 Token prefix rename

The prefix `--lp-` reads as "landing page" and is now wrong for a shared brand
palette. All custom properties are renamed `--lp-*` to `--brand-*`, along with
the generic utility classes that move to the shared file.

**The landing-specific decorative classes keep the `lp-` prefix.**
`lp-glass-card-dark` and `lp-flow-pulse-particle` genuinely belong to the
landing page; renaming them to `brand-*` would misstate where they live.

Measured at design time: 369 occurrences of `--lp-` across 21 files.

### 9.3 Screens

| Screen | State | Notes |
|---|---|---|
| `LoginPage` | redesigned | adds a forgot-password link; renders `ACCOUNT_LOCKED` with the unlock time |
| `RegisterPage` | redesigned | adds the password strength indicator |
| `ForgotPasswordPage` | **new** | email input, then a confirmation screen that is identical whether or not the address exists |
| `ResetPasswordPage` | **new** | reads `?token=`, sets the new password |

**Changing a password does not live in `features/auth`.** It becomes a card in
`features/profile/UserProfilePage.tsx`. Users look for it on their profile, not
at the sign-in gate, and this adds no new route.

The visual direction follows the landing page: the same mesh-gradient
background as the hero, the form card at the highest elevation step, and the
same type scale, so following the sign-in link reads as one continuous product
rather than a jump to a different site.

### 9.4 Routing

Two new public routes in `AppRoutes.tsx`, both inside `AuthShell`:
`/forgot-password` and `/reset-password`.

### 9.5 An internal API change in `authErrorMessages.ts`

`AUTH_ERROR_CODES` grows by four entries. But `ACCOUNT_LOCKED` does not fit
that module's existing shape: it needs the unlock time interpolated into the
message, while `getAuthErrorMessageKey` returns a static translation key.

`normalizeAuthError` therefore changes its return type from `AuthErrorCode` to
`{ code: AuthErrorCode; lockedUntil?: string }`. This breaks every current
caller — `LoginPage`, `RegisterPage`, and `AuthCallbackPage` — all of which are
updated in the same task.

The module was designed on the assumption that an error code maps to exactly
one translation key, which held for all eleven existing codes. The twelfth
carries data, and the assumption breaks. A lookup table survives until its
first parameterised entry.

## 10. Internationalization

All interface copy continues through `react-i18next`. Roughly 30 new keys under
`auth.gateway.*` cover the two new screens, the strength indicator, and the four
new error codes. No existing key is removed or renamed.

## 11. File inventory

**Backend — new**

```
identity/application/port/PasswordResetMailer.java
identity/application/command/ForgotPasswordCommand.java
identity/application/command/ResetPasswordCommand.java
identity/application/command/ChangePasswordCommand.java
identity/application/service/PasswordResetApplicationService.java
identity/application/port/PasswordResetTokenRepository.java
identity/domain/PasswordPolicy.java
identity/domain/PasswordResetToken.java
identity/infrastructure/persistence/JdbcPasswordResetTokenRepository.java
identity/infrastructure/mail/SmtpPasswordResetMailer.java
identity/infrastructure/security/TokenHashing.java
identity/presentation/web/ForgotPasswordRequest.java
identity/presentation/web/ResetPasswordRequest.java
identity/presentation/web/ChangePasswordRequest.java
foundation/security/AccountLockedException.java
resources/mail/password-reset.txt
resources/mail/password-reset.html
```

**Backend — modified**

```
pom.xml                                        spring-boot-starter-mail
identity/domain/AuthenticationErrorCode.java   four new codes
identity/application/service/AuthenticationApplicationService.java  reordered login
identity/application/usecase/AuthenticationFacade.java
identity/presentation/web/AuthenticationController.java  three endpoints
identity/presentation/web/RegisterRequest.java           policy hook
identity/infrastructure/config/CrmSecurityProperties.java  reset TTL, rate limits
identity/infrastructure/config/IdentitySecurityConfiguration.java  @EnableAsync
identity/infrastructure/security/RefreshTokenCodec.java  uses TokenHashing
identity/infrastructure/persistence/JdbcIdentityRepository.java  clear lock on reset
identity/application/port/IdentityRepository.java
foundation/web/error/GlobalExceptionHandler.java  lockedUntil property
docs/crm_mysql80_auth.sql                      new table, altered CHECK
docs/api-reference.md                          three endpoints, four codes
resources/messages.properties                  4 error keys + mail copy
resources/messages_en.properties               4 error keys + mail copy
resources/messages_vi.properties               4 error keys + mail copy
```

**Backend — new, schema delivery**

```
docs/migrations/2026-08-25-auth-password-lifecycle.sql
```

**Frontend — new**

```
src/styles/brand-tokens.css
features/auth/ForgotPasswordPage.tsx
features/auth/ResetPasswordPage.tsx
features/auth/components/PasswordStrengthMeter.tsx
features/auth/utils/passwordPolicy.ts
features/auth/services/passwordResetService.ts
```

**Frontend — modified**

```
features/landing/landing.css        token block extracted, prefix renamed
features/auth/auth.css              consumes shared tokens
features/auth/LoginPage.tsx         redesign, forgot link, ACCOUNT_LOCKED
features/auth/RegisterPage.tsx      redesign, strength meter
features/auth/AuthCallbackPage.tsx  normalizeAuthError signature
features/auth/components/AuthShell.tsx
features/auth/utils/authErrorMessages.ts  four codes, new return type
features/profile/UserProfilePage.tsx      change-password card
routes/AppRoutes.tsx                      two routes
i18n/locales/en/translation.json          ~30 keys
plus the 21 files carrying --lp- occurrences (mechanical rename)
```

## 12. Verification

The repository forbids running tests and starting the application. The user has
explicitly authorised, for this work:

- `npm run typecheck`, `npm run lint`, `npm run verify:english-only` (frontend)
- `mvn -q compile` and `mvn -q test-compile` (backend, compile only — no test
  execution, no application start, no database)

`npm run build`, `npm run dev`, `mvn verify`, and `mvn test` remain out of
bounds.

`npm run lint` is red at baseline across the repository and must be judged as
"no new error in a file this work touches", not as a pass/fail gate. This was
measured during the preceding landing-page work.

Additional static checks:

- Every value in the Java audit-event enum appears in the
  `platform_auth_events.event_type` `CHECK` list, verified by grep in both
  directions. This pairing has no compile-time protection.
- `grep -rn -- "--lp-" crm-fe/src` returns nothing after the rename, except in
  the landing-specific decorative class names, which keep the prefix by design.
- `grep -rn -- "--auth-" crm-fe/src` returns nothing.
- Every new `AuthenticationErrorCode.messageKey()` has a matching entry in all
  three `messages*.properties` bundles, verified by grep. A missing key
  compiles and lints cleanly, then surfaces as a raw key string in the user's
  error message.
- `docs/migrations/2026-08-25-auth-password-lifecycle.sql` exists and its
  `CHECK` list matches the one in `docs/crm_mysql80_auth.sql` exactly. These two
  files can drift silently and nothing else compares them.
- `docs/api-reference.md` documents all three new endpoints, per `AGENTS.md` §5.

Visual and end-to-end confirmation is the user's.

## 13. Risks

**The token rename collides with work in progress.** The prefix rename touches
369 occurrences across 21 files, several of which the user has been editing
directly. The rename must run as a single mechanical pass at a point when no
edits are outstanding, and must preserve hand-made changes such as the
`.lp-tone-dark::before` opacity and grid-size adjustment. If that cannot be
guaranteed, the rename is severable: it can be dropped without affecting any
other part of this design.

**The audit-event `CHECK` constraint has no compile-time guard.** Adding a Java
enum value without altering the constraint compiles and lints cleanly, then
fails at runtime on the first write. The paired grep in section 12 is the only
available protection.

**SMTP cannot be exercised.** Without a mail host and without permission to run
the application, delivery is unverifiable in this cycle. The narrow port limits
the blast radius: everything except the adapter is exercised by compilation,
and the adapter is small.

**`normalizeAuthError` changes shape.** Three call sites must be updated in the
same task or the frontend will not typecheck. This is caught immediately by
`npm run typecheck`.

## 14. Out of scope

Email verification, multi-factor authentication, administrator-initiated
password reset, changes to the OAuth2 flows, `PendingApprovalPage`, and any
change to `refresh`, `logout`, or `me`.
