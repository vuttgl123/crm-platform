# VUM CRM Landing Page Enterprise Evidence Redesign

**Status:** Approved

**Date:** 2026-08-21

**Workspace:** `crm-fe`

**Primary route:** `/`

**Primary locale:** Vietnamese

## 1. Objective

Redesign the VUM CRM home page so it presents a credible production SaaS product rather than a UAT-like dashboard or a generic marketing template. The page must explain the complete B2B sales lifecycle, show product evidence grounded in the current CRM, and move qualified prospects toward a demo request.

The approved direction is **Enterprise Evidence-led SaaS**: the conversion discipline of HubSpot and Salesforce combined with the restrained product storytelling of Attio and Linear, adapted to VUM CRM's current capabilities and Vietnamese enterprise audience.

## 2. Scope

### In scope

- The home page at `/`.
- Shared `LandingHeader` and `LandingFooter` presentation, without changing their routes or navigation contract.
- Landing-specific visual tokens and reusable layout primitives required by the home page.
- Vietnamese and English home-page translations.
- Local, anonymized product evidence sourced from existing CRM screens.
- Home-page metadata and the default Open Graph asset reference.
- Removal or retirement of obsolete home-only components after their import usage is resolved.

### Out of scope

- Full redesigns of `/features`, `/solutions`, `/pricing`, or `/demo`.
- Any route, authentication, registration, permission, role, tenant, or API behavior change.
- Changes to the demo-request payload, validation rules, field order, service, or endpoint.
- Backend work or changes to `docs/api-reference.md`.
- New UI, animation, icon, form, state, data-fetching, or styling libraries.
- Customer testimonials, customer logos, certifications, commercial prices, ROI figures, SLA figures, or performance claims without approved evidence.
- Dark mode, dark marketing sections, parallax, scroll hijacking, autoplay video, or motion-heavy storytelling.

The supporting public routes may inherit safe shared header, footer, font, and token corrections. Their page content and information architecture remain unchanged in this phase.

## 3. Current-State Findings

The current implementation has the following problems relevant to this redesign:

- `LandingLayout.tsx` already owns `<main id="main-content">`, while `HomePage.tsx` renders another `<main>`, creating invalid nested landmarks.
- `LandingSection` always renders a `<section>`, while several home sections wrap it in their own `<section>`, producing redundant nested section landmarks.
- `HomePage` currently composes only six blocks and omits several stronger, already-created narrative sections.
- `ProductCockpit.tsx` is a large interactive simulation containing invented account data, business metrics, and product behavior that should not be presented as evidence.
- `SocialProofSection` contains hardcoded company names and testimonial content without a verified source.
- `RoleOutcomeTabs`, `ProblemOutcomeSection`, `ProofStrip`, `TrustSection`, and other home components contain hardcoded Vietnamese copy and unverified numerical claims.
- Remote Unsplash imagery and decorative enterprise imagery do not prove the CRM product.
- `landing.css` uses an inconsistent black/white visual direction and Inter-first typography instead of the approved landing system.
- The translation files already contain a substantial `landing.*` structure, but current home sections bypass it.
- `useLandingMetadata` defaults to `/og/vum-crm-landing.png`, while the repository asset is `/og/vum-crm-landing.svg`.
- The configured Tailwind font-family strings for Be Vietnam Pro and Plus Jakarta Sans contain malformed quote characters.

These findings justify a focused home-page restructuring rather than another surface-only restyle.

## 4. Design Principles

1. **Evidence before decoration.** Product screens and implemented workflows carry the story; abstract gradients, stock photography, and fake dashboards do not.
2. **One conversion priority.** `Đặt lịch demo` is the primary action. `Xem cách VUM vận hành` is the secondary in-page action.
3. **Enterprise clarity.** Copy explains control, process, accountability, and operational outcomes without vague innovation language.
4. **Honest proof.** If an external claim cannot be verified, omit it or replace it with a factual implemented-capability statement.
5. **Restrained interaction.** Interactivity exists only where it helps comparison or navigation; it is not used to make static marketing content feel artificially complex.
6. **Production continuity.** Existing public routes, navigation labels, legal links, analytics hooks, logo behavior, and form contracts are preserved.

