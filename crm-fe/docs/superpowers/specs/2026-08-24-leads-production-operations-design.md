# Leads Production Operations: Design Specification

**Date:** 2026-08-24

**Scope:** `crm-fe` plus the explicitly identified Lead backend corrections

**Route:** `/app/crm/leads`

**Status:** All design sections approved in conversation; document pending final
user review

**Direction:** Contract-first Lead Operations Workspace

## 1. Relationship to existing requirements

This specification is the source of truth for the Leads screen redesign. It
must be read together with:

- `docs/superpowers/specs/2026-08-21-system-wide-english-only-design.md`;
- the Lead Management and Lead Scoring sections of repository-level
  `docs/api-reference.md`;
- route, navigation, and permission configuration under `src/config` and
  `src/core/permissions`;
- the CRM status presentation rules in `src/config/crmStatusConfig`.

English is the only runtime system language. `preferredLanguageCode` remains
business metadata about a Lead and must never change the interface language.

All Lead status badges must use the centralized status helper exported from
`@/config/crmStatusConfig`. The Leads feature must not define a second local
status color map. Catalogue statuses not recognized by the centralized helper
must use its neutral fallback rather than an invented semantic color.

Implementation must preserve any user-owned changes already present in
`LeadsPage.tsx`, including the English action tooltip labels. It must inspect
the scoped worktree diff before extracting or replacing the page and must not
reset unrelated files.

## 2. Executive decision

The approved design is a production Lead Operations Workspace built around a
server-backed table, a lazy-loaded detail sheet, focused editor and workflow
dialogs, URL-persisted collection state, and exact API contracts.

The screen remains a dense enterprise product surface. It must not be styled as
a marketing page and must not introduce decorative gradients, oversized
typography, glass effects, cinematic motion, or speculative dashboard metrics.

Three approaches were considered:

1. Lead Operations Workspace, selected because it fixes contract, workflow,
   permission, concurrency, and maintainability problems together.
2. Minimal Production Hardening, rejected because it would preserve the
   882-line page monolith and weak information architecture.
3. Pipeline Board First, deferred because the backend does not provide
   pipeline ordering, transition rules, board aggregates, or drag-and-drop
   mutation contracts.

## 3. Current-state audit

The existing `LeadsPage.tsx` owns collection querying, search, filtering,
pagination, create/edit forms, scoring, auto-assignment, conversion, deletion,
Quick Call integration, and every dialog in one file.

The existing frontend Lead adapter does not represent the backend contract
faithfully:

- it exposes aliases such as `fullName`, `phone`, `estimatedRevenue`, `notes`,
  `leadSource`, `status`, `city`, `assignedTo`, and `lastContactedAt`;
- it invents names, companies, job titles, lead numbers, cities, owners,
  ratings, sources, statuses, monetary values, timestamps, and versions;
- it accepts multiple speculative response shapes instead of the implemented
  `PageResult` shape;
- it sends status and source codes where the backend requires UUIDs;
- its filter aliases are not forwarded as the backend query parameters, so the
  visible Status and Source controls do not provide reliable server filtering;
- create and update silently inject unsupported or fake defaults;
- edit starts from a summary record and can omit detail-only fields;
- update and conversion can fall back to version `1`;
- delete does not consistently provide the current version in `If-Match`;
- auto-assignment is normalized through the wrong response type;
- list KPI values are calculated from the current page and presented beside a
  global `totalElements` value.

The current screen also has workflow and governance contradictions:

- Status and Source controls use hardcoded codes although both are tenant
  catalogues identified by UUID;
- create requires email even though the backend makes email optional;
- `city` and free-text `assignedTo` have no Lead API contract;
- mutation actions are not consistently gated by `crm_lead.write`;
- delete and conversion use `window.confirm`;
- conversion copy claims that Account and Deal records are created although
  the endpoint only marks a Lead as converted and stores optional references;
- scoring is presented as AI although the backend uses deterministic rules;
- scoring factors and recommended actions are returned in Vietnamese;
- the current auto-assignment query repeatedly selects the earliest active
  membership and is not a durable round-robin implementation;
- auto-assignment does not accept an expected version;
- conversion validates Account and Contact references but does not validate an
  Opportunity reference or ensure that the selected status belongs to the
  `CONVERTED` category;
- important errors are surfaced only through transient toasts;
- the scoring overlay is not built on the application's accessible dialog
  primitive.

This redesign removes these contradictions. It must not merely restyle them.

## 4. Goals

1. Display and submit only canonical Lead data.
2. Make search, filtering, pagination, detail, create, update, delete,
   scoring, assignment, and conversion safe for production use.
3. Separate route composition, URL state, query state, API transport, mapping,
   validation, and visual components into focused units.
4. Apply `crm_lead.read` and `crm_lead.write` consistently.
5. Preserve every implemented Lead field through create and edit round trips.
6. Use current optimistic-concurrency versions for every destructive or
   ownership-changing mutation.
