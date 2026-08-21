# VUM CRM Landing Page Production Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the inconsistent UAT-like public pages with one Vietnamese-first, production-oriented enterprise product story whose primary conversion is `/demo`.

**Architecture:** Keep all marketing behavior inside `src/features/landing`, scope visual tokens under `.landing-theme`, and compose each route from focused page/section components. Public demo submission uses an optional unauthenticated adapter; when endpoint or privacy configuration is absent, `/demo` renders honest direct-contact mode instead of a non-functional form.

**Tech Stack:** React 18, TypeScript 5.7 strict mode, Vite 6, React Router 6, Tailwind CSS 3.4, shadcn/Radix primitives, react-i18next, react-hook-form, zod, Lucide.

**Spec:** `docs/superpowers/specs/2026-08-21-landing-page-production-redesign-design.md`

## Global Constraints

- Work only inside `crm-fe`.
- Read `AGENTS.md` and the approved spec before editing.
- Preserve user-authored changes and inspect the worktree before every task.
- Do not stage, commit, push, merge, or create a pull request.
- Do not run unit, integration, E2E, smoke, browser, API, manual runtime, application-start, or build commands.
- `npm run typecheck` and `npm run lint` are permitted static checks; do not substitute `npm run build`.
- Do not add or upgrade dependencies.
- Do not change authentication, authorization, protected routes, role names, permissions, or tenant behavior.
- Keep the product light-mode only with restrained professional blue.
- Use `Plus Jakarta Sans` for landing display headings and `Be Vietnam Pro` for Vietnamese body/control text; do not make Inter the landing primary font.
- All public content uses the existing i18n layer under a matching `landing.*` key tree in Vietnamese and English.
- Primary CTA is “Đặt lịch demo” to `/demo`; trial and login remain secondary.
- Do not publish unverified prices, customers, certifications, ROI, SLA, testimonial, integration-partner, or trial-duration claims.
- Do not use remote `aida-public`, stock, or duplicated template imagery.
- Do not add a new UI, icon, form, metadata, animation, or styling library.
- Animate only `transform` and `opacity`; do not use `transition: all` or infinite decorative motion.
- All lifecycle badges consume `@/config/crmStatusConfig`.
- Normalize `LifecycleStageConfigMap` to the exact repository palette before landing usage. This is the only shared authenticated-UI visual change in scope.
- A backend demo endpoint is out of scope. Do not add unimplemented endpoint behavior to `docs/api-reference.md`.
- Runtime visual, responsive, keyboard, network, and form-submission behavior must be reported as unverified under the current no-runtime rule.

---

## File Map

### Create

```text
public/favicon.svg
public/og/vum-crm-landing.svg
public/og/vum-crm-landing.png
src/features/landing/landing.css
src/features/landing/types/landing.ts
src/features/landing/content/productPreviewContent.ts
src/features/landing/hooks/useLandingMetadata.ts
src/features/landing/services/demoRequestService.ts
src/features/landing/components/LandingHeader.tsx
src/features/landing/components/LandingFooter.tsx
src/features/landing/components/LandingSection.tsx
src/features/landing/components/SectionHeading.tsx
src/features/landing/components/ProductCockpit.tsx
src/features/landing/components/RoleOutcomeTabs.tsx
src/features/landing/components/DemoRequestForm.tsx
src/features/landing/sections/home/HeroSection.tsx
src/features/landing/sections/home/ProofStrip.tsx
src/features/landing/sections/home/ProblemOutcomeSection.tsx
src/features/landing/sections/home/CapabilityStoriesSection.tsx
src/features/landing/sections/home/RoleOutcomesSection.tsx
src/features/landing/sections/home/TrustSection.tsx
src/features/landing/sections/home/FinalDemoSection.tsx
src/features/landing/pages/HomePage.tsx
src/features/landing/pages/FeaturesPage.tsx
src/features/landing/pages/SolutionsPage.tsx
src/features/landing/pages/PricingPage.tsx
src/features/landing/pages/DemoPage.tsx
```

### Modify

```text
index.html
src/config/env.ts
src/config/crmStatusConfig.tsx
src/features/landing/LandingLayout.tsx
src/i18n/locales/vi/translation.json
src/i18n/locales/en/translation.json
src/index.css
src/routes/AppRoutes.tsx
```

### Remove after route cutover

```text
src/features/landing/HomePage.tsx
src/features/landing/FeaturesPage.tsx
src/features/landing/SolutionsPage.tsx
src/features/landing/PricingPage.tsx
```

---

### Task 1: Preflight, public configuration, shared status source, and landing types

**Files:**
- Modify: `src/config/env.ts`
- Modify: `src/config/crmStatusConfig.tsx:13-47`
- Create: `src/features/landing/types/landing.ts`

**Interfaces:**
- Produces: `env.publicSiteUrl`, `env.demoRequestEndpoint`, `env.salesEmail`, `env.salesPhone`, `env.privacyPolicyUrl`, `env.termsUrl`.
- Produces: `DemoRequestInput`, `DemoRequestResult`, `DemoRequestServiceError`, `CompanySize`, `DemoIndustry`, `DemoPrimaryNeed`, `LandingMetadata`, `CockpitTabId`, and `RoleOutcomeId`.
- Preserves: all existing `AppConfig` fields and exports.

- [ ] **Step 1: Inspect instructions, spec, status, and supported RTK syntax**

Run only read-only commands:

```bash
rtk --help
rtk read AGENTS.md docs/superpowers/specs/2026-08-21-landing-page-production-redesign-design.md
rtk git status --short
```

Expected: the spec is readable; no unexpected overlapping modifications are overwritten. If an overlapping user change exists, preserve it and adapt the patch around it.

- [ ] **Step 2: Normalize the lifecycle map to the required repository classes**

Keep labels and priorities, but replace the five `LifecycleStageConfigMap[*].className` values with exactly:

```ts
PROSPECT: 'bg-purple-50 text-purple-700 border-purple-200 font-bold',
QUALIFIED: 'bg-blue-50 text-blue-700 border-blue-200 font-bold',
CUSTOMER: 'bg-emerald-50 text-emerald-700 border-emerald-200 font-bold',
INACTIVE: 'bg-amber-50 text-amber-700 border-amber-200 font-semibold',
CHURNED: 'bg-rose-50 text-rose-700 border-rose-200 font-semibold',
```

Do not modify Account Type, Lead Status, Opportunity Stage, Priority, or render-helper behavior in this task.

- [ ] **Step 3: Extend centralized public configuration without exposing secrets**

Add optional-value normalization and these fields to `AppConfig`:

```ts
const readOptionalEnv = (value: string | undefined): string | undefined => {
  const normalized = value?.trim();
  return normalized ? normalized : undefined;
};

const browserOrigin =
  typeof window === 'undefined' ? 'http://localhost:3001' : window.location.origin;

export interface AppConfig {
  apiBaseUrl: string;
  useMocks: boolean;
  mockDelayMs: number;
  enableRoleSwitcher: boolean;
  publicSiteUrl: string;
  demoRequestEndpoint?: string;
  salesEmail?: string;
  salesPhone?: string;
  privacyPolicyUrl?: string;
  termsUrl?: string;
}
```

Append these exact assignments to `env`:

```ts
publicSiteUrl: (readOptionalEnv(import.meta.env.VITE_PUBLIC_SITE_URL) || browserOrigin).replace(/\/$/, ''),
demoRequestEndpoint: readOptionalEnv(import.meta.env.VITE_DEMO_REQUEST_ENDPOINT),
salesEmail: readOptionalEnv(import.meta.env.VITE_SALES_EMAIL),
salesPhone: readOptionalEnv(import.meta.env.VITE_SALES_PHONE),
privacyPolicyUrl: readOptionalEnv(import.meta.env.VITE_PRIVACY_POLICY_URL),
termsUrl: readOptionalEnv(import.meta.env.VITE_TERMS_URL),
```

- [ ] **Step 4: Create exact landing contracts**

Create `src/features/landing/types/landing.ts` with these public types:

```ts
export type CompanySize =
  | 'UNDER_50'
  | 'FROM_50_TO_199'
  | 'FROM_200_TO_999'
  | 'FROM_1000';

export type DemoIndustry =
  | 'FINANCE'
  | 'REAL_ESTATE'
  | 'RETAIL_FNB'
  | 'MANUFACTURING_DISTRIBUTION'
  | 'TECHNOLOGY_B2B'
  | 'OTHER';

export type DemoPrimaryNeed =
  | 'CUSTOMER_360'
  | 'SALES_PIPELINE'
  | 'QUOTES_CONTRACTS'
  | 'AUTOMATION_FORECAST'
  | 'SECURITY_INTEGRATION'
  | 'OTHER';

export interface DemoRequestInput {
  fullName: string;
  workEmail: string;
  phone: string;
  companyName: string;
  companySize: CompanySize;
  industry: DemoIndustry;
  primaryNeed: DemoPrimaryNeed;
  message?: string;
  privacyConsent: true;
  locale: 'vi' | 'en';
  sourcePath: string;
}

export interface DemoRequestResult {
  requestId?: string;
  receivedAt?: string;
}

export interface DemoRequestServiceError extends Error {
  status?: number;
  code: 'CONFIGURATION_ERROR' | 'NETWORK_ERROR' | 'REQUEST_REJECTED';
}

export interface LandingMetadata {
  title: string;
  description: string;
  path: string;
  imagePath?: string;
}

export type CockpitTabId = 'pipeline' | 'customer360' | 'governance';
export type RoleOutcomeId = 'executive' | 'manager' | 'sales';
```

- [ ] **Step 5: Perform static contract inspection**

Run:

```bash
rtk read src/config/env.ts src/config/crmStatusConfig.tsx src/features/landing/types/landing.ts
rtk grep -n "bg-\[#|LifecycleStageConfigMap" src/config/crmStatusConfig.tsx
```

Expected: the five lifecycle entries use Tailwind palette classes; the environment wrapper is the only landing code reading the new `VITE_*` values.

---

### Task 2: Add complete Vietnamese-first landing translations

**Files:**
- Modify: `src/i18n/locales/vi/translation.json`
- Modify: `src/i18n/locales/en/translation.json`

**Interfaces:**
- Produces: a matching `landing` namespace in both locale files.
- Consumed by: every landing page, component, metadata hook caller, form state, and footer.

- [ ] **Step 1: Add navigation, shared CTA, footer, and metadata keys**

Add these exact Vietnamese values under top-level `landing`:

```json
{
  "nav": {
    "features": "Tính năng",
    "solutions": "Giải pháp",
    "pricing": "Gói dịch vụ",
    "login": "Đăng nhập",
    "trial": "Dùng thử VUM CRM",
    "demo": "Đặt lịch demo",
    "workspace": "Vào Workspace",
    "openMenu": "Mở menu điều hướng",
    "closeMenu": "Đóng menu điều hướng"
  },
  "common": {
    "brandDescriptor": "Nền tảng quản trị khách hàng và doanh số",
    "skipToContent": "Chuyển đến nội dung chính",
    "illustrativeData": "Dữ liệu minh họa",
    "learnMore": "Tìm hiểu chi tiết",
    "contactSales": "Liên hệ đội ngũ tư vấn"
  },
  "footer": {
    "summary": "VUM CRM giúp doanh nghiệp tập trung dữ liệu khách hàng, kiểm soát pipeline và vận hành quy trình bán hàng trên một nền tảng thống nhất.",
    "product": "Sản phẩm",
    "contact": "Liên hệ",
    "privacy": "Chính sách riêng tư",
    "terms": "Điều khoản sử dụng",
    "copyright": "VUM CRM. Bảo lưu mọi quyền."
  },
  "metadata": {
    "homeTitle": "VUM CRM | Kiểm soát toàn bộ quy trình bán hàng",
    "homeDescription": "Tập trung dữ liệu khách hàng, quản lý pipeline, báo giá, hợp đồng và hiệu suất bán hàng trên một nền tảng CRM cho doanh nghiệp Việt.",
    "featuresTitle": "Tính năng VUM CRM | Từ khách hàng tiềm năng đến hợp đồng",
    "featuresDescription": "Khám phá cách VUM CRM quản lý toàn bộ vòng đời khách hàng, cơ hội, báo giá, hợp đồng, tự động hóa và kiểm soát dữ liệu.",
    "solutionsTitle": "Giải pháp VUM CRM | Vận hành bán hàng theo mô hình doanh nghiệp",
    "solutionsDescription": "Chuẩn hóa quy trình bán hàng theo vùng, đội nhóm và chu kỳ B2B phức tạp với dữ liệu khách hàng được quản trị tập trung.",
    "pricingTitle": "Gói dịch vụ VUM CRM | Tư vấn theo nhu cầu vận hành",
    "pricingDescription": "Xác định phạm vi triển khai VUM CRM theo quy mô đội ngũ, độ phức tạp quy trình và yêu cầu quản trị dữ liệu.",
    "demoTitle": "Đặt lịch demo VUM CRM",
    "demoDescription": "Trao đổi trực tiếp với đội ngũ VUM về quy trình bán hàng, dữ liệu khách hàng và phạm vi triển khai phù hợp."
  }
}
```

- [ ] **Step 2: Add exact Home page narrative keys**

Add:

```json
{
  "home": {
    "hero": {
      "kicker": "VUM CRM cho doanh nghiệp Việt",
      "title": "Một hệ thống để đội ngũ bán hàng nhìn cùng một dữ liệu, đi cùng một quy trình.",
      "description": "Tập trung hồ sơ khách hàng, cơ hội, báo giá, hợp đồng và hoạt động chăm sóc để lãnh đạo nhìn rõ doanh thu còn đội ngũ tập trung vào công việc cần làm tiếp theo.",
      "primaryCta": "Đặt lịch demo",
      "secondaryCta": "Dùng thử VUM CRM"
    },
    "proof": {
      "label": "Một luồng vận hành xuyên suốt",
      "items": ["Khách hàng 360°", "Pipeline theo giai đoạn", "Báo giá và hợp đồng", "Phân quyền theo phạm vi", "Nhật ký kiểm toán"]
    },
    "problem": {
      "eyebrow": "Từ dữ liệu rời rạc đến một hệ thống điều hành",
      "title": "Không cần thêm một bảng báo cáo. Doanh nghiệp cần một nguồn dữ liệu đủ tin cậy để hành động.",
      "beforeTitle": "Khi quy trình bị phân tán",
      "beforeItems": ["Thông tin khách hàng nằm ở nhiều tệp và nhiều người", "Pipeline chỉ được cập nhật trước buổi họp", "Báo giá, hợp đồng và lịch sử trao đổi không nối với nhau"],
      "afterTitle": "Khi vận hành trên VUM CRM",
      "afterItems": ["Mỗi tài khoản có một hồ sơ và dòng thời gian thống nhất", "Cơ hội được theo dõi theo giai đoạn, người phụ trách và hành động tiếp theo", "Lãnh đạo xem cùng dữ liệu mà đội ngũ đang sử dụng hằng ngày"]
    },
    "capabilities": {
      "eyebrow": "Ba năng lực cốt lõi",
      "title": "Theo sát khách hàng từ tín hiệu đầu tiên đến sau khi ký hợp đồng",
      "customer360Title": "Một hồ sơ khách hàng, đầy đủ bối cảnh",
      "customer360Description": "Kết nối doanh nghiệp, người liên hệ, hoạt động, tài liệu và trạng thái vòng đời trong cùng một góc nhìn.",
      "pipelineTitle": "Pipeline phản ánh công việc thật",
      "pipelineDescription": "Theo dõi giá trị, xác suất, thời hạn và hành động tiếp theo của từng cơ hội thay vì chờ tổng hợp cuối kỳ.",
      "automationTitle": "Quy trình tiếp tục vận hành khi đội ngũ bận rộn",
      "automationDescription": "Chuẩn hóa phân công, nhắc việc, phê duyệt và cảnh báo để cơ hội không bị bỏ quên giữa các bước."
    },
    "roles": {
      "eyebrow": "Một hệ thống, ba góc nhìn",
      "title": "Mỗi vai trò nhìn thấy điều cần thiết để ra quyết định",
      "executiveLabel": "Lãnh đạo",
      "executiveTitle": "Nhìn doanh thu và rủi ro từ cùng một nguồn dữ liệu",
      "executiveItems": ["Theo dõi xu hướng pipeline và doanh thu", "Nhận diện khu vực hoặc giai đoạn đang tắc nghẽn", "Kiểm tra hiệu suất mà không chờ báo cáo thủ công"],
      "managerLabel": "Quản lý",
      "managerTitle": "Biết cơ hội nào cần hỗ trợ trước khi quá muộn",
      "managerItems": ["Kiểm soát phân công theo đội nhóm", "Theo dõi cơ hội thiếu hoạt động tiếp theo", "Huấn luyện dựa trên dữ liệu của từng giai đoạn"],
      "salesLabel": "Nhân viên kinh doanh",
      "salesTitle": "Giảm thời gian cập nhật, tăng thời gian làm việc với khách hàng",
      "salesItems": ["Quản lý lịch gọi, họp và công việc tiếp theo", "Tạo báo giá từ danh mục sản phẩm và bảng giá", "Xem toàn bộ lịch sử trao đổi trước mỗi lần liên hệ"]
    },
    "trust": {
      "eyebrow": "Quản trị dành cho doanh nghiệp",
      "title": "Mở rộng đội ngũ mà không đánh đổi quyền kiểm soát dữ liệu",
      "items": ["Vai trò và quyền hạn tập trung", "Phạm vi dữ liệu theo tổ chức và đội nhóm", "Nhật ký truy cập và thay đổi", "Luồng nhập dữ liệu, webhook và tích hợp"]
    },
    "finalCta": {
      "title": "Bắt đầu từ quy trình đang làm doanh nghiệp mất nhiều thời gian nhất.",
      "description": "Đội ngũ VUM sẽ cùng bạn rà soát luồng khách hàng, pipeline và dữ liệu hiện tại trước khi đề xuất phạm vi triển khai.",
      "primary": "Đặt lịch demo",
      "secondary": "Dùng thử VUM CRM"
    }
  }
}
```

