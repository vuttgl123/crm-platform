# Opportunity Pipeline Workspace Production Design Specification

**Date:** 2026-08-24

**Status:** Design approved in conversation

**Product surface:** `crm-fe` Opportunities directory, pipeline board, and opportunity detail workspace

**Runtime language:** English only

**Implementation status:** Design only. This document does not claim that proposed backend or frontend changes are implemented.

## 1. Relationship to existing requirements

This specification defines the production target for the existing route:

- `/app/crm/opportunities`

It adds the following detail route to the product design:

- `/app/crm/opportunities/:opportunityId`

The target is an **Opportunity Pipeline Workspace** with a trustworthy
server-backed directory, a dynamic single-pipeline board, an opportunity
detail route, explicit lifecycle transitions, immutable stage history,
stakeholder management, and opportunity-scoped notes.

This is a design specification, not an implementation plan. It intentionally
does not assign tasks, prescribe a commit sequence, or change product code.

Repository rules continue to apply:

- No Git commit, staging, push, or pull request is part of this work.
- No test, build, browser, API, or manual runtime command is part of this work.
- Any later API addition, modification, or removal must update
  `docs/api-reference.md` in the same implementation task.
- Existing user-owned changes in the worktree must be preserved.
- All runtime UI copy must be English.
- Opportunity status and stage badges must be rendered through centralized
  helpers in `@/config/crmStatusConfig`.

## 2. Executive decision

Opportunities becomes an operational revenue-pipeline workspace rather than a
decorative dashboard or a client-normalized mock of backend data.

The approved production surface consists of:

1. A reliable server-filtered and server-paginated opportunity directory.
2. A List view and a Pipeline view that share URL-backed context.
3. A Pipeline view for one active backend-configured pipeline at a time.
4. Dynamic lanes sourced from real pipeline stages and ordered by
   `displayOrder`.
5. Independent server pagination for every pipeline lane.
6. An opportunity detail route with four tabs:
   - Overview
   - Stage history
   - Stakeholders
   - Notes
7. Real selectors for Account, Contact, Pipeline, Stage, Owner, Source,
   Campaign, and Lost reason.
8. A dedicated transition workflow for Move stage, Change pipeline, Mark won,
   Mark lost, Cancel, and Reopen.
9. Atomic stage-history recording and optimistic concurrency.
10. Permission-aware create, edit, transition, stakeholder, note, and delete
    actions.
11. Explicit loading, background-refresh, empty, filtered-empty, error,
    forbidden, not-found, validation, and version-conflict states.

The following surfaces are excluded until separate backend-hardening work is
completed:

- Activity timeline
- Revenue forecast aggregation
- Automatic Quote, Order, or Contract creation
- Related Quotes, Orders, and Contracts
- Cross-pipeline board aggregation
- Bulk update, import, and export
- Opportunity tags before generic target authorization is corrected

The decision prioritizes correct pipeline operations and data integrity over a
large but unreliable Revenue 360 experience.

## 3. Current-state audit

### 3.1 Active entry points

The active frontend surface consists of:

- `src/features/crm/opportunities/OpportunitiesPage.tsx`
- `src/services/api/opportunityApi.ts`
- `src/config/crmStatusConfig.tsx`
- The `/app/crm/opportunities` route in `src/routes/AppRoutes.tsx`
- The Opportunities navigation item in `src/config/navigationConfig.ts`

Navigation is currently gated by `crm_opportunity.read`.

There is no active opportunity detail route. Clicking an opportunity currently
opens the same create/edit dialog rather than a record workspace.

### 3.2 Structural debt in the page

`OpportunitiesPage.tsx` currently combines:

- List and Kanban data loading
- Local filter and pagination state
- Form state
- Create, update, delete, and stage-change mutations
- Static stage configuration
- Table rendering
- Kanban rendering
- KPI derivation
- Confirmation behavior
- Toast copy
- Loading and empty states

This concentration makes the screen difficult to reason about and permits
client aliases to drift away from the backend contract.

### 3.3 Adapter contract drift and fabricated data

`opportunityApi.ts` does not preserve the backend contract. It currently:

- Accepts `any` responses.
- Accepts arrays, `items`, and speculative `content` response shapes.
- Adds `content` back to the canonical `PageResult`.
- Supports non-backend aliases such as `dealName`, `assignedTo`, `stage`,
  `accountName`, `contactName`, `leadSource`, and `search`.
- Fabricates an opportunity number from the ID when it is missing.
- Fabricates Vietnamese opportunity, account, and contact labels.
- Fabricates an owner display name, source, created time, version, probability,
  expected close date, and stage.
- Converts status into one of six hardcoded stage aliases.
- Defaults create and update requests to hardcoded pipeline and stage UUIDs.
- Defaults create and update currency to VND.
- Merges client request data over the server response, allowing submitted
  aliases to hide the actual persisted result.
- Defaults delete version to `1`.

These behaviors can make a failed or partial backend contract look successful
and are not acceptable for production.

### 3.4 Directory correctness issues

The current List view:

- Keeps view, filter, and pagination state outside the URL.
- Sends `stage` as a frontend-only alias.
- Applies stage filtering after a server page has already been returned.
- Computes tab counts from the currently loaded page.
- Labels all non-closed records as "In Negotiation."
- Does not make the "In Negotiation" tab an actual active state.
- Shows the opportunity UUID where the opportunity number should appear.
- Hardcodes VND formatting for every record.
- Exposes create, edit, and delete without consistent write-permission gating.
- Uses a full-table spinner rather than shape-matched skeletons.
- Collapses load errors into a transient toast and can leave stale context
  unexplained.

### 3.5 Pipeline-board correctness issues

The current Kanban view:

- Loads at most 100 opportunities.
- Mixes opportunities from all pipelines.
- Uses six hardcoded stage aliases rather than backend stage UUIDs.
- Cannot represent a custom pipeline or a tenant-specific stage order.
- Calculates lane counts from the loaded subset.
- Calculates lane amounts from the loaded subset.
- Adds amounts across records without respecting currency.
- Hardcodes VND in lane and card totals.
- Uses a fixed next-stage sequence that may not exist in the selected pipeline.
- Treats status aliases as if they were real pipeline stages.
- Has no independent lane pagination or retry state.

### 3.6 Form and mutation correctness issues

The current create/edit dialog:

- Uses free-text Account, Contact, and Owner fields.
- Does not collect real Account, Contact, Pipeline, Stage, or Owner IDs.
- Submits the fake account ID `acc-custom` during create.
- Generates an opportunity number from the current timestamp.
- Defaults to hardcoded pipeline and stage IDs.
- Forces VND.
- Omits valid backend fields including status-dependent close and lost-reason
  fields during update.
- Uses the full replacement endpoint with an incomplete payload, which can
  clear or reset fields.
- Uses `window.confirm` for delete.
- Does not pass the record version to delete and instead relies on the adapter
  default of `1`.

The current stage-advance action submits the frontend `stage` alias. The
adapter does not translate that alias into `currentStageId`, so the operation
can report success without changing the real backend stage.

It also displays false automation messages claiming that Draft Quote, Order,
and Contract workflows were triggered. No verified backend contract supports
those claims.

### 3.7 Current backend Opportunity contract

The implemented controller is rooted at `/api/opportunities` and currently
supports:

| Method | Path | Current behavior |
|---|---|---|
| `POST` | `/api/opportunities` | Create and return `201` |
| `GET` | `/api/opportunities/{id}` | Get detail |
| `GET` | `/api/opportunities` | Search with `PageResult` |
| `PUT` | `/api/opportunities/{id}` | Full replacement with body version |
| `DELETE` | `/api/opportunities/{id}` | Soft delete with `If-Match` |

The existing search contract accepts:

- `q`
- `accountId`
- `pipelineId`
- `stageId`
- `status`
- `opportunityType`
- `ownerType`
- `ownerId`
- `page`
- `size`

The response contract is the canonical `PageResult` shape:

```ts
interface PageResult<T> {
  items: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}
```

The current summary response contains IDs but no Account, Pipeline, Stage, or
Owner display references. A production table would otherwise require
frontend fabrication or an N+1 lookup pattern.

### 3.8 Current backend integrity gaps

The current backend validates that Account, Pipeline, Stage, Contact, and
Owner references exist or are in scope, but it does not yet enforce all
production invariants:

- `ownerType` can be submitted without `ownerId`; the mapper then attempts to
  construct an invalid owner.
- `ownerId` without `ownerType` is silently ignored.
- Request validation has a minimum probability but no request-level maximum,
  even though the domain and database limit probability to 100.
- An OPEN opportunity can reference a WON or LOST stage.
- Status can be changed independently of stage category.
- Primary Contact is not validated against the selected Account.
- Source, Campaign, and Lost reason are not validated through explicit domain
  errors before persistence.
- LOST without a reason throws an `IllegalArgumentException`; the service does
  not reliably map that path to the documented
  `OPPORTUNITY_LOST_REASON_REQUIRED` error.
- Terminal records are not required by the application service to have an
  actual close date.
- Reopened records can retain terminal-only data.
- Stage changes do not write the existing stage-history table.
- Update persistence uses an upsert and does not make the expected version an
  atomic SQL predicate, so a concurrent write can overwrite a later record.
- Delete does not check status, history, notes, stakeholders, or downstream
  commercial records.

### 3.9 Existing dormant schema capabilities

The database already contains:

- `crm_opportunity_stage_history`
- `crm_opportunity_contacts`

The stage-history table stores opportunity, pipeline, from-stage, to-stage,
actor, time, and reason. It does not currently store event type, from/to
status, or a different destination pipeline.

The opportunity-contact table stores Contact, role, primary state, and
influence level. It has a unique primary constraint but no stable stakeholder
ID, update audit fields, or optimistic-concurrency version.

Neither table currently has a Java application module or a public API surface.

### 3.10 Related-resource risks

The generic Note service currently authorizes create, read, update, and delete
with Account read permission. It does not resolve authorization from the
actual target type or apply Opportunity data scope.

The current Activity, Quote, Order, and Contract frontend adapters contain
speculative or fabricated normalization behavior and are not safe sources for
an Opportunity detail timeline or related-commerce tabs.

The production workspace must not expose these surfaces merely because a
database relationship or a UI mock exists.

## 4. Goals

The design must:

1. Make every displayed opportunity traceable to a real backend response.
2. Preserve backend pagination and filter semantics.
3. Make Pipeline and Stage configuration tenant-driven.
4. Support one pipeline context at a time in the board.
5. Prevent status and stage-category contradictions.
6. Make terminal transitions explicit and auditable.
7. Protect mutations with optimistic concurrency.
8. Provide a focused record-detail workspace.
9. Activate stage history and stakeholders through explicit APIs.
10. Correct Note authorization before enabling Opportunity Notes.
11. Enforce read/write permissions at navigation, route, action, and backend
    levels.
12. Provide complete operational states and accessible alternatives to drag
    and drop.
13. Preserve the existing React, TypeScript, Vite, Tailwind CSS, shadcn/ui,
    React Router, and TanStack Query stack.
14. Use English-only runtime copy.
15. Keep status presentation centralized.

## 5. Non-goals

This specification does not design or promise:

- A general sales forecasting engine
- Weighted forecast totals
- Exchange-rate conversion
- Pipeline velocity analytics
- Stage-duration analytics beyond displaying recorded history
- AI scoring or next-best-action recommendations
- Automatic quotation, order, or contract generation
- A unified activity timeline
- Email or calendar synchronization
- Bulk mutation
- Import or export
- Custom board formulas
- A new role hierarchy
- A new visual, form, table, icon, drag-and-drop, or state-management library
- A replacement for Pipeline Settings
- A new implementation plan

## 6. Design posture

The workspace is a dense, calm enterprise SaaS interface. It is not a
marketing dashboard.

Design rules:

- Prefer a direct operational hierarchy over decorative KPI cards.
- Use the existing application shell and light professional-blue direction.
- Use neutral surfaces, restrained borders, minimal elevation, and compact
  radii.
- Do not use blue-purple gradients, glass effects, large shadows, or nested
  cards.
- Use sentence case for headings and actions.
- Use tabular figures for amounts, percentages, counts, and dates.
- Keep key actions visible without repeating them in every section.
- Make closed-state consequences explicit before mutation.
- Never present inferred or fabricated business data as persisted truth.

## 7. Sources of truth and invariants

### 7.1 Data sources

The sources of truth are:

- Opportunity APIs for opportunity identity and business fields.
- Pipeline APIs for Pipeline and Stage configuration.
- Account search APIs for Account references.
- Contact search APIs for Contact references.
- Canonical user/team directory APIs for Owner references.
- Lead-source configuration APIs for Source references.
- Campaign APIs for Campaign references.
- Opportunity lost-reason APIs for Lost reason references.
- The URL for directory and selected-pipeline context.
- Backend version fields and `If-Match` for concurrency.

Frontend labels are display projections, not alternate identities. The
frontend must never invent a label when a reference cannot be resolved.

### 7.2 Opportunity identity

`id` is the immutable technical identifier.

`opportunityNumber` is the immutable human-facing identifier. The target
contract makes it server-generated according to a tenant-safe numbering rule.
The create UI does not generate it from time or ID fragments.

The number format is intentionally opaque to the frontend. The backend must
return a non-blank, tenant-unique value of at most 191 characters, but this
specification does not impose a display pattern or make UI behavior depend on
one.

### 7.3 Pipeline and stage

Every opportunity has exactly one Pipeline and one current Stage.

The current Stage must:

- Belong to the selected Pipeline.
- Be active for create or transition targets.
- Remain displayable when it later becomes inactive.
- Have a category consistent with Opportunity status.

Stage code and name are tenant configuration. Neither defines a frontend enum.

### 7.4 Status and stage-category consistency

The required mapping is:

| Stage category | Allowed Opportunity status |
|---|---|
| `OPEN` | `OPEN` |
| `WON` | `WON` |
| `LOST` | `LOST` |

`CANCELLED` retains the last current Stage but is excluded from active board
queries. Cancellation is an explicit status action, not a synthetic Pipeline
Stage.

### 7.5 Terminal-field consistency

- OPEN requires `actualCloseDate = null`.
- OPEN requires `lostReasonId = null` and `lostReasonNotes = null`.
- WON requires an actual close date and probability `100`.
- WON requires lost-reason fields to be null.
- LOST requires an actual close date, an active Lost reason, and probability
  `0`.
- CANCELLED requires an actual close date and probability `0`.
- CANCELLED requires lost-reason fields to be null.
- Actual close date cannot be in the future.
- Reopen clears terminal-only fields before returning the record to OPEN.

Date validation compares against the current business date supplied by the
backend TimeProvider in the tenant's configured timezone. If tenant timezone
configuration does not exist, the platform UTC date is the documented
fallback.

### 7.6 Currency

Amount is always represented as:

```ts
interface OpportunityAmount {
  amount: string;
  currencyCode: string;
}
```

The TypeScript boundary uses a decimal string to avoid binary floating-point
loss. Formatting occurs at the presentation edge with the supplied ISO
currency code.

Amounts with different currency codes must never be added together. The board
does not show a lane amount until the backend provides grouped aggregation by
currency.

### 7.7 Concurrency

Every mutable Opportunity, Stakeholder, and Note carries a positive version.

Mutation requests must include the expected version in the request body or an
`If-Match` header as specified by the endpoint. The database update must make
that version part of the atomic update predicate.

### 7.8 English-only runtime

Every label, placeholder, validation message, empty state, dialog, toast,
tooltip, accessible name, and error fallback introduced for this workspace is
English.

Backend enum values and configuration names are displayed through explicit
English labels. No Vietnamese fallback is introduced into the feature.

## 8. Information architecture and routes

### 8.1 Directory route

`/app/crm/opportunities` is the aggregate operating surface.

It contains:

1. A compact page header.
2. A List/Pipeline view switch.
3. View-specific filters.
4. A server-paginated List or a single-pipeline board.
5. Create action when permitted.

The page header uses:

- Title: `Opportunities`
- Supporting copy: `Manage qualified revenue opportunities across active sales pipelines.`
- Primary action: `Create opportunity`

No revenue KPI cards appear above the operational content.

### 8.2 Detail route

`/app/crm/opportunities/:opportunityId` is the record workspace.

It contains:

1. Back navigation to the preserved directory URL.
2. Opportunity number and name.
3. Account, Pipeline, Stage, Status, Amount, Owner, and Expected close summary.
4. Contextual actions based on status and permission.
5. Four tabs:
   - Overview
   - Stage history
   - Stakeholders
   - Notes

The route returns a record-level not-found surface when the Opportunity does
not exist, is soft-deleted, or is outside data scope.

### 8.3 Navigation matching

The Opportunities navigation item must remain active for both:

- `/app/crm/opportunities`
- `/app/crm/opportunities/:opportunityId`

Navigation visibility and route access require `crm_opportunity.read`.

## 9. URL state contract

### 9.1 Supported parameters

The directory URL supports:

| Parameter | Values | Purpose |
|---|---|---|
| `view` | `list`, `pipeline` | Active view |
| `q` | string | Search query |
| `accountId` | UUID | Account filter |
| `pipelineId` | UUID | Pipeline filter or selected board pipeline |
| `stageId` | UUID | Stage filter in List view |
| `status` | `OPEN`, `WON`, `LOST`, `CANCELLED` | Status filter |
| `type` | Opportunity type enum | Type filter |
| `ownerType` | `USER`, `TEAM` | Owner type filter |
| `ownerId` | UUID | Owner ID filter |
| `page` | positive one-based integer | Visible List page |
| `size` | supported page size | List page size |

The UI converts the one-based URL `page` to the backend zero-based page.

### 9.2 Defaults

- Missing `view` defaults to `list`.
- Missing `page` defaults to `1`.
- Missing `size` defaults to `20`.
- Missing filters mean no filter.
- Pipeline view selects the active default SALES Pipeline when `pipelineId` is
  absent.
- If no active default SALES Pipeline exists, it selects the first active
  Pipeline in the stable backend order.
- If no active Pipeline exists, the page shows a configuration-empty state and
  does not create a fake Pipeline.

### 9.3 Normalization rules

- Changing a List filter resets `page` to `1`.
- Switching to Pipeline view preserves compatible search context but removes
  List-only `stageId`, `status`, `page`, and `size` parameters.
- Switching to List view preserves `pipelineId` as a filter.
- Clearing Owner removes both `ownerType` and `ownerId`.
- An Owner filter is sent only when both values are present.
- Unknown enum values and malformed UUIDs are removed from the URL and
  replaced by safe defaults.
- Per-lane load-more state is query-local and is not serialized into the URL.

## 10. Authorization and data scope

### 10.1 Permission matrix

| Capability | Permission | Scope requirement |
|---|---|---|
| Open directory or detail | `crm_opportunity.read` | Opportunity visible in authorized scope |
| Search and board lanes | `crm_opportunity.read` | Every returned record scoped |
| View stage history | `crm_opportunity.read` | Parent Opportunity visible |
| View stakeholders | `crm_opportunity.read` | Parent Opportunity visible |
| View notes | `crm_opportunity.read` | Parent Opportunity visible plus note visibility |
| Create Opportunity | `crm_opportunity.write` | Assigned Account and Owner valid in write scope |
| Edit Opportunity | `crm_opportunity.write` | Parent Opportunity visible in write scope |
| Transition Opportunity | `crm_opportunity.write` | Parent and target references valid in write scope |
| Add/edit/remove stakeholder | `crm_opportunity.write` | Parent and Contact valid in write scope |
| Add/edit/remove note | `crm_opportunity.write` | Parent visible in write scope plus note ownership rule |
| Delete Opportunity | `crm_opportunity.write` | Parent visible and delete eligibility passes |

### 10.2 Frontend behavior

Users without `crm_opportunity.read` cannot enter either route.

Users with read but not write permission:

- Can use List and Pipeline views.
- Can open detail tabs.
- Cannot see create, edit, transition, stakeholder mutation, note mutation, or
  delete controls.
- Do not receive disabled write controls that imply a request may be made.

Frontend capability checks are presentation behavior only. Every backend
endpoint must enforce permission and data scope independently.

### 10.3 Reference scope

Selectors must not expose IDs or labels outside the current user's authorized
scope.

- Account choices use Account write scope for create/edit.
- Contact choices are constrained to the selected Account and scope.
- User and Team Owner choices follow authorized owner-assignment rules.
- Pipeline, Stage, Source, Campaign, and Lost reason choices are tenant-bound
  and active where required.
- A stale selected reference may be displayed read-only but cannot be selected
  for a new mutation.

### 10.4 Note visibility

Opportunity scope is evaluated before Note visibility.

