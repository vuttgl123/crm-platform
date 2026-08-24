# Activity Operations Workspace Production Design Specification

**Date:** 2026-08-24

**Status:** Design approved in conversation

**Product surface:** `crm-fe` Activities directory, agenda, activity detail,
related records, participants, and activity-scoped notes

**Runtime language:** English only

**Implementation status:** Design only. This document does not claim that any
proposed backend or frontend change is implemented.

## 1. Relationship to existing requirements

This specification defines the production target for the existing route:

- `/app/crm/activities`

It adds the following detail route to the product design:

- `/app/crm/activities/:activityId`

The approved target is an **Activity Operations Workspace** with:

- A trustworthy server-backed List view.
- A server-backed Agenda view.
- URL-backed queues, filters, date context, sorting, and pagination.
- A dedicated Activity detail route.
- Explicit lifecycle transitions.
- Real Account, Contact, Lead, and Opportunity links.
- Real internal-user, Contact, and external-email participants.
- Activity-scoped Notes after target-aware authorization is corrected.
- Exact permission, data-scope, timezone, and concurrency behavior.

This is a design specification, not an implementation plan. It intentionally
does not assign tasks, prescribe a commit sequence, or change product code.

Repository rules continue to apply:

- No Git commit, staging, push, or pull request is part of this work.
- No test, build, browser, API, or manual runtime command is part of this work.
- Any later API addition, modification, or removal must update the repository
  root `docs/api-reference.md` in the same implementation task.
- Existing user-owned changes in the worktree must be preserved.
- All runtime UI copy must be English.
- All Activity status, priority, and type presentation must be centralized in
  `@/config/crmStatusConfig`.

## 2. Executive decision

Activities becomes an operational work-management surface rather than a
decorative CRUD table that normalizes missing backend data in the client.

The approved production surface consists of:

1. A default Agenda view for the current actor's actionable work.
2. A List view for search, filtering, sorting, and administration.
3. Reliable work queues for My work, Overdue, Today, Upcoming, Completed, and
   All activities.
4. A detail route with Overview, Related records, Participants, and Notes.
5. A contextual create/edit sheet backed by canonical IDs and enums.
6. Explicit Start, Complete, Defer, Resume, Cancel, and Reopen transitions.
7. Schedule editing that is separate from status transitions.
8. Atomic initial creation of Activity core data, links, and participants.
9. Version-aware mutation and immutable status history.
10. Target-aware reference authorization and Activity-specific data scope.
11. Explicit loading, refreshing, empty, error, forbidden, not-found,
    validation, and version-conflict states.

The following surfaces are excluded from this release:

- Month and week calendar grids.
- Recurrence execution.
- Reminder scheduling and notification delivery.
- Invitation or email delivery to participants.
- Google Calendar and Microsoft Calendar synchronization.
- Availability lookup and scheduling-conflict detection.
- Bulk update, import, and export.
- Generic engagement timeline rendering.
- Activity outcome catalogue administration.
- Ticket links until Ticket target integrity and authorization are defined.

The decision favors a reliable operations workspace over a broad scheduling
suite whose backend execution model does not yet exist.

## 3. Current-state audit

### 3.1 Active frontend entry points

The active frontend surface consists of:

- `src/features/crm/activities/ActivitiesPage.tsx`
- `src/services/api/activityApi.ts`
- `src/features/crm/timeline/ActivityTimelineWidget.tsx`
- `src/services/mock/mockActivitiesData.ts`
- The `/app/crm/activities` route in `src/routes/AppRoutes.tsx`
- The Activities item in `src/config/navigationConfig.ts`
- Shared badge behavior in `src/config/crmStatusConfig.tsx`

There is no active Activity detail route.

### 3.2 Structural debt in the page

`ActivitiesPage.tsx` currently combines:

- Query state.
- Data fetching.
- Search and filter behavior.
- Pagination.
- Create and edit form state.
- Mutation orchestration.
- Status transition behavior.
- Delete confirmation.
- KPI calculation.
- Table rendering.
- Dialog rendering.
- Local status colors.
- Toast copy.
- Loading and empty behavior.

The page is more than 600 lines and has no stable separation between domain
contract, query coordination, form behavior, and presentation.

### 3.3 Frontend enum drift

The active frontend types include values that the backend and database reject:

- Frontend `PENDING` is not an Activity status.
- Frontend `MEDIUM` is not an Activity priority.

The implemented backend values are:

- Status: `PLANNED`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`, `DEFERRED`.
- Priority: `LOW`, `NORMAL`, `HIGH`, `URGENT`.

The create form defaults to `PENDING` and `MEDIUM`. The update adapter can send
`PENDING` directly to the backend. These are production contract failures, not
presentation aliases.

### 3.4 Adapter fabrication and lossy serialization

`activityApi.ts` currently:

- Uses `any` at the response boundary.
- Accepts arrays, `items`, and speculative `content` response shapes.
- Accepts frontend aliases such as `type`, `search`, `dueDate`, `dueTime`,
  `accountName`, `contactName`, and `assignedTo`.
- Fabricates Vietnamese subject, Account, Contact, and assignee labels.
- Fabricates schedule, created time, status, priority, and version values.
- Defaults missing status to `PENDING`.
- Defaults missing priority to `MEDIUM`.
- Defaults missing version to `1`.
- Converts a local date and time to a string ending in `Z`, treating local wall
  time as UTC.
- Omits declared owner, team, `from`, and `to` search filters.
- Omits valid create/update fields while presenting them as supported types.
- Merges the client request over the server response after mutations.
- Sends a fabricated `SUCCESS` outcome during every completion.

These behaviors can make missing or rejected data look persisted. The target
adapter must fail visibly when the server contract is invalid.

### 3.5 Directory correctness issues

The current workspace:

- Stores view, filters, and page only in component state.
- Calls fetch immediately after asynchronous filter resets with stale closure
  values.
- Computes Call, Meeting, and Pending totals from the current page only.
- Displays those current-page counts as workspace KPIs.
- Offers a `PENDING` queue that cannot be queried successfully.
- Omits Message, Demo, Follow-up, and Other from filter and form choices.
- Omits Normal and Urgent priorities.
- Omits Planned, In progress, and Deferred statuses.
- Displays free-text Account and Contact values that are not persisted.
- Displays a free-text assignee that is not persisted as Activity owner.
- Shows create, edit, complete, and delete actions without consistent
  `crm_activity.write` gating.
- Uses a blocking table spinner instead of shape-matched loading.
- Reports load failures only through a transient toast.
- Uses `window.confirm` for deletion.
- Falls back to a locally defined invalid status style.

### 3.6 Fabricated timeline risk

`ActivityTimelineWidget.tsx` inserts realistic-looking meetings, notes,
quotes, and calls when the timeline response is empty. Those records include
invented people, amounts, IDs, and descriptions.

The widget also:

- Swallows load failure into a toast.
- Uses hardcoded `en-US` date formatting.
- Defines local category colors.
- Presents fallback content as historical truth.

The target Activity workspace does not render this widget. Empty and failed
timeline data must never be replaced by fabricated business events.

### 3.7 Current implemented backend contract

The implemented controller is rooted at `/api/activities` and supports:

| Method | Path | Current behavior |
|---|---|---|
| `POST` | `/api/activities` | Create and return `201` |
| `GET` | `/api/activities/{id}` | Get Activity detail |
| `GET` | `/api/activities` | Search with `PageResult` |
| `PUT` | `/api/activities/{id}` | Full update with body version |
| `POST` | `/api/activities/{id}/complete` | Complete with `If-Match` |
| `DELETE` | `/api/activities/{id}` | Soft delete with `If-Match` |

The current search contract accepts:

- `q`
- `activityType`
- `status`
- `priority`
- `ownerUserId`
- `assignedTeamId`
- `from`
- `to`
- `page`
- `size`, with a maximum of 100

Search is fixed to `updated_at DESC, id DESC`. The response summary contains
only Activity core fields and raw owner IDs. It does not include display owner,
related records, participants, available actions, or queue metadata.

### 3.8 Current backend integrity gaps

The implemented backend has the following release-blocking issues:

- `AccountScopeSql` is constructed for Activity reads but its predicate is not
  added to either detail or search SQL.
- The Account scope helper expects `owner_team_id`, while Activity uses
  `assigned_team_id`.
- Activity reads and mutations can therefore ignore authorized data scope.
- Owner validation checks existence but not assignment scope.
- `ActivityOwner.of` permits both user and team IDs.
- The database permits both owner columns to be null or both to be non-null.
- General update accepts arbitrary status changes.
- General update can produce `COMPLETED` with `completedAt = null`.
- A previously completed Activity can leave `completedAt` populated while
  status changes through an unsafe update path.
- Complete can be invoked from any status and can overwrite completion time.
- Persistence uses `INSERT ... ON DUPLICATE KEY UPDATE` without an atomic
  `WHERE version = expectedVersion` condition.
- Delete checks version in memory and then updates without a version
  predicate.
- Outcome codes are unvalidated arbitrary strings.
- `recurrenceRule` is stored but no recurrence engine consumes it.
- Schedule duration and explicit `durationSeconds` have no defined
  consistency rule.

### 3.9 Dormant schema capabilities

The database already contains:

- `crm_activity_participants`
- `crm_activity_links`
- Activity-targeted rows in `crm_notes`

Participants support exactly one principal among:

- Tenant user.
- CRM Contact.
- External email.

Participant roles already include:

- `ORGANIZER`
- `ATTENDEE`
- `REQUIRED`
- `OPTIONAL`
- `CC`
- `BCC`

Activity links support exactly one target among Account, Contact, Lead,
Opportunity, and Ticket columns. The approved release activates only Account,
Contact, Lead, and Opportunity because Ticket linkage lacks a complete target
contract in the current Activity module.

No implemented Activity API currently manages links or participants.

### 3.10 Related-resource authorization risks

The generic Notes service currently requires `crm_account.read` for create,
read, update, and delete regardless of target type. It does not provide an
Activity-specific authorization path.

The generic Timeline service also requires Account read and contains queries
that can retrieve tenant-wide Activities without joining
`crm_activity_links`. It swallows SQL exceptions and can return incomplete
results without explanation.

Activity Notes are a release gate: they appear only after target-aware
permission, target scope, visibility, ownership, and concurrency behavior are
correct.

## 4. Goals

The design must:

- Make Agenda useful as a daily operational work surface.
- Keep List useful for broad search and administration.
- Preserve view and query context in the URL.
- Use exact backend enums and canonical IDs.
- Eliminate fabricated data and speculative response normalization.
- Activate existing Activity links and participants safely.
- Enforce one clear owner.
- Enforce explicit lifecycle transitions.
- Keep status history immutable and auditable.
- Apply permission and data scope to every read and mutation.
- Convert timezone-aware wall time to an Instant exactly once.
- Prevent lost updates through atomic version checks.
- Provide predictable loading, empty, error, and conflict states.
- Remain responsive and keyboard accessible.
- Preserve the existing React, TypeScript, Vite, Tailwind, shadcn/Radix, and
  project service stack without adding a library.

## 5. Non-goals

This design does not include:

- A general-purpose calendar product.
- Resource or room booking.
- Recurring-instance generation.
- Background reminder jobs.
- Email, SMS, or push notification delivery.
- Participant invitation acceptance workflows.
- External calendar OAuth or synchronization.
- Free/busy lookup.
- Automatic Activity creation from workflow automation.
- Type-specific outcome catalogue management.
- Rich-text descriptions.
- Attachments.
- Bulk mutations.
- Activity import or export.
- Ticket linkage.
- Activity tags before generic target authorization is corrected.
- A replacement for the CRM-wide timeline subsystem.

The dormant `recurrenceRule`, `externalReference`, `durationSeconds`, and
`outcomeCode` fields remain readable for compatibility but are not normal
editor fields in this release.

## 6. Design posture

The workspace follows these principles:

- Operational information precedes decorative metrics.
- Server projections are the source of business truth.
- A missing field remains missing; the client never invents a plausible value.
- A status change is a command, not an editable select field.
- Related records and participants are canonical references, not labels typed
  into an Activity form.
- Schedule and lifecycle are related but distinct concepts.
- Child collection edits are explicit; a general Activity update never
  replaces links or participants wholesale.
- A read-only user receives a complete read experience without dead mutation
  controls.
- A failed subresource does not erase a successfully loaded Activity header.
- Empty, restricted, and failed data are never represented by the same UI.

## 7. Sources of truth and invariants

### 7.1 Data sources

Production Activity data comes only from documented backend responses.

The following are prohibited:

- Mock Activities in runtime paths.
- Fallback Activities or timeline events.
- Fabricated display names.
- Default version `1` for an existing record.
- Client-generated IDs.
- Client-generated created or updated timestamps.
- Merging submitted request aliases over mutation responses.
- Treating a bare array as the canonical paged response.

### 7.2 Canonical enumerations

The canonical Activity enumerations are:

```ts
type ActivityType =
  | 'CALL'
  | 'EMAIL'
  | 'MEETING'
  | 'TASK'
  | 'MESSAGE'
  | 'DEMO'
  | 'FOLLOW_UP'
  | 'OTHER';

