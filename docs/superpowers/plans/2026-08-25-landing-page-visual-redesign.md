# Landing Page Visual Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the VUM CRM landing page on a real design-token layer, replace eight missing product screenshots with React-rendered product mockups, and give the page a deliberate light-to-dark-to-light rhythm.

**Architecture:** A token layer scoped to `.landing-theme` defines colour, type, elevation, and motion scales under an `--lp-*` prefix, with every legacy `--landing-*` name redefined as an alias so untouched files inherit the new values. Four primitives (`LandingSection`, `SectionHeading`, `Surface`, `Reveal`) encode the design decisions as union types. A `product-ui/` directory renders six product mockups inside one shared `MockWindow` frame, reusing the application's own status-badge colour maps.

**Tech Stack:** React 18, TypeScript 5.7, Tailwind CSS 3.4, Radix UI primitives, `react-i18next`, `lucide-react`, Vite 6. No new dependency is added.

**Spec:** `docs/superpowers/specs/2026-08-25-landing-page-visual-redesign-design.md`

## Execution status — 2026-08-25: COMPLETE

**All 22 tasks are done and verified.** Nothing is committed; the working tree is left for review.

Final verification:

| Check | Result |
|---|---|
| References to the missing product images | `0` (was 8) |
| `h-section` / `h-hero` / `--color-ink` | `0` (was 3) |
| Dark-tone focus ring present | yes |
| `tone="dark"` on `LandingSection` | exactly `1` |
| `npm run typecheck` | clean |
| `npm run verify:english-only` | 0 violations |
| Lint errors in `src/features/landing/` | **`0`** (was 1) |
| Lint errors repo-wide | 292 (was 293) |
| Out-of-scope files modified | none |
| `package.json` changed | no |

Three findings during execution changed this plan, all written into Global Constraints below:

1. The repository's lint baseline was already red (293 errors), so "lint passes" could never have been the gate.
2. ESLint's `no-undef` fires on TypeScript type names because `eslint.config.js` lists globals by hand — this is why the new hooks carry `/* global */` directives.
3. Task 22 Step 3's original rhythm check was wrong: `tone` is a prop on three different components, so a bare grep overcounted `dark` as 2. The corrected, scoped check is in that step.

Task 20 also cleared the pre-existing `LandingHeader.tsx:24` lint error, since that file was being modified anyway. `src/features/landing/` is now lint-clean.

## Global Constraints

These apply to **every** task below without being restated.

- **No new runtime dependency.** In particular, no animation library. Motion is CSS plus `IntersectionObserver` only.
- **Never create a git commit.** `AGENTS.md` §3 forbids commits, pushes, branches, PRs, and staging. Every task ends with an uncommitted working tree for the user to review. This overrides the writing-plans skill's default commit step.
- **Never run tests and never start the application.** `AGENTS.md` §4. The user has explicitly authorised exactly two commands for this work: `npm run typecheck` and `npm run lint`. `npm run build` and `npm run dev` remain out of bounds. Visual confirmation is the user's, not the implementer's.

- **`npm run lint` is RED before this work begins.** Measured at the start of execution: **293 errors** across `src/services/api`, `src/features/crm/*`, `src/components/ui`, and others — none of them caused by this plan. Inside `src/features/landing/` there is exactly **one** pre-existing error: `components/LandingHeader.tsx:24:33 'ScrollBehavior' is not defined (no-undef)`.

  Therefore **"lint passes" is not an achievable gate and must not be used as one.** Every task's lint step means: *no new error appears in a file this plan touches.* Check with:

  ```bash
  npm run lint 2>&1 | grep -A5 "features/landing"
  ```

  Expected through Task 19: only the known `LandingHeader.tsx:24` line. Task 20 removes even that one.

- **ESLint's `no-undef` fires on TypeScript type names.** `eslint.config.js` lists browser globals by hand and the list omits `IntersectionObserver`, `MediaQueryListEvent`, `Element`, `ScrollBehavior`, and `HTMLAnchorElement`. Because the base `no-undef` rule has no concept of TypeScript's type space, a type-only reference is reported as an undefined variable — which is exactly why `LandingHeader.tsx:24` fails today and why `AnimatedCounter.tsx` opens with `/* global IntersectionObserver */`.

  Every new file using such a name must carry a matching `/* global ... */` comment, following the convention already in the codebase. Required in this plan:

  | File | Directive |
  |------|-----------|
  | `hooks/useInViewOnce.ts` | `/* global IntersectionObserver, Element */` |
  | `hooks/usePrefersReducedMotion.ts` | `/* global MediaQueryListEvent */` |

  `hooks/useScrolled.ts` needs none: `window` is already in the globals list.
- **All commands run from `crm-fe/`.**
- **All interface copy goes through `react-i18next`** via `useTranslation()`. Never hard-code a user-visible string in a section or shell component. Sample data inside product mockups is the one exception and is defined in section 7.5 of the spec.
- **UI copy is English only.** `npm run verify:english-only` must keep passing.
- **The brand blue `#085AC0` never changes.** It matches `secondary` in `tailwind.config.js`.
- **These three files must not be modified:** `pages/FeaturesPage.tsx`, `pages/PricingPage.tsx`, `pages/SolutionsPage.tsx`. They consume `LandingSection` and `SectionHeading`, so every change to those two components must be backward compatible. All three call `SectionHeading` with exactly `as="h1"`, `title`, `description`, `align="left"`, and `LandingSection` with `contained className="pt-0"`.
- **`components/DemoRequestForm.tsx` logic must not change.** Only its field styling is retokenized, in Task 19.
- **Paths** in this plan are relative to `crm-fe/src/features/landing/` unless written otherwise.
- **`cn()`** comes from `@/lib/utils` and wraps `clsx` + `twMerge`. Custom `lp-*` classes are not Tailwind utilities, so `twMerge` passes them through untouched.

### Deviation from the spec

The spec's file inventory (§12) lists 13 new files. This plan creates **14**. The extra file is `hooks/usePrefersReducedMotion.ts`.

The spec assigned the reduced-motion check to `Reveal` alone. While planning Task 3 it became clear that `AnimatedCounter` needs it too: that component animates with `requestAnimationFrame`, which the `prefers-reduced-motion` CSS block at `landing.css` line 120 cannot reach, because that block only shortens CSS `transition-duration` and `animation-duration`. `AnimatedCounter` therefore animates at full length today even when a user has asked for reduced motion. Two consumers justify a shared hook rather than a helper hidden inside a component.

---

## Task 1: Token layer

**Files:**
- Modify: `landing.css` (full rewrite, 131 lines to roughly 420)

**Interfaces:**
- Consumes: nothing.
- Produces: CSS custom properties `--lp-canvas`, `--lp-surface`, `--lp-surface-sunk`, `--lp-ink`, `--lp-ink-muted`, `--lp-ink-subtle`, `--lp-line`, `--lp-line-strong`, `--lp-blue-50` / `-100` / `-200` / `-400` / `-500` / `-600` / `-700`, `--lp-dark`, `--lp-dark-raised`, `--lp-dark-line`, `--lp-dark-ink`, `--lp-dark-ink-muted`, `--lp-shadow-sm` / `-md` / `-lg` / `-dark-raised`, `--lp-text-display` / `-h2` / `-h3` / `-lead`, `--lp-section-strip` / `-default` / `-tall`, `--lp-ease`, `--lp-dur-fast` / `--lp-dur` / `--lp-dur-slow`. Utility classes `.lp-tone-canvas`, `.lp-tone-surface`, `.lp-tone-mesh`, `.lp-tone-dark`, `.lp-size-strip`, `.lp-size-default`, `.lp-size-tall`, `.lp-display`, `.lp-h2`, `.lp-h3`, `.lp-lead`, `.lp-eyebrow`, `.lp-caption`, `.lp-card`, `.lp-surface`, `.lp-surface-sunk`, `.lp-surface-dark-raised`, `.lp-elev-flat` / `-sm` / `-md` / `-lg`, `.lp-card-interactive`, `.lp-reveal`, `.lp-reveal-in`.

- [ ] **Step 1: Record the current failure**

Run from `crm-fe/`:

```bash
grep -c "lp-" src/features/landing/landing.css
```

Expected: `0`. No token exists yet. Also confirm the defect this task's aliases must not reintroduce:

```bash
grep -rn "var(--landing-" src/features/landing/pages/ | wc -l
```

Expected: a non-zero count. Those references live in the three files this plan may not modify, so Step 2's alias block is what keeps them working.

- [ ] **Step 2: Rewrite `landing.css`**

Replace the entire file with:

