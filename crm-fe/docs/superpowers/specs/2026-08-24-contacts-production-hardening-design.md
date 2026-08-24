# Contacts Production Hardening: Design Specification

**Date:** 2026-08-24

**Scope:** `crm-fe`

**Route:** `/app/crm/contacts`

**Status:** All design sections approved in conversation; document pending final
user approval

**Direction:** Contract-first, frontend-only Contacts refactor

## 1. Relationship to existing requirements

This specification is the source of truth for the Contacts screen refactor. It
must be read together with:

- `docs/superpowers/specs/2026-08-21-system-wide-english-only-design.md`;
- the Contact Management section of repository-level
  `docs/api-reference.md`;
- route and permission configuration under `src/config` and
  `src/core/permissions`.

English is the only runtime system language. `preferredLanguageCode` remains
Contact business metadata and must not change the CRM interface language.

`ContactsPage.tsx` has an uncommitted user change that replaces two Vietnamese
tooltips with English text. Implementation must preserve that change and inspect
the scoped diff before extracting the page. It must not reset the file or
replace it from the Git version.

## 2. Current-state audit

The existing screen is a 668-line page that owns API access, filter state,
pagination, form state, table rendering, mutation behavior, dialog rendering,
and quick-call integration.

The current frontend contract does not match the backend Contact API:

- `ContactItem` exposes `email`, `phone`, `mobile`, `city`, `accountName`,
  `isPrimaryContact`, `status`, and `fullName`, although Contact summary/detail
  responses do not provide those fields;
- create/update accepts unsupported fields and silently drops them before the
  request;
- `normalizeContact` invents contact numbers, names, roles, departments,
  accounts, city, lifecycle, status, and timestamps;
- the collection displays invented communication channels and account names;
- Quick Call receives a phone value that the Contact API cannot return;
- department, status, and primary filters run only against the current server
  page while the UI retains unfiltered pagination totals;
- summary rows are used directly as edit aggregates even though summary omits
  fields needed for a complete update;
- delete omits the row version and falls back to version `1`;
- write actions are not consistently gated by `crm_contact.write`;
- list failure leaves the previous state without an explicit inline error and
  recovery surface;
- the create/edit dialog uses a visual treatment inconsistent with the
  restrained application shell and uses controls below the desired target size;
- `src/services/mock/mockContactsData.ts` has no consumer and contains a second,
  incompatible Contact model.

This refactor removes those contradictions rather than restyling them.

## 3. Chosen approach

The approved approach is frontend production hardening against the existing
Contact API.

### 3.1 Included now

- exact frontend API contract;
- server-backed search, filters, and pagination;
- URL-persisted collection and editor state;
- React Query list/detail/account lookups and mutations;
- view/create/edit sheet;
- safe account association and limited session-derived ownership choices;
- lifecycle, suppression, permission, concurrency, and error handling;
- desktop table and mobile collection;
- English-only content, responsive behavior, and accessibility;
- removal of unused mock Contact data.

### 3.2 Deferred Contact 360 project

The database has a generic communication-channel table, but the implemented
Contact API does not expose Contact-owned channels. A separate full-stack
project is required for:

- Contact email, phone, mobile, WhatsApp, LinkedIn, or other channels;
- primary and verified channel management;
- channel-level do-not-use behavior;
- Quick Call from a Contact channel;
- server-enriched account display names in Contact summaries;
- Contact 360 timeline, notes, tags, and activity workspace.

The frontend must not simulate those features until their APIs are implemented
and documented.

## 4. Goals

1. Ensure every displayed and submitted Contact field represents canonical API
   data.
2. Make search, filtering, pagination, detail, and mutation behavior safe for
   production data volumes and concurrent updates.
3. Separate route composition, URL state, data access, mapping, validation, and
   UI rendering into focused units.
4. Apply `crm_contact.read` and `crm_contact.write` consistently at route and
   action surfaces.
5. Preserve all valid Contact fields through create/edit round trips.
6. Provide explicit loading, empty, error, retry, pending, conflict, and
   permission states.
7. Deliver a restrained enterprise CRM layout that works on desktop and mobile
   without inventing dashboard metrics.

## 5. Non-goals