7. Use canonical Lead Status and Lead Source catalogues.
8. Provide explicit loading, updating, empty, error, retry, readonly,
   permission, and conflict states.
9. Keep all runtime interface copy in English.
10. Define the backend corrections required before scoring, auto-assignment,
    and conversion can be considered production-ready.

## 5. Non-goals

- No Kanban or pipeline board.
- No drag-and-drop status transitions.
- No bulk selection or bulk mutation.
- No import, export, or CSV workflow.
- No client-side aggregate dashboard or current-page KPI cards.
- No automatic creation of Account, Contact, or Opportunity records during
  conversion.
- No Lead 360 activity timeline, notes timeline, email composer, or campaign
  integration.
- No client-side emulation of missing backend capabilities.
- No new frontend framework, styling system, table library, icon family, or
  animation dependency.
- No implementation plan in this artifact.

## 6. Design read and visual posture

Read this as an enterprise CRM operations screen for sales users who scan,
qualify, assign, and convert records repeatedly throughout the day.

The design posture is:

- `DESIGN_VARIANCE: 3`, because the application shell and dense data surface
  require predictable alignment;
- `MOTION_INTENSITY: 3`, limited to state feedback, sheet/dialog transitions,
  and hover or pressed behavior;
- `VISUAL_DENSITY: 8`, because the table is the primary operational tool.

The feature must inherit the existing application design system. It uses one
brand accent, restrained neutral surfaces, tabular figures for numeric data,
consistent focus treatment, and the application's established radius scale.
It must avoid gradient headings, decorative score bars, emoji iconography,
large shadows, nested cards, and unnecessary animation.

## 7. Sources of truth

The sources of truth are ordered as follows:

1. Backend controllers and request/response DTOs.
2. Domain validation and authorization services.
3. `docs/api-reference.md` after it is synchronized with implemented backend
   corrections.
4. Lead Status and Lead Source catalogue endpoints.
5. Frontend API types that mirror those contracts exactly.
6. Presentation mappers that add display labels without inventing business
   values.

The UI must never infer a status UUID from a hardcoded status code, fabricate a
person name from an owner UUID, or treat a current page as an aggregate data
source.

## 8. Existing Lead API contract

### 8.1 Shared values

```ts
type LeadRating = "HOT" | "WARM" | "COLD";
type LeadOwnerType = "USER" | "TEAM";

interface LeadOwner {
  type: LeadOwnerType;
  id: string;
}

interface LeadEstimatedValue {
  amount: number;
  currencyCode: string;
}
```

`currencyCode` is an uppercase three-letter currency code. Amount is zero or
greater and supports up to 14 integer digits and 6 fraction digits.

### 8.2 Summary response

```ts
interface LeadSummary {
  id: string;
  leadNumber: string;
  statusId: string;
  sourceId: string | null;
  owner: LeadOwner | null;
  rating: LeadRating | null;
  companyName: string | null;
  displayName: string;
  email: string | null;
  phoneE164: string | null;
  jobTitle: string | null;
  estimatedValue: LeadEstimatedValue | null;
  convertedAt: string | null;
  updatedAt: string;
  version: number;
}
```

The collection must render only these fields plus labels resolved from
canonical catalogues or identity sources.

### 8.3 Detail response

```ts
interface LeadDetail extends LeadSummary {
  accountName: string | null;
  honorific: string | null;
  givenName: string | null;
  familyName: string | null;
  website: string | null;
  countryCode: string | null;
  preferredLanguageCode: string | null;
  qualificationNotes: string | null;
  disqualificationReason: string | null;
  convertedBy: string | null;
  convertedAccountId: string | null;
  convertedContactId: string | null;
  convertedOpportunityId: string | null;
  createdAt: string;
  createdBy: string;
  updatedBy: string;
}
```

This interface description is conceptual inheritance. The implementation must
mirror the full `LeadResponse` payload explicitly if that is safer for the
project's type style.

### 8.4 Search contract

`GET /api/leads` accepts:

```ts
interface LeadSearchParams {
  q?: string;
  statusId?: string;
  sourceId?: string;
  rating?: LeadRating;
  ownerType?: LeadOwnerType;
  ownerId?: string;
  converted?: boolean;
  page?: number;
  size?: number;
}
```

`page` is zero-based. `size` is between 1 and 100. The response is exactly:

```ts
interface PageResult<T> {
  items: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}
```

The frontend must not accept speculative `content`, root arrays,
`pageNumber`, or other fallback shapes.

### 8.5 Create request

`POST /api/leads` accepts:

```ts
interface CreateLeadInput {
  leadNumber: string;
  statusId: string;
  sourceId?: string | null;
  owner?: LeadOwner | null;
  rating?: LeadRating | null;
  accountName?: string | null;
  companyName?: string | null;
  honorific?: string | null;
  givenName?: string | null;
  familyName?: string | null;
  displayName: string;
  email?: string | null;
  phoneE164?: string | null;
  jobTitle?: string | null;
  website?: string | null;
  countryCode?: string | null;
  preferredLanguageCode?: string | null;
  estimatedValue?: LeadEstimatedValue | null;
  qualificationNotes?: string | null;
}
```

