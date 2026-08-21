# VUM CRM Landing Page Enterprise Evidence Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task with a review checkpoint after every task. Do not use subagents unless the user explicitly authorizes multi-agent work.

**Goal:** Rebuild the VUM CRM home page as an eight-block, evidence-led enterprise SaaS narrative using verified CRM capabilities, local anonymized product screens, and the existing demo-request flow.

**Architecture:** `LandingLayout` remains the single public shell and `HomePage` becomes composition-only. Static translated content and typed product-evidence descriptors feed small home-section components; real local product assets are rendered through one `LandingProductVisual` boundary. Existing routes and the demo form transport contract remain unchanged.

**Tech Stack:** React, TypeScript, Vite, React Router, Tailwind CSS 3, shadcn/ui/Radix primitives already in the repository, `react-i18next`, React Hook Form, Zod, Lucide React.

**Spec:** `docs/superpowers/specs/2026-08-21-landing-page-enterprise-evidence-redesign-design.md`

## Global Constraints

- Work only inside `crm-fe` unless a read-only repository instruction check requires the root.
- Read the root and nested `AGENTS.md` files and the approved spec before editing.
- Run `rtk --help` before the first RTK command in a new environment; prefer `rtk read`, `rtk grep`, `rtk find`, `rtk tree`, `rtk diff`, and `rtk git` when they preserve the required evidence.
- Do not stage, commit, push, create branches, create worktrees, or create pull requests.
- Do not run unit, integration, end-to-end, smoke, browser, API, manual runtime, or database tests.
- Do not run `npm run build`, start/restart the application, or use a build as an indirect test.
- Do not run a browser, screenshot tool, or `http://localhost:3002/` visual inspection unless the user gives a new explicit authorization during the implementation session.
- Do not add or update dependencies.
- Preserve all current user changes. In particular, `src/i18n/locales/vi/translation.json` and `src/i18n/locales/en/translation.json` are already modified; merge only the documented `landing.home` and demo-presentation keys.
- Preserve `/`, `/features`, `/solutions`, `/pricing`, `/demo`, `/login`, `/register`, and authenticated route behavior.
- Preserve the demo-request fields, field order, validation schema, payload, endpoint, service, and submission state machine.
- Do not change a backend API. `docs/api-reference.md` remains untouched.
- Do not add customer logos, testimonials, certifications, prices, ROI, KPI, SLA, uptime, response-time, support-time, adoption, or security guarantees without an approved source.
- Do not add dark home sections, stock photos, remote marketing images, fake dashboards, fake company/person data, glows, glassmorphism, parallax, scroll hijacking, animated counters, or a motion library.
- All substantive home copy must use matching Vietnamese and English `landing.*` keys.
- All code-rendered lifecycle badges must use `@/config/crmStatusConfig`; do not recreate status classes locally.
- Product assets must be local, anonymized, explicitly sized, and traceable to current CRM source screens.
- Responsive CSS must intentionally cover 390px mobile, 768px tablet portrait, 1024px small laptop/tablet landscape, and 1440px desktop. Runtime usability at those widths remains unverified until separately authorized.
- No task is complete until its static inspection step is recorded. Static inspection does not prove runtime, visual, responsive, accessibility, or submission behavior.

## File Map

### Create

```text
src/features/landing/content/homeContent.ts
src/features/landing/content/homeProductEvidence.ts
src/features/landing/components/LandingProductVisual.tsx
src/features/landing/sections/home/CapabilityProofSection.tsx
src/features/landing/sections/home/ProductWorkflowSection.tsx
src/features/landing/sections/home/EnterpriseTrustSection.tsx
src/features/landing/sections/home/CommercialModelSection.tsx
public/landing/product/hero-opportunity-pipeline.webp
public/landing/product/hero-opportunity-pipeline-mobile.webp
public/landing/product/lead-list.webp
public/landing/product/account-detail.webp
public/landing/product/opportunity-pipeline.webp
public/landing/product/quote-workspace.webp
public/landing/product/quote-approval.webp
public/landing/product/contract-list.webp
```

### Modify

```text
tailwind.config.js
src/features/landing/landing.css
src/features/landing/LandingLayout.tsx
src/features/landing/components/LandingSection.tsx
src/features/landing/components/LandingHeader.tsx
src/features/landing/components/LandingFooter.tsx
src/features/landing/components/DemoRequestForm.tsx
src/features/landing/pages/HomePage.tsx
src/features/landing/sections/home/HeroSection.tsx
src/features/landing/sections/home/ProblemOutcomeSection.tsx
src/features/landing/sections/home/RoleOutcomesSection.tsx
src/features/landing/sections/home/DemoSection.tsx
src/features/landing/hooks/useLandingMetadata.ts
src/i18n/locales/vi/translation.json
src/i18n/locales/en/translation.json
public/og/vum-crm-landing.svg
```

### Remove only after reference resolution

```text
src/features/landing/components/AnimatedCounter.tsx
src/features/landing/components/InteractiveSolutionShowcase.tsx
src/features/landing/components/ProductCockpit.tsx
src/features/landing/components/SpotlightCard.tsx
src/features/landing/sections/home/CapabilityStoriesSection.tsx
src/features/landing/sections/home/FeaturesSection.tsx
src/features/landing/sections/home/FinalDemoSection.tsx
src/features/landing/sections/home/PricingSection.tsx
src/features/landing/sections/home/ProofStrip.tsx
src/features/landing/sections/home/SocialProofSection.tsx
src/features/landing/sections/home/SolutionsSection.tsx
src/features/landing/sections/home/TrustSection.tsx
```

Do not remove a file from this list if any active route or component still imports it.

---

### Task 1: Establish the typed home content contract and translation source

**Files:**
- Create: `src/features/landing/content/homeContent.ts`
- Modify: `src/i18n/locales/vi/translation.json`
- Modify: `src/i18n/locales/en/translation.json`

**Interfaces:**
- Produces: `capabilityProofItems`, `homeRoleItems`, `enterpriseTrustItems`, and `commercialScopeItems` descriptor arrays.
- Consumes: translation keys only; no React component or service dependency.

- [ ] **Step 1: Inspect and preserve the existing locale diff**

Run from `crm-fe`:

```bash
rtk git status --short -- src/i18n/locales/vi/translation.json src/i18n/locales/en/translation.json
rtk diff -- src/i18n/locales/vi/translation.json src/i18n/locales/en/translation.json
```

Expected: both locale files may already be modified. Record their current diff and edit only `landing.home` plus the explicitly listed `landing.demo` presentation strings. Do not replace either complete file.

- [ ] **Step 2: Create the non-visual descriptor module**

Create `src/features/landing/content/homeContent.ts` with these exact exports:

```ts
export type HomeRoleId = 'executive' | 'manager' | 'sales';

export type EnterpriseTrustId =
  | 'access'
  | 'scope'
  | 'audit'
  | 'integration';

export type CommercialScopeId =
  | 'scale'
  | 'process'
  | 'integration'
  | 'governance';

export const capabilityProofItems = [
  { id: 'customer-data', labelKey: 'landing.home.proof.customerData' },
  { id: 'pipeline', labelKey: 'landing.home.proof.pipeline' },
  { id: 'quotes', labelKey: 'landing.home.proof.quotes' },
  { id: 'contracts', labelKey: 'landing.home.proof.contracts' },
  { id: 'access', labelKey: 'landing.home.proof.access' },
] as const;

export const homeRoleItems = [
  {
    id: 'executive',
    labelKey: 'landing.home.roles.executiveLabel',
    titleKey: 'landing.home.roles.executiveTitle',
    pointKeys: [
      'landing.home.roles.executivePointPipeline',
      'landing.home.roles.executivePointRisk',
      'landing.home.roles.executivePointReporting',
    ],
  },
  {
    id: 'manager',
    labelKey: 'landing.home.roles.managerLabel',
    titleKey: 'landing.home.roles.managerTitle',
    pointKeys: [
      'landing.home.roles.managerPointOwnership',
      'landing.home.roles.managerPointStalled',
      'landing.home.roles.managerPointApproval',
    ],
  },
  {
    id: 'sales',
    labelKey: 'landing.home.roles.salesLabel',
    titleKey: 'landing.home.roles.salesTitle',
    pointKeys: [
      'landing.home.roles.salesPointContext',
      'landing.home.roles.salesPointQuote',
      'landing.home.roles.salesPointFollowUp',
    ],
  },
] as const satisfies ReadonlyArray<{
  id: HomeRoleId;
  labelKey: string;
  titleKey: string;
  pointKeys: readonly [string, string, string];
}>;

export const enterpriseTrustItems = [
  {
    id: 'access',
    titleKey: 'landing.home.trust.accessTitle',
    descriptionKey: 'landing.home.trust.accessDescription',
  },
  {
    id: 'scope',
    titleKey: 'landing.home.trust.scopeTitle',
    descriptionKey: 'landing.home.trust.scopeDescription',
  },
  {
    id: 'audit',
    titleKey: 'landing.home.trust.auditTitle',
    descriptionKey: 'landing.home.trust.auditDescription',
  },
  {
    id: 'integration',
    titleKey: 'landing.home.trust.integrationTitle',
    descriptionKey: 'landing.home.trust.integrationDescription',
  },
] as const satisfies ReadonlyArray<{
  id: EnterpriseTrustId;
  titleKey: string;
  descriptionKey: string;
}>;

export const commercialScopeItems = [
  {
    id: 'scale',
    titleKey: 'landing.home.commercial.scaleTitle',
    descriptionKey: 'landing.home.commercial.scaleDescription',
  },
  {
    id: 'process',
    titleKey: 'landing.home.commercial.processTitle',
    descriptionKey: 'landing.home.commercial.processDescription',
  },
  {
    id: 'integration',
    titleKey: 'landing.home.commercial.integrationTitle',
    descriptionKey: 'landing.home.commercial.integrationDescription',
  },
  {
    id: 'governance',
    titleKey: 'landing.home.commercial.governanceTitle',
    descriptionKey: 'landing.home.commercial.governanceDescription',
  },
] as const satisfies ReadonlyArray<{
  id: CommercialScopeId;
  titleKey: string;
  descriptionKey: string;
}>;
```