- No backend controller, DTO, service, repository, database, or migration
  changes.
- No change to `docs/api-reference.md`, because no API behavior changes.
- No new email, phone, mobile, address, city, or primary-contact field.
- No Quick Call action from the Contact collection.
- No aggregate KPI/count endpoint or client-side approximation.
- No bulk edit/delete, import/export, merge, or deduplication.
- No new Contact detail route.
- No contact-number auto-generation in the browser.
- No general refactor of Accounts, Leads, shared table primitives, or app shell.
- No new UI, form, query, state, icon, or styling dependency.
- No tests, build, dev server, browser, API, database, or manual runtime checks
  under the current repository rules.

## 6. Sources of truth and constraints

- Stack: React 18, TypeScript, Vite, Tailwind CSS 3, shadcn/Radix, React Query,
  React Hook Form, Zod, React Router, and Sonner.
- `GET /api/contacts` and `GET /api/contacts/{id}` require
  `crm_contact.read`.
- `POST`, `PUT`, and `DELETE /api/contacts` require `crm_contact.write`.
- The backend performs final authorization and Contact data-scope enforcement.
- Frontend permission gating uses the centralized evaluator or
  `PermissionGate`; it must not infer access from role names.
- Lifecycle badges must be imported from `@/config/crmStatusConfig`.
- English-only runtime requirements come from the system-wide English design.
- User-entered names, descriptions, and preferred-language values are displayed
  unchanged.
- Existing shared primitives are reused when they meet the design requirements.
  Contacts may use local composition when a shared component cannot express the
  required semantics without changing other screens.
- Existing uncommitted changes outside the Contacts scope are preserved.

## 7. Exact Contact API contract

`src/services/api/contactApi.ts` must model the backend response without
compatibility aliases or invented fields.

### 7.1 Shared enums and owner

```text
ContactLifecycleStage =
  PROSPECT | QUALIFIED | CUSTOMER | CHURNED | INACTIVE

PreferredContactChannel =
  EMAIL | PHONE | MOBILE | SMS | WHATSAPP | OTHER

ContactOwnerType = USER | TEAM
ContactOwner = { type: ContactOwnerType; id: string }
```

### 7.2 Summary response

`ContactSummaryResponse` contains exactly:

- `id`;
- `contactNumber`;
- nullable `accountId`;
- `displayName`;
- nullable `jobTitle`;
- nullable `department`;
- nullable `preferredContactChannel`;
- `lifecycleStage`;
- nullable `owner`;
- `doNotContact`;
- `updatedAt`;
- `version`.

It does not contain account name, communication-channel value, active status,
primary-contact state, city, or person-name parts.

### 7.3 Detail response

`ContactResponse` adds:

- nullable `honorific`, `givenName`, `middleName`, and `familyName`;
- nullable `preferredLanguageCode`;
- nullable `dateOfBirth`;
- nullable `description`;
- `createdAt`, nullable `createdBy`, `updatedAt`, nullable `updatedBy`, and
  `version`.

The detail response still does not contain email, phone, mobile, city,
accountName, isPrimaryContact, status, or fullName.

### 7.4 Page response

Search returns the exact backend `PageResult<ContactSummaryResponse>` shape:

```text
{
  items,
  page,
  size,
  totalElements,
  totalPages
}
```

The service must not accept `content`, `pageNumber`, `pageSize`, raw arrays, or
other fallback response shapes.

### 7.5 Search request

Only these query parameters are sent:

- `q`;
- `accountId`;
- `lifecycleStage`;
- `ownerType` and `ownerId` as a pair;
- zero-based `page`;
- `size` from 1 through 100.

There is no `status`, `department`, `primaryOnly`, email, phone, or city query.

### 7.6 Create and update

Create sends the backend fields only. `contactNumber` and `displayName` are
required. The UI defaults and explicitly submits `lifecycleStage: PROSPECT` and
`doNotContact: false`.

Update sends a complete detail replacement with required `version`,
`displayName`, `lifecycleStage`, and `doNotContact`, plus every other preserved
editable detail field. It never sends `contactNumber`, which is immutable after
creation.

Delete requires an explicit positive version and emits a strong quoted
`If-Match` header. The API function has no default version.

## 8. Information architecture

