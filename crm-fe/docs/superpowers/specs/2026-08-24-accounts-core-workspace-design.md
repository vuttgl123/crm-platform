# Account Core Workspace Production Design Specification

**Date:** 2026-08-24

**Status:** Design approved in conversation

**Product surface:** `crm-fe` Accounts directory and account detail workspace

**Runtime language:** English only

**Implementation status:** Design only. This document does not claim that proposed backend or frontend changes are implemented.

## 1. Relationship to existing requirements

This specification defines the production target for these existing routes:

- `/app/crm/accounts`
- `/app/crm/accounts/:id`

It covers the account directory, account hierarchy, account profile, addresses,
communication channels, commercial relationships, and account notes. It also
defines which currently visible surfaces must not ship until their backend data
and authorization behavior are corrected.

This is a design specification, not an implementation plan. It intentionally
does not assign tasks, prescribe a commit sequence, or change product code.

Repository rules continue to apply:

- No Git commit, staging, push, or pull request is part of this work.
- No test, build, browser, API, or manual runtime command is part of this work.
- Any later API implementation must update `docs/api-reference.md` in the same
  implementation task.
- Existing user-owned changes in the worktree must be preserved.

## 2. Executive decision

Accounts becomes an **Account Core Workspace** rather than a decorative CRM
dashboard.

The production surface consists of:

1. A reliable server-paginated account directory.
2. A lazy, server-backed hierarchy view behind an explicit capability gate.
3. A focused account profile with five primary tabs:
   - Overview
   - Addresses
   - Communication channels
   - Relationships
   - Notes
4. Exact request and response contracts with optimistic concurrency.
5. Permission-aware create, update, delete, and child-resource actions.
6. Explicit loading, empty, error, conflict, and permission states.

The following surfaces are excluded from the production workspace until
separate backend-hardening work is completed:

- Timeline
- Customer Health
- Duplicate Scan
- Duplicate Merge
- Advanced account intelligence and analytics

The decision prioritizes trustworthy operational data over a visually busy but
semantically unsafe Account 360 screen.

## 3. Current-state audit

### 3.1 Active entry points

The active routes render:

- `AccountsPage.tsx`
- `AccountDetailPage.tsx`

Navigation is currently gated by `crm_account.read`.

The feature also contains an unused duplicate modal chain:

- `EditAccountModal.tsx`
- `AccountDetailModal.tsx`
- `schemas/accountFormSchema.ts`

The duplicate chain is not the active route implementation and creates a second
set of labels, form rules, and mutation behavior that can drift from the real
screen.

### 3.2 Structural debt

The active list and detail pages each combine too many responsibilities:

- Fetching and response-shape normalization
- URL-independent filter state
- Permission-insensitive actions
- Form state and validation
- Formatting and status presentation
- Child-resource loading and mutation
- Confirmation behavior
- Loading, empty, and error rendering

This concentration makes it difficult to preserve exact backend contracts and
causes unrelated account features to fail or reload together.

### 3.3 Directory correctness issues

The current account directory:

- Calls account search without consistently sending `page` and `size`.
- Accepts speculative response fields such as `content` and `totalItems`.
- Builds a recursive hierarchy from only the currently loaded page.
- Treats an account as a root when its parent is absent from that page.
- Omits children that are not present in the loaded page.
- Applies owner and Do Not Contact filters only to the loaded client array.
- Calculates totals and customer counts from the loaded array.
- Paginates derived roots rather than the backend `PageResult`.
- Does not protect recursive rendering against multi-node parent cycles.
- Exposes create, delete, subsidiary, and duplicate actions without consistent
  write-permission gating.
- Uses `window.confirm` for destructive operations.
- Uses approval-request history as an owner candidate source.
- Hardcodes VND in the create flow.

These behaviors can display plausible but incorrect production data.

### 3.4 Detail correctness issues

The current account detail page:

- Loads the account and several child collections eagerly.
- Loads only a limited account summary set for parent and relationship choices.
- Maintains large, unrelated local state groups in one page component.
- Contains runtime copy in more than one language.
- Uses gradients, KPI-style panels, and dense card nesting that compete with
  operational content.
- Includes two different note experiences, one of which uses `localStorage`.
- Silently converts some child-resource API failures into empty arrays.
- Does not gate all write actions by `crm_account.write`.
- Uses locale- and currency-specific formatting assumptions.
- Does not provide a consistent version-conflict recovery flow.

### 3.5 Child-resource contract mismatches

The existing frontend adapters diverge from backend contracts in material ways:

- Address create and update default a missing country code to `VN`.
- Communication-channel update marks `channelType` and `rawValue` optional even
  though the backend requires a full replacement payload.
- Communication-channel normalization silently rewrites a local number starting
  with `0` to the Vietnamese `+84` country code.
- Relationship end sends `endDate` and `reason`, while the backend requires
  `{ "validTo": "YYYY-MM-DD" }`.
- Notes use a speculative target/content model and speculative pagination, while
  the backend uses explicit target identifiers and returns a list of summaries.
- Note delete defaults a missing version to `1`.

### 3.6 Unsafe intelligence surfaces

The current supporting services are not safe enough for production exposure:

- Timeline activity retrieval is not reliably filtered to the requested account
  and can expose tenant-wide activity on an account screen.
- Customer Health can return fixed fallback component scores when data queries
  fail, making a generated score look authoritative.
- Duplicate scanning can inject fabricated duplicate data.
- Duplicate merge suppresses failures, reports success too broadly, and does not
  guarantee complete dependent-data migration, version checks, or audit safety.

The UI must not imply that these services are trustworthy by continuing to show
their widgets.

## 4. Goals

The design must:

1. Make the directory accurate for large datasets.
2. Make every visible filter server-backed.
3. Establish one canonical account form and one canonical account detail page.
4. Preserve backend validation, data scope, and optimistic concurrency.
5. Provide a safe organizational hierarchy without constructing a tree from a
   paginated subset.
6. Make addresses, channels, relationships, and notes operationally reliable.
7. Enforce `crm_account.read` and `crm_account.write` consistently.
8. Use English-only runtime copy.
9. Use the centralized CRM status configuration for account badges.
10. Separate API failure from valid empty data.
11. Remove fabricated defaults and country-specific inference.
12. Provide accessible, responsive workflows suitable for production use.

## 5. Non-goals

This specification does not design or approve:

- A new landing-page visual system.
- A CRM analytics dashboard.
- Opportunity, quote, order, ticket, or contact redesigns.
- A complete user and team directory subsystem.
- Automatic account enrichment.
- Timeline backend remediation.
- Customer-health scoring remediation.
- Deduplication or merge remediation.
- Bulk import or export.
- Bulk edit or mass deletion.
- A new lifecycle state machine that is not supported by backend rules.
- Product implementation, implementation planning, commits, or tests.

## 6. Design posture

Accounts is a dense operational workspace, not a marketing surface.

The visual posture is:

- Flat enterprise surfaces
- Strong typographic hierarchy
- Compact but readable data density
- Neutral backgrounds and light borders
- Minimal shadow
- No gradients
- No decorative KPI cards
- No nested card stacks where a section or row is sufficient
- Badges reserved for statuses and classifications
- One clear primary action per screen region
- Destructive actions represented by text in a menu or confirmation dialog, not
  by an unexplained icon alone

Recommended design dials:

- Visual variance: 3 of 10
- Motion intensity: 3 of 10
- Data density: 8 of 10

Motion is limited to functional transitions such as dialog entry, disclosure,
tab change, and hierarchy expansion. It must respect reduced-motion settings.

## 7. Sources of truth and invariants

### 7.1 Data sources

The backend response is the source of truth for:

- Account content
- Account totals
- Pagination
- Parent identity
- Owner identity
- Lifecycle
- Do Not Contact state
- Address history and primary state
- Communication-channel normalization and primary state
- Relationship direction and active period
- Note content and version

The browser must not manufacture missing business data.

### 7.2 Hierarchy source

`parentAccountId` is the only source of truth for organizational hierarchy.

`PARENT_CHILD` relationship records are not a second hierarchy model. Existing
legacy `PARENT_CHILD` records may be displayed as read-only historical data, but
new records of that type must not be created from the commercial Relationships
tab.

### 7.3 URL source

The directory URL is the source of truth for view, search, filters, page, and
page size. Navigating backward and forward must restore the same directory
state.

### 7.4 Concurrency source

The latest backend `version` is the source of truth for all versioned writes.
The frontend must never invent a version or silently force an overwrite.

### 7.5 Status source

All Account Lifecycle and Account Type presentation must be imported from:

```text
@/config/crmStatusConfig
```

Feature components must not define independent lifecycle or account-type color
maps.

## 8. Authorization and data scope

### 8.1 Permission matrix

| Capability | Required permission |
|---|---|
| Open account directory | `crm_account.read` |
| View account detail | `crm_account.read` |
| View addresses, channels, relationships, notes | `crm_account.read` |
| Create account | `crm_account.write` |
| Update account | `crm_account.write` |
| Delete account | `crm_account.write` |
| Add subsidiary | `crm_account.write` |
| Create, update, end, or delete child resources | `crm_account.write` |
| Create, update, or delete account notes | `crm_account.write` |

The frontend uses permissions to decide which controls are available. The
backend remains the final authorization authority for every request.

### 8.2 UI behavior

When a user lacks write permission:

- The page remains fully readable if read permission is present.
- Primary write actions are hidden when their absence does not reduce clarity.
- Disabled controls are used only when the control's presence helps explain a
  visible state; the disabled control must include an explanation.
- Direct navigation to an unavailable mutation surface must not make a request.

When a user lacks read permission, the route renders the application's standard
permission-denied state and does not fetch account data.

### 8.3 Scope requirements

Every account and child-resource query or mutation must resolve the target
account under the current tenant and data scope. Possession of a UUID does not
grant access.

Notes require special correction because their mutation authorization currently
uses read-level permission and does not provide adequate account-target scope
assurance. Notes write controls must not be enabled in production until the
backend correction in Section 10.6 is implemented.

## 9. Existing core Account API contract

This section records the implemented contract that the frontend must consume
exactly. Proposed additions are isolated in Section 10.

### 9.1 Shared values

```ts
type AccountType =
  | 'ORGANIZATION'
  | 'PERSON'
  | 'PARTNER'
  | 'RESELLER'
  | 'SUPPLIER';

type AccountLifecycleStage =
  | 'PROSPECT'
  | 'QUALIFIED'
  | 'CUSTOMER'
  | 'CHURNED'
  | 'INACTIVE';

type OwnerType = 'USER' | 'TEAM';

interface AccountOwner {
  type: OwnerType;
  id: string;
}

interface AccountRevenue {
  amount: number;
  currencyCode: string;
}
```

### 9.2 Summary response

```ts
interface AccountSummaryResponse {
  id: string;
  accountNumber: string;
  displayName: string;
  legalName?: string | null;
  parentAccountId?: string | null;
  accountType: AccountType;
  lifecycleStage: AccountLifecycleStage;
  owner?: AccountOwner | null;
  doNotContact: boolean;
  updatedAt: string;
  version: number;
}
```

### 9.3 Detail response

```ts
interface AccountResponse extends AccountSummaryResponse {
  industryCode?: string | null;
  taxIdentifier?: string | null;
  registrationNumber?: string | null;
  website?: string | null;
  annualRevenue?: AccountRevenue | null;
  employeeCount?: number | null;
  description?: string | null;
  preferredLanguageCode?: string | null;
  createdAt: string;
  createdBy?: string | null;
  updatedBy?: string | null;
}
```

### 9.4 Page response

The only accepted page contract is:

```ts
interface PageResult<T> {
  items: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}
```

`content` and `totalItems` are not valid alternative fields and must be removed
from the frontend Account page model.

### 9.5 Search request

```text
GET /api/accounts
```

Implemented query parameters:

| Parameter | Type | Constraint |
|---|---|---|
| `q` | string | Maximum 255 characters |
| `accountType` | enum | Optional |
| `lifecycleStage` | enum | Optional |
| `ownerType` | enum | Must accompany `ownerId` |
| `ownerId` | UUID | Must accompany `ownerType` |
| `page` | integer | Minimum 0 |
| `size` | integer | 1 through 100 |

The response is `PageResult<AccountSummaryResponse>`.

### 9.6 Create request

```text
POST /api/accounts
```

| Field | Requirement |
|---|---|
| `accountNumber` | Required, non-blank, maximum 191 |
| `accountType` | Optional, backend default remains authoritative |
| `legalName` | Optional, maximum 255 |
| `displayName` | Required, non-blank, maximum 255 |
| `parentAccountId` | Optional UUID |
| `owner.type` | Required when owner is present |
| `owner.id` | Required UUID when owner is present |
| `lifecycleStage` | Optional, backend default remains authoritative |
| `industryCode` | Optional, maximum 191 |
| `taxIdentifier` | Optional, maximum 255 |
| `registrationNumber` | Optional, maximum 191 |
| `website` | Optional string |
| `annualRevenue.amount` | Non-negative, up to 14 integer and 6 fractional digits |
| `annualRevenue.currencyCode` | Uppercase three-letter currency code |
| `employeeCount` | Optional non-negative integer |
| `description` | Optional string |
| `preferredLanguageCode` | Maximum 10, valid language-tag pattern |
| `doNotContact` | Optional boolean |

An annual revenue amount without a currency code is invalid. The UI must model
amount and currency as one value group.

### 9.7 Update request

```text
PUT /api/accounts/{id}
```

The request requires:

- Positive `version`
- `accountType`
- Non-blank `displayName`
- `lifecycleStage`
- `doNotContact`

It accepts the same optional editable profile fields as create. `accountNumber`
is absent because it is immutable after creation.

### 9.8 Delete request

```text
DELETE /api/accounts/{id}
If-Match: "<version>"
```

Success returns `204 No Content`.

### 9.9 Existing account error codes

