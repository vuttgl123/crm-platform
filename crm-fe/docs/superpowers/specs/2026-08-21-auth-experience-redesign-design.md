# VUM CRM Auth Experience Redesign Design

**Status:** Approved design  
**Date:** 2026-08-21  
**Workspace:** `crm-fe`  
**Product:** VUM CRM  
**Primary locale:** Vietnamese  

## Objective

Redesign the VUM CRM authentication experience so login, registration, OAuth callback, and pending approval feel like one production product rather than separate UAT screens. The result must align with the approved public landing visual language, preserve the existing authentication contracts, and make every visible control truthful about what the frontend and backend currently support.

The redesign covers:

- `/login`
- `/register`
- `/auth/callback`
- `/app/pending-approval`

## Current-State Diagnosis

The current auth experience has both visual and behavioral debt:

- `LoginPage.tsx` and `RegisterPage.tsx` are each approximately 400 lines and duplicate brand header, card structure, language selector, footer, input composition, password visibility, and error presentation.
- Both primary screens use a centered white card with a heavy shadow, small uppercase labels, dense spacing, and hardcoded hex values. This reads like an internal UAT utility rather than the entrance to the production product.
- Auth screens do not share the approved landing typography and visual rhythm even though they use the same brand and conversion path.
- Login exposes a “stay signed in for 30 days” control without connecting the value to the session or service layer.
- Quick demo accounts are always visible instead of being restricted to `env.useMocks`.
- Registration initializes legal consent as selected rather than requiring an explicit action.
- Registration validates passwords at 8 characters while the backend contract requires 12-128 characters.
- Registration asks for a business name and converts it into a tenant code, while the membership request contract actually expects an existing `tenantCode`.
- Registration copy says it creates a workspace even though the implemented flow creates a user and submits a request to join an existing tenant.
- Most registration copy, validation, control labels, status text, and footer text bypass the i18n layer.
- The language selectors are custom popovers without complete keyboard, Escape, expanded-state, or focus-return behavior.
- Password visibility buttons remove the default outline without providing a complete replacement in the local control.
- Field errors are visible but are not consistently connected with `aria-invalid` and `aria-describedby`.
- The login page does not map the backend OAuth failure query parameter `errorCode` even though the API reference defines stable OAuth error codes.
- The real SSO entry point is hardcoded to localhost, which is not safe for production deployment.
- OAuth callback and pending approval use unrelated colors, card styles, typography, loading treatments, and copy.
- Pending approval uses a simulated delay and toast before reloading instead of presenting the actual refresh action directly.
- Pending approval falls back to an invented organization name when session tenant data is unavailable.

## Goals

1. Establish one trust-first enterprise auth system across all four approved routes.
2. Make login and registration easy to scan, complete, and operate on desktop and mobile.
3. Share visual and interaction components instead of duplicating page shells.
4. Keep authentication, SSO, session restoration, membership, tenant, and protected-route contracts intact.
5. Remove controls and promises that are not backed by current behavior.
6. Match frontend validation and state messages to the implemented backend contract.
7. Provide complete Vietnamese and matching English translation structures.
8. Restrict demo-only affordances to mock mode and SSO affordances to configured providers.
9. Meet source-level accessibility, responsive, reduced-motion, and form requirements.
10. Isolate auth styling from landing and authenticated application styling.

## Non-Goals

- Adding forgotten-password, password-reset, email-verification, magic-link, passkey, MFA, CAPTCHA, or account-recovery flows.
- Adding or modifying backend authentication endpoints.
- Redesigning `/auth/session-expired`, `/app/setup-tenant`, protected application routes, or the landing pages.
- Changing cookie lifetime, access-token lifetime, refresh behavior, storage behavior, or the meaning of session persistence.
- Adding social login providers beyond Google and Microsoft.
- Creating a new tenant from the registration form.
- Changing role names, permissions, tenant scope, membership rules, or protected-route behavior.
- Adding a new UI, form, styling, icon, animation, or state-management dependency.
- Introducing dark mode.
- Adding analytics, tracking, marketing pixels, or new collection of personal data.
- Inventing legal text, support contacts, certifications, security guarantees, or customer proof.

## Selected Direction

The approved direction is **Enterprise Auth Gateway**.

On desktop, auth routes use a 42/58 split composition. A restrained brand panel provides context on the left, while the primary task is placed on a quiet white surface on the right. On smaller screens, the brand panel collapses to a compact brand introduction above the form so the primary action remains visible without a long preamble.

This direction was selected over two alternatives:

