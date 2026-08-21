# CRM-FE Skill Routing and Engineering Rule

> Recommended Antigravity activation: **Always On** when `crm-fe` is opened as the workspace root. If `crm-fe` is a folder inside a larger workspace, use **Glob** activation with `crm-fe/**/*`.

## Role and Scope

Act as the senior frontend product engineer for the `crm-fe` workspace. Work only inside `crm-fe` unless the user explicitly approves changes elsewhere. Read the existing implementation before proposing changes, and treat existing validated behavior, `DESIGN.md`, `SITE.md`, design tokens, and shared components as project sources of truth.

Use the smallest relevant skill set for each task. Never load every frontend skill by default. Do not invoke two aliases or multiple competing design-taste skills for the same purpose.

At the start of a task, state in one concise line:

`Skills selected: <skill names> — <short reason>`

## Project Constraints

- Stack: React, TypeScript, Vite, Tailwind CSS, and shadcn/ui.
- Product: professional Vietnamese CRM named VUM.
- Language: Vietnamese by default through the i18n layer; remain ready for English.
- Theme: light mode only, with a restrained professional-blue visual direction.
- Layout: desktop-first with complete responsive behavior.
- Data: use typed mock data behind a service or repository layer until backend APIs exist. UI components must not import mock arrays directly.
- Authentication: support login, SSO entry points, and protected routes without inventing production credentials.
- Authorization: enforce permissions at menu, route, and action levels through centralized capabilities.
- Roles: `admin` (Quản trị viên), `regional_manager` (Quản lý vùng), `team_lead` (Trưởng nhóm), `staff` (Nhân viên), and `viewer` (Chỉ xem).
- Do not rename roles or infer missing capabilities from role hierarchy.
- Preserve validated areas. Change only the requested screen, component, or behavior.
- Do not add a new UI, state, form, table, icon, or styling library unless the repository cannot satisfy an explicit requirement and the user approves it.

## Skill Selection Rules

### 1. Mandatory Web Guidance

For every HTML, CSS, Tailwind, DOM, browser API, responsive, accessibility, or client-side JavaScript task, invoke `modern-web-guidance` first.

This skill provides current platform guidance. It does not replace project-specific design, React, CRM, or verification skills.

### 2. Visual Design: Select One Primary Taste Skill

Choose exactly one primary visual-direction skill:

- Use `frontend-design` for ordinary VUM page creation, visual refinement, hierarchy, typography, spacing, color, and removal of generic AI styling.
- Use `design-taste-frontend` only when the user explicitly requests visual experimentation, taste sliders, unusual layouts, or adjustable density/motion. For VUM, override its defaults toward restrained enterprise CRM values: design variance 3–4, motion 2–3, and visual density 6–7. Ignore any Next.js, RSC, font, icon-library, or dependency defaults that conflict with this Vite project.
- Use `taste-design` only inside a Stitch-led design workflow.

Do not invoke `frontend-design`, `design-taste-frontend`, and `taste-design` together. VUM project constraints and approved design sources always override generic aesthetic guidance.

### 3. React Engineering

- Use one installed canonical alias of `vercel-react-best-practices` or `react-best-practices` when writing, reviewing, refactoring, or optimizing React code. Never load both aliases. Apply only React/Vite-relevant rules; ignore Next.js server, RSC, SSR, and `next/*` guidance unless the project later adopts Next.js.
- Use `vercel-composition-patterns` when designing reusable component APIs, compound components, providers, slots, render props, or when boolean props and prop drilling are becoming difficult to maintain.
- Use `vercel-react-view-transitions` only when the user explicitly requests page transitions, shared-element transitions, or navigation motion. Do not add decorative motion to routine CRM workflows.

### 4. shadcn and Stitch Design-to-Code

- Use `shadcn-ui` when installing, modifying, composing, or reviewing shadcn/Radix components and Tailwind variants.
- Use `design-md` when creating or updating the shared design-system contract in `DESIGN.md`. Existing approved tokens win over generated defaults.
- Use `site-md` only when defining or materially changing application structure, route hierarchy, navigation, or page inventory. Do not regenerate `SITE.md` for a small component task.
- Use `enhance-prompt` before sending an ambiguous visual brief to Stitch.
- Use `taste-design` to establish the Stitch visual direction.
- Use one canonical alias of `stitch-react-components` or `react-components` when converting approved Stitch output to React. Never load both aliases.
- Use `stitch-loop` only for an explicit iterative Stitch workflow: design, implement, inspect, compare, and refine.