- [ ] **Step 3: Add Features, Solutions, and Pricing copy**

Add:

```json
{
  "features": {
    "heroKicker": "Vòng đời khách hàng trên một nền tảng",
    "heroTitle": "Từ khách hàng tiềm năng đến hợp đồng và chăm sóc sau bán",
    "heroDescription": "VUM CRM kết nối những bước đội ngũ đang thực hiện hằng ngày để dữ liệu không bị đứt đoạn giữa marketing, sales, vận hành và dịch vụ.",
    "stages": {
      "lead": {"title": "Tiếp nhận và đánh giá khách hàng tiềm năng", "description": "Ghi nhận nguồn, người phụ trách, trạng thái liên hệ và điều kiện chuyển đổi."},
      "account": {"title": "Xây dựng hồ sơ Account và Contact 360°", "description": "Tập trung thông tin doanh nghiệp, người liên hệ, quan hệ, địa chỉ, kênh và lịch sử hoạt động."},
      "opportunity": {"title": "Quản lý cơ hội theo pipeline", "description": "Theo dõi giai đoạn, giá trị, xác suất, ngày dự kiến và hành động tiếp theo."},
      "commerce": {"title": "Nối cơ hội với báo giá, đơn hàng và hợp đồng", "description": "Giữ bối cảnh thương mại xuyên suốt từ đề xuất đến cam kết thực hiện."},
      "automation": {"title": "Chuẩn hóa nhắc việc và quy trình", "description": "Kết hợp hoạt động, thông báo và cấu hình pipeline để đội ngũ làm việc nhất quán."},
      "forecast": {"title": "Theo dõi dự báo và hiệu suất", "description": "Tổng hợp dữ liệu cơ hội để lãnh đạo và quản lý đánh giá tiến độ doanh thu."},
      "governance": {"title": "Kiểm soát quyền, phạm vi và lịch sử truy cập", "description": "Áp dụng vai trò, phạm vi dữ liệu, privacy controls và audit logs trong cùng nền tảng."}
    },
    "ctaTitle": "Xem VUM CRM vận hành trên quy trình của doanh nghiệp bạn",
    "ctaAction": "Đặt lịch demo theo quy trình"
  },
  "solutions": {
    "heroKicker": "Giải pháp theo mô hình vận hành",
    "heroTitle": "CRM phải phù hợp với cách doanh nghiệp tổ chức đội ngũ và ra quyết định",
    "heroDescription": "Thay vì áp một mẫu chung cho mọi ngành, VUM bắt đầu từ cấu trúc tổ chức, chu kỳ bán hàng và yêu cầu quản trị dữ liệu.",
    "contexts": {
      "regional": {"title": "Đội ngũ theo vùng và nhiều cấp quản lý", "description": "Phân công khách hàng, theo dõi hiệu suất và giới hạn dữ liệu theo tổ chức, vùng và đội nhóm."},
      "b2b": {"title": "Chu kỳ bán hàng B2B dài và nhiều bên tham gia", "description": "Giữ bối cảnh xuyên suốt từ người liên hệ, cơ hội và báo giá đến đơn hàng và hợp đồng."},
      "governed": {"title": "Vận hành cần tích hợp và khả năng truy vết", "description": "Kết nối dữ liệu qua import, webhook và integration records trong khi duy trì nhật ký kiểm toán và privacy controls."}
    },
    "ctaTitle": "Trao đổi về bài toán vận hành hiện tại",
    "ctaAction": "Đặt lịch tư vấn"
  },
  "pricing": {
    "heroKicker": "Phạm vi triển khai theo nhu cầu thật",
    "heroTitle": "Gói dịch vụ được xác định từ cách doanh nghiệp vận hành",
    "heroDescription": "VUM đánh giá quy mô đội ngũ, độ phức tạp quy trình và yêu cầu quản trị trước khi đề xuất phạm vi và chi phí phù hợp.",
    "factors": {
      "scale": {"title": "Quy mô và cấu trúc đội ngũ", "description": "Số người dùng, vùng, phòng ban, cấp quản lý và phạm vi dữ liệu cần kiểm soát."},
      "process": {"title": "Độ phức tạp của quy trình", "description": "Số pipeline, bước phê duyệt, báo giá, hợp đồng và luồng chăm sóc cần chuẩn hóa."},
      "integration": {"title": "Dữ liệu và tích hợp", "description": "Nguồn dữ liệu cần chuyển đổi, hệ thống cần kết nối và yêu cầu đồng bộ."},
      "governance": {"title": "Quản trị và hỗ trợ triển khai", "description": "Phân quyền, audit, privacy, đào tạo, vận hành và mức hỗ trợ cần thiết."}
    },
    "includedTitle": "Mọi phạm vi tư vấn đều bắt đầu từ nền tảng cốt lõi",
    "includedItems": ["Account và Contact 360°", "Lead và Opportunity Pipeline", "Hoạt động chăm sóc", "Danh mục, báo giá, đơn hàng và hợp đồng", "Vai trò, quyền hạn và phạm vi dữ liệu"],
    "ctaTitle": "Nhận đề xuất dựa trên quy trình và quy mô của bạn",
    "ctaAction": "Nhận tư vấn gói phù hợp"
  }
}
```

- [ ] **Step 4: Add Demo page, form, validation, contact, and state copy**

Add:

```json
{
  "demo": {
    "heroKicker": "Trao đổi trực tiếp với đội ngũ VUM",
    "heroTitle": "Xem VUM CRM trên chính quy trình bán hàng của doanh nghiệp bạn",
    "heroDescription": "Chia sẻ cách đội ngũ đang quản lý khách hàng, pipeline và báo cáo. VUM sẽ chuẩn bị một buổi trao đổi tập trung vào bài toán đó.",
    "form": {
      "title": "Thông tin để chuẩn bị buổi demo",
      "fullName": "Họ và tên",
      "workEmail": "Email công việc",
      "phone": "Số điện thoại",
      "companyName": "Tên doanh nghiệp",
      "companySize": "Quy mô doanh nghiệp",
      "industry": "Lĩnh vực hoạt động",
      "primaryNeed": "Nhu cầu ưu tiên",
      "message": "Thông tin bổ sung",
      "privacyConsent": "Tôi đồng ý để VUM sử dụng thông tin này nhằm liên hệ và chuẩn bị buổi demo theo chính sách riêng tư.",
      "submit": "Gửi yêu cầu demo",
      "submitting": "Đang gửi yêu cầu…"
    },
    "companySizes": {"UNDER_50": "Dưới 50 nhân sự", "FROM_50_TO_199": "50–199 nhân sự", "FROM_200_TO_999": "200–999 nhân sự", "FROM_1000": "Từ 1.000 nhân sự"},
    "industries": {"FINANCE": "Tài chính", "REAL_ESTATE": "Bất động sản", "RETAIL_FNB": "Bán lẻ và F&B", "MANUFACTURING_DISTRIBUTION": "Sản xuất và phân phối", "TECHNOLOGY_B2B": "Công nghệ và dịch vụ B2B", "OTHER": "Lĩnh vực khác"},
    "needs": {"CUSTOMER_360": "Tập trung dữ liệu khách hàng", "SALES_PIPELINE": "Kiểm soát pipeline", "QUOTES_CONTRACTS": "Báo giá và hợp đồng", "AUTOMATION_FORECAST": "Tự động hóa và dự báo", "SECURITY_INTEGRATION": "Phân quyền và tích hợp", "OTHER": "Nhu cầu khác"},
    "contact": {
      "title": "Liên hệ trực tiếp với đội ngũ VUM",
      "description": "Kênh nhận yêu cầu trực tuyến chưa được cấu hình. Bạn có thể liên hệ qua các kênh bên dưới để đội ngũ tư vấn phản hồi.",
      "email": "Gửi email cho sales",
      "phone": "Gọi đội ngũ tư vấn",
      "unavailable": "Kênh liên hệ chưa được cấu hình. Bạn vẫn có thể dùng thử sản phẩm hoặc quay lại sau."
    },
    "states": {
      "successTitle": "Yêu cầu demo đã được tiếp nhận",
      "successDescription": "Đội ngũ VUM sẽ sử dụng thông tin bạn cung cấp để chuẩn bị nội dung trao đổi phù hợp.",
      "errorTitle": "Chưa thể gửi yêu cầu demo",
      "errorDescription": "Thông tin của bạn vẫn được giữ nguyên. Hãy thử lại hoặc liên hệ trực tiếp với đội ngũ tư vấn."
    },
    "validation": {
      "fullName": "Nhập họ tên từ 2 đến 100 ký tự.",
      "workEmail": "Nhập một email công việc hợp lệ.",
      "phone": "Nhập số điện thoại từ 8 đến 20 ký tự.",
      "companyName": "Nhập tên doanh nghiệp từ 2 đến 160 ký tự.",
      "companySize": "Chọn quy mô doanh nghiệp.",
      "industry": "Chọn lĩnh vực hoạt động.",
      "primaryNeed": "Chọn nhu cầu ưu tiên.",
      "message": "Thông tin bổ sung không vượt quá 1.000 ký tự.",
      "privacyConsent": "Bạn cần đồng ý chính sách riêng tư để gửi yêu cầu."
    }
  }
}
```