- [ ] **Step 3: Replace the Vietnamese `landing.home` object with approved copy**

Merge this object at `landing.home`; preserve every sibling under `landing`:

```json
{
  "hero": {
    "kicker": "CRM B2B cho doanh nghiệp",
    "title": "Một hệ thống cho toàn bộ chu kỳ bán hàng B2B",
    "description": "Tập trung dữ liệu khách hàng, kiểm soát pipeline, chuẩn hóa báo giá và phê duyệt theo cơ cấu doanh nghiệp.",
    "primaryCta": "Đặt lịch demo",
    "secondaryCta": "Xem cách VUM vận hành",
    "visualCaption": "Dữ liệu minh họa từ giao diện VUM CRM"
  },
  "proof": {
    "label": "Một luồng vận hành xuyên suốt",
    "customerData": "Dữ liệu khách hàng tập trung",
    "pipeline": "Pipeline theo giai đoạn",
    "quotes": "Báo giá và phê duyệt",
    "contracts": "Hợp đồng xuyên suốt",
    "access": "Phân quyền theo phạm vi"
  },
  "problem": {
    "eyebrow": "Bài toán vận hành",
    "title": "Dữ liệu rời rạc khiến đội ngũ bán hàng phản ứng chậm hơn khách hàng",
    "description": "VUM CRM kết nối dữ liệu, trách nhiệm và hành động tiếp theo trong cùng một quy trình.",
    "beforeTitle": "Khi quy trình bị phân tán",
    "beforeDataTitle": "Thông tin nằm ở nhiều tệp và nhiều người",
    "beforeDataDescription": "Đội ngũ mất thời gian đối chiếu phiên bản trước khi có thể hành động.",
    "beforePipelineTitle": "Pipeline chỉ rõ ràng trước buổi họp",
    "beforePipelineDescription": "Người quản lý khó nhận ra cơ hội đang thiếu chủ sở hữu hoặc hành động tiếp theo.",
    "beforeApprovalTitle": "Báo giá và phê duyệt tách khỏi lịch sử deal",
    "beforeApprovalDescription": "Các bước bàn giao thủ công làm mất bối cảnh và kéo dài vòng phản hồi.",
    "afterTitle": "Khi vận hành trên VUM CRM",
    "afterDescription": "Mỗi khách hàng, cơ hội, báo giá và hợp đồng được nối trong một dòng công việc có thể theo dõi."
  },
  "workflow": {
    "eyebrow": "Quy trình sản phẩm",
    "title": "Theo sát khách hàng từ tín hiệu đầu tiên đến hợp đồng",
    "description": "Mỗi bước giữ nguyên bối cảnh, người phụ trách và hành động tiếp theo.",
    "illustrativeLabel": "Dữ liệu minh họa",
    "leadLabel": "Lead",
    "leadTitle": "Tiếp nhận và đánh giá nhu cầu",
    "leadDescription": "Tập trung nguồn lead, trạng thái xử lý và người phụ trách trước khi chuyển đổi.",
    "accountLabel": "Khách hàng",
    "accountTitle": "Hợp nhất hồ sơ khách hàng",
    "accountDescription": "Kết nối doanh nghiệp, người liên hệ, hoạt động và trạng thái vòng đời trong cùng một hồ sơ.",
    "opportunityLabel": "Cơ hội",
    "opportunityTitle": "Kiểm soát pipeline và hành động tiếp theo",
    "opportunityDescription": "Theo dõi giai đoạn, giá trị, thời hạn và trách nhiệm của từng cơ hội.",
    "quoteLabel": "Báo giá",
    "quoteTitle": "Chuẩn hóa đề xuất thương mại",
    "quoteDescription": "Tạo báo giá từ danh mục sản phẩm và duy trì bối cảnh của cơ hội liên quan.",
    "approvalLabel": "Phê duyệt",
    "approvalTitle": "Đưa quyết định về đúng người, đúng phạm vi",
    "approvalDescription": "Theo dõi trạng thái xem xét và trách nhiệm phê duyệt trong luồng báo giá hoặc hợp đồng.",
    "contractLabel": "Hợp đồng",
    "contractTitle": "Tiếp nối dữ liệu sau khi chốt deal",
    "contractDescription": "Duy trì giá trị, trạng thái và lịch sử liên quan khi cơ hội chuyển sang hợp đồng."
  },
  "roles": {
    "eyebrow": "Một hệ thống, ba góc nhìn",
    "title": "Mỗi vai trò nhìn thấy điều cần thiết để ra quyết định",
    "executiveLabel": "Lãnh đạo",
    "executiveTitle": "Nhìn doanh thu và rủi ro từ cùng một nguồn dữ liệu",
    "executivePointPipeline": "Theo dõi xu hướng pipeline và doanh thu theo cơ cấu tổ chức",
    "executivePointRisk": "Nhận diện khu vực hoặc giai đoạn đang tắc nghẽn",
    "executivePointReporting": "Giảm phụ thuộc vào báo cáo tổng hợp thủ công",
    "managerLabel": "Quản lý",
    "managerTitle": "Biết cơ hội nào cần hỗ trợ trước khi quá muộn",
    "managerPointOwnership": "Kiểm soát phân công theo đội nhóm và phạm vi phụ trách",
    "managerPointStalled": "Phát hiện cơ hội thiếu hành động tiếp theo",
    "managerPointApproval": "Theo dõi báo giá và quyết định đang chờ xử lý",
    "salesLabel": "Kinh doanh",
    "salesTitle": "Giữ toàn bộ bối cảnh trước mỗi lần làm việc với khách hàng",
    "salesPointContext": "Xem hồ sơ, liên hệ và lịch sử trao đổi tập trung",
    "salesPointQuote": "Tạo và theo dõi báo giá trong bối cảnh của cơ hội",
    "salesPointFollowUp": "Quản lý lịch gọi, họp và công việc tiếp theo"
  },
  "trust": {
    "eyebrow": "Quản trị doanh nghiệp",
    "title": "Mở rộng đội ngũ mà không đánh đổi quyền kiểm soát dữ liệu",
    "accessTitle": "Vai trò và quyền hạn tập trung",
    "accessDescription": "Quản lý quyền truy cập theo trách nhiệm thay vì phân phối dữ liệu tự do.",
    "scopeTitle": "Phạm vi theo tổ chức và đội nhóm",
    "scopeDescription": "Giới hạn dữ liệu theo cơ cấu vận hành và phạm vi được giao.",
    "auditTitle": "Lịch sử truy cập và thay đổi",
    "auditDescription": "Hỗ trợ truy vết hoạt động trên các luồng có nhật ký trong hệ thống.",
    "integrationTitle": "Nhập dữ liệu và tích hợp",
    "integrationDescription": "Kết nối dữ liệu qua các cơ chế nhập, webhook hoặc tích hợp đã được cấu hình."
  },
  "commercial": {
    "eyebrow": "Phạm vi triển khai",
    "title": "Giải pháp được xác định theo quy mô và độ phức tạp thực tế",
    "description": "Doanh nghiệp trao đổi nhu cầu trước khi lựa chọn phạm vi phù hợp; trang này không công bố mức giá chưa được phê duyệt.",
    "scaleTitle": "Quy mô người dùng và đơn vị vận hành",
    "scaleDescription": "Số lượng người dùng, đội nhóm, vùng và chi nhánh cần tham gia hệ thống.",
    "processTitle": "Độ phức tạp của quy trình bán hàng",
    "processDescription": "Số pipeline, giai đoạn, quy tắc bàn giao và luồng phê duyệt cần chuẩn hóa.",
    "integrationTitle": "Dữ liệu và hệ thống cần kết nối",
    "integrationDescription": "Nguồn dữ liệu ban đầu, hệ thống nội bộ và cơ chế đồng bộ cần triển khai.",
    "governanceTitle": "Quản trị và hỗ trợ vận hành",
    "governanceDescription": "Phạm vi quyền, nhật ký, đào tạo và hỗ trợ phù hợp với mô hình tổ chức.",
    "cta": "Trao đổi về phạm vi triển khai"
  },
  "demo": {
    "eyebrow": "Demo theo quy trình thực tế",
    "title": "Xem VUM CRM vận hành trên quy trình bán hàng của doanh nghiệp bạn",
    "description": "Chia sẻ cấu trúc đội ngũ và luồng bán hàng hiện tại để buổi trao đổi tập trung đúng vấn đề.",
    "agendaTitle": "Nội dung trao đổi",
    "agendaDiscovery": "Rà soát dữ liệu, vai trò và các điểm bàn giao hiện tại",
    "agendaWorkflow": "Đi qua luồng lead, cơ hội, báo giá và hợp đồng",
    "agendaScope": "Xác định phạm vi triển khai phù hợp",
    "formTitle": "Đăng ký nhận bản demo",
    "formDescription": "Để lại thông tin để đội ngũ VUM chuẩn bị nội dung phù hợp với nhu cầu của bạn."
  }
}
```