- A targeted centered-card refresh would reduce risk but retain the generic UAT structure and would not solve shared-shell duplication.
- A marketing-heavy visual experience would create a stronger first impression but distract from authentication and require unverified imagery or claims.

The auth gateway uses a restrained enterprise configuration:

- Design variance: `4/10`.
- Motion intensity: `2/10`.
- Visual density: `4/10`.

## Information Architecture

### Shared Auth Shell

`AuthShell` owns:

- The `.auth-theme` scope.
- A full-page `min-height: 100dvh` canvas.
- A visible-on-focus skip link to the main auth content.
- Desktop split layout and compact mobile layout.
- VUM wordmark linked to `/`.
- A route-specific utility link such as returning to login or opening `/demo`.
- The accessible language menu.
- Optional configured privacy and terms links.
- Copyright text and the current year.
- A `main` region that receives route content.

Pages must not create a second `main` landmark.

### Brand Panel

`AuthBrandPanel` contains only approved product evidence:

- Customer 360°.
- Pipeline by stage.
- Scope-based roles and permissions.

It uses one short value statement and no customer logos, testimonials, certification claims, metrics, screenshots, or stock photography. The panel is supporting context, not a second landing page.

### Route Responsibilities

| Route | Responsibility | Primary action |
|---|---|---|
| `/login` | Local login, configured SSO, and mock-only demo access | Đăng nhập |
| `/register` | Create a local identity and request access to an existing organization | Tạo tài khoản |
| `/auth/callback` | Exchange the OAuth refresh session, then route to the application or back to login with a stable error | Tiếp tục tự động |
| `/app/pending-approval` | Explain membership state and allow a real status refresh or logout | Kiểm tra trạng thái |

## Visual System

Auth visual tokens are scoped under `.auth-theme`. They match the approved landing palette but do not import or depend on `landing.css`.

| Token | Value | Use |
|---|---:|---|
| `--auth-canvas` | `#F5F8FC` | Page background |
| `--auth-surface` | `#FFFFFF` | Form surface |
| `--auth-ink` | `#07182B` | Primary text |
| `--auth-muted` | `#52647A` | Supporting text |
| `--auth-line` | `#DCE5F0` | Borders and dividers |
| `--auth-blue` | `#085AC0` | Primary action and focus |
| `--auth-blue-hover` | `#06499D` | Primary action hover |
| `--auth-blue-soft` | `#EAF2FC` | Brand panel and selected states |
| `--auth-danger` | `#BE123C` | Error text and error focus |
| `--auth-danger-soft` | `#FFF1F2` | Error background |

### Typography

- Headings and large brand display: `Plus Jakarta Sans` from the existing font loading.
- Vietnamese body, labels, controls, and messages: `Be Vietnam Pro`.
- The auth experience must not use Inter as its primary font.
- The route title is 32-40px on desktop and 28-32px on mobile.
- Form labels use sentence case at 13-14px and weight 600. They are not converted to wide-tracked uppercase.
- Body copy is 14-16px with a maximum width of approximately 60 characters.
- Headings use balanced wrapping and descriptions use pretty wrapping where supported.

### Surfaces and Shape Rules

- The desktop auth container may use a 16px radius where it reads as one bounded composition.
- Inputs and primary buttons use a 10px radius.
- Icon buttons use an 8px radius.
- The right form region does not appear as a floating shadow-heavy card inside another card.
- Elevation is restrained and tinted blue; borders and whitespace establish most hierarchy.
- The design uses one blue accent. It does not use gradient text, AI-purple gradients, glassmorphism, neon, random dark panels, or multiple accent colors.

### Motion

- Interactive feedback lasts 150-200ms.
- Only `transform`, `opacity`, `border-color`, `background-color`, and `color` may transition.
- No `transition: all`.
- No automatic entrance sequence, infinite loop, shimmer, glow, or decorative pulse.
- Button active feedback may use `transform: translateY(1px)` or `scale(0.98)`.
- `prefers-reduced-motion: reduce` removes non-essential transition duration.

## Responsive Behavior

### Desktop, 1024px and above

- The auth composition uses a 42/58 split.
- The total content width is capped near 1180px.
- The form column is visually centered within its region and the form itself is no wider than 440px.
- The brand panel retains ample whitespace and does not compete with the form.

### Tablet, 768-1023px

- The layout becomes a single column.
- The brand panel becomes a compact introduction containing logo, one sentence, and no capability list.
- The form remains no wider than 520px.

### Mobile, below 768px