The UI must handle at least:

- `ACCOUNT_NOT_FOUND`
- `ACCOUNT_NUMBER_ALREADY_EXISTS`
- `ACCOUNT_VERSION_CONFLICT`
- `ACCOUNT_OWNER_INVALID`
- `ACCOUNT_PARENT_INVALID`
- `ACCOUNT_REVENUE_CURRENCY_REQUIRED`

Proposed hierarchy and delete errors are defined separately because they are not
implemented behavior at the time of this design.

## 10. Required backend additions and corrections

These changes are production dependencies. They are design requirements, not a
claim about current implementation.

### 10.1 Server-backed Do Not Contact filter

Account search adds:

```text
doNotContact=true|false
```

The backend applies the filter before pagination and returns totals for the
filtered result. Until this query parameter is implemented and documented, the
directory must not expose a Do Not Contact filter.

### 10.2 Lazy hierarchy endpoint

Add a dedicated endpoint:

```text
GET /api/accounts/hierarchy
GET /api/accounts/hierarchy?parentAccountId=<uuid>&page=0&size=50
```

An omitted `parentAccountId` requests root accounts. A supplied
`parentAccountId` requests only its direct children.

The response is:

```ts
interface AccountHierarchyNodeResponse extends AccountSummaryResponse {
  childCount: number;
  hasChildren: boolean;
  scopeBoundary: boolean;
}

type AccountHierarchyPage = PageResult<AccountHierarchyNodeResponse>;
```

Requirements:

- Apply tenant and account data scope before pagination.
- Return roots or direct children only, never an unbounded whole tree.
- Order siblings deterministically by display name, account number, then ID.
- Calculate `childCount` from active, visible direct children.
- Include a visible account whose parent is outside the caller's data scope as a
  root-page scope boundary with `scopeBoundary=true` and a redacted
  `parentAccountId`. This preserves the visible account without disclosing the
  inaccessible parent or misrepresenting it as an organizational root.
- Return not found or permission denied without revealing whether an inaccessible
  parent exists.
- Keep the capability disabled until existing active parent links are audited for
  cycles and orphaned soft-deleted parents.

### 10.3 Parent-cycle guard

Every create or update that sets `parentAccountId` must reject:

- Self-parenting
- A parent in another tenant or outside data scope
- A missing or inactive parent
- Any parent that is a descendant of the account being updated

The new domain error is:

```text
ACCOUNT_PARENT_CYCLE
```

Cycle detection belongs in backend domain/application logic. Frontend exclusion
of the current account is a usability aid, not a security or integrity control.

### 10.4 Parent delete guard

Soft deletion must not leave active subsidiaries pointing to a hidden parent.
Deleting an account with active direct or indirect children is blocked with:

```text
ACCOUNT_HAS_ACTIVE_CHILDREN
```

The user must reparent or otherwise resolve those children before retrying.
There is no cascade delete and no automatic reparenting in this design.

### 10.5 Owner-source boundary

Approval-request history is not an owner directory and must not be used as one.

The production-safe first release permits only:

- Unassigned, where account scope permits it
- Me, resolved from the current authenticated actor
- Teams from an endpoint whose membership and tenant behavior have been verified
- The currently assigned owner, preserved during editing

A complete user/team owner-directory API may be designed separately. The
Accounts UI must not fabricate people, names, membership, team leadership, or
counts while that dependency is absent.

### 10.6 Notes authorization and scope correction

For `/api/crm/notes` when `accountId` is the target:

- List and get require `crm_account.read` and account data scope.
- Create, update, and delete require `crm_account.write` and account data scope.
- Update and delete must confirm that the note belongs to an account visible in
  the current tenant and scope.
- A caller must not mutate a note by knowing only its note UUID.

The Account Notes mutation UI remains production-gated until these requirements
are implemented.

### 10.7 Relationship status filter

Relationship search adds:

```text
status=ACTIVE|ENDED
```

The backend applies status before pagination. The active and historical views
must not be created by splitting a mixed, paginated client page. Until this
parameter exists, the UI may show one chronological `All relationships`
collection but must not claim complete Active or History collections.

### 10.8 API reference synchronization

When Sections 10.1 through 10.7 are implemented, the same implementation task
must update `docs/api-reference.md` with:

- Endpoints and query parameters
- Authentication and permissions
- Data-scope behavior
- Request and response fields
- Validation constraints
- `If-Match` requirements
- Status codes
- Error codes
- Safe examples without real credentials or personal data

This design-only task does not modify the API reference because the behavior is
not implemented yet.

## 11. Information architecture

### 11.1 Routes

| Route | Purpose |
|---|---|
| `/app/crm/accounts` | Account directory and optional hierarchy view |
| `/app/crm/accounts/:id` | Account core workspace |

No additional top-level route is required for create or edit. These workflows
use an accessible dialog on desktop and a full-screen sheet on mobile.

### 11.2 Directory structure

The directory is composed of:

1. Page header
2. Search and filter toolbar
3. List or Hierarchy view selector
4. Collection content
5. Server pagination

List is the default production view. Hierarchy appears only when its backend
capability is enabled.

### 11.3 Detail structure

The account workspace is composed of:

1. Breadcrumb
2. Account identity header
3. Permission-aware action group
4. Primary tab navigation
5. Lazy tab content

The five primary tabs are:

1. Overview
2. Addresses
3. Communication channels
4. Relationships
5. Notes

The route itself remains stable when tabs change. The active tab is represented
in the URL query so refresh and browser navigation preserve context.

## 12. Account Directory design

### 12.1 Page header

The header contains:

- `Accounts`
- A concise operational subtitle
- The backend `totalElements` count for the current filters
- `New account` when `crm_account.write` is present

The header does not contain marketing copy, gradients, or KPI cards calculated
from the currently loaded page.

### 12.2 View selector

The selector contains:

- `List`
- `Hierarchy`, only when the hierarchy capability is enabled

Changing the view preserves compatible search state, resets page to zero, and
updates the URL.

### 12.3 Search and filters

Controls appear in this order:

1. Search input
2. Account type
3. Lifecycle
4. Owner
5. Do Not Contact, only when server support exists
6. Clear filters

Search behavior:

- Trim leading and trailing whitespace before requesting.
- Enforce the backend maximum of 255 characters.
- Debounce typing without maintaining a second hidden filter state.
- Reset page to zero when the committed search changes.
- Do not filter the returned page again on the client.

Filter behavior:

- Use exact enum values in the URL and API request.
- Treat invalid URL enum values as absent and normalize the URL.
- Send `ownerType` and `ownerId` together or omit both.
- Reset page to zero on every filter change.
- Display active filters compactly without rendering every value as a large pill.

### 12.4 Table columns

Desktop columns are:

| Column | Content |
|---|---|
| Account | Display name, account number, optional legal name |
| Type | Centralized Account Type badge |
| Lifecycle | Centralized lifecycle badge |
| Parent account | Resolved parent name or clear fallback |
| Owner | Resolved owner label or safe fallback |
| Contact preference | `Do not contact` warning or neutral allowed state |
| Last updated | Locale-aware timestamp |
| Actions | Permission-aware overflow menu |