- [ ] **Step 4: Apply the matching English `landing.home` object**

Use the same key structure with these intentional English values:

```json
{
  "hero": {
    "kicker": "B2B CRM for enterprises",
    "title": "One system for the entire B2B sales lifecycle",
    "description": "Centralize customer data, control the pipeline, and standardize quotes and approvals around your organization.",
    "primaryCta": "Book a demo",
    "secondaryCta": "See how VUM works",
    "visualCaption": "Illustrative data from the VUM CRM interface"
  },
  "proof": {
    "label": "One connected operating flow",
    "customerData": "Centralized customer data",
    "pipeline": "Stage-based pipeline",
    "quotes": "Quotes and approvals",
    "contracts": "Connected contracts",
    "access": "Scope-based access"
  },
  "problem": {
    "eyebrow": "The operating problem",
    "title": "Fragmented data makes the sales team react more slowly than the customer",
    "description": "VUM CRM connects data, responsibility, and the next action in one operating flow.",
    "beforeTitle": "When the process is fragmented",
    "beforeDataTitle": "Information lives in many files and with many people",
    "beforeDataDescription": "The team spends time reconciling versions before it can act.",
    "beforePipelineTitle": "The pipeline becomes clear only before review meetings",
    "beforePipelineDescription": "Managers struggle to spot opportunities without an owner or next action.",
    "beforeApprovalTitle": "Quotes and approvals are detached from deal history",
    "beforeApprovalDescription": "Manual handoffs lose context and extend response cycles.",
    "afterTitle": "When operations run on VUM CRM",
    "afterDescription": "Every customer, opportunity, quote, and contract is connected in a trackable operating flow."
  },
  "workflow": {
    "eyebrow": "Product workflow",
    "title": "Stay with the customer from the first signal to the contract",
    "description": "Every stage retains its context, owner, and next action.",
    "illustrativeLabel": "Illustrative data",
    "leadLabel": "Lead",
    "leadTitle": "Capture and qualify the need",
    "leadDescription": "Centralize lead sources, handling status, and ownership before conversion.",
    "accountLabel": "Account",
    "accountTitle": "Unify the customer record",
    "accountDescription": "Connect the organization, contacts, activities, and lifecycle stage in one record.",
    "opportunityLabel": "Opportunity",
    "opportunityTitle": "Control the pipeline and next action",
    "opportunityDescription": "Track the stage, value, timing, and responsibility for every opportunity.",
    "quoteLabel": "Quote",
    "quoteTitle": "Standardize the commercial proposal",
    "quoteDescription": "Create quotes from the product catalog while retaining the related opportunity context.",
    "approvalLabel": "Approval",
    "approvalTitle": "Route decisions to the right owner and scope",
    "approvalDescription": "Track review status and approval responsibility in the quote or contract flow.",
    "contractLabel": "Contract",
    "contractTitle": "Carry the data forward after the deal closes",
    "contractDescription": "Retain value, status, and related history as the opportunity becomes a contract."
  },
  "roles": {
    "eyebrow": "One system, three perspectives",
    "title": "Each role sees what it needs to make a decision",
    "executiveLabel": "Executives",
    "executiveTitle": "See revenue and risk from the same source of data",
    "executivePointPipeline": "Track pipeline and revenue trends across the organization",
    "executivePointRisk": "Identify regions or stages where work is blocked",
    "executivePointReporting": "Reduce dependence on manually consolidated reports",
    "managerLabel": "Managers",
    "managerTitle": "Know which opportunities need support before it is too late",
    "managerPointOwnership": "Control ownership across teams and assigned scopes",
    "managerPointStalled": "Find opportunities without a next action",
    "managerPointApproval": "Track quotes and decisions waiting for action",
    "salesLabel": "Sales",
    "salesTitle": "Keep the full context before every customer interaction",
    "salesPointContext": "Review records, contacts, and interaction history in one place",
    "salesPointQuote": "Create and track quotes in the opportunity context",
    "salesPointFollowUp": "Manage calls, meetings, and next tasks"
  },
  "trust": {
    "eyebrow": "Enterprise governance",
    "title": "Scale the team without giving up control of customer data",
    "accessTitle": "Centralized roles and permissions",
    "accessDescription": "Manage access by responsibility instead of distributing data freely.",
    "scopeTitle": "Scope by organization and team",
    "scopeDescription": "Limit data according to the operating structure and assigned scope.",
    "auditTitle": "Access and change history",
    "auditDescription": "Support traceability across system flows that provide activity logs.",
    "integrationTitle": "Data import and integration",
    "integrationDescription": "Connect data through configured imports, webhooks, or integrations."
  },
  "commercial": {
    "eyebrow": "Implementation scope",
    "title": "The solution is scoped to real scale and process complexity",
    "description": "The business discusses its needs before selecting scope; this page does not publish unapproved pricing.",
    "scaleTitle": "Users and operating units",
    "scaleDescription": "The number of users, teams, regions, and branches joining the system.",
    "processTitle": "Sales-process complexity",
    "processDescription": "The pipelines, stages, handoff rules, and approval flows that need standardization.",
    "integrationTitle": "Data and connected systems",
    "integrationDescription": "The initial data sources, internal systems, and synchronization mechanisms required.",
    "governanceTitle": "Governance and operating support",
    "governanceDescription": "The access scope, logs, training, and support appropriate to the organization.",
    "cta": "Discuss implementation scope"
  },
  "demo": {
    "eyebrow": "A demo based on your real workflow",
    "title": "See VUM CRM operate around your sales process",
    "description": "Share your current team structure and sales flow so the conversation focuses on the right problem.",
    "agendaTitle": "Conversation agenda",
    "agendaDiscovery": "Review current data, roles, and handoff points",
    "agendaWorkflow": "Walk through leads, opportunities, quotes, and contracts",
    "agendaScope": "Define an appropriate implementation scope",
    "formTitle": "Request a tailored demo",
    "formDescription": "Leave your details so the VUM team can prepare content relevant to your needs."
  }
}
```

- [ ] **Step 5: Localize hardcoded demo-form presentation strings without changing the form contract**

Add matching keys under the existing `landing.demo` object rather than changing validation or request data:

```json
{
  "consultationLabel": "Trao đổi theo nhu cầu",
  "formIntro": "Cung cấp thông tin để đội ngũ VUM chuẩn bị nội dung phù hợp với doanh nghiệp của bạn.",
  "optionalLabel": "tùy chọn",
  "successNextTitle": "Bước tiếp theo",
  "successNextContact": "Đội ngũ VUM sẽ liên hệ qua thông tin bạn đã cung cấp.",
  "successNextPrepare": "Nội dung demo sẽ được chuẩn bị theo nhu cầu đã chọn.",
  "submitAnother": "Gửi thêm yêu cầu khác",
  "placeholders": {
    "fullName": "Họ và tên người liên hệ",
    "workEmail": "ten@doanhnghiep.vn",
    "phone": "+84 912 345 678",
    "companyName": "Tên doanh nghiệp",
    "message": "Chia sẻ mục tiêu hoặc vấn đề doanh nghiệp đang muốn giải quyết"
  }
}
```

Use these English values at the same keys:

```json
{
  "consultationLabel": "Needs-based conversation",
  "formIntro": "Provide your details so the VUM team can prepare content relevant to your organization.",
  "optionalLabel": "optional",
  "successNextTitle": "Next steps",
  "successNextContact": "The VUM team will contact you using the details you provided.",
  "successNextPrepare": "The demo content will be prepared around your selected needs.",
  "submitAnother": "Send another request",
  "placeholders": {
    "fullName": "Contact name",
    "workEmail": "name@company.com",
    "phone": "+84 912 345 678",
    "companyName": "Company name",
    "message": "Share the goal or problem your organization wants to address"
  }
}
```

Preserve the existing bilingual `landing.demo.companySizes`, `landing.demo.industries`, and `landing.demo.needs` objects; Task 7 connects the form to those current keys.

- [ ] **Step 6: Perform static content inspection**

Run:

```bash
node -e "const fs=require('fs'); for (const p of ['src/i18n/locales/vi/translation.json','src/i18n/locales/en/translation.json']) JSON.parse(fs.readFileSync(p,'utf8')); console.log('LOCALE_JSON_OK')"
rtk grep "RBAC 4 cấp|99\.9|3\.2|84%|VinFast|VNG|FPT|Tập đoàn Vinahome|2 giờ làm việc" src/i18n/locales src/features/landing/content/homeContent.ts
rtk diff -- src/i18n/locales/vi/translation.json src/i18n/locales/en/translation.json src/features/landing/content/homeContent.ts
```

Expected: JSON parsing prints `LOCALE_JSON_OK`; the prohibited-claim search returns zero landing matches; unrelated pre-existing locale changes remain present.

---

### Task 2: Implement the landing visual foundation and safe shared shell

**Files:**
- Modify: `tailwind.config.js`
- Modify: `src/features/landing/landing.css`
- Modify: `src/features/landing/LandingLayout.tsx`
- Modify: `src/features/landing/components/LandingSection.tsx`
- Modify: `src/features/landing/components/LandingHeader.tsx`
- Modify: `src/features/landing/components/LandingFooter.tsx`