type ActivityStatus =
  | 'PLANNED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'DEFERRED';

type ActivityPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';

type ActivityDirection = 'INBOUND' | 'OUTBOUND' | 'INTERNAL';
```

`PENDING` and `MEDIUM` are removed from Activity types, filters, forms,
normalizers, queue definitions, badges, and runtime copy.

### 7.3 Activity identity

- `id` is the canonical UUID and is never fabricated.
- `subject` is the human-readable identifier in the current schema.
- The UI does not invent an Activity number.
- A missing Activity outside scope returns the same not-found contract as an
  unknown Activity.

### 7.4 Ownership

An active Activity has exactly one owner:

- `ownerUserId`, or
- `assignedTeamId`.

Both populated and both null are invalid target states.

Create defaults to the current actor only when the request omits owner. The
server writes the resolved owner into the response. An update must send one
explicit owner and may not silently unassign the Activity.

### 7.5 Schedule and timezone

- API timestamps are ISO-8601 Instants.
- The form edits local date and time in one explicitly displayed IANA
  timezone.
- Frontend timezone resolution uses `session.user.timezone`, then
  `session.tenant.default_timezone`, then `UTC`.
- Backend queue resolution uses the same persisted user preference, tenant
  preference, then `UTC` order.
- The browser's implicit local zone is not a source of truth.
- Conversion to UTC happens once at the frontend API boundary.
- Rendering converts the Instant through `Intl.DateTimeFormat` in the resolved
  display zone.
- `scheduledEndAt` cannot be before `scheduledStartAt`.
- Agenda day boundaries are computed by the server in the resolved timezone.
- Ambiguous and nonexistent daylight-saving wall times produce a field-level
  validation message instead of silent adjustment.

### 7.6 Status and completion

Status changes only through the transition endpoint.

The invariant is bidirectional:

- `status = COMPLETED` requires `completedAt != null`.
- `status != COMPLETED` requires `completedAt = null`.

General edit cannot send `status`, `completedAt`, or `outcomeCode`.

### 7.7 Compatibility and integration fields

- Existing `externalReference` values remain readable and preserved.
- Existing `recurrenceRule` values remain opaque compatibility data until
  recurrence execution is designed.
- `outcomeCode` remains optional, is never defaulted, and is writable only by
  Complete in this release.
- Existing `durationSeconds` remains readable and preserved until its meaning
  is separated into scheduled duration versus actual duration.

Create and general update do not accept these compatibility fields. General
update preserves stored values rather than clearing them. A future integration
write contract is a separate design.

### 7.8 Concurrency

- Every mutable Activity has a positive `version`.
- Core update, transition, link mutation, participant mutation, and delete
  require `If-Match` with the current Activity version.
- A successful Activity-affecting mutation increments version exactly once.
- Persistence performs one conditional update with the expected version.
- Zero affected rows maps to `ACTIVITY_VERSION_CONFLICT`.
- No repository upsert is used for an existing Activity update.

Notes keep their independent Note version and do not increment Activity
version.

### 7.9 English-only runtime

- Labels, tooltips, status names, validation, errors, confirmations, empty
  states, and success copy are English.
- Backend codes remain code tokens and are not translated.
- API payload values are canonical codes, not localized labels.
- No Vietnamese fallback string remains in the Activity adapter, page, form,
  detail, or timeline integration.

## 8. Information architecture and routes

### 8.1 Workspace route

`/app/crm/activities` hosts:

- Shared page header.
- Work-queue navigation.
- Shared search and filters.
- Agenda/List switcher.
- Agenda or List content.
- Pagination.
- Create Activity sheet.
- Contextual transition dialogs.

The default view is Agenda with the My work queue.

### 8.2 Detail route

`/app/crm/activities/:activityId` hosts:

- Back navigation preserving workspace query context.
- Activity header and schedule summary.
- Permission- and status-aware action bar.
- Overview tab.
- Related records tab.
- Participants tab.
- Notes tab.
- Edit sheet and transition dialogs.

### 8.3 Navigation contract

The Activities manifest item must:

- Require `crm_activity.read`.
- Match both workspace and detail routes.
- Appear in sidebar and command palette only when authorized.
- Remain active while a detail route is open.

The current any-CRM-read gate is removed.

## 9. URL state contract

### 9.1 Supported parameters

The workspace URL supports:

| Parameter | Values | Meaning |
|---|---|---|
| `view` | `agenda`, `list` | Active presentation |
| `queue` | `my-work`, `overdue`, `today`, `upcoming`, `completed`, `all` | Server queue preset |
| `q` | Trimmed text | Subject, description, and outcome search |
| `activityType` | One canonical type | Type filter |
| `status` | One canonical status | Status filter |
| `priority` | One canonical priority | Priority filter |
| `ownerUserId` | UUID | Direct owner filter |
| `assignedTeamId` | UUID | Team-owner filter |
| `relatedType` | `ACCOUNT`, `CONTACT`, `LEAD`, `OPPORTUNITY` | Related target type |
| `relatedId` | UUID | Related target ID |
| `from` | ISO Instant | Custom schedule lower bound |
| `to` | ISO Instant | Custom schedule upper bound |
| `page` | Non-negative integer | Zero-based result page |
| `size` | `10`, `20`, `50`, `100` | Page size |
| `sort` | Whitelisted field and direction | Server order |

### 9.2 Defaults

Defaults are:

- `view=agenda`
- `queue=my-work`
- `page=0`
- `size=20`
- Agenda sort: `scheduledStartAt:asc`
- List sort: `updatedAt:desc`

Default values may be omitted from the URL. Parsing always resolves to these
same values.

### 9.3 Normalization

- Invalid enum, UUID, page, size, sort, or timestamp values are removed with
  `replace`, not added to browser history.
- Changing queue, search, filter, date range, or sort resets page to zero.
- `ownerUserId` and `assignedTeamId` are mutually exclusive.
- `relatedType` and `relatedId` are either both present or both absent.
- `from` must not be after `to`.
- Clearing filters preserves `view` and resets to the selected queue defaults.
- Back/forward navigation reconstructs visible state from the URL.
- Search input is debounced before URL replacement.

### 9.4 Detail back context

Row and agenda links preserve the workspace query as navigation state or a
validated `returnTo` value restricted to `/app/crm/activities`.

Back from detail returns to the exact prior view, queue, filters, page, and
scroll context stored in same-origin history state. If scroll state is absent,
focus moves to the workspace heading. It never accepts an arbitrary external
URL.

## 10. Work-queue semantics

### 10.1 Shared rules

Queue calculations:

- Apply permission and Activity data scope first.
- Use the server-resolved IANA timezone.
- Exclude soft-deleted rows.
- Respect explicit search, type, priority, owner, team, related-record, and
  custom date filters.
- Ignore explicit status, `page`, `size`, `sort`, and the currently selected
  queue when calculating all queue counts. Each queue supplies its own status
  predicate.
- An explicit custom date range excludes unscheduled Activities from all
  range-filtered results.

### 10.2 Queue definitions

| Queue | Server definition |
|---|---|
| `MY_WORK` | Non-terminal Activity owned by the actor or an active team containing the actor; includes overdue, next 7 days, and unscheduled |
| `OVERDUE` | `PLANNED` or `IN_PROGRESS` with schedule before local start of today |
| `TODAY` | `PLANNED` or `IN_PROGRESS` scheduled inside the local calendar day |
| `UPCOMING` | `PLANNED` or `IN_PROGRESS` after today through the end of the seventh following local day |
| `COMPLETED` | `COMPLETED`; explicit `from` and `to` filter `completedAt` |
| `ALL` | No queue status/time preset |

Cancelled Activities are available through All plus `status=CANCELLED`; they
do not appear in operational queues.

### 10.3 Unscheduled Activities

Unscheduled non-terminal Activities:

- Appear in My work when ownership matches.
- Appear in All.
- Do not appear in Overdue, Today, or Upcoming.
- Render in an `Unscheduled` Agenda group after dated groups.

## 11. Authorization and data scope

### 11.1 Permission matrix

| Capability | Required permission |
|---|---|
| Open workspace or detail | `crm_activity.read` |
| Search and queue summary | `crm_activity.read` |
| Create or edit core Activity | `crm_activity.write` |
| Transition or reschedule | `crm_activity.write` |
| Add or remove a link | `crm_activity.write` plus target read/scope |
| Add or remove a participant | `crm_activity.write` plus Contact scope when applicable |
| Read Activity Notes | `crm_activity.read` plus Note visibility |
| Create Activity Note | `crm_activity.write` |
| Edit/delete Activity Note | `crm_activity.write` plus Note owner policy |
| Delete Activity | `crm_activity.write` plus eligibility |

Frontend gating is presentation only. Every endpoint enforces the permission
again.

### 11.2 Dedicated Activity scope resolver

Activity persistence uses a dedicated `ActivityScopeSql`. It must not reuse
the Account helper with incompatible column names.

Scope semantics are:

- `OWN`: `owner_user_id = current actor`.
- `TEAM`: `assigned_team_id` is an authorized direct team, or
  `owner_user_id` belongs to an active membership in an authorized direct
  team.
- `TEAM_TREE`: the same rule across authorized root teams and active
  descendants.
- `TENANT`: any non-deleted Activity in the tenant.

The predicate applies to detail, search, queue counts, updates, transitions,
links, participants, and delete.

### 11.3 Ownership assignment scope

Existence is not sufficient authorization.

- OWN-only actors may assign only themselves.
- TEAM actors may assign an authorized direct team or an active user in that
  team.
- TEAM_TREE actors may assign within the authorized team tree.
- TENANT actors may assign any active tenant user or active tenant team.

Inactive users, inactive teams, cross-tenant IDs, and out-of-scope assignees
return `ACTIVITY_OWNER_INVALID` without exposing private metadata.

### 11.4 Related-record scope

Creating a link requires the corresponding entity read permission and data
scope:

- Account: `crm_account.read`
- Contact: `crm_contact.read`
- Lead: `crm_lead.read`
- Opportunity: `crm_opportunity.read`

An Activity response does not expose the display name of a related record the
actor cannot independently read. A historical inaccessible link is returned
as `accessible=false` with `displayName="Restricted record"` and without
`targetId`, `displayCode`, or `href`. The target type remains available for
grouping. The API never leaks the underlying ID through a navigable link.

### 11.5 Participant scope

- Internal users must be active tenant members and assignable within Activity
  write scope.
- Contacts require `crm_contact.read` and Contact data scope.
- External email participants are tenant-local Activity data and require
  Activity write permission.
- Participant reads do not grant access to a Contact that is otherwise outside
  Contact scope.

### 11.6 Note target authorization

The generic Notes service resolves target type before authorization.

For `activityId` targets it must:

- Require `crm_activity.read` for get and list.
- Require `crm_activity.write` for create, update, and delete.
- Resolve Activity data scope before returning or mutating a Note.
- Enforce PRIVATE, TEAM, and TENANT visibility.
- Enforce Note-owner mutation rules.
- Reject requests with zero or multiple target IDs.

Account permission is not an Activity Note substitute.

## 12. Target frontend domain model

### 12.1 Owner reference

```ts
interface ActivityOwnerRef {
  kind: 'USER' | 'TEAM';
  id: string;
  displayName: string;
  secondaryLabel?: string | null;
}
```

The response does not expose a shape where both user and team are populated.

### 12.2 Related record

```ts
type ActivityRelatedType = 'ACCOUNT' | 'CONTACT' | 'LEAD' | 'OPPORTUNITY';

