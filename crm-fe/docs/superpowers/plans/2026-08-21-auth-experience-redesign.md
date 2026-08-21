# VUM CRM Auth Experience Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the UAT-like login, registration, OAuth callback, and pending-approval screens with one production-oriented Enterprise Auth Gateway.

**Architecture:** Keep all new visual behavior scoped inside `src/features/auth`, compose the four routes through a shared `AuthShell`, and leave existing route and backend service contracts intact. Centralized utilities sanitize internal redirects and map stable auth error codes, while public environment configuration controls real SSO visibility and its deployment base URL.

**Tech Stack:** React 18, TypeScript 5.7 strict mode, Vite 6, React Router 6, Tailwind CSS 3.4, shadcn/Radix primitives, react-i18next, react-hook-form, zod, Lucide.

**Spec:** `docs/superpowers/specs/2026-08-21-auth-experience-redesign-design.md`

## Global Constraints

- Work only inside `crm-fe`.
- Read `AGENTS.md` and the approved spec before editing.
- Inspect the worktree before every task and preserve all user-authored changes.
- Do not stage, commit, push, merge, create a branch, create a worktree, or open a pull request.
- Do not run unit, integration, end-to-end, smoke, browser, API, manual runtime, application-start, or build commands.
- `npm run typecheck` and `npm run lint` are the only permitted npm verification commands.
- Do not add or upgrade dependencies.
- Do not modify backend endpoints, authentication cookies, token lifetime, storage behavior, roles, permissions, membership rules, or protected-route behavior.
- Do not redesign `/auth/session-expired`, `/app/setup-tenant`, landing pages, or authenticated application pages.
- Keep the experience Vietnamese-first with a structurally matching English `auth.gateway` tree.
- Use light mode only and the exact professional-blue auth palette from the spec.
- Use `Plus Jakarta Sans` for auth headings and `Be Vietnam Pro` for auth body, labels, and controls.
- Do not use gradient text, AI-purple gradients, glassmorphism, neon, stock imagery, fabricated proof, or a heavy floating-card composition.
- Do not render demo accounts outside `env.useMocks`.
- Do not render a real SSO provider unless its public enable flag is true.
- Do not add “Quên mật khẩu” or any unsupported auth action.
- Do not display raw backend messages, trace IDs, tokens, credentials, or arbitrary query-string values.
- Do not modify `docs/api-reference.md`; no backend API behavior changes in this plan.
- Report visual rendering, breakpoints, keyboard behavior, live OAuth, authentication, membership submission, and network behavior as unverified.

---

## File Map

### Create

```text
src/features/auth/auth.css
src/features/auth/components/AuthShell.tsx
src/features/auth/components/AuthBrandPanel.tsx
src/features/auth/components/AuthLanguageMenu.tsx
src/features/auth/components/AuthPageHeader.tsx
src/features/auth/components/PasswordField.tsx
src/features/auth/components/AuthFormError.tsx
src/features/auth/components/DemoAccountPanel.tsx
src/features/auth/content/authContent.ts
src/features/auth/utils/authErrorMessages.ts
src/features/auth/utils/resolveReturnUrl.ts
```

### Modify

```text
.env.example
index.html
src/config/env.ts
src/vite-env.d.ts
src/services/api/RealAuthService.ts
src/features/auth/LoginPage.tsx
src/features/auth/RegisterPage.tsx
src/features/auth/AuthCallbackPage.tsx
src/features/auth/PendingApprovalPage.tsx
src/i18n/locales/vi/translation.json
src/i18n/locales/en/translation.json
```

### Preserve Unchanged

```text
src/routes/AppRoutes.tsx
src/features/auth/AuthLogin.tsx
src/features/auth/AuthRegister.tsx
src/core/session/AuthContext.tsx
src/core/session/context.ts
src/services/contracts/IAuthService.ts
src/services/mock/MockAuthService.ts
src/types/auth.ts
src/features/tenant/TenantSetupPage.tsx
docs/api-reference.md
```

---

### Task 1: Add production-safe public SSO configuration

**Files:**
- Modify: `.env.example`
- Modify: `src/config/env.ts`
- Modify: `src/vite-env.d.ts`
- Modify: `src/services/api/RealAuthService.ts:101-106`

**Interfaces:**
- Produces: `env.googleSsoEnabled`, `env.microsoftSsoEnabled`, and `env.oauthBaseUrl`.
- Preserves: `IAuthService.loginWithSSO(payload): Promise<UserSessionContext>` and all existing environment fields.

- [ ] **Step 1: Inspect the current config and real SSO entry path**

Run:

```bash
rtk read AGENTS.md docs/superpowers/specs/2026-08-21-auth-experience-redesign-design.md
rtk read .env.example src/config/env.ts src/vite-env.d.ts src/services/api/RealAuthService.ts src/services/contracts/IAuthService.ts
rtk git status --short
```

Expected: the current real service still contains a localhost OAuth URL and no overlapping user change is overwritten.

- [ ] **Step 2: Extract shared config inputs and define OAuth base resolution**

In `src/config/env.ts`, retain `readOptionalEnv` and add these constants before `AppConfig`:

```ts
const browserOrigin =
  typeof window === 'undefined' ? 'http://localhost:3001' : window.location.origin;

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
const useMocks = import.meta.env.VITE_USE_MOCKS === 'true';

const resolveOAuthBaseUrl = (
  configuredValue: string | undefined,
  fallbackApiBaseUrl: string
): string => {
  const configured = readOptionalEnv(configuredValue);
  if (configured) {
    try {
      return new URL(configured, browserOrigin).toString().replace(/\/$/, '');
    } catch {
      return browserOrigin;
    }
  }

  try {
    return new URL(fallbackApiBaseUrl, browserOrigin).origin;
  } catch {
    return browserOrigin;
  }
};
```

Remove the old duplicate `browserOrigin` declaration. Do not log rejected environment values.

- [ ] **Step 3: Extend `AppConfig` and `env` with exact public flags**

Add to `AppConfig`:

```ts
googleSsoEnabled: boolean;
microsoftSsoEnabled: boolean;
oauthBaseUrl: string;
```

Use these exact assignments in `env`:

```ts
apiBaseUrl,
useMocks,
googleSsoEnabled:
  useMocks || import.meta.env.VITE_ENABLE_GOOGLE_SSO === 'true',
microsoftSsoEnabled:
  useMocks || import.meta.env.VITE_ENABLE_MICROSOFT_SSO === 'true',
oauthBaseUrl: resolveOAuthBaseUrl(
  import.meta.env.VITE_OAUTH_BASE_URL,
  apiBaseUrl
),
```

Keep all existing landing/demo configuration assignments unchanged.

- [ ] **Step 4: Document and type the public SSO variables**

Append these defaults to `.env.example` without changing existing values:

```dotenv
VITE_ENABLE_GOOGLE_SSO=false
VITE_ENABLE_MICROSOFT_SSO=false
VITE_OAUTH_BASE_URL=http://localhost:8080
```

Add the matching readonly fields to `ImportMetaEnv` in `src/vite-env.d.ts`:

```ts
readonly VITE_ENABLE_GOOGLE_SSO: string;
readonly VITE_ENABLE_MICROSOFT_SSO: string;
readonly VITE_OAUTH_BASE_URL: string;
```

Do not place a production hostname, secret, OAuth client ID, client secret, token, or credential in either file. Deployment-specific values remain environment-owned.

- [ ] **Step 5: Replace the hardcoded real SSO redirect**

Replace `RealAuthService.loginWithSSO` with:

```ts
public async loginWithSSO(payload: SSOLoginPayload): Promise<UserSessionContext> {
  const provider = payload.provider === 'GOOGLE' ? 'google' : 'microsoft';
  window.location.assign(
    `${env.oauthBaseUrl}/oauth2/authorization/${provider}`
  );
  return new Promise<UserSessionContext>(() => undefined);
}
```

Import `env` from `@/config/env`. Do not add email, tenant, token, or return URL query parameters to this redirect.

- [ ] **Step 6: Perform static SSO configuration inspection**

Run:

```bash
rtk read .env.example src/config/env.ts src/vite-env.d.ts src/services/api/RealAuthService.ts
rtk grep -n "localhost:8080/oauth2|VITE_ENABLE_GOOGLE_SSO|VITE_ENABLE_MICROSOFT_SSO|VITE_OAUTH_BASE_URL|oauthBaseUrl" .env.example src
```

