# VUM CRM Landing Page Production Redesign Design

**Status:** Approved design  
**Date:** 2026-08-21  
**Workspace:** `crm-fe`  
**Product:** VUM CRM  
**Primary locale:** Vietnamese  

## Objective

Redesign the public VUM CRM landing experience so it is credible, distinctive, and ready to represent the product outside the UAT environment. The public site must communicate a coherent enterprise sales story, use real product evidence instead of generic SaaS decoration, and drive qualified prospects toward a demo request.

The redesign covers the public landing shell and the `/`, `/features`, `/solutions`, `/pricing`, and new `/demo` routes. It must preserve all authenticated CRM behavior under `/app`.

## Current-State Diagnosis

The existing public experience has several systemic problems:

- `HomePage.tsx` exceeds 1,000 lines and mixes page composition, marketing copy, interactive product simulation, mock data, and accessibility behavior.
- The Vietnamese home page and English Features, Solutions, and Pricing pages look like unrelated implementations.
- The visual language relies heavily on generic SaaS patterns: centered hero copy, gradient text, pill labels, repeated white cards, floating badges, three-column testimonials, and accordion-heavy sections.
- The conversion funnel mixes free trial, demo, login, and sales-contact actions without one primary outcome.
- Several links point to `#`, referenced anchors do not exist, and the demo form has no real submission flow.
- Marketing claims, certifications, customer counts, ROI metrics, and testimonials are not connected to verifiable evidence.
- External Google-hosted design assets, malformed background URLs, missing image behavior, and a missing favicon make the surface unsuitable for production.
- Landing copy bypasses the repository i18n layer.
- Landing-specific styling is mixed into global CSS, including duplicated keyframes and unused dark/neon utilities.
- Interactive demo cards use non-semantic click targets, while tabs and FAQ controls lack complete accessible behavior.
- Lifecycle badges are styled locally instead of importing the required shared CRM status configuration.

## Goals

1. Establish one production-grade visual and content system across all public routes.
2. Make “Đặt lịch demo” the primary conversion action.
3. Retain “Dùng thử” and “Đăng nhập” as secondary actions.
4. Lead with product evidence and operational outcomes rather than generic feature cards.
5. Keep Vietnamese complete and authoritative while retaining structurally matching English translation keys.
6. Isolate landing styles and components from the authenticated CRM application.
7. Provide honest behavior when no public demo endpoint is configured.
8. Meet source-level accessibility, responsive, SEO, and reduced-motion requirements.
9. Remove unverified marketing claims and non-production assets.

## Non-Goals

- Redesigning authenticated routes under `/app`, except for the repository-mandated lifecycle badge normalization described below.
- Changing authentication, authorization, roles, permissions, or tenant behavior.
- Migrating React, Vite, Tailwind, shadcn/ui, or the routing stack.
- Adding a new UI, icon, form, styling, animation, or metadata library.
- Implementing a backend demo-request endpoint.
- Inventing legal copy, production prices, certifications, customers, ROI figures, testimonials, or integration partnerships.
- Introducing dark mode.
- Adding analytics, consent-management platforms, chat widgets, or third-party schedulers without a separate approved request.

## Target Audience and Conversion Model

The primary audience is a Vietnamese business decision-maker evaluating an enterprise CRM: business owners, sales directors, regional managers, operations leaders, and IT/security stakeholders.

The public experience uses this conversion hierarchy:

1. **Primary:** Đặt lịch demo.
2. **Secondary:** Dùng thử VUM CRM.
3. **Utility:** Đăng nhập hoặc vào không gian làm việc đã xác thực.

Every public route must lead to `/demo`. Only authenticated users see “Vào Workspace” as the strongest header action.

## Selected Design Direction

The approved direction is **Enterprise Editorial Product Story**.

It combines a restrained professional-blue palette, editorial typography, asymmetric layouts, generous whitespace, and a small number of high-value product compositions. The design should feel like a working enterprise product presented with confidence, not an internal dashboard pasted into a marketing page and not a generic SaaS template with additional effects.