```css
/* ==========================================================================
   VUM CRM — Landing design tokens
   Everything is scoped to .landing-theme so the application shell is
   untouched. Legacy --landing-* names are kept as aliases at the bottom of
   the token block: the Features / Solutions / Pricing pages reference them
   directly and must not be edited.
   ========================================================================== */

.landing-theme {
  /* --- Light surfaces --- */
  --lp-canvas:         #F5F8FC;
  --lp-surface:        #FFFFFF;
  --lp-surface-sunk:   #EEF3F9;

  /* --- Ink, three levels --- */
  --lp-ink:            #07182B;
  --lp-ink-muted:      #52647A;
  --lp-ink-subtle:     #7688A0;

  /* --- Lines --- */
  --lp-line:           #DFE7F1;
  --lp-line-strong:    #C6D4E6;

  /* --- Brand blue scale (500 is the brand colour, never change it) --- */
  --lp-blue-50:        #EEF5FE;
  --lp-blue-100:       #DBE9FC;
  --lp-blue-200:       #B9D3F8;
  --lp-blue-400:       #3B84DA;
  --lp-blue-500:       #085AC0;
  --lp-blue-600:       #06499D;
  --lp-blue-700:       #053A7C;

  /* --- Dark surfaces, used by the Enterprise Trust section only --- */
  --lp-dark:           #061426;
  --lp-dark-raised:    #0D2038;
  --lp-dark-line:      #1B3149;
  --lp-dark-ink:       #EAF1FA;
  --lp-dark-ink-muted: #9DB1C9;

  /* --- Elevation. The leading 0 0 0 1px layer is a zero-radius shadow
         acting as a hairline border: crisp edge, no box-model cost. --- */
  --lp-shadow-sm:
    0 1px 2px rgba(7, 24, 43, .06),
    0 1px 3px rgba(7, 24, 43, .08);
  --lp-shadow-md:
    0 0 0 1px   rgba(7, 24, 43, .03),
    0 1px 2px   rgba(7, 24, 43, .05),
    0 4px 12px  rgba(7, 24, 43, .07),
    0 12px 28px rgba(7, 24, 43, .06);
  --lp-shadow-lg:
    0 0 0 1px   rgba(7, 24, 43, .04),
    0 1px 2px   rgba(7, 24, 43, .06),
    0 8px 24px  rgba(7, 24, 43, .08),
    0 32px 64px rgba(7, 24, 43, .12);
  --lp-shadow-dark-raised:
    inset 0 1px 0 rgba(255, 255, 255, .06),
    0 1px 2px rgba(0, 0, 0, .30);

  /* --- One type scale. Replaces the hero clamp() and the
         text-3xl md:text-5xl scale that previously competed. --- */
  --lp-text-display: clamp(2.5rem,    1.55rem + 3.6vw,  4.25rem);
  --lp-text-h2:      clamp(1.875rem,  1.35rem + 2vw,    3rem);
  --lp-text-h3:      clamp(1.25rem,   1.13rem + .48vw,  1.5rem);
  --lp-text-lead:    clamp(1.0625rem, 1rem    + .24vw,  1.25rem);

  /* --- Section rhythm. Uniform padding was the technical cause of the
         page reading flat; these three steps create the contrast. --- */
  --lp-section-strip:   clamp(2rem,   3vw,  3rem);
  --lp-section-default: clamp(4.5rem, 8vw,  8rem);
  --lp-section-tall:    clamp(5.5rem, 10vw, 10rem);

  /* --- Motion --- */
  --lp-ease:     cubic-bezier(.22, .61, .36, 1);
  --lp-dur-fast: 150ms;
  --lp-dur:      260ms;
  --lp-dur-slow: 600ms;

  /* --- Fonts --- */
  --landing-font-body:    'Be Vietnam Pro', 'Inter', sans-serif;
  --landing-font-display: 'Plus Jakarta Sans', 'Be Vietnam Pro', sans-serif;

  /* --- Backward-compatible aliases. This block is why the three landing
         sub-pages inherit the refreshed palette without being edited. --- */
  --landing-canvas:     var(--lp-canvas);
  --landing-surface:    var(--lp-surface);
  --landing-ink:        var(--lp-ink);
  --landing-muted:      var(--lp-ink-muted);
  --landing-line:       var(--lp-line);
  --landing-blue:       var(--lp-blue-500);
  --landing-blue-hover: var(--lp-blue-600);
  --landing-blue-soft:  var(--lp-blue-50);

  min-height: 100dvh;
  overflow-x: clip;
  background: var(--lp-canvas);
  color: var(--lp-ink);
  font-family: var(--landing-font-body);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* ==========================================================================
   Layout
   ========================================================================== */

.landing-theme .landing-container {
  width: min(calc(100% - 2rem), 80rem);
  margin-inline: auto;
}

.landing-theme .landing-section {
  position: relative;
  padding-block: var(--lp-section-default);
  scroll-margin-top: 5rem;
}

/* Two classes beat one, so these win over .landing-section above. */
.landing-theme .landing-section.lp-size-strip   { padding-block: var(--lp-section-strip); }
.landing-theme .landing-section.lp-size-default { padding-block: var(--lp-section-default); }
.landing-theme .landing-section.lp-size-tall    { padding-block: var(--lp-section-tall); }

/* ==========================================================================
   Tone utilities
   ========================================================================== */

.landing-theme .lp-tone-canvas  { background-color: var(--lp-canvas); }
.landing-theme .lp-tone-surface { background-color: var(--lp-surface); }

.landing-theme .lp-tone-mesh {
  background-color: var(--lp-canvas);
  background-image:
    radial-gradient(60rem 32rem at 20% -10%, rgba(8, 90, 192, .10),   transparent 60%),
    radial-gradient(45rem 28rem at 88%   4%, rgba(59, 132, 218, .08), transparent 62%);
  isolation: isolate;
}

.landing-theme .lp-tone-dark {
  background-color: var(--lp-dark);
  color: var(--lp-dark-ink);
  background-image:
    radial-gradient(50rem 26rem at 50% -8%, rgba(59, 132, 218, .18), transparent 65%);
  isolation: isolate;
}

/* The dot grid lives on a pseudo-element. A mask applied to the element
   itself would also erase the radial glows above. */
.landing-theme .lp-tone-mesh::before,
.landing-theme .lp-tone-dark::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  background-image: radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0);
  background-size: 28px 28px;
  opacity: .05;
  -webkit-mask-image: linear-gradient(to bottom, #000, transparent 70%);
  mask-image: linear-gradient(to bottom, #000, transparent 70%);
}

.landing-theme .lp-tone-dark::before { opacity: .09; }

/* ==========================================================================
   Type utilities. .lp-h2 and .lp-display are what replace the undefined
   h-section and h-hero classes that SectionHeading used to apply.
   ========================================================================== */

.landing-theme .lp-display,
.landing-theme .lp-h2,
.landing-theme .lp-h3 {
  font-family: var(--landing-font-display);
  letter-spacing: -0.035em;
  line-height: 1.08;
  text-wrap: balance;
  color: var(--lp-ink);
}

.landing-theme .lp-display { font-size: var(--lp-text-display); font-weight: 800; }
.landing-theme .lp-h2      { font-size: var(--lp-text-h2);      font-weight: 800; }
.landing-theme .lp-h3      { font-size: var(--lp-text-h3);      font-weight: 700; line-height: 1.25; }

.landing-theme .lp-lead {
  font-size: var(--lp-text-lead);
  line-height: 1.65;
  color: var(--lp-ink-muted);
  text-wrap: pretty;
}

.landing-theme .lp-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: .625rem;
  font-size: .75rem;
  font-weight: 700;
  letter-spacing: .09em;
  text-transform: uppercase;
  color: var(--lp-blue-600);
}

/* The short hairline rule that precedes the eyebrow label. */
.landing-theme .lp-eyebrow::before {
  content: '';
  width: 1.5rem;
  height: 1px;
  background: currentColor;
  opacity: .55;
}

.landing-theme .lp-caption {
  font-size: .8125rem;
  line-height: 1.5;
  color: var(--lp-ink-subtle);
}

/* Dark-tone overrides for the type utilities. */
.landing-theme .lp-tone-dark .lp-display,
.landing-theme .lp-tone-dark .lp-h2,
.landing-theme .lp-tone-dark .lp-h3 { color: var(--lp-dark-ink); }
.landing-theme .lp-tone-dark .lp-lead    { color: var(--lp-dark-ink-muted); }
.landing-theme .lp-tone-dark .lp-caption { color: var(--lp-dark-ink-muted); }
.landing-theme .lp-tone-dark .lp-eyebrow { color: var(--lp-blue-200); }

.landing-theme .landing-display  { font-family: var(--landing-font-display); letter-spacing: -0.035em; line-height: 1.08; text-wrap: balance; }
.landing-theme .landing-body-copy { color: var(--lp-ink-muted); line-height: 1.7; text-wrap: pretty; }

/* ==========================================================================
   Surface / card
   ========================================================================== */

.landing-theme .lp-card {
  border-radius: 1rem;
  border: 1px solid var(--lp-line);
}

.landing-theme .lp-surface            { background-color: var(--lp-surface); }
.landing-theme .lp-surface-sunk       { background-color: var(--lp-surface-sunk); }
.landing-theme .lp-surface-dark-raised {
  background-color: var(--lp-dark-raised);
  border-color: var(--lp-dark-line);
  box-shadow: var(--lp-shadow-dark-raised);
}

.landing-theme .lp-elev-flat { box-shadow: none; }
.landing-theme .lp-elev-sm   { box-shadow: var(--lp-shadow-sm); }
.landing-theme .lp-elev-md   { box-shadow: var(--lp-shadow-md); }
.landing-theme .lp-elev-lg   { box-shadow: var(--lp-shadow-lg); }

.landing-theme .lp-card-interactive {
  transition: box-shadow var(--lp-dur) var(--lp-ease),
              border-color var(--lp-dur) var(--lp-ease),
              transform var(--lp-dur) var(--lp-ease);
}

.landing-theme .lp-card-interactive:hover {
  border-color: var(--lp-line-strong);
  box-shadow: var(--lp-shadow-md);
  transform: translateY(-2px);
}

/* ==========================================================================
   Reveal. The resting state is opacity 0, so Reveal.tsx must decide in
   JavaScript whether to animate at all — see hooks/usePrefersReducedMotion.
   ========================================================================== */

.landing-theme .lp-reveal {
  opacity: 0;
  transform: translateY(12px);
  transition: opacity   var(--lp-dur-slow) var(--lp-ease),
              transform var(--lp-dur-slow) var(--lp-ease);
}

.landing-theme .lp-reveal-in {
  opacity: 1;
  transform: none;
}

/* ==========================================================================
   Actions
   ========================================================================== */

.landing-theme .landing-primary-action,
.landing-theme .landing-secondary-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 2.75rem;
  padding-inline: 1.5rem;
  border-radius: .5rem;
  font-weight: 600;
  font-size: .875rem;
  text-decoration: none;
  transition: background-color var(--lp-dur-fast) var(--lp-ease),
              border-color     var(--lp-dur-fast) var(--lp-ease),
              box-shadow       var(--lp-dur-fast) var(--lp-ease),
              transform        var(--lp-dur-fast) var(--lp-ease);
}

.landing-theme .landing-primary-action {
  background-color: var(--lp-blue-500);
  color: #ffffff;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, .15),
    var(--lp-shadow-sm);
}

.landing-theme .landing-primary-action:hover { background-color: var(--lp-blue-600); }
.landing-theme .landing-primary-action:active { transform: scale(.98); }

.landing-theme .landing-secondary-action {
  background-color: var(--lp-surface);
  color: var(--lp-ink);
  border: 1px solid var(--lp-line);
}

.landing-theme .landing-secondary-action:hover {
  background-color: var(--lp-blue-50);
  border-color: var(--lp-blue-500);
}

.landing-theme .landing-secondary-action:active { transform: scale(.98); }

/* ==========================================================================
   Focus. The default ring is brand blue, which is invisible against the
   dark section — so the dark tone gets its own outline colour.
   ========================================================================== */

.landing-theme :where(a, button, input, select, textarea):focus-visible {
  outline: 2px solid var(--lp-blue-500);
  outline-offset: 3px;
}

.landing-theme .lp-tone-dark :where(a, button, input, select, textarea):focus-visible {
  outline-color: var(--lp-blue-200);
}

.landing-skip-link {
  position: absolute;
  top: -9999px;
  left: 1rem;
  z-index: 9999;
  padding: .75rem 1.5rem;
  background: var(--lp-surface);
  color: var(--lp-blue-500);
  border: 2px solid var(--lp-blue-500);
  border-radius: .375rem;
  font-weight: 600;
  text-decoration: none;
}

.landing-skip-link:focus { top: 1rem; }

@media (min-width: 768px) {
  .landing-theme .landing-container {
    width: min(calc(100% - 3rem), 80rem);
  }
}

/* Retained in addition to the JavaScript guard in Reveal.tsx. This block
   alone is not sufficient: it shortens durations but cannot change an
   initial opacity of 0, nor stop a requestAnimationFrame loop. */
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

- [ ] **Step 3: Verify the tokens exist and the aliases survived**

```bash
grep -c -- "--lp-" src/features/landing/landing.css
grep -c -- "--landing-blue:" src/features/landing/landing.css
```

Expected: a large count for the first, `1` for the second. If the alias block was dropped, every `var(--landing-blue)` in the three untouched sub-pages resolves to nothing and their buttons lose their colour.

- [ ] **Step 4: Typecheck and lint**

```bash
npm run typecheck
npm run lint
```

Expected: both pass. CSS is not typechecked, but this confirms nothing else regressed.

- [ ] **Step 5: Checkpoint — do not commit**

Leave the working tree dirty. Report to the user: `landing.css` rewritten, tokens and aliases in place, typecheck and lint green.

---

## Task 2: Repair `SectionHeading` and extend `LandingSection`

This task closes defect 1.2 from the spec: `SectionHeading` applies `h-section`, `h-hero`, `--color-ink`, and `--color-ink-muted`, none of which are defined anywhere in the repository.

**Files:**
- Modify: `components/SectionHeading.tsx` (full rewrite, 48 lines)
- Modify: `components/LandingSection.tsx` (full rewrite, 26 lines)

**Interfaces:**
- Consumes: `.lp-display`, `.lp-h2`, `.lp-lead`, `.lp-eyebrow`, `.lp-tone-*`, `.lp-size-*` from Task 1.
- Produces:
  - `SectionTone = 'canvas' | 'surface' | 'dark' | 'mesh'`
  - `SectionSize = 'strip' | 'default' | 'tall'`
  - `LandingSectionProps` gains optional `tone?: SectionTone` and `size?: SectionSize`
  - `SectionHeadingProps` gains optional `eyebrow?: string`, `tone?: 'light' | 'dark'`, `id?: string`

- [ ] **Step 1: Record the current failure**

```bash
grep -rn "h-section\|h-hero\|--color-ink" src/features/landing/
```

Expected: three hits, all in `components/SectionHeading.tsx` at lines 32 and 40. These are the classes and variables that do not exist. This grep must return nothing by Step 5.

- [ ] **Step 2: Rewrite `components/LandingSection.tsx`**

```tsx
import type { ComponentPropsWithoutRef, ElementType, ReactElement } from 'react';
import { cn } from '@/lib/utils';

export type SectionTone = 'canvas' | 'surface' | 'dark' | 'mesh';
export type SectionSize = 'strip' | 'default' | 'tall';

const toneClass: Record<SectionTone, string> = {
  canvas: 'lp-tone-canvas',
  surface: 'lp-tone-surface',
  dark: 'lp-tone-dark',
  mesh: 'lp-tone-mesh',
};

const sizeClass: Record<SectionSize, string> = {
  strip: 'lp-size-strip',
  default: 'lp-size-default',
  tall: 'lp-size-tall',
};

export interface LandingSectionProps
  extends ComponentPropsWithoutRef<'section'> {
  as?: 'section' | 'div';
  contained?: boolean;
  /** Background treatment. Omit to inherit whatever the parent provides. */
  tone?: SectionTone;
  /** Vertical rhythm step. Omit for the default padding. */
  size?: SectionSize;
}

export function LandingSection({
  as = 'section',
  contained = true,
  tone,
  size,
  className,
  children,
  ...props
}: LandingSectionProps): ReactElement {
  const Component: ElementType = as;

  return (
    <Component
      className={cn(
        'landing-section',
        tone && toneClass[tone],
        size && sizeClass[size],
        className
      )}
      {...props}
    >
      {contained ? <div className="landing-container">{children}</div> : children}
    </Component>
  );
}

export default LandingSection;
```

`tone` and `size` are optional with no default, so the three sub-pages calling `<LandingSection contained className="pt-0">` render byte-identical markup to before.

- [ ] **Step 3: Rewrite `components/SectionHeading.tsx`**

```tsx
import type { ReactElement } from 'react';
import { cn } from '@/lib/utils';

export interface SectionHeadingProps {
  title: string;
  /** Small uppercase label rendered above the title. */
  eyebrow?: string;
  description?: string;
  align?: 'left' | 'center';
  as?: 'h1' | 'h2';
  /** Switches the palette for use inside a dark-tone section. */
  tone?: 'light' | 'dark';
  /** Forwarded to the heading so a section can aria-labelledby it. */
  id?: string;
  className?: string;
}

export function SectionHeading({
  title,
  eyebrow,
  description,
  align = 'left',
  as = 'h2',
  tone = 'light',
  id,
  className,
}: SectionHeadingProps): ReactElement {
  const HeadingTag = as;

  return (
    <div
      className={cn(
        'mb-12 sm:mb-16',
        align === 'center' ? 'mx-auto max-w-[42rem] text-center' : 'max-w-[42rem]',
        className
      )}
    >
      {eyebrow ? <p className="lp-eyebrow mb-4">{eyebrow}</p> : null}

      <HeadingTag id={id} className={as === 'h1' ? 'lp-display' : 'lp-h2'}>
        {title}
      </HeadingTag>

      {description ? <p className="lp-lead mt-5">{description}</p> : null}
    </div>
  );
}