- [ ] **Step 5: Mirror the same key tree in English with intentional translations**

Add this complete English tree. Keep every object key and array length aligned with the Vietnamese locale:

```json
{
  "landing": {
    "nav": {
      "features": "Features",
      "solutions": "Solutions",
      "pricing": "Services",
      "login": "Sign in",
      "trial": "Try VUM CRM",
      "demo": "Book a demo",
      "workspace": "Open workspace",
      "openMenu": "Open navigation menu",
      "closeMenu": "Close navigation menu"
    },
    "common": {
      "brandDescriptor": "Customer and revenue management platform",
      "skipToContent": "Skip to main content",
      "illustrativeData": "Illustrative data",
      "learnMore": "Learn more",
      "contactSales": "Contact the advisory team"
    },
    "footer": {
      "summary": "VUM CRM helps businesses centralize customer data, control the pipeline, and run sales processes on one unified platform.",
      "product": "Product",
      "contact": "Contact",
      "privacy": "Privacy policy",
      "terms": "Terms of use",
      "copyright": "VUM CRM. All rights reserved."
    },
    "metadata": {
      "homeTitle": "VUM CRM | Control the entire sales process",
      "homeDescription": "Centralize customer data and manage pipeline, quotes, contracts, and sales performance on a CRM platform for Vietnamese enterprises.",
      "featuresTitle": "VUM CRM Features | From lead to contract",
      "featuresDescription": "Explore how VUM CRM manages the full customer lifecycle, opportunities, quotes, contracts, automation, and data governance.",
      "solutionsTitle": "VUM CRM Solutions | Sales operations built around your business model",
      "solutionsDescription": "Standardize sales processes across regions, teams, and complex B2B cycles with centrally governed customer data.",
      "pricingTitle": "VUM CRM Services | Consultation based on operational needs",
      "pricingDescription": "Define the VUM CRM implementation scope based on team size, process complexity, and data-governance requirements.",
      "demoTitle": "Book a VUM CRM demo",
      "demoDescription": "Talk directly with the VUM team about your sales process, customer data, and an appropriate implementation scope."
    },
    "home": {
      "hero": {
        "kicker": "VUM CRM for Vietnamese enterprises",
        "title": "One system where the sales team works from the same data and follows the same process.",
        "description": "Bring customer records, opportunities, quotes, contracts, and service activities together so leaders can see revenue clearly while the team focuses on the next action.",
        "primaryCta": "Book a demo",
        "secondaryCta": "Try VUM CRM"
      },
      "proof": {
        "label": "One connected operating flow",
        "items": ["Customer 360°", "Stage-based pipeline", "Quotes and contracts", "Scope-based permissions", "Audit logs"]
      },
      "problem": {
        "eyebrow": "From scattered data to an operating system",
        "title": "Your business does not need another report. It needs a trustworthy source of data for action.",
        "beforeTitle": "When the process is fragmented",
        "beforeItems": ["Customer information lives in many files and with many people", "The pipeline is updated only before review meetings", "Quotes, contracts, and conversation history are disconnected"],
        "afterTitle": "When operations run on VUM CRM",
        "afterItems": ["Every account has one unified profile and timeline", "Every opportunity is tracked by stage, owner, and next action", "Leaders see the same data the team uses every day"]
      },
      "capabilities": {
        "eyebrow": "Three core capabilities",
        "title": "Stay with the customer from the first signal through post-contract service",
        "customer360Title": "One customer profile with complete context",
        "customer360Description": "Connect organizations, contacts, activities, documents, and lifecycle status in one view.",
        "pipelineTitle": "A pipeline that reflects real work",
        "pipelineDescription": "Track value, probability, timing, and the next action for every opportunity instead of waiting for an end-of-period summary.",
        "automationTitle": "Processes keep moving while the team is busy",
        "automationDescription": "Standardize assignment, reminders, approvals, and alerts so opportunities are not lost between steps."
      },
      "roles": {
        "eyebrow": "One system, three perspectives",
        "title": "Each role sees what it needs to make a decision",
        "executiveLabel": "Executives",
        "executiveTitle": "See revenue and risk from the same source of data",
        "executiveItems": ["Track pipeline and revenue trends", "Identify regions or stages where work is blocked", "Review performance without waiting for manual reports"],
        "managerLabel": "Managers",
        "managerTitle": "Know which opportunities need support before it is too late",
        "managerItems": ["Control assignment across teams", "Find opportunities with no next activity", "Coach with evidence from each pipeline stage"],
        "salesLabel": "Sales representatives",
        "salesTitle": "Spend less time updating and more time with customers",
        "salesItems": ["Manage calls, meetings, and next tasks", "Create quotes from product catalogs and price books", "Review the full interaction history before every contact"]
      },
      "trust": {
        "eyebrow": "Governance for enterprises",
        "title": "Scale the team without giving up control of customer data",
        "items": ["Centralized roles and permissions", "Data scope by organization and team", "Access and change logs", "Data import, webhooks, and integrations"]
      },
      "finalCta": {
        "title": "Start with the process costing your business the most time.",
        "description": "The VUM team will review your current customer flow, pipeline, and data before recommending an implementation scope.",
        "primary": "Book a demo",
        "secondary": "Try VUM CRM"
      }
    },
    "features": {
      "heroKicker": "The customer lifecycle on one platform",
      "heroTitle": "From first lead to contract and post-sale service",
      "heroDescription": "VUM CRM connects the steps your teams perform every day so data stays intact across marketing, sales, operations, and service.",
      "stages": {
        "lead": {"title": "Capture and qualify leads", "description": "Record source, owner, contact status, and conversion criteria."},
        "account": {"title": "Build Account and Contact 360° profiles", "description": "Centralize company details, contacts, relationships, addresses, channels, and activity history."},
        "opportunity": {"title": "Manage opportunities through the pipeline", "description": "Track stage, value, probability, expected date, and next action."},
        "commerce": {"title": "Connect opportunities with quotes, orders, and contracts", "description": "Preserve commercial context from proposal through delivery commitment."},
        "automation": {"title": "Standardize reminders and workflows", "description": "Combine activities, notifications, and pipeline configuration so the team works consistently."},
        "forecast": {"title": "Track forecasts and performance", "description": "Aggregate opportunity data so leaders and managers can assess revenue progress."},
        "governance": {"title": "Control permissions, scope, and access history", "description": "Apply roles, data scope, privacy controls, and audit logs within the same platform."}
      },
      "ctaTitle": "See VUM CRM work with your business process",
      "ctaAction": "Book a process-focused demo"
    },
    "solutions": {
      "heroKicker": "Solutions for your operating model",
      "heroTitle": "CRM should fit how your organization works and makes decisions",
      "heroDescription": "Instead of applying one template to every industry, VUM starts with your organization structure, sales cycle, and data-governance requirements.",
      "contexts": {
        "regional": {"title": "Regional teams with multiple management levels", "description": "Assign customers, track performance, and limit data by organization, region, and team."},
        "b2b": {"title": "Long B2B sales cycles with multiple stakeholders", "description": "Preserve context from contacts, opportunities, and quotes through orders and contracts."},
        "governed": {"title": "Operations that require integration and traceability", "description": "Connect data through imports, webhooks, and integration records while maintaining audit logs and privacy controls."}
      },
      "ctaTitle": "Discuss your current operating challenge",
      "ctaAction": "Book a consultation"
    },
    "pricing": {
      "heroKicker": "An implementation scope based on real needs",
      "heroTitle": "Service scope based on how your business operates",
      "heroDescription": "VUM assesses team size, process complexity, and governance requirements before proposing an appropriate scope and cost.",
      "factors": {
        "scale": {"title": "Team size and structure", "description": "The number of users, regions, departments, management levels, and data scopes to control."},
        "process": {"title": "Process complexity", "description": "The number of pipelines, approval steps, quotes, contracts, and service flows to standardize."},
        "integration": {"title": "Data and integrations", "description": "The data sources to migrate, systems to connect, and synchronization requirements."},
        "governance": {"title": "Governance and implementation support", "description": "Permissions, audit, privacy, training, operations, and the required support level."}
      },
      "includedTitle": "Every consultation scope starts with the core platform",
      "includedItems": ["Account and Contact 360°", "Lead and Opportunity Pipeline", "Customer engagement activities", "Catalogs, quotes, orders, and contracts", "Roles, permissions, and data scope"],
      "ctaTitle": "Receive a proposal based on your process and scale",
      "ctaAction": "Get service guidance"
    },
    "demo": {
      "heroKicker": "Talk directly with the VUM team",
      "heroTitle": "See VUM CRM applied to your sales process",
      "heroDescription": "Share how your team manages customers, pipeline, and reporting. VUM will prepare a focused conversation around that challenge.",
      "form": {
        "title": "Information to prepare your demo",
        "fullName": "Full name",
        "workEmail": "Work email",
        "phone": "Phone number",
        "companyName": "Company name",
        "companySize": "Company size",
        "industry": "Industry",
        "primaryNeed": "Primary need",
        "message": "Additional information",
        "privacyConsent": "I agree that VUM may use this information to contact me and prepare the demo under the privacy policy.",
        "submit": "Send demo request",
        "submitting": "Sending request…"
      },
      "companySizes": {"UNDER_50": "Fewer than 50 employees", "FROM_50_TO_199": "50–199 employees", "FROM_200_TO_999": "200–999 employees", "FROM_1000": "1,000 employees or more"},
      "industries": {"FINANCE": "Finance", "REAL_ESTATE": "Real estate", "RETAIL_FNB": "Retail and F&B", "MANUFACTURING_DISTRIBUTION": "Manufacturing and distribution", "TECHNOLOGY_B2B": "Technology and B2B services", "OTHER": "Other industry"},
      "needs": {"CUSTOMER_360": "Centralize customer data", "SALES_PIPELINE": "Control the sales pipeline", "QUOTES_CONTRACTS": "Manage quotes and contracts", "AUTOMATION_FORECAST": "Automate and forecast", "SECURITY_INTEGRATION": "Permissions and integrations", "OTHER": "Other need"},
      "contact": {
        "title": "Contact the VUM team directly",
        "description": "The online request channel has not been configured. Use one of the channels below and the advisory team will respond.",
        "email": "Email sales",
        "phone": "Call the advisory team",
        "unavailable": "No contact channel has been configured. You can still try the product or return later."
      },
      "states": {
        "successTitle": "Your demo request has been received",
        "successDescription": "The VUM team will use the information you provided to prepare a relevant conversation.",
        "errorTitle": "The demo request could not be sent",
        "errorDescription": "Your information is still in the form. Try again or contact the advisory team directly."
      },
      "validation": {
        "fullName": "Enter a full name between 2 and 100 characters.",
        "workEmail": "Enter a valid work email.",
        "phone": "Enter a phone number between 8 and 20 characters.",
        "companyName": "Enter a company name between 2 and 160 characters.",
        "companySize": "Select a company size.",
        "industry": "Select an industry.",
        "primaryNeed": "Select a primary need.",
        "message": "Additional information cannot exceed 1,000 characters.",
        "privacyConsent": "You must accept the privacy policy before sending the request."
      }
    }
  }
}
```

