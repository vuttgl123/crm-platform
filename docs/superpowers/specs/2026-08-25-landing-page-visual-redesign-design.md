# Landing Page Visual Redesign Design

**Status:** Approved
**Date:** 2026-08-25
**Scope:** `crm-fe/src/features/landing` — HomePage sections, shared landing shell (header and footer), and the landing design-token layer. The Features, Solutions, Pricing, and Demo sub-pages keep their current layout but inherit the new token values.

## 1. Context

The public landing page lives in `crm-fe/src/features/landing`. `LandingLayout`
renders a shared header and footer around a routed outlet, and `HomePage`
composes eight sections. A separate `landing.css` file declares a small set of
`--landing-*` custom properties that scope a light, blue-and-white visual
identity to the `.landing-theme` wrapper.

The structure is sound. The visual result is not, and an audit found three
defects that are functional rather than aesthetic.

### 1.1 Every product screenshot is missing

`content/homeProductEvidence.ts` references eight `.webp` files under
`/landing/product/`. The directory `crm-fe/public/landing/product/` is empty.
The hero visual and all six workflow tabs currently render broken images.

Because these paths are plain strings resolved from `public/` rather than
bundler imports, Vite never validates them. The project builds cleanly while the
page is visibly broken in the browser.

### 1.2 `SectionHeading` references CSS that does not exist

`components/SectionHeading.tsx` applies the classes `h-section` and `h-hero` and
the custom properties `--color-ink` and `--color-ink-muted`. None of the four are
defined anywhere in the repository. The real property names are `--landing-ink`
and `--landing-muted`.

`h-section` is not a valid Tailwind utility, so no CSS is emitted and every
heading rendered through this component falls back to the browser default `h2`
size. This affects the Features, Pricing, and Solutions pages, which are the
only consumers of `SectionHeading`.

### 1.3 The page has no visual rhythm

All eight sections share one padding value, `clamp(4.5rem, 8vw, 8rem)`, and
alternate between only two background colors. Each section repeats the same
composition: a blue eyebrow, an `h2`, a lead paragraph, and a grid of bordered
cards. There is no dark region, no depth, and no motion.

The card treatment `rounded-2xl border border-[var(--landing-line)]
bg-[var(--landing-surface)] p-7` is hand-copied roughly fifteen times, and the
page runs two competing type scales: `clamp(2.75rem, 5.5vw, 4.75rem)` in the
hero against `text-3xl md:text-5xl` in every other heading.

### 1.4 Two files are already written but never wired up

`content/productPreviewContent.ts` exports `previewPipelineItems`, a set of
realistic sample deals with account names, industries, contacts, amounts, and
probabilities. Its matching translation keys exist under `landing.preview.*`.
No file imports it.

`components/AnimatedCounter.tsx` implements a correct run-once
`IntersectionObserver` pattern that the three sub-pages use, but HomePage does
not.

## 2. Goals

- Repair the three defects in section 1 at their root, not by patching symptoms.
- Replace the missing screenshots with product mockups rendered in React, so the
  landing page can never again ship broken image references.
- Give the page a deliberate background and spacing rhythm with exactly one dark
  region as its visual peak.
- Consolidate the repeated card and heading markup into a small set of
  primitives that encode the design decisions as types.
- Add restrained scroll motion using only CSS and `IntersectionObserver`.

## 3. Non-goals

- No new runtime dependency. In particular, no animation library.
- No layout changes to the Features, Solutions, Pricing, or Demo sub-pages. They
  inherit new token values and the `SectionHeading` repair, nothing more.
- No changes to the logic, validation, or submission flow of
  `components/DemoRequestForm.tsx`. Only its field styling is retokenized.
- No real product screenshots. Photography and screen capture are out of scope.
- No dark mode for the landing page. The dark region in section 6 is a fixed
  design choice, not a user-selectable theme.

## 4. Design direction

The approved direction is **Enterprise Editorial**: a predominantly light page
that earns its impact from typography, layered depth, and rhythm rather than
from color saturation or heavy motion.

The brand blue `#085AC0` is retained unchanged. It already matches the
`secondary` color in `tailwind.config.js`, so the landing page and the
application proper stay in agreement.