Expected: no real auth service contains a hardcoded localhost OAuth entry URL; all three variables are documented and typed; mock mode enables both existing mock providers.

---

### Task 2: Create auth redirect, error, and mock-content boundaries

**Files:**
- Create: `src/features/auth/utils/resolveReturnUrl.ts`
- Create: `src/features/auth/utils/authErrorMessages.ts`
- Create: `src/features/auth/content/authContent.ts`

**Interfaces:**
- Produces: `resolveReturnUrl(rawValue)`, `AuthErrorCode`, `normalizeAuthError(error)`, `normalizeOAuthErrorCode(value)`, `getAuthErrorMessageKey(code, fallbackKey)`, `authBrandCapabilityKeys`, and `demoAccountOptions`.
- Consumes: `ApiError`, `DEMO_PASSWORD`, `DEMO_ROLES`, `DemoRoleCode`, and `LoginCredentials`.

- [ ] **Step 1: Create strict internal return URL resolution**

Create `resolveReturnUrl.ts` with:

```ts
const DEFAULT_RETURN_URL = '/app/overview';

export function resolveReturnUrl(rawValue: string | null): string {
  if (
    !rawValue ||
    !rawValue.startsWith('/') ||
    rawValue.startsWith('//') ||
    rawValue.includes('\\') ||
    rawValue.includes('\uFFFD') ||
    /%(?![0-9A-Fa-f]{2})/.test(rawValue)
  ) {
    return DEFAULT_RETURN_URL;
  }

  try {
    const origin = window.location.origin;
    const resolved = new URL(rawValue, origin);
    if (resolved.origin !== origin) return DEFAULT_RETURN_URL;
    return `${resolved.pathname}${resolved.search}${resolved.hash}`;
  } catch {
    return DEFAULT_RETURN_URL;
  }
}
```

Do not call `decodeURIComponent`; `URLSearchParams` already returns a decoded value. The replacement-character and malformed-percent guards ensure corrupt encodings fall back to `/app/overview` instead of being normalized into an unexpected route.

- [ ] **Step 2: Define the exact auth error model**

Create `authErrorMessages.ts` with these exports:

```ts
import { ApiError } from '@/services/api/apiClient';

export const AUTH_ERROR_CODES = [
  'NETWORK_ERROR',
  'REQUEST_VALIDATION_FAILED',
  'INVALID_CREDENTIALS',
  'SELF_REGISTRATION_DISABLED',
  'EMAIL_ALREADY_REGISTERED',
  'TENANT_NOT_AVAILABLE',
  'MEMBERSHIP_REQUEST_ALREADY_PENDING',
  'OAUTH2_LOGIN_FAILED',
  'EXTERNAL_EMAIL_NOT_VERIFIED',
  'EXTERNAL_IDENTITY_LINK_REQUIRED',
  'UNKNOWN_ERROR',
] as const;

export type AuthErrorCode = (typeof AUTH_ERROR_CODES)[number];

const AUTH_ERROR_CODE_SET = new Set<string>(AUTH_ERROR_CODES);

const AUTH_ERROR_MESSAGE_KEYS: Record<AuthErrorCode, string> = {
  NETWORK_ERROR: 'auth.gateway.errors.network',
  REQUEST_VALIDATION_FAILED: 'auth.gateway.errors.requestValidation',
  INVALID_CREDENTIALS: 'auth.gateway.errors.invalidCredentials',
  SELF_REGISTRATION_DISABLED: 'auth.gateway.errors.registrationDisabled',
  EMAIL_ALREADY_REGISTERED: 'auth.gateway.errors.emailRegistered',
  TENANT_NOT_AVAILABLE: 'auth.gateway.errors.tenantNotAvailable',
  MEMBERSHIP_REQUEST_ALREADY_PENDING: 'auth.gateway.errors.membershipPending',
  OAUTH2_LOGIN_FAILED: 'auth.gateway.errors.oauthFailed',
  EXTERNAL_EMAIL_NOT_VERIFIED: 'auth.gateway.errors.externalEmailNotVerified',
  EXTERNAL_IDENTITY_LINK_REQUIRED: 'auth.gateway.errors.identityLinkRequired',
  UNKNOWN_ERROR: 'auth.gateway.errors.unknown',
};

export function normalizeAuthError(error: unknown): AuthErrorCode {
  if (error instanceof ApiError && AUTH_ERROR_CODE_SET.has(error.errorCode)) {
    return error.errorCode as AuthErrorCode;
  }
  if (error instanceof TypeError) return 'NETWORK_ERROR';
  return 'UNKNOWN_ERROR';
}

export function normalizeOAuthErrorCode(
  value: string | null
): AuthErrorCode | undefined {
  if (!value) return undefined;
  const allowedOAuthCodes: AuthErrorCode[] = [
    'OAUTH2_LOGIN_FAILED',
    'EXTERNAL_EMAIL_NOT_VERIFIED',
    'SELF_REGISTRATION_DISABLED',
    'EXTERNAL_IDENTITY_LINK_REQUIRED',
    'INVALID_CREDENTIALS',
  ];
  return allowedOAuthCodes.includes(value as AuthErrorCode)
    ? (value as AuthErrorCode)
    : 'OAUTH2_LOGIN_FAILED';
}

export function getAuthErrorMessageKey(
  code: AuthErrorCode | undefined,
  fallbackKey: string
): string {
  return code ? AUTH_ERROR_MESSAGE_KEYS[code] : fallbackKey;
}
```

Known REST errors must use `ApiError.errorCode`; do not compare backend `Error.message` strings.

- [ ] **Step 3: Define verified brand and mock-account content**

Create `authContent.ts` with:

```ts
import { DEMO_PASSWORD, DEMO_ROLES } from '@/mocks/fixtures/demoData';
import type { DemoRoleCode, LoginCredentials } from '@/types/auth';

export const authBrandCapabilityKeys = [
  'auth.gateway.brand.capabilities.customer360',
  'auth.gateway.brand.capabilities.pipeline',
  'auth.gateway.brand.capabilities.permissions',
] as const;

export interface DemoAccountOption {
  roleCode: DemoRoleCode;
  labelKey: string;
  credentials: Required<LoginCredentials>;
}

const demoRoleKeys: Array<{
  roleCode: DemoRoleCode;
  labelKey: string;
}> = [
  { roleCode: 'ADMIN', labelKey: 'auth.gateway.demo.roles.admin' },
  { roleCode: 'REGIONAL_MANAGER', labelKey: 'auth.gateway.demo.roles.regionalManager' },
  { roleCode: 'TEAM_LEADER', labelKey: 'auth.gateway.demo.roles.teamLead' },
  { roleCode: 'SALES_STAFF', labelKey: 'auth.gateway.demo.roles.staff' },
  { roleCode: 'VIEWER', labelKey: 'auth.gateway.demo.roles.viewer' },
];

export const demoAccountOptions: DemoAccountOption[] = demoRoleKeys.map(
  ({ roleCode, labelKey }) => ({
    roleCode,
    labelKey,
    credentials: {
      email: DEMO_ROLES[roleCode].userEmail,
      password: DEMO_PASSWORD,
    },
  })
);
```

The password literal remains owned by the existing fixture and is not repeated in auth UI source.

- [ ] **Step 4: Perform static utility inspection**

Run:

```bash
rtk read src/features/auth/utils/resolveReturnUrl.ts src/features/auth/utils/authErrorMessages.ts src/features/auth/content/authContent.ts
rtk grep -n "decodeURIComponent|err.message.includes|Demo@|https://|http://" src/features/auth/utils src/features/auth/content
```

Expected: redirect resolution has no manual decode; error normalization does not expose backend messages; no demo password literal is duplicated.

---

### Task 3: Add complete Vietnamese and English auth-gateway copy

**Files:**
- Modify: `src/i18n/locales/vi/translation.json`
- Modify: `src/i18n/locales/en/translation.json`

**Interfaces:**
- Produces: identical `auth.gateway` object shapes in Vietnamese and English.
- Preserves: all existing flat `auth.*` keys used by session-expired and other screens.

- [ ] **Step 1: Add the complete Vietnamese `auth.gateway` tree**