- `PRIVATE`: visible only to the note owner.
- `TEAM`: visible to the note owner and actors sharing an authorized active
  team with the owner.
- `TENANT`: visible to actors who can read the parent Opportunity.

Note update and delete require Opportunity write permission and either note
ownership or TENANT data scope. The backend must not infer authority from a
frontend role name.

## 11. Target frontend domain model

### 11.1 Enumerations

```ts
type OpportunityStatus = 'OPEN' | 'WON' | 'LOST' | 'CANCELLED';

type OpportunityType =
  | 'NEW_BUSINESS'
  | 'UPSELL'
  | 'CROSS_SELL'
  | 'RENEWAL'
  | 'PARTNERSHIP'
  | 'OTHER';

type OpportunityOwnerType = 'USER' | 'TEAM';

type StageCategory = 'OPEN' | 'WON' | 'LOST';

type ForecastCategory =
  | 'OMITTED'
  | 'PIPELINE'
  | 'BEST_CASE'
  | 'COMMIT'
  | 'CLOSED';
```

There is no frontend `OpportunityStage` enum. Stage IDs, codes, names, order,
probability, and categories are backend configuration.

### 11.2 Reference shapes

```ts
interface AccountReference {
  id: string;
  accountNumber: string;
  displayName: string;
}

interface PipelineReference {
  id: string;
  pipelineCode: string;
  name: string;
}

interface StageReference {
  id: string;
  stageCode: string;
  name: string;
  displayOrder: number;
  defaultProbability: string;
  stageCategory: StageCategory;
  forecastCategory: ForecastCategory;
  active: boolean;
}

interface OwnerReference {
  type: OpportunityOwnerType;
  id: string;
  displayName: string;
}

interface ContactReference {
  id: string;
  contactNumber: string;
  displayName: string;
  jobTitle: string | null;
  accountId: string;
}

interface NamedReference {
  id: string;
  name: string;
}
```

### 11.3 Opportunity summary

```ts
interface OpportunitySummaryResponse {
  id: string;
  opportunityNumber: string;
  name: string;
  account: AccountReference;
  pipeline: PipelineReference;
  currentStage: StageReference;
  owner: OwnerReference | null;
  primaryContact: ContactReference | null;
  opportunityType: OpportunityType;
  status: OpportunityStatus;
  amount: OpportunityAmount;
  probability: string;
  expectedCloseDate: string | null;
  nextStep: string | null;
  updatedAt: string;
  version: number;
}
```

### 11.4 Opportunity detail

```ts
interface OpportunityResponse extends OpportunitySummaryResponse {
  source: NamedReference | null;
  actualCloseDate: string | null;
  description: string | null;
  lostReason: NamedReference | null;
  lostReasonNotes: string | null;
  campaign: NamedReference | null;
  createdAt: string;
  createdBy: NamedReference | null;
  updatedBy: NamedReference | null;
}
```

The target responses embed display references. They do not expose parallel
`accountId` plus fabricated `accountName` aliases. If compatibility requires
raw IDs temporarily, the frontend adapter must map an exact documented
response into this model without inventing missing labels.

## 12. Core search contract

### 12.1 Endpoint

```http
GET /api/opportunities
```

Required permission: `crm_opportunity.read`.

### 12.2 Query parameters

| Parameter | Type | Rule |
|---|---|---|
| `q` | string | Trimmed; matches number, name, and next step |
| `accountId` | UUID | Exact Account |
| `pipelineId` | UUID | Exact Pipeline |
| `stageId` | UUID | Exact current Stage |
| `status` | enum | Exact status |
| `opportunityType` | enum | Exact type |
| `ownerType` | enum | Must be paired with `ownerId` |
| `ownerId` | UUID | Must be paired with `ownerType` |
| `page` | integer | Zero-based, minimum `0` |
| `size` | integer | `1` through `100` |

The backend rejects an incomplete Owner pair with
`REQUEST_VALIDATION_FAILED`. It does not silently ignore either field.

### 12.3 Response

```ts
interface PageResult<T> {
  items: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}
```

The frontend accepts only this shape. It does not accept `content`,
`pageNumber`, `pageSize`, a bare array, or a fallback count.

Search applies every filter before pagination and uses a deterministic order:

1. `updatedAt DESC`
2. `id DESC`

### 12.4 Enriched projection requirement

The search query joins scoped Account, Pipeline, Stage, Owner, and optional
Primary Contact display data in the backend projection.

It must not:

- Return a row outside Opportunity data scope.
- Turn a missing required Account, Pipeline, or Stage into a fabricated label.
- Execute a separate lookup per Opportunity from the frontend.
- Change `totalElements` because an optional display reference is unavailable.

Historical inactive Pipeline or Stage references remain present with
`active: false`.

## 13. List view design

### 13.1 Header and controls

The List view places controls in this order:

1. Page title and supporting copy.
2. List/Pipeline segmented control.
3. Primary `Create opportunity` action when permitted.
4. Search and filters.
5. Results table.
6. Pagination.

The total record count belongs in the results context, not in a decorative KPI
card.

### 13.2 Table columns

Desktop columns are:

| Column | Content |
|---|---|
| Opportunity | Name and immutable Opportunity number |
| Account | Account display name and Account number |
| Pipeline stage | Dynamic Stage name with centralized category styling |
| Status | OPEN, WON, LOST, or CANCELLED badge |
| Amount | Locale-formatted value and response currency |
| Probability | Percentage with text and compact visual indicator |
| Expected close | Locale-formatted date or em dash |
| Owner | Canonical User or Team display name or `Unassigned` |
| Next step | Truncated plain text or `No next step` |
| Actions | Permission- and status-aware action menu |

The Opportunity name is the primary link to the detail route. The entire row
may be pointer-selectable, but the name remains a real focusable link.

The table never displays the technical UUID as the human identifier.

### 13.3 Sorting

The initial production scope uses the backend's deterministic updated-time
order. The UI does not display sortable headers until the backend documents
and implements sort parameters.

Static sortable icons without server behavior are prohibited.

### 13.4 Row actions

The row action menu can contain:

- `Open opportunity`
- `Edit details`
- `Move to stage`
- `Mark as won`
- `Mark as lost`
- `Cancel opportunity`
- `Reopen opportunity`
- `Delete opportunity`

Actions are derived from current status, target configuration, permission, and
delete eligibility. The menu does not show impossible actions.

### 13.5 Pagination

- Default page size: `20`.
- Supported page sizes: `20`, `50`, `100`.
- Pagination uses backend `totalElements` and `totalPages` exactly.
- A filter change resets to the first page.
- If deletion removes the last record on a non-first page, the URL moves to
  the preceding valid page after a successful response.
- Background refresh preserves the current rows until the new response
  arrives.

## 14. List filters

### 14.1 Search

The search placeholder is:

`Search by name, number, or next step`

Search is debounced at the UI boundary and written to the URL after trimming.
The backend remains responsible for matching.

The UI must not imply that Account or Owner labels are searched unless the
backend later extends the documented `q` contract.

### 14.2 Filter controls

The primary row contains:

- Search
- Pipeline
- Stage
- Status
- Account
- Owner
- `More filters`

`More filters` contains:

- Opportunity type
- Expected close date range only after the backend implements date filters

Until date filters exist in the API, the control is not rendered.

### 14.3 Dependent filters

- Stage is disabled until a Pipeline is selected.
- Stage options come from the selected Pipeline detail.
- Changing Pipeline clears an incompatible Stage.
- Owner is one logical selector that writes both `ownerType` and `ownerId`.
- Clearing Account or Owner removes the query parameter rather than sending an
  empty string.

### 14.4 Filter summary and reset

Applied filters appear as removable tokens on narrow layouts and as populated
controls on desktop.

`Reset filters` removes all filters, resets page to `1`, and preserves the
current view.

The results summary uses concrete copy:

- `128 opportunities`
- `12 opportunities match these filters`

Counts come only from backend `totalElements`.

## 15. Pipeline view design

### 15.1 One Pipeline at a time

Pipeline view requires one selected active Pipeline.

The view header contains:

- Pipeline selector
- Pipeline name
- Optional Pipeline type label
- List/Pipeline switch
- Create action when permitted

It does not render an all-pipeline board. Mixing tenant pipelines would make
stage order and meaning ambiguous.

### 15.2 Pipeline configuration source

The UI loads:

```http
GET /api/crm/pipelines
GET /api/crm/pipelines/{pipelineId}
```

Only active Pipelines are selectable for new work. The selected Pipeline
detail supplies its Stage list.

Lane rules:

- Use only active Stages for operational target lanes.
- Sort by `displayOrder`, then `id` as a deterministic tie-breaker.
- Use backend Stage name and code.
- Do not substitute a local default Pipeline when the API is empty or fails.
- If the selected Pipeline becomes inactive, show its data read-only and ask
  the user to select an active Pipeline.

### 15.3 Lane queries

Each Stage is an independent infinite query.

For a Stage category, the query is:

| Stage category | Search filters |
|---|---|
| `OPEN` | `pipelineId`, `stageId`, `status=OPEN` |
| `WON` | `pipelineId`, `stageId`, `status=WON` |
| `LOST` | `pipelineId`, `stageId`, `status=LOST` |

Each lane uses:

- Initial size: `20`.
- Backend `totalElements` for the lane count.
- `Load more` when another page exists.
- Its own loading, background-refresh, empty, and error state.

The board never calls a "get all" endpoint with a fixed maximum and never
derives the total from loaded cards.

### 15.4 Lane header

Each lane header shows:

- Stage name
- Stage category treatment
- Backend total count
- Default probability as secondary configuration context

It does not show an amount total. A future amount summary requires a backend
aggregation grouped by currency.

### 15.5 Opportunity card

A card displays:

- Opportunity name
- Opportunity number
- Account display name
- Amount with currency
- Probability
- Expected close date
- Owner
- A visible action menu

Cards use one flat surface with a restrained border. They do not contain
nested cards, oversized avatars, or decorative icons that displace business
content.

### 15.6 Moving cards

The canonical accessible action is `Move to stage` from the card menu.

Pointer drag-and-drop is a progressive enhancement using the existing stack.
It must not be the only way to move a card.

- Dropping on an OPEN Stage invokes `MOVE_STAGE`.
- Dropping on a WON Stage opens the `Mark as won` dialog.
- Dropping on a LOST Stage opens the `Mark as lost` dialog.
- The card remains in the source lane until the backend confirms the
  transition.