interface ActivityLink {
  id: string;
  targetType: ActivityRelatedType;
  targetId?: string;
  displayName: string;
  displayCode?: string | null;
  relationRole: 'REGARDING';
  accessible: boolean;
  href?: string | null;
  createdAt: string;
}
```

`targetId`, `displayCode`, and `href` are omitted for a restricted historical
reference.
The first-release UI uses `REGARDING` as the only relation role.

### 12.3 Participant

```ts
type ActivityParticipantType = 'USER' | 'CONTACT' | 'EXTERNAL_EMAIL';

type ActivityParticipantRole =
  | 'ORGANIZER'
  | 'ATTENDEE'
  | 'REQUIRED'
  | 'OPTIONAL'
  | 'CC'
  | 'BCC';

type ActivityParticipationStatus =
  | 'NEEDS_ACTION'
  | 'ACCEPTED'
  | 'DECLINED'
  | 'TENTATIVE';

interface ActivityParticipant {
  id: string;
  participantType: ActivityParticipantType;
  principalId?: string | null;
  displayName: string;
  email?: string | null;
  role: ActivityParticipantRole;
  participationStatus?: ActivityParticipationStatus | null;
  accessible: boolean;
  createdAt: string;
}
```

Participation status is read-only and integration-owned in this release.
Adding an external email does not send an invitation.

### 12.4 Available actions

```ts
type ActivityAvailableAction =
  | 'EDIT'
  | 'START'
  | 'COMPLETE'
  | 'DEFER'
  | 'RESUME'
  | 'CANCEL'
  | 'REOPEN'
  | 'RESCHEDULE'
  | 'MANAGE_LINKS'
  | 'MANAGE_PARTICIPANTS'
  | 'ADD_NOTE'
  | 'DELETE';