Merge this object under the existing top-level `auth` object without deleting existing flat keys:

```json
{
  "gateway": {
    "common": {
      "skipToContent": "Chuyển đến nội dung xác thực",
      "backHome": "Về trang chủ",
      "openDemo": "Tư vấn và demo",
      "openLogin": "Đăng nhập",
      "openRegister": "Tạo tài khoản"
    },
    "brand": {
      "descriptor": "Nền tảng quản trị khách hàng và doanh số",
      "statement": "Một hệ thống để đội ngũ bán hàng nhìn cùng dữ liệu và đi cùng quy trình.",
      "capabilities": {
        "customer360": "Hồ sơ khách hàng 360°",
        "pipeline": "Pipeline theo từng giai đoạn",
        "permissions": "Vai trò và phạm vi dữ liệu"
      }
    },
    "language": {
      "label": "Chọn ngôn ngữ",
      "vietnamese": "Tiếng Việt",
      "english": "English"
    },
    "password": {
      "show": "Hiện mật khẩu",
      "hide": "Ẩn mật khẩu"
    },
    "login": {
      "title": "Đăng nhập vào VUM CRM",
      "description": "Tiếp tục công việc với dữ liệu khách hàng và pipeline của tổ chức.",
      "emailLabel": "Email công việc",
      "emailPlaceholder": "ten@doanhnghiep.vn",
      "passwordLabel": "Mật khẩu",
      "passwordPlaceholder": "Nhập mật khẩu",
      "submit": "Đăng nhập",
      "submitting": "Đang đăng nhập…",
      "noAccount": "Chưa có tài khoản?",
      "registerLink": "Tạo tài khoản",
      "ssoDivider": "Hoặc tiếp tục với",
      "google": "Đăng nhập bằng Google",
      "microsoft": "Đăng nhập bằng Microsoft",
      "redirecting": "Đang chuyển đến nhà cung cấp…"
    },
    "register": {
      "title": "Tạo tài khoản VUM CRM",
      "description": "Tạo tài khoản và gửi yêu cầu gia nhập tổ chức của bạn.",
      "fullNameLabel": "Họ và tên",
      "fullNamePlaceholder": "Nguyễn Văn An",
      "emailLabel": "Email công việc",
      "emailPlaceholder": "ten@doanhnghiep.vn",
      "passwordLabel": "Mật khẩu",
      "passwordPlaceholder": "Nhập từ 12 đến 128 ký tự",
      "passwordHelper": "Sử dụng ít nhất 12 ký tự.",
      "tenantCodeLabel": "Mã tổ chức",
      "tenantCodePlaceholder": "vi-du-doanh-nghiep",
      "tenantCodeHelper": "Nhập mã do quản trị viên tổ chức cung cấp.",
      "consentPrefix": "Tôi đồng ý với",
      "terms": "Điều khoản sử dụng",
      "connector": "và",
      "privacy": "Chính sách riêng tư",
      "consentSuffix": "của VUM CRM.",
      "submit": "Tạo tài khoản",
      "submitting": "Đang tạo tài khoản…",
      "hasAccount": "Đã có tài khoản?",
      "loginLink": "Đăng nhập",
      "organizationHelp": "Tổ chức của bạn chưa sử dụng VUM CRM?",
      "demoLink": "Trao đổi với đội ngũ VUM"
    },
    "demo": {
      "title": "Tài khoản dùng thử",
      "description": "Chọn vai trò để điền thông tin mẫu trong Mock Mode.",
      "toggle": "Mở danh sách tài khoản dùng thử",
      "mockBadge": "Mock Mode",
      "roles": {
        "admin": "Quản trị viên",
        "regionalManager": "Quản lý vùng",
        "teamLead": "Trưởng nhóm",
        "staff": "Nhân viên",
        "viewer": "Chỉ xem"
      }
    },
    "callback": {
      "title": "Đang hoàn tất đăng nhập",
      "loadingDescription": "VUM CRM đang thiết lập phiên làm việc bảo mật.",
      "errorTitle": "Chưa thể hoàn tất đăng nhập",
      "errorDescription": "Phiên đăng nhập từ nhà cung cấp chưa được xác nhận.",
      "returnLogin": "Quay lại đăng nhập",
      "redirecting": "Đang quay lại trang đăng nhập…"
    },
    "pending": {
      "title": "Yêu cầu gia nhập đang chờ duyệt",
      "description": "Quản trị viên tổ chức cần phê duyệt trước khi bạn truy cập dữ liệu CRM.",
      "account": "Tài khoản",
      "organization": "Tổ chức",
      "status": "Trạng thái",
      "statusInvited": "Chờ phê duyệt",
      "unknownOrganization": "Chưa xác định tổ chức",
      "processTitle": "Điều gì xảy ra tiếp theo?",
      "processDescription": "Sau khi quản trị viên phê duyệt, hãy kiểm tra lại trạng thái để tiếp tục vào hệ thống.",
      "refresh": "Kiểm tra trạng thái",
      "logout": "Đăng xuất"
    },
    "validation": {
      "email": "Nhập email hợp lệ, tối đa 320 ký tự.",
      "loginPassword": "Nhập mật khẩu, tối đa 128 ký tự.",
      "fullName": "Nhập họ tên từ 2 đến 255 ký tự.",
      "registerPassword": "Mật khẩu phải có từ 12 đến 128 ký tự.",
      "tenantCode": "Nhập mã tổ chức, tối đa 320 ký tự.",
      "legalConsent": "Bạn cần đồng ý điều khoản và chính sách riêng tư."
    },
    "errors": {
      "network": "Không thể kết nối tới dịch vụ xác thực. Kiểm tra kết nối và thử lại.",
      "requestValidation": "Thông tin chưa hợp lệ. Kiểm tra các trường được đánh dấu.",
      "invalidCredentials": "Email hoặc mật khẩu không chính xác.",
      "registrationDisabled": "Hệ thống chưa mở tự đăng ký. Hãy trao đổi với đội ngũ VUM.",
      "emailRegistered": "Email này đã có tài khoản. Hãy chuyển sang đăng nhập.",
      "tenantNotAvailable": "Không tìm thấy tổ chức khả dụng với mã này. Kiểm tra lại mã hoặc liên hệ quản trị viên.",
      "membershipPending": "Tổ chức đã nhận được một yêu cầu đang chờ duyệt từ tài khoản này.",
      "oauthFailed": "Đăng nhập qua nhà cung cấp chưa hoàn tất. Thử lại hoặc dùng email và mật khẩu.",
      "externalEmailNotVerified": "Nhà cung cấp chưa xác minh email của bạn. Hãy xác minh email trước khi thử lại.",
      "identityLinkRequired": "Email này đã thuộc một tài khoản VUM CRM. Hãy đăng nhập cục bộ hoặc liên hệ quản trị viên để liên kết.",
      "unknown": "Chưa thể hoàn tất thao tác. Hãy thử lại."
    },
    "footer": {
      "copyright": "VUM CRM. Bảo lưu mọi quyền."
    }
  }
}
```

- [ ] **Step 2: Add the complete matching English tree**

Merge this object under the existing English `auth` object:

```json
{
  "gateway": {
    "common": {
      "skipToContent": "Skip to authentication content",
      "backHome": "Back to home",
      "openDemo": "Consultation and demo",
      "openLogin": "Sign in",
      "openRegister": "Create an account"
    },
    "brand": {
      "descriptor": "Customer and revenue management platform",
      "statement": "One system where the sales team sees the same data and follows the same process.",
      "capabilities": {
        "customer360": "Customer 360° profiles",
        "pipeline": "Stage-based sales pipeline",
        "permissions": "Roles and data scope"
      }
    },
    "language": {
      "label": "Choose language",
      "vietnamese": "Tiếng Việt",
      "english": "English"
    },
    "password": {
      "show": "Show password",
      "hide": "Hide password"
    },
    "login": {
      "title": "Sign in to VUM CRM",
      "description": "Continue working with your organization's customer data and sales pipeline.",
      "emailLabel": "Work email",
      "emailPlaceholder": "name@company.com",
      "passwordLabel": "Password",
      "passwordPlaceholder": "Enter your password",
      "submit": "Sign in",
      "submitting": "Signing in…",
      "noAccount": "No account yet?",
      "registerLink": "Create an account",
      "ssoDivider": "Or continue with",
      "google": "Sign in with Google",
      "microsoft": "Sign in with Microsoft",
      "redirecting": "Redirecting to the provider…"
    },
    "register": {
      "title": "Create a VUM CRM account",
      "description": "Create your account and request access to your organization.",
      "fullNameLabel": "Full name",
      "fullNamePlaceholder": "Alex Nguyen",
      "emailLabel": "Work email",
      "emailPlaceholder": "name@company.com",
      "passwordLabel": "Password",
      "passwordPlaceholder": "Enter 12 to 128 characters",
      "passwordHelper": "Use at least 12 characters.",
      "tenantCodeLabel": "Organization code",
      "tenantCodePlaceholder": "example-company",
      "tenantCodeHelper": "Enter the code supplied by your organization administrator.",
      "consentPrefix": "I agree to the",
      "terms": "Terms of use",
      "connector": "and",
      "privacy": "Privacy policy",
      "consentSuffix": "for VUM CRM.",
      "submit": "Create account",
      "submitting": "Creating account…",
      "hasAccount": "Already have an account?",
      "loginLink": "Sign in",
      "organizationHelp": "Is your organization new to VUM CRM?",
      "demoLink": "Talk with the VUM team"
    },
    "demo": {
      "title": "Demo accounts",
      "description": "Choose a role to fill sample credentials in Mock Mode.",
      "toggle": "Open demo account list",
      "mockBadge": "Mock Mode",
      "roles": {
        "admin": "Administrator",
        "regionalManager": "Regional manager",
        "teamLead": "Team lead",
        "staff": "Sales representative",
        "viewer": "View only"
      }
    },
    "callback": {
      "title": "Completing sign-in",
      "loadingDescription": "VUM CRM is establishing your secure session.",
      "errorTitle": "Sign-in could not be completed",
      "errorDescription": "The provider sign-in session was not confirmed.",
      "returnLogin": "Return to sign in",
      "redirecting": "Returning to sign in…"
    },
    "pending": {
      "title": "Your access request is pending",
      "description": "An organization administrator must approve the request before you can access CRM data.",
      "account": "Account",
      "organization": "Organization",
      "status": "Status",
      "statusInvited": "Pending approval",
      "unknownOrganization": "Organization not identified",
      "processTitle": "What happens next?",
      "processDescription": "After an administrator approves the request, check the status again to continue into the system.",
      "refresh": "Check status",
      "logout": "Sign out"
    },
    "validation": {
      "email": "Enter a valid email no longer than 320 characters.",
      "loginPassword": "Enter a password no longer than 128 characters.",
      "fullName": "Enter a full name between 2 and 255 characters.",
      "registerPassword": "Password must contain 12 to 128 characters.",
      "tenantCode": "Enter an organization code no longer than 320 characters.",
      "legalConsent": "You must accept the terms and privacy policy."
    },
    "errors": {
      "network": "The authentication service could not be reached. Check your connection and try again.",
      "requestValidation": "Some information is invalid. Review the marked fields.",
      "invalidCredentials": "The email or password is incorrect.",
      "registrationDisabled": "Self-registration is not available. Talk with the VUM team.",
      "emailRegistered": "An account already uses this email. Continue to sign in.",
      "tenantNotAvailable": "No available organization matches this code. Check the code or contact your administrator.",
      "membershipPending": "This account already has a pending access request for the organization.",
      "oauthFailed": "Provider sign-in was not completed. Try again or use your email and password.",
      "externalEmailNotVerified": "The provider has not verified your email. Verify it before trying again.",
      "identityLinkRequired": "This email already belongs to a VUM CRM account. Sign in locally or contact an administrator to link it.",
      "unknown": "The action could not be completed. Try again."
    },
    "footer": {
      "copyright": "VUM CRM. All rights reserved."
    }
  }
}
```

- [ ] **Step 3: Statistically compare locale shapes**

Run:

```bash
rtk read src/i18n/locales/vi/translation.json src/i18n/locales/en/translation.json
node --input-type=module -e 'import fs from "node:fs"; const vi=JSON.parse(fs.readFileSync("src/i18n/locales/vi/translation.json","utf8")).auth.gateway; const en=JSON.parse(fs.readFileSync("src/i18n/locales/en/translation.json","utf8")).auth.gateway; const shape=(v,p="")=>Array.isArray(v)?[[p,"array:"+v.length],...v.flatMap((x,i)=>shape(x,p+"["+i+"]"))]:v&&typeof v==="object"?Object.entries(v).flatMap(([k,x])=>shape(x,p?p+"."+k:k)):[[p,typeof v]]; const a=new Map(shape(vi)); const b=new Map(shape(en)); const mismatch=[...new Set([...a.keys(),...b.keys()])].filter(k=>a.get(k)!==b.get(k)); console.log(JSON.stringify({vi:a.size,en:b.size,mismatch},null,2)); if(mismatch.length) process.exitCode=1;'
```

Expected: equal leaf counts and an empty `mismatch` array.

---

### Task 4: Build the scoped auth theme and shared shell

**Files:**
- Modify: `index.html:13-18`
- Create: `src/features/auth/auth.css`
- Create: `src/features/auth/components/AuthBrandPanel.tsx`
- Create: `src/features/auth/components/AuthLanguageMenu.tsx`
- Create: `src/features/auth/components/AuthPageHeader.tsx`
- Create: `src/features/auth/components/AuthShell.tsx`

**Interfaces:**
- Produces: `AuthShell`, `AuthBrandPanel`, `AuthLanguageMenu`, and `AuthPageHeader`.
- Consumes: `env.privacyPolicyUrl`, `env.termsUrl`, `authBrandCapabilityKeys`, and `auth.gateway.*` translations.

- [ ] **Step 1: Load the approved heading font and create the auth-scoped CSS foundation**

In `index.html`, extend the existing Google Fonts request so it loads `Plus Jakarta Sans` weights 600, 700, and 800 alongside the existing `Inter` and `Be Vietnam Pro` families. Reuse the current preconnect tags and the current stylesheet link; do not add a second font request or change global body classes.

The updated `href` must include this family segment:

```text
family=Plus+Jakarta+Sans:wght@600;700;800
```

Create `auth.css` with these required rules:

```css
.auth-theme {
  --auth-canvas: #f5f8fc;
  --auth-surface: #ffffff;
  --auth-ink: #07182b;
  --auth-muted: #52647a;
  --auth-line: #dce5f0;
  --auth-blue: #085ac0;
  --auth-blue-hover: #06499d;
  --auth-blue-soft: #eaf2fc;
  --auth-danger: #be123c;
  --auth-danger-soft: #fff1f2;
  min-height: 100dvh;
  background: var(--auth-canvas);
  color: var(--auth-ink);
  font-family: 'Be Vietnam Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  overflow-x: clip;
}

.auth-theme .auth-frame {
  width: min(calc(100% - 2rem), 73.75rem);
  min-height: min(48rem, calc(100dvh - 3rem));
  margin-inline: auto;
  display: grid;
  grid-template-columns: minmax(0, 42fr) minmax(0, 58fr);
  overflow: hidden;
  border: 1px solid var(--auth-line);
  border-radius: 1rem;
  background: var(--auth-surface);
  box-shadow: 0 28px 70px -44px rgb(8 90 192 / 0.38);
}

.auth-theme .auth-frame--compact {
  width: min(calc(100% - 2rem), 40rem);
  min-height: auto;
  display: block;
}

.auth-theme .auth-display {
  font-family: 'Plus Jakarta Sans', 'Be Vietnam Pro', sans-serif;
  letter-spacing: -0.035em;
  text-wrap: balance;
}

.auth-theme .auth-brand-panel {
  display: flex;
  min-width: 0;
  flex-direction: column;
  justify-content: space-between;
  padding: clamp(2rem, 4vw, 4.5rem);
  background: var(--auth-blue-soft);
}

.auth-theme .auth-form-region {
  display: flex;
  min-width: 0;
  flex-direction: column;
  background: var(--auth-surface);
}

.auth-theme .auth-form-column {
  width: min(100%, 27.5rem);
  margin: auto;
  padding: 2rem;
}

.auth-theme :where(a, button, input):focus-visible {
  outline: 3px solid color-mix(in srgb, var(--auth-blue) 65%, white);
  outline-offset: 3px;
}

.auth-theme .auth-control {
  min-height: 2.75rem;
  border-radius: 0.625rem;
}

.auth-theme .auth-icon-button {
  display: inline-flex;
  width: 2.75rem;
  height: 2.75rem;
  align-items: center;
  justify-content: center;
  border-radius: 0.5rem;
}

.auth-theme .auth-interactive {
  transition-property: color, background-color, border-color, opacity, transform;
  transition-duration: 180ms;
  transition-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
}

.auth-theme .auth-interactive:active {
  transform: translateY(1px);
}

@media (max-width: 1023px) {
  .auth-theme .auth-frame {
    width: min(calc(100% - 2rem), 32.5rem);
    min-height: auto;
    grid-template-columns: 1fr;
  }

  .auth-theme .auth-brand-panel {
    padding: 1.5rem 2rem;
  }

  .auth-theme .auth-brand-capabilities {
    display: none;
  }
}

@media (max-width: 767px) {
  .auth-theme {
    background: var(--auth-surface);
  }

  .auth-theme .auth-frame,
  .auth-theme .auth-frame--compact {
    width: 100%;
    border: 0;
    border-radius: 0;
    box-shadow: none;
  }

  .auth-theme .auth-form-column {
    padding: 1.5rem max(1rem, env(safe-area-inset-right)) 1.5rem
      max(1rem, env(safe-area-inset-left));
  }

  .auth-theme .auth-sso-grid {
    grid-template-columns: 1fr;
  }
}

@media (prefers-reduced-motion: reduce) {
  .auth-theme *,
  .auth-theme *::before,
  .auth-theme *::after {
    scroll-behavior: auto !important;
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

Every additional selector must also begin with `.auth-theme`; auth-prefixed class names alone are not sufficient CSS isolation.

- [ ] **Step 2: Implement the verified brand panel**

`AuthBrandPanel.tsx` exports:

```ts
export interface AuthBrandPanelProps {
  compact?: boolean;
}

export function AuthBrandPanel(props: AuthBrandPanelProps): JSX.Element;
```

Render:

- A `/` link with the existing VUM mark treatment and `aria-label="VUM CRM"`.
- `VUM CRM` with `translate="no"`.
- `auth.gateway.brand.descriptor`.
- `auth.gateway.brand.statement`.
- The three `authBrandCapabilityKeys` in a semantic list with `Check` icons marked `aria-hidden="true"`.
- No capability list when `compact` is true.

Use `text-3xl lg:text-4xl`, `auth-display`, and a maximum statement width of `28rem`. Do not add a mock dashboard, testimonial, metric, or logo wall.

- [ ] **Step 3: Implement the Radix language menu**

`AuthLanguageMenu.tsx` uses `DropdownMenu`, `DropdownMenuTrigger`, `DropdownMenuContent`, `DropdownMenuRadioGroup`, and `DropdownMenuRadioItem` from `@/components/ui/dropdown-menu`.

Use this public API:

```ts
export function AuthLanguageMenu(): JSX.Element;
```

Requirements:

- Trigger is a 44px-high button with Globe and ChevronDown icons marked decorative.
- Trigger accessible name is `auth.gateway.language.label`.
- Radio group value is `en` when `i18n.resolvedLanguage === 'en'`, otherwise `vi`.
- `onValueChange` accepts only `vi` or `en` and calls `i18n.changeLanguage(value)`.
- Items use the exact Vietnamese/English language labels.
- Rely on Radix for Escape, focus return, outside dismissal, and keyboard navigation.

- [ ] **Step 4: Implement the shared page header**

Create `AuthPageHeader.tsx` with the exact interface:

```ts
export interface AuthPageHeaderProps {
  titleKey: string;
  descriptionKey: string;
}

export function AuthPageHeader({
  titleKey,
  descriptionKey,
}: AuthPageHeaderProps): JSX.Element;
```

Render one `h1` using `auth-display text-[clamp(1.75rem,4vw,2.5rem)]` and one translated description using `text-pretty`. Do not center the gateway form heading on desktop.

- [ ] **Step 5: Implement `AuthShell` as the only page landmark owner**

Use this API:

```ts
export interface AuthShellProps {
  children: React.ReactNode;
  utilityLink?: {
    to: string;
    labelKey: string;
    direction: 'back' | 'forward';
  };
  brandVariant?: 'full' | 'compact';
}

export function AuthShell({
  children,
  utilityLink,
  brandVariant = 'full',
}: AuthShellProps): JSX.Element;
```

`AuthShell` must:

- Import `../auth.css`.
- Render `.auth-theme` with safe top/bottom padding.
- Render a skip link to `#auth-main`.
- Use `.auth-frame` for full and `.auth-frame.auth-frame--compact` for compact.
- Render `AuthBrandPanel` at the left for full and a compact brand header for compact.
- Render one `<main id="auth-main" tabIndex={-1}>` around `children`.
- Render the optional utility `Link` with ArrowLeft or ArrowRight.
- Render `AuthLanguageMenu`.
- Render privacy and terms `<a>` elements only when their configured URLs exist.
- Render `© {new Date().getFullYear()} {t('auth.gateway.footer.copyright')}`.
- Keep `VUM CRM` under `translate="no"`.

Pages using the shell must not render another `main`.

- [ ] **Step 6: Perform static shared-shell inspection**

Run:

```bash
rtk read index.html src/features/auth/auth.css src/features/auth/components/AuthShell.tsx src/features/auth/components/AuthBrandPanel.tsx src/features/auth/components/AuthLanguageMenu.tsx src/features/auth/components/AuthPageHeader.tsx
rtk grep -n "Plus.Jakarta.Sans|Be.Vietnam.Pro" index.html src/features/auth/auth.css
rtk grep -n "min-h-screen|transition-all|transition: all|href=\"#\"|<main|landing-theme" src/features/auth
```

Expected: both approved auth font families are loaded; the only in-page hash is the skip link; auth does not import landing CSS; each routed page receives its main landmark from the shell.

---

### Task 5: Build shared password, error, and demo-account controls

**Files:**
- Create: `src/features/auth/components/PasswordField.tsx`
- Create: `src/features/auth/components/AuthFormError.tsx`
- Create: `src/features/auth/components/DemoAccountPanel.tsx`

**Interfaces:**
- Consumes: `UseFormRegisterReturn`, `AuthErrorCode`, `demoAccountOptions`, and existing shadcn primitives.
- Produces: reusable controls for login and registration without owning page submit behavior.

- [ ] **Step 1: Implement the accessible password field**

Use this API:

```ts
import type { UseFormRegisterReturn } from 'react-hook-form';

export interface PasswordFieldProps {
  id: string;
  label: string;
  placeholder: string;
  autoComplete: 'current-password' | 'new-password';
  error?: string;
  describedBy?: string;
  helperText?: string;
  registration: UseFormRegisterReturn;
}

export function PasswordField(props: PasswordFieldProps): JSX.Element;
```

Behavior:

- Own local `visible` state only.
- Input type is `text` when visible and `password` otherwise.
- `aria-invalid` is true when `error` exists.
- `aria-describedby` points to `${id}-error` when invalid, otherwise `describedBy`, otherwise `${id}-help` when helper text exists.
- The toggle is a `type="button"` with `.auth-icon-button`, translated show/hide names, and Eye/EyeOff icons marked decorative.
- The input allows paste and uses the supplied autocomplete value.
- Error text is a `<p id={`${id}-error`}>` below the control.
- Helper text is a `<p id={`${id}-help`}>` below the control when no error exists.

- [ ] **Step 2: Implement the translated form-level error**

Use this API:

```ts
import type { AuthErrorCode } from '../utils/authErrorMessages';

export interface AuthFormErrorProps {
  errorCode?: AuthErrorCode;
  fallbackMessageKey: string;
}

export function AuthFormError({
  errorCode,
  fallbackMessageKey,
}: AuthFormErrorProps): JSX.Element | null;
```

Return `null` when `errorCode` is absent. Otherwise use `getAuthErrorMessageKey`, `Alert` with `variant="destructive"`, one decorative AlertCircle, and translated text. Do not accept or render a raw message prop.