- A successful response moves or invalidates only the affected lane queries.
- A failed response keeps the card in its original lane and provides an
  accessible error message.
- Keyboard users invoke the same transition through the card menu.

The board does not perform an optimistic business-state mutation before the
server validates version and invariants.

### 15.7 Cancelled opportunities

CANCELLED is not a Pipeline Stage and has no board lane.

Cancelled records remain available in List view and detail routes. Reopening a
cancelled record requires an explicit target OPEN Stage.

## 16. Detail workspace

### 16.1 Record header

The header shows:

- Back link: `Back to opportunities`
- Opportunity number
- Opportunity name
- Status badge
- Dynamic Stage badge
- Account link
- Amount and currency
- Probability
- Expected close date
- Owner

Primary actions are contextual:

- OPEN: `Edit details`, `Move to stage`, and overflow terminal actions.
- WON: `Edit details` and `Reopen opportunity` when permitted.
- LOST: `Edit details` and `Reopen opportunity` when permitted.
- CANCELLED: `Edit details` and `Reopen opportunity` when permitted.
- Read-only user: no mutation actions.

### 16.2 Tabs

The tabs are:

1. Overview
2. Stage history
3. Stakeholders
4. Notes

The active tab may be represented by `?tab=overview`, `stage-history`,
`stakeholders`, or `notes`. An invalid tab normalizes to `overview`.

Each tab owns an independent query boundary. A Notes error does not replace
Overview or the record header.

### 16.3 Back-navigation context

Opening detail from the directory preserves the full directory URL in router
state or an encoded safe return location.

The Back action returns to the same view, filters, Pipeline, and List page.
Direct entry returns to `/app/crm/opportunities`.

## 17. Overview tab

Overview uses compact labeled sections instead of a wall of cards.

### 17.1 Identity

- Opportunity number
- Name
- Opportunity type
- Status

### 17.2 Customer

- Account with link
- Primary Contact with link when present
- Stakeholder count from the stakeholder query only when already loaded or
  supplied by a documented summary field

### 17.3 Pipeline

- Pipeline
- Current Stage
- Stage category
- Forecast category
- Probability

### 17.4 Commercial value

- Amount
- Currency
- Source
- Campaign

No weighted value is shown unless the backend returns a documented value.

### 17.5 Timing and next action

- Expected close date
- Actual close date for terminal records
- Next step

### 17.6 Outcome

The outcome section appears only for terminal records:

- WON: actual close date
- LOST: actual close date, Lost reason, and Lost reason notes
- CANCELLED: actual close date

### 17.7 Description and audit

- Description as plain formatted text
- Created by and created at
- Updated by and updated at
- Current version is not shown as business content but remains available to
  mutation controls

## 18. Create and edit experience

### 18.1 Container

Create and edit use a wide side panel on desktop and a full-screen sheet on
mobile. A small centered modal is not used for this multi-section form.

The form keeps one scroll container, a sticky action footer, and a visible
title:

- `Create opportunity`
- `Edit opportunity`

Closing a dirty form opens an unsaved-changes confirmation dialog.

### 18.2 Field groups

The form groups fields as:

1. Identity
   - Name
   - Opportunity type
2. Customer
   - Account
   - Primary Contact
3. Pipeline
   - Pipeline
   - Stage
4. Commercial
   - Amount
   - Currency
   - Probability
5. Timing
   - Expected close date
   - Next step
6. Ownership
   - Owner
7. Context
   - Source
   - Campaign
   - Description

Opportunity number is not an editable create field. The server returns it
after successful creation.

### 18.3 Create request

Target endpoint:

```http
POST /api/opportunities
```

Target body:

```ts
interface CreateOpportunityRequest {
  name: string;
  accountId: string;
  pipelineId: string;
  currentStageId: string;
  owner: {
    type: OpportunityOwnerType;
    id: string;
  } | null;
  sourceId: string | null;
  primaryContactId: string | null;
  opportunityType: OpportunityType;
  amount: OpportunityAmount;
  probability: string;
  expectedCloseDate: string | null;
  nextStep: string | null;
  description: string | null;
  campaignId: string | null;
}
```

Create invariants:

- Server generates a unique immutable Opportunity number.
- Status is OPEN.
- Selected Pipeline is active.
- Selected Stage is active, belongs to Pipeline, and has category OPEN.
- Probability defaults to the selected Stage default and can be changed from
  `0` through `100` before submit.
- Amount is non-negative with at most 14 integer and 6 fractional digits.
- Currency is an uppercase three-character ISO code.
- Primary Contact belongs to the selected Account.
- A supplied Primary Contact creates the corresponding primary Stakeholder
  link with role `OTHER` in the same transaction.
- Owner is valid in the actor's write scope.
- Source, Campaign, and Lost reason reference validation is explicit.
- Actual close and Lost fields are not accepted in create.

The existing client-supplied `opportunityNumber` request is a current contract,
not the production target. Migration must preserve compatibility only for
existing callers and document the final contract in `docs/api-reference.md`.

### 18.4 General edit request

The new UI uses a partial update endpoint:

```http
PATCH /api/opportunities/{id}
Content-Type: application/merge-patch+json
```

```ts
interface UpdateOpportunityRequest {
  version: number;
  name?: string;
  accountId?: string;
  owner?: {
    type: OpportunityOwnerType;
    id: string;
  } | null;
  sourceId?: string | null;
  primaryContactId?: string | null;
  opportunityType?: OpportunityType;
  amount?: OpportunityAmount;
  probability?: string;
  expectedCloseDate?: string | null;
  nextStep?: string | null;
  description?: string | null;
  campaignId?: string | null;
}
```

Omitted fields remain unchanged. Explicit null clears a nullable field.
The backend must preserve property-presence information while parsing the
merge-patch document; deserializing into a type that cannot distinguish absent
from null is not sufficient.

The general edit endpoint does not accept:

- `opportunityNumber`
- `pipelineId`
- `currentStageId`
- `status`
- `actualCloseDate`
- `lostReasonId`
- `lostReasonNotes`

Those fields change only through explicit transition workflows.

General edit is available for OPEN and terminal records. For WON, LOST, and
CANCELLED records, probability is read-only and must remain at the terminal
value. Account changes remain restricted to OPEN records. Lifecycle fields
remain editable only through transitions.

The existing `PUT` endpoint may remain temporarily for compatibility, but the
new workspace must not call it. It must eventually enforce the same invariants
and must not reset omitted business data.

### 18.5 Account changes

Account can change only while status is OPEN.

Before saving a different Account:

- Primary Contact must be null or belong to the new Account.
- Every Stakeholder must belong to the new Account.
- If either condition fails, the backend returns
  `OPPORTUNITY_ACCOUNT_CHANGE_BLOCKED`.
- The UI directs the user to replace or remove incompatible contacts before
  retrying.

The backend does not silently remove Stakeholders or Primary Contact during a
general edit.

### 18.6 Validation presentation

- Required errors appear below their field.
- Cross-field errors appear at the relevant group and in a form summary.
- The first invalid field receives focus after submit.
- Backend field paths map to the corresponding control.
- Business-rule errors remain visible until the user changes a related field
  or dismisses the message.
- Success copy contains no exclamation mark.

## 19. Reference selectors

### 19.1 General behavior

Selectors use canonical ID and display-label results from real APIs.

Every async selector provides:

- Debounced search
- Initial loading skeleton
- Background-loading indicator
- Empty state
- Error and retry state
- Keyboard navigation
- Selected-value persistence
- Clear behavior when nullable

Selectors do not load arbitrary fixed-size result sets and then filter them in
the browser.

### 19.2 Account

- Required.
- Searches scoped active Accounts.
- Displays Account name and Account number.
- Does not permit free-text Account creation from the Opportunity form.

### 19.3 Contact

- Optional.
- Disabled until Account is selected.
- Searches only Contacts belonging to the selected Account and visible in
  scope.
- Clears after explicit confirmation when Account changes and the selected
  Contact is no longer valid.

### 19.4 Pipeline and Stage

- Pipeline is required on create.
- Stage is required and disabled until Pipeline loads.
- Stage options use only active OPEN-category Stages during create.
- Edit displays current Pipeline and Stage read-only; changes use the
  transition workflow.

### 19.5 Owner

- Owner is one control returning `{ type, id, displayName }`.
- Results distinguish User and Team visually and textually.
- Candidate sources are canonical user/team directories, not approval history
  or local fixtures.
- An empty Owner is allowed only if the backend's ownership policy permits it.

### 19.6 Source, Campaign, and Lost reason

- Source and Campaign are optional searchable selectors.
- Only active values are selectable.
- Existing inactive references remain displayable in detail.
- Lost reason appears only in the Mark lost workflow.
- Lost reason is required and must be active.

## 20. Opportunity transition API

### 20.1 Endpoint

Stage, Pipeline, and lifecycle changes use one explicit command endpoint:

```http
POST /api/opportunities/{id}/transitions
```

Required permission: `crm_opportunity.write`.

The endpoint is not a generic partial update. It validates an allowed business
transition and writes its history in the same transaction.

### 20.2 Action enumeration

```ts
type OpportunityTransitionAction =
  | 'MOVE_STAGE'
  | 'CHANGE_PIPELINE'
  | 'MARK_WON'
  | 'MARK_LOST'
  | 'CANCEL'
  | 'REOPEN';
```

### 20.3 Request

```ts
interface OpportunityTransitionRequest {
  version: number;
  action: OpportunityTransitionAction;
  targetPipelineId?: string;
  targetStageId?: string;
  actualCloseDate?: string;
  lostReasonId?: string;
  lostReasonNotes?: string | null;
  reason?: string | null;
}
```

Field rules depend on action. The backend rejects extraneous terminal fields
instead of silently storing or ignoring them.

### 20.4 Response

```ts
interface OpportunityTransitionResponse {
  opportunity: OpportunityResponse;
  historyEntry: OpportunityStageHistoryEntry;
}
```

The returned Opportunity is authoritative. The frontend does not reconstruct a
new local record from the request.

### 20.5 Atomicity

One transaction must:

1. Load the scoped Opportunity.
2. Check expected version.
3. Validate target Pipeline, Stage, status, and dependent references.
4. Apply the transition.
5. Atomically update the Opportunity using the expected version predicate.
6. Insert one immutable history entry.
7. Commit both changes or neither.

A history insert cannot succeed without its Opportunity update, and an
Opportunity stage change cannot succeed without history.

## 21. Transition rules

### 21.1 Transition matrix