- Horizontal padding is 16px plus safe-area support where needed.
- The form surface loses unnecessary outer border and shadow.
- Inputs and buttons are at least 44px high.
- SSO buttons stack vertically.
- The mock account selector uses the existing Collapsible primitive and starts closed.
- Footer links wrap intentionally without using a decorative bullet separator.
- Long Vietnamese copy wraps without horizontal document scrolling.
- The primary action remains within the initial viewport for normal login content.

## Component Architecture

```text
src/features/auth/
├── components/
│   ├── AuthShell.tsx
│   ├── AuthBrandPanel.tsx
│   ├── AuthLanguageMenu.tsx
│   ├── AuthPageHeader.tsx
│   ├── PasswordField.tsx
│   ├── AuthFormError.tsx
│   └── DemoAccountPanel.tsx
├── content/
│   └── authContent.ts
├── utils/
│   ├── authErrorMessages.ts
│   └── resolveReturnUrl.ts
├── auth.css
├── LoginPage.tsx
├── RegisterPage.tsx
├── AuthCallbackPage.tsx
└── PendingApprovalPage.tsx
```

Responsibilities:

- `AuthShell` composes page chrome, landmarks, responsive layout, legal links, and language selection.
- `AuthBrandPanel` renders verified brand context only.
- `AuthLanguageMenu` uses the existing Radix Dropdown Menu wrapper and owns menu accessibility.
- `AuthPageHeader` renders the route `h1` and its concise description.
- `PasswordField` owns password input composition and visibility state while accepting normal field registration and error linkage props.
- `AuthFormError` maps an error code to translated, actionable copy and renders the form-level alert.
- `DemoAccountPanel` imports mock account descriptors from typed content and renders only when `env.useMocks` is true.
- `authContent.ts` stores typed demo account descriptors and brand capability key references. It does not store credentials outside the existing mock fixture source.
- `authErrorMessages.ts` maps known stable error codes to translation keys and never exposes raw backend stack or technical strings.
- `resolveReturnUrl.ts` accepts only internal application paths.
- Each route page owns only its schema, page-specific state, submit behavior, and composition.
- `auth.css` contains auth tokens, auth-only utilities, responsive rules, and reduced-motion overrides under `.auth-theme`.

Shared components are not moved into `src/components/ui` unless they are genuinely generic outside auth. This task does not restyle global shadcn primitives.

## Shared Component Contracts

The implementation plan will preserve these boundaries:

```ts
import type { UseFormRegisterReturn } from 'react-hook-form';

export interface AuthShellProps {
  children: React.ReactNode;
  utilityLink?: {
    to: string;
    labelKey: string;
    direction: 'back' | 'forward';
  };
  brandVariant?: 'full' | 'compact';
}

export interface AuthPageHeaderProps {
  titleKey: string;
  descriptionKey: string;
}

export interface PasswordFieldProps {
  id: string;
  label: string;
  autoComplete: 'current-password' | 'new-password';
  error?: string;
  describedBy?: string;
  registration: UseFormRegisterReturn;
}

export interface AuthFormErrorProps {
  errorCode?: string;
  fallbackMessageKey: string;
}
```

`PasswordField` must not own submit behavior or a form schema.

## Public Auth Configuration

The centralized `AppConfig` adds:

```ts
googleSsoEnabled: boolean;
microsoftSsoEnabled: boolean;
oauthBaseUrl: string;
```

They are sourced from:

```text
VITE_ENABLE_GOOGLE_SSO
VITE_ENABLE_MICROSOFT_SSO
VITE_OAUTH_BASE_URL
```

Rules:

- In mock mode, Google and Microsoft remain available for demonstration through the existing mock service.
- In real mode, a provider button appears only when its enable flag is exactly `true`.
- `oauthBaseUrl` uses `VITE_OAUTH_BASE_URL` when configured.
- When `VITE_OAUTH_BASE_URL` is absent, the frontend derives the origin from `apiBaseUrl` and the browser origin. It does not fall back to a hardcoded localhost address in production code.
- These values are public configuration. They must not contain provider client secrets, refresh tokens, access tokens, or credentials.
- Existing `privacyPolicyUrl` and `termsUrl` values supply legal links.

No backend endpoint is added or changed, so this task does not modify `docs/api-reference.md` unless implementation uncovers an actual frontend-driven API contract change. The existing API reference remains the authority for password lengths, error codes, OAuth flow, and membership request behavior.

## Login Behavior

The login form retains:

- `email`.
- `password`.
- Google SSO when enabled.
- Microsoft SSO when enabled.
- Mock account selection only in mock mode.

Validation:

- Email is trimmed, required, valid, and no longer than 320 characters.
- Password is required and no longer than 128 characters.

Behavior:

- “Stay signed in for 30 days” is removed because the service has no matching option.
- Email uses `type="email"`, `inputMode="email"`, `autoComplete="email"`, and `spellCheck={false}`.
- Password uses `autoComplete="current-password"` and allows normal paste.
- The submit button remains enabled until a request begins.
- The active request disables only conflicting auth actions and uses a specific translated progress label ending in an ellipsis character.
- Form values remain intact after failure.
- Successful local login navigates to a sanitized internal `returnUrl` or `/app/overview`.
- `resolveReturnUrl` accepts paths beginning with one `/` and rejects protocol-relative paths beginning with `//`, full URLs, malformed encoding, and empty values.
- Auth context errors are cleared when entering a fresh auth page so errors do not leak between login and registration.

### OAuth Failure Query

The login page reads `errorCode` from the query string and maps these documented values:

| Code | User-facing intent |
|---|---|
| `OAUTH2_LOGIN_FAILED` | Provider sign-in could not be completed; retry or use local login |
| `EXTERNAL_EMAIL_NOT_VERIFIED` | The provider did not confirm the email address |
| `SELF_REGISTRATION_DISABLED` | A new VUM identity cannot be created through SSO in the current configuration |
| `EXTERNAL_IDENTITY_LINK_REQUIRED` | The email belongs to a local identity and needs an administrator-supported linking flow |
| `INVALID_CREDENTIALS` | The resolved account cannot sign in |

Unknown query values use one generic translated OAuth failure message. The page does not echo arbitrary query content.

## SSO Entry Behavior

- Google starts at `${oauthBaseUrl}/oauth2/authorization/google`.
- Microsoft starts at `${oauthBaseUrl}/oauth2/authorization/microsoft`.
- The frontend never places tokens, email addresses, tenant identifiers, or credentials in the SSO entry URL.
- The real service redirects the browser and does not navigate again in the page after starting real SSO.
- Mock SSO continues to return a mock session and follows normal internal navigation.
- SSO buttons expose provider-specific loading and disabled state without displaying a fake successful state.

## Registration Behavior

The registration form contains:

- Full name, sent as `displayName`.
- Work email, sent as `email`.
- Password.
- Existing organization code, sent as `tenantCode` for the membership request.
- Explicit legal consent in the UI.

The registration page does not say it creates a workspace or a new organization. Its primary message is “Tạo tài khoản và gửi yêu cầu gia nhập tổ chức của bạn.”

Validation:

- `displayName`: trimmed, 2-255 characters.
- `email`: trimmed, valid, maximum 320 characters.
- `password`: 12-128 characters, matching `POST /api/auth/register`.
- `tenantCode`: trimmed, non-blank, maximum 320 characters, matching `POST /api/membership-requests`.
- Legal consent: must be explicitly checked before submission.

Field behavior:

- Full name uses `autoComplete="name"`.
- Work email uses `type="email"`, `inputMode="email"`, `autoComplete="email"`, and `spellCheck={false}`.
- Password uses `autoComplete="new-password"`.
- Organization code uses `autoComplete="off"`, `spellCheck={false}`, and does not automatically generate a slug from a company name.
- Legal consent begins unchecked.
- Privacy and terms names become links only when the corresponding configured URL exists. No `href="#"` fallback is allowed.

After the current `registerUser` operation succeeds:

- An `INVITED` membership navigates directly to `/app/pending-approval`.
- An active tenant membership navigates to `/app/overview`.
- The UI does not render a success toast immediately before navigation.
- The UI does not claim a membership request succeeded unless the returned session state supports the pending route.

The task does not redesign the existing post-registration membership service contract. If implementation proves that the current service cannot distinguish user creation from membership-request failure, the handoff must report that as a separate backend/service-flow risk rather than invent a successful state.

## Form Error Handling

Known REST errors are mapped through `ApiError.errorCode` rather than string matching against `Error.message`.