Do not retain any copy from the existing English marketing template.

- [ ] **Step 6: Statistically compare locale structure**

Run:

```bash
rtk read src/i18n/locales/vi/translation.json src/i18n/locales/en/translation.json
rtk grep -n '"landing"|AI-Powered|Seamless Integration|Pricing Plans|Request Demo' src/i18n/locales
```

Expected: one `landing` root per locale and no copied template headings.

---

### Task 3: Build landing-scoped visual foundation, metadata hook, and public assets

**Files:**
- Create: `src/features/landing/landing.css`
- Create: `src/features/landing/hooks/useLandingMetadata.ts`
- Create: `public/favicon.svg`
- Create: `public/og/vum-crm-landing.svg`
- Create: `public/og/vum-crm-landing.png`
- Modify: `index.html:5-13`

**Interfaces:**
- Produces: `.landing-theme`, `.landing-container`, `.landing-display`, `.landing-section`, `.landing-focus`, and `useLandingMetadata(metadata)`.
- Consumes: `env.publicSiteUrl` and `LandingMetadata`.

- [ ] **Step 1: Create the scoped landing token file**

Start `landing.css` with this exact foundation:

```css
.landing-theme {
  --landing-canvas: #f5f8fc;
  --landing-surface: #ffffff;
  --landing-ink: #07182b;
  --landing-muted: #52647a;
  --landing-line: #dce5f0;
  --landing-blue: #085ac0;
  --landing-blue-hover: #06499d;
  --landing-blue-soft: #eaf2fc;
  min-height: 100dvh;
  background: var(--landing-canvas);
  color: var(--landing-ink);
  font-family: 'Be Vietnam Pro', sans-serif;
  overflow-x: clip;
}

.landing-theme .landing-container {
  width: min(100% - 2rem, 82.5rem);
  margin-inline: auto;
}

.landing-theme .landing-display {
  font-family: 'Plus Jakarta Sans', 'Be Vietnam Pro', sans-serif;
  letter-spacing: -0.04em;
  text-wrap: balance;
}

.landing-theme .landing-section {
  padding-block: clamp(4rem, 9vw, 9rem);
}

.landing-theme :where(a, button, input, select, textarea):focus-visible {
  outline: 3px solid color-mix(in srgb, var(--landing-blue) 65%, white);
  outline-offset: 3px;
}

@media (prefers-reduced-motion: reduce) {
  .landing-theme *,
  .landing-theme *::before,
  .landing-theme *::after {
    scroll-behavior: auto !important;
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

Add only landing-prefixed keyframes and selectors. Do not use a global element selector outside `.landing-theme`.

- [ ] **Step 2: Create the metadata hook without a new dependency**

Implement this API:

```ts
export function useLandingMetadata(metadata: LandingMetadata): void;
```

The hook must:

```ts
const canonicalUrl = new URL(metadata.path, `${env.publicSiteUrl}/`).toString();
const imageUrl = new URL(metadata.imagePath ?? '/og/vum-crm-landing.png', `${env.publicSiteUrl}/`).toString();
```

Inside `useEffect`, set `document.title`; upsert `meta[name="description"]`, `meta[property="og:title"]`, `meta[property="og:description"]`, `meta[property="og:url"]`, `meta[property="og:image"]`; and upsert `link[rel="canonical"]`. Remove no unrelated document tags.

- [ ] **Step 3: Create the local favicon**

Create a simple internal SVG with a navy square, blue inset, and white `V` path. Use this exact accessible-free decorative asset structure:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="14" fill="#07182B"/>
  <path d="M15 17h9l8 22 8-22h9L37 48H27L15 17Z" fill="#FFFFFF"/>
  <path d="M48 13h7v7h-7z" fill="#085AC0"/>
</svg>
```

- [ ] **Step 4: Create the Open Graph source and raster asset**

Create `public/og/vum-crm-landing.svg` at 1200×630 with:

- Canvas `#F5F8FC`.
- VUM favicon mark at top left.
- Navy headline: “Kiểm soát toàn bộ quy trình bán hàng.”
- Muted supporting line: “Khách hàng 360° · Pipeline · Báo giá · Hợp đồng · Quản trị dữ liệu”.
- A right-side code-native cockpit composition using only navy, blue, white, and the mandated lifecycle colors.
- No customer logo, people, claim, gradient text, or remote asset.

Export the same composition to `public/og/vum-crm-landing.png` at exactly 1200×630. Use the environment’s image-generation or SVG rasterization capability; do not download a third-party image.

- [ ] **Step 5: Add safe static defaults to `index.html`**

Keep the existing viewport and font preconnects. Add default description and Open Graph tags that the metadata hook will update after route mount:

```html
<meta name="description" content="VUM CRM giúp doanh nghiệp tập trung dữ liệu khách hàng và kiểm soát toàn bộ quy trình bán hàng." />
<meta property="og:type" content="website" />
<meta property="og:title" content="VUM CRM" />
<meta property="og:description" content="Nền tảng quản trị khách hàng và doanh số cho doanh nghiệp Việt." />
<meta property="og:image" content="/og/vum-crm-landing.png" />
<meta name="theme-color" content="#F5F8FC" />
```