export default SectionHeading;
```

Two things changed beyond the class repair. The `NO EYEBROW ALLOWED IN ANTI-SLOP SAAS` comment is gone, because it contradicted both the eight HomePage sections and the `landing.home.*.eyebrow` keys that already exist in the translation bundle. And the dark palette is handled by the `.lp-tone-dark` descendant rules from Task 1 rather than by a prop-driven class, so `tone` only needs to exist for call-site clarity — it does not need to emit anything today. Keep the prop: Task 17 documents intent with it.

- [ ] **Step 4: Verify the undefined classes are gone**

```bash
grep -rn "h-section\|h-hero\|--color-ink" src/features/landing/
```

Expected: no output. This is the proof that defect 1.2 is closed and the Features, Pricing, and Solutions headings now render at display size.

- [ ] **Step 5: Confirm the sub-pages still compile untouched**

```bash
npm run typecheck
npm run lint
git status --porcelain src/features/landing/pages/
```

Expected: typecheck and lint pass, and `git status` prints nothing for `pages/` — those three files must remain unmodified.

- [ ] **Step 6: Checkpoint — do not commit**

---

## Task 3: Motion foundation

**Files:**
- Create: `hooks/useInViewOnce.ts`
- Create: `hooks/usePrefersReducedMotion.ts`
- Create: `components/Reveal.tsx`
- Modify: `components/AnimatedCounter.tsx`

**Interfaces:**
- Consumes: `.lp-reveal`, `.lp-reveal-in` from Task 1.
- Produces:
  - `useInViewOnce<T extends Element>(options?: UseInViewOnceOptions): [RefObject<T>, boolean]`
  - `UseInViewOnceOptions = { threshold?: number; rootMargin?: string; disabled?: boolean }`
  - `usePrefersReducedMotion(): boolean`
  - `Reveal` with props `{ children: ReactNode; delay?: number; as?: ElementType; className?: string }`
  - `AnimatedCounter` keeps its existing props exactly: `{ end: number; decimals?: number; duration?: number; prefix?: string; suffix?: string; className?: string }`

- [ ] **Step 1: Record the current failure**

```bash
ls src/features/landing/hooks/
grep -n "requestAnimationFrame" src/features/landing/components/AnimatedCounter.tsx
```

Expected: `hooks/` contains only `useLandingMetadata.ts`, and `AnimatedCounter` uses `requestAnimationFrame`. That call is the reduced-motion defect described in this plan's Deviation note: no CSS media query can stop it.

- [ ] **Step 2: Create `hooks/useInViewOnce.ts`**

```ts
/* global IntersectionObserver */
import { useEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';

export interface UseInViewOnceOptions {
  threshold?: number;
  rootMargin?: string;
  /** Skip observation entirely and report in view from the first render. */
  disabled?: boolean;
}

/**
 * Reports true the first time the element scrolls into view, then stops
 * observing. Extracted from the pattern already proven in AnimatedCounter.
 */
export function useInViewOnce<T extends Element>(
  options: UseInViewOnceOptions = {}
): [RefObject<T>, boolean] {
  const { threshold = 0.15, rootMargin = '0px', disabled = false } = options;
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(disabled);

  useEffect(() => {
    if (disabled) {
      setInView(true);
      return;
    }

    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [threshold, rootMargin, disabled]);

  return [ref, inView];
}
```

- [ ] **Step 3: Create `hooks/usePrefersReducedMotion.ts`**

```ts
import { useEffect, useState } from 'react';

const QUERY = '(prefers-reduced-motion: reduce)';

/**
 * True when the user has asked the operating system to reduce motion.
 * Needed in JavaScript, not only CSS: a CSS media query can shorten a
 * transition but cannot change an initial opacity of 0, and cannot stop a
 * requestAnimationFrame loop.
 */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState<boolean>(
    () => window.matchMedia(QUERY).matches
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia(QUERY);
    const handleChange = (event: MediaQueryListEvent) => setReduced(event.matches);

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return reduced;
}
```

- [ ] **Step 4: Create `components/Reveal.tsx`**

```tsx
import type { ElementType, ReactElement, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { useInViewOnce } from '../hooks/useInViewOnce';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';

export interface RevealProps {
  children: ReactNode;
  /** Stagger in milliseconds. Ignored when reduced motion is requested. */
  delay?: number;
  as?: ElementType;
  className?: string;
}

export function Reveal({
  children,
  delay = 0,
  as: Component = 'div',
  className,
}: RevealProps): ReactElement {
  const reduced = usePrefersReducedMotion();
  const [ref, inView] = useInViewOnce<HTMLDivElement>({ disabled: reduced });

  return (
    <Component
      ref={ref}
      className={cn('lp-reveal', inView && 'lp-reveal-in', className)}
      style={
        !reduced && delay > 0 ? { transitionDelay: `${delay}ms` } : undefined
      }
    >
      {children}
    </Component>
  );
}

export default Reveal;
```

When `reduced` is true, `useInViewOnce` is constructed with `disabled: true`, so `useState(disabled)` seeds `inView` as `true` on the very first render. Both `lp-reveal` and `lp-reveal-in` are applied together and the content is visible immediately. It is never possible for content to be left at `opacity: 0`.

- [ ] **Step 5: Refactor `components/AnimatedCounter.tsx`**

Replace the file with the version below. The props and the rendered output are unchanged, so the three sub-pages that use it keep working.

```tsx
import { useEffect, useState } from 'react';
import type { ReactElement } from 'react';
import { useInViewOnce } from '../hooks/useInViewOnce';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';

interface AnimatedCounterProps {
  end: number;
  decimals?: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

export function AnimatedCounter({
  end,
  decimals = 0,
  duration = 1800,
  prefix = '',
  suffix = '',
  className = '',
}: AnimatedCounterProps): ReactElement {
  const reduced = usePrefersReducedMotion();
  const [ref, inView] = useInViewOnce<HTMLSpanElement>({ disabled: reduced });
  const [count, setCount] = useState(reduced ? end : 0);

  useEffect(() => {
    if (!inView) return;

    if (reduced) {
      setCount(end);
      return;
    }

    let frame = 0;
    let startTime: number | null = null;

    const step = (timestamp: number) => {
      if (startTime === null) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);

      setCount(eased * end);

      if (progress < 1) {
        frame = window.requestAnimationFrame(step);
      } else {
        setCount(end);
      }
    };

    frame = window.requestAnimationFrame(step);

    return () => window.cancelAnimationFrame(frame);
  }, [inView, reduced, end, duration]);

  const formattedValue = count.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return (
    <span ref={ref} className={`tabular-nums inline-block ${className}`}>
      {prefix}
      {formattedValue}
      {suffix}
    </span>
  );
}
```

Three fixes come with the refactor: the observer logic now exists in one place, the animation is skipped under reduced motion, and the pending animation frame is cancelled on unmount, which the original never did.

- [ ] **Step 6: Verify the props contract did not change**

```bash
npm run typecheck
npm run lint
```

Expected: both pass. `FeaturesPage`, `DemoPage`, and `SolutionsPage` pass `end`, `decimals`, `prefix`, `suffix`, and `duration` to `AnimatedCounter` across ten call sites; typecheck failing here means the props contract drifted.

- [ ] **Step 7: Checkpoint — do not commit**

---

## Task 4: `Surface` primitive

**Files:**
- Create: `components/Surface.tsx`

**Interfaces:**
- Consumes: `.lp-card`, `.lp-surface`, `.lp-surface-sunk`, `.lp-surface-dark-raised`, `.lp-elev-*`, `.lp-card-interactive` from Task 1.
- Produces:
  - `SurfaceElevation = 'flat' | 'sm' | 'md' | 'lg'`
  - `SurfaceTone = 'surface' | 'sunk' | 'dark-raised'`
  - `Surface` with props `{ as?: ElementType; elevation?: SurfaceElevation; tone?: SurfaceTone; interactive?: boolean }` plus all `div` attributes. Defaults: `elevation="sm"`, `tone="surface"`, `interactive={false}`.

- [ ] **Step 1: Record the current duplication**

```bash
grep -rc "rounded-2xl border border-\[var(--landing-line)\]" src/features/landing/sections/
```

Expected: non-zero counts across several section files. This is the hand-copied card treatment `Surface` replaces.

- [ ] **Step 2: Create `components/Surface.tsx`**

```tsx
import type { ComponentPropsWithoutRef, ElementType, ReactElement } from 'react';
import { cn } from '@/lib/utils';

export type SurfaceElevation = 'flat' | 'sm' | 'md' | 'lg';
export type SurfaceTone = 'surface' | 'sunk' | 'dark-raised';

const elevationClass: Record<SurfaceElevation, string> = {
  flat: 'lp-elev-flat',
  sm: 'lp-elev-sm',
  md: 'lp-elev-md',
  lg: 'lp-elev-lg',
};

const toneClass: Record<SurfaceTone, string> = {
  surface: 'lp-surface',
  sunk: 'lp-surface-sunk',
  'dark-raised': 'lp-surface-dark-raised',
};

export interface SurfaceProps extends ComponentPropsWithoutRef<'div'> {
  as?: ElementType;
  elevation?: SurfaceElevation;
  tone?: SurfaceTone;
  /** Adds hover lift and border emphasis. */
  interactive?: boolean;
}

export function Surface({
  as = 'div',
  elevation = 'sm',
  tone = 'surface',
  interactive = false,
  className,
  children,
  ...props
}: SurfaceProps): ReactElement {
  const Component: ElementType = as;

  return (
    <Component
      className={cn(
        'lp-card',
        toneClass[tone],
        elevationClass[elevation],
        interactive && 'lp-card-interactive',
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
}

export default Surface;
```

- [ ] **Step 3: Typecheck and lint**

```bash
npm run typecheck
npm run lint
```

Expected: both pass.

- [ ] **Step 4: Checkpoint — do not commit**

---

## Task 5: Mock frame and shared parts

**Files:**
- Create: `components/product-ui/mockPrimitives.tsx`
- Create: `components/product-ui/MockWindow.tsx`

**Interfaces:**
- Consumes: nothing from earlier tasks beyond the token layer.
- Produces:
  - `MockChip({ label, className }: { label: string; className?: string })`
  - `MockAvatar({ initials, className }: { initials: string; className?: string })`
  - `MockBar({ pct, className }: { pct: number; className?: string })`
  - `MockField({ label, value }: { label: string; value: string })`
  - `MockWindow({ children, className }: { children: ReactNode; className?: string })`

- [ ] **Step 1: Confirm the directory does not exist yet**

```bash
ls src/features/landing/components/product-ui 2>&1
```

Expected: `No such file or directory`.

- [ ] **Step 2: Create `components/product-ui/mockPrimitives.tsx`**

Every one of these is decorative. They never receive `aria` attributes of their own because `MockWindow` marks the whole subtree `aria-hidden`.

```tsx
import type { ReactElement } from 'react';
import { cn } from '@/lib/utils';

export function MockChip({
  label,
  className,
}: {
  label: string;
  className?: string;
}): ReactElement {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-[3px] border px-1.5 py-0.5 text-[10px] font-bold leading-none',
        className
      )}
    >
      {label}
    </span>
  );
}

export function MockAvatar({
  initials,
  className,
}: {
  initials: string;
  className?: string;
}): ReactElement {
  return (
    <span
      className={cn(
        'inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full',
        'bg-[var(--lp-blue-100)] text-[9px] font-bold text-[var(--lp-blue-700)]',
        className
      )}
    >
      {initials}
    </span>
  );
}

export function MockBar({
  pct,
  className,
}: {
  pct: number;
  className?: string;
}): ReactElement {
  return (
    <span className={cn('block h-1 w-full rounded-full bg-[var(--lp-surface-sunk)]', className)}>
      <span
        className="block h-full rounded-full bg-[var(--lp-blue-500)]"
        style={{ width: `${Math.min(Math.max(pct, 0), 100)}%` }}
      />
    </span>
  );
}

export function MockField({
  label,
  value,
}: {
  label: string;
  value: string;
}): ReactElement {
  return (
    <div className="min-w-0">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--lp-ink-subtle)]">
        {label}
      </p>
      <p className="truncate text-[11px] font-semibold text-[var(--lp-ink)]">{value}</p>
    </div>
  );
}
```

- [ ] **Step 3: Create `components/product-ui/MockWindow.tsx`**

```tsx
import type { ReactElement, ReactNode } from 'react';
import { Search, LayoutGrid, Users, Briefcase, FileText, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

const railIcons = [LayoutGrid, Users, Briefcase, FileText, Settings];

export interface MockWindowProps {
  children: ReactNode;
  className?: string;
}

/**
 * The shared chrome around every product mockup. This frame — not the
 * screens inside it — is what makes the set read as one real product: the
 * same rail and the same top bar recur across all six tabs.
 *
 * The entire subtree is aria-hidden. These are div trees full of fabricated
 * data; a screen reader announcing them would present fiction as fact. The
 * accessible description is supplied by LandingProductVisual instead.
 */
export function MockWindow({ children, className }: MockWindowProps): ReactElement {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'overflow-hidden rounded-[20px] border border-[var(--lp-line)] bg-[var(--lp-surface)]',
        'lp-elev-lg',
        className
      )}
    >
      <div className="flex">
        {/* Left icon rail */}
        <div className="hidden w-11 shrink-0 flex-col items-center gap-4 border-r border-[var(--lp-line)] bg-[var(--lp-surface-sunk)] py-3 sm:flex">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[var(--lp-ink)] text-[10px] font-bold text-white">
            V
          </span>
          {railIcons.map((Icon, index) => (
            <Icon
              key={index}
              className={cn(
                'h-3.5 w-3.5',
                index === 0 ? 'text-[var(--lp-blue-500)]' : 'text-[var(--lp-ink-subtle)]'
              )}
            />
          ))}
        </div>

        <div className="min-w-0 flex-1">
          {/* Top bar */}
          <div className="flex items-center gap-3 border-b border-[var(--lp-line)] px-3 py-2">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[var(--lp-ink-subtle)]">
              <span>Workspace</span>
              <span aria-hidden="true">/</span>
              <span className="text-[var(--lp-ink)]">Revenue</span>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <span className="hidden items-center gap-1.5 rounded-[3px] border border-[var(--lp-line)] px-2 py-1 text-[10px] text-[var(--lp-ink-subtle)] md:inline-flex">
                <Search className="h-3 w-3" />
                Search
              </span>
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[var(--lp-blue-100)] text-[9px] font-bold text-[var(--lp-blue-700)]">
                TM
              </span>
            </div>
          </div>

          {/* Screen. Fixed min-width, cropped at the frame edge on small
              viewports rather than scaled until text is unreadable. This is
              acceptable only because the subtree is aria-hidden. */}
          <div className="relative overflow-hidden">
            <div className="min-w-[34rem] p-3">{children}</div>
            <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-[var(--lp-surface)] to-transparent sm:hidden" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default MockWindow;
```

- [ ] **Step 4: Typecheck and lint**

```bash
npm run typecheck
npm run lint
```

Expected: both pass. `lucide-react` already ships every icon imported here; no dependency is added.

- [ ] **Step 5: Checkpoint — do not commit**

---

## Task 6: Sample data

`content/productPreviewContent.ts` already exists, exports `previewPipelineItems`, and has matching `landing.preview.*` translation keys — but nothing imports it. This task revives and extends it rather than creating a new module.

**Files:**
- Modify: `content/productPreviewContent.ts` (47 lines, extended)

**Interfaces:**
- Consumes: nothing.
- Produces, in addition to the existing `PreviewPipelineItem` and `previewPipelineItems`:
  - `previewLeadRows: PreviewLeadRow[]` where `PreviewLeadRow = { id: string; name: string; company: string; source: string; status: string; owner: string }`
  - `previewQuoteLines: PreviewQuoteLine[]` where `PreviewQuoteLine = { id: string; product: string; qty: number; unitPrice: string; total: string }`
  - `previewApprovalSteps: PreviewApprovalStep[]` where `PreviewApprovalStep = { id: string; role: string; person: string; initials: string; state: 'approved' | 'pending' | 'waiting' }`
  - `previewContractRows: PreviewContractRow[]` where `PreviewContractRow = { id: string; code: string; account: string; value: string; endDate: string; status: string }`
  - `previewActivityRows: PreviewActivityRow[]` where `PreviewActivityRow = { id: string; kind: string; summary: string; when: string; initials: string }`

- [ ] **Step 1: Confirm the file is currently orphaned**

```bash
grep -rln "productPreviewContent" src/ | grep -v "content/productPreviewContent.ts"
```

Expected: no output. Nothing imports it today.

- [ ] **Step 2: Append the new data sets**

Keep the existing `PreviewPipelineItem` interface and `previewPipelineItems` array exactly as they are, and append:

```ts
export interface PreviewLeadRow {
  id: string;
  name: string;
  company: string;
  source: string;
  status: string;
  owner: string;
}

export const previewLeadRows: PreviewLeadRow[] = [
  { id: 'l1', name: 'Elena Marsh',   company: 'Northwind Logistics',  source: 'Web form',   status: 'NEW',         owner: 'TM' },
  { id: 'l2', name: 'Daniel Okafor', company: 'Helios Manufacturing', source: 'Referral',   status: 'CONTACTED',   owner: 'PL' },
  { id: 'l3', name: 'Sarah Jenkins', company: 'NovaStar Enterprise',  source: 'Trade show', status: 'QUALIFIED',   owner: 'TM' },
  { id: 'l4', name: 'Marco Rossi',   company: 'Adriatic Foods Group', source: 'Outbound',   status: 'CONTACTED',   owner: 'HN' },
  { id: 'l5', name: 'Priya Raman',   company: 'Cobalt Health Systems', source: 'Partner',    status: 'NEW',         owner: 'PL' },
];

export interface PreviewQuoteLine {
  id: string;
  product: string;
  qty: number;
  unitPrice: string;
  total: string;
}

export const previewQuoteLines: PreviewQuoteLine[] = [
  { id: 'q1', product: 'Platform licence — Standard', qty: 40, unitPrice: '4,200,000 ₫',  total: '168,000,000 ₫' },
  { id: 'q2', product: 'Data migration package',      qty: 1,  unitPrice: '96,000,000 ₫', total: '96,000,000 ₫' },
  { id: 'q3', product: 'Onboarding and training',     qty: 3,  unitPrice: '18,000,000 ₫', total: '54,000,000 ₫' },
  { id: 'q4', product: 'Priority support — 12 months', qty: 1, unitPrice: '42,000,000 ₫', total: '42,000,000 ₫' },
];

export interface PreviewApprovalStep {
  id: string;
  role: string;
  person: string;
  initials: string;
  state: 'approved' | 'pending' | 'waiting';
}

export const previewApprovalSteps: PreviewApprovalStep[] = [
  { id: 'a1', role: 'Sales manager',    person: 'Thanh Mai',     initials: 'TM', state: 'approved' },
  { id: 'a2', role: 'Finance review',   person: 'Peter Lund',    initials: 'PL', state: 'pending'  },
  { id: 'a3', role: 'Commercial director', person: 'Hai Nguyen', initials: 'HN', state: 'waiting'  },
];

export interface PreviewContractRow {
  id: string;
  code: string;
  account: string;
  value: string;
  endDate: string;
  status: string;
}

export const previewContractRows: PreviewContractRow[] = [
  { id: 'c1', code: 'CTR-2026-0148', account: 'Pacific Rim Real Estate', value: '1,250,000,000 ₫', endDate: '2027-03-31', status: 'ACTIVE' },
  { id: 'c2', code: 'CTR-2026-0151', account: 'NovaStar Enterprise',     value: '780,000,000 ₫',   endDate: '2026-12-15', status: 'ACTIVE' },
  { id: 'c3', code: 'CTR-2025-0932', account: 'Apex Health Logistics',   value: '3,400,000,000 ₫', endDate: '2026-09-30', status: 'RENEWAL' },
  { id: 'c4', code: 'CTR-2025-0871', account: 'Helios Manufacturing',    value: '520,000,000 ₫',   endDate: '2026-08-31', status: 'EXPIRING' },
];

export interface PreviewActivityRow {
  id: string;
  kind: string;
  summary: string;
  when: string;
  initials: string;
}

export const previewActivityRows: PreviewActivityRow[] = [
  { id: 'v1', kind: 'Call',    summary: 'Discovery call with procurement',   when: '2 days ago', initials: 'TM' },
  { id: 'v2', kind: 'Meeting', summary: 'Solution walkthrough — 6 attendees', when: '5 days ago', initials: 'PL' },
  { id: 'v3', kind: 'Email',   summary: 'Sent revised commercial scope',      when: '1 week ago', initials: 'TM' },
];
```

The `status` values in `previewLeadRows` (`NEW`, `CONTACTED`, `QUALIFIED`) must match keys in `LeadStatusConfigMap`, because Task 8 looks the badge styling up by that string.

- [ ] **Step 3: Verify the data is English-only and typed**

```bash
npm run verify:english-only
npm run typecheck
npm run lint
```

Expected: all three pass. The `₫` symbol is a currency sign, not a locale artifact, and matches the formatting already present in `previewPipelineItems`.

- [ ] **Step 4: Checkpoint — do not commit**

---

## Task 7: `MockPipelineBoard`

The highest-value mock: it serves both the hero and the `opportunity` workflow stage.

**Files:**
- Create: `components/product-ui/MockPipelineBoard.tsx`

**Interfaces:**
- Consumes: `MockChip`, `MockAvatar`, `MockBar` from Task 5; `previewPipelineItems` from Task 6; `OpportunityStageConfigMap` from `@/config/crmStatusConfig`.
- Produces: `MockPipelineBoard()` taking no props.

- [ ] **Step 1: Read the real stage map before writing anything**

```bash
sed -n '117,148p' src/config/crmStatusConfig.tsx
```

The column keys below are the real ones and must not be invented: `PROSPECTING`, `QUALIFICATION`, `PROPOSAL`, `NEGOTIATION`, `CLOSED_WON`, `CLOSED_LOST`. Reusing them is what stops the mock drifting into a stage vocabulary the product does not have.

Note also that `StatusBadgeConfig.className` already carries `rounded-[3px] text-[11px] uppercase tracking-wider px-1.5 py-0.5 border-0`. `MockChip` passes it through `cn()`, so `twMerge` resolves the overlap with `MockChip`'s own base classes in favour of the map's — which is the intended precedence.

- [ ] **Step 2: Create `components/product-ui/MockPipelineBoard.tsx`**

```tsx
import type { ReactElement } from 'react';
import { MockAvatar, MockBar, MockChip } from './mockPrimitives';
import { previewPipelineItems } from '../../content/productPreviewContent';
import { OpportunityStageConfigMap } from '@/config/crmStatusConfig';

/** Stage keys are the product's own, read from OpportunityStageConfigMap.
 *  `cards` is how many sample records this column shows; the remainder
 *  render as skeletons so the board reads as a full pipeline without
 *  inventing more records than the data module provides. */
const columns = [
  { stage: 'PROSPECTING',   count: 8, amount: '4.1B ₫', cards: 2 },
  { stage: 'QUALIFICATION', count: 6, amount: '3.6B ₫', cards: 1 },
  { stage: 'PROPOSAL',      count: 5, amount: '2.9B ₫', cards: 0 },
  { stage: 'NEGOTIATION',   count: 3, amount: '1.8B ₫', cards: 0 },
  { stage: 'CLOSED_WON',    count: 4, amount: '2.2B ₫', cards: 0 },
] as const;

export function MockPipelineBoard(): ReactElement {
  // Slice offsets are resolved before render output so nothing is mutated
  // inside the JSX map.
  let offset = 0;
  const cardsByColumn = columns.map((column) => {
    const slice = previewPipelineItems.slice(offset, offset + column.cards);
    offset += column.cards;
    return slice;
  });

  return (
    <div className="grid grid-cols-5 gap-2">
      {columns.map((column, columnIndex) => {
        const cards = cardsByColumn[columnIndex];
        const stage = OpportunityStageConfigMap[column.stage];

        return (
          <div key={column.stage} className="min-w-0">
            <div className="mb-2 flex items-baseline justify-between gap-1">
              <MockChip label={stage.label} className={stage.className} />
              <span className="text-[9px] font-semibold text-[var(--lp-ink-subtle)]">
                {column.count}
              </span>
            </div>
            <p className="mb-2 text-[9px] font-semibold tabular-nums text-[var(--lp-ink-subtle)]">
              {column.amount}
            </p>

            <div className="space-y-1.5">
              {cards.map((card, cardIndex) => (
                <div
                  key={card.id}
                  className="lp-mock-card rounded-[4px] border border-[var(--lp-line)] bg-[var(--lp-surface)] p-2 shadow-[0_1px_2px_rgba(7,24,43,.06)]"
                  style={{ animationDelay: `${(columnIndex * 2 + cardIndex) * 90}ms` }}
                >
                  <p className="truncate text-[11px] font-bold leading-tight text-[var(--lp-ink)]">
                    {card.accountName}
                  </p>
                  <p className="mt-1 truncate text-[9px] text-[var(--lp-ink-subtle)]">
                    {card.industry}
                  </p>
                  <p className="mt-1.5 text-[11px] font-bold tabular-nums text-[var(--lp-ink)]">
                    {card.amount}
                  </p>
                  <MockBar pct={Number.parseInt(card.probability, 10)} className="mt-1.5" />
                  <div className="mt-2 flex items-center justify-between gap-1">
                    <MockChip
                      label={card.probability}
                      className="border-[var(--lp-blue-200)] bg-[var(--lp-blue-50)] text-[var(--lp-blue-700)]"
                    />
                    <MockAvatar initials={card.contactPerson.slice(0, 2).toUpperCase()} />
                  </div>
                </div>
              ))}

              {Array.from({ length: Math.max(0, 2 - cards.length) }).map((_, index) => (
                <div
                  key={`skeleton-${index}`}
                  className="rounded-[4px] border border-dashed border-[var(--lp-line)] bg-[var(--lp-surface-sunk)] p-2"
                >
                  <span className="block h-1.5 w-3/4 rounded-full bg-[var(--lp-line)]" />
                  <span className="mt-1.5 block h-1.5 w-1/2 rounded-full bg-[var(--lp-line)]" />
                  <span className="mt-2 block h-1.5 w-2/3 rounded-full bg-[var(--lp-line)]" />
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default MockPipelineBoard;
```

- [ ] **Step 3: Add the card entrance animation to `landing.css`**

Append to the Reveal block of `landing.css`. The hero sits above the fold, so its motion runs on mount rather than through an observer. The existing `prefers-reduced-motion` block already collapses `animation-duration` to `0.01ms`, and because the resting state here is `opacity: 1` with no transform, a collapsed animation leaves the card correctly visible.

```css
.landing-theme .lp-mock-card {
  animation: lp-mock-card-in var(--lp-dur-slow) var(--lp-ease) both;
}

@keyframes lp-mock-card-in {
  from { opacity: 0; transform: translateY(8px) scale(.98); }
  to   { opacity: 1; transform: none; }
}
```

- [ ] **Step 4: Typecheck and lint**

```bash
npm run typecheck
npm run lint
```

Expected: both pass.

- [ ] **Step 5: Checkpoint — do not commit**

---

## Task 8: `MockLeadTable` and `MockContractList`

Two screens sharing the table archetype, so a reviewer can judge the table treatment once.

**Files:**
- Create: `components/product-ui/MockLeadTable.tsx`
- Create: `components/product-ui/MockContractList.tsx`

**Interfaces:**
- Consumes: `MockChip`, `MockAvatar` from Task 5; `previewLeadRows`, `previewContractRows` from Task 6; `LeadStatusConfigMap` from `@/config/crmStatusConfig`.
- Produces: `MockLeadTable()` and `MockContractList()`, both taking no props.

- [ ] **Step 1: Create `components/product-ui/MockLeadTable.tsx`**

```tsx
import type { ReactElement } from 'react';
import { MockAvatar, MockChip } from './mockPrimitives';
import { previewLeadRows } from '../../content/productPreviewContent';
import { LeadStatusConfigMap } from '@/config/crmStatusConfig';

const headers = ['Name', 'Company', 'Source', 'Status', 'Owner'];

export function MockLeadTable(): ReactElement {
  return (
    <div className="overflow-hidden rounded-[4px] border border-[var(--lp-line)]">
      <div className="grid grid-cols-[1.2fr_1.4fr_.9fr_.9fr_.4fr] gap-2 border-b border-[var(--lp-line)] bg-[var(--lp-surface-sunk)] px-2.5 py-1.5">
        {headers.map((header) => (
          <span
            key={header}
            className="text-[9px] font-bold uppercase tracking-wider text-[var(--lp-ink-subtle)]"
          >
            {header}
          </span>
        ))}
      </div>

      {previewLeadRows.map((row) => {
        const badge = LeadStatusConfigMap[row.status];

        return (
          <div
            key={row.id}
            className="grid grid-cols-[1.2fr_1.4fr_.9fr_.9fr_.4fr] items-center gap-2 border-b border-[var(--lp-line)] px-2.5 py-2 last:border-b-0"
          >
            <span className="truncate text-[11px] font-semibold text-[var(--lp-ink)]">
              {row.name}
            </span>
            <span className="truncate text-[11px] text-[var(--lp-ink-muted)]">
              {row.company}
            </span>
            <span className="truncate text-[10px] text-[var(--lp-ink-subtle)]">
              {row.source}
            </span>
            <span>
              <MockChip
                label={row.status}
                className={badge?.className ?? 'border-[var(--lp-line)] bg-[var(--lp-surface-sunk)] text-[var(--lp-ink-muted)]'}
              />
            </span>
            <span>
              <MockAvatar initials={row.owner} />
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default MockLeadTable;
```

`LeadStatusConfigMap` is typed `Record<string, StatusBadgeConfig>`, so an unknown key returns `undefined` at runtime while typechecking clean. The `??` fallback covers that.

- [ ] **Step 2: Create `components/product-ui/MockContractList.tsx`**

```tsx
import type { ReactElement } from 'react';
import { MockChip } from './mockPrimitives';
import { previewContractRows } from '../../content/productPreviewContent';

const headers = ['Contract', 'Account', 'Value', 'Ends', 'Status'];

const statusClass: Record<string, string> = {
  ACTIVE: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  RENEWAL: 'border-blue-200 bg-blue-50 text-blue-700',
  EXPIRING: 'border-amber-200 bg-amber-50 text-amber-700',
};

export function MockContractList(): ReactElement {
  return (
    <div className="overflow-hidden rounded-[4px] border border-[var(--lp-line)]">
      <div className="grid grid-cols-[1fr_1.3fr_.9fr_.7fr_.7fr] gap-2 border-b border-[var(--lp-line)] bg-[var(--lp-surface-sunk)] px-2.5 py-1.5">
        {headers.map((header) => (
          <span
            key={header}
            className="text-[9px] font-bold uppercase tracking-wider text-[var(--lp-ink-subtle)]"
          >
            {header}
          </span>
        ))}
      </div>

      {previewContractRows.map((row) => (
        <div
          key={row.id}
          className="grid grid-cols-[1fr_1.3fr_.9fr_.7fr_.7fr] items-center gap-2 border-b border-[var(--lp-line)] px-2.5 py-2 last:border-b-0"
        >
          <span className="truncate font-mono text-[10px] font-semibold text-[var(--lp-blue-700)]">
            {row.code}
          </span>
          <span className="truncate text-[11px] font-semibold text-[var(--lp-ink)]">
            {row.account}
          </span>
          <span className="truncate text-[11px] font-bold tabular-nums text-[var(--lp-ink)]">
            {row.value}
          </span>
          <span className="truncate text-[10px] tabular-nums text-[var(--lp-ink-subtle)]">
            {row.endDate}
          </span>
          <span>
            <MockChip label={row.status} className={statusClass[row.status]} />
          </span>
        </div>
      ))}
    </div>
  );
}

export default MockContractList;
```

The contract status palette is written locally because `crmStatusConfig.tsx` has no contract-status map. The three classes follow the lifecycle palette documented in `AGENTS.md`: emerald for active, blue for in-progress, amber for at-risk.

- [ ] **Step 3: Typecheck and lint**

```bash
npm run typecheck
npm run lint
```

Expected: both pass.

- [ ] **Step 4: Checkpoint — do not commit**

---

## Task 9: `MockAccountRecord` and `MockApprovalFlow`

Two screens sharing the record-and-timeline archetype.

**Files:**
- Create: `components/product-ui/MockAccountRecord.tsx`
- Create: `components/product-ui/MockApprovalFlow.tsx`

**Interfaces:**
- Consumes: `MockAvatar`, `MockChip`, `MockField` from Task 5; `previewActivityRows`, `previewApprovalSteps` from Task 6; `LifecycleStageConfigMap` from `@/config/crmStatusConfig`.
- Produces: `MockAccountRecord()` and `MockApprovalFlow()`, both taking no props.

- [ ] **Step 1: Create `components/product-ui/MockAccountRecord.tsx`**

```tsx
import type { ReactElement } from 'react';
import { MockAvatar, MockChip, MockField } from './mockPrimitives';
import { previewActivityRows } from '../../content/productPreviewContent';
import { LifecycleStageConfigMap } from '@/config/crmStatusConfig';

const tabs = ['Overview', 'Contacts', 'Opportunities', 'Activities', 'Contracts'];

export function MockAccountRecord(): ReactElement {
  const badge = LifecycleStageConfigMap.CUSTOMER;

  return (
    <div className="space-y-2">
      <div className="rounded-[4px] border border-[var(--lp-line)] p-2.5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-[13px] font-bold text-[var(--lp-ink)]">
              Pacific Rim Real Estate Group
            </p>
            <p className="mt-0.5 truncate text-[10px] text-[var(--lp-ink-subtle)]">
              Real Estate &amp; Construction · 1,200 employees
            </p>
          </div>
          <MockChip
            label="CUSTOMER"
            className={badge?.className ?? 'border-emerald-200 bg-emerald-50 text-emerald-700'}
          />
        </div>

        <div className="mt-2.5 grid grid-cols-4 gap-2.5">
          <MockField label="Owner" value="Thanh Mai" />
          <MockField label="Open value" value="1,250,000,000 ₫" />
          <MockField label="Contacts" value="14" />
          <MockField label="Region" value="South" />
        </div>
      </div>

      <div className="flex gap-3 border-b border-[var(--lp-line)] px-0.5">
        {tabs.map((tab, index) => (
          <span
            key={tab}
            className={
              index === 3
                ? 'border-b-2 border-[var(--lp-blue-500)] pb-1.5 text-[10px] font-bold text-[var(--lp-blue-600)]'
                : 'pb-1.5 text-[10px] font-semibold text-[var(--lp-ink-subtle)]'
            }
          >
            {tab}
          </span>
        ))}
      </div>

      <div className="space-y-1.5">
        {previewActivityRows.map((row) => (
          <div key={row.id} className="flex items-start gap-2 rounded-[4px] border border-[var(--lp-line)] p-2">
            <MockAvatar initials={row.initials} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[11px] font-semibold text-[var(--lp-ink)]">
                {row.summary}
              </p>
              <p className="mt-0.5 text-[9px] text-[var(--lp-ink-subtle)]">
                {row.kind} · {row.when}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MockAccountRecord;
```

- [ ] **Step 2: Create `components/product-ui/MockApprovalFlow.tsx`**

```tsx
import type { ReactElement } from 'react';
import { Check, Clock, Minus } from 'lucide-react';
import { MockAvatar } from './mockPrimitives';
import { previewApprovalSteps } from '../../content/productPreviewContent';

const stateStyle = {
  approved: {
    Icon: Check,
    dot: 'bg-emerald-500 text-white',
    label: 'Approved',
    labelClass: 'text-emerald-700',
  },
  pending: {
    Icon: Clock,
    dot: 'bg-[var(--lp-blue-500)] text-white',
    label: 'Awaiting decision',
    labelClass: 'text-[var(--lp-blue-700)]',
  },
  waiting: {
    Icon: Minus,
    dot: 'bg-[var(--lp-surface-sunk)] text-[var(--lp-ink-subtle)]',
    label: 'Not started',
    labelClass: 'text-[var(--lp-ink-subtle)]',
  },
} as const;

export function MockApprovalFlow(): ReactElement {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between rounded-[4px] border border-[var(--lp-line)] bg-[var(--lp-surface-sunk)] px-2.5 py-2">
        <span className="font-mono text-[10px] font-bold text-[var(--lp-blue-700)]">
          QUO-2026-0311
        </span>
        <span className="text-[11px] font-bold tabular-nums text-[var(--lp-ink)]">
          360,000,000 ₫
        </span>
      </div>

      <ol className="relative space-y-2 pl-1">
        {previewApprovalSteps.map((step, index) => {
          const style = stateStyle[step.state];
          const isLast = index === previewApprovalSteps.length - 1;

          return (
            <li key={step.id} className="relative flex items-center gap-2.5">
              {!isLast ? (
                <span className="absolute left-[10px] top-6 h-[calc(100%-.5rem)] w-px bg-[var(--lp-line)]" />
              ) : null}

              <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${style.dot}`}>
                <style.Icon className="h-3 w-3" />
              </span>

              <div className="flex min-w-0 flex-1 items-center gap-2 rounded-[4px] border border-[var(--lp-line)] p-2">
                <MockAvatar initials={step.initials} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[11px] font-semibold text-[var(--lp-ink)]">
                    {step.person}
                  </p>
                  <p className="truncate text-[9px] text-[var(--lp-ink-subtle)]">{step.role}</p>
                </div>
                <span className={`shrink-0 text-[9px] font-bold ${style.labelClass}`}>
                  {style.label}
                </span>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export default MockApprovalFlow;
```

- [ ] **Step 3: Typecheck and lint**

```bash
npm run typecheck
npm run lint
```

Expected: both pass.

- [ ] **Step 4: Checkpoint — do not commit**

---

## Task 10: `MockQuoteEditor` and the screen registry

**Files:**
- Create: `components/product-ui/MockQuoteEditor.tsx`
- Create: `components/product-ui/index.ts`

**Interfaces:**
- Consumes: `MockChip` from Task 5; `previewQuoteLines` from Task 6; `QuoteStatusConfigMap` from `@/config/crmStatusConfig`; all six mock screens from Tasks 7 to 10.
- Produces:
  - `MockScreenId = 'pipeline' | 'leads' | 'account' | 'quote' | 'approval' | 'contract'`
  - `mockScreens: Record<MockScreenId, ComponentType>`
  - Re-exports of `MockWindow` and every screen component.

- [ ] **Step 1: Create `components/product-ui/MockQuoteEditor.tsx`**

```tsx
import type { ReactElement } from 'react';
import { MockChip } from './mockPrimitives';
import { previewQuoteLines } from '../../content/productPreviewContent';
import { QuoteStatusConfigMap } from '@/config/crmStatusConfig';

export function MockQuoteEditor(): ReactElement {
  const badge = QuoteStatusConfigMap.DRAFT;

  return (
    <div className="grid grid-cols-[1.9fr_1fr] gap-2">
      <div className="min-w-0 overflow-hidden rounded-[4px] border border-[var(--lp-line)]">
        <div className="grid grid-cols-[2.2fr_.4fr_.9fr_.9fr] gap-2 border-b border-[var(--lp-line)] bg-[var(--lp-surface-sunk)] px-2.5 py-1.5">
          {['Product', 'Qty', 'Unit price', 'Total'].map((header) => (
            <span
              key={header}
              className="text-[9px] font-bold uppercase tracking-wider text-[var(--lp-ink-subtle)]"
            >
              {header}
            </span>
          ))}
        </div>

        {previewQuoteLines.map((line) => (
          <div
            key={line.id}
            className="grid grid-cols-[2.2fr_.4fr_.9fr_.9fr] items-center gap-2 border-b border-[var(--lp-line)] px-2.5 py-2 last:border-b-0"
          >
            <span className="truncate text-[11px] font-semibold text-[var(--lp-ink)]">
              {line.product}
            </span>
            <span className="text-[10px] tabular-nums text-[var(--lp-ink-muted)]">
              {line.qty}
            </span>
            <span className="truncate text-[10px] tabular-nums text-[var(--lp-ink-muted)]">
              {line.unitPrice}
            </span>
            <span className="truncate text-[11px] font-bold tabular-nums text-[var(--lp-ink)]">
              {line.total}
            </span>
          </div>
        ))}
      </div>

      <div className="rounded-[4px] border border-[var(--lp-line)] p-2.5">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] font-bold text-[var(--lp-blue-700)]">
            QUO-2026-0311
          </span>
          <MockChip
            label="DRAFT"
            className={badge?.className ?? 'border-[var(--lp-line)] bg-[var(--lp-surface-sunk)] text-[var(--lp-ink-muted)]'}
          />
        </div>

        <dl className="mt-3 space-y-1.5">
          {[
            ['Subtotal', '360,000,000 ₫'],
            ['Discount', '-18,000,000 ₫'],
            ['VAT 10%', '34,200,000 ₫'],
          ].map(([term, value]) => (
            <div key={term} className="flex items-baseline justify-between gap-2">
              <dt className="text-[10px] text-[var(--lp-ink-subtle)]">{term}</dt>
              <dd className="text-[10px] font-semibold tabular-nums text-[var(--lp-ink-muted)]">
                {value}
              </dd>
            </div>
          ))}
          <div className="flex items-baseline justify-between gap-2 border-t border-[var(--lp-line)] pt-1.5">
            <dt className="text-[10px] font-bold text-[var(--lp-ink)]">Total</dt>
            <dd className="text-[12px] font-bold tabular-nums text-[var(--lp-ink)]">
              376,200,000 ₫
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}

export default MockQuoteEditor;
```

- [ ] **Step 2: Create `components/product-ui/index.ts`**

```ts
import type { ComponentType } from 'react';
import { MockPipelineBoard } from './MockPipelineBoard';
import { MockLeadTable } from './MockLeadTable';
import { MockAccountRecord } from './MockAccountRecord';
import { MockQuoteEditor } from './MockQuoteEditor';
import { MockApprovalFlow } from './MockApprovalFlow';
import { MockContractList } from './MockContractList';

export type MockScreenId =
  | 'pipeline'
  | 'leads'
  | 'account'
  | 'quote'
  | 'approval'
  | 'contract';

/**
 * Typed as a total Record, so adding a MockScreenId without adding its
 * component is a compile error rather than a blank panel in the browser.
 * This is the structural check that replaces a runtime test.
 */
export const mockScreens: Record<MockScreenId, ComponentType> = {
  pipeline: MockPipelineBoard,
  leads: MockLeadTable,
  account: MockAccountRecord,
  quote: MockQuoteEditor,
  approval: MockApprovalFlow,
  contract: MockContractList,
};

export { MockWindow } from './MockWindow';
export {
  MockPipelineBoard,
  MockLeadTable,
  MockAccountRecord,
  MockQuoteEditor,
  MockApprovalFlow,
  MockContractList,
};
```

- [ ] **Step 3: Prove the registry is exhaustive**

Temporarily add `| 'nonexistent'` to the `MockScreenId` union, then run:

```bash
npm run typecheck
```

Expected: FAIL with a message reporting that `'nonexistent'` is missing from the `Record<MockScreenId, ComponentType>`. **Remove the temporary union member and re-run to confirm it passes.** This is the deliberate red-then-green cycle for this task; the repository's no-test rule means `tsc` is the only test runner available.

- [ ] **Step 4: Typecheck and lint**

```bash
npm run typecheck
npm run lint
```

Expected: both pass.

- [ ] **Step 5: Checkpoint — do not commit**

---

## Task 11: Retire the missing images

This is the task that closes defect 1.1. After it, no reference to `/landing/product/` remains anywhere in the source.

**Files:**
- Modify: `content/homeProductEvidence.ts`
- Modify: `components/LandingProductVisual.tsx`

**Interfaces:**
- Consumes: `MockScreenId`, `mockScreens`, `MockWindow` from Task 10.
- Produces:
  - `LandingProductScreen = { id: string; screen: MockScreenId; altKey: string; captionKey: string; sourceRoute: string; evidenceKind: EvidenceKind }`
  - `homeProductAssets: Record<string, LandingProductScreen>` — name kept so `HeroSection` and `ProductWorkflowSection` need no import changes
  - `homeWorkflowStages` unchanged in shape
  - `LandingProductVisual` props change to `{ asset: LandingProductScreen; priority?: boolean; className?: string }`; `priority` is retained for call-site compatibility and is now unused

- [ ] **Step 1: Record the current failure**

```bash
grep -rn "landing/product" src/ | wc -l
ls -A public/landing/product/ | wc -l
```

Expected: a non-zero count of references and `0` files on disk. Every one of those references is a broken image today. Both numbers must be `0` and `0` by Step 4.

- [ ] **Step 2: Rewrite `content/homeProductEvidence.ts`**

```ts
import type { MockScreenId } from '../components/product-ui';

export type EvidenceKind = 'real-screen' | 'illustrative-data';

export interface LandingProductScreen {
  id: string;
  screen: MockScreenId;
  altKey: string;
  captionKey: string;
  /** The application route this mockup imitates. Documentation only. */
  sourceRoute: string;
  evidenceKind: EvidenceKind;
}

export const homeProductAssets = {
  hero: {
    id: 'hero',
    screen: 'pipeline',
    altKey: 'landing.home.workflow.opportunityTitle',
    captionKey: 'landing.home.hero.visualCaption',
    sourceRoute: '/app/crm/opportunities',
    evidenceKind: 'illustrative-data',
  },
  lead: {
    id: 'lead',
    screen: 'leads',
    altKey: 'landing.home.workflow.leadTitle',
    captionKey: 'landing.home.workflow.illustrativeLabel',
    sourceRoute: '/app/crm/leads',
    evidenceKind: 'illustrative-data',
  },
  account: {
    id: 'account',
    screen: 'account',
    altKey: 'landing.home.workflow.accountTitle',
    captionKey: 'landing.home.workflow.illustrativeLabel',
    sourceRoute: '/app/crm/accounts/:id',
    evidenceKind: 'illustrative-data',
  },
  opportunity: {
    id: 'opportunity',
    screen: 'pipeline',
    altKey: 'landing.home.workflow.opportunityTitle',
    captionKey: 'landing.home.workflow.illustrativeLabel',
    sourceRoute: '/app/crm/opportunities',
    evidenceKind: 'illustrative-data',
  },
  quote: {
    id: 'quote',
    screen: 'quote',
    altKey: 'landing.home.workflow.quoteTitle',
    captionKey: 'landing.home.workflow.illustrativeLabel',
    sourceRoute: '/app/sales/quotes',
    evidenceKind: 'illustrative-data',
  },
  approval: {
    id: 'approval',
    screen: 'approval',
    altKey: 'landing.home.workflow.approvalTitle',
    captionKey: 'landing.home.workflow.illustrativeLabel',
    sourceRoute: '/app/sales/quotes',
    evidenceKind: 'illustrative-data',
  },
  contract: {
    id: 'contract',
    screen: 'contract',
    altKey: 'landing.home.workflow.contractTitle',
    captionKey: 'landing.home.workflow.illustrativeLabel',
    sourceRoute: '/app/sales/contracts',
    evidenceKind: 'illustrative-data',
  },
} as const satisfies Record<string, LandingProductScreen>;

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
  { id: 'lead',        labelKey: 'landing.home.workflow.leadLabel',        titleKey: 'landing.home.workflow.leadTitle',        descriptionKey: 'landing.home.workflow.leadDescription',        assetId: 'lead' },
  { id: 'account',     labelKey: 'landing.home.workflow.accountLabel',     titleKey: 'landing.home.workflow.accountTitle',     descriptionKey: 'landing.home.workflow.accountDescription',     assetId: 'account' },
  { id: 'opportunity', labelKey: 'landing.home.workflow.opportunityLabel', titleKey: 'landing.home.workflow.opportunityTitle', descriptionKey: 'landing.home.workflow.opportunityDescription', assetId: 'opportunity' },
  { id: 'quote',       labelKey: 'landing.home.workflow.quoteLabel',       titleKey: 'landing.home.workflow.quoteTitle',       descriptionKey: 'landing.home.workflow.quoteDescription',       assetId: 'quote' },
  { id: 'approval',    labelKey: 'landing.home.workflow.approvalLabel',    titleKey: 'landing.home.workflow.approvalTitle',    descriptionKey: 'landing.home.workflow.approvalDescription',    assetId: 'approval' },
  { id: 'contract',    labelKey: 'landing.home.workflow.contractLabel',    titleKey: 'landing.home.workflow.contractTitle',    descriptionKey: 'landing.home.workflow.contractDescription',    assetId: 'contract' },
];
```

The `LandingProductAsset` type name is replaced by `LandingProductScreen`. `homeProductAssets` keeps its old name so `HeroSection` and `ProductWorkflowSection` import statements stay valid until Tasks 12 and 15 touch them.

- [ ] **Step 3: Rewrite `components/LandingProductVisual.tsx`**

```tsx
import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { MockWindow, mockScreens } from './product-ui';
import type { LandingProductScreen } from '../content/homeProductEvidence';

export interface LandingProductVisualProps {
  asset: LandingProductScreen;
  /** Retained for call-site compatibility. No longer meaningful now that
   *  the visual is rendered rather than fetched. */
  priority?: boolean;
  className?: string;
}

export function LandingProductVisual({
  asset,
  className,
}: LandingProductVisualProps): ReactElement {
  const { t } = useTranslation();
  const Screen = mockScreens[asset.screen];

  return (
    <figure className={className}>
      <MockWindow>
        <Screen />
      </MockWindow>

      {/* The mock itself is aria-hidden, so this carries the accessible
          description that the old <img alt> used to provide. */}
      <span className="sr-only">{t(asset.altKey)}</span>

      <figcaption className="lp-caption mt-3">{t(asset.captionKey)}</figcaption>
    </figure>
  );
}

export default LandingProductVisual;
```

- [ ] **Step 4: Prove the broken references are gone**

```bash
grep -rn "landing/product" src/
grep -rn "\.webp" src/features/landing/
```

Expected: no output from either. Defect 1.1 is closed. Also confirm the `sr-only` utility exists — it is a Tailwind built-in, so no CSS addition is required:

```bash
grep -rn "sr-only" src/components/ui/ | head -3
```

Expected: existing usages, confirming the class is in play elsewhere in the codebase.

- [ ] **Step 5: Typecheck and lint**

```bash
npm run typecheck
npm run lint
```

Expected: both pass. If `priority` was removed rather than kept optional, `HeroSection` fails to compile here — that is the guard working.

- [ ] **Step 6: Checkpoint — do not commit**

---

## Task 12: Hero section

**Files:**
- Modify: `sections/home/HeroSection.tsx` (full rewrite, 40 lines)

**Interfaces:**
- Consumes: `LandingSection` with `tone`/`size` from Task 2; `Reveal` from Task 3; `LandingProductVisual` from Task 11; `homeProductAssets` from Task 11.
- Produces: nothing consumed by later tasks.

- [ ] **Step 1: Rewrite `sections/home/HeroSection.tsx`**

The current `lg:col-span-5` split gives the headline about 32rem inside an 80rem container, which wraps `--lp-text-display` to four or five lines. The text block moves to a full-measure column with the visual beneath it.

```tsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { LandingSection } from '../../components/LandingSection';
import { LandingProductVisual } from '../../components/LandingProductVisual';
import { Reveal } from '../../components/Reveal';
import { homeProductAssets } from '../../content/homeProductEvidence';

export const HeroSection: React.FC = () => {
  const { t } = useTranslation();

  return (
    <LandingSection id="hero" tone="mesh" size="tall" className="overflow-hidden">
      <div className="max-w-[46rem]">
        <Reveal>
          <p className="inline-flex items-center rounded-full border border-[var(--lp-blue-200)] bg-[var(--lp-blue-50)] px-3 py-1 text-xs font-bold uppercase tracking-[.09em] text-[var(--lp-blue-700)]">
            {t('landing.home.hero.kicker')}
          </p>
        </Reveal>

        <Reveal delay={60}>
          <h1 className="lp-display mt-5">{t('landing.home.hero.title')}</h1>
        </Reveal>

        <Reveal delay={120}>
          <p className="lp-lead mt-6 max-w-[38rem]">
            {t('landing.home.hero.description')}
          </p>
        </Reveal>

        <Reveal delay={180}>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a href="#demo" className="landing-primary-action">
              {t('landing.home.hero.primaryCta')}
            </a>
            <a href="#features" className="landing-secondary-action">
              {t('landing.home.hero.secondaryCta')}
            </a>
          </div>
        </Reveal>
      </div>

      {/* Soft glow beneath the mockup, purely decorative. */}
      <div className="relative mt-14">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-8 bottom-0 top-12 rounded-[40px] bg-[var(--lp-blue-400)] opacity-[.14] blur-3xl"
        />
        <Reveal delay={240} className="relative">
          <LandingProductVisual asset={homeProductAssets.hero} priority />
        </Reveal>
      </div>
    </LandingSection>
  );
};

export default HeroSection;
```

- [ ] **Step 2: Typecheck and lint**

```bash
npm run typecheck
npm run lint
```

Expected: both pass.

- [ ] **Step 3: Checkpoint — do not commit**

---

## Task 13: Capability proof strip

The translation key `landing.home.proof.label` reads "One connected operating flow" while the current markup renders five disconnected boxes. This task makes the design agree with its own copy.

**Files:**
- Modify: `sections/home/CapabilityProofSection.tsx` (full rewrite, 25 lines)
- Modify: `content/homeContent.ts` (add an icon id per proof item)
- Modify: `../../i18n/locales/en/translation.json` (one new key)

**Interfaces:**
- Consumes: `LandingSection` from Task 2.
- Produces: `capabilityProofItems` gains an `iconId` field typed `CapabilityProofIconId = 'data' | 'pipeline' | 'quote' | 'contract' | 'access'`.

- [ ] **Step 1: Add the accessible-name key to the translation bundle**

In `src/i18n/locales/en/translation.json`, inside `landing.home.proof`, add:

```json
"flowLabel": "Connected operating flow across the sales lifecycle"
```

- [ ] **Step 2: Add icon ids to `content/homeContent.ts`**

Replace the `capabilityProofItems` export with:

```ts
export type CapabilityProofIconId =
  | 'data'
  | 'pipeline'
  | 'quote'
  | 'contract'
  | 'access';

export const capabilityProofItems = [
  { id: 'customer-data', iconId: 'data',     labelKey: 'landing.home.proof.customerData' },
  { id: 'pipeline',      iconId: 'pipeline', labelKey: 'landing.home.proof.pipeline' },
  { id: 'quotes',        iconId: 'quote',    labelKey: 'landing.home.proof.quotes' },
  { id: 'contracts',     iconId: 'contract', labelKey: 'landing.home.proof.contracts' },
  { id: 'access',        iconId: 'access',   labelKey: 'landing.home.proof.access' },
] as const satisfies ReadonlyArray<{
  id: string;
  iconId: CapabilityProofIconId;
  labelKey: string;
}>;
```

- [ ] **Step 3: Rewrite `sections/home/CapabilityProofSection.tsx`**

```tsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Database,
  GitBranch,
  FileText,
  FileSignature,
  ShieldCheck,
  ChevronRight,
  type LucideIcon,
} from 'lucide-react';
import { LandingSection } from '../../components/LandingSection';
import {
  capabilityProofItems,
  type CapabilityProofIconId,
} from '../../content/homeContent';

const proofIcons: Record<CapabilityProofIconId, LucideIcon> = {
  data: Database,
  pipeline: GitBranch,
  quote: FileText,
  contract: FileSignature,
  access: ShieldCheck,
};

export const CapabilityProofSection: React.FC = () => {
  const { t } = useTranslation();

  return (
    <LandingSection id="proof" tone="surface" size="strip">
      <p className="lp-eyebrow mb-6">{t('landing.home.proof.label')}</p>

      <ul
        aria-label={t('landing.home.proof.flowLabel')}
        className="flex flex-col gap-3 md:flex-row md:items-stretch"
      >
        {capabilityProofItems.map((item, index) => {
          const Icon = proofIcons[item.iconId];
          const isLast = index === capabilityProofItems.length - 1;

          return (
            <React.Fragment key={item.id}>
              <li className="flex flex-1 items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--lp-blue-200)] bg-[var(--lp-blue-50)] text-[var(--lp-blue-600)]">
                  <Icon aria-hidden="true" className="h-4 w-4" />
                </span>
                <span className="text-sm font-semibold leading-snug text-[var(--lp-ink)]">
                  {t(item.labelKey)}
                </span>
              </li>

              {!isLast ? (
                <li
                  aria-hidden="true"
                  className="flex items-center justify-center text-[var(--lp-line-strong)] md:flex-none"
                >
                  {/* Horizontal connector on desktop, vertical on mobile. */}
                  <span className="hidden h-px w-6 bg-current md:block" />
                  <ChevronRight className="hidden h-3.5 w-3.5 md:block" />
                  <span className="ml-[1.125rem] h-4 w-px bg-current md:hidden" />
                </li>
              ) : null}
            </React.Fragment>
          );
        })}
      </ul>
    </LandingSection>
  );
};

export default CapabilityProofSection;
```

The connector items sit inside the `<ul>` as `aria-hidden` list items so the markup stays valid — a `<ul>` may only contain `<li>` children.

- [ ] **Step 4: Verify the key resolves and nothing regressed**

```bash
node -e "const t=require('./src/i18n/locales/en/translation.json'); if(!t.landing.home.proof.flowLabel) { console.error('MISSING flowLabel'); process.exit(1); } console.log('flowLabel OK');"
npm run typecheck
npm run lint
npm run verify:english-only
```

Expected: `flowLabel OK`, then all three commands pass.

- [ ] **Step 5: Checkpoint — do not commit**

---

## Task 14: Problem to outcome

**Files:**
- Modify: `sections/home/ProblemOutcomeSection.tsx` (full rewrite, 70 lines)

**Interfaces:**
- Consumes: `LandingSection` from Task 2; `SectionHeading` from Task 2; `Surface` from Task 4; `Reveal` from Task 3.

- [ ] **Step 1: Rewrite `sections/home/ProblemOutcomeSection.tsx`**

```tsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { LandingSection } from '../../components/LandingSection';
import { SectionHeading } from '../../components/SectionHeading';
import { Surface } from '../../components/Surface';
import { Reveal } from '../../components/Reveal';

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

export const ProblemOutcomeSection: React.FC = () => {
  const { t } = useTranslation();

  return (
    <LandingSection
      id="problem"
      tone="canvas"
      size="default"
      aria-labelledby="problem-title"
    >
      <SectionHeading
        id="problem-title"
        eyebrow={t('landing.home.problem.eyebrow')}
        title={t('landing.home.problem.title')}
        description={t('landing.home.problem.description')}
      />

      <div className="grid gap-8 lg:grid-cols-12 lg:gap-10">
        {/* The muted "before" column. */}
        <ol className="space-y-3 lg:col-span-7">
          {problemItems.map((item, index) => (
            <Reveal as="li" key={item.id} delay={index * 80}>
              <Surface tone="sunk" elevation="flat" className="p-5">
                <div className="grid grid-cols-[2rem_1fr] gap-4">
                  <span
                    aria-hidden="true"
                    className="font-mono text-sm font-bold text-[var(--lp-ink-subtle)]"
                  >
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <h3 className="text-base font-bold text-[var(--lp-ink-muted)]">
                      {t(item.titleKey)}
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-[var(--lp-ink-subtle)]">
                      {t(item.descriptionKey)}
                    </p>
                  </div>
                </div>
              </Surface>
            </Reveal>
          ))}
        </ol>

        {/* The elevated "after" card. Visual hierarchy matches the
            narrative hierarchy: this sits above the muted column. */}
        <Reveal delay={240} className="lg:col-span-5">
          <Surface
            elevation="md"
            className="relative h-full overflow-hidden bg-[var(--lp-blue-50)] p-7 md:p-8"
          >
            <span
              aria-hidden="true"
              className="absolute inset-y-0 left-0 w-1 bg-[var(--lp-blue-500)]"
            />
            <h3 className="lp-h3">{t('landing.home.problem.afterTitle')}</h3>
            <p className="lp-lead mt-4">
              {t('landing.home.problem.afterDescription')}
            </p>
          </Surface>
        </Reveal>
      </div>
    </LandingSection>
  );
};

export default ProblemOutcomeSection;
```

- [ ] **Step 2: Typecheck and lint**

```bash
npm run typecheck
npm run lint
```

Expected: both pass.

- [ ] **Step 3: Checkpoint — do not commit**

---

## Task 15: Product workflow stepper

**Files:**
- Modify: `sections/home/ProductWorkflowSection.tsx` (full rewrite, 72 lines)

**Interfaces:**
- Consumes: `LandingSection`, `SectionHeading` from Task 2; `LandingProductVisual`, `homeProductAssets`, `homeWorkflowStages` from Task 11; Radix `Tabs` from `@/components/ui/tabs`.

- [ ] **Step 1: Confirm the Radix tabs wrapper supports vertical orientation**

```bash
grep -n "orientation\|TabsPrimitive.Root" src/components/ui/tabs.tsx
```

The shadcn wrapper forwards all props to `TabsPrimitive.Root`, so `orientation="vertical"` reaches Radix and switches arrow-key handling from left/right to up/down automatically. If the wrapper does not spread props, add `{...props}` to `Tabs` before continuing.

- [ ] **Step 2: Rewrite `sections/home/ProductWorkflowSection.tsx`**

```tsx
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LandingSection } from '../../components/LandingSection';
import { SectionHeading } from '../../components/SectionHeading';
import { LandingProductVisual } from '../../components/LandingProductVisual';
import {
  homeProductAssets,
  homeWorkflowStages,
  type HomeWorkflowStageId,
} from '../../content/homeProductEvidence';

export function ProductWorkflowSection() {
  const { t } = useTranslation();
  const [activeStage, setActiveStage] = useState<HomeWorkflowStageId>('lead');

  const activeIndex = homeWorkflowStages.findIndex(
    (stage) => stage.id === activeStage
  );

  return (
    <LandingSection
      id="features"
      tone="surface"
      size="default"
      aria-labelledby="workflow-title"
    >
      <SectionHeading
        id="workflow-title"
        eyebrow={t('landing.home.workflow.eyebrow')}
        title={t('landing.home.workflow.title')}
        description={t('landing.home.workflow.description')}
      />

      <Tabs
        value={activeStage}
        onValueChange={(value) => setActiveStage(value as HomeWorkflowStageId)}
        orientation="vertical"
        className="grid gap-8 lg:grid-cols-12 lg:gap-10"
      >
        {/* Vertical stepper. Collapses to a scrollable pill row below lg. */}
        <TabsList
          className="h-auto justify-start gap-0 overflow-x-auto bg-transparent p-0 lg:col-span-4 lg:flex-col lg:overflow-visible"
        >
          {homeWorkflowStages.map((stage, index) => {
            const isActive = stage.id === activeStage;
            const isBeforeActive = index <= activeIndex;

            return (
              <TabsTrigger
                key={stage.id}
                value={stage.id}
                className="relative min-h-11 shrink-0 justify-start gap-3 rounded-lg border border-[var(--lp-line)] px-3 py-3 text-left data-[state=active]:border-[var(--lp-blue-500)] lg:w-full lg:border-transparent lg:pl-0 lg:data-[state=active]:border-transparent"
              >
                {/* Connector running through the dots, filled up to the
                    active stage so it reads as a progress line. */}
                {index < homeWorkflowStages.length - 1 ? (
                  <span
                    aria-hidden="true"
                    className={`absolute left-[1.4rem] top-[2.4rem] hidden h-[calc(100%-1.2rem)] w-px lg:block ${
                      isBeforeActive && index < activeIndex
                        ? 'bg-[var(--lp-blue-500)]'
                        : 'bg-[var(--lp-line)]'
                    }`}
                  />
                ) : null}

                <span
                  aria-hidden="true"
                  className={`relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[10px] font-bold tabular-nums ${
                    isActive
                      ? 'border-[var(--lp-blue-500)] bg-[var(--lp-blue-500)] text-white'
                      : isBeforeActive
                        ? 'border-[var(--lp-blue-200)] bg-[var(--lp-blue-50)] text-[var(--lp-blue-700)]'
                        : 'border-[var(--lp-line)] bg-[var(--lp-surface)] text-[var(--lp-ink-subtle)]'
                  }`}
                >
                  {String(index + 1).padStart(2, '0')}
                </span>

                <span
                  className={`text-sm font-semibold ${
                    isActive ? 'text-[var(--lp-blue-600)]' : 'text-[var(--lp-ink-muted)]'
                  }`}
                >
                  {t(stage.labelKey)}
                </span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {homeWorkflowStages.map((stage) => (
          <TabsContent
            key={stage.id}
            value={stage.id}
            className="mt-0 lg:col-span-8 lg:col-start-5 lg:row-start-1"
          >
            <div className="lp-fade-in">
              <h3 className="lp-h3">{t(stage.titleKey)}</h3>
              <p className="lp-lead mt-3">{t(stage.descriptionKey)}</p>
              <LandingProductVisual
                asset={homeProductAssets[stage.assetId]}
                className="mt-6"
              />
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </LandingSection>
  );
}

export default ProductWorkflowSection;
```

- [ ] **Step 3: Add the crossfade to `landing.css`**

Append near the Reveal block:

```css
.landing-theme .lp-fade-in {
  animation: lp-fade-in var(--lp-dur) var(--lp-ease) both;
}

@keyframes lp-fade-in {
  from { opacity: 0; transform: translateY(4px); }
  to   { opacity: 1; transform: none; }
}
```

Radix does not render the children of an inactive `TabsContent`, so the active panel mounts fresh on each change and this animation runs once per switch. Only one mock screen exists in the DOM at a time, so no lazy loading is needed.

- [ ] **Step 4: Typecheck and lint**

```bash
npm run typecheck
npm run lint
```

Expected: both pass.

- [ ] **Step 5: Checkpoint — do not commit**

---

## Task 16: Role outcomes without tabs

Three roles with three short points each is nine items, which fits three columns. The tab here charged a click and hid two thirds of the supporting evidence.

**Files:**
- Modify: `sections/home/RoleOutcomesSection.tsx` (full rewrite, 58 lines)

**Interfaces:**
- Consumes: `LandingSection`, `SectionHeading` from Task 2; `Surface` from Task 4; `Reveal` from Task 3; `homeRoleItems` from `content/homeContent.ts`, unchanged.

- [ ] **Step 1: Rewrite `sections/home/RoleOutcomesSection.tsx`**

```tsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Check } from 'lucide-react';
import { LandingSection } from '../../components/LandingSection';
import { SectionHeading } from '../../components/SectionHeading';
import { Surface } from '../../components/Surface';
import { Reveal } from '../../components/Reveal';
import { homeRoleItems } from '../../content/homeContent';

export const RoleOutcomesSection: React.FC = () => {
  const { t } = useTranslation();

  return (
    <LandingSection
      id="roles"
      tone="canvas"
      size="default"
      aria-labelledby="roles-title"
    >
      <SectionHeading
        id="roles-title"
        eyebrow={t('landing.home.roles.eyebrow')}
        title={t('landing.home.roles.title')}
      />

      <div className="grid gap-5 md:grid-cols-3">
        {homeRoleItems.map((role, index) => (
          <Reveal key={role.id} delay={index * 80}>
            <Surface elevation="sm" interactive className="h-full p-6 md:p-7">
              <p className="lp-eyebrow">{t(role.labelKey)}</p>

              <h3 className="lp-h3 mt-4">{t(role.titleKey)}</h3>

              <ul className="mt-5 space-y-3">
                {role.pointKeys.map((pointKey) => (
                  <li key={pointKey} className="flex items-start gap-2.5">
                    <Check
                      aria-hidden="true"
                      className="mt-0.5 h-4 w-4 shrink-0 text-[var(--lp-blue-500)]"
                    />
                    <span className="text-sm leading-relaxed text-[var(--lp-ink-muted)]">
                      {t(pointKey)}
                    </span>
                  </li>
                ))}
              </ul>
            </Surface>
          </Reveal>
        ))}
      </div>
    </LandingSection>
  );
};

export default RoleOutcomesSection;
```

- [ ] **Step 2: Confirm the tabs import is gone**

```bash
grep -n "Tabs" src/features/landing/sections/home/RoleOutcomesSection.tsx
```

Expected: no output. An unused import would fail `npm run lint` at `--max-warnings 0` anyway.

- [ ] **Step 3: Typecheck and lint**

```bash
npm run typecheck
npm run lint
```

Expected: both pass.

- [ ] **Step 4: Checkpoint — do not commit**

---

## Task 17: Enterprise trust — the dark section

The page's only dark region, and the task that fixes the focus-ring defect the dark region would otherwise introduce.

**Files:**
- Modify: `sections/home/EnterpriseTrustSection.tsx` (full rewrite, 58 lines)

**Interfaces:**
- Consumes: `LandingSection` with `tone="dark"` from Task 2; `SectionHeading` with `tone="dark"` from Task 2; `Surface` with `tone="dark-raised"` from Task 4; `Reveal` from Task 3.

- [ ] **Step 1: Verify Task 1 shipped the dark focus ring**

```bash
grep -A2 "lp-tone-dark :where" src/features/landing/landing.css
```

Expected: the rule setting `outline-color: var(--lp-blue-200)`. Without it, the default `#085AC0` outline is effectively invisible against `#061426` and keyboard focus is lost inside this section. **If this grep returns nothing, stop and fix Task 1 before continuing.**

- [ ] **Step 2: Rewrite `sections/home/EnterpriseTrustSection.tsx`**

```tsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  History,
  LockKeyhole,
  Network,
  PlugZap,
  type LucideIcon,
} from 'lucide-react';
import { LandingSection } from '../../components/LandingSection';
import { SectionHeading } from '../../components/SectionHeading';
import { Surface } from '../../components/Surface';
import { Reveal } from '../../components/Reveal';
import {
  enterpriseTrustItems,
  type EnterpriseTrustId,
} from '../../content/homeContent';

const trustIcons = {
  access: LockKeyhole,
  scope: Network,
  audit: History,
  integration: PlugZap,
} satisfies Record<EnterpriseTrustId, LucideIcon>;

export const EnterpriseTrustSection: React.FC = () => {
  const { t } = useTranslation();

  return (
    <LandingSection
      id="solutions"
      tone="dark"
      size="tall"
      aria-labelledby="trust-title"
    >
      <SectionHeading
        id="trust-title"
        tone="dark"
        eyebrow={t('landing.home.trust.eyebrow')}
        title={t('landing.home.trust.title')}
      />

      <div className="grid gap-5 sm:grid-cols-2 lg:gap-6">
        {enterpriseTrustItems.map((item, index) => {
          const Icon = trustIcons[item.id];

          return (
            <Reveal key={item.id} delay={index * 70}>
              <Surface
                tone="dark-raised"
                elevation="flat"
                className="h-full p-7 md:p-8"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[var(--lp-dark-line)] bg-[var(--lp-dark)] text-[var(--lp-blue-400)]">
                  <Icon aria-hidden="true" className="h-5 w-5" />
                </div>

                <h3 className="lp-h3 mt-5">{t(item.titleKey)}</h3>

                <p className="mt-3 text-sm leading-relaxed text-[var(--lp-dark-ink-muted)]">
                  {t(item.descriptionKey)}
                </p>
              </Surface>
            </Reveal>
          );
        })}
      </div>
    </LandingSection>
  );
};

export default EnterpriseTrustSection;
```

The icons use `--lp-blue-400` rather than the brand `--lp-blue-500`, which is too dark to register against `#061426`.

- [ ] **Step 3: Typecheck and lint**

```bash
npm run typecheck
npm run lint
```

Expected: both pass.

- [ ] **Step 4: Checkpoint — do not commit**

---

## Task 18: Commercial model

**Files:**
- Modify: `sections/home/CommercialModelSection.tsx` (full rewrite, 43 lines)

**Interfaces:**
- Consumes: `LandingSection`, `SectionHeading` from Task 2; `Reveal` from Task 3; `commercialScopeItems` from `content/homeContent.ts`, unchanged.

- [ ] **Step 1: Rewrite `sections/home/CommercialModelSection.tsx`**

```tsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { LandingSection } from '../../components/LandingSection';
import { SectionHeading } from '../../components/SectionHeading';
import { Reveal } from '../../components/Reveal';
import { commercialScopeItems } from '../../content/homeContent';

export const CommercialModelSection: React.FC = () => {
  const { t } = useTranslation();

  return (
    <LandingSection
      id="pricing"
      tone="surface"
      size="default"
      aria-labelledby="commercial-title"
    >
      <div className="grid gap-10 lg:grid-cols-12">
        {/* Sticky works here because grid items default to
            align-self: stretch, giving this column the full height it
            needs to travel within. Under flex with align-items: center the
            same markup would silently fail to stick. */}
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-24">
            <SectionHeading
              id="commercial-title"
              eyebrow={t('landing.home.commercial.eyebrow')}
              title={t('landing.home.commercial.title')}
              description={t('landing.home.commercial.description')}
              className="mb-8 sm:mb-8"
            />
            <a href="#demo" className="landing-primary-action">
              {t('landing.home.commercial.cta')}
            </a>
          </div>
        </div>

        <dl className="lg:col-span-7">
          {commercialScopeItems.map((item, index) => (
            <Reveal key={item.id} delay={index * 60}>
              <div className="group grid gap-1.5 border-t border-[var(--lp-line)] px-3 py-6 transition-colors duration-200 last:border-b hover:bg-[var(--lp-blue-50)] sm:grid-cols-[3rem_1fr] sm:gap-4">
                <span
                  aria-hidden="true"
                  className="font-mono text-sm font-bold tabular-nums text-[var(--lp-blue-500)]"
                >
                  {String(index + 1).padStart(2, '0')}
                </span>
                <div>
                  <dt className="text-base font-bold text-[var(--lp-ink)] transition-transform duration-200 group-hover:translate-x-0.5">
                    {t(item.titleKey)}
                  </dt>
                  <dd className="mt-1.5 text-sm leading-relaxed text-[var(--lp-ink-muted)]">
                    {t(item.descriptionKey)}
                  </dd>
                </div>
              </div>
            </Reveal>
          ))}
        </dl>
      </div>
    </LandingSection>
  );
};

export default CommercialModelSection;
```

The `<dl>` / `<dt>` / `<dd>` structure is preserved because it is semantically correct for term-and-definition content. `Reveal` renders a `div` between `<dl>` and the `<div>` wrapper, which is valid: HTML permits `<div>` children inside `<dl>` as grouping wrappers.

- [ ] **Step 2: Typecheck and lint**

```bash
npm run typecheck
npm run lint
```

Expected: both pass.

- [ ] **Step 3: Checkpoint — do not commit**

---

## Task 19: Demo section

**Files:**
- Modify: `sections/home/DemoSection.tsx` (full rewrite, 66 lines)

**Interfaces:**
- Consumes: `LandingSection` from Task 2; `SectionHeading` from Task 2; `Surface` from Task 4; `DemoRequestForm` unchanged; `env` from `@/config/env`.

- [ ] **Step 1: Rewrite `sections/home/DemoSection.tsx`**

The current file renders a bare `<section>` rather than using `LandingSection`. Moving it onto the primitive is what lets it carry `tone="mesh"`, closing the page as a loop back to the hero.

```tsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { env } from '@/config/env';
import { LandingSection } from '../../components/LandingSection';
import { SectionHeading } from '../../components/SectionHeading';
import { Surface } from '../../components/Surface';
import { DemoRequestForm } from '../../components/DemoRequestForm';

const agendaKeys = [
  'landing.home.demo.agendaDiscovery',
  'landing.home.demo.agendaWorkflow',
  'landing.home.demo.agendaScope',
] as const;

export const DemoSection: React.FC = () => {
  const { t } = useTranslation();

  return (
    <LandingSection
      id="demo"
      tone="mesh"
      size="tall"
      aria-labelledby="demo-title"
    >
      <div className="grid items-start gap-10 lg:grid-cols-12 lg:gap-14">
        <div className="lg:col-span-5">
          <SectionHeading
            id="demo-title"
            eyebrow={t('landing.home.demo.eyebrow')}
            title={t('landing.home.demo.title')}
            description={t('landing.home.demo.description')}
            className="mb-8 sm:mb-8"
          />

          <h3 className="text-base font-bold text-[var(--lp-ink)]">
            {t('landing.home.demo.agendaTitle')}
          </h3>

          {/* Numbered timeline, matching the workflow stepper's language. */}
          <ol className="mt-5 space-y-0">
            {agendaKeys.map((key, index) => {
              const isLast = index === agendaKeys.length - 1;

              return (
                <li key={key} className="relative flex gap-4 pb-6 last:pb-0">
                  {!isLast ? (
                    <span
                      aria-hidden="true"
                      className="absolute left-[0.9375rem] top-8 h-[calc(100%-1.5rem)] w-px bg-[var(--lp-line)]"
                    />
                  ) : null}

                  <span
                    aria-hidden="true"
                    className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[var(--lp-blue-200)] bg-[var(--lp-blue-50)] text-xs font-bold tabular-nums text-[var(--lp-blue-700)]"
                  >
                    {String(index + 1).padStart(2, '0')}
                  </span>

                  <span className="pt-1.5 text-sm font-medium leading-relaxed text-[var(--lp-ink-muted)]">
                    {t(key)}
                  </span>
                </li>
              );
            })}
          </ol>
        </div>

        <div className="lg:col-span-7">
          <Surface elevation="lg" className="p-7 sm:p-10">
            <div className="mb-6">
              <h3 className="lp-h3">{t('landing.home.demo.formTitle')}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--lp-ink-muted)]">
                {t('landing.home.demo.formDescription')}
              </p>
            </div>

            <DemoRequestForm
              privacyPolicyUrl={env.privacyPolicyUrl || '/privacy'}
              salesEmail={env.salesEmail}
              salesPhone={env.salesPhone}
              headingAs="h3"
            />
          </Surface>
        </div>
      </div>
    </LandingSection>
  );
};

export default DemoSection;
```

- [ ] **Step 2: Confirm `DemoRequestForm` was not modified**

```bash
git status --porcelain src/features/landing/components/DemoRequestForm.tsx
```

Expected: no output. Its props are passed identically to before.

- [ ] **Step 3: Typecheck and lint**

```bash
npm run typecheck
npm run lint
```

Expected: both pass.

- [ ] **Step 4: Checkpoint — do not commit**

---

## Task 20: Header scroll state

**Files:**
- Create: `hooks/useScrolled.ts`
- Modify: `components/LandingHeader.tsx` (lines 108 to 116 for the header element, plus the nav link classes around lines 138 to 160)

**Interfaces:**
- Consumes: nothing from earlier tasks except the token layer.
- Produces: `useScrolled(threshold?: number): boolean`.

- [ ] **Step 1: Create `hooks/useScrolled.ts`**

```ts
import { useEffect, useState } from 'react';

/** True once the window has scrolled past `threshold` pixels. */
export function useScrolled(threshold = 8): boolean {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > threshold);

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => window.removeEventListener('scroll', handleScroll);
  }, [threshold]);

  return scrolled;
}
```

- [ ] **Step 2: Wire the scroll state into `components/LandingHeader.tsx`**

Add the import beside the existing ones:

```tsx
import { useScrolled } from '../hooks/useScrolled';
```

Add the hook call beside the other hooks near the top of the component:

```tsx
  const scrolled = useScrolled(8);
```

Replace the opening `<header>` tag at line 108 with:

```tsx
    <header
      className={`sticky top-0 z-50 transition-[background-color,border-color,box-shadow] duration-200 ${
        scrolled
          ? 'border-b border-[var(--lp-line)] bg-white/85 shadow-[var(--lp-shadow-sm)] backdrop-blur-md'
          : 'border-b border-transparent bg-transparent'
      }`}
    >
```

The previous markup was always solid white with a border, which cut a hard line across the top of the hero mesh.

- [ ] **Step 3: Change the active nav indicator from a filled pill to an underline**

In the desktop nav map, replace the `className` template on the `<a>` with:

```tsx
                  className={`relative inline-flex min-h-[44px] items-center px-2.5 py-1.5 text-sm font-semibold transition-colors after:absolute after:bottom-1 after:left-2.5 after:right-2.5 after:h-0.5 after:rounded-full after:transition-colors ${
                    isSectionActive
                      ? 'text-[var(--lp-blue-600)] after:bg-[var(--lp-blue-500)]'
                      : 'text-[var(--lp-ink-muted)] after:bg-transparent hover:text-[var(--lp-ink)]'
                  }`}
```

Leave the mobile drawer link classes as they are — a filled state is correct in a drawer.

- [ ] **Step 4: Confirm no behaviour was removed**

```bash
grep -c "IntersectionObserver\|scrollIntoView\|aria-expanded\|aria-controls\|Escape\|min-h-\[44px\]" src/features/landing/components/LandingHeader.tsx
```

Expected: a count matching the original file's. Scroll-spy, hash scrolling, the mobile drawer, Escape handling, ARIA attributes, and touch-target sizes must all survive this task untouched.

- [ ] **Step 5: Typecheck and lint**

```bash
npm run typecheck
npm run lint
```

Expected: both pass.

- [ ] **Step 6: Checkpoint — do not commit**

---

## Task 21: Footer call-to-action band

**Files:**
- Modify: `components/LandingFooter.tsx` (92 lines, band added above the existing grid)
- Modify: `../../i18n/locales/en/translation.json` (three new keys)

**Interfaces:**
- Consumes: `LandingSection` is not used here; the footer keeps its own `<footer>` element.

- [ ] **Step 1: Add the three keys to the translation bundle**

In `src/i18n/locales/en/translation.json`, inside `landing.footer`, add:

```json
"ctaTitle": "See VUM CRM running on your own sales process",
"ctaDescription": "Book a working session and we will prepare the walkthrough around your team structure.",
"ctaAction": "Book a demo"
```

- [ ] **Step 2: Insert the band at the top of the footer**

Immediately inside `<div className="landing-container">`, before the existing brand grid, insert:

```tsx
        <div className="mb-12 flex flex-col items-start gap-6 rounded-2xl border border-[var(--lp-blue-200)] bg-[var(--lp-blue-50)] p-8 sm:p-10 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-[34rem]">
            <h2 className="lp-h3">{t('landing.footer.ctaTitle')}</h2>
            <p className="mt-2 text-sm leading-relaxed text-[var(--lp-ink-muted)]">
              {t('landing.footer.ctaDescription')}
            </p>
          </div>
          <Link to="/demo" className="landing-primary-action shrink-0">
            {t('landing.footer.ctaAction')}
          </Link>
        </div>
```

`Link` is already imported in this file. The footer stays on a light background, preserving the design's commitment to exactly one dark region.

- [ ] **Step 3: Retokenize the footer text colours**

Replace every `var(--landing-muted)` with `var(--lp-ink-muted)`, every `var(--landing-ink)` with `var(--lp-ink)`, every `var(--landing-line)` with `var(--lp-line)`, and every `var(--landing-blue)` with `var(--lp-blue-500)` inside this file only. The aliases make this cosmetic rather than functional, but the shell should reference the current names.

- [ ] **Step 4: Verify the keys resolve**

```bash
node -e "const t=require('./src/i18n/locales/en/translation.json'); const f=t.landing.footer; ['ctaTitle','ctaDescription','ctaAction'].forEach(k=>{ if(!f[k]) { console.error('MISSING '+k); process.exit(1); } }); console.log('footer CTA keys OK');"
npm run typecheck
npm run lint
npm run verify:english-only
```

Expected: `footer CTA keys OK`, then all three pass.

- [ ] **Step 5: Checkpoint — do not commit**

---

## Task 22: Final verification sweep

**Files:** none modified. This task only verifies.

- [ ] **Step 1: Confirm every defect from the spec is closed**

```bash
echo "--- 1.1 missing images ---"
grep -rn "landing/product" src/ || echo "clean"
echo "--- 1.2 undefined CSS ---"
grep -rn "h-section\|h-hero\|--color-ink" src/ || echo "clean"
echo "--- dark focus ring present ---"
grep -c "lp-tone-dark :where" src/features/landing/landing.css
```

Expected: `clean`, `clean`, `1`.

- [ ] **Step 2: Confirm the out-of-scope files were never touched**

```bash
git status --porcelain \
  src/features/landing/pages/FeaturesPage.tsx \
  src/features/landing/pages/PricingPage.tsx \
  src/features/landing/pages/SolutionsPage.tsx \
  src/features/landing/components/DemoRequestForm.tsx
```

Expected: no output. Any line here is a scope violation that must be reverted.

- [ ] **Step 3: Confirm the rhythm table from the spec was implemented**

`tone` is a prop on three different components — `LandingSection`, `SectionHeading`, and `Surface` — so a bare grep over the whole file overcounts. `EnterpriseTrustSection` alone passes `tone="dark"` twice, once to the section and once to its heading. Scope the match to the `LandingSection` opening tag:

```bash
cd src/features/landing/sections/home
for f in *.tsx; do
  grep -A4 '<LandingSection' "$f" | grep -o 'tone="[a-z]*"' | head -1
done | sort | uniq -c
```

Expected: `mesh` twice (hero, demo), `surface` three times (proof, workflow, commercial), `canvas` twice (problem, roles), and `dark` **exactly once**. More than one `dark` breaks the design's central commitment.

- [ ] **Step 4: Confirm no dependency was added**

```bash
git diff --stat package.json package-lock.json
```

Expected: no output.

- [ ] **Step 5: Full static verification**

```bash
npm run typecheck
npm run lint
npm run verify:english-only
```

Expected: all three pass.

- [ ] **Step 6: Report to the user and stop**

Summarise what changed, confirm nothing is committed, and hand over for visual review. The user runs `npm run dev` themselves; the implementer must not, and must not claim the page looks correct without having seen it.

---

## Appendix: Adaptations to the writing-plans skill

Two of this skill's defaults do not apply in this repository, and the substitutions are recorded here so a reader does not mistake them for omissions.

**Commits.** The skill ends each task with `git add` and `git commit`. `AGENTS.md` §3 forbids commits, pushes, branches, pull requests, and even staging. Every task therefore ends with an uncommitted checkpoint.

**Test-driven development.** The skill's red-green cycle assumes a test runner. `AGENTS.md` §4 forbids running tests and starting the application, and the user authorised only `npm run typecheck` and `npm run lint`. The cycle is replaced by:

1. A step that records the current failure with a `grep` or `ls` whose output changes once the task is done — the closest available analogue to a failing test.
2. Implementation.
3. The same check re-run, expected to be clean, plus typecheck and lint.

Where a real red-green cycle was possible without a test runner, it is used: Task 10 Step 3 deliberately breaks `Record<MockScreenId, ComponentType>` to prove `tsc` catches an incomplete registry, then reverts. Type-level exhaustiveness is the one genuine compile-time test available here, and the registry is typed specifically so that it exists.

**No test file is created anywhere in this plan.** That is a deliberate consequence of the repository rule, not an oversight.