Three alternatives were considered and rejected. A dark hero was rejected as a
larger change than the page needs. A hero-only investment was rejected because
it does not address the rhythm problem, which is the actual defect. Full
scroll-choreography was rejected because it requires an animation library, costs
CPU on the low-specification office hardware typical of the enterprise buyer,
and reads as less trustworthy for a B2B system of record.

## 5. Token layer

`landing.css` is rewritten. It grows from roughly 131 lines to roughly 420,
organized into commented blocks: tokens, tone utilities, type utilities,
component utilities, and the reduced-motion guard.

### 5.1 New tokens

New tokens use an `--lp-*` prefix. This is deliberate: the existing
`--landing-*` names stay valid, so sections can be migrated one at a time
without breaking the ones not yet touched — which matters in a repository where
the application cannot be started to check.

```css
.landing-theme {
  /* Light surfaces */
  --lp-canvas:         #F5F8FC;
  --lp-surface:        #FFFFFF;
  --lp-surface-sunk:   #EEF3F9;

  /* Ink, three levels */
  --lp-ink:            #07182B;
  --lp-ink-muted:      #52647A;
  --lp-ink-subtle:     #7688A0;

  /* Lines */
  --lp-line:           #DFE7F1;
  --lp-line-strong:    #C6D4E6;

  /* Brand blue scale */
  --lp-blue-50:        #EEF5FE;
  --lp-blue-100:       #DBE9FC;
  --lp-blue-200:       #B9D3F8;
  --lp-blue-400:       #3B84DA;
  --lp-blue-500:       #085AC0;  /* brand, unchanged */
  --lp-blue-600:       #06499D;
  --lp-blue-700:       #053A7C;

  /* Dark surfaces, used by section 6 only */
  --lp-dark:           #061426;
  --lp-dark-raised:    #0D2038;
  --lp-dark-line:      #1B3149;
  --lp-dark-ink:       #EAF1FA;
  --lp-dark-ink-muted: #9DB1C9;
}
```

### 5.2 Backward compatibility

The existing names are redefined as aliases in the same block:

```css
  --landing-canvas:     var(--lp-canvas);
  --landing-surface:    var(--lp-surface);
  --landing-ink:        var(--lp-ink);
  --landing-muted:      var(--lp-ink-muted);
  --landing-line:       var(--lp-line);
  --landing-blue:       var(--lp-blue-500);
  --landing-blue-hover: var(--lp-blue-600);
  --landing-blue-soft:  var(--lp-blue-50);
```

This is the mechanism by which the three sub-pages inherit the refreshed palette
without being edited. Every `var(--landing-*)` reference in those files resolves
through the alias to the new value.

### 5.3 Elevation

Every existing shadow on the landing page is a single diffuse layer, which is
why cards read as pasted onto the background rather than resting on it. Real
shadows have a tight contact layer and a wide diffuse layer.

```css
  --lp-shadow-sm:
    0 1px 2px rgba(7,24,43,.06),
    0 1px 3px rgba(7,24,43,.08);

  --lp-shadow-md:
    0 0 0 1px rgba(7,24,43,.03),
    0 1px 2px  rgba(7,24,43,.05),
    0 4px 12px rgba(7,24,43,.07),
    0 12px 28px rgba(7,24,43,.06);

  --lp-shadow-lg:
    0 0 0 1px  rgba(7,24,43,.04),
    0 1px 2px  rgba(7,24,43,.06),
    0 8px 24px rgba(7,24,43,.08),
    0 32px 64px rgba(7,24,43,.12);

  --lp-shadow-dark-raised:
    inset 0 1px 0 rgba(255,255,255,.06),
    0 1px 2px rgba(0,0,0,.30);
```

The leading `0 0 0 1px` layer is a zero-radius shadow acting as a hairline
border. It gives a crisp edge without a real `border`, so it adds nothing to the
box model and cannot shift layout.

### 5.4 Type scale

One scale replaces the two competing ones. Each token is exposed as a utility
class so components reference something that exists.

```css
  --lp-text-display: clamp(2.5rem,    1.55rem + 3.6vw, 4.25rem);
  --lp-text-h2:      clamp(1.875rem,  1.35rem + 2.0vw, 3rem);
  --lp-text-h3:      clamp(1.25rem,   1.13rem + .48vw, 1.5rem);
  --lp-text-lead:    clamp(1.0625rem, 1.0rem  + .24vw, 1.25rem);
```