Parent and owner lookup failures must not render fabricated names. Safe fallback
labels are:

- `Account <short UUID>` for an unresolved parent
- `User <short UUID>` for an unresolved user owner
- `Team <short UUID>` for an unresolved team owner

### 12.5 Row interaction

- Clicking the account identity opens the detail route.
- Keyboard users can reach the link and action menu independently.
- The row itself is not a hidden click target that conflicts with selection or
  menu controls.
- `Add subsidiary`, `Edit`, and `Delete` are write-gated.
- `View account` remains available with read permission.
- Destructive action is text-labeled in the menu.

### 12.6 Pagination

- Use `page`, `size`, `totalElements`, and `totalPages` exactly as returned.
- Allowed page sizes must remain within 1 through 100.
- A page change updates the URL and scrolls the collection heading into view.
- If deletion leaves the current page empty and a previous page exists, navigate
  to the previous valid page.
- Never calculate a second client-side total.

## 13. Hierarchy View design

### 13.1 Capability gate

Hierarchy is absent from production UI until all of the following are true:

- Dedicated endpoint is implemented.
- Tenant and data-scope behavior is verified by static contract inspection.
- Parent-cycle guard is implemented.
- Parent-delete guard is implemented.
- Existing active parent links have no unresolved cycles or orphaned parents.

### 13.2 Root and child loading

- Opening Hierarchy requests root nodes only.
- Expanding a node requests its direct children only.
- Expanded child pages are cached independently by parent ID and page.
- Collapsing a node does not discard its cache immediately.
- A failed child request displays an inline error and Retry under that parent.
- A failed child request does not collapse unrelated branches.
- Scope-boundary nodes appear in a separate `Limited hierarchy access` group and
  never reveal the inaccessible parent identifier.

### 13.3 Node content

Each node displays:

- Disclosure control when `hasChildren` is true
- Display name
- Account number
- Lifecycle badge
- Owner
- Direct child count
- `View account`
- `Add subsidiary` when write permission is present

### 13.4 Hierarchy search

The first release does not invent a whole-tree search contract. Search remains a
List-view capability. If a user enters search while Hierarchy is active, the UI
switches to List, preserves the search value, and resets page to zero.

### 13.5 Integrity state

The hierarchy UI must never silently show a cyclic or orphaned record as a root.
If the backend identifies a hierarchy integrity issue, display a non-destructive
error state and direct the user to the appropriate administrative resolution.
The UI must not guess a replacement parent.

A scope-boundary node is not an integrity error. Its explicit label communicates
that the caller can access the account but not its organizational parent.

## 14. Account Detail design

### 14.1 Breadcrumb and identity header

The header contains:

- Breadcrumb link to `Accounts`
- Display name
- Account number
- Account Type badge
- Lifecycle badge
- Do Not Contact state
- Owner
- Last updated timestamp

It does not display health scores, decorative totals, or inferred customer
quality.

### 14.2 Action group

With write permission:

- `Edit account` is the primary action.
- `Add subsidiary` is a secondary action.
- `Delete account` is in the overflow menu.

Without write permission, the header has no empty action container.

### 14.3 Overview tab

Overview contains restrained sections:

1. Identity and classification
2. Ownership and hierarchy
3. Business details
4. Communication preferences
5. Description
6. Tags and custom fields as secondary metadata
7. Audit metadata

Missing optional values render `Not provided`, not an invented default.

Annual revenue uses its stored currency code. The renderer must not hardcode USD,
VND, or another currency in title, text, tooltip, or accessible label.

### 14.4 Lazy child tabs

Addresses, Communication channels, Relationships, and Notes request their data
only when first opened. Each tab owns its loading, empty, error, retry, and
mutation state.

A failure in one child tab must not replace the account header or other tab data.

### 14.5 Not-found behavior

If account detail returns `ACCOUNT_NOT_FOUND`:

- Render a dedicated `Account not found` state.
- Explain that the record may have been removed or is no longer accessible.
- Provide `Back to Accounts`.
- Do not fetch child resources.

Permission denial uses the standard permission state and does not reveal account
details.

## 15. Component architecture

The target architecture separates orchestration from presentation and contracts.
Names below describe responsibilities and may be adapted to existing repository
naming conventions without changing the boundaries.

### 15.1 Directory boundaries

```text
AccountsPage
  AccountDirectoryHeader
  AccountDirectoryToolbar
  AccountViewSelector
  AccountList
    AccountTable
    AccountCompactList
    AccountPagination
  AccountHierarchy
    AccountHierarchyLevel
    AccountHierarchyNode
  AccountFormSurface
```

`AccountsPage` is responsible only for:

- Reading normalized URL state
- Checking route permission
- Selecting List or Hierarchy composition
- Opening create flow

It does not normalize speculative response shapes or calculate business totals.

### 15.2 Detail boundaries

```text
AccountDetailPage
  AccountDetailHeader
  AccountDetailTabs
  AccountOverviewTab
  AccountAddressesTab
  AccountChannelsTab
  AccountRelationshipsTab
  AccountNotesTab
  AccountFormSurface
  AccountDeleteDialog
```

`AccountDetailPage` owns the account ID, route state, permission gate, account
detail query, and tab composition. Each child tab owns only its resource.

### 15.3 Form boundaries

One canonical account form model and schema serve both create and edit.

The model distinguishes:

- Immutable create-only fields
- Required update fields
- Nullable optional fields
- Composite owner value
- Composite annual-revenue value
- Backend `version`

The unused modal chain and any duplicate schema have no place in the target
architecture. Removal occurs only after confirming there are no remaining
consumers.

### 15.4 Service boundaries

Each API adapter:

- Mirrors one backend contract.
- Uses exact response shapes.
- Does not add country, currency, owner, version, or business-data defaults.
- Performs safe syntactic normalization only, such as trimming optional text and
  uppercasing a user-selected ISO code.
- Exposes typed error information to the query or mutation layer.

## 16. URL, query, cache, and data flow

### 16.1 Directory URL model

Canonical parameters are:

| Parameter | Values | Default |
|---|---|---|
| `view` | `list`, `hierarchy` | `list` |
| `q` | String up to 255 | Absent |
| `accountType` | Account Type enum | Absent |
| `lifecycleStage` | Lifecycle enum | Absent |
| `ownerType` | `USER`, `TEAM` | Absent |
| `ownerId` | UUID | Absent |
| `doNotContact` | `true`, `false` | Absent |
| `page` | Integer at least 0 | `0` |
| `size` | Integer from 1 through 100 | Product default |

Example:

```text
/app/crm/accounts?view=list&q=acme&lifecycleStage=CUSTOMER&page=0&size=25
```

Unknown parameters are preserved only if required by the wider application.
Invalid Accounts parameters are normalized to safe defaults.

### 16.2 Detail URL model

Canonical detail tab values are:

```text
overview
addresses
channels
relationships
notes
```

Example:

```text
/app/crm/accounts/8e9bcf92-606e-45e5-a290-704d42e10f58?tab=addresses
```

An invalid tab value resolves to `overview`.

### 16.3 Query keys

Conceptual query-key families are:

```text
accounts.list(filters, page, size)
accounts.detail(accountId)
accounts.hierarchy(parentAccountId, page, size)
accounts.addresses(accountId, filters)
accounts.channels(accountId)
accounts.relationships(accountId, page, size)
accounts.notes(accountId)
```

Keys include every server-affecting parameter and exclude presentation-only
state.

### 16.4 Mutation invalidation

| Mutation | Required cache effect |
|---|---|
| Create account | Invalidate relevant list and hierarchy roots |
| Update account | Replace detail from response; invalidate affected list and hierarchy levels |
| Delete account | Remove detail; invalidate lists and affected hierarchy levels |
| Create or update address | Invalidate that account's address collection |
| End address | Invalidate active and history address queries |
| Create, update, or delete channel | Invalidate that account's channel collection |
| Create or end relationship | Invalidate that account's relationship pages and the related account where direction is visible |
| Create, update, or delete note | Invalidate that account's note collection |

Do not invalidate the entire CRM cache for a local account mutation.

### 16.5 Loading isolation

- Directory loading does not blank the application shell.
- Detail loading may skeleton the identity header and active tab frame.
- Opening a new tab preserves the loaded account header.
- Background refresh preserves existing content and indicates refresh without
  replacing it with a full skeleton.

## 17. Account Create and Edit design

### 17.1 Shared surface

Desktop uses a modal or side sheet sized for a structured business form. Mobile
uses a full-screen form surface. Both share the same form model, validation, and
submit behavior.

### 17.2 Field groups

#### Identity

- Account number
- Display name
- Legal name
- Account type

#### Classification

- Lifecycle
- Industry code
- Parent account

#### Ownership

- Owner type
- Owner

#### Business details

- Tax identifier
- Registration number
- Website
- Annual revenue amount
- Annual revenue currency
- Employee count

#### Preferences

- Preferred communication language
- Do Not Contact

#### Description

- Description

### 17.3 Create defaults

The UI may reflect backend-defined create defaults only when the defaults are
explicitly part of the implemented contract. Current domain defaults are:

- `accountType`: `ORGANIZATION`
- `lifecycleStage`: `PROSPECT`
- `doNotContact`: `false`

The current actor may be offered as `Me`; the UI must not silently assign an
owner unless product policy explicitly requires it and the submitted value is
visible before save.

### 17.4 Immutable account number

Account number is required during create and never included in update. Edit may
show it as read-only contextual information.

### 17.5 Parent selector

The selector:

- Performs asynchronous server search.
- Excludes the current account during edit.
- Shows display name and account number.
- Does not depend on the first 100 accounts.
- Does not imply that frontend exclusion prevents backend cycles.
- Preserves the current unresolved parent by ID until it can be resolved or
  explicitly cleared.

`Add subsidiary` opens create with the current account preselected as parent.
The preselection remains visible and editable subject to permissions.

### 17.6 Owner selector

The selector uses only the safe sources in Section 10.5. If the current owner
cannot be resolved to a label, the edit form preserves its exact type and ID.

Owner rules:

- Type and ID are both present or both absent.
- Clearing owner produces an unassigned value only where permitted.
- Changing owner requires write permission.
- No approval-request record is presented as an active owner candidate.

### 17.7 Annual revenue

Amount and currency are one validation group:

- Empty amount and empty currency means no annual revenue.
- Amount requires currency.
- Currency without amount is invalid in the form.
- Amount must be non-negative.
- Currency is a selected uppercase ISO-style three-letter code.
- Display uses the stored code and a locale-aware formatter.
- Unsupported formatter currency never causes a false fallback to USD or VND;
  render the numeric amount with its literal stored code instead.

### 17.8 Lifecycle editing

Lifecycle values are exactly:

- `PROSPECT`
- `QUALIFIED`
- `CUSTOMER`
- `INACTIVE`
- `CHURNED`

This design does not add frontend-only transition restrictions. Update uses the
current version and backend validation remains authoritative.

### 17.9 Submit behavior

- Disable duplicate submit while the mutation is in flight.
- Keep the form open on validation, permission, or conflict errors.
- Map field-specific domain errors to their fields.
- Move focus to the error summary or first invalid field.
- Close only after confirmed success.
- Use the returned account as the new detail cache value.

## 18. Addresses design

### 18.1 Existing endpoints

```text
GET  /api/accounts/{accountId}/addresses
POST /api/accounts/{accountId}/addresses
PUT  /api/accounts/{accountId}/addresses/{addressId}
POST /api/accounts/{accountId}/addresses/{addressId}/end
```

Update and end require:

```text
If-Match: "<version>"
```

### 18.2 Values

Address types:

- `BILLING`
- `SHIPPING`
- `OFFICE`
- `REGISTERED`
- `OTHER`

Validation statuses:

- `UNVERIFIED`
- `VALID`
- `INVALID`
- `PARTIAL`

Address-type and validation-status labels are English. They are not lifecycle
statuses and do not reuse lifecycle colors.

### 18.3 List structure

The tab contains:

- Address type filter
- `Active addresses`
- `Address history`
- `Add address` when write permission is present

Active data uses `includeHistory=false`. History is requested explicitly and is
not inferred by filtering an incomplete client list.

### 18.4 Request fields

Create and update are full-value requests containing:

- `addressType`
- `addressLine1`
- `addressLine2`
- `locality`
- `administrativeArea`
- `postalCode`
- `countryCode`
- `latitude`
- `longitude`
- `formattedAddress`
- `isPrimary`
- `validFrom`

Constraints:

- Country code is required and exactly two characters after normalization.
- Country is explicitly selected or entered; it does not default to `VN`.
- Latitude range is -90 through 90 with up to 6 fractional digits.
- Longitude range is -180 through 180 with up to 6 fractional digits.
- Latitude and longitude must appear together or both be absent.
- At least one meaningful address component is required by the address-level
  validator.
- `addressLine1`, `addressLine2`, `locality`, and `administrativeArea` have a
  maximum of 255 characters.
- `postalCode` has a maximum of 191 characters.
- `formattedAddress` has a maximum of 255 characters.

The UI may enforce the backend rule but must not invent stricter required street,
district, or city fields.

### 18.5 Primary behavior

Primary is scoped by address type. Setting an address primary may demote the
current primary of the same type. The UI displays the returned server state and
does not optimistically assume a cross-type rule.

Because update is full replacement, a primary toggle must submit the entire
current address value with the latest version.

### 18.6 End behavior

Ending an address is temporal, not deletion.

- Show the action only for an active address.
- Confirm the meaning of ending validity.
- Send current version by `If-Match`.
- Move the returned address to history after success.
- Handle already-ended and period errors explicitly.

### 18.7 Address errors

Handle:

- `ACCOUNT_ADDRESS_NOT_FOUND`
- `ACCOUNT_ADDRESS_VERSION_CONFLICT`
- `ACCOUNT_ADDRESS_ALREADY_ENDED`
- `ACCOUNT_ADDRESS_PERIOD_INVALID`
- `ACCOUNT_ADDRESS_PRIMARY_INVALID`

## 19. Communication Channels design

### 19.1 Existing endpoints

```text
GET    /api/accounts/{accountId}/communication-channels
POST   /api/accounts/{accountId}/communication-channels
PUT    /api/accounts/{accountId}/communication-channels/{channelId}
DELETE /api/accounts/{accountId}/communication-channels/{channelId}
```

Update and delete require `If-Match`.

### 19.2 Values

Channel types are:

- `EMAIL`
- `PHONE`
- `MOBILE`
- `SMS`
- `WHATSAPP`
- `LINKEDIN`
- `OTHER`

### 19.3 Response semantics

The UI distinguishes:

- `rawValue`: submitted business value
- `normalizedValue`: backend-normalized value
- `isPrimary`: primary state within the channel type
- `isVerified`: verification state
- `verifiedAt`: verification time when present
- `doNotUse`: channel-specific suppression
- `version`: concurrency token

Account-level `doNotContact` and channel-level `doNotUse` are different states.
The channel tab must show both contexts without treating one as the other.

### 19.4 Create and update contract

Both create and update submit a complete value:

```ts
interface AccountCommunicationChannelValue {
  channelType: ChannelType;
  rawValue: string;
  label?: string | null;
  isPrimary: boolean;
  doNotUse: boolean;
}
```

`channelType` and `rawValue` are required on update. The existing frontend
partial update model is invalid.

Any primary or Do Not Use toggle must reconstruct the full request from the
latest response and submit it with `If-Match`.

### 19.5 Normalization

- Email uses the backend email validator and normalization rules.
- Phone-like types require E.164-compatible input.
- The UI may remove visual separators only when the result remains an explicit
  international value.
- The UI must not infer `+84` or any other country code from a leading zero.
- If a country-assisted phone input is introduced, the user must explicitly
  choose the country before conversion.
- The normalized backend value may be shown as a preview or secondary value.

### 19.6 Primary and verification behavior

- Primary is scoped by channel type.
- Setting primary uses the returned collection state after success.
- Verification state is read-only unless a verified backend workflow exists.
- A visual badge must not imply that an unverified value is invalid.

### 19.7 Delete behavior

- Use a text-labeled Delete action.
- Open an accessible confirmation dialog containing type and value.
- Send the latest version by `If-Match`.
- Do not default version to any constant.
- Preserve the item and present recovery options on conflict.

### 19.8 Channel errors

Handle not-found, duplicate-value, validation, and version-conflict errors as
distinct states. A failed collection request must not render `No communication
channels`.

## 20. Relationships design

### 20.1 Existing endpoints

```text
GET  /api/accounts/{accountId}/relationships?page=0&size=25
POST /api/accounts/{accountId}/relationships
POST /api/accounts/{accountId}/relationships/{relationshipId}/end
```

Relationship search returns the exact standard `PageResult`.

The implemented search currently supports only `page` and `size`. The target
active/history design also requires the proposed `status` filter in Section
10.7.

### 20.2 Values

Backend relationship values include:

- `PARENT_CHILD`
- `PARTNER`
- `AFFILIATE`
- `SUPPLIER`
- `CUSTOMER`
- `OTHER`

Direction is:

- `OUTBOUND`
- `INBOUND`

New UI choices exclude `PARENT_CHILD`. Legacy records of that type remain
read-only and visibly identified as legacy hierarchy metadata.

### 20.3 Collection structure

The tab contains:

- `Active relationships`
- `Relationship history`
- Server pagination
- `Add relationship` with write permission

Active and history are separate server-filtered queries. If the status-filter
capability is not yet available, render one `All relationships` collection and
do not split the loaded page into misleading complete sections.

Each row displays:

- Related account identity
- Direction
- Relationship type
- Validity period
- Description when present
- End action when active and write permission is present

### 20.4 Target account selector

The selector:

- Uses asynchronous Account search.
- Excludes the current account.
- Shows display name and account number.
- Honors tenant and data scope.
- Does not load only the first 100 accounts.

Backend self-relationship validation remains authoritative.

### 20.5 Create request

```ts
interface CreateAccountRelationshipRequest {
  relatedAccountId: string;
  relationshipType: 'PARTNER' | 'AFFILIATE' | 'SUPPLIER' | 'CUSTOMER' | 'OTHER';
  validFrom?: string | null;
  validTo?: string | null;
  description?: string | null;
}
```

Description has a maximum of 4000 characters. The period must be valid under
backend date rules.

### 20.6 End request

The exact request is:

```json
{
  "validTo": "2026-08-24"
}
```

`validTo` is required. The frontend must not send `endDate` or `reason` because
those fields do not exist in the backend request.

### 20.7 Relationship errors

Handle:

- Relationship not found
- Relationship already exists
- Relationship already ended
- Related account invalid or inaccessible
- Self relationship
- Invalid validity period

After create or end, invalidate relationship data for both visible account
directions where applicable.

## 21. Account Notes design

### 21.1 Single notes surface

The account workspace has one Notes tab backed by `/api/crm/notes`.

Remove the localStorage account-note model from the target design. Do not render
both Quick Notes and a second local note panel.

### 21.2 Existing endpoints

```text
GET    /api/crm/notes?accountId=<uuid>
GET    /api/crm/notes/{id}
POST   /api/crm/notes
PUT    /api/crm/notes/{id}
DELETE /api/crm/notes/{id}
```

List returns `List<NoteSummaryResponse>`, not a page object.

### 21.3 Create request

```ts
interface CreateAccountNoteRequest {
  title?: string | null;
  body: string;
  visibility?: 'PRIVATE' | 'TEAM' | 'TENANT' | null;
  ownerUserId?: string | null;
  accountId: string;
}
```

Rules:

- Title maximum is 255 characters.
- Body is required and non-blank.
- `accountId` is the only target field populated from the Account Notes tab.
- Other target IDs are omitted.
- Owner identity is never fabricated.

### 21.4 Update request

```ts
interface UpdateAccountNoteRequest {
  version: number;
  title?: string | null;
  body: string;
  visibility?: 'PRIVATE' | 'TEAM' | 'TENANT' | null;
}
```

Version must be positive and body must be non-blank.

### 21.5 Delete request

```text
DELETE /api/crm/notes/{id}
If-Match: "<version>"
```

There is no default version. The delete action is unavailable if a valid version
has not been loaded.

### 21.6 List and detail behavior

Because list returns summaries, the UI must either:

- Render only fields present in the summary and fetch detail on open, or
- Use a backend response enhancement documented in a later implemented API
  change.

This design chooses the first option. Opening a note fetches its detail by ID.
The list does not assume that summary contains body content.

### 21.7 Production gate

The Notes tab may render read-only data only when account-target read scope is
correct. Create, edit, and delete controls remain gated until Section 10.6 is
implemented. The final production-ready outcome includes that correction and
then enables those controls for `crm_account.write`.