| Action | Allowed source | Target requirement | Result |
|---|---|---|---|
| `MOVE_STAGE` | OPEN | Active OPEN Stage in current Pipeline | Remains OPEN |
| `CHANGE_PIPELINE` | OPEN | Active Pipeline and active OPEN Stage | Remains OPEN |
| `MARK_WON` | OPEN | Active WON Stage in current Pipeline | Status WON |
| `MARK_LOST` | OPEN | Active LOST Stage in current Pipeline | Status LOST |
| `CANCEL` | OPEN | No target Stage | Status CANCELLED; retain current Stage |
| `REOPEN` | WON, LOST, CANCELLED | Active OPEN Stage, optionally in a selected active Pipeline | Status OPEN |

No action is allowed from a soft-deleted Opportunity.

### 21.2 Move stage

Required request fields:

- `version`
- `action = MOVE_STAGE`
- `targetStageId`

Rules:

- Source status is OPEN.
- Target belongs to current Pipeline.
- Target is active and category OPEN.
- Target differs from current Stage.
- Pipeline is unchanged.
- Status is unchanged.
- Existing probability is not silently overwritten.
- Actual close and Lost fields remain null.
- Optional reason is trimmed and limited to 255 characters.

### 21.3 Change pipeline

Required request fields:

- `version`
- `action = CHANGE_PIPELINE`
- `targetPipelineId`
- `targetStageId`

Rules:

- Source status is OPEN.
- Target Pipeline is active.
- Target Stage belongs to target Pipeline, is active, and is category OPEN.
- Target Pipeline differs from current Pipeline.
- Existing probability is preserved unless the user explicitly edits it in a
  separate general update.
- History stores both source and destination Pipeline references.
- The transition dialog shows the meaning of the target Stage and its default
  probability without claiming that the Opportunity probability will change.

### 21.4 Mark as won

Required request fields:

- `version`
- `action = MARK_WON`
- `targetStageId`
- `actualCloseDate`

Rules:

- Source status is OPEN.
- Target belongs to current Pipeline, is active, and is category WON.
- Actual close date is not in the future.
- Status becomes WON.
- Probability becomes `100`.
- Lost reason and Lost notes become null.
- The dialog clearly states that the Opportunity will leave the active
  pipeline.

Success copy:

`Opportunity marked as won.`

It does not claim that an Order or Contract was created.

### 21.5 Mark as lost

Required request fields:

- `version`
- `action = MARK_LOST`
- `targetStageId`
- `actualCloseDate`
- `lostReasonId`

Optional:

- `lostReasonNotes`, maximum 255 characters

Rules:

- Source status is OPEN.
- Target belongs to current Pipeline, is active, and is category LOST.
- Lost reason exists, is active, and belongs to the tenant.
- Actual close date is not in the future.
- Status becomes LOST.
- Probability becomes `0`.

Success copy:

`Opportunity marked as lost.`

### 21.6 Cancel

Required request fields:

- `version`
- `action = CANCEL`
- `actualCloseDate`

Optional:

- `reason`, maximum 255 characters

Rules:

- Source status is OPEN.
- Current Pipeline and Stage are retained for audit context.
- Status becomes CANCELLED.
- Probability becomes `0`.
- Actual close date is not in the future.
- Lost reason fields become null.
- Cancelled records disappear from active OPEN lanes after success.

Success copy:

`Opportunity cancelled.`

### 21.7 Reopen

Required request fields:

- `version`
- `action = REOPEN`
- `targetStageId`

Optional:

- `targetPipelineId`
- `reason`, maximum 255 characters

Rules:

- Source status is WON, LOST, or CANCELLED.
- Target Pipeline defaults to the current Pipeline when omitted.
- Target Pipeline is active.
- Target Stage belongs to target Pipeline, is active, and is category OPEN.
- Status becomes OPEN.
- Actual close date becomes null.
- Lost reason fields become null.
- Probability becomes the target Stage default probability because the
  terminal probability is not meaningful after reopening.
- Confirmation lists the fields that will be cleared.

Success copy:

`Opportunity reopened.`

### 21.8 Disallowed implicit transitions

The backend must reject:

- OPEN status with WON or LOST Stage.
- WON status with OPEN or LOST Stage.
- LOST status with OPEN or WON Stage.
- Status changes through general edit.
- Stage changes through general edit.
- Direct drag updates that bypass the transition endpoint.
- Reopen without an explicit valid OPEN target Stage.
- LOST without a valid active Lost reason.
- Terminal transitions without an actual close date.
- Future actual close dates.

## 22. Stage history

### 22.1 Endpoint

```http
GET /api/opportunities/{id}/stage-history?page=0&size=20
```

Required permission: `crm_opportunity.read`.

The endpoint returns newest entries first as `PageResult`.

### 22.2 Event type

```ts
type OpportunityStageHistoryEventType =
  | 'STAGE_MOVED'
  | 'PIPELINE_CHANGED'
  | 'MARKED_WON'
  | 'MARKED_LOST'
  | 'CANCELLED'
  | 'REOPENED';
```

### 22.3 Response

```ts
interface OpportunityStageHistoryEntry {
  id: string;
  opportunityId: string;
  eventType: OpportunityStageHistoryEventType;
  fromPipeline: PipelineReference;
  toPipeline: PipelineReference;
  fromStage: StageReference | null;
  toStage: StageReference;
  fromStatus: OpportunityStatus;
  toStatus: OpportunityStatus;
  lostReason: NamedReference | null;
  reason: string | null;
  changedBy: NamedReference | null;
  changedAt: string;
}
```

For cancellation, `fromStage` and `toStage` can reference the same retained
Stage because the meaningful change is status. The database constraint that
requires different Stage IDs must therefore be revised to support status-only
events.

### 22.4 Persistence changes

The current history schema is insufficient for the approved event model. The
target persistence shape must support:

- Event type
- Source Pipeline ID
- Destination Pipeline ID
- Source Stage ID
- Destination Stage ID
- Source status
- Destination status
- Lost reason ID when applicable
- Actor
- Time
- Optional reason

Historical references use restrictive foreign keys or durable snapshots so a
Pipeline Settings mutation cannot erase the audit trail.

### 22.5 Immutability

Stage history has no create, update, or delete public endpoint.

Only the Opportunity transition application service writes it. Rows are
append-only and tenant-bound.

### 22.6 UI

The Stage history tab uses a chronological event list with:

- Event label
- From and to Pipeline/Stage where applicable
- Status change
- Actor
- Timestamp
- Reason
- Lost reason for loss events

The tab does not infer duration, velocity, or automation events.

## 23. Stakeholders

### 23.1 Purpose

Stakeholders represent the Account contacts involved in a specific
Opportunity. They are not free-text people and they are not a replacement for
the Contact record.

### 23.2 Role enumeration

```ts
type OpportunityStakeholderRole =
  | 'DECISION_MAKER'
  | 'CHAMPION'
  | 'INFLUENCER'
  | 'PROCUREMENT'
  | 'TECHNICAL_EVALUATOR'
  | 'LEGAL'
  | 'OTHER';

type OpportunityStakeholderInfluence = 'LOW' | 'MEDIUM' | 'HIGH';
```

The UI displays sentence-case English labels.

### 23.3 Endpoints

```http
GET    /api/opportunities/{id}/stakeholders
POST   /api/opportunities/{id}/stakeholders
PATCH  /api/opportunities/{id}/stakeholders/{stakeholderId}
DELETE /api/opportunities/{id}/stakeholders/{stakeholderId}
```

Read requires `crm_opportunity.read`. Mutations require
`crm_opportunity.write`.

### 23.4 Response

```ts
interface OpportunityStakeholderResponse {
  id: string;
  opportunityId: string;
  contact: ContactReference;
  role: OpportunityStakeholderRole;
  influenceLevel: OpportunityStakeholderInfluence | null;
  primary: boolean;
  createdAt: string;
  createdBy: NamedReference | null;
  updatedAt: string;
  updatedBy: NamedReference | null;
  version: number;
}
```

The list returns stable role order, then Contact display name, then ID. The
expected stakeholder count is small, so the initial endpoint returns a typed
array rather than speculative pagination.

The role order is Decision maker, Champion, Technical evaluator, Influencer,
Procurement, Legal, then Other.

### 23.5 Create request

```ts
interface CreateOpportunityStakeholderRequest {
  contactId: string;
  role: OpportunityStakeholderRole;
  influenceLevel: OpportunityStakeholderInfluence | null;
  primary: boolean;
}
```

### 23.6 Update request

```ts
interface UpdateOpportunityStakeholderRequest {
  version: number;
  role: OpportunityStakeholderRole;
  influenceLevel: OpportunityStakeholderInfluence | null;
  primary: boolean;
}
```

Delete sends the Stakeholder version through `If-Match`.

### 23.7 Invariants

- Parent Opportunity exists and is in write scope.
- Contact exists, is not soft-deleted, and is visible in scope.
- Contact belongs to the Opportunity Account.
- A Contact appears at most once per Opportunity.
- At most one Stakeholder is primary.
- Making a Stakeholder primary updates `primaryContactId` in the same
  transaction.
- Setting a different Primary Contact makes the prior Stakeholder non-primary
  in the same transaction.
- Removing the primary Stakeholder clears `primaryContactId` after explicit
  confirmation.
- Setting `primaryContactId` from general edit creates or promotes the
  corresponding Stakeholder using role `OTHER` when no Stakeholder link
  exists.
- Creating an Opportunity with `primaryContactId` creates the same primary
  Stakeholder link atomically.
- Version conflict never overwrites a newer role or primary decision.

### 23.8 Persistence changes

The current composite-key table must gain the fields needed by the public
contract:

- Stable `id`
- `updatedAt`
- `updatedBy`
- Positive `version`

The unique Opportunity/Contact and one-primary constraints remain enforced in
the database.

### 23.9 UI

The tab uses a compact table or mobile list with:

- Contact
- Job title
- Role
- Influence
- Primary state
- Actions

The empty state is:

- Title: `No stakeholders yet`
- Description: `Add contacts involved in this opportunity.`
- Action: `Add stakeholder` when permitted

## 24. Opportunity notes

### 24.1 Authorization correction is a release gate

The Notes tab must remain unavailable for mutation until the generic Note
service stops authorizing every target with Account read permission.

The backend must resolve authorization from the target Opportunity before the
frontend enables the approved endpoints.

### 24.2 Endpoints