- [ ] **Step 6: Perform static scope and asset inspection**

Run:

```bash
rtk read src/features/landing/landing.css src/features/landing/hooks/useLandingMetadata.ts index.html public/favicon.svg public/og/vum-crm-landing.svg
rtk grep -n "transition: all|animation:.*infinite|aida-public|#000000" src/features/landing public
```

Expected: no match for the prohibited patterns in newly created landing files.

---

### Task 4: Implement the honest `/demo` data flow and page

**Files:**
- Create: `src/features/landing/services/demoRequestService.ts`
- Create: `src/features/landing/components/DemoRequestForm.tsx`
- Create: `src/features/landing/pages/DemoPage.tsx`
- Modify: `src/routes/AppRoutes.tsx:56-73`

**Interfaces:**
- Consumes: `DemoRequestInput`, `DemoRequestResult`, `env.demoRequestEndpoint`, `env.privacyPolicyUrl`, `env.salesEmail`, and `env.salesPhone`.
- Produces: `demoRequestService.submit(input): Promise<DemoRequestResult>` and the public `/demo` route.

- [ ] **Step 1: Implement a public unauthenticated service**

Export:

```ts
export class PublicDemoRequestError extends Error {
  constructor(
    message: string,
    public readonly code: DemoRequestServiceError['code'],
    public readonly status?: number
  ) {
    super(message);
    this.name = 'PublicDemoRequestError';
  }
}

export const demoRequestService = {
  async submit(input: DemoRequestInput): Promise<DemoRequestResult> {
    if (!env.demoRequestEndpoint) {
      throw new PublicDemoRequestError(
        'Demo request endpoint is not configured',
        'CONFIGURATION_ERROR'
      );
    }

    let response: Response;
    try {
      response = await fetch(env.demoRequestEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
        credentials: 'omit',
      });
    } catch {
      throw new PublicDemoRequestError('Network request failed', 'NETWORK_ERROR');
    }

    if (!response.ok) {
      throw new PublicDemoRequestError(
        'Demo request was rejected',
        'REQUEST_REJECTED',
        response.status
      );
    }

    if (response.status === 204) return {};
    return (await response.json().catch(() => ({}))) as DemoRequestResult;
  },
};
```

Do not import `apiFetch`; the public request must not inherit session or tenant behavior.

- [ ] **Step 2: Define the exact Zod form schema**

Inside `DemoRequestForm.tsx`, use:

```ts
const phonePattern = /^[0-9+().\-\s]{8,20}$/;

const createDemoRequestSchema = (t: TFunction) =>
  z.object({
    fullName: z.string().trim().min(2, t('landing.demo.validation.fullName')).max(100, t('landing.demo.validation.fullName')),
    workEmail: z.string().trim().email(t('landing.demo.validation.workEmail')).max(254, t('landing.demo.validation.workEmail')),
    phone: z.string().trim().regex(phonePattern, t('landing.demo.validation.phone')),
    companyName: z.string().trim().min(2, t('landing.demo.validation.companyName')).max(160, t('landing.demo.validation.companyName')),
    companySize: z.enum(['UNDER_50', 'FROM_50_TO_199', 'FROM_200_TO_999', 'FROM_1000'], {
      required_error: t('landing.demo.validation.companySize'),
      invalid_type_error: t('landing.demo.validation.companySize'),
    }),
    industry: z.enum(['FINANCE', 'REAL_ESTATE', 'RETAIL_FNB', 'MANUFACTURING_DISTRIBUTION', 'TECHNOLOGY_B2B', 'OTHER'], {
      required_error: t('landing.demo.validation.industry'),
      invalid_type_error: t('landing.demo.validation.industry'),
    }),
    primaryNeed: z.enum(['CUSTOMER_360', 'SALES_PIPELINE', 'QUOTES_CONTRACTS', 'AUTOMATION_FORECAST', 'SECURITY_INTEGRATION', 'OTHER'], {
      required_error: t('landing.demo.validation.primaryNeed'),
      invalid_type_error: t('landing.demo.validation.primaryNeed'),
    }),
    message: z.string().trim().max(1000, t('landing.demo.validation.message')).optional(),
    privacyConsent: z.boolean().refine(Boolean, {
      message: t('landing.demo.validation.privacyConsent'),
    }),
  });
```

- [ ] **Step 3: Implement the form’s public API and states**

Use this signature:

```ts
export interface DemoRequestFormProps {
  privacyPolicyUrl: string;
  salesEmail?: string;
  salesPhone?: string;
}

export function DemoRequestForm(props: DemoRequestFormProps): JSX.Element;
```

Use existing `Form`, `Input`, `Textarea`, `Select`, `Checkbox`, `Button`, and `Label` primitives. On submit, add `locale` from `i18n.resolvedLanguage === 'en' ? 'en' : 'vi'`, `sourcePath` from `location.pathname`, and `privacyConsent: true` after the refined schema succeeds. Preserve values on error, reset on 2xx success, focus the first invalid field through react-hook-form, and render success/error inside `role="status" aria-live="polite"`.

Inputs must include:

```text
fullName: name="fullName", autoComplete="name"
workEmail: name="workEmail", type="email", inputMode="email", autoComplete="email", spellCheck={false}
phone: name="phone", type="tel", inputMode="tel", autoComplete="tel"
companyName: name="companyName", autoComplete="organization"
message: name="message", maxLength={1000}
```

- [ ] **Step 4: Implement explicit submission and contact modes**

`DemoPage` uses:

```ts
const canSubmitDemoRequest = Boolean(
  env.demoRequestEndpoint && env.privacyPolicyUrl
);
const hasDirectContact = Boolean(env.salesEmail || env.salesPhone);
```

Behavior:

- `canSubmitDemoRequest`: render `DemoRequestForm`.
- Otherwise and `hasDirectContact`: render `mailto:` and/or `tel:` links, never a form.
- Otherwise: render configuration-unavailable copy and a secondary `Link` to `/register`.
- Call `useLandingMetadata` with the `/demo` metadata keys.
- Use one `h1` and `main id="main-content"` is owned by `LandingLayout`, not nested here.

- [ ] **Step 5: Register `/demo` without moving the existing pages yet**

Add:

```ts
import DemoPage from '@/features/landing/pages/DemoPage';
```

and inside the existing public `LandingLayout` route:

```tsx
<Route path="/demo" element={<DemoPage />} />
```

- [ ] **Step 6: Perform static demo-flow inspection**

Run:

```bash
rtk read src/features/landing/services/demoRequestService.ts src/features/landing/components/DemoRequestForm.tsx src/features/landing/pages/DemoPage.tsx
rtk grep -n "apiFetch|Authorization|X-Tenant-ID|credentials: 'include'|console\." src/features/landing/services src/features/landing/components/DemoRequestForm.tsx
```

Expected: no prohibited auth, tenant, credentials, or logging behavior.

---

### Task 5: Build shared landing primitives, header, footer, and layout shell

**Files:**
- Create: `src/features/landing/components/LandingSection.tsx`
- Create: `src/features/landing/components/SectionHeading.tsx`
- Create: `src/features/landing/components/LandingHeader.tsx`
- Create: `src/features/landing/components/LandingFooter.tsx`
- Modify: `src/features/landing/LandingLayout.tsx`

**Interfaces:**
- Produces: reusable public shell and section contracts.
- Consumes: auth state, `env` public contact/legal configuration, navigation translations, and `/demo`.

- [ ] **Step 1: Create focused layout primitives**

Use these exact APIs:

```ts
export interface LandingSectionProps extends React.ComponentProps<'section'> {
  contained?: boolean;
}

export function LandingSection({ contained = true, className, children, ...props }: LandingSectionProps): JSX.Element;

export interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: 'left' | 'center';
  as?: 'h1' | 'h2';
}

export function SectionHeading(props: SectionHeadingProps): JSX.Element;
```

`LandingSection` applies `landing-section`; when contained, it adds a child `landing-container`. `SectionHeading` constrains description width and uses `landing-display` for its heading.

- [ ] **Step 2: Implement a restrained, route-aware header**

Header navigation is exactly:

```ts
const navItems = [
  { key: 'features', to: '/features' },
  { key: 'solutions', to: '/solutions' },
  { key: 'pricing', to: '/pricing' },
] as const;
```

Requirements:

- Logo/wordmark links to `/` and uses `translate="no"`.
- Desktop primary CTA links to `/demo`.
- Unauthenticated secondary actions are `/login` and `/register`.
- Authenticated strongest action is `/app/overview`.
- Active route uses `aria-current="page"`.
- Mobile menu button has translated open/close labels, `aria-expanded`, and `aria-controls="landing-mobile-nav"`.
- Menu closes on route change, Escape, and link selection.
- All interactive controls are at least 44px high.
- Remove the announcement bar and all unverified product-version, hotline, and trial-duration claims.