```

The backend returns available actions after permission, scope, status, and
dependency evaluation. The frontend does not recreate authorization by status
alone.

### 12.5 Activity summary

```ts
interface ActivitySummary {
  id: string;
  activityType: ActivityType;
  subject: string;
  direction?: ActivityDirection | null;
  status: ActivityStatus;
  priority: ActivityPriority;
  owner: ActivityOwnerRef;
  scheduledStartAt?: string | null;
  scheduledEndAt?: string | null;
  completedAt?: string | null;
  relatedRecords: ActivityLink[];
  relatedRecordCount: number;
  participantCount: number;
  availableActions: ActivityAvailableAction[];
  updatedAt: string;
  version: number;
}
```

List responses include only bounded related-record summaries, not an
unbounded child collection.

### 12.6 Activity detail

```ts
interface ActivityDetail extends ActivitySummary {
  description?: string | null;
  durationSeconds?: number | null;
  outcomeCode?: string | null;
  externalReference?: string | null;
  recurrenceRule?: string | null;
  createdAt: string;
  createdBy?: string | null;
  updatedBy?: string | null;
}
```

Participants, Notes, and status history use independent query boundaries.

## 13. Core search contract

### 13.1 Endpoint

```http
GET /api/activities
```

### 13.2 Query parameters

The target endpoint accepts:

- Existing canonical filters.
- `queue` as a server enum.
- `relatedType` and `relatedId` as a validated pair.
- Whitelisted `sort`.
- Existing `page` and `size` limits.

`from` and `to` filter `scheduledStartAt` except for Completed, where they
filter `completedAt`. The response documents this queue-specific rule.

### 13.3 Search behavior

`q` searches normalized:

- `subject`
- `description`
- `outcomeCode`

It does not search fabricated Account or Contact labels. Related entities are
filtered by canonical type and ID.

### 13.4 Sort whitelist

Supported sort values are:

- `scheduledStartAt:asc`
- `scheduledStartAt:desc`
- `updatedAt:asc`
- `updatedAt:desc`
- `priority:asc`
- `priority:desc`
- `subject:asc`
- `subject:desc`

Schedule sorts place null schedules after dated records. Stable ID ordering is
the final tie-breaker.

### 13.5 Response

The response is the repository's canonical `PageResult<ActivitySummary>`.

The frontend does not accept a bare array, `content` alias, or a response with
fabricated pagination defaults.

### 13.6 Projection requirements

The server resolves owner display and bounded related-record summaries without
per-row API calls.

Each summary returns at most the first two authorized related records in
deterministic target-type, created-time, and ID order plus the full
`relatedRecordCount`. The detail tab retrieves the paged full collection.

The target implementation uses one paged Activity query with owner joins and
one bounded batch query for related records across IDs in the current page.
The related-record batch uses deterministic row numbering to keep the first
two authorized links per Activity. N+1 service calls are prohibited.

## 14. Work-queue summary contract

### 14.1 Endpoint

```http
GET /api/activities/work-queue-summary
```

It accepts the same explicit search, type, priority, owner, team, related
record, and custom date filters as the List, excluding queue and pagination.

### 14.2 Response

```json
{
  "myWork": 18,
  "overdue": 3,
  "today": 6,
  "upcoming": 9,
  "completed": 41,
  "all": 127,
  "timeZone": "Asia/Bangkok",
  "asOf": "2026-08-24T03:15:00Z"
}
```

Counts are scoped server aggregates. They are not derived from loaded rows.

### 14.3 Consistency

- Counts and List/Agenda queries use the same scope resolver and queue
  definitions.
- `asOf` lets the client explain minor changes caused by time crossing a day
  boundary.
- A summary failure does not block List or Agenda content.
- Failed counts render unavailable, not zero.

## 15. Workspace header and work queues

### 15.1 Header

The header contains:

- `Activities` heading.
- Direct subtitle: `Plan and complete customer work.`
- Current result total from the active query.
- Refresh action.
- `New activity` primary action when authorized.

It does not contain marketing copy, gradients, invented automation claims, or
decorative metrics.

### 15.2 Work-queue navigation

Queues render as compact tabs or segmented navigation:

- My work
- Overdue
- Today
- Upcoming
- Completed
- All activities

Each count comes from the summary endpoint. A count uses tabular figures. Zero
is displayed only when the endpoint successfully returned zero.

### 15.3 View switcher

The Agenda/List control:

- Uses an accessible tab or segmented-control primitive.
- Updates `view` without dropping filters.
- Preserves separate default sort behavior.
- Never presents an inactive calendar control.

## 16. Filter experience

### 16.1 Search

- Search has a visible label or accessible name.
- Placeholder: `Search subject, description, or outcome…`
- Input is debounced.
- Submit does not require a separate button.
- Clearing search resets page to zero.

### 16.2 Filters

The filter bar includes:

- Activity type.
- Status.
- Priority.
- Owner user.
- Assigned team.
- Related record type and record selector.
- Custom date range.

Owner user and team are mutually exclusive. Related record selection is
disabled until a target type is selected.

Status choices are queue-aware:

- My work offers Planned, In progress, and Deferred.
- Overdue, Today, and Upcoming offer Planned and In progress.
- Completed fixes status to Completed and does not show an editable status
  filter.
- All activities offers every canonical status.

An incompatible status is removed when the queue changes.

### 16.3 Filter summary

Active filters render as removable chips with full accessible names. `Clear
all` removes explicit filters while keeping view and selected queue.

The UI distinguishes queue presets from explicit filters.

### 16.4 Reference-selector behavior

- Selector search starts after two non-whitespace characters.
- Results are server-scoped and server-paginated.
- Results show canonical display name and code.
- Loading, empty, retry, and selected states are distinct.
- Selected values remain legible after the popover closes.
- A selected reference that becomes inaccessible is shown as restricted and
  cannot be resubmitted unchanged without server confirmation.

## 17. List view design

### 17.1 Table columns

Desktop columns are:

1. Activity: type icon, subject, and one-line description.
2. Related records: bounded visible references or `No related record`.
3. Schedule: localized start and optional end.
4. Owner: user or team display.
5. Priority.
6. Status.
7. Contextual actions.

The Activity type does not need a separate wide badge column when the icon and
accessible label already communicate it.

### 17.2 Row navigation

- Subject is a real link to the detail route.
- The row has hover and `focus-within` treatment but is not a clickable `<div>`
  navigation substitute.
- Cmd/Ctrl-click and middle-click work on the subject link.
- Related records use real links only when independently authorized.

### 17.3 Row actions

The visible primary row action is the next common valid action, usually:

- Start for Planned.
- Complete for In progress.
- Resume for Deferred.
- Reopen for terminal status when allowed.

Less common actions live in an overflow menu. Every action must be present in
`availableActions`.

### 17.4 Pagination

- Pagination uses server totals.
- Page sizes are 10, 20, 50, and 100.
- Invalid or now-empty pages normalize to the last valid page.
- Background page changes preserve the old table until the new page arrives.
- Result announcements use a polite live region.

## 18. Agenda view design

### 18.1 Purpose

Agenda is a chronological work surface, not a calendar-grid substitute. It
optimizes for answering:

- What is overdue?
- What must happen today?
- What is coming next?
- What has no schedule?

### 18.2 Grouping

The current server page is grouped after retrieval into:

- `Overdue`
- `Today`
- A localized heading for each following date
- `Unscheduled`

Grouping uses the server-resolved timezone returned with queue context. A date
group may continue on another result page; the page repeats the date heading
rather than hiding context.

### 18.3 Agenda item

Each item includes:

- Start time and optional end time.
- Type icon and accessible type label.
- Subject.
- Status and priority.
- Owner.
- Up to two visible related records plus an overflow count.
- Participant count when non-zero.
- One contextual primary action and an overflow menu.

Overdue meaning is communicated by text and icon in addition to color.

### 18.4 Agenda navigation

- Queue tabs provide the primary time navigation.
- Custom `from` and `to` filters support a bounded range.
- Agenda does not introduce month/week controls that imply a calendar grid.
- Pagination remains server-based.
- Changing pages scrolls or focuses the Agenda heading, not the browser top
  without context.

### 18.5 Agenda empty states

- Empty My work: `No work is due in this window.`
- Empty Today: `Nothing is scheduled for today.`
- Empty filtered result: `No activities match these filters.`
- Unscheduled is omitted when it contains no records.

The empty state does not fabricate recommended Activities.

## 19. Activity detail workspace

### 19.1 Record header

The detail header displays:

- Back to Activities.
- Type icon and label.
- Subject.
- Status badge.
- Priority badge.
- Schedule in the resolved timezone.
- Owner display.
- Last updated time.
- Primary and overflow actions from `availableActions`.

The header remains visible if an independent tab request fails.

### 19.2 Tabs

The route has four tabs:

1. `Overview`
2. `Related records`
3. `Participants`
4. `Notes`

The active tab is deep-linkable through `?tab=overview|related|participants|notes`.
Invalid tab values normalize to Overview.

### 19.3 Overview

Overview contains:

- Activity details: type, direction, status, priority.
- Schedule: start, end, completed time, and timezone.
- Ownership.
- Description with long-text handling.
- Read-only integration fields only when they are present.
- Created and updated audit metadata.
- Recent status-history entries with a link to load more.

Missing optional values use direct labels such as `Not scheduled` or `No
description`; they are never replaced by plausible content.

### 19.4 Tab isolation

- Core Activity loads independently from links, participants, Notes, and
  status history.
- Failure in one tab produces an inline retry for that tab.
- Opening a tab lazily loads its data.
- Successfully loaded tab data remains fresh for 30 seconds. Returning after
  that interval keeps cached content visible while a background refresh runs.

## 20. Create and edit experience

### 20.1 Container

Create and edit use:

- A right-side sheet 36 rem wide on desktop with `max-width: 100vw`.
- A full-screen sheet on narrow mobile.
- Existing shadcn/Radix primitives.
- A sticky title region and sticky action footer only when they do not cover
  focused controls.
- Contained overscroll.

A small centered dialog is not used for this multi-section form.

### 20.2 Sections

The form sections are:

1. Activity details.
2. Schedule.
3. Ownership.
4. Related records.
5. Participants.

Create submits all five sections atomically. General edit updates core data;
existing links and participants are managed from their detail tabs and are not
silently replaced.

### 20.3 Core fields

The editable core fields are:

- Activity type.
- Subject.
- Description.
- Direction when applicable.
- Priority.
- Scheduled start.
- Scheduled end when applicable.
- Owner kind and owner reference.

Status is display-only. The form does not expose a status select.

### 20.4 Type-specific behavior

| Type | Direction | Schedule requirements | Participant behavior |
|---|---|---|---|
| Call | Required | Start required; end optional | Optional attendees |
| Email | Required | Start optional; end requires start | Optional Required/Optional/CC/BCC |
| Meeting | Hidden | Start and end required | Exactly one Organizer required |
| Task | Hidden | Start optional; end requires start | Optional attendees |
| Message | Required | Start optional; end requires start | Optional Required/Optional/CC/BCC |
| Demo | Hidden | Start and end required | Exactly one Organizer required |
| Follow-up | Hidden | Start optional; end requires start | Optional attendees |
| Other | Hidden | Start optional; end requires start | Optional attendees |

Direction has no implicit default. The user selects Inbound, Outbound, or
Internal when required.

Meeting and Demo creation initially adds the current actor as Organizer. The
user may replace the Organizer before saving.

### 20.5 Type changes

- Type may change only while status is Planned or Deferred.
- Changing from a directional to a non-directional type clears direction only
  after confirmation when a value exists.
- Changing away from Meeting or Demo cannot leave an invalid Organizer role.
- The form explains fields that will be removed before applying the type
  change.
- In-progress and terminal Activities cannot change type.

### 20.6 Validation presentation

- Subject is required, trimmed, and at most 255 characters.
- Direction is required only for Call, Email, and Message.
- Exactly one owner is required.
- End requires start and cannot be before start.
- Meeting and Demo require both start and end.
- External participant email uses email input semantics and validation.
- Duplicate targets and participants are rejected before submit and again by
  the server.
- First invalid field receives focus on submit.
- Server validation is mapped to the matching field or section.
- Entered values remain intact after recoverable failure.

### 20.7 Unsaved changes

- Closing a dirty sheet requests confirmation.
- Browser or route navigation from a dirty form invokes the route guard.
- The guard is disabled after a successful save.
- A mutation in progress cannot be submitted twice.
- Paste is never blocked.

## 21. Create Activity contract

### 21.1 Endpoint

```http
POST /api/activities
Content-Type: application/json
```

### 21.2 Request

```json
{
  "activityType": "MEETING",
  "subject": "Review implementation milestones",
  "description": "Confirm owners and dates for the first release.",
  "direction": null,
  "priority": "HIGH",
  "owner": {
    "kind": "USER",
    "id": "10000000-0000-0000-0000-000000000001"
  },
  "scheduledStartAt": "2026-08-25T02:00:00Z",
  "scheduledEndAt": "2026-08-25T02:45:00Z",
  "links": [
    {
      "targetType": "OPPORTUNITY",
      "targetId": "40000000-0000-0000-0000-000000000001"
    }
  ],
  "participants": [
    {
      "participantType": "USER",
      "principalId": "10000000-0000-0000-0000-000000000001",
      "role": "ORGANIZER"
    }
  ]
}
```

The request does not accept:

- `status`
- `completedAt`
- `outcomeCode`
- `externalReference`
- `recurrenceRule`
- `durationSeconds`
- Free-text Account, Contact, or assignee labels

### 21.3 Defaults

- Status is server-set to Planned.
- Priority is server-set to Normal only when omitted by a non-UI client.
- Owner is server-set to the current actor only when omitted.
- Relation role is server-set to `REGARDING`.
- Participation status is null unless an authorized integration supplies it
  through a future integration contract.

The production UI sends explicit priority and owner.

### 21.4 Atomicity

Activity, initial links, and initial participants are validated before write
and commit in one transaction.

If any target, participant, owner, role, schedule, or uniqueness rule fails:

- No Activity row is committed.
- No child row is committed.
- The response contains a stable documented error code.

### 21.5 Response

Response is `201 Created` with canonical `ActivityDetail`, bounded links, and
the current `version`. The server response is the only post-create source of
truth.

## 22. General update and reschedule contract

### 22.1 Endpoint

```http
PUT /api/activities/{activityId}
If-Match: "7"
Content-Type: application/json
```

### 22.2 Request

The request contains the complete editable core representation:

```json
{
  "activityType": "MEETING",
  "subject": "Review implementation milestones",
  "description": "Confirm final owners and release dates.",
  "direction": null,
  "priority": "URGENT",
  "owner": {
    "kind": "TEAM",
    "id": "20000000-0000-0000-0000-000000000001"
  },
  "scheduledStartAt": "2026-08-25T03:00:00Z",
  "scheduledEndAt": "2026-08-25T03:45:00Z"
}
```

The body does not contain version. `If-Match` is the concurrency source.
Stored compatibility fields described in Section 7.7 are preserved unchanged.

### 22.3 Status-dependent edit rules

- Planned: all approved core fields are editable.
- Deferred: all approved core fields are editable; editing does not
  automatically resume the Activity.
- In progress: type is immutable; subject, description, priority, owner, and
  end time may be corrected.
- Completed and Cancelled: general edit is unavailable. Reopen is required
  before changing core business data.

### 22.4 Reschedule

`RESCHEDULE` is a UI action that opens schedule editing. It uses the general
update endpoint and does not change status.

Deferring is different: Defer is a lifecycle command, records a reason, and
changes status to Deferred.

### 22.5 Response

Response is canonical `ActivityDetail` with incremented version. The frontend
replaces the affected cached Activity with this response and invalidates queue
counts because schedule or owner changes can move the record between queues.

## 23. Lifecycle transition API

### 23.1 Endpoint

```http
POST /api/activities/{activityId}/transitions
If-Match: "7"
Content-Type: application/json
```

The production UI calls only the unified transition contract. The existing
`/complete` endpoint remains in this release as a deprecated compatibility
adapter that delegates to the same Complete command and invariants. Physical
removal is a separate documented API change and is not assumed by this
specification.

### 23.2 Action enumeration

```ts
type ActivityTransitionAction =
  | 'START'
  | 'COMPLETE'
  | 'DEFER'
  | 'RESUME'
  | 'CANCEL'
  | 'REOPEN';