The route remains one collection page with an overlay sheet.

### 8.1 Page header

- Title: `Contacts`.
- Subtitle describes customer stakeholder and relationship records without
  claiming phone/email directory support.
- Count shows `totalElements` for the current server query.
- `New Contact` appears only with `crm_contact.write`.
- Refresh is secondary and reflects query fetching state.

No KPI card, active count, primary count, or other client-derived aggregate is
shown.

### 8.2 Toolbar

- Search placeholder: `Search name, contact number, job title, or department…`.
- Search is debounced by 300ms before changing the server query.
- Lifecycle filter: All, Prospect, Qualified, Customer, Churned, Inactive.
- Ownership filter: All Contacts, My Contacts, and My Team when a session team
  exists.
- Account filter uses an async Account picker.
- Reset clears all filters and returns to page 1.
- Active filters are represented in the URL and visible to the user.

### 8.3 Collection columns

Desktop columns are:

1. Contact: display name and contact number;
2. Account: linked state and abbreviated account ID with an `Open account`
   link;
3. Business role: job title and department;
4. Ownership: owner type and abbreviated owner ID or Unassigned;
5. Contact preference: preferred channel and DNC warning;
6. Lifecycle stage;
7. Updated time;
8. Actions.

The collection does not fetch one Account per row. Account display name is
resolved only for an opened Contact or selected account through a single
account-detail query.

## 9. Component architecture

```text
ContactsPage
├── ContactsHeader
├── ContactsToolbar
├── ContactsCollection
│   ├── ContactsTable
│   └── ContactMobileList
├── ContactEditorSheet
│   ├── ContactDetails
│   ├── ContactForm
│   └── ContactAccountPicker
└── ContactDeleteDialog
```

### 9.1 Responsibilities

- `ContactsPage`: route composition, permission-derived action availability,
  and URL/editor orchestration.
- `ContactsHeader`: title, filtered result count, refresh, and write-gated
  create action.
- `ContactsToolbar`: debounced search, supported server filters, and reset.
- `ContactsCollection`: selects desktop table or mobile list presentation and
  owns collection-level states.
- `ContactsTable`: semantic desktop table and row actions.
- `ContactMobileList`: stacked mobile records without horizontal page scroll.
- `ContactEditorSheet`: mode, detail hydration, dirty-state guard, submit
  orchestration, and focus return.
- `ContactDetails`: read-only canonical aggregate.
- `ContactForm`: React Hook Form fields and field-level validation.
- `ContactAccountPicker`: async Account search, selected-account hydration, and
  inaccessible-account fallback.
- `ContactDeleteDialog`: version-aware destructive confirmation and mutation.

Business rules do not move into `components/ui` primitives.

## 10. Feature model boundaries

### 10.1 `contactTypes.ts`

Contains view-only types:

- `ContactEditorMode = 'view' | 'create' | 'edit'`;
- `ContactOwnershipFilter = 'ALL' | 'MINE' | 'TEAM'`;
- `ContactFilterState`;
- `ContactFormValues`;
- display-only owner/account references;
- editor state and error recovery action types.

API request/response types remain in `contactApi.ts`.

### 10.2 `contactSchemas.ts`

Zod validation mirrors backend constraints:

- contact number: trim, required on create, maximum 191;
- display name: trim, required, maximum 255;
- honorific, given/middle/family name, job title, and department: maximum 255;
- preferred language: optional, maximum 10, pattern
  `^[A-Za-z]{2,3}(-[A-Za-z0-9]{2,8})*$`;
- preferred channel: exact enum;
- lifecycle: exact enum;
- date of birth: optional ISO date;
- version: positive for edit/delete;
- account/owner IDs: valid UUIDs when present.

Description remains free-form because the current backend DTO does not declare a
size limit. The frontend must not invent a restrictive limit.

### 10.3 `contactMappers.ts`

- maps detail to an immutable original snapshot and form draft;
- maps create draft to `CreateContactRequest`;
- maps edit draft and original immutable contact number to
  `UpdateContactRequest` without sending the contact number;
- normalizes blank optional strings to `null` or omission according to the
  request shape;
- preserves owner and other valid fields the user did not edit.

No mapper creates placeholder business data.