- [ ] **Step 3: Implement a compact verified footer**

Footer contains:

- VUM wordmark and approved summary.
- Links to `/features`, `/solutions`, `/pricing`, `/demo`, `/login`.
- `mailto:` only when `env.salesEmail` exists.
- `tel:` only when `env.salesPhone` exists.
- Privacy and terms links only when their environment URLs exist.
- Current year and translated copyright.

Do not recreate the existing five-column link farm or dead API/SLA/status links.

- [ ] **Step 4: Reduce `LandingLayout` to shell composition**

Replace the monolithic implementation with:

```tsx
export const LandingLayout: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="landing-theme flex min-h-[100dvh] flex-col">
      <a href="#main-content" className="sr-only focus:not-sr-only">
        {t('landing.common.skipToContent')}
      </a>
      <LandingHeader />
      <main id="main-content" tabIndex={-1} className="flex-1">
        <Outlet />
      </main>
      <LandingFooter />
    </div>
  );
};
```

Import `./landing.css` from `LandingLayout`. Pages must not render a second `<main>`.

- [ ] **Step 5: Perform static shell inspection**

Run:

```bash
rtk read src/features/landing/LandingLayout.tsx src/features/landing/components/LandingHeader.tsx src/features/landing/components/LandingFooter.tsx
rtk grep -n "href=\"#\"|VUM CRM v|99.99|ISO 27001|1900 8899" src/features/landing
```

Expected: only the valid skip-link uses an in-page hash; unverified claims and dead links are absent.

---

### Task 6: Build the product cockpit and role outcomes from typed illustrative content

**Files:**
- Create: `src/features/landing/content/productPreviewContent.ts`
- Create: `src/features/landing/components/ProductCockpit.tsx`
- Create: `src/features/landing/components/RoleOutcomeTabs.tsx`
- Modify: `src/i18n/locales/vi/translation.json`
- Modify: `src/i18n/locales/en/translation.json`

**Interfaces:**
- Consumes: `CockpitTabId`, `RoleOutcomeId`, `renderLifecycleStageBadge`, and i18n keys.
- Produces: keyboard-accessible product and role evidence for Home and supporting routes.

- [ ] **Step 1: Define content descriptors rather than customer-like mock records**

Create typed data with these records:

```ts
export interface PreviewPipelineItem {
  id: string;
  labelKey: string;
  stage: 'PROSPECT' | 'QUALIFIED' | 'CUSTOMER';
  nextActionKey: string;
}

export const previewPipelineItems: PreviewPipelineItem[] = [
  { id: 'customer-data', labelKey: 'landing.preview.items.customerData', stage: 'PROSPECT', nextActionKey: 'landing.preview.actions.qualify' },
  { id: 'quote-process', labelKey: 'landing.preview.items.quoteProcess', stage: 'QUALIFIED', nextActionKey: 'landing.preview.actions.review' },
  { id: 'renewal-workflow', labelKey: 'landing.preview.items.renewalWorkflow', stage: 'CUSTOMER', nextActionKey: 'landing.preview.actions.followUp' },
];
```

Add these exact translations:

| Key | Vietnamese | English |
|---|---|---|
| `landing.preview.items.customerData` | `Chuẩn hóa dữ liệu khách hàng` | `Standardize customer data` |
| `landing.preview.items.quoteProcess` | `Thiết kế luồng báo giá` | `Design the quote workflow` |
| `landing.preview.items.renewalWorkflow` | `Vận hành quy trình tái ký` | `Run the renewal workflow` |
| `landing.preview.actions.qualify` | `Đánh giá nhu cầu` | `Qualify the need` |
| `landing.preview.actions.review` | `Rà soát đề xuất` | `Review the proposal` |
| `landing.preview.actions.followUp` | `Theo dõi sau triển khai` | `Follow up after implementation` |

Do not add person names, company names, revenue, accuracy, ROI, or SLA values.

- [ ] **Step 2: Implement `ProductCockpit` with existing Radix tabs**

Use `Tabs`, `TabsList`, `TabsTrigger`, and `TabsContent` from `@/components/ui/tabs` with IDs:

```text
pipeline -> landing-cockpit-tab-pipeline / landing-cockpit-panel-pipeline
customer360 -> landing-cockpit-tab-customer360 / landing-cockpit-panel-customer360
governance -> landing-cockpit-tab-governance / landing-cockpit-panel-governance
```

Render lifecycle badges only through:

```tsx
{renderLifecycleStageBadge(item.stage)}
```

The cockpit must show “Dữ liệu minh họa,” contain no clickable generic `div`, and use no fake chart percentage.

- [ ] **Step 3: Implement `RoleOutcomeTabs` with translated arrays**

Use existing Radix tabs and the `RoleOutcomeId` values. Each panel renders one heading and three translated outcome bullets. Do not reimplement manual keyboard event handlers that Radix already provides.

- [ ] **Step 4: Perform static product-evidence inspection**

Run:

```bash
rtk read src/features/landing/content/productPreviewContent.ts src/features/landing/components/ProductCockpit.tsx src/features/landing/components/RoleOutcomeTabs.tsx
rtk grep -n "onClick=.*div|Vinahome|NextGen|99\.99|94\.2|\+38|bg-purple-50" src/features/landing/components src/features/landing/content
```

Expected: no customer-like fabrication, local lifecycle class, or generic clickable container.

---

### Task 7: Compose the approved seven-section Home page

**Files:**
- Create: `src/features/landing/sections/home/HeroSection.tsx`
- Create: `src/features/landing/sections/home/ProofStrip.tsx`
- Create: `src/features/landing/sections/home/ProblemOutcomeSection.tsx`
- Create: `src/features/landing/sections/home/CapabilityStoriesSection.tsx`
- Create: `src/features/landing/sections/home/RoleOutcomesSection.tsx`
- Create: `src/features/landing/sections/home/TrustSection.tsx`
- Create: `src/features/landing/sections/home/FinalDemoSection.tsx`
- Create: `src/features/landing/pages/HomePage.tsx`

**Interfaces:**
- Consumes: shared section primitives, `ProductCockpit`, `RoleOutcomeTabs`, metadata hook, and `landing.home.*` translations.
- Produces: new inactive Home page ready for route cutover in Task 11.

- [ ] **Step 1: Implement the asymmetric Hero**

Use a 12-column desktop grid with narrative spanning five columns and cockpit spanning seven. The only above-fold actions are:

```tsx
<Button asChild><Link to="/demo">{t('landing.home.hero.primaryCta')}</Link></Button>
<Button asChild variant="outline"><Link to="/register">{t('landing.home.hero.secondaryCta')}</Link></Button>
```

Do not add an eyebrow pill, animated dot, gradient text, floating badge, or remote image.

- [ ] **Step 2: Implement the proof strip as implemented capability evidence**

Render the five translated proof items in a responsive horizontal/list treatment. Use text and restrained separators, not fake logos or equal elevated cards.

- [ ] **Step 3: Implement Problem-to-Outcome as a two-sided editorial comparison**

Use the exact before/after arrays from i18n. Present one central dividing rule or progression marker; do not create six independent cards.

- [ ] **Step 4: Implement three alternating capability stories**

Use text/product compositions for Customer 360, Pipeline, and Automation. Alternate visual/text order on desktop and keep logical reading order on mobile. Reuse code-native cockpit details rather than screenshots.

- [ ] **Step 5: Implement role, trust, and final conversion sections**

- `RoleOutcomesSection` wraps `RoleOutcomeTabs`.
- `TrustSection` renders only the four verified repository capabilities from translations.
- `FinalDemoSection` links to `/demo` and `/register`; it contains no trial-duration promise.

- [ ] **Step 6: Compose `HomePage` under approximately 100 lines**

Use:

```tsx
export default function HomePage() {
  const { t } = useTranslation();
  useLandingMetadata({
    title: t('landing.metadata.homeTitle'),
    description: t('landing.metadata.homeDescription'),
    path: '/',
  });

  return (
    <>
      <HeroSection />
      <ProofStrip />
      <ProblemOutcomeSection />
      <CapabilityStoriesSection />
      <RoleOutcomesSection />
      <TrustSection />
      <FinalDemoSection />
    </>
  );
}
```

- [ ] **Step 7: Perform static Home narrative inspection**

Run:

```bash
rtk wc -l src/features/landing/pages/HomePage.tsx
rtk grep -n "testimonial|FAQ|animate-ping|gradient-to|aida-public|14 ngày|2,500|99.99|ISO" src/features/landing/pages src/features/landing/sections/home
```

Expected: Home composition is concise and no removed template/claim pattern remains.

---

### Task 8: Implement the lifecycle-led Features page