- [ ] **Step 3: Implement the mock-only account selector**

Use this API:

```ts
import type { LoginCredentials } from '@/types/auth';

export interface DemoAccountPanelProps {
  onSelect: (credentials: Required<LoginCredentials>) => void;
  disabled?: boolean;
}

export function DemoAccountPanel({
  onSelect,
  disabled = false,
}: DemoAccountPanelProps): JSX.Element;
```

Implementation requirements:

- Import `demoAccountOptions` from `../content/authContent` only.
- Use the existing `Collapsible`, `CollapsibleTrigger`, and `CollapsibleContent`.
- Default collapsed on mobile.
- Use `forceMount` and responsive classes so content is always visible at `lg` while remaining collapsible below `lg`.
- Trigger includes `aria-label={t('auth.gateway.demo.toggle')}` and a rotating ChevronDown based on open state.
- Render each option as a real button showing translated role and email.
- Disable the trigger and option buttons when `disabled` is true.
- Call `onSelect(option.credentials)`; never log the credentials.
- Render the Mock Mode badge from translation.

The caller, not this component, is responsible for the `env.useMocks` condition.

- [ ] **Step 4: Perform static shared-control inspection**

Run:

```bash
rtk read src/features/auth/components/PasswordField.tsx src/features/auth/components/AuthFormError.tsx src/features/auth/components/DemoAccountPanel.tsx
rtk grep -n "focus:outline-none|outline-none|preventDefault.*paste|Demo@|rawMessage|<div.*onClick" src/features/auth/components
```

Expected: no password literal, paste blocker, raw error prop, or generic clickable element exists.

---

### Task 6: Rewrite Login as a thin production auth route

**Files:**
- Modify: `src/features/auth/LoginPage.tsx`

**Interfaces:**
- Consumes: all shared auth components, `resolveReturnUrl`, auth error utilities, `env`, and the unchanged `useAuth` contract.
- Produces: local credential login, configured SSO entry, and mock-only credential fill.

- [ ] **Step 1: Replace the login schema with translated exact constraints**

Use a schema factory:

```ts
const createLoginSchema = (t: TFunction) =>
  z.object({
    email: z
      .string()
      .trim()
      .email(t('auth.gateway.validation.email'))
      .max(320, t('auth.gateway.validation.email')),
    password: z
      .string()
      .min(1, t('auth.gateway.validation.loginPassword'))
      .max(128, t('auth.gateway.validation.loginPassword')),
  });

type LoginFormValues = z.infer<ReturnType<typeof createLoginSchema>>;
type PendingLoginAction = 'credentials' | 'GOOGLE' | 'MICROSOFT' | null;
```

Memoize the schema with `useMemo(() => createLoginSchema(t), [t])` before passing it to `zodResolver`.
Import `TFunction` as a type from `i18next`.

- [ ] **Step 2: Implement sanitized return and stable error state**

Use:

```ts
const { login, loginWithSSO, clearError } = useAuth();
const clearErrorOnMount = useRef(clearError);
const [searchParams] = useSearchParams();
const returnUrl = resolveReturnUrl(searchParams.get('returnUrl'));
const oauthErrorCode = normalizeOAuthErrorCode(searchParams.get('errorCode'));
const [localErrorCode, setLocalErrorCode] = useState<AuthErrorCode>();
const [pendingAction, setPendingAction] = useState<PendingLoginAction>(null);

useEffect(() => {
  clearErrorOnMount.current();
}, []);
```

Import `useRef` from React. Capturing the current callback once avoids making the effect depend on the provider's non-memoized `clearError` function and therefore avoids a render loop. Do not read the legacy `error` query parameter and do not render `useAuth().error` raw.

- [ ] **Step 3: Implement local credential submission**

Use this behavior:

```ts
const onSubmit = async (values: LoginFormValues) => {
  setLocalErrorCode(undefined);
  setPendingAction('credentials');
  try {
    await login(values);
    navigate(returnUrl, { replace: true });
  } catch (error: unknown) {
    setLocalErrorCode(normalizeAuthError(error));
  } finally {
    setPendingAction(null);
  }
};
```

Rely on React Hook Form to retain values and focus the first invalid field.

- [ ] **Step 4: Implement configured SSO submission**

Use:

```ts
const handleSSO = async (provider: 'GOOGLE' | 'MICROSOFT') => {
  setLocalErrorCode(undefined);
  setPendingAction(provider);
  try {
    await loginWithSSO({ provider });
    if (env.useMocks) {
      navigate(returnUrl, { replace: true });
      setPendingAction(null);
    }
  } catch (error: unknown) {
    setLocalErrorCode(normalizeAuthError(error));
    setPendingAction(null);
  }
};
```

Render Google only for `env.googleSsoEnabled` and Microsoft only for `env.microsoftSsoEnabled`. Omit the divider when neither provider is available.

Treat `pendingAction !== null` as the shared busy state. Disable the primary submit, both configured SSO buttons, and `DemoAccountPanel` while busy. Use `auth.gateway.login.submitting` for a credential request and `auth.gateway.login.redirecting` only on the provider button that initiated SSO; do not replace every button label with one generic loading string.

- [ ] **Step 5: Compose the new login page**

Use `AuthShell` with a forward utility link to `/demo`, then render in this order:

1. `AuthPageHeader` with `auth.gateway.login.title` and `auth.gateway.login.description`.
2. `AuthFormError` using `localErrorCode || oauthErrorCode` and `fallbackMessageKey="auth.gateway.errors.unknown"`.
3. Email field with visible label, Mail icon marked decorative, `aria-invalid`, and `${id}-error` linkage.
4. `PasswordField` using `current-password`.
5. Primary submit button with login/submitting copy.
6. Configured SSO divider and provider buttons.
7. `DemoAccountPanel` only inside `{env.useMocks && (...)}`.
8. Account-registration sentence linked to `/register`.

When the effective error code is `SELF_REGISTRATION_DISABLED`, render a nearby translated action link to `/demo` using `auth.gateway.common.openDemo`. The action is navigation outside the alert, not a fabricated retry.

Demo selection must call:

```ts
const setDemoAccount = (credentials: Required<LoginCredentials>) => {
  setValue('email', credentials.email, { shouldValidate: true });
  setValue('password', credentials.password, { shouldValidate: true });
};
```

Remove the stay-signed-in checkbox, duplicated header/footer, custom language popover, hand-built card shell, hardcoded labels, and raw Google/Microsoft SVGs. Use the existing Lucide or text treatment already available; provider button text supplies the accessible provider name.

- [ ] **Step 6: Perform static login inspection**

Run:

```bash
rtk read src/features/auth/LoginPage.tsx
rtk grep -n "staySignedIn|30 ngày|Demo@|login\?error=|err.message|showLangMenu|min-h-screen|CardHeader|Enterprise Cloud" src/features/auth/LoginPage.tsx
rtk grep -n "env.useMocks|googleSsoEnabled|microsoftSsoEnabled|resolveReturnUrl|errorCode|aria-invalid|aria-describedby" src/features/auth/LoginPage.tsx
```

Expected: the first search has no matches; the second shows every required production gate and accessible relationship.

---

### Task 7: Rewrite Registration around the real join-request contract

**Files:**
- Modify: `src/features/auth/RegisterPage.tsx`
- Modify: `src/services/api/RealAuthService.ts:55-59`

**Interfaces:**
- Consumes: `AuthShell`, `AuthPageHeader`, `PasswordField`, `AuthFormError`, `env.privacyPolicyUrl`, `env.termsUrl`, and unchanged `useAuth().register`.
- Produces: `RegisterPayload` with `displayName`, `email`, `password`, and entered `tenantCode`.

- [ ] **Step 1: Replace the form model and schema**

Use:

```ts
const createRegisterSchema = (t: TFunction) =>
  z.object({
    displayName: z
      .string()
      .trim()
      .min(2, t('auth.gateway.validation.fullName'))
      .max(255, t('auth.gateway.validation.fullName')),
    email: z
      .string()
      .trim()
      .email(t('auth.gateway.validation.email'))
      .max(320, t('auth.gateway.validation.email')),
    password: z
      .string()
      .min(12, t('auth.gateway.validation.registerPassword'))
      .max(128, t('auth.gateway.validation.registerPassword')),
    tenantCode: z
      .string()
      .trim()
      .min(1, t('auth.gateway.validation.tenantCode'))
      .max(320, t('auth.gateway.validation.tenantCode')),
    legalConsent: z.boolean().refine(Boolean, {
      message: t('auth.gateway.validation.legalConsent'),
    }),
  });

type RegisterFormValues = z.infer<ReturnType<typeof createRegisterSchema>>;
```