**Interfaces:**
- Produces: landing-scoped tokens, the `LandingSection` polymorphic wrapper, and a light shared shell.
- Consumes: existing `useAuth`, `env`, route paths, translations, and `landing-container` convention.

- [ ] **Step 1: Correct only the malformed Tailwind font-family strings**

Replace the `sans` and `display` arrays with:

```js
fontFamily: {
  sans: [
    'Be Vietnam Pro',
    'Inter',
    'Plus Jakarta Sans',
    '-apple-system',
    'BlinkMacSystemFont',
    'Segoe UI',
    'Roboto',
    'sans-serif',
  ],
  display: [
    'Plus Jakarta Sans',
    'Be Vietnam Pro',
    'sans-serif',
  ],
}
```

Keep every other existing custom font-family entry and theme value unchanged. Do not reorganize the configuration.

- [ ] **Step 2: Replace the landing token block and remove dark-home utilities**

Retain the `.landing-theme` scope and establish these exact variables:

```css
.landing-theme {
  --landing-canvas: #F6F9FC;
  --landing-surface: #FFFFFF;
  --landing-ink: #07182B;
  --landing-muted: #52647A;
  --landing-line: #DCE5F0;
  --landing-blue: #085AC0;
  --landing-blue-hover: #06499D;
  --landing-blue-soft: #EAF2FC;
  --landing-font-body: 'Be Vietnam Pro', 'Inter', sans-serif;
  --landing-font-display: 'Plus Jakarta Sans', 'Be Vietnam Pro', sans-serif;
  min-height: 100dvh;
  overflow-x: clip;
  background: var(--landing-canvas);
  color: var(--landing-ink);
  font-family: var(--landing-font-body);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.landing-theme .landing-container {
  width: min(calc(100% - 2rem), 80rem);
  margin-inline: auto;
}

.landing-theme .landing-section {
  position: relative;
  padding-block: clamp(4.5rem, 8vw, 8rem);
  scroll-margin-top: 5rem;
}

.landing-theme .landing-display {
  font-family: var(--landing-font-display);
  letter-spacing: -0.035em;
  line-height: 1.08;
  text-wrap: balance;
}

.landing-theme .landing-body-copy {
  color: var(--landing-muted);
  line-height: 1.7;
  text-wrap: pretty;
}

.landing-theme :where(a, button, input, select, textarea):focus-visible {
  outline: 2px solid var(--landing-blue);
  outline-offset: 3px;
}

@media (min-width: 768px) {
  .landing-theme .landing-container {
    width: min(calc(100% - 3rem), 80rem);
  }
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

Remove `.bg-dark-section`, dark landing variables, `transition: all`, and the Inter-first display assignment. Keep only utilities still used after the home cutover.

- [ ] **Step 3: Make `LandingSection` polymorphic without breaking existing pages**

Use a default of `section` so `/features`, `/solutions`, `/pricing`, and `/demo` remain compatible:

```tsx
import type { ComponentPropsWithoutRef, ElementType, ReactElement } from 'react';
import { cn } from '@/lib/utils';

export interface LandingSectionProps
  extends ComponentPropsWithoutRef<'section'> {
  as?: 'section' | 'div';
  contained?: boolean;
}

export function LandingSection({
  as = 'section',
  contained = true,
  className,
  children,
  ...props
}: LandingSectionProps): ReactElement {
  const Component: ElementType = as;

  return (
    <Component className={cn('landing-section', className)} {...props}>
      {contained ? <div className="landing-container">{children}</div> : children}
    </Component>
  );
}
```

New home sections either use `LandingSection` directly as their one semantic section or use `as="div"` inside an already-declared section. Never render `<section><LandingSection /></section>` with the default element.

- [ ] **Step 4: Keep `LandingLayout` as the sole main landmark**

Preserve this structure and use token classes instead of hardcoded focus colors where practical:

```tsx
<div className="landing-theme flex min-h-[100dvh] flex-col">
  <a href="#main-content" className="landing-skip-link">
    {t('landing.common.skipToContent')}
  </a>
  <LandingHeader />
  <main id="main-content" tabIndex={-1} className="flex-1">
    <Outlet />
  </main>
  <LandingFooter />
</div>
```

Add a `.landing-skip-link` rule that is visually hidden until focused and remains above the sticky header.

- [ ] **Step 5: Restyle the header while preserving route behavior**

Keep the existing route-aware navigation contract:

```ts
const navItems = [
  { key: 'features', labelKey: 'landing.nav.features', anchor: '#features', to: '/features' },
  { key: 'solutions', labelKey: 'landing.nav.solutions', anchor: '#solutions', to: '/solutions' },
  { key: 'pricing', labelKey: 'landing.nav.pricing', anchor: '#pricing', to: '/pricing' },
  { key: 'demo', labelKey: 'landing.nav.demo', anchor: '#demo', to: '/demo' },
] as const;

const homeSectionIds = ['hero', 'features', 'solutions', 'pricing', 'demo'] as const;
```

Keep the existing single observer-per-section cleanup and Escape/menu-close behavior. Replace `transition-all` with property-specific classes. Use a restrained white header, 1px `--landing-line` border, the existing logo link, `/login`, `/app/overview`, and the demo action. Use `aria-current` only for the active route/section and keep every target at least 44px.

For smooth scrolling, respect reduced motion:

```ts
const getScrollBehavior = (): ScrollBehavior =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ? 'auto'
    : 'smooth';
```

- [ ] **Step 6: Convert the footer to the approved light system and remove invented contact fallbacks**

Keep the brand, product links, `/login`, configured legal links, and current year. Render contact methods only when configured:

```tsx
{env.salesEmail ? (
  <a href={`mailto:${env.salesEmail}`}>{env.salesEmail}</a>
) : null}