Two alternatives were rejected:

- A dark, motion-heavy “Data Command Center” direction would conflict with the repository light-mode requirement and continue the UAT/dashboard visual association.
- A people-first, photography-led direction would require verified customer photography and case-study assets that are not currently available.

## Information Architecture

### Shared Public Shell

`LandingLayout` owns:

- A visible-on-focus skip link to `#main-content`.
- A responsive header with the VUM wordmark, public navigation, primary demo CTA, secondary login/trial actions, active-route state, and accessible mobile navigation.
- Route content through `Outlet`.
- A restrained footer with product navigation, verified contact methods, and configured legal links.
- Landing-only theme scoping through a `.landing-theme` root class.

The header must not contain an announcement bar unless the announcement is backed by a current, approved product release. The redesign removes the current unverified release banner by default.

### Public Routes

| Route | Responsibility | Primary action |
|---|---|---|
| `/` | Executive product story and first qualification | Đặt lịch demo |
| `/features` | Capabilities organized by the customer lifecycle | Xem demo theo quy trình |
| `/solutions` | Verified use cases by supported business context | Trao đổi về bài toán doanh nghiệp |
| `/pricing` | Honest package positioning without invented prices | Nhận tư vấn gói phù hợp |
| `/demo` | Demo request or transparent direct-contact fallback | Gửi yêu cầu / Liên hệ sales |

### Home Page Narrative

The home page contains seven sections in this order:

1. **Hero** — asymmetric 5/7 desktop grid. The left side states a concrete sales-operations promise and presents the conversion actions. The right side contains the main product cockpit.
2. **Proof strip** — shows only verified customer logos, certifications, integrations, or factual implemented capabilities. If verified external proof is unavailable, render implemented product capabilities rather than empty logo slots or invented claims.
3. **Problem to outcome** — explains the transition from fragmented customer data, manual Excel reporting, and uncontrolled pipelines to one governed revenue workflow.
4. **Three capability stories** — Customer 360, Sales Pipeline, and Automation & Forecast. Each story uses one large product visual and outcome-focused copy; it does not become another equal-card grid.
5. **Role outcomes** — accessible tabs for Executive, Manager, and Sales Representative perspectives.
6. **Trust and implementation evidence** — combines verified implementation expectations, permission controls, auditability, security capabilities, and integrations. A case study appears only when approved evidence exists.
7. **Final demo conversion** — concise positioning, direct contact reassurance, primary link to `/demo`, and a secondary trial link.

The current home-page testimonial grid, generic FAQ accordion, floating marketing badges, fabricated ROI band, and repeated feature-card matrix are removed. Relevant implementation questions may move to `/pricing` or `/demo` only when the answers are verified.

### Features Page

The Features page follows the product lifecycle rather than a list of unrelated technology labels:

1. Capture and qualify leads.
2. Build Account and Contact 360 profiles.
3. Manage opportunities through the pipeline.
4. Generate quotes and govern contracts.
5. Automate follow-up and operational rules.
6. Forecast revenue and inspect performance.
7. Protect data through roles, scopes, privacy controls, and audit logs.

Each capability must map to behavior that exists in the repository. English template headings such as “AI-Powered Analytics,” “Seamless Integration,” and “Architectural Flow” are replaced by Vietnamese product language. No AI claim may remain unless the implemented feature and approved product wording support it.

### Solutions Page

The Solutions page uses supported business contexts instead of asserting regulatory or industry compliance that has not been verified. The initial contexts are:

- Sales organizations with regional or hierarchical teams.
- B2B businesses with long opportunity, quote, order, and contract lifecycles.
- Businesses that need centralized customer service, marketing, privacy, integration, and audit records.

Industry labels may be added only when the matching workflow and copy are approved. The page removes duplicated external imagery and the current non-functional embedded form; all conversion actions lead to `/demo`.

### Pricing Page

The Pricing page must not show USD amounts, annual discounts, payment methods, seat limits, or package names unless commercial owners have confirmed them.