| Code | Surface | Actionable result |
|---|---|---|
| `REQUEST_VALIDATION_FAILED` | Field or form | Show translated validation guidance; use field details when safely available |
| `INVALID_CREDENTIALS` | Login form | Use one generic credential message that does not reveal account existence |
| `SELF_REGISTRATION_DISABLED` | Registration or OAuth | Explain that registration is unavailable and link to `/demo` |
| `EMAIL_ALREADY_REGISTERED` | Registration | Suggest local login with a link to `/login` |
| `TENANT_NOT_AVAILABLE` | Registration | Ask the user to verify the organization code or contact the organization administrator |
| `MEMBERSHIP_REQUEST_ALREADY_PENDING` | Registration | Explain that a request already exists and direct the authenticated user to pending approval when session state is available |
| `NETWORK_ERROR` | Any auth form | Preserve values and offer retry without claiming mock fallback |

Rules:

- Raw backend trace IDs, stack messages, tokens, and arbitrary error strings are never displayed.
- Unknown errors use a translated generic message and one concrete next step.
- Field errors render directly below their controls.
- The first invalid field receives focus through React Hook Form.
- Every invalid control sets `aria-invalid="true"` and references its error through `aria-describedby`.
- Form-level errors use `role="alert"`.
- Non-error progress and callback states use `aria-live="polite"`.
- Inputs retain their values after API or network failure.

## OAuth Callback Behavior

`AuthCallbackPage` uses the compact auth shell and has two states:

- Loading: explain that the secure sign-in session is being completed.
- Error: explain that sign-in did not complete and provide a direct return to `/login`.

The callback still calls `realAuthService.handleOAuth2Callback()` because this route belongs to the real provider redirect flow. On success it navigates to `/app/overview`. On failure it navigates to `/login?errorCode=OAUTH2_LOGIN_FAILED` after showing the error state briefly.

Any redirect timer must be cleared during effect cleanup. The callback does not expose the raw error message, does not add tokens to the URL, and does not create a success state before the refresh exchange succeeds.

## Pending Approval Behavior

`PendingApprovalPage` uses the compact auth shell and renders:

- The authenticated user email when present.
- The actual session tenant display name or tenant code when present.
- A neutral “Chưa xác định tổ chức” value when tenant data is unavailable.
- The membership status from session state.
- A concise explanation that an organization administrator must review the request.
- A primary “Kiểm tra trạng thái” action.
- A secondary logout action.

The refresh action performs a direct page reload so the existing session restoration path can query current state. It does not add an 800ms simulated delay or show a toast that implies network progress before the reload.

The pending status visual may use amber because it represents a waiting state. It is not a CRM lifecycle badge and therefore does not use `LifecycleStageConfigMap`.

## Internationalization

- All auth headings, descriptions, labels, placeholders, helper text, validation messages, progress text, error messages, SSO text, mock-mode text, pending state copy, legal copy, footer text, and accessible labels live under `auth.*`.
- Vietnamese is complete and authoritative.
- English mirrors the same key tree and array lengths with intentional translations.
- Existing `landing.*` keys may be consumed only for a shared destination label when the wording is identical. Auth-specific content must not be stored under `landing.*`.
- `VUM` and `VUM CRM` use `translate="no"`.
- Loading labels use the single ellipsis character `…`, not three periods.
- Copy uses sentence case, active voice, and no exclamation marks in success or progress messages.

## Accessibility Requirements

- Each route has one `main` landmark supplied by `AuthShell` and one `h1` supplied by `AuthPageHeader`.
- The shell has a visible-on-focus skip link.
- All navigation uses `Link` or `a`; actions use `button`.
- Every input has a visible clickable label and stable `id` and `name`.
- Password visibility buttons have translated names, 44px touch targets where practical, and visible focus.
- Decorative input and provider icons use `aria-hidden="true"`.
- Google and Microsoft brand icons are hidden from assistive technology because the button text already supplies the name.
- The language trigger exposes an accessible name, `aria-expanded`, and menu state through the existing Radix primitive.
- The language menu supports keyboard opening, Arrow navigation, Escape, outside dismissal, and focus return.
- Checkboxes and labels share one practical hit area with no dead zone.
- Placeholder text is never used as the only label.
- Button, input, placeholder, helper, error, and focus colors meet WCAG AA contrast.
- Page zoom is not disabled.
- No information or action is available only on hover.

## Static Verification and Repository Constraints

The repository rules prohibit unit, integration, end-to-end, smoke, browser, API, manual runtime, application-start, and build verification unless the user gives a new explicit instruction.

Implementation must use only permitted static checks:

- `npm run typecheck`.
- `npm run lint`.
- Compare Vietnamese and English `auth.*` structures.
- Search auth source for hardcoded visible Vietnamese or English text outside translation resources.
- Search for `min-h-screen`, `transition-all`, `transition: all`, `focus:outline-none`, `href="#"`, and decorative non-semantic click targets.
- Confirm demo account descriptors are reachable only under an `env.useMocks` branch.
- Confirm SSO buttons are reachable only under provider configuration or mock mode.
- Confirm password registration constraints match the documented 12-128 character contract.
- Confirm OAuth query handling uses `errorCode` and known stable mappings.
- Confirm legal links use configured URLs and never dead hash links.
- Confirm auth CSS selectors remain under `.auth-theme`.
- Inspect the complete uncommitted diff without staging or committing.

The implementation handoff must state that responsive rendering, browser focus order, keyboard interaction, provider redirects, actual authentication, membership submission, and network behavior remain unverified until the user separately authorizes runtime checks.

## Acceptance Criteria

The redesign is ready for static handoff when:

- `/login`, `/register`, `/auth/callback`, and `/app/pending-approval` use the shared auth visual system.
- Login and registration pages no longer duplicate their page shell, language menu, password control, or form-error presentation.
- The desktop layout uses the approved 42/58 gateway composition and mobile uses the approved compact single-column composition.
- The design uses the exact professional-blue palette and approved typography under `.auth-theme`.
- Login no longer renders a non-functional 30-day session choice.
- Demo account selection is absent outside mock mode.
- Real-mode SSO buttons appear only for enabled providers and no real SSO URL is hardcoded to localhost.
- Login sanitizes `returnUrl` and maps the documented OAuth `errorCode` values.
- Registration collects an existing organization code rather than pretending a business name creates a workspace.
- Registration password validation matches the backend 12-128 character contract.
- Legal consent begins unchecked and legal destinations never point to `#`.
- Known API errors use stable code mapping and actionable translated text.
- Fields expose complete labels, autocomplete behavior, error relationships, and focus-visible styling.
- Callback and pending states use the same shell, typography, colors, and message hierarchy.
- Pending approval does not use a fake delay or invented organization fallback.
- Vietnamese and English auth key trees match.
- No new dependency is added.
- Existing routes, service method names, protected-route behavior, roles, permissions, and backend endpoints remain intact.
- `docs/api-reference.md` remains unchanged because no backend API behavior is added, modified, or removed.
- No prohibited test, build, app start, browser, API, or manual runtime command is run.
- No file is staged, committed, pushed, merged, or placed in a pull request.

## Risks and Mitigations

### Membership Request Outcome Is Not Explicit

Risk: the current registration service creates a user and then attempts a membership request, but it may not expose a separate membership-request result to the page.  
Mitigation: do not invent a successful membership state. Navigate from returned session state only and report any inability to distinguish partial success as a separate service-flow follow-up.

### Provider Availability Is Deployment-Specific

Risk: showing an SSO provider without matching backend credentials sends users into a broken redirect flow.  
Mitigation: real-mode provider buttons require explicit public enable flags; mock mode retains both demonstrations.

### Shared Visual Changes Leak Into Other Areas

Risk: changing global shadcn primitives or landing CSS could regress authenticated CRM screens or public landing pages.  
Mitigation: keep auth styling under `.auth-theme`, keep auth components within `src/features/auth`, and do not globally restyle primitives.

### Registration Copy Overpromises Organization Creation

Risk: users may believe registration creates a new CRM workspace.  
Mitigation: use exact join-request wording, collect an existing organization code, and direct organization-creation needs to the existing business contact path rather than simulating creation.

### Runtime Quality Cannot Be Proven Statically

Risk: source inspection cannot prove visual balance, responsive behavior, focus movement, OAuth redirect success, or live membership state.  
Mitigation: document each item as unverified. A later explicitly authorized pass can verify the running browser and live integrations.

## Approved Decision Record

- Scope: `/login`, `/register`, `/auth/callback`, and `/app/pending-approval`.
- Direction: Enterprise Auth Gateway.
- Layout: 42/58 split desktop, compact single column below 1024px.
- Theme: light professional-blue aligned with the production landing page.
- Typography: Plus Jakarta Sans headings and Be Vietnam Pro form/body text.
- Architecture: auth-scoped shared shell, components, utilities, content, and CSS.
- Login: local credentials, configured SSO, mock-only demo selector, no unsupported persistence control.
- Registration: local identity plus existing-organization join request, explicit consent, 12-128 character password.
- Error model: stable backend and OAuth error-code mapping with translated actionable copy.
- Motion: minimal interaction feedback and reduced-motion aware.
- Dependencies: existing repository stack only.
- API: no backend endpoint or contract change.
- Verification: static inspection only under current repository rules.