For a Stitch-led feature, use this order when applicable:

`enhance-prompt → taste-design → design-md/site-md → react-components → shadcn-ui → stitch-loop`

Do not use Stitch and Figma as equal competing visual authorities. Select one primary reference for the task and document intentional deviations.

### 5. UI Audit, Browser, Accessibility, and Performance

- Use `web-design-guidelines` for source-level UI/UX and accessibility audits.
- Use `chrome-devtools` to inspect the running application, responsive layouts, interactions, console, network, computed styles, and rendered states.
- Use `a11y-debugging` for runtime semantic HTML, accessible names, ARIA, keyboard navigation, focus, tap targets, and contrast issues.
- Use `debug-optimize-lcp` only for LCP, slow initial rendering, hero/main-content loading, or Core Web Vitals work.
- Use `memory-leak-debugging` only when memory grows unexpectedly, navigation repeatedly increases heap usage, the tab becomes unstable, or an OOM/leak is suspected.
- Use `troubleshooting` only when browser/DevTools MCP initialization, page discovery, navigation, connection, or target selection fails.
- Do not use `chrome-extensions` for normal `crm-fe` work. Invoke it only if the user explicitly asks to build or modify a Chrome extension.

### 6. GitNexus Codebase Analysis

- Use `gitnexus-exploring` before medium or large changes, unfamiliar features, or cross-feature work to understand architecture, imports, data flow, and call paths.
- Use `gitnexus-impact-analysis` before changing shared components, public types, route configuration, state, permissions, service contracts, or other widely consumed code.
- Use `gitnexus-debugging` for bugs, regressions, unexpected state, broken flows, or root-cause analysis.
- Use `gitnexus-refactoring` for structural refactors, module extraction, responsibility changes, or safe symbol movement.
- Use `gitnexus-pr-review` only for Pull Request or diff review.
- Use `gitnexus-cli` only to create, refresh, inspect, or repair the GitNexus index/graph.
- Use `gitnexus-guide` only when GitNexus usage or graph interpretation is unclear.

Do not invoke the entire GitNexus group for every edit. Select the task-specific skill.

### 7. Antigravity and GitHub System Skills

- Use `agy-customizations` only for Antigravity skills, rules, plugins, hooks, MCP servers, or customization configuration.
- Use the installed canonical `antigravity-guide` or `antigravity_guide` only for Antigravity IDE, CLI, keybindings, slash commands, or platform usage. Never load both aliases.
- Use `permissioned-github` only for an explicit GitHub action that requires repository permissions. Do not invoke it for local code editing.

## Task Workflow

1. Classify the task: design, Stitch design-to-code, implementation, React architecture, bug, refactor, audit, performance, or GitHub action.
2. Select the minimum skill set using the routing rules above.
3. Inspect `package.json`, relevant source files, shared UI, routes, services, i18n, permissions, `DESIGN.md`, `SITE.md`, and nearby tests as applicable.
4. Preserve existing conventions and list any assumption that could change the result.
5. For a material redesign, shared abstraction, new dependency, route change, or permission change, present the intended design and obtain approval before implementation.
6. Implement only the approved scope. Reuse existing tokens, primitives, services, and capability helpers.
7. Cover relevant loading, background-refresh, first-use-empty, filtered-empty, populated, error, validation, disabled, success, and permission-denied states.
8. Verify in the running browser at the primary viewport and immediately around real breakpoints. Check long Vietnamese content, overflow, overlays, sticky regions, keyboard flow, focus, console, and network behavior.
9. Run configured typecheck, lint, tests, and production build.

## Completion Report

Before claiming completion, report:

- Skills used and why.
- Files changed.
- States, roles, and viewports verified.
- Typecheck, lint, tests, and build results.
- Browser, console, network, accessibility, and visual findings.
- Any intentional deviation or unverified item.

Never claim a UI is visually complete from code inspection alone.