Without approved prices, the page presents capability-based package positioning and a comparison of verified scope, followed by the CTA “Nhận tư vấn gói phù hợp.” It must not use fake zero-price or per-user amounts. FAQ content is retained only where the answer is approved and current.

### Demo Page

The Demo page has two explicit modes:

- **Submission mode:** shown only when both a public demo endpoint and privacy-policy URL are configured.
- **Contact mode:** shown when either required configuration is absent. It provides configured sales email and phone actions and explains that the prospect can contact the sales team directly.

The page never renders a form that cannot submit and never simulates success.

## Visual System

### Palette

Landing colors are scoped under `.landing-theme` and do not replace authenticated-app tokens.

| Token | Value | Use |
|---|---:|---|
| `--landing-canvas` | `#F5F8FC` | Main page background |
| `--landing-surface` | `#FFFFFF` | Elevated product surfaces |
| `--landing-ink` | `#07182B` | Primary text and deep navy areas |
| `--landing-muted` | `#52647A` | Secondary text |
| `--landing-line` | `#DCE5F0` | Dividers and subtle borders |
| `--landing-blue` | `#085AC0` | Primary action and active state |
| `--landing-blue-hover` | `#06499D` | Primary-action hover |
| `--landing-blue-soft` | `#EAF2FC` | Selected and supporting surfaces |

The design uses one brand accent. Purple/blue AI gradients, neon glows, glass-card effects, black sections, and arbitrary accent colors are removed. CRM lifecycle/status colors remain available only through `@/config/crmStatusConfig`.

The existing `LifecycleStageConfigMap` does not match the exact repository palette. Before the landing cockpit consumes it, implementation must normalize the shared map to these required classes: PROSPECT `bg-purple-50 text-purple-700 border-purple-200 font-bold`; QUALIFIED `bg-blue-50 text-blue-700 border-blue-200 font-bold`; CUSTOMER `bg-emerald-50 text-emerald-700 border-emerald-200 font-bold`; INACTIVE `bg-amber-50 text-amber-700 border-amber-200 font-semibold`; CHURNED `bg-rose-50 text-rose-700 border-rose-200 font-semibold`. This source-of-truth correction is the only shared authenticated-UI visual change in scope.

### Typography

- Display headings: `Plus Jakarta Sans` using existing font loading.
- Vietnamese body and controls: `Be Vietnam Pro`.
- Inter is not the landing-page primary font.
- Desktop hero: 64–72px with tight tracking and approximately 1.04–1.1 line height.
- Mobile hero: 38–44px with balanced wrapping.
- Body copy is constrained to approximately 60–68 characters per line.
- Headings use `text-wrap: balance`; long body copy uses `text-wrap: pretty` where supported.

### Layout

- Marketing container: 1280–1320px maximum.
- Desktop structure: 12-column CSS grid.
- Hero: 5 columns for narrative and 7 columns for product evidence.
- Major section spacing: 112–144px desktop, 72–96px tablet, 56–72px mobile.
- Controls use an 8px radius, product modules use 12px, and large compositions use 18–24px.
- Only the main product cockpit receives strong elevation. Other sections use whitespace, dividers, and surface contrast before cards or shadows.
- Layout uses CSS Grid and responsive wrapping rather than JavaScript measurement.

### Motion

- Interaction feedback: 160–240ms.
- Section or product-panel transitions: 320–500ms.
- Animate only `transform` and `opacity`.
- No `transition: all`.
- No infinite floating, shimmer, pulsing-glow, or border-spin effects.
- All non-essential motion is removed or reduced under `prefers-reduced-motion: reduce`.
- No new motion dependency is introduced.

### Product Visuals and Assets

- The main cockpit is a code-native product composition built from existing CRM concepts and verified UI patterns.
- Product previews use static marketing content with explicit TypeScript types; they do not call authenticated APIs or imply live production data.
- No Google `aida-public`, stock-photo, remote placeholder, or duplicated industry imagery remains.
- Meaningful images use internal assets, descriptive `alt`, explicit dimensions, and appropriate loading behavior.
- Decorative visuals are hidden from assistive technology.
- A local favicon and local Open Graph image replace missing or external assets.