The calibrated design parameters are:

- Design variance: **4/10**.
- Motion intensity: **3/10**.
- Visual density: **6/10**.

## 5. Information Architecture

The home page contains exactly eight narrative blocks in this order.

### 5.1 Hero

- Desktop composition: a 5/7 text-to-product grid.
- H1: `Một hệ thống cho toàn bộ chu kỳ bán hàng B2B`.
- Supporting copy: `Tập trung dữ liệu khách hàng, kiểm soát pipeline, chuẩn hóa báo giá và phê duyệt theo cơ cấu doanh nghiệp.`
- Primary action: `Đặt lịch demo`, leading to the existing demo destination.
- Secondary action: `Xem cách VUM vận hành`, scrolling to the product-workflow section.
- The product visual uses an anonymized, local asset captured from the real CRM. It is not a simulated browser window and contains no invented KPI overlay.

The hero must not promote a free trial unless the product owner confirms a true self-service trial flow.

### 5.2 Capability Proof

This block replaces unverified customer-logo and testimonial content. It presents a concise factual strip of implemented capabilities, such as centralized customer records, opportunity management, quotes, approvals, contracts, role-and-scope controls, or audit history.

No external brand, certification, uptime, response-time, adoption, or ROI claim appears without an approved source.

### 5.3 Business Problem

This section explains three operational problems without invented percentages or time-saved figures:

- Customer and sales data is fragmented across individual files and tools.
- Management cannot reliably see pipeline state, ownership, or stalled work.
- Quotes and approvals move slowly through manual, inconsistent handoffs.

It then connects those problems to one governed CRM workflow. The visual treatment is editorial comparison, not six equal feature cards.

### 5.4 Product Workflow

The core proof story follows this exact sequence:

`Lead → Khách hàng → Cơ hội → Báo giá → Phê duyệt → Hợp đồng`

Each stage contains:

- One short outcome-oriented explanation.
- One real, anonymized product detail or screenshot crop.
- A source-route descriptor for maintainers, using existing authenticated routes such as `/app/crm/leads`, `/app/crm/accounts`, `/app/crm/opportunities`, `/app/sales/quotes`, and `/app/sales/contracts`.
- A `Dữ liệu minh họa` caption whenever the displayed record values are staged rather than production data.

Approval may be shown as part of the quote or contract flow when there is no dedicated public source route. The page must not imply functionality absent from the repository.

### 5.5 Role Outcomes

The page explains outcomes for three buying and operating perspectives:

- **Lãnh đạo:** consolidated visibility, revenue oversight, and decision support.
- **Quản lý:** team ownership, pipeline governance, and approval control.
- **Kinh doanh:** centralized customer context, next actions, quotes, and follow-up.

These are audience perspectives, not a representation of the application's authorization model. Copy must not claim “RBAC 4 cấp.” Role and access language uses the accurate concepts of role, organizational scope, and data scope. The repository roles remain `admin`, `regional_manager`, `team_lead`, `staff`, and `viewer`.

Role outcomes may use accessible tabs on wide layouts, but all three roles must remain understandable and reachable on mobile and by keyboard. No numerical efficiency metric is shown without evidence.

### 5.6 Enterprise Trust

This section describes only repository-backed controls:

- Role- and scope-based access.
- Organizational and team data boundaries.
- Audit history and traceability where implemented.
- Configurable integration or operational controls where implemented.

It does not claim certifications, immutable hash logging, regulatory compliance, 100% audit coverage, 24/7 support, or security guarantees that have not been verified.

### 5.7 Commercial Model

The page explains that solution scope depends on organizational size, process complexity, required integrations, governance, and support needs. It does not display prices, packages, discounts, seat limits, or “no hidden fees” language without commercial approval.