Import `TFunction` as a type from `i18next`. Memoize the schema with `useMemo(() => createRegisterSchema(t), [t])` before passing it to `zodResolver`. Default every string to `''` and `legalConsent` to `false`. Remove `tenantName` and the slug-generation logic.

- [ ] **Step 2: Implement typed registration submission**

In `RealAuthService.register`, preserve the user-entered organization code when creating the membership request:

```ts
body: JSON.stringify({
  tenantCode: payload.tenantCode?.trim(),
  message: `Đăng ký tài khoản thành viên mới từ ${payload.displayName}`,
}),
```

Remove the `'tap-doan-ipa'` fallback and `.toLowerCase()` mutation. The backend owns organization-code matching and validation; the frontend must not silently redirect a missing or differently cased code to another tenant.

Use:

```ts
const { register: registerUser, clearError, session } = useAuth();
const clearErrorOnMount = useRef(clearError);
const [localErrorCode, setLocalErrorCode] = useState<AuthErrorCode>();

useEffect(() => {
  clearErrorOnMount.current();
}, []);

const onSubmit = async (values: RegisterFormValues) => {
  setLocalErrorCode(undefined);
  try {
    const session = await registerUser({
      displayName: values.displayName,
      email: values.email,
      password: values.password,
      tenantCode: values.tenantCode,
    });
    const isPending =
      session.membership?.membership_status === 'INVITED' &&
      session.membership?.is_tenant_admin !== true;
    navigate(isPending ? '/app/pending-approval' : '/app/overview', {
      replace: true,
    });
  } catch (error: unknown) {
    setLocalErrorCode(normalizeAuthError(error));
  }
};
```

Import `useRef` from React. Use React Hook Form `formState.isSubmitting` for the button state. Do not display a success toast before navigation.

- [ ] **Step 3: Compose accessible registration fields**

Use `AuthShell` with a back utility link to `/login` and render:

1. `AuthPageHeader` with register title and description.
2. `AuthFormError` with `localErrorCode` and `fallbackMessageKey="auth.gateway.errors.unknown"`.
3. Full-name input with `autoComplete="name"`.
4. Work-email input with `type="email"`, `inputMode="email"`, `autoComplete="email"`, and `spellCheck={false}`.
5. Organization-code input with `autoComplete="off"`, `spellCheck={false}`, helper text, and no automatic slug mutation.
6. `PasswordField` with `new-password` and the 12-character helper.
7. A legal-consent checkbox controlled through React Hook Form and defaulted false.
8. Primary submit button.
9. Login sentence linked to `/login`.
10. New-organization guidance linked to `/demo`.

Add contextual navigation beneath the form-level error:

- `SELF_REGISTRATION_DISABLED` links to `/demo` with `auth.gateway.common.openDemo`.
- `EMAIL_ALREADY_REGISTERED` links to `/login` with `auth.gateway.common.openLogin`.
- `MEMBERSHIP_REQUEST_ALREADY_PENDING` links to `/app/pending-approval` only when `useAuth().session` exists and its membership status is `INVITED`.

These links use translated labels and do not infer that a membership request succeeded.

Every field error uses a stable `${fieldName}-error` ID and matching `aria-describedby`.

Because the shared Radix checkbox is not a native input, wire it through `Controller` instead of spreading `register()` props:

```tsx
<Controller
  control={control}
  name="legalConsent"
  render={({ field }) => (
    <Checkbox
      id="legalConsent"
      checked={field.value}
      onCheckedChange={(checked) => field.onChange(checked === true)}
      aria-invalid={Boolean(errors.legalConsent)}
      aria-describedby={errors.legalConsent ? 'legalConsent-error' : undefined}
    />
  )}
/>
```

Import `Controller` from `react-hook-form`. Keep the translated consent copy in a `<label htmlFor="legalConsent">` so clicking the text toggles the checkbox.

- [ ] **Step 4: Render configured legal destinations without dead links**

In the consent label:

- Render `auth.gateway.register.consentPrefix`.
- Render an `<a href={env.termsUrl}>` only when `env.termsUrl` exists; otherwise render the translated terms name as `<span>`.
- Render `auth.gateway.register.connector`.
- Render an `<a href={env.privacyPolicyUrl}>` only when `env.privacyPolicyUrl` exists; otherwise render the translated privacy name as `<span>`.
- Render `auth.gateway.register.consentSuffix`.

Do not use `target="_blank"` unless the existing landing legal-link convention already does. Never use `href="#"`.

- [ ] **Step 5: Remove misleading legacy registration behavior**

Remove:

- Business-name-to-tenant-code generation.
- Membership-request fallback to `'tap-doan-ipa'` and forced `.toLowerCase()` conversion.
- “Khởi tạo không gian làm việc” copy.
- Default checked legal consent.
- `toast.success` and the Sonner import.
- Raw `err.message` checks.
- Duplicated header/footer/language popover.
- `min-h-screen`, centered heavy card, and uppercase form labels.

- [ ] **Step 6: Perform static registration inspection**

Run:

```bash
rtk read src/features/auth/RegisterPage.tsx src/services/api/RealAuthService.ts
rtk grep -n "tenantName|generatedTenantCode|tap-doan-ipa|payload\.tenantCode.*toLowerCase|agreeTerms.*true|toast.success|8 ký tự|err.message|min-h-screen|href=\"#\"" src/features/auth/RegisterPage.tsx src/services/api/RealAuthService.ts
rtk grep -n "tenantCode.*trim|\.min\(12|legalConsent.*false|Controller|privacyPolicyUrl|termsUrl|pending-approval|aria-invalid|aria-describedby" src/features/auth/RegisterPage.tsx src/services/api/RealAuthService.ts
```

Expected: no legacy behavior remains; the new form matches the documented register and membership fields.

---

### Task 8: Unify OAuth callback and pending approval states

**Files:**
- Modify: `src/features/auth/AuthCallbackPage.tsx`
- Modify: `src/features/auth/PendingApprovalPage.tsx`

**Interfaces:**
- Consumes: compact `AuthShell`, `AuthPageHeader`, `realAuthService.handleOAuth2Callback`, and unchanged `useAuth` state/actions.
- Produces: consistent compact loading, error, pending, refresh, and logout states.

- [ ] **Step 1: Rewrite OAuth callback with safe timer cleanup**

Use `AuthShell brandVariant="compact"` and state `const [hasError, setHasError] = useState(false)`.

The effect must use this control flow:

```ts
useEffect(() => {
  let active = true;
  let redirectTimer: ReturnType<typeof setTimeout> | undefined;

  realAuthService
    .handleOAuth2Callback()
    .then(() => {
      if (active) navigate('/app/overview', { replace: true });
    })
    .catch(() => {
      if (!active) return;
      setHasError(true);
      redirectTimer = setTimeout(() => {
        navigate('/login?errorCode=OAUTH2_LOGIN_FAILED', { replace: true });
      }, 2000);
    });

  return () => {
    active = false;
    if (redirectTimer) clearTimeout(redirectTimer);
  };
}, [navigate]);
```

Loading renders a translated `h1`, description, and `aria-live="polite"` status. Error renders translated title, description, direct `/login` link, and redirecting status. Do not render raw `errorMessage`.

- [ ] **Step 2: Rewrite pending approval without simulated progress**

Use:

```ts
const { session, logout } = useAuth();
const navigate = useNavigate();

const organizationName =
  session?.tenant?.display_name ||
  session?.tenant?.tenant_code ||
  t('auth.gateway.pending.unknownOrganization');

const handleRefreshStatus = () => {
  window.location.reload();
};

const handleLogout = async () => {
  await logout();
  navigate('/login', { replace: true });
};
```

Compose `AuthShell brandVariant="compact"`, `AuthPageHeader`, a definition list for account/organization/status, one amber pending badge, a process explanation, refresh button, and logout button.

Icons are decorative. Do not use lifecycle badge helpers because membership pending is not a CRM lifecycle state.