`leadNumber` is required, trimmed, unique, at most 191 characters, and
immutable after creation. `displayName` and `statusId` are required. Email is
optional and at most 320 characters. Phone must match E.164 when present.
`countryCode` must be two uppercase letters. `preferredLanguageCode` must match
the backend language-tag validation.

### 8.6 Update request

`PUT /api/leads/{id}` accepts the create fields except `leadNumber`, plus:

```ts
interface UpdateLeadInput {
  version: number;
  statusId: string;
  sourceId?: string | null;
  owner?: LeadOwner | null;
  rating?: LeadRating | null;
  accountName?: string | null;
  companyName?: string | null;
  honorific?: string | null;
  givenName?: string | null;
  familyName?: string | null;
  displayName: string;
  email?: string | null;
  phoneE164?: string | null;
  jobTitle?: string | null;
  website?: string | null;
  countryCode?: string | null;
  preferredLanguageCode?: string | null;
  estimatedValue?: LeadEstimatedValue | null;
  qualificationNotes?: string | null;
  disqualificationReason?: string | null;
}
```

The editor must load `LeadDetail` before constructing this request. It must
never create an update from `LeadSummary` alone.

### 8.7 Conversion request

`POST /api/leads/{id}/convert` currently accepts:

```ts
interface ConvertLeadInput {
  version: number;
  convertedAccountId?: string | null;
  convertedContactId?: string | null;
  convertedOpportunityId?: string | null;
  convertedStatusId?: string | null;
}
```

This endpoint marks the Lead as converted and stores optional references. It
does not create the referenced records.

### 8.8 Delete request

`DELETE /api/leads/{id}` requires the current version in the HTTP header:

```http
If-Match: "<version>"
```

The frontend must use the repository's canonical `If-Match` formatting helper
if one exists. It must not send a default version, omit the header, or place
the version in an invented request body.

## 9. Catalogue contracts

The screen must load:

- `GET /api/crm/config/lead-statuses` through `listLeadStatuses()`;
- `GET /api/crm/config/lead-sources` through `listLeadSources()`.

Lead Status records provide:

- `id`;
- `statusCode`;
- `name`;
- `statusCategory`, one of `OPEN`, `QUALIFIED`, `DISQUALIFIED`, or
  `CONVERTED`;
- `displayOrder`;
- `defaultStatus`;
- `terminal`;
- `active`;
- `version`.

Lead Source records provide:

- `id`;
- `sourceCode`;
- `name`;
- optional `description`;
- `active`;
- `version`.

Filters and forms send catalogue UUIDs. They never send `statusCode` or
`sourceCode` as an ID. Create uses the active `defaultStatus` when exactly one
valid default exists. If no valid default exists, Status remains unselected and
the user must choose it. The frontend must not fall back to `NEW`.

Inactive catalogue records already attached to an existing Lead remain visible
in detail and edit mode so the record can be understood and preserved. They are
not offered as new choices unless the user is retaining the current value.

## 10. Information architecture

### 10.1 Page header

The page header contains:

- title `Leads`;
- description `Qualify, assign and convert sales leads.`;
- exact result count derived from `totalElements`;
- primary action `New lead` when the actor has `crm_lead.write`.

There are no Hot, Qualified, Converted, value, or conversion-rate KPI cards
unless a future aggregate endpoint provides those values for the full filtered
dataset.

### 10.2 Toolbar

The toolbar contains:

- debounced search;
- Status filter;
- Source filter;
- Rating filter;
- Owner filter;
- Conversion state filter;
- `Clear filters` when at least one filter is active.

Desktop keeps the primary controls in one operational row and may place lower
priority filters inside a `More filters` popover. Mobile uses a dedicated
filter sheet with an explicit apply action. Active filters remain visible and
removable.

### 10.3 Collection columns

Desktop columns are:

1. Lead;
2. Company;
3. Status;
4. Rating;
5. Source;
6. Estimated value;
7. Owner;
8. Updated;
9. Actions.

The Lead cell shows display name as the primary line and lead number as the
secondary line. Email, phone, and job title may appear only where the column
width and responsive priority allow them.

Status and Source names come from catalogues. Estimated values retain their own
currency code. Owner names come only from an authoritative user/team source.
When a display name cannot be resolved, the fallback shows owner type and a
shortened identifier. It must not fabricate a person's name.

The backend does not expose server sorting in the current search contract, so
headers must not display sort controls. Sorting is deferred until an explicit
server sort contract exists.

### 10.4 Row interaction

Selecting a row opens the detail sheet. Interactive controls inside a row stop
row activation correctly.

Quick Call is the only direct row action and appears only when `phoneE164` is
present and valid. It uses a truthful `tel:` link and does not claim to start an
integrated dialer session.

Other actions live in a row menu:

- `View details`;
- `Edit lead`;
- `Calculate score`;
- `Auto-assign`;
- `Mark as converted`;
- `Delete lead`.