The only strong action is a demo or consultation request.

### 5.8 Demo Conversion

The closing section remains light, not dark, and integrates the existing `DemoRequestForm` presentation. It preserves:

- Field names and order.
- React Hook Form and Zod validation behavior.
- Idle, submitting, success, and error states.
- `demoRequestService` and `env.demoRequestEndpoint` behavior.
- Configured privacy-policy, sales-email, and sales-phone behavior.

No request is submitted merely for visual verification.

## 6. Visual System

### 6.1 Typography

- Display headings: `Plus Jakarta Sans`, weights 700 and 800.
- Vietnamese body text and controls: `Be Vietnam Pro`, weights 400 through 600.
- No new font request or font package is added; the fonts are already loaded by the application.
- Hero copy is wide and editorial, with controlled wrapping rather than a tall six-line heading.
- Heading and body line lengths remain intentionally constrained.

### 6.2 Color

Landing colors are scoped to `.landing-theme`:

| Purpose | Value |
|---|---|
| Canvas | `#F6F9FC` |
| Surface | `#FFFFFF` |
| Primary ink | `#07182B` |
| Secondary text | `#52647A` |
| Border | `#DCE5F0` |
| Primary accent | `#085AC0` |
| Accent hover | `#06499D` |
| Accent highlight | `#EAF2FC` |

The page uses one professional-blue accent. It contains no black section, neon effect, multicolor gradient, glassmorphism, glow, or arbitrary accent palette.

CRM status colors are not redefined locally. Any code-rendered lifecycle badge imports its presentation from `@/config/crmStatusConfig`. A captured product screen must originate from a screen that already uses the same shared configuration.

### 6.3 Shape, spacing, and elevation

- Interactive controls: 8–10px radius.
- Content panels: 16px radius.
- Main product frame: 20px radius.
- Desktop content width: maximum 1280px.
- Desktop sections use generous whitespace and a 12-column grid.
- The main product frame may receive a controlled shadow; supporting content relies on borders, spacing, and surface contrast.
- Nested cards and repeated equal-height card grids are avoided unless the content relationship requires them.

### 6.4 Motion

- CSS transitions use approximately 150–200ms for hover, focus, and selection feedback.
- Optional entrance motion is limited to small opacity and transform changes.
- `prefers-reduced-motion: reduce` disables non-essential motion.
- No GSAP, Motion, parallax, scroll-scrubbing, scroll hijacking, infinite floating, animated counters, or pulsing proof indicators are introduced.

## 7. Product Evidence Assets

Product assets live under:

```text
public/landing/product/
```

Each asset descriptor contains:

```ts
interface LandingProductAsset {
  id: string;
  src: string;
  mobileSrc?: string;
  width: number;
  height: number;
  altKey: string;
  captionKey: string;
  sourceRoute: string;
  evidenceKind: 'real-screen' | 'illustrative-data';
}
```

Requirements:

- Screens are captured from the current product, cropped for marketing use, and anonymized before being added to the repository.
- Personal data, real customer data, credentials, tenant identifiers, internal URLs, and sensitive operational details are removed.
- Desktop and mobile crops are separate assets when one crop cannot remain legible at both sizes.
- Preferred delivery is local AVIF or WebP with explicit dimensions. A stable fallback may be provided where browser support or source quality requires it.
- The hero image is prioritized; below-fold images use native lazy loading.
- Components reference statically analyzable asset paths rather than constructing dynamic paths at runtime.
- Missing assets must never leave a broken image icon. Implementation must either provide every manifest asset or omit the corresponding evidence item.

## 8. Component Architecture

### 8.1 Page and landmark ownership

- `LandingLayout` remains the sole owner of `<main id="main-content">`, the skip link, global header, and global footer.
- `HomePage` becomes a composition-only component and renders no additional `<main>`.
- Every home section owns exactly one semantic `<section>` with a stable ID and `aria-labelledby` relationship.
- `LandingSection` becomes a layout primitive that does not force nested section semantics. The preferred contract is a contained `<div>` wrapper; compatibility with supporting pages must be resolved before changing its default element.