- [ ] **Step 3: Remove legacy callback and pending artifacts**

Remove:

- `LoadingSkeleton variant="card"` from callback.
- Raw OAuth error strings.
- Unrelated `bg-slate-50` page shells.
- `animate-pulse` from pending status.
- Toast import and fake 800ms timer.
- “Tập đoàn IPA” fallback.
- English parenthetical “Approve” and `INVITED` in visible Vietnamese copy.

- [ ] **Step 4: Perform static state-page inspection**

Run:

```bash
rtk read src/features/auth/AuthCallbackPage.tsx src/features/auth/PendingApprovalPage.tsx
rtk grep -n "errorMessage|LoadingSkeleton|animate-pulse|setTimeout.*800|toast|Tập đoàn IPA|Approve|INVITED|min-h-screen" src/features/auth/AuthCallbackPage.tsx src/features/auth/PendingApprovalPage.tsx
rtk grep -n "brandVariant=\"compact\"|clearTimeout|errorCode=OAUTH2_LOGIN_FAILED|window.location.reload|unknownOrganization" src/features/auth/AuthCallbackPage.tsx src/features/auth/PendingApprovalPage.tsx
```

Expected: legacy search is empty; required compact-shell and truthful-state behavior is present.

---

### Task 9: Complete static audit and prepare the uncommitted handoff

**Files:**
- Review: every file in this plan
- Preserve: `src/routes/AppRoutes.tsx`, `docs/api-reference.md`, and all unrelated user changes

**Interfaces:**
- Verifies: source consistency only.
- Produces: an uncommitted handoff report with explicit runtime limitations and membership-flow risk.

- [ ] **Step 1: Inspect final route and service preservation**

Run:

```bash
rtk read src/routes/AppRoutes.tsx src/services/contracts/IAuthService.ts src/core/session/context.ts
rtk grep -n "path=\"/login\"|path=\"/register\"|path=\"/auth/callback\"|path=\"/app/pending-approval\"" src/routes/AppRoutes.tsx
```

Expected: all four routes and auth service method signatures remain unchanged.

- [ ] **Step 2: Scan the auth source for forbidden leftovers**

Run:

```bash
rtk grep -n "min-h-screen|transition-all|transition: all|focus:outline-none|href=\"#\"|Demo@|Enterprise Cloud|1-Click|30 ngày|8 ký tự|Đang xử lý\.\.\.|Đang tạo tài khoản\.\.\." src/features/auth
rtk grep -n "[À-ỹ]" src/features/auth --glob '*.tsx' --glob '*.ts'
rtk grep -n "<div[^>]*onClick|<span[^>]*onClick|onPaste" src/features/auth
```

Expected:

- No forbidden legacy styling, credentials, fake labels, or three-dot loading text.
- Vietnamese matches appear only in comments that should then be removed; visible copy belongs in locale JSON.
- No generic interactive element or paste blocker exists.

- [ ] **Step 3: Verify production gates and CSS scope**

Run:

```bash
rtk grep -n "env.useMocks|googleSsoEnabled|microsoftSsoEnabled" src/features/auth src/config/env.ts
rtk grep -n "^\.[a-zA-Z]" src/features/auth/auth.css
rtk grep -n "landing-theme|landing.css|src/components/ui" src/features/auth/auth.css src/features/auth/components
```

Expected: demo and provider gates are present; auth CSS uses auth-prefixed selectors; no landing-style dependency or global primitive modification exists.

- [ ] **Step 4: Compare locale structures again**

Run:

```bash
node --input-type=module -e 'import fs from "node:fs"; const vi=JSON.parse(fs.readFileSync("src/i18n/locales/vi/translation.json","utf8")).auth.gateway; const en=JSON.parse(fs.readFileSync("src/i18n/locales/en/translation.json","utf8")).auth.gateway; const shape=(v,p="")=>Array.isArray(v)?[[p,"array:"+v.length],...v.flatMap((x,i)=>shape(x,p+"["+i+"]"))]:v&&typeof v==="object"?Object.entries(v).flatMap(([k,x])=>shape(x,p?p+"."+k:k)):[[p,typeof v]]; const a=new Map(shape(vi)); const b=new Map(shape(en)); const mismatch=[...new Set([...a.keys(),...b.keys()])].filter(k=>a.get(k)!==b.get(k)); console.log(JSON.stringify({vi:a.size,en:b.size,mismatch},null,2)); if(mismatch.length) process.exitCode=1;'
```

Expected: equal leaf counts and an empty `mismatch` array.

- [ ] **Step 5: Run the two permitted static project checks**

Run:

```bash
npm run typecheck
npm run lint
```

Expected: both exit with code 0. Do not run `npm run build`, `npm test`, Vitest, Playwright, dev server, or browser tooling.

If either static check reports unrelated pre-existing failures, capture the exact file and error, confirm whether it is outside this plan's diff, and report it without modifying unrelated code.

- [ ] **Step 6: Confirm API documentation and routes were not modified**

Run:

```bash
git diff -- docs/api-reference.md src/routes/AppRoutes.tsx
```

Expected: empty output. If implementation required an API or route change, stop and request a separately approved scope instead of silently changing these files.

- [ ] **Step 7: Review the complete uncommitted diff**

Run:

```bash
rtk git status --short
rtk read src/features/auth/auth.css src/features/auth/components/AuthShell.tsx src/features/auth/components/AuthBrandPanel.tsx src/features/auth/components/AuthLanguageMenu.tsx src/features/auth/components/AuthPageHeader.tsx
rtk read src/features/auth/components/PasswordField.tsx src/features/auth/components/AuthFormError.tsx src/features/auth/components/DemoAccountPanel.tsx
rtk read src/features/auth/content/authContent.ts src/features/auth/utils/authErrorMessages.ts src/features/auth/utils/resolveReturnUrl.ts
rtk diff
```

The explicit reads are required because a plain Git diff does not show the content of untracked files.

Review every changed line for:

- Raw error leakage.
- Auth credentials or secrets.
- Untranslated visible copy.
- Dead links.
- Misleading workspace-creation language.
- Missing field relationships.
- Demo/SSO configuration leaks.
- Unrelated changes.

Do not stage or commit anything.

- [ ] **Step 8: Write the Antigravity handoff report**

The final report must include:

- Files created and modified.
- Login, registration, callback, and pending states implemented.
- Mock and SSO visibility rules implemented.
- Locale shape comparison result.
- Typecheck and lint command results.
- Confirmation that tests, build, app start, browser, API, and runtime authentication were not run.
- Confirmation that no files were staged or committed.
- Explicitly unverified: visual balance, 1024px split, mobile collapse, keyboard order, Radix menu behavior, focus movement, OAuth redirect, live login/register, membership submission, status refresh, console, and network.
- Known service-flow risk: current registration may not separately expose user-creation success and membership-request failure. Do not describe membership submission as verified.

---

## Implementation Completion Checklist

- [ ] The approved spec has been read before edits.
- [ ] All new styling is scoped to `.auth-theme`.
- [ ] `index.html` loads `Plus Jakarta Sans` without duplicating the existing font request.
- [ ] All four approved routes share the auth system.
- [ ] Login has no unsupported persistence option.
- [ ] Demo accounts exist only in mock mode.
- [ ] Real SSO buttons require provider flags.
- [ ] Real SSO has no localhost hardcode.
- [ ] Public SSO variables are documented in `.env.example` and typed in `src/vite-env.d.ts`.
- [ ] Return URLs are restricted to the current origin.
- [ ] OAuth query errors use the documented `errorCode` whitelist.
- [ ] Registration uses `tenantCode`, 12-128 character passwords, and unchecked consent.
- [ ] Legal URLs never fall back to `#`.
- [ ] Raw backend errors are not rendered.
- [ ] Callback timers clean up.
- [ ] Pending approval has no fake delay or organization fallback.
- [ ] Vietnamese and English auth structures match.
- [ ] `npm run typecheck` exits 0 or unrelated failures are documented exactly.
- [ ] `npm run lint` exits 0 or unrelated failures are documented exactly.
- [ ] `docs/api-reference.md` and `src/routes/AppRoutes.tsx` remain unchanged.
- [ ] No prohibited runtime or test command was run.
- [ ] No file was staged or committed.