```

### 23.3 Request shape

```json
{
  "action": "DEFER",
  "reason": "Waiting for the customer security review.",
  "scheduledStartAt": "2026-08-28T02:00:00Z",
  "scheduledEndAt": "2026-08-28T02:30:00Z",
  "outcomeCode": null
}
```

Fields not used by an action are rejected rather than silently ignored.

### 23.4 Response

Response is `200 OK` with canonical `ActivityDetail`, incremented version,
updated available actions, and the newly created status-history entry.

### 23.5 Atomicity

One transition transaction must:

1. Resolve permission and scope.
2. Lock or conditionally update the expected Activity version.
3. Validate the current-to-target transition.
4. Apply status, completion, outcome, and schedule invariants.
5. Insert exactly one status-history row.
6. Increment Activity version exactly once.
7. Commit all changes together.

Failure rolls back both Activity and history changes.

## 24. Lifecycle transition rules

### 24.1 Transition matrix

| Current status | Allowed commands | Result |
|---|---|---|
| Planned | Start, Complete, Defer, Cancel | In progress, Completed, Deferred, Cancelled |
| In progress | Complete, Defer, Cancel | Completed, Deferred, Cancelled |
| Deferred | Resume, Cancel | Planned, Cancelled |
| Completed | Reopen | Planned |
| Cancelled | Reopen | Planned |

No other transition is valid.

### 24.2 Start

- Allowed only from Planned.
- Sets status to In progress.
- Does not change the schedule.
- Does not set completion or outcome.
- Rejects reason, new schedule, and outcome fields.

### 24.3 Complete

- Allowed from Planned or In progress.
- Sets status to Completed.
- Sets `completedAt` to the server clock.
- Accepts optional `outcomeCode` up to 191 characters for authorized
  integrations.
- The first-release UI sends no fabricated outcome code.
- Rejects reason and schedule fields.

### 24.4 Defer

- Allowed from Planned or In progress.
- Requires a trimmed reason up to 500 characters.
- Requires a new scheduled start.
- Accepts an optional new scheduled end.
- Sets status to Deferred.
- Clears completion and outcome.
- Keeps the Activity out of Overdue, Today, and Upcoming until Resume.
- It remains visible through Deferred status filtering and is eligible for My
  work only when it falls inside the My work schedule window or is
  unscheduled.

### 24.5 Resume

- Allowed only from Deferred.
- Sets status to Planned.
- Retains the deferred schedule.
- Rejects reason, outcome, and new schedule fields.

### 24.6 Cancel

- Allowed from Planned, In progress, or Deferred.
- Requires a trimmed reason up to 500 characters.
- Sets status to Cancelled.
- Clears completion and outcome.
- Preserves schedule for historical context.

### 24.7 Reopen

- Allowed from Completed or Cancelled.
- Requires a trimmed reason up to 500 characters.
- Requires a new scheduled start and accepts a new scheduled end.
- Sets status to Planned.
- Clears `completedAt` and `outcomeCode`.
- Retains prior completion/cancellation facts in immutable status history.

### 24.8 Disallowed implicit changes

- General update cannot change status.
- Link or participant mutation cannot change status.
- Editing schedule does not Resume or Reopen.
- Start does not rewrite scheduled start to the current clock.
- Complete cannot be called twice.
- Reopen cannot restore a terminal outcome onto a Planned Activity.

## 25. Activity status history

### 25.1 Endpoint

```http
GET /api/activities/{activityId}/status-history?page=0&size=20
```

It requires Activity read permission and Activity scope.

Pagination defaults to 20 items and allows a maximum size of 100.

### 25.2 Response item

```ts
interface ActivityStatusHistoryItem {
  id: string;
  activityId: string;
  action: ActivityTransitionAction;
  fromStatus: ActivityStatus;
  toStatus: ActivityStatus;
  reason?: string | null;
  outcomeCode?: string | null;
  fromScheduledStartAt?: string | null;
  toScheduledStartAt?: string | null;
  fromScheduledEndAt?: string | null;
  toScheduledEndAt?: string | null;
  resultingVersion: number;
  changedAt: string;
  changedBy: string;
  changedByName?: string | null;
}
```

### 25.3 Persistence

A new append-only `crm_activity_status_history` table contains:

- Tenant and row ID.
- Activity foreign key.
- Action.
- From and to status.
- Reason and optional outcome code.
- Before and after schedule values.
- Resulting Activity version.
- Changed time and actor.

Rows have no update or delete application endpoint. Activity soft deletion
does not erase history.

### 25.4 UI

Overview displays the most recent entries with:

- Human action label.
- From and to status.
- Actor and localized time.
- Reason when present.
- Schedule change when present.

The full history uses server pagination. History is factual and never inferred
from current status.

## 26. Related-record management

### 26.1 Endpoints

```http
GET    /api/activities/{activityId}/links?page=0&size=20
POST   /api/activities/{activityId}/links
DELETE /api/activities/{activityId}/links/{linkId}
```

POST and DELETE require `If-Match` with Activity version.

GET returns `PageResult<ActivityLink>`, defaults to 20 items, and allows a
maximum size of 100.

### 26.2 Create request

```json
{
  "targetType": "ACCOUNT",
  "targetId": "30000000-0000-0000-0000-000000000001"
}
```

The server stores relation role `REGARDING`.

### 26.3 Mutation response

Create returns:

```json
{
  "item": {
    "id": "51000000-0000-0000-0000-000000000001",
    "targetType": "ACCOUNT",
    "targetId": "30000000-0000-0000-0000-000000000001",
    "displayName": "Northwind Field Services",
    "displayCode": "ACC-1042",
    "relationRole": "REGARDING",
    "accessible": true,
    "href": "/app/crm/accounts/30000000-0000-0000-0000-000000000001",
    "createdAt": "2026-08-24T03:15:00Z"
  },
  "activityVersion": 8
}
```

Delete returns `200 OK` with `activityId` and new `activityVersion` so the
client can continue version-aware mutations.

### 26.4 Invariants

- Target type is one of Account, Contact, Lead, or Opportunity.
- Target exists in the same tenant.
- Actor has the target read permission and scope.
- The same target appears at most once for an Activity.
- A link contains exactly one target column at persistence level.
- Link changes are allowed only for Planned, In progress, or Deferred
  Activities.
- Terminal Activities retain historical links until reopened.

### 26.5 UI

The Related records tab contains:

- Grouped visible links by target type.
- Canonical display name and code.
- Real navigation links when authorized.
- Add action when `MANAGE_LINKS` is available.
- Per-link remove action with confirmation.
- Inline loading, empty, restricted, and retry states.
- Server pagination when more than one page exists.

`No related records` is factual. The UI does not substitute `Client` or a
sample company.

## 27. Participant management

### 27.1 Endpoints

```http
GET    /api/activities/{activityId}/participants?page=0&size=20
POST   /api/activities/{activityId}/participants
PUT    /api/activities/{activityId}/participants/{participantId}
DELETE /api/activities/{activityId}/participants/{participantId}
```

All mutations require `If-Match` with Activity version.

GET returns `PageResult<ActivityParticipant>`, defaults to 20 items, and
allows a maximum size of 100.

### 27.2 Create requests

Internal user:

```json
{
  "participantType": "USER",
  "principalId": "10000000-0000-0000-0000-000000000002",
  "role": "REQUIRED"
}
```

Contact:

```json
{
  "participantType": "CONTACT",
  "principalId": "31000000-0000-0000-0000-000000000001",
  "role": "ATTENDEE"
}
```

External email:

```json
{
  "participantType": "EXTERNAL_EMAIL",
  "email": "security-review@example.test",
  "role": "OPTIONAL"
}
```

Exactly one principal form is allowed.

### 27.3 Update request

The first-release update endpoint changes role only:

```json
{
  "role": "OPTIONAL",
  "replaceOrganizer": false
}
```

Principal identity is immutable. Replacing a principal means remove and add.

For Meeting or Demo, promoting a participant to Organizer requires
`replaceOrganizer=true`. The server atomically demotes the prior Organizer to
Attendee and promotes the selected participant in the same parent-version
transaction. Directly demoting or removing the current Organizer is rejected;
the user promotes a replacement first.

### 27.4 Mutation response

Create returns `{ item, activityVersion }`. A normal role update returns
`{ item, activityVersion }`. Organizer replacement returns
`{ participants, activityVersion }` containing the promoted and demoted
records. Delete returns `{ activityId, activityVersion }`.

No endpoint in this release sends mail or modifies participation status.

### 27.5 Uniqueness

- A user appears at most once per Activity.
- A Contact appears at most once per Activity.
- External emails are compared after trim and lowercase normalization.
- One normalized external email appears at most once per Activity.
- Meeting and Demo have exactly one Organizer.
- Organizer is invalid for every other Activity type.

### 27.6 Role applicability

- Meeting and Demo: Organizer, Attendee, Required, Optional.
- Email and Message: Attendee, Required, Optional, CC, BCC.
- Call, Task, Follow-up, and Other: Attendee, Required, Optional.

The server validates role applicability. The UI does not show invalid roles.

### 27.7 UI

The Participants tab displays:

- Principal type.
- Display name and email when authorized.
- Role.
- Read-only participation status when present.
- Edit-role and remove actions when available.
- Server pagination when more than one page exists.

A persistent notice states: `Adding participants does not send invitations.`

## 28. Activity Notes

### 28.1 Release gate

The Notes tab remains unavailable until generic Note authorization resolves
Activity target permission, Activity scope, visibility, and mutation owner
rules.

It must never ship while requiring Account permission for Activity Notes.

### 28.2 Existing endpoint family

The approved design retains:

```http
GET    /api/crm/notes?activityId={activityId}&page=0&size=20
POST   /api/crm/notes
PUT    /api/crm/notes/{noteId}
DELETE /api/crm/notes/{noteId}
```

Create requests contain exactly one target, `activityId`.

The target list response is `PageResult<ActivityNoteSummary>` with Note ID,
title, body, visibility, owner/creator display, created time, updated time,
version, and mutation eligibility. The UI does not accept an unbounded
bare array as the production response.

### 28.3 Create request

```json
{
  "title": "Customer context",
  "body": "Security review must finish before the demo.",
  "visibility": "TEAM",
  "activityId": "50000000-0000-0000-0000-000000000001"
}
```

Owner defaults to the actor. Runtime UI does not expose a free-form owner ID.

### 28.4 Visibility

- PRIVATE: visible only to Note owner or creator.
- TEAM: visible to Note owner/creator and actors sharing at least one active
  team with that owner/creator.
- TENANT: visible to any actor who can read the target Activity.

All visibility rules still require Activity read and Activity scope.

### 28.5 Mutation ownership

Note update and delete require:

- Activity write permission.
- Activity data scope.
- The actor to be Note owner or creator.

Changing visibility does not transfer ownership.

### 28.6 UI

- Notes load independently from Activity detail.
- Empty state: `No notes have been added.`
- Add Note is hidden without Activity write.
- Note edit/delete appears only for mutable Notes.
- Note errors are inline and do not remove loaded Notes.
- Long bodies wrap safely and preserve line breaks.
- Note success copy has no exclamation mark.

## 29. Delete policy

### 29.1 Default lifecycle behavior

Cancel is the normal way to stop operational work. Delete is reserved for a
newly created mistake that has no business history.

### 29.2 Eligibility

The backend includes `DELETE` in `availableActions` only when all conditions
are true:

- Actor has Activity write permission and Activity scope.
- Status is Planned.
- No status transition has been recorded.
- No related-record link exists.
- No participant exists.
- No Activity Note exists.
- Expected Activity version is current.

The client does not infer eligibility from status alone.

### 29.3 Endpoint

```http
DELETE /api/activities/{activityId}
If-Match: "3"
```

The repository performs one conditional soft-delete update including tenant,
ID, non-deleted state, and expected version. It records `deletedAt`,
`deletedBy`, `updatedAt`, and the new version consistently.

Response is `204 No Content`.

### 29.4 Confirmation

Delete uses an accessible confirmation dialog containing:

- Activity subject.
- Explanation that this removes a mistaken record.
- Guidance to Cancel when work history should remain.
- `Delete activity` destructive action.
- `Keep activity` cancel action.

`window.confirm` is not used.

### 29.5 Ineligible delete

When dependencies or history exist, backend returns
`ACTIVITY_DELETE_NOT_ALLOWED`. The UI retains the Activity and offers Cancel
when that transition is valid.

## 30. Optimistic concurrency and persistence

### 30.1 Insert versus update

Repository operations are separated into:

- `insert(Activity)` for a new ID.
- `updateExpectedVersion(Activity, expectedVersion)` for core update.
- `transitionExpectedVersion(...)` for lifecycle mutation.
- `touchExpectedVersion(...)` for link and participant mutation.
- `softDeleteExpectedVersion(...)` for deletion.

An existing Activity is never saved through `INSERT ... ON DUPLICATE KEY
UPDATE`.

### 30.2 Conditional update

Every Activity update includes a condition equivalent to:

```sql
WHERE tenant_id = :tenantId
  AND id = :activityId
  AND deleted_at IS NULL
  AND version = :expectedVersion