### 8.2 Target home composition

```tsx
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
```

### 8.3 Component responsibilities

- `HeroSection`: headline, two conversion actions, and the primary product asset.
- `CapabilityProofSection`: verified capability statements only.
- `ProblemOutcomeSection`: problem-to-governed-workflow narrative.
- `ProductWorkflowSection`: stage navigation and product evidence composition.
- `LandingProductVisual`: image delivery, dimensions, alternative text, caption, and evidence label.
- `RoleOutcomesSection`: the three audience perspectives and any minimal local selection state.
- `EnterpriseTrustSection`: repository-backed governance capabilities.
- `CommercialModelSection`: scope factors and consultation action.
- `DemoSection`: existing form/service integration with redesigned presentation.
- `HomePage`: metadata call and section composition only.

Large interactive simulations are not retained merely for reuse. `ProductCockpit`, `InteractiveSolutionShowcase`, `AnimatedCounter`, `SpotlightCard`, the current `SocialProofSection`, and duplicate home sections are retired only after a static import search proves they have no remaining consumer.

## 9. Content and Data Flow

All public copy remains under the existing `landing.*` i18n namespace.

- Vietnamese is the authoritative source copy.
- English mirrors the Vietnamese key structure and provides intentional semantic translations.
- JSX contains no long marketing paragraph, testimonial, metric, or role-outcome array.
- Static product-evidence metadata lives in a typed landing content module; it is not application business data and does not call authenticated services.
- The home page performs no new data fetching.
- The demo form continues to send only through `demoRequestService`; the redesign does not bypass or duplicate this service.

This yields two explicit flows:

```text
i18n + typed evidence manifest → home sections → rendered marketing page
```

```text
DemoRequestForm → existing validation → demoRequestService → configured endpoint
```

## 10. Accessibility

- Exactly one main landmark and one page-level `h1`.
- Sequential heading hierarchy: `h1` → section `h2` → local `h3`.
- Stable anchors retain suitable sticky-header scroll margin.
- Skip link remains visible on focus and moves focus to `#main-content`.
- Links and buttons use their native semantics; no clickable generic containers.
- Interactive targets are at least 44×44px.
- Focus indication remains visible against every surface.
- Icons that repeat adjacent text use `aria-hidden="true"`.
- Product images have localized meaningful alternatives; decorative elements use empty alt text or are hidden from assistive technology.
- Keyboard users can operate the mobile header and any workflow or role selector.
- Content remains available when animation is disabled.

## 11. Responsive Behavior

The implementation is inspected at these target widths:

- 1440px desktop.
- 1024px small laptop/tablet landscape.
- 768px tablet portrait.
- 390px mobile.

Rules:

- Hero changes from 5/7 to one column without moving the CTA below an oversized visual.
- Workflow stages stack or become a simple accessible selector; essential content is not hidden behind hover.
- Product media uses a mobile-specific crop when desktop content would become unreadable.
- Role outcomes remain readable without a horizontally overflowing tab list.
- Demo form labels, error messages, consent text, and actions fit without clipping.
- Header navigation collapses using the existing accessible mobile-menu behavior.

## 12. Performance

- No new runtime dependency is added.
- The home page performs no additional API request.
- Product asset paths are static and images include width and height to reserve layout space.
- Only the hero product asset receives eager/high-priority loading; below-fold evidence is lazy.
- Heavy fake dashboards and animated counters are removed from the initial render.
- Static content is kept at module scope and components are not defined inside other components.
- Local state is limited to actual selectors such as role or workflow selection; derived display values are calculated during render rather than synchronized through effects.
- Event listeners are not added for layout measurement. Any existing header observer retains cleanup behavior.

Performance budgets are design targets, not claims. Lighthouse, runtime profiling, build output, or bundle measurements require separate user authorization under repository rules.

## 13. Metadata and Public Assets