## Component Architecture

```text
src/features/landing/
├── pages/
│   ├── HomePage.tsx
│   ├── FeaturesPage.tsx
│   ├── SolutionsPage.tsx
│   ├── PricingPage.tsx
│   └── DemoPage.tsx
├── components/
│   ├── LandingHeader.tsx
│   ├── LandingFooter.tsx
│   ├── LandingSection.tsx
│   ├── SectionHeading.tsx
│   ├── ProductCockpit.tsx
│   ├── RoleOutcomeTabs.tsx
│   └── DemoRequestForm.tsx
├── sections/home/
│   ├── HeroSection.tsx
│   ├── ProofStrip.tsx
│   ├── ProblemOutcomeSection.tsx
│   ├── CapabilityStoriesSection.tsx
│   ├── RoleOutcomesSection.tsx
│   ├── TrustSection.tsx
│   └── FinalDemoSection.tsx
├── content/
│   └── productPreviewContent.ts
├── hooks/
│   └── useLandingMetadata.ts
├── services/
│   └── demoRequestService.ts
├── types/
│   └── landing.ts
├── LandingLayout.tsx
└── landing.css
```

Responsibilities:

- Page files compose sections and should remain easy to scan. `HomePage.tsx` should be under approximately 100 lines after extraction.
- `LandingLayout` owns the shared shell and theme scope.
- Shared components are created only when at least two routes use the same behavior or visual contract.
- Home-only visual storytelling remains under `sections/home`.
- `ProductCockpit` owns its accessible presentation state but imports all display data from typed content.
- `RoleOutcomeTabs` owns tab keyboard behavior and exposes no page-level implementation details.
- `DemoRequestForm` owns form rendering and validation but delegates transport to `demoRequestService`.
- `landing.css` contains landing tokens, landing-only utilities, and reduced-motion overrides.

## Content and Internationalization

- All public navigation, headings, body copy, labels, validation messages, status messages, metadata text, and CTA text live under `landing.*` in the existing Vietnamese and English translation JSON files.
- Vietnamese content is complete in the first delivery.
- English keys mirror the Vietnamese structure. English copy must be valid and intentional; it may not preserve the current template text.
- Product names, code identifiers, and brand tokens use `translate="no"` where automatic translation could corrupt them.
- Copy uses active voice, specific CTA labels, and sentence case.
- No lorem ipsum, fake person, fake company, fake quote, or AI-copywriting cliché appears.
- A claim is rendered only when its source and approval are known. If a proof item is not verified, omit it and allow the layout to close the gap.

## Metadata and Public Assets

`useLandingMetadata` updates document title, description, canonical URL, Open Graph title, Open Graph description, Open Graph URL, and Open Graph image for each public route without adding a dependency.

`AppConfig` adds these public values:

```ts
publicSiteUrl: string;
demoRequestEndpoint?: string;
salesEmail?: string;
salesPhone?: string;
privacyPolicyUrl?: string;
termsUrl?: string;
```

They are sourced from:

```text
VITE_PUBLIC_SITE_URL
VITE_DEMO_REQUEST_ENDPOINT
VITE_SALES_EMAIL
VITE_SALES_PHONE
VITE_PRIVACY_POLICY_URL
VITE_TERMS_URL
```

These values are public configuration and must never contain credentials or secrets.

For production, `VITE_PUBLIC_SITE_URL` must be a valid public origin and at least one of `VITE_SALES_EMAIL` or `VITE_SALES_PHONE` must be configured. Development metadata may fall back to `window.location.origin`. If both sales contact values are absent, `/demo` displays a direct configuration-unavailable message and the secondary trial action; it does not invent contact details.

Required local assets:

```text
public/favicon.svg
public/og/vum-crm-landing.png
```

The footer renders legal links only when their URLs are configured. Submission mode requires `privacyPolicyUrl`; contact mode does not collect personal data.

## Demo Request Data Contract