Classes: `.lp-display`, `.lp-h2`, `.lp-h3`, `.lp-lead`, `.lp-eyebrow`,
`.lp-caption`. `.lp-display`, `.lp-h2`, and `.lp-h3` carry the display font
family, `letter-spacing: -0.035em`, and `text-wrap: balance` already established
by `.landing-display`.

Defining `.lp-h2` and `.lp-display` is what repairs defect 1.2:
`SectionHeading` is pointed at these classes instead of the non-existent
`h-section` and `h-hero`.

### 5.5 Section sizing and motion

```css
  --lp-section-strip:   clamp(2rem,   3vw,  3rem);
  --lp-section-default: clamp(4.5rem, 8vw,  8rem);
  --lp-section-tall:    clamp(5.5rem, 10vw, 10rem);

  --lp-ease:      cubic-bezier(.22,.61,.36,1);
  --lp-dur-fast:  150ms;
  --lp-dur:       260ms;
  --lp-dur-slow:  600ms;
```

### 5.6 Tone utilities

```css
.landing-theme .lp-tone-canvas  { background-color: var(--lp-canvas); }
.landing-theme .lp-tone-surface { background-color: var(--lp-surface); }

.landing-theme .lp-tone-mesh {
  background-color: var(--lp-canvas);
  background-image:
    radial-gradient(60rem 32rem at 20% -10%, rgba(8,90,192,.10),   transparent 60%),
    radial-gradient(45rem 28rem at 88%   4%, rgba(59,132,218,.08), transparent 62%);
}

.landing-theme .lp-tone-dark {
  background-color: var(--lp-dark);
  color: var(--lp-dark-ink);
  background-image:
    radial-gradient(50rem 26rem at 50% -8%, rgba(59,132,218,.18), transparent 65%);
}
```

Both `.lp-tone-mesh` and `.lp-tone-dark` carry a `::before` layer holding a
28px dot grid, faded out with `mask-image: linear-gradient(to bottom, #000,
transparent 70%)`. The grid must sit on the pseudo-element rather than the
element itself, because a mask applied to the element would also erase the
radial glows.

## 6. Page background rhythm

Uniform padding is the technical cause of the flatness described in 1.3.
Contrast between sections, not decoration within them, is what produces rhythm.

| # | Section | `tone` | `size` |
|---|---------|--------|--------|
| 1 | Hero | `mesh` | `tall` |
| 2 | Capability proof | `surface` | `strip` |
| 3 | Problem to outcome | `canvas` | `default` |
| 4 | Product workflow | `surface` | `default` |
| 5 | Role outcomes | `canvas` | `default` |
| 6 | Enterprise trust | `dark` | `tall` |
| 7 | Commercial model | `surface` | `default` |
| 8 | Demo | `mesh` | `tall` |

Section 6 sits at roughly seventy percent of the page: after the reader
understands the product and before the commercial conversation. It is the only
dark region on the page. The footer stays light to preserve that.

## 7. Component architecture

### 7.1 Primitives

Two existing components are extended in place rather than replaced.
`LandingSection` is imported by ten files, including all three sub-pages, and
`SectionHeading` by three. Introducing new names would force edits in files that
are explicitly out of scope.

**`components/LandingSection.tsx`** — add `tone?: 'canvas' | 'surface' | 'dark'
| 'mesh'` and `size?: 'strip' | 'default' | 'tall'`. Both default to the current
behavior (`canvas` background inherited from the parent, `default` padding), so
existing call sites are unaffected. The union types are the mechanism that makes
the table in section 6 enforceable rather than merely documented.

**`components/SectionHeading.tsx`** — replace `h-section` / `h-hero` with
`.lp-h2` / `.lp-display`, replace `--color-ink` / `--color-ink-muted` with
`--lp-ink` / `--lp-ink-muted`, and add `eyebrow?: string` and `tone?: 'light' |
'dark'`. Remove the `NO EYEBROW ALLOWED IN ANTI-SLOP SAAS` comment, which
contradicts both the eight HomePage sections and the `landing.home.*.eyebrow`
translation keys that already exist.

Eyebrows are kept but restyled. Their content is genuinely useful when scanning
("The operating problem", "Enterprise governance"). What reads as generic is the
default styling — small bold blue text with no structure — not the concept. The
new `.lp-eyebrow` renders a small uppercase label preceded by a short hairline
rule.