### 10.4 `contactErrors.ts`

Maps `ApiError.errorCode` and field errors to English titles, descriptions,
form fields, and recovery actions. It must not parse raw prose when a stable code
is available.

## 11. URL state

`contactSearchParams.ts` owns validated React Router search parameters:

| Parameter | Meaning |
|---|---|
| `q` | Debounced Contact search |
| `stage` | Lifecycle stage |
| `ownership` | `mine` or `team`; omitted means all |
| `account` | Account UUID |
| `page` | One-based UI page; omitted means 1 |
| `size` | 10, 20, 50, or 100; omitted means 20 |
| `contact` | Open Contact UUID |
| `mode` | `view`, `edit`, or `create` |

Rules:

- changing `q`, stage, ownership, account, or size resets page to 1;
- UI page is converted to the backend's zero-based page;
- `mode=view` or `mode=edit` requires a valid `contact` UUID;
- `mode=create` removes an unrelated `contact` parameter;
- invalid enum, page, size, or UUID values normalize to safe defaults;
- write-denied users cannot retain `mode=create` or `mode=edit`; the URL is
  normalized to closed or view mode;
- closing a sheet removes only `contact` and `mode`, preserving collection
  filters;
- an unsaved draft is not serialized into the URL.

## 12. Query and cache design

Query keys are tenant-scoped:

```text
['contacts', tenantId, normalizedServerFilters]
['contact', tenantId, contactId]
['contact-account', tenantId, accountId]
['contact-account-options', tenantId, search]
```

- Contact list query uses URL-derived filters and the exact page response.
- Detail query enables only for view/edit with a Contact ID.
- Selected Account detail query enables only when the Contact has an account.
- Account option search is debounced and limited to a normal API page.
- No list/detail query uses `.catch(() => [])` or fallback records.
- A stale response for a previous Contact ID cannot hydrate a new selection.
- First load uses structural skeletons; background refetch keeps successful data
  visible and marks the region busy.
- Create success invalidates Contact lists and seeds the created Contact detail.
- Update success invalidates lists and replaces the matching detail cache.
- Delete success invalidates lists and removes the deleted detail cache.
- Mutations are not optimistic.

The query function may pass React Query's `AbortSignal` to `apiFetch` through an
optional API-service request option so abandoned searches can be cancelled.

## 13. Collection behavior

### 13.1 Search and filters

- All filtering is performed by the backend.
- `MINE` maps to `ownerType=USER` and the current session user ID.
- `TEAM` maps to `ownerType=TEAM` and the assigned session team ID.
- My Team is hidden when no assigned team exists.
- Account filter sends the selected Account UUID.
- The UI never filters a returned page and keeps the original totals.

### 13.2 Account cell

Because summary does not contain an Account name:

- an unlinked Contact shows `No linked account`;
- a linked Contact shows an abbreviated UUID and `Open account` action;
- the action navigates to `/app/crm/accounts/{accountId}`;
- accessible text includes the Contact name and full target purpose;
- the table does not issue Account detail calls per row.

### 13.3 Row actions

- Read-only user: View and Open Account when linked.
- Write user: View, Edit, Delete, and Open Account when linked.
- Quick Call is absent.
- Icon actions have accessible names and pending/disabled states.
- Contact name is a semantic button that opens view mode; the entire table row
  is not an interactive element.

### 13.4 Pagination

- Default page size is 20.
- Available sizes are 10, 20, 50, and 100.
- Total pages may be zero for an empty result; UI controls render a stable empty
  state without fabricating a server page.
- After a mutation reduces the last page beyond the new total, URL state moves
  to the final valid page.

## 14. Detail and editor sheet

The sheet is approximately 680–720px on desktop and full-screen on mobile.

### 14.1 View mode

- Loads canonical detail before rendering the aggregate.
- Shows identity, Account association, role/department, ownership, contact
  preferences, lifecycle, DNC, description, and audit metadata.
- Resolves the linked Account name with one Account detail query.
- If Account detail is inaccessible or missing, Contact detail remains usable
  and shows `Linked account unavailable` with the Account ID.
- Edit appears only with `crm_contact.write`.

### 14.2 Create mode