- `useLandingMetadata` continues to own title, description, canonical URL, and Open Graph tags.
- The default Open Graph reference is synchronized to the existing asset path `/og/vum-crm-landing.svg`.
- The Open Graph artwork is updated only if it can accurately represent the approved visual direction and contains no unverified claim.
- No remote marketing image or stock-photo dependency remains on the home page.
- Existing logo, favicon, legal links, analytics behavior, and route metadata contracts are preserved.

## 14. Expected File Impact

Likely modifications:

```text
src/features/landing/LandingLayout.tsx
src/features/landing/landing.css
src/features/landing/pages/HomePage.tsx
src/features/landing/components/LandingHeader.tsx
src/features/landing/components/LandingFooter.tsx
src/features/landing/components/LandingSection.tsx
src/features/landing/components/DemoRequestForm.tsx        # presentation only, if required
src/features/landing/sections/home/*.tsx
src/features/landing/hooks/useLandingMetadata.ts
src/i18n/locales/vi/translation.json
src/i18n/locales/en/translation.json
tailwind.config.js                                         # malformed font strings only
public/og/vum-crm-landing.svg
```

Likely additions:

```text
src/features/landing/components/LandingProductVisual.tsx
src/features/landing/content/homeProductEvidence.ts
public/landing/product/*
```

Potential removals are limited to landing components proven unused after the new composition is connected. No deletion is authorized solely because a file looks obsolete.

## 15. Error and Empty-State Handling

- Static marketing sections do not display loading skeletons because they do not fetch data.
- A workflow item with no approved product asset is omitted rather than rendered with a broken placeholder.
- The demo form retains its existing submission, success, and error behavior.
- Direct sales contact is rendered only when the corresponding public environment value exists.
- Missing optional legal or contact configuration does not produce invented fallback data.
- Translation keys must exist in both locales before a section is connected.

## 16. Acceptance Criteria

The redesign is acceptable when all of the following are true:

1. `/` contains the approved eight blocks in the approved order.
2. The page has one `<main>` and one `h1`; sections are not nested redundantly.
3. The hero uses the approved H1, supporting copy, and CTA hierarchy.
4. The workflow communicates `Lead → Khách hàng → Cơ hội → Báo giá → Phê duyệt → Hợp đồng`.
5. All substantive home copy is translated through matching Vietnamese and English keys.
6. Product evidence is local, anonymized, explicitly sized, and traceable to an existing product screen.
7. No stock photo, fake logo, testimonial, certification, price, KPI, SLA, ROI, customer name, or unsupported security claim remains.
8. No dark home section, neon/glow styling, animated counter, parallax, or new motion library remains.
9. Existing public routes, header navigation, footer/legal behavior, logo behavior, analytics hooks, and demo-request contract remain intact.
10. Any rendered CRM lifecycle badge uses `@/config/crmStatusConfig`.
11. The page remains usable at 390, 768, 1024, and 1440px widths and with reduced motion.
12. The metadata default references an asset that exists.

## 17. Verification and Repository Constraints

Implementation verification must comply with repository rules:

- Do not run unit, integration, end-to-end, smoke, browser, API, manual runtime, or database tests without a new explicit user instruction.
- Do not start or restart the application for verification.
- Do not run a build as an indirect test unless explicitly requested.
- Permitted checks are static: import/reference searches, semantic source inspection, translation JSON parsing, asset-manifest/path comparison, and review of the uncommitted diff.
- Existing user changes, including current locale changes, must be preserved and merged carefully.
- No files are staged or committed.

Browser screenshots or visual inspection against `http://localhost:3002/` are performed only when the user separately authorizes that runtime verification for the implementation session.

## 18. Handoff Boundary

This document defines the approved design and implementation boundary. It does not authorize code implementation by itself. After the user approves this written spec, the next artifact is a detailed implementation plan created with the `superpowers:writing-plans` workflow. Code changes begin only after that plan is reviewed and the user explicitly asks for execution.