Two primitives are new.

**`components/Surface.tsx`** — `elevation?: 'flat' | 'sm' | 'md' | 'lg'`,
`tone?: 'surface' | 'sunk' | 'dark-raised'`, `interactive?: boolean`, and
polymorphic `as`. This replaces the fifteen hand-copied card class strings.

**`components/Reveal.tsx`** — wraps children and transitions them from
`opacity: 0; translateY(12px)` to their resting state when first scrolled into
view. Props: `delay?: number` for stagger, and `as?`.

### 7.2 Hooks

**`hooks/useInViewOnce.ts`** — extracted from the observer logic already proven
in `AnimatedCounter.tsx` lines 31 to 59. Returns `[ref, inView]` and fires at
most once. `AnimatedCounter` is refactored to consume this hook so the logic
exists in one place; its public props and behavior are unchanged, which matters
because the three sub-pages depend on it.

**`hooks/useScrolled.ts`** — returns a boolean for whether the window has
scrolled past a threshold, used by the header. Listener is registered with
`{ passive: true }`.

### 7.3 Reduced motion

`Reveal` reads `matchMedia('(prefers-reduced-motion: reduce)')` and, when
reduced motion is requested, skips the observer entirely and renders its
children visible with no transform.

This is handled in JavaScript rather than relying on the existing CSS block at
`landing.css` line 120. That block only forces `transition-duration` to
`0.01ms`; it does not change the initial `opacity: 0`. If the observer were ever
not to fire — a bug, a background tab at mount, an unsupported environment — the
content would stay permanently invisible. Deciding before render removes the
failure mode instead of masking it.

### 7.4 Product mockups

A new directory `components/product-ui/` holds one shared frame, six screens,
and two support files.

| File | Renders | Used by |
|------|---------|---------|
| `MockWindow.tsx` | Frame: left icon rail, top bar with breadcrumb, search field, avatar | All six |
| `MockPipelineBoard.tsx` | Five-column board with deal cards | Hero, `opportunity` |
| `MockLeadTable.tsx` | Data table with status badges | `lead` |
| `MockAccountRecord.tsx` | Record header, tab strip, activity timeline | `account` |
| `MockQuoteEditor.tsx` | Line-item table with a totals panel | `quote` |
| `MockApprovalFlow.tsx` | Three-step approval chain with avatars | `approval` |
| `MockContractList.tsx` | Contract table with value and date columns | `contract` |
| `mockPrimitives.tsx` | Shared `Row`, `Cell`, `Avatar`, `Bar`, `Chip` | All six |
| `index.ts` | `mockScreens` registry mapping `MockScreenId` to component | `LandingProductVisual` |

`MockWindow` is what makes the set persuasive. A viewer does not analyze each
table; they notice the same rail and the same top bar recurring across six tabs
and conclude they are looking at one real product. The shared frame carries more
weight than any individual screen.

Every status badge imports from `@/config/crmStatusConfig` —
`OpportunityStageConfigMap`, `LeadStatusConfigMap`, `LifecycleStageConfigMap`,
and `QuoteStatusConfigMap`. This is an architectural choice, not a convenience:
when the product's badge colors change, the landing page follows, so the mockups
cannot drift into misrepresenting the product.

### 7.5 Sample data

`content/productPreviewContent.ts` is revived and extended rather than replaced
by a new module. It already contains suitable English sample data with correct
currency formatting, and its `landing.preview.*` translation keys already exist.
It is extended with rows for the lead, quote, approval, and contract screens.

Sample data strings stay outside i18n. They are fictional content displayed
inside an illustration, not interface copy; adding them to the translation
bundle would inflate it with strings nobody will translate. This does not
conflict with `scripts/check-english-only.mjs`, which flags Vietnamese locale
artifacts rather than literal strings.

### 7.6 Visual registry

`content/homeProductEvidence.ts` keeps its role as the single registry mapping a
workflow stage to its illustration. The image fields `src`, `mobileSrc`,
`width`, and `height` are removed and a `screen` field is added:

```ts
export type MockScreenId =
  | 'pipeline' | 'leads' | 'account' | 'quote' | 'approval' | 'contract';

export interface LandingProductScreen {
  id: string;
  screen: MockScreenId;
  altKey: string;
  captionKey: string;
  sourceRoute: string;
  evidenceKind: EvidenceKind;
}
```