**Files:**
- Create: `src/features/landing/pages/FeaturesPage.tsx`

**Interfaces:**
- Consumes: `LandingSection`, `SectionHeading`, metadata hook, and `landing.features.*`.
- Produces: new inactive Features page ready for Task 11 cutover.

- [ ] **Step 1: Create the page hero and seven lifecycle stages**

Render one `h1` through `SectionHeading as="h1"`, followed by seven ordered `<article>` elements keyed by:

```ts
const stages = ['lead', 'account', 'opportunity', 'commerce', 'automation', 'forecast', 'governance'] as const;
```

Each article contains a two-digit sequence, translated title, translated description, and a code-native line/icon composition. Use existing Lucide icons sparsely; decorative icons use `aria-hidden="true"`.

- [ ] **Step 2: Add the route CTA and metadata**

CTA links to `/demo` with `landing.features.ctaAction`. Metadata uses `featuresTitle`, `featuresDescription`, and `/features`.

- [ ] **Step 3: Perform static Features inspection**

Run:

```bash
rtk read src/features/landing/pages/FeaturesPage.tsx
rtk grep -n "AI-Powered|Seamless|Architectural Flow|data-alt|backgroundImage|https://lh3" src/features/landing/pages/FeaturesPage.tsx
```

Expected: zero matches.

---

### Task 9: Implement the business-context Solutions page

**Files:**
- Create: `src/features/landing/pages/SolutionsPage.tsx`

**Interfaces:**
- Consumes: shared primitives, metadata hook, and `landing.solutions.*`.
- Produces: new inactive Solutions page ready for Task 11 cutover.

- [ ] **Step 1: Build three supported-context narratives**

Render `regional`, `b2b`, and `governed` as asymmetric editorial rows. Each row includes:

- One translated heading and description.
- A code-native diagram using lines, labels, and existing Lucide icons.
- A short list of repository-backed modules relevant to that context.

Do not claim HIPAA, KYC, regulatory certification, predictive AI, or specific industry compliance.

- [ ] **Step 2: Add the route CTA and metadata**

CTA links to `/demo`; remove the embedded form entirely. Metadata uses `solutionsTitle`, `solutionsDescription`, and `/solutions`.

- [ ] **Step 3: Perform static Solutions inspection**

Run:

```bash
rtk read src/features/landing/pages/SolutionsPage.tsx
rtk grep -n "HIPAA|KYC|Financial Services|Healthcare|aida-public|<form|animate-fade" src/features/landing/pages/SolutionsPage.tsx
```

Expected: zero matches.

---

### Task 10: Implement honest consultation-led Pricing page

**Files:**
- Create: `src/features/landing/pages/PricingPage.tsx`

**Interfaces:**
- Consumes: shared primitives, metadata hook, and `landing.pricing.*`.
- Produces: new inactive Pricing page ready for Task 11 cutover.

- [ ] **Step 1: Replace pricing towers with four scoping factors**

Render `scale`, `process`, `integration`, and `governance` in a gapless or lightly divided editorial grid. These are evaluation factors, not named plans.

- [ ] **Step 2: Add the verified foundation list and consultation CTA**

Render the translated `includedItems` list and one strong `/demo` CTA. Do not render price, currency, discount, payment method, seat limit, “Most Popular,” or three pricing towers.

- [ ] **Step 3: Add metadata and perform static Pricing inspection**

Run:

```bash
rtk read src/features/landing/pages/PricingPage.tsx
rtk grep -n "\$|USD|/user|Most Popular|Starter|Professional|Enterprise|20%|PayPal|href=\"#\"" src/features/landing/pages/PricingPage.tsx
```

Expected: zero matches.

---

### Task 11: Cut routes over to the new pages and remove obsolete implementations

**Files:**
- Modify: `src/routes/AppRoutes.tsx:56-73`
- Remove: `src/features/landing/HomePage.tsx`
- Remove: `src/features/landing/FeaturesPage.tsx`
- Remove: `src/features/landing/SolutionsPage.tsx`
- Remove: `src/features/landing/PricingPage.tsx`

**Interfaces:**
- Consumes: all five new page default exports.
- Produces: active public route tree using the approved implementation.

- [ ] **Step 1: Replace the four old imports with new page paths**

Use exactly:

```ts
import HomePage from '@/features/landing/pages/HomePage';
import SolutionsPage from '@/features/landing/pages/SolutionsPage';
import FeaturesPage from '@/features/landing/pages/FeaturesPage';
import PricingPage from '@/features/landing/pages/PricingPage';
import DemoPage from '@/features/landing/pages/DemoPage';
```

Keep the route paths `/`, `/solutions`, `/features`, `/pricing`, and `/demo` inside `LandingLayout`.

- [ ] **Step 2: Re-resolve exact obsolete files before removal**

Run:

```bash
rtk grep -n "features/landing/HomePage|features/landing/FeaturesPage|features/landing/SolutionsPage|features/landing/PricingPage" src
```

Expected: only imports being replaced remain. Remove the four old files only after the new imports are present.

- [ ] **Step 3: Remove the four obsolete root page files**

Delete only the exact four files listed in this task. Do not remove `LandingLayout.tsx`, the `landing` feature directory, or unrelated public/auth pages.

- [ ] **Step 4: Inspect the final public route tree**

Run:

```bash
rtk read src/routes/AppRoutes.tsx
rtk tree src/features/landing -L 4
```

Expected: five page modules under `pages/`, one root `LandingLayout.tsx`, and no duplicate old page modules.

---

### Task 12: Remove obsolete landing CSS, audit source, and prepare the uncommitted handoff

**Files:**
- Modify: `src/index.css:97-249`
- Inspect: all files under `src/features/landing`, `public`, locale files, `index.html`, `src/config/env.ts`, `src/config/crmStatusConfig.tsx`, and `src/routes/AppRoutes.tsx`

**Interfaces:**
- Produces: a clean static handoff with no deprecated landing utility or unresolved contract.

- [ ] **Step 1: Resolve usage before removing obsolete global utilities**

Search:

```bash
rtk grep -n "animate-float-slow|animate-float-reverse|animate-pulse-glow|bg-shimmer|glass-card-dark|text-gradient-neon|border-glow|neon-glow-bg|animate-float-delayed|animate-pulse-soft|card-hover-lift" src
```

Remove definitions from `src/index.css` only when no non-obsolete consumer remains. Remove the duplicated `floatSlow` keyframe and landing dark/neon utilities. Preserve base application variables, scrollbar behavior, and unrelated shared utilities.

- [ ] **Step 2: Scan public source for forbidden leftovers**

Run:

```bash
rtk grep -n "href=\"#\"|aida-public|data-alt|AI-Powered|Seamless Integration|Pricing Plans|Request Demo|99.99|94.2|2,500|ISO 27001|14 ngày|transition-all|animate-ping" src/features/landing
```

Expected: zero matches, except text explicitly documented as verified outside this plan; do not retain a claim merely to satisfy the search.

- [ ] **Step 3: Compare i18n structure and public configuration usage**

Run:

```bash
rtk grep -n "landing\." src/features/landing
rtk grep -n "VITE_DEMO_REQUEST_ENDPOINT|VITE_SALES_EMAIL|VITE_SALES_PHONE|VITE_PRIVACY_POLICY_URL|VITE_TERMS_URL|VITE_PUBLIC_SITE_URL" src
```

Expected: components consume translations; only `src/config/env.ts` reads raw environment values.

- [ ] **Step 4: Run permitted static TypeScript and lint checks**

Run from `crm-fe`:

```bash
rtk npm run typecheck
rtk npm run lint
```

Expected: both exit successfully. If an unrelated pre-existing error remains, record the exact file and message without modifying unrelated code. Do not run `npm run build` or any test command.

- [ ] **Step 5: Review the complete uncommitted diff**

Run:

```bash
rtk diff
git status --short --untracked-files=all
```

Confirm:

- No dependency file changed.
- No authenticated route or permission behavior changed.
- The only shared status change is the mandated lifecycle palette.
- No backend or `docs/api-reference.md` behavior was invented.
- The design spec and this plan remain uncommitted.

- [ ] **Step 6: Write the Antigravity handoff report**

Report:

```text
Skills used and why
Files created, modified, and removed
Public routes changed
Form submission mode and contact fallback behavior
Metadata and assets added
Accessibility behavior covered by source
Typecheck and lint results
Tests/build/browser/API/manual runtime checks: not run by repository rule
Responsive, visual, keyboard, console, network, and real submission behavior: unverified
No files staged or committed
```

Do not claim the landing is visually complete or production-verified from source inspection alone.

---

## Plan Completion Conditions

The implementation plan is complete only when every checkbox above is resolved, permitted static checks are reported, and all prohibited runtime checks remain unrun. The executor leaves changes uncommitted for user review.