The frontend contract is:

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
```

When `demoRequestEndpoint` exists, `demoRequestService.submit(input)` sends a public JSON `POST` request. It must not attach session tokens, tenant headers, cookies, or credentials. Any HTTP 2xx response is success; non-2xx responses become typed service errors. The service may parse `requestId` and `receivedAt` when returned, but the UI does not require them.

The public endpoint itself is not implemented by this frontend task. Because no API behavior is being added to the backend, `docs/api-reference.md` must not describe this endpoint yet. When a backend endpoint is implemented, that backend task must synchronize `docs/api-reference.md` with the actual contract.

## Form Behavior and Error Handling

The form uses the existing `react-hook-form`, `zod`, and resolver dependencies.

Validation rules:

- `fullName`: trimmed, 2–100 characters.
- `workEmail`: trimmed valid email, maximum 254 characters.
- `phone`: trimmed, 8–20 characters, allowing digits, spaces, `+`, `.`, `(`, `)`, and `-`.
- `companyName`: trimmed, 2–160 characters.
- `companySize`, `industry`, and `primaryNeed`: required enum values.
- `message`: optional, trimmed, maximum 1,000 characters.
- `privacyConsent`: must be `true` in submission mode.
- Every input has a stable `name`, visible label, appropriate `type`, `inputMode`, and `autoComplete` value.

State behavior:

- Before submission, controls remain enabled.
- After submission starts, the submit control is disabled and shows a specific in-progress label.
- Validation errors appear next to their fields and focus moves to the first invalid field.
- Network and service errors preserve every entered value and present configured email and phone alternatives.
- Success appears only after a 2xx response. The form clears only after that response.
- Async error and success messages use a polite live region.
- Personal data is never written to logs, query parameters, analytics payloads, or product-preview content.

## Accessibility Requirements

- The landing shell includes a keyboard-accessible skip link.
- The page uses semantic `header`, `nav`, `main`, `section`, and `footer` landmarks.
- Every route has one `h1`; section headings follow a valid hierarchy.
- Navigation uses `Link` or `a` elements, never click handlers on generic elements.
- Header and mobile navigation expose current-route state and meaningful accessible labels.
- Product cockpit tabs use tab/list/panel semantics, `aria-selected`, `aria-controls`, roving keyboard focus, and Left/Right/Home/End behavior.
- FAQ controls, if retained, use native details/summary with visible focus or buttons with `aria-expanded` and `aria-controls`.
- Product cards that perform actions are buttons; decorative product modules are not focusable.
- Focus indicators are visible and use `:focus-visible`.
- Interactive targets are at least 44px in both dimensions where practical.
- Sticky navigation must not cover focused controls or anchor targets.
- Meaningful images have descriptive `alt`; decorative imagery uses empty alt text or assistive-technology hiding.
- Motion honors the user’s reduced-motion preference.
- Layout supports zoom and does not disable viewport scaling.

## Responsive Requirements

- The design is desktop-first but complete at mobile widths.
- The primary static review breakpoints are 375px, 768px, 1024px, 1280px, and 1440px.
- Hero content stacks with narrative before product evidence on narrow screens.
- Product cockpit columns convert to compact lists or horizontally contained panels without document-level horizontal scrolling.
- Navigation collapses to an accessible menu that closes on route navigation and Escape.
- Long Vietnamese labels wrap or truncate intentionally; flex children use `min-width: 0` where required.
- Full-bleed content respects safe-area insets.
- No content relies on hover to become available.

## Production Content Rules

Before a proof item is shown publicly, its owner must be able to verify it. This applies to:

- Customer logos and customer counts.
- Certifications and compliance language.
- Availability and SLA percentages.
- ROI, conversion, forecasting-accuracy, or time-saving metrics.
- Testimonials, names, companies, and job titles.
- Integration partners.
- Pricing, discounts, payment methods, trial length, and package limits.

When verification is unavailable, the implementation omits the claim and uses an implemented product capability instead. It must not replace the missing claim with another invented number or generic logo.

## Static Verification and Repository Constraints

The repository rules prohibit running unit, integration, end-to-end, smoke, browser, API, manual runtime, build, and indirect verification tests unless the user gives a new explicit instruction.

For this task, Antigravity must perform only read-only/static checks:

- Inspect route definitions and imports for unresolved references.
- Inspect TypeScript types and component contracts for consistency.
- Search the landing feature for dead `href="#"` links, unconfigured remote assets, remaining English template copy, direct mock arrays, and local lifecycle badge classes.
- Search CSS for duplicated animation names, `transition: all`, infinite decorative motion, and landing selectors that leak outside `.landing-theme`.
- Compare Vietnamese and English `landing.*` key structures.
- Inspect all public metadata definitions and local asset paths.
- Review semantic markup, labels, focus classes, ARIA relationships, and reduced-motion rules from source.
- Review the final diff without staging or committing changes.

Runtime rendering, browser behavior, network submission, responsive screenshots, focus movement, and visual quality must be reported as unverified until the user separately authorizes runtime checks.

## Acceptance Criteria

The redesign is ready for handoff when all of the following are true in source:

- All five public routes use the same scoped visual system and Vietnamese-first content architecture.
- `/demo` has honest submission and contact modes based on configuration.
- Every public demo CTA routes to `/demo`; no public landing link points to `#`.
- The home page contains the approved seven-section narrative and no fabricated proof content.
- Product visuals are code-native or internal assets and no Google `aida-public` URLs remain.
- `HomePage.tsx` is a composition file rather than a monolithic implementation.
- Authenticated `/app` styling, routes, permissions, and services are untouched; the only shared visual change is normalizing `LifecycleStageConfigMap` to the repository-mandated palette before importing it into marketing product previews.
- Landing copy uses `landing.*` translation keys in both locale files.
- Route metadata, favicon, and local Open Graph image paths exist.
- Header, mobile navigation, cockpit tabs, form, and retained disclosures have explicit accessible source behavior.
- Landing motion is scoped, compositor-friendly, and reduced-motion aware.
- Pricing and proof sections contain only approved facts or capability-based alternatives.
- No new dependency is added.
- No files are staged, committed, pushed, or included in a pull request.
- No prohibited test, build, application-start, browser, API, or manual runtime command is run.