`altKey`, `captionKey`, `sourceRoute`, and `evidenceKind` are unchanged. Both
`hero` and `opportunity` map to `screen: 'pipeline'`.

`components/LandingProductVisual.tsx` keeps its external shape — a `<figure>`
containing a framed visual and a `<figcaption>` — and swaps its interior from
`<img>` to `<MockWindow>{Screen}</MockWindow>`.

## 8. Section designs

### 8.1 Hero

The current `lg:col-span-5` / `lg:col-span-7` split gives the headline about
32rem inside an 80rem container. At `clamp(..., 4.75rem)` the headline wraps to
four or five lines and reads as cramped.

Replace with a left-aligned text block at `max-width: 46rem` and a full-width
product visual beneath it, wider than the text column.

- The kicker becomes a pill: hairline border, `--lp-blue-50` background, small
  uppercase label.
- The primary action gains `--lp-shadow-sm` plus
  `inset 0 1px 0 rgba(255,255,255,.15)`, a one-pixel top highlight that reads as
  a physical edge.
- The visual is `MockPipelineBoard` inside `MockWindow` at `--lp-shadow-lg`,
  over a blurred blue radial glow.
- Motion: the text block reveals in four steps at 0, 60, 120, and 180ms. The
  board's deal cards animate in with a staggered CSS `@keyframes` on mount. The
  hero is above the fold, so it needs no observer.

### 8.2 Capability proof

The translation key `landing.home.proof.label` reads "One connected operating
flow", while the current markup renders five disconnected boxes. The design
contradicts its own copy.

Rebuild as a single connected rail: five circular nodes, each with an icon,
joined by a line with arrow markers, on `--lp-surface` at `strip` padding. The
rail rotates to vertical below the `md` breakpoint. The five existing label keys
are reused unchanged. The rail is a `<ul>` named by `landing.home.proof.flowLabel`;
the connecting line and arrow markers are decorative and carry
`aria-hidden="true"`.

### 8.3 Problem to outcome

Build the contrast the copy already describes.

- Left, seven columns: the three "before" items as `Surface tone="sunk"
  elevation="flat"` with `--lp-ink-subtle` ordinals. The column reads as the
  muted, unresolved state.
- Right, five columns: the "after" card as `Surface elevation="md"` tinted
  `--lp-blue-50` with a blue vertical accent rule on its leading edge. It sits
  visually above the left column, so the visual hierarchy matches the narrative
  hierarchy.
- At `lg` and above, a thin gradient line connects the last "before" item to the
  "after" card.

### 8.4 Product workflow

Six pills across `lg:grid-cols-6` leaves each about 12rem, which is tight for
`01 Opportunity`. Replace with a vertical stepper.

- Left, four columns: the six stages stacked, joined by a one-pixel line running
  through the numbered dots. The active stage gets a filled blue dot, blue text,
  and a blue-filled connector above it, forming a progress line. Its title and
  description expand inline beneath its label.
- Right, eight columns: `MockWindow` swapping screens with a crossfade.
- Below `md`, the stepper collapses to the current horizontally scrollable pill
  row with the description beneath.

This stays on Radix `Tabs` with `orientation="vertical"`, which preserves
keyboard navigation and ARIA wiring without hand-written code and switches arrow
handling from left/right to up/down automatically.

Radix does not render the children of an inactive `TabsContent`, so only one
mock screen exists in the DOM at a time. No lazy loading is required.

### 8.5 Role outcomes

The tabs are removed. Three roles with three short points each is nine items,
which fits comfortably in three columns. A tab here charges a click and hides
two thirds of the supporting evidence without gaining anything, since the
content is not voluminous enough to overwhelm.

Each role becomes a `Surface elevation="sm"` column: role label as an eyebrow,
role title as `.lp-h3`, and three points as a list with check markers. The three
columns reveal at 0, 80, and 160ms.

This is also a net accessibility improvement, because no content remains hidden
behind an interaction.

The contrast with 8.4 is intentional: the same Radix component is kept there and
dropped here. The deciding factor is content weight — six full dashboard
mockups versus nine short lines — not preference.

### 8.6 Enterprise trust

The page's single dark region and its visual peak.

- `tone="dark"`, `size="tall"`, with the blue radial glow and masked dot grid
  from 5.6.