```

The SQL sets `version = version + 1`. Affected row count must be exactly one.
Zero maps to version conflict after a scoped existence check that does not
leak unauthorized records.

### 30.3 Child mutation concurrency

Link and participant mutations:

1. Validate the child operation.
2. Conditionally increment the parent Activity version.
3. Insert, update, or delete the child.
4. Commit both in one transaction.

A stale child mutation cannot succeed against a newer Activity state.

### 30.4 Frontend conflict behavior

For `ACTIVITY_VERSION_CONFLICT`:

- Keep unsaved form values in memory.
- Stop the pending state.
- Open a conflict dialog.
- Offer `Review latest activity` and `Copy my changes`.
- Invalidate detail, links, participants, history, all List/Agenda queries,
  and all queue summaries for refetch.
- Never automatically resubmit against the new version.

Transition conflicts do not optimistically change status.

## 31. Schema hardening and migration rules

### 31.1 Owner constraint

Add a database check equivalent to:

```sql
CHECK (
  ((owner_user_id IS NOT NULL) + (assigned_team_id IS NOT NULL)) = 1
)
```

Before enabling it:

- If both owner fields are populated and the user membership is active, keep
  the user owner and clear the team owner.
- If both are populated and the user membership is inactive, keep the active
  team owner and clear the user owner.
- If neither is populated and `created_by` is an active tenant member, assign
  `created_by`.
- Remaining ambiguous rows are placed in a migration exception report and
  block constraint activation; they are not assigned to a fabricated user.

### 31.2 Completion constraint

Replace the one-direction completion check with a bidirectional check:

```sql
CHECK (
  (status = 'COMPLETED' AND completed_at IS NOT NULL)
  OR
  (status <> 'COMPLETED' AND completed_at IS NULL)
)
```

For an existing Completed row with null completion time, backfill
`completed_at` from `updated_at`. Existing non-completed rows with completion
time clear it after recording the affected IDs in the migration report.

### 31.3 Status history table

Create the append-only table described in Section 25 with indexes on:

- `(tenant_id, activity_id, changed_at DESC, id DESC)`
- `(tenant_id, changed_by, changed_at DESC)`

No historical transition is fabricated for pre-migration Activities. The UI
states that history begins with changes recorded after the feature release
when no entries exist for an older Activity.

### 31.4 Link uniqueness

Add a deterministic generated target key built from target type and target ID,
then enforce uniqueness by:

- Tenant.
- Activity.
- Generated target key.

Before enabling uniqueness, duplicate rows retain the earliest `created_at`
row and are listed in the migration report.

Existing null or non-`REGARDING` relation roles normalize to `REGARDING`
before a database check limits first-release role values to `REGARDING`.

Ticket link values remain unsupported by the release API.

### 31.5 Participant uniqueness

Add a generated participant key:

- `USER:<user_id>`
- `CONTACT:<contact_id>`
- `EMAIL:<lowercase-trimmed-email>`

Enforce uniqueness by tenant, Activity, and participant key.

Before enabling uniqueness, duplicates retain the earliest row. If duplicate
roles differ, the migration retains Organizer first, then Required, Attendee,
Optional, CC, and BCC in that priority order and reports the merge.

Existing Organizer roles on non-Meeting/Demo Activities normalize to Attendee.
Existing CC or BCC roles outside Email/Message normalize to Optional. Meeting
or Demo rows without exactly one Organizer block release and appear in the
migration exception report; the migration does not invent an Organizer.

### 31.6 Query indexes

Add or verify indexes supporting:

- Tenant, status, scheduled start, ID.
- Tenant, owner user, status, scheduled start.
- Tenant, assigned team, status, scheduled start.
- Tenant, completed time, status.
- Each supported Activity-link target lookup.
- Participant lookup by Activity.

Indexes are justified by scoped search and queue plans; redundant indexes are
not added blindly.

## 32. Error contract

### 32.1 Existing errors retained

- `ACTIVITY_NOT_FOUND`
- `ACTIVITY_VERSION_CONFLICT`
- `ACTIVITY_OWNER_INVALID`
- `ACTIVITY_STATUS_INVALID`
- `ACTIVITY_TIME_RANGE_INVALID`

Their documented permission, scope, validation, and status mappings must match
source behavior.

### 32.2 Required Activity errors

| HTTP | Error code | Meaning |
|---|---|---|
| `400` | `ACTIVITY_DIRECTION_REQUIRED` | Direction missing for a directional type |
| `400` | `ACTIVITY_SCHEDULE_REQUIRED` | Required start or end missing |
| `400` | `ACTIVITY_TIME_ZONE_INVALID` | Timezone or wall time cannot be resolved |
| `400` | `ACTIVITY_REASON_REQUIRED` | Required lifecycle reason missing |
| `409` | `ACTIVITY_TRANSITION_INVALID` | Command is invalid from current status |
| `409` | `ACTIVITY_LINK_DUPLICATE` | Target is already linked |
| `409` | `ACTIVITY_PARTICIPANT_DUPLICATE` | Principal is already a participant |
| `409` | `ACTIVITY_PARTICIPANT_ROLE_INVALID` | Role is invalid for Activity type |
| `409` | `ACTIVITY_ORGANIZER_REQUIRED` | Meeting or Demo would lack one Organizer |
| `409` | `ACTIVITY_DELETE_NOT_ALLOWED` | History or dependency prevents delete |

Missing permissions remain `403 ACCESS_DENIED`. An unknown or out-of-scope
Activity remains `404 ACTIVITY_NOT_FOUND`.

### 32.3 Related-target errors

- An invalid, cross-tenant, unauthorized, or out-of-scope related record
  returns `404 ACTIVITY_LINK_TARGET_NOT_FOUND` without target metadata.
- An invalid, cross-tenant, inactive, unauthorized, or out-of-scope user or
  Contact participant returns `404 ACTIVITY_PARTICIPANT_NOT_FOUND` without
  principal metadata.
- An invalid external email returns the normal `400 INVALID_PAYLOAD` field
  validation response.

### 32.4 Frontend mapping

- Validation errors render inline and focus the first invalid field.
- Version conflict opens the conflict workflow.
- Invalid transition refetches Activity and available actions.
- Duplicate link/participant keeps the child list and identifies the selected
  duplicate.
- Organizer error keeps the participant editor open.
- Delete-not-allowed keeps the Activity and explains Cancel.
- Network failure includes a Retry action.
- Unknown failure uses `We couldn't complete this action. Try again.`

No raw exception, SQL, stack trace, or internal class name appears in runtime
copy.

## 33. Frontend architecture

### 33.1 Feature boundaries

The target feature structure is conceptually:

```text
src/features/crm/activities/
  ActivitiesPage.tsx
  ActivityDetailPage.tsx
  components/
    ActivitiesHeader.tsx
    ActivityQueueTabs.tsx
    ActivityFilters.tsx
    ActivityList.tsx
    ActivityAgenda.tsx
    ActivityAgendaItem.tsx
    ActivityEditorSheet.tsx
    ActivityCoreForm.tsx
    ActivityRelatedRecordsEditor.tsx
    ActivityParticipantsEditor.tsx
    ActivityDetailHeader.tsx
    ActivityOverviewTab.tsx
    ActivityRelatedRecordsTab.tsx
    ActivityParticipantsTab.tsx
    ActivityNotesTab.tsx
    ActivityTransitionDialog.tsx
    ActivityDeleteDialog.tsx
    ActivityConflictDialog.tsx
  hooks/
    activityQueries.ts
    useActivitySearchParams.ts
    useActivityForm.ts
  utils/
    activityDateTime.ts
    activityUrlState.ts
```

These are the target feature filenames and responsibility boundaries.

### 33.2 Page responsibility

`ActivitiesPage.tsx`:

- Parses canonical URL state.
- Starts List/Agenda and queue-summary queries.
- Coordinates top-level sheets/dialogs.
- Composes approved workspace components.

It does not define domain enums, API normalization, local badge colors, or a
full form inline.

`ActivityDetailPage.tsx`:

- Resolves route ID and tab.
- Loads core detail.
- Coordinates independent tab queries.
- Coordinates edit and lifecycle overlays.

### 33.3 Service boundary

`activityApi.ts` exposes strict functions for:

- Search.
- Queue summary.
- Detail.
- Create.
- General update.
- Transition.
- Status history.
- Links.
- Participants.
- Delete.

Activity Note functions remain in the Note service. `activityQueries.ts`
composes those exact Activity-target request and response types without
duplicating Note transport in `activityApi.ts`.

The service boundary:

- Uses no `any`.
- Serializes only canonical query parameters.
- Passes current `If-Match` explicitly.
- Converts local zoned form values to UTC through one utility.
- Returns canonical response types without fabricated fallback.
- Propagates structured API errors.
- Accepts an `AbortSignal` for cancellable queries.

### 33.4 Query keys

TanStack Query keys are stable and scoped:

```ts
const activityKeys = {
  all: ['activities'] as const,
  lists: () => ['activities', 'list'] as const,
  list: (params: ActivitySearchParams) =>
    ['activities', 'list', params] as const,
  queueSummary: (filters: ActivitySummaryFilters) =>
    ['activities', 'queue-summary', filters] as const,
  detail: (id: string) => ['activities', 'detail', id] as const,
  history: (id: string, page: number, size: number) =>
    ['activities', 'history', id, page, size] as const,
  links: (id: string, page: number, size: number) =>
    ['activities', 'links', id, page, size] as const,
  participants: (id: string, page: number, size: number) =>
    ['activities', 'participants', id, page, size] as const,
  notes: (id: string, page: number, size: number) =>
    ['activities', 'notes', id, page, size] as const,
};
```

Reference selectors use their entity module's canonical keys.

### 33.5 Component state versus URL state

URL owns:

- View.
- Queue.
- Search.
- Filters.
- Date range.
- Sort.
- Pagination.
- Detail tab.

Local state owns only ephemeral interaction:

- Open sheet/dialog.
- Draft form values.
- Unsaved-change state.
- Overflow-menu state.
- Conflict-copy state.

Server responses own Activity business state.

## 34. Data flow and cache behavior

### 34.1 Workspace read flow

1. Parse and normalize URL.
2. Convert URL state to canonical search params.
3. Run Activity page query.
4. Run queue summary query independently.
5. Render Agenda or List from the same page response.
6. Keep previous page data during background fetch.

The query function forwards TanStack Query's abort signal to the request
layer. Superseded search requests cannot overwrite newer query state.

### 34.2 Detail read flow

1. Load Activity detail.
2. Render header and Overview shell.
3. Load history for Overview.
4. Load links, participants, or Notes when their tab is active.
5. Keep tab failures isolated.

### 34.3 Mutation invalidation

Create:

- Invalidates Activity lists and queue summaries.
- Seeds detail cache from canonical response when navigating to detail.

Core update:

- Replaces detail cache with response.
- Invalidates lists and queue summaries.

Transition:

- Replaces detail cache.
- Invalidates lists, queue summaries, and status history.

Link mutation:

- Updates or invalidates links.
- Updates parent Activity version in detail cache.
- Invalidates List projections and queue summary only if related filtering is
  active or counts depend on related filters.

Participant mutation:

- Updates or invalidates participants.
- Updates parent version and participant count.
- Invalidates visible List/Agenda rows containing the Activity.

Note mutation:

- Invalidates Notes only.
- Does not change Activity version.

Delete:

- Removes detail cache.
- Invalidates lists and queue summaries.
- Navigates to the preserved workspace context.

### 34.4 Optimistic behavior

The UI does not optimistically apply:

- Lifecycle transitions.
- Owner changes.
- Link or participant mutations.
- Delete.

Server responses determine the resulting version, status, available actions,
and child collections.

Non-business UI interactions such as tab selection remain immediate.

## 35. Loading, empty, refresh, and failure states

### 35.1 Initial loading

- List uses shape-matched table-row skeletons.
- Agenda uses time-column and content-row skeletons.
- Detail uses header and Overview skeletons.
- Links, participants, Notes, and history use section-specific skeletons.
- Queue counts show neutral placeholders, not zero.

### 35.2 Background refresh

- Previously loaded content remains visible.
- Refresh control displays a restrained pending indicator.
- Controls are not globally disabled for a background read.
- A failed refresh keeps stale content and shows an inline retry message.

### 35.3 First-use empty

When the authorized tenant scope has no Activities:

- Heading: `No activities yet`
- Description: `Create an activity to plan customer work.`
- `New activity` appears only with write permission.

### 35.4 Filtered empty