- Starts with `PROSPECT`, `doNotContact: false`, no Account, and no owner.
- Requires contact number and display name.
- Allows optional person-name parts without deriving display name implicitly.
- Does not persist draft across reload.

### 14.3 Edit mode

- Opens only after detail success.
- Contact number is displayed read-only and omitted from update payload.
- Original detail is immutable while the draft changes.
- Background refetch does not overwrite a dirty draft.
- Update preserves the original owner/account and optional fields unless the
  user explicitly changes them.

## 15. Form sections and fields

### 15.1 Identity

- Contact Number: required create, read-only edit.
- Display Name: required.
- Honorific: optional free text; the UI may suggest Mr., Ms., Mrs., and Dr. but
  cannot restrict other valid values.
- Given Name, Middle Name, Family Name: optional.

### 15.2 Account and business role

- Account: async searchable Account selector, optional.
- Job Title: optional.
- Department: optional.

The selector stores Account ID, never a free-form account name.

### 15.3 Ownership

The existing frontend has no authoritative all-members/all-teams directory for
this workflow. The safe choices are:

- Unassigned;
- Me, using the active session user ID;
- My Team, using the active assigned team ID when present;
- Existing owner, when an edited Contact belongs to another user/team not in the
  safe choices.

An unavailable existing owner remains selected and preserved by default. The
user may explicitly reassign it to Unassigned, Me, or My Team. The UI never asks
the operator to type a raw owner UUID and does not misuse membership-request
data as a canonical directory.

### 15.4 Preferences and lifecycle

- Preferred Language Code: optional business metadata with a note that it does
  not change the CRM UI language.
- Preferred Contact Channel: optional enum indicating preference only; the UI
  does not claim an actual channel value exists.
- Lifecycle Stage: required.
- Date of Birth: optional date.
- Do Not Contact: required boolean.
- Description: optional free-form notes.

Enabling Do Not Contact displays a clear suppression warning before save.

## 16. Mutation behavior

### 16.1 Create

- Submit is disabled after the first request starts.
- Field validation errors focus the first invalid field.
- Success uses the canonical response, updates cache, closes the sheet, and
  announces `Contact created`.
- Failure keeps the draft open.

### 16.2 Update

- Sends the current detail version.
- Success replaces detail cache, invalidates collection queries, closes the
  editor, and announces `Contact updated`.
- Failure keeps the draft and original snapshot.
- No mutation success toast uses an exclamation mark.

### 16.3 Delete

- Uses an AlertDialog-style confirmation, not `window.confirm`.
- Shows display name and contact number.
- Sends the row/detail version through strong quoted `If-Match`.
- Keeps the row and dialog on failure.
- Removes the row only after `204 No Content`.
- After success, closes any matching detail/editor and invalidates the list.

## 17. Authorization

| Surface | Requirement |
|---|---|
| Route, collection, detail, filters | `crm_contact.read` |
| Create, edit, delete | `crm_contact.write` |

- Route access remains driven by the navigation manifest and centralized route
  boundary.
- Mutation actions use the centralized permission evaluator/gate.
- Tenant-admin bypass remains centralized.
- UI permission checks do not replace backend enforcement.
- A server `ACCESS_DENIED` response uses the existing 403 flow and does not
  trigger duplicate toasts.

## 18. Error mapping and recovery

Map at least these codes:

- `REQUEST_VALIDATION_FAILED`;
- `AUTHENTICATION_REQUIRED`;
- `ACCESS_DENIED`;
- `CONTACT_NOT_FOUND`;
- `CONTACT_ACCOUNT_INVALID`;
- `CONTACT_NUMBER_ALREADY_EXISTS`;
- `CONTACT_VERSION_CONFLICT`;
- `INTERNAL_ERROR`.

Recovery behavior:

- validation: map field details to React Hook Form and focus the first field;
- number exists: keep draft and focus Contact Number;
- account invalid: keep draft, focus Account picker, and refetch account
  options;
- version conflict: keep draft and offer `Reload latest` or Cancel; never
  overwrite automatically;
- not found: close stale detail/editor, remove stale cache, refetch collection;
- authentication required: use the session-expired flow;
- access denied: use the 403 flow;
- internal error: keep the current surface and expose Retry where safe.