- `SectionHeading tone="dark"`.
- The four cards become `Surface tone="dark-raised"` using
  `--lp-shadow-dark-raised`, whose inset top highlight produces the raised glass
  effect that reads as premium on a dark ground.
- The already-imported `LockKeyhole`, `Network`, `History`, and `PlugZap` icons
  switch to `--lp-blue-400`. The brand `#085AC0` is too dark to register against
  `#061426`.

### 8.7 Commercial model

The asymmetric five-and-seven split is already correct; only execution changes.

- Left: heading, lead, and primary action, with `position: sticky; top: 6rem` at
  `lg` and above so it holds beside the scrolling list. This works without
  JavaScript because grid items default to `align-self: stretch`, giving the
  left column the full height it needs to travel within. The same markup under
  flex with `align-items: center` would silently fail to stick.
- Right: the four scope items as numbered rows separated by hairlines. The
  `<dl>` / `<dt>` / `<dd>` structure is preserved because it is semantically
  correct for term-and-definition content. Hover tints the row `--lp-blue-50`
  and shifts the term two pixels right.

### 8.8 Demo

- `tone="mesh"`, echoing the hero and closing the page as a loop.
- Left: the three agenda items as a numbered vertical timeline with a connecting
  line, reusing the visual language of the 8.4 stepper.
- Right: the form inside `Surface elevation="lg"`, the most elevated card on the
  page after the hero mockup, because it is the conversion target.
- `DemoRequestForm.tsx` keeps all of its logic. Only field chrome is retokenized.

## 9. Header and footer

### 9.1 Header

`components/LandingHeader.tsx` currently renders a solid white bar with a bottom
border at all times, which cuts a hard line across the top of the hero.

Add a scroll state via `useScrolled(8)`: below the threshold the header is
transparent with no border; past it, `rgba(255,255,255,.85)` with
`backdrop-blur`, a hairline border, and `--lp-shadow-sm`. Only background,
border, and shadow transition.

The active navigation indicator changes from a filled `--landing-blue-soft` pill
to a thin underline, which reads as editorial rather than as a button.

All existing scroll-spy, hash-scrolling, mobile drawer, Escape handling, and
ARIA logic is preserved unchanged, as are the `min-h-[44px]` touch targets.

### 9.2 Footer

`components/LandingFooter.tsx` gains a call-to-action band above the existing
link columns: a heading and a primary action on `--lp-blue-50` with a hairline
top border, giving the page a closing beat. The link columns keep their
structure and gain the new type scale and hover states. The footer stays light.

## 10. Accessibility requirements

1. **Dark-region focus rings.** `landing.css` line 47 sets the focus outline to
   `var(--landing-blue)`, which is `#085AC0`. Against `#061426` that outline is
   effectively invisible, so keyboard focus would be lost inside section 6.
   Adding a dark region introduces this defect, so the fix is part of the work:

   ```css
   .landing-theme .lp-tone-dark
     :where(a, button, input, select, textarea):focus-visible {
     outline-color: var(--lp-blue-200);
   }
   ```

2. **Mockups are decorative.** Each mock screen carries `aria-hidden="true"`.
   A rendered dashboard is a tree of `div` elements holding fabricated data; a
   screen reader announcing it would present fiction as fact. The accessible
   description comes from the existing `altKey`, rendered as visually hidden
   text — exactly the role `<img alt>` previously served, so nothing is lost.

3. **Mobile cropping depends on point 2.** A five-column board cannot fit a
   375px viewport. The mock keeps a fixed `min-width` and is cropped at the
   frame edge with `overflow: hidden` and a soft right-edge fade, rather than
   being scaled down until text is unreadable or made to scroll horizontally.
   Hiding content from sighted users would normally be an accessibility fault;
   it is acceptable here only because the content is already outside the
   accessibility tree.

4. **Contrast.** `--lp-dark-ink-muted` `#9DB1C9` on `--lp-dark` `#061426`
   measures approximately 8:1, which passes WCAG AA for normal text.
   `--lp-ink-muted` `#52647A` on `--lp-canvas` `#F5F8FC` measures approximately
   5.7:1 and also passes. Header navigation text in the transparent state sits
   on the very light mesh and retains its existing contrast.