When Activities exist but filters return none:

- Heading: `No activities match these filters`
- Description identifies that the query can be changed.
- `Clear filters` preserves view and selected queue.
- Create is not the primary recovery action.

### 35.5 Read-only empty

A read-only user sees factual empty guidance without a create action or copy
that instructs them to perform an unavailable mutation.

### 35.6 Initial load error

- The workspace body shows a concise inline error.
- Retry is available.
- Header and navigation remain stable.
- No fabricated rows render.

### 35.7 Forbidden and not found

- Route authorization sends missing Activity read permission to the existing
  forbidden experience.
- An out-of-scope or unknown Activity detail uses the same not-found surface.
- A tab-level permission failure stays inside the tab when core detail remains
  authorized.

### 35.8 Mutation pending and failure

- Only the active action is disabled while pending.
- Submit label becomes `Saving…`, `Completing…`, or another specific verb.
- Double submission is prevented.
- Failure retains context and draft values.
- Success closes the appropriate overlay only after the canonical response is
  received.

## 36. Responsive behavior

### 36.1 Wide desktop

- Workspace uses the app shell's bounded content width.
- Filters remain in one or two intentional rows.
- List table preserves all approved columns.
- Detail Overview uses a two-column main-content/contextual-sidebar layout.
- Sheet width remains large enough for two-column field pairs where useful.

### 36.2 Laptop and tablet

- Low-priority metadata collapses before horizontal overflow.
- Filter controls wrap with aligned labels.
- Detail sidebar moves below primary Overview content.
- Agenda remains one readable column.

### 36.3 Mobile

- List becomes semantic record cards rather than a squeezed table.
- Each card preserves subject, type, schedule, owner, priority, status, and
  actions.
- Filters open in a full-height sheet with Apply and Clear actions.
- Activity editor becomes full-screen.
- Primary action remains reachable without covering focused fields.
- Safe-area insets are respected.
- No hover-only action is required.

### 36.4 Content resilience

- Long subjects and entity names use line clamp or safe wrapping with full
  accessible value.
- Flex children use `min-w-0` where truncation is expected.
- External email and IDs break safely.
- User-entered description and Notes cannot create horizontal scroll.
- Dates do not assume fixed `en-US` widths.

## 37. Accessibility requirements

### 37.1 Semantics

- Use one `<main>` landmark for workspace content.
- Use hierarchical headings.
- Desktop List uses semantic table elements.
- Mobile record cards use semantic articles or list items.
- Record navigation uses links.
- Mutations use buttons.
- Queue and view navigation use the project's accessible shadcn/Radix Tabs
  primitive.
- Form controls have associated visible labels whenever practical.

### 37.2 Keyboard behavior

- Every queue, filter, table/card action, sheet, dialog, tab, participant,
  link, Note, and pagination control is keyboard-operable.
- Overflow menus expose the same operations as pointer interaction.
- Sheet and dialog focus is trapped while open.
- Escape closes a non-destructive overlay unless a mutation is pending.
- Focus returns to the invoking control after close.
- After delete, focus moves to the workspace heading or next logical record.
- Sticky regions do not cover the focused element.

### 37.3 Accessible names

Icon-only controls use context-specific labels, for example:

- `Open actions for Review implementation milestones`
- `Edit Review implementation milestones`
- `Remove Northwind Field Services from related records`
- `Remove security-review@example.test from participants`

Decorative icons are hidden from assistive technology.

### 37.4 Forms

- Controls have meaningful `name` and autocomplete behavior.
- External email uses `type="email"`, appropriate input mode, and disabled
  spellcheck.
- Placeholder examples end with an ellipsis character.
- Submit remains enabled until a request starts.
- Inline errors are associated to fields.
- First invalid control receives focus after submit.
- Labels and checkbox/radio controls share one usable target.
- Paste remains enabled.

### 37.5 Live announcements

A polite live region announces:

- Result-count changes.
- Page changes.
- Background refresh completion when relevant.
- Successful create, update, transition, link, participant, and Note changes.
- Recoverable mutation failure.

Status text in the row or detail remains the primary persistent feedback.

### 37.6 Visual accessibility

- Text and controls meet WCAG AA contrast.
- Focus-visible rings remain clear on all Activity semantic surfaces.
- Status, priority, overdue state, and restricted state do not rely on color
  alone.
- Mobile touch targets are at least 44 by 44 CSS pixels.
- Browser zoom is not disabled.
- Motion honors `prefers-reduced-motion`.
- Animations use transform and opacity and remain interruptible.
- No content autoplays.

## 38. Visual and status system

### 38.1 Surface treatment

- Follow the existing light app shell.
- Use cool neutral page and panel surfaces.
- Use one restrained professional blue as the primary interactive accent.
- Avoid blue-purple gradients.
- Avoid decorative KPI cards.
- Use subtle borders and minimal elevation.
- Reserve shadow for sheets, dialogs, popovers, and menus.
- Use tighter radius for controls and rows than for overlays.

### 38.2 Typography

- Reuse the approved application font and scale.
- Subjects use semibold emphasis, not oversized display type.
- Metadata uses regular or medium weight.
- Counts and time columns use tabular figures.
- Sentence case is preferred for UI labels.
- User-facing labels use sentence case. Canonical uppercase codes appear only
  in developer-facing audit or integration metadata.
- Loading copy uses the ellipsis character: `Loading…`.

### 38.3 Centralized Activity configuration

`@/config/crmStatusConfig` becomes the only source for Activity status,
priority, and type presentation.

Required status direction:

| Status | Treatment |
|---|---|
| Planned | Blue, restrained, semibold |
| In progress | Purple/indigo, visible, semibold |
| Completed | Emerald, high-confidence, bold |
| Deferred | Amber, paused-work emphasis, semibold |
| Cancelled | Slate, inactive-work treatment, semibold |

Required priority direction:

| Priority | Treatment |
|---|---|
| Urgent | Strong rose, bold |
| High | Amber, bold |
| Normal | Blue/neutral, semibold |
| Low | Slate, medium |

Activity type config provides exact English label and icon for all eight
types. Type treatment remains restrained and does not create a rainbow row.

Exact status classes are:

- Planned: `bg-blue-50 text-blue-700 border-blue-200 font-semibold`
- In progress: `bg-purple-50 text-purple-700 border-purple-200 font-semibold`
- Completed: `bg-emerald-50 text-emerald-700 border-emerald-200 font-bold`
- Deferred: `bg-amber-50 text-amber-700 border-amber-200 font-semibold`
- Cancelled: `bg-slate-100 text-slate-700 border-slate-200 font-semibold`

Exact priority classes are:

- Urgent: `bg-rose-50 text-rose-700 border-rose-200 font-bold`
- High: `bg-amber-50 text-amber-700 border-amber-200 font-bold`
- Normal: `bg-blue-50 text-blue-700 border-blue-200 font-semibold`
- Low: `bg-slate-100 text-slate-700 border-slate-200 font-medium`

Every List, Agenda, detail, sheet, dialog, history, and related widget imports
these helpers. No Activity component defines a local status or priority color
map.

### 38.4 Motion and interaction

- Hover, active, and focus states increase contrast.
- Pressed state is subtle and does not move layout.
- Transitions list explicit properties; `transition: all` is not used.
- No decorative page-entry sequence or looping motion ships.
- Background refresh does not flash or replace the full page.

## 39. Runtime copy rules

### 39.1 Naming

Use these consistent terms:

- Activity
- Agenda
- Related records
- Participants
- Notes
- Planned
- In progress
- Completed
- Deferred
- Cancelled
- Start activity
- Complete activity
- Defer activity
- Resume activity
- Cancel activity
- Reopen activity
- Reschedule activity

Do not alternate `Task`, `Engagement`, and `Activity` when referring to the
same generic record. `Task` remains one Activity type.

### 39.2 Success copy

Approved patterns include:

- `Activity created.`
- `Activity updated.`
- `Activity started.`
- `Activity completed.`
- `Activity deferred.`
- `Activity resumed.`
- `Activity cancelled.`
- `Activity reopened.`
- `Schedule updated.`
- `Related record added.`
- `Participant added.`
- `Note saved.`

No exclamation mark, emoji, fake downstream automation, or invented invitation
claim is used.

### 39.3 Error copy

Messages state the problem and a next action:

- `We couldn't load activities. Try again.`
- `Review the highlighted fields before saving.`
- `This activity changed after you opened it. Review the latest version before saving again.`
- `This activity can no longer be completed from its current status.`
- `This record is already linked to the activity.`
- `This participant has already been added.`
- `Delete is unavailable because this activity has related history. Cancel it instead.`

Do not use `Oops`, passive blame, or internal implementation terms.

## 40. Backend validation requirements

### 40.1 Request validation

- Subject is trimmed, non-blank, and at most 255 characters.
- Description is at most 10,000 characters across request, domain, UI, and
  docs; the storage column remains `LONGTEXT`.
- Activity type, status, priority, direction, roles, and actions are canonical
  enums.
- Owner uses one discriminated kind and ID.
- Schedule requiredness follows type rules.
- End is not before start.
- Reason is trimmed and at most 500 characters.
- Outcome code is trimmed and at most 191 characters.
- External email is normalized and at most 320 characters.
- Page is non-negative and size is 1-100.
- Sort is whitelisted.
- Owner and related-record filter pairs are validated.

### 40.2 Domain validation

The Activity aggregate exposes explicit methods:

- `start`
- `complete`
- `defer`
- `resume`
- `cancel`
- `reopen`
- `updateCore`

General update does not accept arbitrary status, completion time, outcome, or
child collections.

The domain owns lifecycle and completion invariants. The application layer
owns scoped references, transaction orchestration, and current actor context.

### 40.3 Reference validation

Before persistence, the application validates:

- Owner tenant membership, active state, and assignment scope.
- Team active state and assignment scope.
- Link target tenant, read permission, and entity data scope.
- Contact participant tenant and Contact scope.
- Internal participant tenant membership and active state.
- External email format and normalized uniqueness.
- Participant role applicability.
- Organizer invariant.
- Link and participant duplicates.

Foreign keys and unique indexes remain defense in depth, not the primary
user-facing error mechanism.

### 40.4 Scope validation

Every mutation loads the Activity through the Activity scope predicate. A
tenant ID and Activity ID lookup without scope is prohibited for a user-facing
operation.

Queue summaries and counts use the same predicate as result queries.

### 40.5 Read projection

- Owner display comes from bounded membership/team joins.
- Related-record display resolves only authorized targets.
- List projection limits related records to a documented bounded count.
- Detail collections use separate paged or bounded endpoints.
- Query code does not catch and ignore SQL exceptions.
- Missing schema or query failure is an observable server error.

### 40.6 Available actions

Backend computes actions from:

- Permission.
- Data scope.
- Current status.
- Record dependencies.
- Child-management eligibility.
- Delete eligibility.

The returned set is advisory for UI rendering; the mutation endpoint still
revalidates all conditions.

## 41. API reference synchronization

This document proposes API behavior that is not currently implemented.
Therefore the repository root `docs/api-reference.md` must not be changed in
this spec-only task to claim that the target behavior already exists.

Any later implementation must update the API reference in the same task for:

- Canonical Activity enums and removed aliases.
- Enriched search summary.
- Queue and queue-summary semantics.
- Sort, related-record filters, owner filters, and timezone behavior.
- Create request with atomic initial links and participants.
- General update request and `If-Match` behavior.
- Unified transition endpoint and action-specific validation.
- Status-history endpoint and persistence behavior.
- Link endpoints, response, scope, uniqueness, and concurrency.
- Participant endpoints, roles, uniqueness, and no-invitation behavior.
- Activity-targeted Note authorization and visibility.
- Delete eligibility.
- Available-actions projection.
- New error codes and HTTP statuses.
- Response fields, headers, validation limits, and optimistic concurrency.
- Compatibility and removal status of `/complete`.

Examples must use synthetic IDs, domains, names, and timestamps. They must not
contain credentials, tokens, secrets, connection values, or personal data.

## 42. Acceptance criteria

### 42.1 Data integrity

- Frontend and backend use the exact canonical Activity enums.
- `PENDING` and `MEDIUM` are absent from Activity runtime paths.
- No adapter fabricates ID, label, owner, schedule, timestamp, status,
  priority, version, related record, or participant.
- No mutation merges client request aliases over server response.
- Every active Activity has exactly one owner.
- Completion status and completion time remain consistent.
- Type-specific direction and schedule rules are enforced.
- No lifecycle change occurs through general update.
- Atomic version checks prevent lost updates.

### 42.2 Workspace

- Agenda is the default view and My work is the default queue.
- URL refresh preserves view, queue, filters, date range, sort, and page.
- Back/forward reconstructs visible state.
- Queue counts come from server aggregates.
- List and Agenda query before pagination.
- Search and filters never run only against a loaded page.
- No decorative KPI derives business totals from current page data.
- Read-only users do not receive mutation controls.

### 42.3 Agenda and List

- Agenda groups scheduled Instants in the resolved timezone.
- Overdue, Today, Upcoming, and Unscheduled semantics match the server.
- List columns display canonical owner and related-record data.
- No missing relation is replaced with `Client`, sample Account, or sample
  Contact.
- Subject is a real detail link.
- Row/card actions come from backend available actions.
- Server pagination works beyond 100 total records.

### 42.4 Detail

- Detail route exists and preserves workspace Back context.
- Header remains usable when a child query fails.
- Overview, Related records, Participants, and Notes have independent loading
  and retry states.
- Integration-owned fields render only when present.
- Recent status history reflects stored events, not inferred events.

### 42.5 Form and schedule

- Create/edit uses a responsive sheet.
- Subject, type, priority, owner, schedule, direction, links, and participants
  follow approved validation.
- Related records use canonical selectors.
- Participants use canonical user, Contact, or normalized external email.
- Meeting and Demo have exactly one Organizer.
- Timezone is visible.
- Wall time converts to UTC once; no manual `Z` concatenation remains.
- Dirty form navigation is guarded.

### 42.6 Lifecycle and history

- Only the approved state matrix succeeds.
- Every transition increments version once.
- Every transition inserts one immutable history entry.
- Transition and history commit atomically.
- Complete sets server completion time.
- Defer requires reason and new schedule.
- Cancel requires reason.
- Reopen requires reason and new schedule and clears terminal fields.
- The UI never submits a fabricated `SUCCESS` outcome.

### 42.7 Links, participants, and Notes

- Link target is tenant-local, scoped, authorized, and unique.
- Participant principal is tenant-valid or a normalized external email and is
  unique.
- Participant role is valid for Activity type.
- Adding a participant sends no invitation.
- Terminal Activities retain historical links and participants.
- Activity Notes use Activity permissions and scope.
- Note visibility and mutation owner rules are enforced.

### 42.8 Delete

- Delete appears only for an eligible mistaken Planned Activity.
- Dependency and history checks are server-owned.
- Delete uses `If-Match` and a conditional soft delete.
- Ineligible delete explains Cancel.
- No `window.confirm` remains in Activity flows.

### 42.9 UI states and accessibility

- Initial loading uses shape-matched skeletons.
- Background refresh preserves current content.
- First-use empty and filtered-empty are distinct.
- Summary failure does not show false zero counts.
- No fallback business record renders on empty or error.
- All actions are keyboard-operable.
- Focus is managed across sheets, menus, and dialogs.
- Async feedback is announced.
- Color is not the only status or overdue signal.
- Runtime copy is English only.
- Activity visuals come from `@/config/crmStatusConfig`.

## 43. Future implementation verification matrix

This section defines evidence expected from a later implementation. No test,
build, browser, API, or runtime verification is executed as part of this
spec-only task.

Repository policy requires new explicit user authorization before any later
test, build, browser, API, or manual runtime command is run.

### 43.1 Static checks

- TypeScript typecheck.
- ESLint with zero warnings.
- English-only verification.
- Production build.
- Search for `PENDING`, `MEDIUM`, `Alex Nguyen`, Vietnamese fallbacks, fake
  Account/Contact labels, default version `1`, and fabricated `SUCCESS`.
- Search for manual `T...Z` Activity datetime concatenation.
- Search for local Activity badge color maps.
- Search for `any` in the Activity API boundary.
- Search for `window.confirm` in Activity flows.

### 43.2 Frontend behavior checks

- URL parse, normalization, and round trip.
- Agenda/List preservation across navigation.
- Queue-summary independent loading and failure.
- Server query serialization for every filter and sort.
- Correct timezone conversion including DST edge cases.
- Shape-matched loading and background refresh.
- First-use, filtered, read-only, and error empty states.
- Type-specific form rules.
- Real owner, link, and participant selectors.
- Unsaved-change guard.
- Permission-gated actions.
- Transition dialogs and conflict reconciliation.
- Independent detail-tab failure and retry.
- No-invitation participant notice.
- Delete eligibility response handling.

### 43.3 Backend contract checks

- Activity permission and OWN/TEAM/TEAM_TREE/TENANT scope.
- Team-manager visibility of user-owned team Activities.
- Owner assignment scope.
- Queue boundary calculation in multiple timezones.
- Search, related filter, stable sort, and pagination.
- Queue-summary consistency with result queries.
- Create transaction rollback across core, links, and participants.
- Every state-machine edge and rejected edge.
- Completion, defer, cancel, resume, and reopen invariants.
- Atomic conditional update and stale-version rejection.
- Status-history atomicity and immutability.
- Link target authorization and uniqueness.
- Participant principal, role, Organizer, and uniqueness constraints.
- Activity-targeted Note permission, scope, visibility, and ownership.
- Delete dependency checks and conditional soft delete.
- API error and HTTP status mapping.

### 43.4 Database checks

- Owner check constraint.
- Completion check constraint.
- Migration exception report has zero unresolved rows before activation.
- Link generated key uniqueness.
- Participant normalized key uniqueness.
- Status-history foreign keys and indexes.
- Scoped queue/search query plans use intended indexes.
- No update path uses Activity upsert.

### 43.5 Viewports and accessibility checks

Future browser verification covers:

- Wide desktop.
- Standard laptop.
- Tablet around project breakpoints.
- Narrow mobile with safe areas.
- Keyboard-only use.
- Screen-reader names, tab semantics, form errors, and live announcements.
- Focus return after sheet/dialog/menu close.
- Reduced-motion preference.
- Long subject, description, entity name, and external email values.
- Empty and restricted related-record values.
- Console and network errors.

## 44. Release gates and deferred surfaces

### 44.1 Data-scope gate

The production workspace must not ship until Activity detail, search, queue
summary, update, transition, link, participant, and delete all apply the
dedicated Activity scope predicate.

### 44.2 Concurrency gate

The workspace must not ship while repository update or delete relies on an
in-memory version check followed by an unconditional write or upsert.

### 44.3 Contract gate

The workspace must not ship while:

- Frontend accepts `PENDING` or `MEDIUM`.
- Adapter fabricates business values.
- Owner, date, or related filters are declared but not serialized.
- Local wall time is converted by appending `Z`.
- Response request-merging can hide persisted state.

### 44.4 Links and participants gate

Related records and participant UI appears only after:

- Scoped endpoints exist.
- Target and principal uniqueness are enforced.
- Parent version increments atomically.
- Exact response typing exists.

Until then, the UI does not render free-text substitutes.

### 44.5 Notes gate

Notes appears only after Activity-target-aware Note authorization and
visibility rules are implemented. It must not inherit Account-only
authorization.

### 44.6 Timeline gate

The generic timeline widget remains excluded until it:

- Removes all fallback events.
- Resolves target-specific permissions.
- Joins Activities through real Activity links.
- Applies data scope.
- Stops swallowing SQL failures.
- Returns an exact documented response.

Activity detail does not block on that separate subsystem.

### 44.7 Calendar, recurrence, and reminders

Month/week calendar, recurrence execution, reminders, and external calendar
synchronization remain deferred. A future design must define:

- Recurring series and instance identity.
- Edit-this versus edit-series behavior.
- Scheduler ownership and retry.
- Reminder delivery state.
- Invitation state.
- External event conflict and reconciliation.
- OAuth, revocation, and tenant security.

An opaque `recurrenceRule` string is not sufficient to ship those features.

### 44.8 Outcomes and invitations

Type-aware outcome selection remains deferred until a governed catalogue or
documented enum exists. Participant invitations remain deferred until a
delivery command, message status, failure model, and permission contract
exist.

## 45. Rejected approaches

### 45.1 List hardening only

Correcting the current table and form without Agenda, detail, links,
participants, or lifecycle hardening would leave Activities as a CRUD screen
and require another structural rewrite.

It does not satisfy the approved operations goal.

### 45.2 Full scheduling suite

Adding month/week calendar, recurrence, reminders, invitations, and external
calendar synchronization in the first release is rejected because the
required scheduler and integration contracts do not exist.

### 45.3 Client compatibility normalizer

Retaining aliases and filling missing server fields with plausible defaults is
rejected. It hides integration failure and produces false business records.

### 45.4 Status select in edit form

Allowing arbitrary status in general update is rejected because it cannot
guarantee completion, reason, schedule, history, and transition invariants.

### 45.5 Client-side queue counts

Deriving work-queue totals from a loaded page is rejected. Counts must use the
same server scope and queue semantics as result queries.

### 45.6 Generic timeline as Activity detail

Using the current timeline widget as the Activity history is rejected because
it fabricates empty content, applies Account permission, and does not query
Activity links correctly.

### 45.7 Delete as normal row action

Unrestricted delete is rejected because Activity history, participants,
relationships, and Notes are operational records. Cancel preserves business
history.

## 46. Design completeness statement

This specification intentionally resolves the production decisions needed for
the approved Activity Operations Workspace:

- Product scope and exclusions.
- Current frontend and backend audit.
- Canonical enums and invariants.
- Routes and URL state.
- Queue semantics and server counts.
- Permissions and Activity-specific data scope.
- Owner assignment scope.
- Target and participant authorization.
- List and Agenda behavior.
- Detail and tab isolation.
- Type-aware create/edit behavior.
- Timezone conversion.
- Create and general-update contracts.
- Lifecycle state machine and transition API.
- Immutable status history.
- Related-record links.
- Participants and no-invitation behavior.
- Activity-scoped Notes.
- Delete eligibility.
- Atomic optimistic concurrency.
- Schema migration and uniqueness rules.
- Error mapping.
- Frontend component, query, and cache boundaries.
- Loading, refresh, empty, failure, responsive, accessibility, visual, and
  copy requirements.
- Backend and API-reference synchronization requirements.
- Acceptance criteria, future verification evidence, and release gates.

It contains no implementation claim, task breakdown, commit sequence,
placeholder requirement, or fabricated product behavior.