The menu shows only actions allowed by permissions and record state.

## 11. Component architecture

`LeadsPage` becomes route-level composition rather than a feature monolith.

```text
src/features/crm/leads/
  LeadsPage.tsx
  components/
    LeadsHeader.tsx
    LeadsToolbar.tsx
    LeadsTable.tsx
    LeadCompactList.tsx
    LeadRowActions.tsx
    LeadDetailSheet.tsx
    LeadEditorSheet.tsx
    LeadForm.tsx
    LeadScoreDialog.tsx
    LeadAutoAssignDialog.tsx
    LeadConversionDialog.tsx
    LeadDeleteDialog.tsx
    LeadCollectionState.tsx
  hooks/
    useLeadListState.ts
    useLeadQueries.ts
    useLeadMutations.ts
  model/
    leadTypes.ts
    leadSchemas.ts
    leadMappers.ts
    leadErrors.ts
    leadQueryKeys.ts
```

Exact names may adapt to established repository naming, but responsibility
boundaries are mandatory.

### 11.1 Page responsibility

`LeadsPage` composes the header, toolbar, collection, and route-driven sheets or
dialogs. It does not normalize API payloads, implement validation rules, or
contain every mutation callback.

### 11.2 Model responsibility

- `leadTypes.ts` mirrors API transport and feature view types.
- `leadSchemas.ts` validates create, update, conversion, and URL state.
- `leadMappers.ts` maps between exact API models and form values without
  business-data fabrication.
- `leadErrors.ts` converts error codes into recovery instructions and field
  issues.
- `leadQueryKeys.ts` provides tenant-scoped query-key factories.

### 11.3 UI responsibility

Visual components receive resolved view models and callbacks. They do not call
HTTP services directly. Dialogs and sheets use the application's existing
accessible primitives.

## 12. URL state

Collection and editor state use URL search parameters:

```text
q
statusId
sourceId
rating
ownerType
ownerId
converted
page
size
leadId
mode
```

Rules:

- `page` is zero-based in API state;
- omitted `size` resolves to the approved application default;
- invalid UUID, enum, page, or size values are removed through one canonical
  URL replacement;
- changing search or any filter resets `page` to zero;
- `leadId` with `mode=view` opens detail;
- `leadId` with `mode=edit` opens edit after detail loading;
- `mode=create` opens the create sheet without a `leadId`;
- closing a sheet removes only the editor parameters and preserves collection
  state;
- browser back and forward restore the previous collection and editor state.

Search input is debounced by approximately 300 milliseconds before changing the
URL. The visible input remains responsive while network requests are replaced
or canceled.

## 13. Query and cache design

Query keys include tenant context and every request parameter that changes the
response.

Conceptual keys are:

```ts
leadKeys.all(tenantId)
leadKeys.list(tenantId, normalizedSearchParams)
leadKeys.detail(tenantId, leadId)
leadKeys.statuses(tenantId)
leadKeys.sources(tenantId)
```

Rules:

- the list query returns exact `PageResult<LeadSummary>`;
- detail is enabled only when a valid `leadId` requires it;
- edit, conversion, auto-assignment, and deletion resolve the freshest known
  detail/version before submission;
- catalogue queries are shared by filters, forms, status rendering, and
  conversion;
- changing list parameters keeps the previous collection visible with a quiet
  updating state;
- stale requests do not overwrite newer URL state;
- detail errors do not erase a successfully loaded collection;
- mutations update the exact detail cache and invalidate affected lists;
- the entire page is never reloaded to reflect a mutation.

Mutation cache behavior:

- create inserts no speculative fake row, invalidates relevant lists, then
  opens the returned Lead detail;
- update replaces the matching detail, patches a compatible summary when safe,
  and invalidates lists whose filters may have changed;
- delete removes the detail, closes its sheet, removes the row from compatible
  caches, and invalidates the current list;
- auto-assignment replaces detail and invalidates affected lists;
- conversion replaces detail and invalidates affected converted/status lists;
- scoring does not alter Lead detail or rating because it is a read-only
  calculation result.

## 14. Search and collection behavior

Search sends `q` directly to the server and never filters only the current
page. Status, Source, Rating, Owner, and Conversion filters also run through the
server contract.

The result label uses `totalElements`. Pagination uses `page`, `size`, and
`totalPages` from the response. If a delete leaves the current page empty and a
previous page exists, the route moves to the previous page once.

The UI must not calculate Hot, Qualified, Converted, total value, or conversion
rate metrics from `items`. Those values describe only the loaded page and are
not safe substitutes for aggregate APIs.

## 15. Detail sheet

The detail sheet is the canonical read surface and groups fields into:

### 15.1 Lead overview

- display name;
- lead number;
- Status;
- Rating;
- Source;
- converted state.

### 15.2 Contact information

- honorific, given name, and family name when present;
- email;
- phone;
- website;
- country;
- preferred language metadata.

### 15.3 Company and qualification

- account name;
- company name;
- job title;
- estimated value;
- qualification notes;
- disqualification reason.