5. **Heading order** remains `h1` in the hero, `h2` per section, `h3` within
   cards. `SectionHeading` keeps its `as` prop.

6. **Preserved unchanged:** the skip link at `landing.css` line 100, all
   `min-h-[44px]` touch targets, and the `prefers-reduced-motion` block, which
   is retained in addition to the JavaScript guard described in 7.3.

## 11. Internationalization

All interface copy continues through `react-i18next`. New keys required:

| Key | Purpose |
|-----|---------|
| `landing.footer.ctaTitle` | Footer call-to-action heading |
| `landing.footer.ctaDescription` | Footer call-to-action supporting line |
| `landing.footer.ctaAction` | Footer call-to-action button label |
| `landing.home.proof.flowLabel` | Accessible name for the connected flow rail |

No existing key is removed or renamed. The five `landing.home.proof.*` capability
labels, all `landing.home.*.eyebrow` keys, and the `landing.preview.*` keys are
all reused as they are.

## 12. File inventory

**New — 13 files**

```
components/Surface.tsx
components/Reveal.tsx
components/product-ui/MockWindow.tsx
components/product-ui/MockPipelineBoard.tsx
components/product-ui/MockLeadTable.tsx
components/product-ui/MockAccountRecord.tsx
components/product-ui/MockQuoteEditor.tsx
components/product-ui/MockApprovalFlow.tsx
components/product-ui/MockContractList.tsx
components/product-ui/mockPrimitives.tsx
components/product-ui/index.ts
hooks/useInViewOnce.ts
hooks/useScrolled.ts
```

**Modified — 18 files**

```
landing.css                              rewritten, ~131 to ~420 lines
sections/home/HeroSection.tsx
sections/home/CapabilityProofSection.tsx
sections/home/ProblemOutcomeSection.tsx
sections/home/ProductWorkflowSection.tsx
sections/home/RoleOutcomesSection.tsx
sections/home/EnterpriseTrustSection.tsx
sections/home/CommercialModelSection.tsx
sections/home/DemoSection.tsx
components/LandingHeader.tsx
components/LandingFooter.tsx
components/LandingProductVisual.tsx
components/LandingSection.tsx            extended in place
components/SectionHeading.tsx            repaired in place
components/AnimatedCounter.tsx           refactored onto useInViewOnce
content/homeProductEvidence.ts           image fields to screen field
content/productPreviewContent.ts         revived and extended
i18n/locales/en/translation.json         four new keys
```

**Deleted — none.** `pages/FeaturesPage.tsx`, `pages/PricingPage.tsx`, and
`pages/SolutionsPage.tsx` are not modified.

## 13. Verification

The repository forbids running tests and starting the application. The user has
explicitly authorized two static analysis commands for this work:

- `npm run typecheck` — `tsc --noEmit`
- `npm run lint` — `eslint . --max-warnings 0`

`npm run build` remains out of bounds.

Additional static checks:

- `grep -rn "landing/product" crm-fe/src` returns nothing, confirming every
  missing image reference is gone.
- `grep -rn "h-section\|h-hero\|--color-ink" crm-fe/src` returns nothing.
- `npm run verify:english-only` passes.
- Every `MockScreenId` in `homeProductEvidence.ts` has an entry in the
  `mockScreens` registry, enforced by typing the registry as
  `Record<MockScreenId, ComponentType>`.

Visual confirmation is the user's, by running `npm run dev` themselves.

## 14. Risks

**The mock UI is the largest and least certain part of the work.** Seven
components must look convincing enough to carry the page. If the work needs to
be reduced, `MockPipelineBoard` and `MockWindow` are the two that matter, since
they cover the hero and one of six workflow tabs; the remaining five screens
degrade gracefully to a simpler shared placeholder built from `mockPrimitives`.

**The section 7 sticky column depends on grid stretch behavior**, which cannot
be confirmed without running the application. If it fails, the fallback is to
drop `sticky` and leave the column static; nothing else depends on it.

**Section 5 removes an interaction.** If the three role columns prove too dense
in practice, the fallback is an accordion on mobile only, keeping all three
expanded at `md` and above.

## 15. Out of scope

Layout changes to the four landing sub-pages, real product screenshots,
`DemoRequestForm` logic, a landing dark mode, and any change to backend or API
surfaces. No entry in `docs/api-reference.md` is affected, since this work adds
no API surface.