{env.salesPhone ? (
  <a href={`tel:${env.salesPhone}`}>{env.salesPhone}</a>
) : null}
```

Do not fall back to `sales@vum.vn`, `19008899`, or `1900 8899`. The footer background is `--landing-surface` or `--landing-canvas`, with `--landing-ink` text and `--landing-line` borders; it is not a dark closing section.

- [ ] **Step 7: Perform static shell inspection**

Run:

```bash
rtk grep "<main|<section|LandingSection|transition-all|bg-dark-section|sales@vum\.vn|1900 8899|19008899" src/features/landing/LandingLayout.tsx src/features/landing/components src/features/landing/landing.css
rtk grep "Be Vietnam Pro\"|Plus Jakarta Sans\"|Segoe UI\"" tailwind.config.js
rtk read src/features/landing/LandingLayout.tsx src/features/landing/components/LandingSection.tsx src/features/landing/components/LandingHeader.tsx src/features/landing/components/LandingFooter.tsx
rtk diff -- tailwind.config.js src/features/landing/landing.css src/features/landing/LandingLayout.tsx src/features/landing/components/LandingSection.tsx src/features/landing/components/LandingHeader.tsx src/features/landing/components/LandingFooter.tsx
```

Expected: one main exists in `LandingLayout`; malformed font strings, dark-home utilities, generic transitions, and invented contact fallbacks are absent. Existing route destinations remain unchanged.

---

### Task 3: Gate, curate, and render real local product evidence

**Files:**
- Create: `public/landing/product/*.webp`
- Create: `src/features/landing/content/homeProductEvidence.ts`
- Create: `src/features/landing/components/LandingProductVisual.tsx`

**Interfaces:**
- Produces: `homeProductAssets`, `homeWorkflowStages`, `LandingProductAsset`, `HomeWorkflowStageId`, and `LandingProductVisual`.
- Consumes: approved anonymized image files and `react-i18next`.

- [ ] **Step 1: Enforce the product-asset authorization gate**

Before capturing or adding images, resolve one of these authorized inputs:

1. The user provides the eight named, anonymized WebP files; or
2. The user explicitly authorizes local browser capture during the implementation session.

If neither condition is true, stop Task 3 and ask the user for product assets or capture authorization. Do not create substitutes, use Unsplash, generate fake dashboard images, copy UAT customer data, or continue to Tasks 4–8.

- [ ] **Step 2: Produce the exact local asset set**

Create these files from current authenticated product screens:

```text
public/landing/product/hero-opportunity-pipeline.webp
public/landing/product/hero-opportunity-pipeline-mobile.webp
public/landing/product/lead-list.webp
public/landing/product/account-detail.webp
public/landing/product/opportunity-pipeline.webp
public/landing/product/quote-workspace.webp
public/landing/product/quote-approval.webp
public/landing/product/contract-list.webp
```

Source-route mapping:

| Asset | Source route |
|---|---|
| Hero opportunity pipeline | `/app/crm/opportunities` |
| Lead list | `/app/crm/leads` |
| Account detail | `/app/crm/accounts/:id` |
| Opportunity pipeline | `/app/crm/opportunities` |
| Quote workspace | `/app/sales/quotes` |
| Quote approval | `/app/sales/quotes` |
| Contract list | `/app/sales/contracts` |

Before placement, inspect each image at original detail and verify it contains no real person, company, email, phone, tenant, credential, internal host, or identifying record. Staged values are allowed only when the image is captioned as illustrative data.

- [ ] **Step 3: Define the typed evidence manifest**

Create `src/features/landing/content/homeProductEvidence.ts`:

```ts
export type EvidenceKind = 'real-screen' | 'illustrative-data';

export interface LandingProductAsset {
  id: string;
  src: string;
  mobileSrc?: string;
  width: number;
  height: number;
  altKey: string;
  captionKey: string;
  sourceRoute: string;
  evidenceKind: EvidenceKind;
}

export const homeProductAssets = {
  hero: {
    id: 'hero',
    src: '/landing/product/hero-opportunity-pipeline.webp',
    mobileSrc: '/landing/product/hero-opportunity-pipeline-mobile.webp',
    width: 1440,
    height: 960,
    altKey: 'landing.home.workflow.opportunityTitle',
    captionKey: 'landing.home.hero.visualCaption',
    sourceRoute: '/app/crm/opportunities',
    evidenceKind: 'illustrative-data',
  },
  lead: {
    id: 'lead',
    src: '/landing/product/lead-list.webp',
    width: 1440,
    height: 900,
    altKey: 'landing.home.workflow.leadTitle',
    captionKey: 'landing.home.workflow.illustrativeLabel',
    sourceRoute: '/app/crm/leads',
    evidenceKind: 'illustrative-data',
  },
  account: {
    id: 'account',
    src: '/landing/product/account-detail.webp',
    width: 1440,
    height: 900,
    altKey: 'landing.home.workflow.accountTitle',
    captionKey: 'landing.home.workflow.illustrativeLabel',
    sourceRoute: '/app/crm/accounts/:id',
    evidenceKind: 'illustrative-data',
  },
  opportunity: {
    id: 'opportunity',
    src: '/landing/product/opportunity-pipeline.webp',
    width: 1440,
    height: 900,
    altKey: 'landing.home.workflow.opportunityTitle',
    captionKey: 'landing.home.workflow.illustrativeLabel',
    sourceRoute: '/app/crm/opportunities',
    evidenceKind: 'illustrative-data',
  },
  quote: {
    id: 'quote',
    src: '/landing/product/quote-workspace.webp',
    width: 1440,
    height: 900,
    altKey: 'landing.home.workflow.quoteTitle',
    captionKey: 'landing.home.workflow.illustrativeLabel',
    sourceRoute: '/app/sales/quotes',
    evidenceKind: 'illustrative-data',
  },
  approval: {
    id: 'approval',
    src: '/landing/product/quote-approval.webp',
    width: 1440,
    height: 900,
    altKey: 'landing.home.workflow.approvalTitle',
    captionKey: 'landing.home.workflow.illustrativeLabel',
    sourceRoute: '/app/sales/quotes',
    evidenceKind: 'illustrative-data',
  },
  contract: {
    id: 'contract',
    src: '/landing/product/contract-list.webp',
    width: 1440,
    height: 900,
    altKey: 'landing.home.workflow.contractTitle',
    captionKey: 'landing.home.workflow.illustrativeLabel',
    sourceRoute: '/app/sales/contracts',
    evidenceKind: 'illustrative-data',
  },
} as const satisfies Record<string, LandingProductAsset>;

export type LandingProductAssetId = keyof typeof homeProductAssets;

export type HomeWorkflowStageId =
  | 'lead'
  | 'account'
  | 'opportunity'
  | 'quote'
  | 'approval'
  | 'contract';

export interface HomeWorkflowStage {
  id: HomeWorkflowStageId;
  labelKey: string;
  titleKey: string;
  descriptionKey: string;
  assetId: LandingProductAssetId;
}

export const homeWorkflowStages: readonly HomeWorkflowStage[] = [
  { id: 'lead', labelKey: 'landing.home.workflow.leadLabel', titleKey: 'landing.home.workflow.leadTitle', descriptionKey: 'landing.home.workflow.leadDescription', assetId: 'lead' },
  { id: 'account', labelKey: 'landing.home.workflow.accountLabel', titleKey: 'landing.home.workflow.accountTitle', descriptionKey: 'landing.home.workflow.accountDescription', assetId: 'account' },
  { id: 'opportunity', labelKey: 'landing.home.workflow.opportunityLabel', titleKey: 'landing.home.workflow.opportunityTitle', descriptionKey: 'landing.home.workflow.opportunityDescription', assetId: 'opportunity' },
  { id: 'quote', labelKey: 'landing.home.workflow.quoteLabel', titleKey: 'landing.home.workflow.quoteTitle', descriptionKey: 'landing.home.workflow.quoteDescription', assetId: 'quote' },
  { id: 'approval', labelKey: 'landing.home.workflow.approvalLabel', titleKey: 'landing.home.workflow.approvalTitle', descriptionKey: 'landing.home.workflow.approvalDescription', assetId: 'approval' },
  { id: 'contract', labelKey: 'landing.home.workflow.contractLabel', titleKey: 'landing.home.workflow.contractTitle', descriptionKey: 'landing.home.workflow.contractDescription', assetId: 'contract' },
];
```

If actual exported dimensions differ, replace each width and height with the real intrinsic dimensions; do not distort the images to match the sample values.

- [ ] **Step 4: Implement the single product-image boundary**

Create `src/features/landing/components/LandingProductVisual.tsx`:

```tsx
import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import type { LandingProductAsset } from '../content/homeProductEvidence';

export interface LandingProductVisualProps {
  asset: LandingProductAsset;
  priority?: boolean;
  className?: string;
}

export function LandingProductVisual({
  asset,
  priority = false,
  className,
}: LandingProductVisualProps): ReactElement {
  const { t } = useTranslation();

  return (
    <figure className={className}>
      <div className="overflow-hidden rounded-[20px] border border-[var(--landing-line)] bg-[var(--landing-surface)] shadow-[0_24px_70px_rgba(7,24,43,0.12)]">
        <picture>
          {asset.mobileSrc ? (
            <source media="(max-width: 767px)" srcSet={asset.mobileSrc} />
          ) : null}
          <img
            src={asset.src}
            width={asset.width}
            height={asset.height}
            alt={t(asset.altKey)}
            loading={priority ? 'eager' : 'lazy'}
            fetchPriority={priority ? 'high' : 'auto'}
            decoding="async"
            className="block h-auto w-full"
          />
        </picture>
      </div>
      <figcaption className="mt-3 text-xs text-[var(--landing-muted)]">
        {t(asset.captionKey)}
      </figcaption>
    </figure>
  );
}
```

Do not add an `onError` replacement that hides missing repository assets. Missing files are a static delivery failure and must be fixed before composition.

- [ ] **Step 5: Perform static product-evidence inspection**

Run:

```bash
for asset in hero-opportunity-pipeline.webp hero-opportunity-pipeline-mobile.webp lead-list.webp account-detail.webp opportunity-pipeline.webp quote-workspace.webp quote-approval.webp contract-list.webp; do test -f "public/landing/product/$asset" || exit 1; done
rtk grep "https://|Unsplash|images\.unsplash|Vinahome|An Phát|@|1900|token|tenant" src/features/landing/content/homeProductEvidence.ts src/features/landing/components/LandingProductVisual.tsx
rtk read src/features/landing/content/homeProductEvidence.ts src/features/landing/components/LandingProductVisual.tsx
rtk diff -- src/features/landing/content/homeProductEvidence.ts src/features/landing/components/LandingProductVisual.tsx public/landing/product
```

Expected: all eight files exist, the manifest uses only local absolute paths, no sensitive/fabricated content appears in source, and only the hero has `priority` when consumed.

---

### Task 4: Build the hero, capability proof, and business-problem opening

**Files:**
- Modify: `src/features/landing/sections/home/HeroSection.tsx`
- Create: `src/features/landing/sections/home/CapabilityProofSection.tsx`
- Modify: `src/features/landing/sections/home/ProblemOutcomeSection.tsx`

**Interfaces:**
- Consumes: `LandingSection`, `LandingProductVisual`, `homeProductAssets.hero`, `capabilityProofItems`, translations, and existing button primitives.
- Produces: the first three approved home blocks with IDs `hero`, `proof`, and `problem`.

- [ ] **Step 1: Rebuild `HeroSection` as the approved 5/7 composition**

Use this semantic structure:

```tsx
<LandingSection id="hero" className="overflow-hidden bg-[var(--landing-canvas)] pt-16 md:pt-24">
  <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-10">
    <div className="lg:col-span-5">
      <p className="mb-5 text-sm font-semibold text-[var(--landing-blue)]">
        {t('landing.home.hero.kicker')}
      </p>
      <h1 className="landing-display text-[clamp(2.75rem,5.5vw,4.75rem)] font-extrabold text-[var(--landing-ink)]">
        {t('landing.home.hero.title')}
      </h1>
      <p className="landing-body-copy mt-6 max-w-[38rem] text-lg">
        {t('landing.home.hero.description')}
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <a href="#demo" className="landing-primary-action">
          {t('landing.home.hero.primaryCta')}
        </a>
        <a href="#features" className="landing-secondary-action">
          {t('landing.home.hero.secondaryCta')}
        </a>
      </div>
    </div>
    <div className="lg:col-span-7">
      <LandingProductVisual asset={homeProductAssets.hero} priority />
    </div>
  </div>
</LandingSection>
```

Define `.landing-primary-action` and `.landing-secondary-action` in `landing.css` with 44px minimum height, 8–10px radius, `--landing-blue`/`--landing-blue-hover`, property-specific 150–200ms transitions, and visible focus. Do not render a centered hero, dark product frame, eyebrow pill, browser traffic-light chrome, or fake metrics.

- [ ] **Step 2: Create `CapabilityProofSection` as a factual strip**

Use one section and a divided list:

```tsx
<LandingSection id="proof" className="border-y border-[var(--landing-line)] bg-[var(--landing-surface)] py-8">
  <p className="mb-5 text-sm font-semibold text-[var(--landing-muted)]">
    {t('landing.home.proof.label')}
  </p>
  <ul className="grid gap-px overflow-hidden rounded-2xl border border-[var(--landing-line)] bg-[var(--landing-line)] sm:grid-cols-2 lg:grid-cols-5">
    {capabilityProofItems.map((item) => (
      <li key={item.id} className="bg-[var(--landing-surface)] px-5 py-4 text-sm font-semibold text-[var(--landing-ink)]">
        {t(item.labelKey)}
      </li>
    ))}
  </ul>
</LandingSection>
```

Do not render logo placeholders, counters, badges, or animated proof states.

- [ ] **Step 3: Rewrite `ProblemOutcomeSection` as an editorial comparison**

Use one semantic section, three numbered problem rows, and one consolidated outcome panel. Build descriptors at module scope using translation key strings; do not hardcode the paragraph text in JSX.

Define the descriptor before the component:

```ts
const problemItems = [
  {
    id: 'data',
    titleKey: 'landing.home.problem.beforeDataTitle',
    descriptionKey: 'landing.home.problem.beforeDataDescription',
  },
  {
    id: 'pipeline',
    titleKey: 'landing.home.problem.beforePipelineTitle',
    descriptionKey: 'landing.home.problem.beforePipelineDescription',
  },
  {
    id: 'approval',
    titleKey: 'landing.home.problem.beforeApprovalTitle',
    descriptionKey: 'landing.home.problem.beforeApprovalDescription',
  },
] as const;
```

Required structural outline:

```tsx
<LandingSection id="problem" className="bg-[var(--landing-canvas)]">
  <header className="max-w-3xl">
    <p>{t('landing.home.problem.eyebrow')}</p>
    <h2 id="problem-title">{t('landing.home.problem.title')}</h2>
    <p>{t('landing.home.problem.description')}</p>
  </header>
  <div className="mt-12 grid gap-10 lg:grid-cols-12">
    <ol className="space-y-0 lg:col-span-7">
      {problemItems.map((item, index) => (
        <li key={item.id} className="grid grid-cols-[2.5rem_1fr] gap-4 border-t border-[var(--landing-line)] py-6">
          <span aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
          <div>
            <h3>{t(item.titleKey)}</h3>
            <p>{t(item.descriptionKey)}</p>
          </div>
        </li>
      ))}
    </ol>
    <aside className="rounded-2xl border border-[var(--landing-line)] bg-[var(--landing-surface)] p-7 lg:col-span-5">
      <h3>{t('landing.home.problem.afterTitle')}</h3>
      <p>{t('landing.home.problem.afterDescription')}</p>
    </aside>
  </div>
</LandingSection>
```

Set `aria-labelledby="problem-title"` on the section. Use no risk percentage, “faster 3x,” red danger card matrix, spotlight effect, or pulsing dot.

- [ ] **Step 4: Perform static opening-section inspection**

Run:

```bash
rtk grep "ProductCockpit|AnimatedCounter|SpotlightCard|testimonial|logo|transition-all|gradient|animate-|RBAC 4 cấp|%|×|VinFast|VNG|FPT" src/features/landing/sections/home/HeroSection.tsx src/features/landing/sections/home/CapabilityProofSection.tsx src/features/landing/sections/home/ProblemOutcomeSection.tsx
rtk read src/features/landing/sections/home/HeroSection.tsx src/features/landing/sections/home/CapabilityProofSection.tsx src/features/landing/sections/home/ProblemOutcomeSection.tsx
rtk diff -- src/features/landing/sections/home/HeroSection.tsx src/features/landing/sections/home/CapabilityProofSection.tsx src/features/landing/sections/home/ProblemOutcomeSection.tsx src/features/landing/landing.css
```

Expected: the three sections use translations and the new evidence boundary; prohibited components and claims return zero matches.

---

### Task 5: Build the six-stage product workflow

**Files:**
- Create: `src/features/landing/sections/home/ProductWorkflowSection.tsx`

**Interfaces:**
- Consumes: `homeWorkflowStages`, `homeProductAssets`, `LandingProductVisual`, existing `Tabs` primitives, and translations.
- Produces: the `features` anchor and the exact `Lead → Account → Opportunity → Quote → Approval → Contract` narrative.

- [ ] **Step 1: Implement one accessible workflow selector**

Use existing shadcn/Radix tabs and local state initialized to `lead`:

```tsx
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LandingSection } from '../../components/LandingSection';
import { LandingProductVisual } from '../../components/LandingProductVisual';
import {
  homeProductAssets,
  homeWorkflowStages,
  type HomeWorkflowStageId,
} from '../../content/homeProductEvidence';

export function ProductWorkflowSection() {
  const { t } = useTranslation();
  const [activeStage, setActiveStage] = useState<HomeWorkflowStageId>('lead');

  return (
    <LandingSection id="features" aria-labelledby="workflow-title" className="bg-[var(--landing-surface)]">
      <header className="max-w-3xl">
        <p className="text-sm font-semibold text-[var(--landing-blue)]">
          {t('landing.home.workflow.eyebrow')}
        </p>
        <h2 id="workflow-title" className="landing-display mt-4 text-3xl font-extrabold md:text-5xl">
          {t('landing.home.workflow.title')}
        </h2>
        <p className="landing-body-copy mt-5 text-lg">
          {t('landing.home.workflow.description')}
        </p>
      </header>

      <Tabs
        value={activeStage}
        onValueChange={(value) => setActiveStage(value as HomeWorkflowStageId)}
        className="mt-12"
      >
        <TabsList className="grid h-auto grid-cols-2 gap-2 bg-transparent p-0 md:grid-cols-3 lg:grid-cols-6">
          {homeWorkflowStages.map((stage, index) => (
            <TabsTrigger
              key={stage.id}
              value={stage.id}
              className="min-h-11 justify-start rounded-lg border border-[var(--landing-line)] bg-white px-3 py-3 text-left data-[state=active]:border-[var(--landing-blue)] data-[state=active]:text-[var(--landing-blue)]"
            >
              <span aria-hidden="true" className="mr-2 text-xs tabular-nums">
                {String(index + 1).padStart(2, '0')}
              </span>
              {t(stage.labelKey)}
            </TabsTrigger>
          ))}
        </TabsList>

        {homeWorkflowStages.map((stage) => (
          <TabsContent key={stage.id} value={stage.id} className="mt-8">
            <div className="grid items-center gap-8 lg:grid-cols-12">
              <div className="lg:col-span-4">
                <h3 className="landing-display text-2xl font-bold">
                  {t(stage.titleKey)}
                </h3>
                <p className="landing-body-copy mt-4">
                  {t(stage.descriptionKey)}
                </p>
              </div>
              <div className="lg:col-span-8">
                <LandingProductVisual asset={homeProductAssets[stage.assetId]} />
              </div>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </LandingSection>
  );
}
```

Do not add custom arrow-key handlers, scroll listeners, autoplay stage changes, fake live states, or clickable generic containers. Radix owns tab keyboard behavior.

- [ ] **Step 2: Confirm the workflow order and source evidence statically**

Run:

```bash
rtk grep "id: 'lead'|id: 'account'|id: 'opportunity'|id: 'quote'|id: 'approval'|id: 'contract'" src/features/landing/content/homeProductEvidence.ts
rtk grep "TabsTrigger|TabsContent|LandingProductVisual|id=\"features\"|AnimatedCounter|setInterval|setTimeout|onKeyDown" src/features/landing/sections/home/ProductWorkflowSection.tsx
rtk read src/features/landing/sections/home/ProductWorkflowSection.tsx
```

Expected: six stage IDs occur once and in the approved order; the section uses Radix tabs and local image assets without timers or manual keyboard behavior.

---

### Task 6: Build role outcomes, enterprise trust, and commercial scope

**Files:**
- Modify: `src/features/landing/sections/home/RoleOutcomesSection.tsx`
- Create: `src/features/landing/sections/home/EnterpriseTrustSection.tsx`
- Create: `src/features/landing/sections/home/CommercialModelSection.tsx`
- Modify or retire after Task 8: `src/features/landing/components/RoleOutcomeTabs.tsx`

**Interfaces:**
- Consumes: `homeRoleItems`, `enterpriseTrustItems`, `commercialScopeItems`, existing Tabs, `LandingSection`, translations, and `/demo`.
- Produces: blocks five through seven with anchors `roles`, `solutions`, and `pricing`.

- [ ] **Step 1: Replace metric-led role panels with outcome-only accessible tabs**

Move the tabs directly into `RoleOutcomesSection` or keep `RoleOutcomeTabs` only if it remains under 160 focused lines. The rendered structure must follow:

```tsx
<LandingSection id="roles" aria-labelledby="roles-title" className="bg-[var(--landing-canvas)]">
  <header className="max-w-3xl">
    <p>{t('landing.home.roles.eyebrow')}</p>
    <h2 id="roles-title">{t('landing.home.roles.title')}</h2>
  </header>
  <Tabs defaultValue="executive" className="mt-10">
    <TabsList className="grid h-auto grid-cols-1 gap-2 bg-transparent p-0 sm:grid-cols-3">
      {homeRoleItems.map((role) => (
        <TabsTrigger key={role.id} value={role.id} className="min-h-11">
          {t(role.labelKey)}
        </TabsTrigger>
      ))}
    </TabsList>
    {homeRoleItems.map((role) => (
      <TabsContent key={role.id} value={role.id} className="mt-6 rounded-2xl border border-[var(--landing-line)] bg-white p-6 md:p-9">
        <h3>{t(role.titleKey)}</h3>
        <ul className="mt-6 grid gap-4 md:grid-cols-3">
          {role.pointKeys.map((pointKey) => (
            <li key={pointKey}>{t(pointKey)}</li>
          ))}
        </ul>
      </TabsContent>
    ))}
  </Tabs>
</LandingSection>
```

Remove `AnimatedCounter`, `+45%`, `4.5h`, `3x`, and “hiệu quả đo lường được.” Do not translate these audience perspectives into authorization-role counts.

- [ ] **Step 2: Create the enterprise-trust section with repository-backed wording**

Use `id="solutions"` to preserve the existing home navigation anchor. Map icons by `EnterpriseTrustId` inside the component:

```ts
import {
  History,
  LockKeyhole,
  Network,
  PlugZap,
  type LucideIcon,
} from 'lucide-react';
import type { EnterpriseTrustId } from '../../content/homeContent';

const trustIcons = {
  access: LockKeyhole,
  scope: Network,
  audit: History,
  integration: PlugZap,
} satisfies Record<EnterpriseTrustId, LucideIcon>;
```

Render a 2×2 divided grid on desktop, not four floating cards. Every icon is `aria-hidden="true"`. Use only the four translated title/description pairs from `enterpriseTrustItems`.

- [ ] **Step 3: Create the consultation-led commercial section**

Use `id="pricing"` and render four scope factors plus one demo action:

```tsx
<LandingSection id="pricing" aria-labelledby="commercial-title" className="bg-[var(--landing-surface)]">
  <div className="grid gap-10 lg:grid-cols-12">
    <header className="lg:col-span-5">
      <p>{t('landing.home.commercial.eyebrow')}</p>
      <h2 id="commercial-title">{t('landing.home.commercial.title')}</h2>
      <p>{t('landing.home.commercial.description')}</p>
      <a href="#demo" className="landing-primary-action mt-8">
        {t('landing.home.commercial.cta')}
      </a>
    </header>
    <dl className="divide-y divide-[var(--landing-line)] border-y border-[var(--landing-line)] lg:col-span-7">
      {commercialScopeItems.map((item) => (
        <div key={item.id} className="grid gap-2 py-6 sm:grid-cols-[12rem_1fr]">
          <dt>{t(item.titleKey)}</dt>
          <dd>{t(item.descriptionKey)}</dd>
        </div>
      ))}
    </dl>
  </div>
</LandingSection>
```

Do not show packages, prices, “no hidden fees,” free-trial language, seat limits, or unverifiable included features.

- [ ] **Step 4: Perform static outcome/trust/commercial inspection**

Run:

```bash
rtk grep 'AnimatedCounter|\+45|4\.5h|3x|RBAC 4 cấp|100%|24/7|ISO|SLA|Tamper|hash|không phụ phí|Dùng thử|Most Popular|USD|\$' src/features/landing/sections/home/RoleOutcomesSection.tsx src/features/landing/components/RoleOutcomeTabs.tsx src/features/landing/sections/home/EnterpriseTrustSection.tsx src/features/landing/sections/home/CommercialModelSection.tsx
rtk read src/features/landing/sections/home/RoleOutcomesSection.tsx src/features/landing/sections/home/EnterpriseTrustSection.tsx src/features/landing/sections/home/CommercialModelSection.tsx
rtk diff -- src/features/landing/sections/home/RoleOutcomesSection.tsx src/features/landing/components/RoleOutcomeTabs.tsx src/features/landing/sections/home/EnterpriseTrustSection.tsx src/features/landing/sections/home/CommercialModelSection.tsx
```

Expected: no invented metric, authorization-level claim, certification, price, or trial promotion remains.

---

### Task 7: Integrate the light demo conversion, final composition, and metadata

**Files:**
- Modify: `src/features/landing/sections/home/DemoSection.tsx`
- Modify: `src/features/landing/components/DemoRequestForm.tsx`
- Modify: `src/features/landing/pages/HomePage.tsx`
- Modify: `src/features/landing/hooks/useLandingMetadata.ts`
- Modify: `public/og/vum-crm-landing.svg`

**Interfaces:**
- Consumes: all seven earlier home sections, `DemoRequestForm`, existing `env`, translations, and metadata hook.
- Produces: the complete eight-block `/` page and truthful public metadata.

- [ ] **Step 1: Restyle `DemoSection` without changing form behavior**

Keep the existing `env` and form props. Replace the dark layout with:

```tsx
<section id="demo" aria-labelledby="demo-title" className="landing-section bg-[var(--landing-canvas)]">
  <div className="landing-container">
    <div className="grid items-start gap-10 lg:grid-cols-12 lg:gap-14">
      <div className="lg:col-span-5">
        <p>{t('landing.home.demo.eyebrow')}</p>
        <h2 id="demo-title">{t('landing.home.demo.title')}</h2>
        <p>{t('landing.home.demo.description')}</p>
        <h3>{t('landing.home.demo.agendaTitle')}</h3>
        <ul>
          <li>{t('landing.home.demo.agendaDiscovery')}</li>
          <li>{t('landing.home.demo.agendaWorkflow')}</li>
          <li>{t('landing.home.demo.agendaScope')}</li>
        </ul>
      </div>
      <div className="lg:col-span-7">
        <div className="mb-6">
          <h3>{t('landing.home.demo.formTitle')}</h3>
          <p>{t('landing.home.demo.formDescription')}</p>
        </div>
        <DemoRequestForm
          privacyPolicyUrl={env.privacyPolicyUrl || '/privacy'}
          salesEmail={env.salesEmail}
          salesPhone={env.salesPhone}
          headingAs="h3"
        />
      </div>
    </div>
  </div>
</section>
```

Continue to render configured direct contact only when present. Do not promise a response deadline.

- [ ] **Step 2: Localize `DemoRequestForm` presentation strings while preserving its contract**

Do not alter `createDemoRequestSchema`, `DemoFormData`, `DemoRequestInput`, `onSubmit`, field names, field order, `demoRequestService.submit`, or the three status values.

Add one presentation-only heading prop so the embedded homepage form preserves heading hierarchy while `DemoPage` keeps the current default:

```ts
export interface DemoRequestFormProps {
  privacyPolicyUrl: string;
  salesEmail?: string;
  salesPhone?: string;
  headingAs?: 'h2' | 'h3';
}
```

Default `headingAs` to `h2`, assign `const FormHeading = headingAs`, and use `<FormHeading>` for both the form title and success title. Pass `headingAs="h3"` only from the home `DemoSection`.

Replace hardcoded presentation with:

```tsx
{t('landing.demo.consultationLabel')}
{t('landing.demo.formIntro')}
{t('landing.demo.optionalLabel')}
{t('landing.demo.successNextTitle')}
{t('landing.demo.successNextContact')}
{t('landing.demo.successNextPrepare')}
{t('landing.demo.submitAnother')}
```

Build the existing `primaryNeedOptions` labels from existing translation keys instead of Vietnamese literals:

```ts
const primaryNeedOptions = [
  { value: 'CUSTOMER_360', labelKey: 'landing.demo.needs.CUSTOMER_360' },
  { value: 'SALES_PIPELINE', labelKey: 'landing.demo.needs.SALES_PIPELINE' },
  { value: 'QUOTES_CONTRACTS', labelKey: 'landing.demo.needs.QUOTES_CONTRACTS' },
  { value: 'AUTOMATION_FORECAST', labelKey: 'landing.demo.needs.AUTOMATION_FORECAST' },
  { value: 'SECURITY_INTEGRATION', labelKey: 'landing.demo.needs.SECURITY_INTEGRATION' },
  { value: 'OTHER', labelKey: 'landing.demo.needs.OTHER' },
] as const;
```

Use `t(option.labelKey)` when rendering. Replace `transition-all` and decorative shadows with property-specific transitions and restrained borders. Keep success and error `aria-live` behavior.

Connect the company-size and industry selects to their existing key groups:

```tsx
<SelectItem value="UNDER_50">{t('landing.demo.companySizes.UNDER_50')}</SelectItem>
<SelectItem value="FROM_50_TO_199">{t('landing.demo.companySizes.FROM_50_TO_199')}</SelectItem>
<SelectItem value="FROM_200_TO_999">{t('landing.demo.companySizes.FROM_200_TO_999')}</SelectItem>
<SelectItem value="FROM_1000">{t('landing.demo.companySizes.FROM_1000')}</SelectItem>

<SelectItem value="FINANCE">{t('landing.demo.industries.FINANCE')}</SelectItem>
<SelectItem value="REAL_ESTATE">{t('landing.demo.industries.REAL_ESTATE')}</SelectItem>
<SelectItem value="RETAIL_FNB">{t('landing.demo.industries.RETAIL_FNB')}</SelectItem>
<SelectItem value="MANUFACTURING_DISTRIBUTION">{t('landing.demo.industries.MANUFACTURING_DISTRIBUTION')}</SelectItem>
<SelectItem value="TECHNOLOGY_B2B">{t('landing.demo.industries.TECHNOLOGY_B2B')}</SelectItem>
<SelectItem value="OTHER">{t('landing.demo.industries.OTHER')}</SelectItem>
```

Replace all hardcoded input placeholders with:

```tsx
placeholder={t('landing.demo.placeholders.fullName')}
placeholder={t('landing.demo.placeholders.workEmail')}
placeholder={t('landing.demo.placeholders.phone')}
placeholder={t('landing.demo.placeholders.companyName')}
placeholder={t('landing.demo.placeholders.message')}
```

Add `aria-hidden="true"` to icons that repeat a visible field label or button label. Do not alter the control names or their registration order.

- [ ] **Step 3: Compose the exact eight home blocks**

Replace the `HomePage` body with:

```tsx
export const HomePage: React.FC = () => {
  const { t } = useTranslation();

  useLandingMetadata({
    title: t('landing.metadata.homeTitle'),
    description: t('landing.metadata.homeDescription'),
    path: '/',
  });

  return (
    <>
      <HeroSection />
      <CapabilityProofSection />
      <ProblemOutcomeSection />
      <ProductWorkflowSection />
      <RoleOutcomesSection />
      <EnterpriseTrustSection />
      <CommercialModelSection />
      <DemoSection />
    </>
  );
};
```

Do not render a `<main>` or wrapper `.landing-theme` in `HomePage`; `LandingLayout` owns both concerns.

- [ ] **Step 4: Synchronize the default Open Graph path**

In `useLandingMetadata`, use the existing asset:

```ts
const imageUrl = new URL(
  metadata.imagePath ?? '/og/vum-crm-landing.svg',
  `${env.publicSiteUrl}/`
).toString();
```

Keep the current title, description, canonical, and Open Graph tag behavior unchanged.

- [ ] **Step 5: Replace fabricated Open Graph content with approved messaging**

Retain a 1200×630 SVG and the approved palette. The SVG may contain only:

```text
VUM CRM
Một hệ thống cho toàn bộ chu kỳ bán hàng B2B
Lead · Khách hàng · Cơ hội · Báo giá · Phê duyệt · Hợp đồng
```

Remove fake company names, monetary values, growth statements, fake browser chrome, and local status-badge recreations. Use a restrained abstract workflow line or product-frame silhouette rather than fake records.

- [ ] **Step 6: Perform static final-composition inspection**

Run:

```bash
rtk grep "<main|HeroSection|CapabilityProofSection|ProblemOutcomeSection|ProductWorkflowSection|RoleOutcomesSection|EnterpriseTrustSection|CommercialModelSection|DemoSection" src/features/landing/pages/HomePage.tsx
rtk grep "2 giờ|30 Phút|Nguyễn Văn A|Tập đoàn An Phát|transition-all|bg-\[--color-dark\]|ProductCockpit|SocialProofSection|FeaturesSection|SolutionsSection|PricingSection" src/features/landing/pages/HomePage.tsx src/features/landing/sections/home/DemoSection.tsx src/features/landing/components/DemoRequestForm.tsx
rtk grep "vum-crm-landing\.png|Vinahome|An Phát|4\.220|100%" src/features/landing/hooks/useLandingMetadata.ts public/og/vum-crm-landing.svg
rtk read src/features/landing/pages/HomePage.tsx src/features/landing/sections/home/DemoSection.tsx src/features/landing/hooks/useLandingMetadata.ts
```

Expected: eight section imports/usages are present in order; no nested main, hardcoded demo promise, old section composition, PNG mismatch, or fabricated OG content remains.

---

### Task 8: Resolve obsolete imports, remove only dead home files, and prepare the Antigravity handoff

**Files:**
- Inspect: all `src/features/landing/**/*.{ts,tsx}`
- Remove: only exact obsolete files with zero remaining imports
- Inspect: `src/routes/AppRoutes.tsx`
- Inspect: `src/i18n/locales/vi/translation.json`
- Inspect: `src/i18n/locales/en/translation.json`
- Inspect: `public/landing/product/*`
- Inspect: `public/og/vum-crm-landing.svg`

**Interfaces:**
- Consumes: complete home redesign.
- Produces: an uncommitted, statically inspected handoff with no dead active imports or forbidden marketing content.

- [ ] **Step 1: Resolve every potentially obsolete component before deletion**

Run:

```bash
rtk grep "AnimatedCounter|InteractiveSolutionShowcase|ProductCockpit|SpotlightCard|CapabilityStoriesSection|FeaturesSection|FinalDemoSection|PricingSection|ProofStrip|SocialProofSection|SolutionsSection|TrustSection|RoleOutcomeTabs" src
```

For each candidate, classify every match as an import, export, or same-file declaration. Delete a file only when it has no consumer outside itself and is not imported by `/features`, `/solutions`, `/pricing`, or `/demo`.

- [ ] **Step 2: Remove exact zero-consumer files**

Use `apply_patch` for text-file deletion. Do not use a recursive removal command. If a file still has a consumer, leave it in place and record the consumer in the handoff.

- [ ] **Step 3: Scan the active home source for forbidden leftovers**

Run:

```bash
rtk grep "images\.unsplash|https://images|testimonial|VinFast|VNG|FPT|Vinahome|An Phát|99\.9|84%|3\.2|\+45|4\.5h|100% Audit|RBAC 4 cấp|ISO|SLA|24/7|Dùng thử đầy đủ|Không yêu cầu thẻ|transition-all|animate-pulse|AnimatedCounter|ProductCockpit|SpotlightCard" src/features/landing/pages/HomePage.tsx src/features/landing/sections/home src/features/landing/components/LandingProductVisual.tsx src/features/landing/components/DemoRequestForm.tsx
rtk grep "bg-purple-50|text-purple-700|bg-blue-50 text-blue-700|bg-emerald-50 text-emerald-700" src/features/landing
```

Expected: forbidden claims, stock imagery, old simulation components, generic transitions, and locally recreated lifecycle classes return zero active-home matches.

- [ ] **Step 4: Check semantics, assets, translations, and routes statically**

Run:

```bash
rtk grep "<main" src/features/landing
rtk grep "id=\"hero\"|id=\"features\"|id=\"solutions\"|id=\"pricing\"|id=\"demo\"" src/features/landing
node -e 'const fs=require("fs"); const vi=JSON.parse(fs.readFileSync("src/i18n/locales/vi/translation.json","utf8")); const en=JSON.parse(fs.readFileSync("src/i18n/locales/en/translation.json","utf8")); const walk=(v,p="",out=[])=>{if(v&&typeof v==="object"&&!Array.isArray(v)){for(const k of Object.keys(v)) walk(v[k],p?p+"."+k:k,out)}else out.push(p);return out}; const a=walk(vi.landing.home).sort(); const b=walk(en.landing.home).sort(); if(JSON.stringify(a)!==JSON.stringify(b)){console.error("LANDING_HOME_KEY_MISMATCH");process.exit(1)} console.log("LANDING_HOME_KEYS_OK")'
for asset in hero-opportunity-pipeline.webp hero-opportunity-pipeline-mobile.webp lead-list.webp account-detail.webp opportunity-pipeline.webp quote-workspace.webp quote-approval.webp contract-list.webp; do test -f "public/landing/product/$asset" || exit 1; done
rtk read src/routes/AppRoutes.tsx
```

Expected:

- `LandingLayout.tsx` is the only landing file with `<main>`.
- Stable home anchors exist once in active composition.
- Locale-key comparison prints `LANDING_HOME_KEYS_OK`.
- Every manifest asset exists.
- Public and authenticated route paths are unchanged.

- [ ] **Step 5: Review the complete uncommitted diff without running tests or build**

Run:

```bash
git diff --check
rtk diff
git status --short --untracked-files=all
```

Confirm manually from the diff:

- No dependency file changed.
- No backend or API-reference file changed.
- No route, auth, role, permission, tenant, analytics, legal-link, or demo transport contract changed.
- Existing locale edits outside the documented keys remain intact.
- Product assets contain no sensitive or real customer data.
- No file is staged or committed.

- [ ] **Step 6: Write the implementation handoff report**

Use this exact report structure:

```text
Landing redesign outcome
Files created
Files modified
Files removed, with zero-consumer evidence
Eight-section composition and preserved anchor mapping
Product asset sources and anonymization status
Demo form contract preserved
Metadata and Open Graph synchronization
Static checks performed and their results
Tests/build/browser/API/manual runtime checks: not run by repository rule
Responsive, visual, keyboard, console, network, performance, and real submission behavior: unverified until separately authorized
Existing user changes preserved
No files staged or committed
```

Do not describe the landing page as production-verified, responsive-verified, accessible-verified, or visually complete based only on source inspection.

---

## Review Checkpoints

Pause for review after each task:

1. Content contract and bilingual copy.
2. Shared shell, semantics, fonts, and tokens.
3. Product-asset authorization, anonymization, and evidence boundary.
4. Hero, proof, and problem narrative.
5. Six-stage product workflow.
6. Role, trust, and commercial narrative.
7. Demo integration, eight-block composition, and metadata.
8. Dead-code resolution and final static handoff.

Do not combine review checkpoints merely to finish faster. Task 3 is a hard gate: without authorized real product assets, later visual implementation must not proceed.

## Plan Completion Conditions

The plan is complete only when every checkbox is resolved, every required product asset exists and has been anonymized, every permitted static check is reported, and no prohibited test/build/runtime/Git action has occurred. The final worktree remains uncommitted for the user to review and hand to their preferred deployment workflow.