## Risks and Mitigations

### Missing Marketing Evidence

Risk: Removing fabricated claims can make the page appear sparse.  
Mitigation: use concrete implemented workflows, product UI, role outcomes, and security capabilities as proof. Do not backfill missing evidence with invented numbers.

### No Demo Endpoint

Risk: A primary conversion form cannot send data.  
Mitigation: contact mode renders configured email and phone actions and does not collect personal data. Submission mode activates only when endpoint and privacy URL are present.

### Style Leakage Into the CRM Application

Risk: global font, spacing, or color changes regress authenticated screens.  
Mitigation: scope landing tokens and custom utilities under `.landing-theme`; avoid changing existing application tokens unless a value is already a shared source of truth.

### Large Redesign Surface

Risk: redesigning all routes at once produces inconsistent partial states.  
Mitigation: implement foundations and shared shell first, then home sections, then each supporting route, and finish with metadata/content cleanup. Each task must leave source in a coherent reviewable state.

### Unverified Runtime Quality

Risk: source review cannot prove visual fidelity, responsive behavior, or interaction correctness.  
Mitigation: state this limitation in the handoff. A later, explicitly authorized verification pass should cover the running browser, real breakpoints, keyboard operation, console, network, and form submission.

## Approved Decision Record

- Primary conversion: demo request through `/demo`.
- Secondary conversion: product trial.
- Art direction: Enterprise Editorial Product Story.
- Theme: restrained professional-blue light mode.
- Motion: minimal and reduced-motion aware.
- Home structure: seven-section product narrative.
- Route scope: `/`, `/features`, `/solutions`, `/pricing`, and `/demo`.
- Architecture: landing-scoped feature components and CSS.
- Demo integration: configurable public adapter with transparent contact fallback.
- Claims: verified evidence only.
- Dependencies: existing repository stack only.
- Verification: static inspection only under current repository rules.