Raw backend prose is not rendered directly when a stable code exists.

## 19. Unsaved changes

- Editor keeps an immutable original aggregate and React Hook Form dirty state.
- Closing the sheet, changing selected Contact, navigating away, or reloading
  while dirty requires confirmation.
- Discard restores the original detail for edit and the approved defaults for
  create.
- A background refetch cannot replace a dirty draft.
- Successful save clears the dirty guard before closing.

## 20. Loading, empty, and partial failure states

- Initial collection loading: table/mobile structural skeleton.
- Background refetch: existing successful data stays visible with a non-blocking
  fetching indicator.
- First-use empty: explain there are no Contacts and show write-gated Create.
- Filtered empty: show active filter context and Clear Filters.
- Collection error: inline English error, Retry, and no fake empty data.
- Detail loading: sheet skeleton.
- Detail error: sheet error with Retry or Close.
- Account-name lookup error: Contact detail remains available and exposes an
  Account-specific fallback.
- Account option search error: picker shows retry and preserves the selected
  Account ID.
- Mutation pending: corresponding controls are disabled against duplicate
  submission.

## 21. Visual system and responsive behavior

- Restrained light enterprise CRM: slate canvas, white surfaces, one blue
  interaction accent.
- No gradient header, glassmorphism, neon, oversized dashboard cards, or heavy
  shadow.
- Page title and labels use sentence case.
- Table text is approximately 14px; secondary metadata remains readable.
- Contact number, UUID fragments, and counts use mono or tabular numerals.
- Lifecycle stage uses the repository-standard badge mapping.
- DNC uses a risk treatment distinct from lifecycle.
- Desktop controls target approximately 40px; mobile controls target at least
  44px.
- Transitions are 150–200ms on named properties; no `transition-all`.
- Desktop uses a full table and 680–720px sheet.
- Tablet reduces secondary columns without hiding information from detail.
- Mobile uses stacked records, full-screen sheet, safe-area padding, contained
  overscroll, and persistent access to Save/Cancel.
- The page does not require horizontal scrolling at the viewport level.

## 22. Accessibility

- Semantic `<table>` is used for desktop tabular data.
- Buttons, links, inputs, labels, checkboxes, and dialogs use native/Radix
  semantics; no clickable `div`, `span`, or Badge.
- Every icon-only action has `aria-label`; decorative icons are hidden from the
  accessibility tree.
- Search clear, pagination icon buttons, refresh, and row actions have explicit
  accessible names.
- Focus-visible styles remain clear.
- Sheet/dialog traps focus and returns it to the trigger.
- Failed submit focuses the first invalid field.
- Loading, validation, mutation, and success results use appropriate live
  regions.
- Sticky sheet controls do not cover focused fields.
- Motion respects `prefers-reduced-motion`.
- Browser zoom is not disabled.

## 23. English-only content handling

- All Contacts system copy uses semantic keys in the canonical English
  translation resource.
- No Vietnamese translation resource, bilingual label, or hardcoded Vietnamese
  recovery message is added.
- User-entered Contact names, descriptions, honorifics, and preferred-language
  codes render unchanged.
- Search copy does not claim unsupported email or phone matching.
- Dates use the repository's English formatter.
- Loading labels use the ellipsis character `…`.
- Success copy is short and does not use exclamation marks.

## 24. File boundaries

```text
src/features/crm/contacts/
├── ContactsPage.tsx
├── contactSearchParams.ts
├── components/
│   ├── ContactsHeader.tsx
│   ├── ContactsToolbar.tsx
│   ├── ContactsCollection.tsx
│   ├── ContactsTable.tsx
│   ├── ContactMobileList.tsx
│   ├── ContactEditorSheet.tsx
│   ├── ContactDetails.tsx
│   ├── ContactForm.tsx
│   ├── ContactAccountPicker.tsx
│   └── ContactDeleteDialog.tsx
├── hooks/
│   └── contactQueries.ts
└── model/
    ├── contactTypes.ts
    ├── contactSchemas.ts
    ├── contactMappers.ts
    └── contactErrors.ts
```

Additional scoped changes:

- refactor `src/services/api/contactApi.ts` to the exact contract;
- add Contacts keys to `src/i18n/locales/en/translation.json`;
- delete `src/services/mock/mockContactsData.ts` only after a fresh no-consumer
  search confirms it remains unused.

No backend file, API reference, route, navigation item, shared status config, or
package dependency changes in this project.

## 25. Acceptance criteria

### 25.1 Contract correctness

- No `ContactItem`, `normalizeContact`, `any` response parsing, or alternate page
  shape remains in Contact API code.
- Unsupported email, phone, mobile, city, accountName, isPrimaryContact, status,
  and fullName fields are absent from the Contact feature.
- Search sends only documented query parameters.
- Edit loads detail before creating the form draft.
- Create/update payloads match controller DTOs.
- Update preserves unchanged owner/account/optional fields.
- Delete has no default version and uses quoted `If-Match`.
- No current-page client filtering alters server results or totals.

### 25.2 Workflow and governance

- URL state round-trips search, supported filters, pagination, and sheet mode.
- `crm_contact.write` gates every mutation action.
- Contact lifecycle badges import the canonical CRM status config.
- Account picker stores Account ID and never a free-form name.
- External existing owner is preserved unless explicitly reassigned.
- DNC state and preferred-channel semantics are clear.
- Error codes produce deterministic recovery behavior.
- Dirty drafts and version conflicts cannot be silently overwritten.

### 25.3 UX and accessibility

- Loading, first-use empty, filtered empty, error, retry, pending, and success
  states are distinct.
- Desktop, tablet, and mobile layouts are defined.
- No viewport-level horizontal overflow is introduced.
- No clickable non-semantic container or title-only icon action remains.
- Focus, labels, live regions, sheet/dialog behavior, and reduced motion are
  handled.
- All system copy is English-only.

### 25.4 Source quality

- `ContactsPage.tsx` is route-level composition rather than a monolith.
- API, query, URL, mapper, schema, error, and presentation responsibilities are
  separated.
- No new dependency is added.
- The unused mock Contact module is removed only when static search confirms no
  consumer.
- Existing uncommitted user changes are preserved.
- Backend and `docs/api-reference.md` are unchanged.

## 26. Verification under repository rules

Only static verification is performed:

- inspect the scoped diff and `git diff --check`;
- compare `contactApi.ts` types and request builders line-by-line with the
  Contact controller, request/response DTOs, `PageResult`, and API reference;
- search for `ContactItem`, `normalizeContact`, `any`, unsupported fields,
  fallback response shapes, client-side page filtering, and default delete
  version;
- compare query parameters with `ContactSearchRequest`;
- inspect create/update round-trip mapping for every supported field;
- inspect `crm_contact.read` and `.write` gating across route, header, collection,
  sheet, and dialog;
- inspect all lifecycle badges for the canonical status-config import;
- inspect URL parsing/serialization and one-based/zero-based page conversion;
- inspect semantic controls, accessible names, focus states, touch targets,
  responsive classes, and absence of `transition-all`;
- compare all Contacts translation keys with the canonical English resource and
  scan the feature for Vietnamese system copy;
- confirm the mock Contact module has no consumer before deletion;
- confirm no package dependency, backend file, or API-reference change entered
  the scoped diff.

Do not run unit, integration, E2E, smoke, browser/manual runtime, API, database,
dev-server, build, or deployment commands. Do not stage or commit. Runtime and
visual verification is handed off as a checklist unless the user later gives an
explicit instruction overriding the repository rule.

## 27. High-level implementation sequence

1. Capture the current Contacts diff and lock the exact API types.
2. Remove compatibility normalization and unsupported fields from the service.
3. Add feature types, schemas, mappers, error mapping, and URL state.
4. Add tenant-scoped list/detail/account queries and safe mutations.
5. Build header, supported toolbar, desktop table, and mobile collection.
6. Build view/create/edit sheet, Account picker, ownership behavior, and dirty
   guard.
7. Build version-aware delete and deterministic error recovery.
8. Apply permissions, canonical lifecycle badges, English copy, responsive
   behavior, and accessibility.
9. Remove the unused mock module after final consumer search.
10. Perform static verification and deliver the runtime checklist.

The detailed file-by-file implementation plan is written only after this design
specification receives final user approval.