## 22. Tags and custom fields

Tags and custom fields remain secondary account metadata in Overview.

Requirements:

- They do not become primary navigation tabs.
- Their adapters must be checked against exact backend contracts before reuse.
- Read uses account read permission and scope.
- Write uses account write permission and scope.
- Runtime labels are English.
- A widget failure is isolated to its section and does not fail the account page.
- No placeholder tag, value, or custom-field definition is generated.

## 23. Concurrency and error recovery

### 23.1 Version preservation

Every versioned response retains its exact version through form initialization,
mutation, conflict handling, and cache replacement.

Versioned operations include:

- Account update and delete
- Address update and end
- Channel update and delete
- Note update and delete

### 23.2 Conflict flow

On version conflict:

1. Keep the user's unsaved form values or pending destructive context.
2. Explain that another change was saved first.
3. Offer `Reload latest` and `Cancel`.
4. Do not silently retry the stale mutation.
5. Do not overwrite the newer record.
6. If latest data is reloaded into an edit form, clearly warn that local changes
   will be replaced before performing the reload.

### 23.3 Error mapping

| Error category | UI treatment |
|---|---|
| Account number exists | Account-number field error |
| Owner invalid | Owner selector error |
| Parent invalid | Parent selector error |
| Parent cycle | Parent selector error with hierarchy explanation |
| Revenue currency required | Annual-revenue group error |
| Version conflict | Conflict dialog |
| Active children on delete | Delete dialog remains open with reparent guidance |
| Not found | Dedicated resource not-found state |
| Permission denied | Standard permission state; do not imply empty data |
| Network or server failure | Error state with Retry where safe |
| Validation failure | Error summary plus field errors |

### 23.4 No silent fallback

Catch blocks must not convert a failed request to an empty array, fixed score,
fabricated owner, fabricated duplicate, default country, default currency, or
default version.

## 24. Loading, empty, error, and permission states

### 24.1 Directory states

| State | Required presentation |
|---|---|
| Initial loading | Table or compact-row skeleton |
| Background refresh | Preserve rows with subtle refresh status |
| No accounts in tenant scope | `No accounts yet` and permission-aware create CTA |
| No filter results | `No accounts match these filters` and Clear filters |
| Request error | `Accounts could not be loaded` and Retry |
| Permission denied | Standard permission-denied state |

### 24.2 Child-tab states

Each tab distinguishes:

- Resource has never been loaded
- Resource is loading
- Resource is empty
- Resource request failed
- Resource loaded successfully
- Resource is refreshing

An error must never use empty-state copy.

### 24.3 Mutation states

- Mutation controls show progress without changing their accessible name to an
  ambiguous spinner.
- Duplicate submit is disabled.
- Other independent tabs remain usable when safe.
- Success feedback identifies the completed action.
- Failure feedback remains until dismissed or corrected.

## 25. Accessibility

The production target meets these interaction requirements:

- Every input has a programmatic and visible label.
- Help and error text are associated with the relevant input.
- Every icon button has an accessible name and tooltip where useful.
- Focus indicators are visible against the surrounding surface.
- Dialogs trap focus, support Escape when dismissal is safe, and return focus to
  the trigger.
- Destructive confirmation places initial focus on the least destructive action.
- Tables use semantic headers.
- Compact mobile rows preserve link and action semantics.
- Tabs expose selected state and support expected keyboard navigation.
- Hierarchy disclosure controls expose expanded state and level context.
- Status is never communicated by color alone.
- Touch targets are at least 44 by 44 CSS pixels.
- Loading announcements are polite and do not repeatedly interrupt assistive
  technology users.
- Reduced-motion preference is respected.

## 26. Responsive behavior

### 26.1 Desktop

- Full data table.
- Header actions aligned with the identity block.
- Dialog or side-sheet form.
- Tabs remain in one row when space permits.

### 26.2 Tablet

- Preserve Account, Type, Lifecycle, Owner, and Actions.
- Move lower-priority Parent, Contact preference, and Last updated content into
  row detail when width is constrained.
- Filters may wrap into two compact rows.
- Do not force horizontal scrolling for the entire application shell.

### 26.3 Mobile

- Render compact semantic rows rather than a compressed desktop table.
- Show display name, account number, lifecycle, type, owner, and actions first.
- Place filters in an accessible sheet with active-filter count.
- Open create and edit as full-screen forms.
- Keep form action bar visible at the bottom without covering fields.
- Allow tabs to scroll horizontally with visible selected state.
- Preserve direct links and browser navigation.

## 27. English-only copy and formatting

### 27.1 Runtime language

All runtime UI copy in this scope is English:

- Headings
- Labels
- Buttons
- Menus
- Tooltips
- Dialogs
- Validation messages
- Empty states
- Error states
- Address and relationship labels
- Date and amount accessible text

The preferred communication language field is customer metadata. It does not
change the application UI language.

### 27.2 Dates

- Use the application's English locale convention.
- Store and send API dates in the backend-defined ISO format.
- Do not convert date-only relationship or validity values through a timezone in
  a way that changes the calendar date.

### 27.3 Currency

- Format with the stored `currencyCode`.
- Do not hardcode currency in a card title or label.
- If international formatting cannot recognize a stored code, display the amount
  followed by the literal code.

### 27.4 Identifiers

- Account number is displayed as business identity, not hidden metadata.
- UUID fallback labels use a stable shortened form without exposing more data
  than needed.
- A fallback label must never masquerade as a resolved person or account name.

## 28. CRM status presentation

All Account Lifecycle and Account Type badges import their definitions from
`@/config/crmStatusConfig`.

Lifecycle classes remain exactly aligned with the repository standard:

| Lifecycle | Required classes |
|---|---|
| `PROSPECT` | `bg-purple-50 text-purple-700 border-purple-200 font-bold` |
| `QUALIFIED` | `bg-blue-50 text-blue-700 border-blue-200 font-bold` |
| `CUSTOMER` | `bg-emerald-50 text-emerald-700 border-emerald-200 font-bold` |
| `INACTIVE` | `bg-amber-50 text-amber-700 border-amber-200 font-semibold` |
| `CHURNED` | `bg-rose-50 text-rose-700 border-rose-200 font-semibold` |

Components consume rendered configuration or shared helpers. They do not copy
these class strings into feature-local maps.

Do Not Contact, address validation, channel verification, and relationship
history are separate semantic states and must not reuse lifecycle colors merely
for visual consistency.

## 29. Destructive workflows

### 29.1 Account delete dialog

The dialog contains:

- `Delete account`
- Display name
- Account number
- Explanation that the operation removes the account from active use
- Warning that active subsidiaries block deletion
- `Cancel`
- A clearly labeled destructive confirmation action

The confirmation does not use `window.confirm`.

### 29.2 Delete request

- Use the latest loaded version.
- Send `If-Match` exactly once.
- Keep the dialog open while a recoverable error is shown.
- On `ACCOUNT_HAS_ACTIVE_CHILDREN`, link or direct the user to hierarchy context.
- On conflict, use the shared conflict flow.
- On success, remove detail cache, invalidate affected directory and hierarchy
  queries, and navigate to the directory.