### 15.4 Ownership

- resolved owner label;
- owner type;
- stable identifier fallback when no label is available.

### 15.5 Conversion details

- converted at;
- converted by;
- linked Account, Contact, and Opportunity identifiers or resolved labels when
  authorized.

### 15.6 Audit information

- created at and by;
- updated at and by;
- current version.

Missing optional fields display one restrained placeholder such as `Not set`.
The sheet does not fill empty fields with examples or fake values.

## 16. Create and edit experience

The editor uses one form component with explicit create and edit modes.

### 16.1 Identity section

- Lead number, required in create and readonly in edit;
- display name, required;
- honorific;
- given name;
- family name.

### 16.2 Company section

- account name;
- company name;
- job title;
- website.

### 16.3 Contact section

- email, optional;
- phone, optional E.164;
- country code;
- preferred language code as business metadata.

### 16.4 Qualification section

- Status, required;
- Source;
- Rating;
- estimated amount and currency;
- qualification notes;
- disqualification reason in edit mode.

### 16.5 Ownership section

Owner is a structured `{ type, id }` value. Free-text owner names are not
allowed. Choices must come from the canonical user/team directory and respect
the actor's authorized data scope. If no authoritative selector is available,
the editor supports unassigned, session-derived safe choices, and preservation
of the current owner only. It must not invent directory entries.

### 16.6 Form behavior

- labels remain visible above fields;
- required fields are identified in text, not by color alone;
- errors render directly under their field;
- Save is disabled when unchanged, invalid, or pending;
- pending submission prevents duplicate requests;
- server field errors focus the first invalid field;
- closing a dirty form asks whether to discard changes;
- draft values remain in memory after a recoverable version conflict;
- create has no fake default company, owner, city, rating, value, or source;
- edit starts only after full detail is available.

After create, the sheet closes or transitions to the returned detail according
to the established application sheet pattern. The new canonical Lead response
is the only source for the resulting view.

## 17. Status and rating presentation

Status rendering resolves the catalogue record by `statusId`, displays its
name, and sends the `statusCode` through the centralized helper imported from
`@/config/crmStatusConfig`.

Known codes use the system-wide Lead status standard. Unknown or tenant-defined
codes use the helper's neutral outlined fallback. The feature must not map
status category to a locally invented color.

Rating is separate from Status:

- `HOT` receives the strongest rating emphasis;
- `WARM` receives moderate emphasis;
- `COLD` receives quiet neutral emphasis.

Rating styling must remain visually subordinate to Status. Text labels are
always present so color is never the only signal.

## 18. Authorization

Backend authorization remains authoritative. Frontend gating prevents invalid
or misleading interactions.

| Capability | Permission | Frontend behavior |
|---|---|---|
| Route and collection | `crm_lead.read` | Route guard and list access |
| Detail | `crm_lead.read` | View sheet and row navigation |
| Calculate score | `crm_lead.read` | Read-only workflow action |
| Create | `crm_lead.write` | Show `New lead` |
| Edit | `crm_lead.write` | Show edit action |
| Delete | `crm_lead.write` | Show destructive action |
| Auto-assign | `crm_lead.write` | Show assignment action |
| Convert | `crm_lead.write` | Show conversion action |

An actor with read-only access sees a complete read experience without disabled
mutation controls filling the interface. Direct navigation to an unauthorized
edit mode returns to view mode and displays the application's standard access
message.

Optional conversion reference pickers are independently gated by read access to
Accounts, Contacts, and Opportunities. Missing target-entity permissions do not
grant access through the Lead screen.

## 19. Delete workflow

Delete uses an accessible confirmation dialog rather than `window.confirm`.

The dialog contains:

- title `Delete lead`;
- the Lead display name;
- the immutable Lead number;
- a concise irreversible-action warning;
- `Cancel` and `Delete lead` actions.

Submission sends the current version in `If-Match`. The destructive button is
pending-safe. On success, the detail sheet closes and list state is reconciled.
On a version conflict, the record remains visible and the user is asked to
reload the latest detail before trying again.

## 20. Lead scoring workflow

### 20.1 Product semantics

The feature is named `Calculate score` and described as rule-based scoring. It
must not use AI copy, AI icons, sparkle imagery, or claims of predictive
intelligence.

The result is a calculation snapshot. It does not persist a score field and
does not change the Lead `rating` automatically.

### 20.2 Dialog presentation

The accessible dialog shows:

- score from 0 to 100 as a tabular number;
- grade;
- individual factors with awarded points;
- recommended next action;
- calculation context when a factor is omitted.

It uses a clear number and structured factor list rather than a decorative
filled progress track. Closing the dialog discards the snapshot unless a future
persisted scoring contract is introduced.

### 20.3 Required backend correction

The current response contains Vietnamese presentation sentences. The endpoint
must return structured, language-neutral data, conceptually:

```ts
interface LeadScoringFactor {
  factorCode: string;
  points: number;
  parameters: Record<string, string | number | boolean | null>;
}

interface LeadScoringResult {
  leadId: string;
  score: number;
  grade: LeadRating;
  factors: LeadScoringFactor[];
  recommendedActionCode: string;
}
```

Frontend-owned English copy maps known factor and recommendation codes. Unknown
codes use a safe generic English label and preserve point values without
showing raw Vietnamese backend sentences.

Budget scoring must be currency-aware. Until a conversion-rate or base-currency
contract exists, budget thresholds apply only to the configured scoring
currency. A value in another currency is not compared as though it were the
same unit.

The backend continues authorizing the calculation with `CRM_LEAD_READ`.

## 21. Auto-assignment workflow

### 21.1 User experience

`Auto-assign` is available only to `crm_lead.write` actors and only for a Lead
that can still be mutated.

The confirmation dialog identifies the current owner and explains that the
system will choose the next eligible owner. It does not promise fairness until
the backend correction is deployed.

On success, the dialog reports the canonical resolved owner and refreshes
detail/list caches. On failure, the current owner remains unchanged.

### 21.2 Required request and response contract

The endpoint must accept the current version:

```ts
interface AutoAssignLeadInput {
  version: number;
}
```

It must return the canonical `LeadResponse`, not the internal `LeadDetails`
application DTO. A version mismatch returns `LEAD_VERSION_CONFLICT`.

### 21.3 Required assignment behavior

The current query selects the earliest active tenant membership and does not
advance persistent assignment state. Production behavior must:

- choose only active, eligible members in the tenant;
- apply a documented eligibility rule for sales ownership;
- persist a round-robin cursor or equivalent assignment state;
- serialize or atomically compare assignment state so concurrent requests do
  not select the same owner incorrectly;
- update Lead ownership and version in one transaction;
- respect authorized data scope;
- never silently fall back to the current actor;
- return `LEAD_ASSIGNMENT_NO_ELIGIBLE_OWNER` when no eligible owner exists.

The existing `crm_lead.write` authorization remains mandatory.

## 22. Conversion workflow

### 22.1 Product semantics

The action is named `Mark as converted`. It records conversion state and
optional references. It does not create an Account, Contact, Opportunity, Deal,
or Customer record.

A converted Lead is visibly readonly for conversion and cannot be converted a
second time.

### 22.2 Dialog fields

- Converted status, required and restricted to active statuses whose
  `statusCategory` is `CONVERTED`;
- optional existing Account;
- optional existing Contact;
- optional existing Opportunity.

Reference fields live under progressive disclosure such as `Link existing CRM
records`. They use authorized server search pickers. Raw UUID text inputs are
not the default product experience.

If the actor lacks permission to read a target entity, its picker is omitted.
Conversion can still proceed without that optional reference if backend policy
allows it.

### 22.3 Submission and success

The request sends the freshest detail version and selected reference IDs. The
confirmation copy explicitly states that no records will be created.

Success copy is `Lead marked as converted.` The returned `LeadResponse`
replaces the detail cache. The action disappears, the converted metadata
appears, and filtered lists are invalidated.

### 22.4 Required backend validation

Before this workflow is production-ready, the backend must:

- require or deterministically resolve an active converted status;
- verify that `convertedStatusId` belongs to category `CONVERTED`;
- validate Account, Contact, and Opportunity references;
- require every reference to belong to the current tenant;
- enforce authorized data scope for every reference;
- preserve the current version check;
- leave the Lead unchanged when any validation fails;
- return `LEAD_ALREADY_CONVERTED`, `LEAD_CONVERSION_INVALID`, or
  `LEAD_VERSION_CONFLICT` consistently.

Creation of new CRM records from a Lead requires a separate full-stack design
and is not hidden inside this endpoint.

## 23. Error mapping and recovery

Errors are mapped by stable code before HTTP-message fallback.

| Error | Surface | Recovery |
|---|---|---|
| `REQUEST_VALIDATION_FAILED` | Field or form summary | Correct highlighted fields |
| `LEAD_NUMBER_ALREADY_EXISTS` | Lead number field | Choose another number |
| `LEAD_STATUS_INVALID` | Status field/dialog | Refresh catalogue and reselect |
| `LEAD_SOURCE_INVALID` | Source field | Refresh catalogue and reselect |
| `LEAD_OWNER_INVALID` | Owner field/dialog | Refresh eligible owners and reselect |
| `LEAD_VERSION_CONFLICT` | Editor or workflow dialog | Preserve draft, reload latest data |
| `LEAD_ALREADY_CONVERTED` | Conversion dialog | Refresh detail and show converted state |
| `LEAD_CONVERSION_INVALID` | Conversion dialog | Recheck status and linked records |
| `LEAD_ASSIGNMENT_NO_ELIGIBLE_OWNER` | Assignment dialog | Keep current owner and explain constraint |
| `LEAD_NOT_FOUND` | Detail/editor | Close stale surface and refresh collection |
| `AUTHENTICATION_REQUIRED` | Application session handler | Re-authenticate through standard flow |
| `ACCESS_DENIED` | Route or action | Return to allowed view and show access message |