```http
GET    /api/opportunities/{id}/notes?page=0&size=20
POST   /api/opportunities/{id}/notes
PATCH  /api/opportunities/{id}/notes/{noteId}
DELETE /api/opportunities/{id}/notes/{noteId}
```

These scoped endpoints may reuse the generic Note domain and repository. The
URL parent remains authoritative and prevents a request body from assigning a
different target.

### 24.3 Response

```ts
type NoteVisibility = 'PRIVATE' | 'TEAM' | 'TENANT';

interface OpportunityNoteResponse {
  id: string;
  opportunityId: string;
  title: string | null;
  body: string;
  visibility: NoteVisibility;
  owner: NamedReference;
  createdAt: string;
  createdBy: NamedReference | null;
  updatedAt: string;
  updatedBy: NamedReference | null;
  version: number;
}
```

List returns `PageResult<OpportunityNoteResponse>` ordered by:

1. `createdAt DESC`
2. `id DESC`

### 24.4 Create request

```ts
interface CreateOpportunityNoteRequest {
  title: string | null;
  body: string;
  visibility: NoteVisibility;
}
```

- Title is optional and at most 255 characters.
- Body is required and non-blank.
- Visibility defaults to TEAM in the UI.
- Owner is always the current actor and is not accepted from the request.
- Parent Opportunity is taken from the URL.

### 24.5 Update request

```ts
interface UpdateOpportunityNoteRequest {
  version: number;
  title: string | null;
  body: string;
  visibility: NoteVisibility;
}
```

Delete sends Note version through `If-Match`.

### 24.6 Access rules

- List/get requires `crm_opportunity.read` and parent Opportunity scope.
- Create requires `crm_opportunity.write` and parent Opportunity scope.
- Update/delete requires `crm_opportunity.write`, parent Opportunity scope,
  and note ownership or TENANT data scope.
- The note must reference the same Opportunity as the URL.
- PRIVATE notes are filtered before response serialization.
- TEAM visibility is resolved through active tenant-team membership.
- A hidden Note is returned as not found, not as a leaked permission detail.

### 24.7 UI

The tab shows:

- Note title when present
- Full body with safe plain-text line breaks
- Visibility
- Owner
- Created and updated timestamps
- Edit/delete actions when authorized

The first production version does not render arbitrary Markdown or HTML.

The empty state is:

- Title: `No notes yet`
- Description: `Capture context that helps the team progress this opportunity.`
- Action: `Add note` when permitted

## 25. Delete policy

### 25.1 Default lifecycle action

Cancellation is the default way to stop pursuing an Opportunity. Delete is
reserved for a record created by mistake.

### 25.2 Eligibility

Delete is allowed only when all conditions are true:

- Status is OPEN.
- The Opportunity is in the actor's write scope.
- No Stage history entry exists.
- No Stakeholder exists.
- No Note exists.
- No Quote references the Opportunity.
- No Order references the Opportunity.
- No Contract references the Opportunity.
- No other protected commercial dependency exists.

The backend evaluates eligibility at mutation time. A stale frontend decision
does not authorize deletion.

### 25.3 Endpoint

```http
DELETE /api/opportunities/{id}
If-Match: "{version}"
```

The delete remains a soft delete and returns `204 No Content`.

### 25.4 Confirmation

The UI uses an accessible destructive confirmation dialog:

- Title: `Delete opportunity?`
- Body: `This removes the opportunity from active CRM views. Use Cancel opportunity when the deal was intentionally stopped.`
- Confirm: `Delete opportunity`
- Cancel: `Keep opportunity`

The browser's `window.confirm` is not used.

### 25.5 Ineligible records

When delete eligibility is known to be false, the action is hidden and
`Cancel opportunity` remains available for OPEN records.

If the backend rejects a stale eligibility assumption, the UI shows:

`This opportunity now has related activity and cannot be deleted. Cancel it instead.`

## 26. Optimistic concurrency and persistence

### 26.1 Opportunity updates

The persistence layer must separate insert from update. It must not use an
upsert as the update mechanism.

An update follows this semantic shape:

```sql
UPDATE crm_opportunities
SET
  name = :name,
  updated_at = :updatedAt,
  updated_by = :updatedBy,
  version = version + 1
WHERE tenant_id = :tenantId
  AND id = :id
  AND version = :expectedVersion
  AND deleted_at IS NULL;
```

The actual statement includes every field changed by the command. An affected
row count of zero triggers a scoped reload:

- Missing or hidden record becomes `OPPORTUNITY_NOT_FOUND`.
- Existing record with another version becomes
  `OPPORTUNITY_VERSION_CONFLICT`.

### 26.2 Transition concurrency

Transition checks and history insertion occur after a version-aware update in
one transaction.

Two users cannot both move version `7` to different Stages and receive
success. One succeeds and returns version `8`; the other receives `409`.

### 26.3 Stakeholder concurrency

Stakeholder update and delete use the Stakeholder's version.

Primary-state synchronization locks or conditionally updates the parent
Opportunity and affected Stakeholder rows so two simultaneous "make primary"
requests cannot create contradictory application state.

### 26.4 Note concurrency

Note update uses body version. Delete uses `If-Match`.

The frontend never retries a conflicting mutation automatically.

### 26.5 Frontend conflict behavior

On `409` version conflict:

1. Keep the user's unsaved input available.
2. Show `This opportunity changed after you opened it.`
3. Offer `Review latest version`.
4. Refetch the authoritative record.
5. Require the user to reconcile and submit again.

There is no force-save path in this scope.

## 27. Error contract

### 27.1 Existing Opportunity errors

The current errors remain part of the target where applicable:

| HTTP | Error code | Meaning |
|---|---|---|
| `404` | `OPPORTUNITY_NOT_FOUND` | Missing, deleted, or outside scope |
| `409` | `OPPORTUNITY_NUMBER_ALREADY_EXISTS` | Number collision |
| `409` | `OPPORTUNITY_VERSION_CONFLICT` | Expected version is stale |
| `404` | `OPPORTUNITY_ACCOUNT_INVALID` | Account invalid or outside scope |
| `404` | `OPPORTUNITY_PIPELINE_INVALID` | Pipeline invalid or inactive for mutation |
| `404` | `OPPORTUNITY_STAGE_INVALID` | Stage invalid, inactive, or outside Pipeline |
| `404` | `OPPORTUNITY_CONTACT_INVALID` | Contact invalid or outside scope |
| `422` | `OPPORTUNITY_OWNER_INVALID` | Owner cannot be assigned in scope |
| `422` | `OPPORTUNITY_LOST_REASON_REQUIRED` | Lost reason missing |

### 27.2 Required new Opportunity errors

| HTTP | Error code | Meaning |
|---|---|---|
| `422` | `OPPORTUNITY_STAGE_STATUS_MISMATCH` | Status and Stage category disagree |
| `422` | `OPPORTUNITY_TRANSITION_NOT_ALLOWED` | Action invalid from current status |
| `422` | `OPPORTUNITY_ACTUAL_CLOSE_DATE_REQUIRED` | Terminal transition lacks close date |
| `422` | `OPPORTUNITY_ACTUAL_CLOSE_DATE_INVALID` | Close date is in the future or otherwise invalid |
| `404` | `OPPORTUNITY_SOURCE_INVALID` | Source missing, inactive, or wrong tenant |
| `404` | `OPPORTUNITY_CAMPAIGN_INVALID` | Campaign missing, inactive, or wrong tenant |
| `404` | `OPPORTUNITY_LOST_REASON_INVALID` | Lost reason missing, inactive, or wrong tenant |
| `422` | `OPPORTUNITY_CONTACT_ACCOUNT_MISMATCH` | Contact does not belong to Account |
| `409` | `OPPORTUNITY_ACCOUNT_CHANGE_BLOCKED` | Existing contacts conflict with new Account |
| `409` | `OPPORTUNITY_DELETE_NOT_ALLOWED` | Status or business history blocks delete |
| `409` | `OPPORTUNITY_HAS_COMMERCIAL_RECORDS` | Quote, Order, Contract, or protected dependency exists |

Incomplete Owner filter pairs use the platform-standard
`REQUEST_VALIDATION_FAILED` response with field errors on both related query
parameters.

### 27.3 Stakeholder errors

| HTTP | Error code | Meaning |
|---|---|---|
| `404` | `OPPORTUNITY_STAKEHOLDER_NOT_FOUND` | Link missing or outside parent scope |
| `409` | `OPPORTUNITY_STAKEHOLDER_ALREADY_EXISTS` | Contact already linked |
| `409` | `OPPORTUNITY_STAKEHOLDER_VERSION_CONFLICT` | Stakeholder version stale |
| `422` | `OPPORTUNITY_STAKEHOLDER_CONTACT_INVALID` | Contact invalid or outside Account/scope |

Database unique-constraint failures must map to these domain errors rather than
leaking SQL details.

### 27.4 Note errors

Opportunity-scoped Notes reuse documented Note not-found and version-conflict
errors while applying Opportunity authorization.

### 27.5 Frontend error mapping

| Category | UI behavior |
|---|---|
| Validation | Field message plus form summary |
| Authentication | Existing global re-authentication flow |
| Permission | Inline forbidden surface or action-level message |
| Not found | Record not-found state |
| Version conflict | Reconciliation flow |
| Transition rule | Transition-dialog business error |
| Dependency conflict | Explain why delete is unavailable and offer Cancel |
| Network/server | Preserve context and offer Retry |

Raw backend stack traces, exception class names, and SQL messages never appear
in the UI.

## 28. Frontend architecture

### 28.1 Feature boundaries

The target feature is split by responsibility:

```text
src/features/crm/opportunities/
  pages/
    OpportunitiesPage.tsx
    OpportunityDetailPage.tsx
  components/
    OpportunityDirectoryHeader.tsx
    OpportunityFilters.tsx
    OpportunityTable.tsx
    OpportunityPipelineBoard.tsx
    OpportunityPipelineLane.tsx
    OpportunityCard.tsx
    OpportunityFormSheet.tsx
    OpportunityTransitionDialog.tsx
    OpportunityDetailHeader.tsx
    OpportunityOverviewTab.tsx
    OpportunityStageHistoryTab.tsx
    OpportunityStakeholdersTab.tsx
    OpportunityNotesTab.tsx
    OpportunityStateSurface.tsx
  hooks/
    useOpportunityUrlState.ts
    useOpportunityPermissions.ts
  schemas/
    opportunityFormSchema.ts
    opportunityTransitionSchema.ts
  types/
    opportunity.types.ts
```