### 29.3 Child-resource destruction

- Address uses End, not Delete.
- Relationship uses End, not Delete.
- Communication channel uses versioned Delete.
- Note uses versioned Delete.

The UI language must match the temporal or destructive meaning of each operation.

## 30. Consolidation and target code state

The target feature has:

- One account list page composition
- One account detail page composition
- One account create/edit form model
- One exact Account API page contract
- One Account Notes surface
- One centralized status source
- Independent child-resource adapters and query state

The target feature does not retain:

- A duplicate inactive detail modal flow
- A duplicate inactive edit modal flow
- A second drifting account form schema
- Speculative `content` or `totalItems` page fields
- Client-derived account totals
- Client-derived hierarchy from a page subset
- Approval-request owner candidates
- Vietnam-specific address or phone defaults
- LocalStorage account notes
- `window.confirm` account deletion

Removal of existing files is contingent on confirming zero remaining consumers
through static dependency inspection during implementation.

## 31. Deferred production surfaces

### 31.1 Timeline

Timeline remains hidden until a separate design establishes:

- Exact account filtering
- Tenant and data-scope enforcement
- Structured language-neutral event data
- Explicit partial-failure metadata
- No conversion of backend failure to an empty timeline

### 31.2 Customer Health

Customer Health remains hidden until a separate design establishes:

- Scores derived only from real account data
- No fixed fallback score on query failure
- Exact account and data-scope validation
- Structured reason codes rather than generated localized prose
- Transparent unavailable and insufficient-data states

### 31.3 Duplicate Scan and Merge

Duplicate functionality remains hidden until a separate full-stack design
establishes:

- No fabricated duplicate groups or evidence
- Deterministic candidate rules
- Account and tenant data scope
- Complete dependent-table coverage
- Version checks for source and target
- Transactional failure behavior
- Audit records
- Safe conflict resolution
- No unconditional success response

### 31.4 Advanced Account 360

Contacts, leads, opportunities, orders, quotes, tickets, activities, analytics,
and enrichment may later compose an Account 360 experience. They are not added
to the core workspace until their contracts and scope rules are separately
approved.

## 32. Acceptance criteria

### 32.1 Directory accuracy

- List rows come only from `PageResult.items`.
- Total count comes only from `totalElements`.
- Page count comes only from `totalPages`.
- Search and every visible filter are sent to the server before pagination.
- Owner type and ID are paired.
- Invalid URL state is normalized.
- Back and forward navigation restore directory state.
- No client-side root pagination or hierarchy derivation remains.

### 32.2 Permissions

- Read-only users can view all permitted Account Core Workspace data.
- Read-only users cannot trigger write requests.
- Write users can access approved mutations.
- Backend permission and scope remain authoritative.
- Account Notes writes require corrected `crm_account.write` enforcement.

### 32.3 Account form

- Create requires account number and display name.
- Edit never sends account number.
- Revenue amount cannot be submitted without currency.
- Owner is not sourced from approval requests.
- Parent selector searches the server and excludes the current account.
- Version conflict does not overwrite newer data.
- Runtime form copy is English.

### 32.4 Hierarchy

- Hierarchy is hidden until its capability dependencies are met.
- Root loading and child loading are server-backed and paginated.
- Accounts at a data-scope boundary remain visible in a separately labeled group
  without exposing their inaccessible parent.
- Expanding one node does not load an unbounded tree.
- Self-parenting and descendant-parenting are rejected by backend guards.
- Account deletion is blocked while active children exist.
- No new `PARENT_CHILD` commercial relationship can be created.

### 32.5 Addresses

- Country code is explicit and never defaults to `VN`.
- Coordinate values are paired and range-valid.
- Update submits a full value with version.
- Primary behavior is per address type.
- End moves an address to history and is not labeled Delete.
- API failure is not displayed as an empty address list.

### 32.6 Communication channels

- Update always includes channel type and raw value.
- Primary and Do Not Use toggles submit a full versioned value.
- Local phone values are not silently converted to `+84`.
- Raw, normalized, verified, primary, and Do Not Use states are distinct.
- Delete never defaults a version.

### 32.7 Relationships

- Target selector searches all permitted accounts through server search.
- The current account cannot be selected as its own related account.
- New type choices exclude `PARENT_CHILD`.
- End sends only required `validTo` under the exact request contract.
- Active and historical records are distinguishable.
- Active and historical totals are derived from server-filtered queries, not a
  mixed client page.

### 32.8 Notes

- There is one server-backed Account Notes surface.
- No Account Notes data is stored in `localStorage`.
- List consumes a summary list rather than a speculative page result.
- Note detail is fetched before editing content absent from the summary.
- Create and update use title/body/visibility contracts.
- Delete requires the loaded version.
- Write controls remain gated until backend permission and scope are corrected.

### 32.9 UX quality

- Account Lifecycle and Account Type use `@/config/crmStatusConfig`.
- No feature-local lifecycle color map exists.
- No gradient or decorative KPI panel is required to understand the page.
- Every collection distinguishes loading, empty, error, and success.
- Every destructive flow uses an accessible dialog.
- Keyboard and mobile users can complete all permitted core workflows.
- All runtime UI copy in scope is English.
- Currency and country values are not fabricated.

### 32.10 Production exclusions

- Timeline is not visible.
- Customer Health is not visible.
- Duplicate Scan is not visible.
- Duplicate Merge is not visible.
- No fixed score, fake duplicate, or tenant-wide activity appears as account data.

## 33. Static review requirements for this design task

This specification is considered complete when static review confirms:

- No placeholder sections or unresolved requirement markers.
- No contradiction between approved scope and detailed behavior.
- Current and proposed API behavior are clearly distinguished.
- All required subresources have exact contract guidance.
- Permission, scope, concurrency, error, accessibility, responsive, and language
  behavior are covered.
- Deferred unsafe surfaces are explicitly excluded.
- No product source file was changed by the design task.
- No implementation plan was produced.

Repository rules prohibit running tests, builds, browsers, APIs, or manual
runtime verification for this task. Later implementation acceptance must follow
the repository rules in force at that time.

## 34. Resolved design decisions

The following decisions are final for this specification:

1. Use Account Core Workspace rather than Minimal Hardening or Full Account 360.
2. Use List as the default directory view.
3. Gate Hierarchy on dedicated backend support and integrity guards.
4. Use `parentAccountId` as the sole organizational hierarchy source.
5. Use five primary detail tabs.
6. Keep Tags and custom fields secondary in Overview.
7. Use one server-backed Notes surface.
8. Require exact server pagination and filtering.
9. Use optimistic concurrency without force overwrite.
10. Use safe owner sources only.
11. Use English-only runtime copy.
12. Use centralized CRM status presentation.
13. Hide Timeline, Customer Health, and Duplicate functionality from production.
14. Stop this work at the reviewed design specification without implementation
    planning or product-code changes.