List load errors replace only the collection body with an inline error and
`Try again`. Catalogue errors disable dependent controls and provide a retry.
The feature must not fall back to hardcoded catalogue values.

Toast is reserved for short mutation outcomes. Errors requiring a decision or
field correction remain visible in their sheet or dialog.

Unknown errors use direct English copy such as `We couldn't save this lead.
Try again.` They must not use `Oops`, raw stack traces, or backend localization
keys.

## 24. Optimistic concurrency and unsaved changes

Update and conversion send `version` in their JSON body. Delete sends version
through `If-Match`. Auto-assignment gains an explicit version request as part
of the required backend correction.

No operation defaults to version `1`.

When `LEAD_VERSION_CONFLICT` occurs:

1. the user's draft or workflow selections stay in memory;
2. the current dialog explains that the Lead changed elsewhere;
3. `Reload latest data` fetches the canonical detail;
4. the user can compare the latest values and intentionally submit again;
5. no automatic retry overwrites another actor's changes.

Closing a dirty editor requires confirmation. Closing clean view mode does not.
Browser navigation uses the same dirty-state protection as the sheet close
control.

## 25. Loading, updating, empty, and partial-failure states

### 25.1 Initial loading

Render a table skeleton that matches the final column geometry. Do not replace
the whole application shell with a spinner.

### 25.2 Background updating

Keep the current collection visible while search, filter, or page requests are
replaced. Use a quiet updating indicator that does not block reading.

### 25.3 Default empty state

Show:

- title `No leads yet`;
- short explanation;
- `Create lead` only when the actor has `crm_lead.write`.

### 25.4 Filtered empty state

Show:

- title `No leads match these filters`;
- `Clear filters`;
- no invented sample rows.

### 25.5 Detail loading or failure

The sheet owns its detail skeleton and error/retry state. The successful list
behind it remains usable. A not-found Lead closes the stale editor state and
refreshes the collection.

### 25.6 Catalogue partial failure

If the list succeeds but catalogue loading fails, rows may show a safe unknown
label with the raw short identifier. Catalogue-dependent filters and mutations
remain unavailable until retry succeeds. Status colors are not guessed.

## 26. Responsive behavior

### 26.1 Desktop

- use the full data table;
- keep the operational toolbar compact;
- open detail/editor as a right sheet with a readable maximum width;
- keep row actions aligned and target sizes consistent.

### 26.2 Tablet

- hide lower-priority columns before introducing horizontal overflow;
- retain Lead, Status, Rating, Owner, Updated, and Actions where width permits;
- allow the toolbar to wrap by functional group.

### 26.3 Mobile

- replace the wide table with compact semantic rows;
- show Lead identity, Status, Rating, owner summary, and updated time;
- open detail/editor as a full-width sheet;
- move filters into a dedicated filter sheet;
- retain explicit pagination controls;
- keep primary actions at least the application's standard touch target.

Mobile rows are not decorative cards inside a card container. Spacing and
lightweight separators define the collection.

## 27. Accessibility

The feature must provide:

- semantic page heading and collection labeling;
- keyboard-operable rows, menus, pagination, sheets, dialogs, and form fields;
- visible focus indicators;
- accessible names for every icon-only control;
- dialog title and description relationships;
- focus trap while modal surfaces are open;
- focus restoration to the invoking control when a surface closes;
- field errors associated through `aria-describedby` or the established form
  primitive;
- `aria-live` treatment for result count and non-disruptive mutation outcomes;
- text labels in addition to Status and Rating colors;
- sufficient contrast in normal, hover, focus, disabled, and destructive
  states;
- reduced-motion behavior for sheet and dialog transitions;
- no nested interactive elements inside row activation targets.

Quick Call exposes an accessible label containing the Lead display name. A
missing or invalid phone never renders a disabled mystery icon.

## 28. English-only content

Every runtime string in the feature is English, including:

- headings and descriptions;
- filter labels and options owned by the UI;
- table headings;
- action labels and tooltips;
- form labels, helper text, and validation messages;
- dialog copy;
- loading, empty, error, conflict, and success copy;
- scoring factor and recommendation copy.

Tenant-created catalogue names, company names, personal names, notes, and other
business data remain exactly as stored. English-only affects the application
interface, not user data.

The scoring backend must stop returning localized Vietnamese presentation
sentences. Structured codes keep localization and language policy in the
frontend interface layer.

## 29. Performance constraints

- debounce search by approximately 300 milliseconds;
- cancel or supersede stale list requests;
- lazy-load detail only when required;
- share catalogue queries across controls;
- avoid eager loading one detail request per row;
- avoid client-side aggregation over paginated results;
- memoize column definitions and stable presentation maps where the existing
  table pattern benefits;
- keep interaction animation limited to transform and opacity;
- avoid adding a new large dependency for behavior already supported by the
  repository.

## 30. Backend corrections and API-reference synchronization

Frontend contract hardening can proceed against the existing Lead CRUD API,
but the following workflows are not production-complete until their backend
corrections are implemented:

1. scoring returns structured factor and recommendation codes and applies
   currency-aware budget rules;
2. auto-assignment accepts a version, returns `LeadResponse`, persists fair
   assignment state, and reports no-eligible-owner explicitly;
3. conversion validates converted status category and every optional target
   reference in tenant and data scope.

Every implemented API request, response, error-code, permission, validation, or
behavior change must update repository-level `docs/api-reference.md` in the same
implementation task. Documentation must describe only behavior that exists in
source at that time.

Until a correction is deployed and documented, the affected action must not be
released as a production action. Backend and frontend delivery for that action
must be coordinated in the same release boundary. The frontend must not
simulate the corrected result or infer readiness from a successful HTTP status.

## 31. Feature readiness rules

The Lead screen has two readiness layers:

### 31.1 CRUD-ready layer

List, search, filters, pagination, detail, create, edit, delete, Status, Source,
Rating, owner preservation, and Quick Call may ship after exact frontend
contract hardening against existing APIs.

### 31.2 Workflow-ready layer

Scoring, auto-assignment, and conversion may be exposed as production actions
only when the backend behavior required by Sections 20 through 22 is deployed
and the API reference is synchronized.

This separation prevents a polished interface from masking incomplete backend
semantics.

## 32. Acceptance criteria

### 32.1 Contract correctness

- No Lead API type contains invented `fullName`, `phone`, `city`,
  `assignedTo`, `leadSource`, `status`, or `estimatedRevenue` aliases.
- No API adapter invents Lead business data.
- List parsing uses only the implemented `PageResult` shape.
- Status and Source filters send UUID parameters.
- Create and edit fields match backend DTOs.
- Edit loads detail before submission.
- Update and conversion send the current version.
- Delete sends the current version in `If-Match`.
- Auto-assignment sends a current version after the backend contract is
  corrected.
- Estimated values retain amount and currency together.

### 32.2 Collection behavior

- Collection, filter, page, size, and editor state survive refresh and browser
  navigation through URL parameters.
- Search and every filter are server-backed.
- Result counts and pagination come from the backend response.
- No current-page KPI is presented as a global metric.
- Sort controls are absent until the server supports sorting.
- Quick Call appears only for a canonical valid phone.

### 32.3 Workflow governance

- Read and write actions follow the permission matrix.
- Read-only actors can inspect Leads without mutation controls.
- Status badges import `@/config/crmStatusConfig`.
- Unknown custom statuses use the centralized neutral fallback.
- Scoring is described as rule-based and does not mutate Rating.
- Auto-assignment uses eligible, fair, concurrency-safe backend behavior before
  being presented as production-ready.
- Conversion copy never claims that records are created.
- Converted status and linked references are validated by the backend.
- Converted Leads cannot be converted again.

### 32.4 UX and accessibility

- Loading, background updating, default empty, filtered empty, list error,
  detail error, catalogue failure, mutation pending, version conflict, and
  permission states are implemented explicitly.
- Destructive actions use accessible confirmation dialogs.
- Recoverable errors remain visible in their owning surface.
- Dirty forms are protected from accidental dismissal.
- Keyboard navigation, focus management, accessible names, field associations,
  contrast, and reduced motion follow the application standard.
- Desktop, tablet, and mobile behaviors follow Section 26.
- All runtime interface copy is English.

### 32.5 Source quality

- `LeadsPage.tsx` is composition-focused rather than a feature monolith.
- API calls do not live inside presentation-only components.
- Query keys are tenant-scoped.
- Catalogue, error, schema, and mapping concerns have focused boundaries.
- No unused mock Lead model remains as a competing source of truth.
- No unrelated user change is reset, staged, committed, or overwritten.

## 33. Verification under repository rules

This document specifies observable acceptance criteria but does not authorize
test, build, browser, API, or manual runtime execution.

During this specification task:

- no product code is changed;
- no API reference is changed because no API behavior is implemented;
- no test, build, dev server, browser, or API command is run;
- no file is staged;
- no commit, push, branch integration, or pull request is created.

Future implementation verification must follow the repository rules active at
that time. Without explicit authorization to run tests, verification is limited
to static inspection, type/contract comparison, source searches, syntax review,
and scoped diff review. The implementer must not claim runtime behavior was
verified when it was not executed.

## 34. Final approved boundaries

This specification approves a Lead Operations Workspace with:

- exact CRUD contracts;
- canonical catalogues;
- URL and React Query state;
- desktop and mobile collections;
- view/create/edit surfaces;
- permission and concurrency safety;
- truthful Quick Call;
- rule-based scoring after structured-response correction;
- fair auto-assignment after concurrency and eligibility correction;
- mark-as-converted after status and reference validation correction;
- complete operational states, responsive behavior, accessibility, and
  English-only content.

It deliberately excludes Kanban, bulk operations, import/export, aggregate KPI
cards, activity timelines, and creation of new CRM records during conversion.
Those capabilities require separate contracts and separate approved designs.