Names describe target responsibilities, not a required one-commit-per-file
sequence.

### 28.2 Service boundary

`src/services/api/opportunityApi.ts` becomes an exact typed transport adapter.

It may:

- Serialize documented query parameters.
- Call `apiFetch`.
- Return documented typed responses.
- Normalize JSON decimal values into the chosen lossless boundary type when
  documented.

It must not:

- Accept `any`.
- Accept undocumented response shapes.
- Invent labels, IDs, dates, status, Stage, currency, version, or owner.
- Merge submitted form data over a response.
- Filter a server page in the browser.
- Contain visual Stage configuration.
- Default a mutation version.

Separate typed adapters can cover:

- Core Opportunity CRUD/search
- Transitions
- Stage history
- Stakeholders
- Opportunity-scoped Notes

### 28.3 Query keys

Canonical TanStack Query keys are:

```ts
const opportunityKeys = {
  all: ['opportunities'] as const,
  lists: () => ['opportunities', 'list'] as const,
  list: (params: OpportunitySearchParams) =>
    ['opportunities', 'list', params] as const,
  board: (pipelineId: string, stageId: string, status: OpportunityStatus) =>
    ['opportunities', 'board', pipelineId, stageId, status] as const,
  detail: (id: string) => ['opportunities', 'detail', id] as const,
  history: (id: string, params: PageParams) =>
    ['opportunities', 'history', id, params] as const,
  stakeholders: (id: string) =>
    ['opportunities', 'stakeholders', id] as const,
  notes: (id: string, params: PageParams) =>
    ['opportunities', 'notes', id, params] as const,
};
```

Query parameter objects are normalized before key creation so empty strings,
undefined values, and reordered properties do not create accidental duplicate
caches.

### 28.4 Mutation cache behavior

Create:

- Invalidate active List queries.
- Invalidate the created record's Pipeline/Stage lane when visible.
- Navigate to detail or remain in context according to the submitted UI
  action.

General edit:

- Replace the detail cache with the server response.
- Invalidate List queries containing the record.
- Invalidate the relevant current lane when card-visible fields changed.

Transition:

- Replace detail with the response Opportunity.
- Add or invalidate the first history page.
- Invalidate source and destination lanes.
- Invalidate List queries.

Stakeholder mutation:

- Update/invalidate Stakeholders.
- Update/invalidate detail when Primary Contact changes.

Note mutation:

- Update/invalidate Notes only.

Delete:

- Remove detail cache.
- Invalidate List and affected lane queries.
- Navigate to the preserved directory context.

Mutation invalidation is targeted. The application is not hard-reloaded.

### 28.5 No duplicate local source of truth

Server records live in TanStack Query. URL state lives in React Router search
parameters. Temporary form input lives in form state.

The feature does not keep a second mutable array of Opportunities in component
state.

## 29. Loading and refresh states

### 29.1 Initial List load

Render a table-header shell and row skeletons matching visible columns.

Do not display a single centered spinner in an otherwise empty card.

### 29.2 Background List refresh

Keep existing rows visible. Show a restrained progress indicator in the
results region. Do not block pagination or navigation unnecessarily.

### 29.3 Pipeline configuration load

Render lane-header skeletons only after the selected Pipeline is known. If the
Pipeline list is still loading, show a compact selector skeleton and board
shell.

### 29.4 Lane loading

Every lane can independently show:

- Initial card skeletons
- `Loading more` row
- Background-refresh indicator
- Retry action

One lane failure does not replace other lanes.

### 29.5 Detail load

Render a header skeleton and Overview layout skeleton. Do not mount tab
mutation actions until record permission and status are known.

## 30. Empty and error states

### 30.1 First-use empty

When no Opportunity exists and no filter is active:

- Title: `No opportunities yet`
- Description: `Create an opportunity to start tracking potential revenue.`
- Action: `Create opportunity` when permitted

Read-only users see the same explanation without an action.

### 30.2 Filtered empty

When filters return zero:

- Title: `No opportunities match these filters`
- Description: `Adjust or clear filters to see more results.`
- Action: `Reset filters`

### 30.3 Pipeline configuration empty

When no active Pipeline exists:

- Title: `No active sales pipeline`
- Description: `An active pipeline with an open stage is required before opportunities can be created or moved.`
- Action: link to Pipeline Settings only when the user can access that route

No default Pipeline or Stage is fabricated.

### 30.4 Empty lane

Lane copy is:

`No opportunities in this stage`

The empty lane remains a valid move target for authorized users.

### 30.5 Initial load error

The affected surface shows:

- Title: `We couldn't load opportunities`
- Description: `Check your connection and try again.`
- Action: `Try again`

### 30.6 Background refresh error

Preserve the previous data and show:

`Showing previously loaded data. Refresh failed.`

### 30.7 Forbidden

The route-level surface says:

- Title: `You don't have access to opportunities`
- Description: `Ask an administrator for the Opportunity read permission.`

It does not reveal record existence.

### 30.8 Not found

The detail surface says:

- Title: `Opportunity not found`
- Description: `It may have been deleted or may be outside your access scope.`
- Action: `Back to opportunities`

## 31. Responsive behavior

### 31.1 Desktop

- Full table appears at wide desktop breakpoints.
- Filters remain in one primary row with progressive overflow into More
  filters.
- Detail Overview uses a two-column information layout where content permits.
- The form sheet uses a readable maximum width and does not cover the entire
  desktop shell.

### 31.2 Tablet

- Lower-priority table columns can hide in this order: Next step, Owner,
  Probability.
- The action menu remains visible.
- Filters wrap without horizontal page overflow.
- Pipeline lanes remain horizontally scrollable and keep a stable lane width.

### 31.3 Mobile

- The List becomes a semantic compact record list rather than a crushed table.
- Each record shows name, number, Account, Stage, Status, Amount, close date,
  and action menu.
- Pipeline uses horizontal lane scrolling with scroll snapping only if it does
  not interfere with card controls.
- Create/edit and transition surfaces become full-screen sheets.
- Sticky sheet actions respect safe-area insets.
- Tabs can horizontally scroll with a visible active state.
- No essential information or action is hover-only.

### 31.4 Content resilience

- Long Opportunity, Account, Pipeline, Stage, Owner, and Contact names wrap or
  truncate with an accessible full-value affordance.
- Currency and amounts remain on one line when possible.
- User-entered description and note text cannot force horizontal overflow.
- Dates do not rely on a fixed English-US string width.

## 32. Accessibility requirements

### 32.1 Semantics

- Use one `<main>` landmark for the workspace content.
- Use real heading order.
- Use a semantic table for desktop List view.
- Use real links for record navigation.
- Use buttons for actions and tabs with the project's accessible Tabs
  primitive.

### 32.2 Keyboard behavior

- Every filter, table action, card action, tab, dialog, sheet, and pagination
  control is keyboard-operable.
- Move-to-stage menu provides the complete transition workflow without drag.
- Dialog focus is trapped while open.
- Escape closes non-destructive overlays unless a mutation is pending.
- Focus returns to the invoking element after close.
- After delete, focus moves to the next logical record or page heading.

### 32.3 Accessible names

Icon-only buttons have context-specific names such as:

- `Open actions for Cloud migration renewal`
- `Edit Cloud migration renewal`
- `Load more Qualification opportunities`

The visible Stage or Status color is never the only communicated meaning.

### 32.4 Live announcements

A polite `aria-live` region announces:

- Filter result count changes
- Page changes
- Lane load-more results
- Successful create, update, transition, stakeholder, and note mutations
- Recoverable mutation failures

Destructive confirmation errors use assertive announcement only when
necessary.

### 32.5 Visual accessibility

- Text and interactive states meet WCAG AA contrast.
- Focus rings remain visible on neutral, blue, emerald, amber, and rose
  surfaces.
- Touch targets are at least 44 by 44 CSS pixels on mobile.
- Motion respects `prefers-reduced-motion`.
- Drag feedback is supplementary and does not rely on motion alone.

## 33. Visual and status system

### 33.1 Surface treatment

- Page background follows the existing app shell.
- Operational regions use flat white or restrained neutral surfaces.
- Borders are subtle and consistent.
- Elevation appears only for overlays and active drag feedback.
- Radius is tighter on controls and rows than on sheets/dialogs.
- Hover and pressed states use short, restrained transitions.

### 33.2 Typography

- Reuse the application's approved typography rather than introducing a
  feature-specific font.
- Opportunity name uses semibold emphasis.
- Metadata uses regular or medium weight.
- Numeric columns use tabular figures.
- Uppercase is limited to compact codes where the code itself is uppercase.

### 33.3 Centralized status configuration

`@/config/crmStatusConfig` must expose centralized Opportunity helpers that
accept real status and Stage metadata.

The dynamic Stage helper derives treatment from Stage category and active
state. It does not use a hardcoded Stage-code map.

Required semantic direction:

| Meaning | Centralized treatment |
|---|---|
| OPEN status or OPEN Stage | Blue/neutral restrained badge |
| WON status or WON Stage | Emerald badge |
| LOST status or LOST Stage | Rose badge |
| CANCELLED status | Subdued amber/slate badge |
| Inactive configured Stage | Slate treatment plus `Inactive` context |

All Opportunity badges import from this module. Table, board, detail, dialogs,
and history do not define local status colors.

### 33.4 Motion

- Standard control transitions: approximately 150-200 ms.
- Sheet and dialog motion uses existing shadcn/Radix behavior.
- No looping motion.
- No decorative page-entry sequence.
- Card movement uses transform and opacity, not layout-position animation.

## 34. Runtime copy rules

### 34.1 Naming

Use `Opportunity`, not alternating `Deal`, `Commercial opportunity`, and
`Revenue record` labels in the same workflow.

Use `Pipeline` and `Stage` exactly as backend concepts.

Use `Mark as won`, `Mark as lost`, `Cancel opportunity`, and
`Reopen opportunity` for lifecycle commands.

### 34.2 Success messages

Approved patterns:

- `Opportunity created.`
- `Opportunity updated.`
- `Opportunity moved to Qualification.`
- `Opportunity marked as won.`
- `Opportunity marked as lost.`
- `Opportunity cancelled.`
- `Opportunity reopened.`
- `Stakeholder added.`
- `Note saved.`

No exclamation marks, emoji, or unverified automation claims are used.

### 34.3 Error messages

Messages state the problem and next action:

- `We couldn't save this opportunity. Review the highlighted fields.`
- `This opportunity changed after you opened it. Review the latest version before saving again.`
- `The selected stage is no longer active. Choose another stage.`
- `The selected contact does not belong to this account.`
- `We couldn't move the opportunity. It remains in its previous stage.`

Do not use `Oops`, blame the user, or expose internal implementation terms.

## 35. Pipeline Settings dependencies

The Opportunity workspace depends on safe Pipeline configuration behavior.

Before the workspace can rely on dynamic Stages, Pipeline Settings must
guarantee:

- At most one active default Pipeline per tenant and Pipeline type.
- An operational Pipeline has at least one active OPEN Stage.
- Stage display order is deterministic.
- A Stage referenced by an active or historical Opportunity cannot be
  physically deleted.
- Deactivating an in-use Stage does not erase its label or break historical
  references.
- A replacement or migration workflow is required before removing an in-use
  Stage from operational use.
- Generic foreign-key failures map to documented Pipeline domain errors.

The existing database unique index for an active default Pipeline remains the
database enforcement layer. The application service must map violations to a
stable domain error.

## 36. Backend validation requirements

### 36.1 Request validation

- Probability has both minimum `0` and maximum `100` request validation.
- Owner filter pair is validated as a pair.
- Amount precision matches the database and API contract.
- Currency is uppercase and three characters.
- Transition-specific required and forbidden fields are validated.
- All text limits are aligned across request annotations, domain, schema, and
  API documentation.

### 36.2 Reference validation

Before persistence, the service validates:

- Account existence and data scope.
- Contact existence, data scope, and Account membership.
- Active Pipeline for create/transition target.
- Active Stage, Pipeline membership, and category.
- Owner assignment scope.
- Active Source.
- Active Campaign.
- Active Lost reason.

Database foreign keys remain defense in depth, not the user-facing error
mechanism.

### 36.3 Domain methods

The Opportunity aggregate exposes explicit operations corresponding to the
approved commands. A generic method that accepts arbitrary status, Stage,
terminal fields, and Pipeline together is not the primary business API.

The domain is responsible for status-field invariants. The application service
is responsible for scoped reference validation and transactional orchestration.

### 36.4 Read projection

List and detail projections resolve display references in bounded SQL queries.
They do not call service endpoints for every result row.

## 37. API reference synchronization

This design proposes API changes that are not currently implemented. Therefore
`docs/api-reference.md` must not be updated during this spec-only task to claim
they already exist.

Any later implementation must update the API reference in the same task for:

- Server-generated Opportunity number behavior
- Enriched summary and detail response shapes
- PATCH update endpoint
- Transition endpoint and action-specific request rules
- Stage-history endpoint and response
- Stakeholder endpoints and response
- Opportunity-scoped Note endpoints and visibility rules
- Delete eligibility
- Permission and data-scope behavior
- New validation constraints
- New error codes and HTTP statuses
- Headers and optimistic-concurrency requirements

Examples must use synthetic IDs and data. They must not contain credentials,
tokens, secrets, connection values, or personal data.

## 38. Acceptance criteria

### 38.1 Data integrity

- No Opportunity UI path fabricates IDs, labels, dates, status, Stage,
  currency, probability, version, or related records.
- Frontend API adapters use exact documented types and no `any` response
  boundary.
- Opportunity number is server-generated and displayed as the human ID.
- Status and Stage category cannot contradict each other.
- Primary Contact belongs to Account.
- Terminal fields obey the approved invariants.
- Version-aware persistence prevents lost updates.

### 38.2 Directory

- All List filters are sent before server pagination.
- URL refresh preserves view, filters, and List page.
- Counts come from backend `totalElements`.
- The List does not derive business tabs or totals from one page.
- Amount uses each record's response currency.
- Read-only users cannot invoke mutations.

### 38.3 Pipeline board

- One active Pipeline is selected at a time.
- Lanes are backend-configured and ordered by `displayOrder`.
- Each lane loads independently and can retrieve beyond 100 total records.
- Lane count comes from that lane's backend total.
- Cancelled records do not appear in active lanes.
- No cross-currency amount sum is displayed.
- Move menu provides a complete keyboard alternative to drag.
- Terminal drop targets open the correct transition dialog.

### 38.4 Detail

- Detail route exists and preserves Back context.
- Overview, Stage history, Stakeholders, and Notes have independent query
  boundaries.
- Header actions match status and permission.
- Inactive historical references remain readable.
- A tab failure does not replace the record header or other tabs.

### 38.5 Transitions

- Every successful transition increments Opportunity version once.
- Every successful transition creates exactly one immutable history entry.
- Opportunity change and history write commit atomically.
- Mark won requires a WON Stage and actual close date.
- Mark lost requires a LOST Stage, actual close date, and active Lost reason.
- Cancel retains Stage and records terminal status.
- Reopen clears terminal-only fields and selects a valid OPEN Stage.
- No success message claims an undocumented downstream automation.

### 38.6 Stakeholders and Notes

- Stakeholder Contact is scoped and belongs to Opportunity Account.
- One Contact cannot be added twice.
- At most one Stakeholder is primary.
- Primary Stakeholder and `primaryContactId` remain transactionally aligned.
- Opportunity Note authorization is target-aware.
- PRIVATE, TEAM, and TENANT visibility is enforced before response.
- Note mutation checks Opportunity write permission and owner/scope rule.

### 38.7 UI states and accessibility

- Initial loading uses shape-matched skeletons.
- Background refresh preserves prior content.
- First-use empty and filtered-empty states are different.
- Lane errors are isolated.
- Forbidden, not-found, validation, dependency, and conflict states are
  designed.
- All mutations are keyboard-operable.
- Focus is managed across dialogs and sheets.
- Color is not the only Stage or Status signal.
- Runtime copy is English only.
- Status visuals come from `@/config/crmStatusConfig`.

## 39. Future implementation verification matrix

This section defines evidence expected from a later implementation. No test,
build, browser, or runtime verification is executed as part of this spec-only
task.

### 39.1 Static checks

- TypeScript typecheck
- ESLint with zero warnings
- English-only verification script
- Production build
- Search for removed aliases and fabricated defaults
- Search for local Opportunity badge colors outside centralized configuration

### 39.2 Frontend behavior checks

- List URL round-trip
- Server filter and pagination request serialization
- Empty and filtered-empty rendering
- Pipeline selector default and no-Pipeline state
- Independent lane pagination and retry
- Keyboard move-to-stage flow
- Won, Lost, Cancel, and Reopen dialogs
- Version-conflict reconciliation
- Permission-gated actions
- Detail-tab error isolation
- Stakeholder primary synchronization response handling
- Note visibility and mutation controls

### 39.3 Backend contract checks

- Owner filter pair validation
- Probability upper bound
- Account/Contact relationship validation
- Stage/Pipeline/category validation
- Source, Campaign, and Lost reason validation
- Atomic conditional updates
- Transition/history transaction rollback
- Delete dependency checks
- Stakeholder uniqueness and primary constraint
- Opportunity-scoped Note authorization
- API error-code mappings

### 39.4 Viewports and accessibility checks

Future browser verification covers:

- Wide desktop
- Standard laptop
- Tablet around real project breakpoints
- Narrow mobile
- Keyboard-only navigation
- Screen-reader accessible names and live announcements
- Focus return after dialog/sheet close
- Long names, large amounts, empty values, and multiple currencies
- Reduced-motion preference
- Console and network errors

Repository policy requires explicit user authorization before running any of
these checks in a later task.

## 40. Deferred surfaces and release gates

### 40.1 Activity timeline

Deferred until Activity linking, search, response typing, permission, and data
scope are exact. The Opportunity detail does not render a fabricated timeline.

### 40.2 Revenue forecasting

Deferred until the backend defines:

- Currency-grouped totals
- Forecast category semantics
- Time-window filters
- Permission behavior
- Stable aggregation endpoints

The workspace does not compute forecast totals from loaded cards.

### 40.3 Related commerce

Related Quotes, Orders, and Contracts are deferred until their adapters and
backend filters return exact Opportunity-linked records without fabricated
normalization.

The Opportunity workspace does not show empty decorative tabs or claim that
transitions created downstream records.

### 40.4 Automation

No automation messaging ships without a documented command, event, job state,
failure model, and permission contract.

### 40.5 Tags

Tags are deferred until the generic Tag service resolves permission and scope
from target type. Opportunity tags must not inherit Account authorization.

### 40.6 Cross-pipeline view

A cross-pipeline board is deferred because Stage meaning and ordering are
Pipeline-specific. A future aggregate view must use a separate normalized
model rather than mixing Stage lanes.

## 41. Rejected approaches

### 41.1 Production Table Hardening only

This approach would correct search and CRUD but remove the Pipeline operating
value and leave existing Stage-history and Stakeholder schema unused.

It is safer than the current page but does not satisfy the approved product
goal.

### 41.2 Full Revenue Command Center

This approach would include Activity, forecasting, automation, Quotes, Orders,
and Contracts in the first redesign.

It is rejected because the related adapters and authorization contracts are
not yet reliable enough for production and would expand one design into
multiple independent subsystems.

### 41.3 Client-normalized compatibility layer

Keeping the current alias-heavy adapter and adding more fallback fields is
rejected. It hides contract failures and makes the UI look correct when
persisted data is missing or different.

### 41.4 Hardcoded canonical Pipeline

Shipping one fixed six-stage Pipeline is rejected. Pipeline and Stage are
tenant configuration already represented by backend entities.

### 41.5 Status change through general update

Allowing the edit form or Kanban card to submit arbitrary status and Stage in a
full replacement request is rejected. It cannot guarantee terminal-field,
category, audit, and concurrency invariants.

## 42. Design completeness statement

This specification intentionally resolves the production decisions needed for
the approved Opportunity Pipeline Workspace:

- Product scope and exclusions
- Routes and information architecture
- URL state
- Permissions and data scope
- Exact target domain types
- Directory and board behavior
- Create and edit boundaries
- Transition commands and invariants
- Stage-history contract
- Stakeholder contract
- Opportunity-scoped Note contract
- Delete eligibility
- Concurrency behavior
- Error mapping
- Frontend responsibility boundaries
- Loading, empty, error, responsive, accessibility, and copy states
- Centralized status presentation
- Backend/API-reference synchronization requirements
- Acceptance and future verification criteria

It contains no implementation claim, task breakdown, commit sequence, or
placeholder requirement.
