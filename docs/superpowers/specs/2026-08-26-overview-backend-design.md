# Overview Backend Design — `/app/overview`

Status: implemented 2026-08-26.

## Placement

New read-only bounded context `com.crm.overview`, following the shape of
`com.crm.sales.forecast`. It owns no domain: it composes existing reads and
adds three queries nothing else answers.

```
com.crm.overview
├── application/dto/         13 records, one per block plus the envelope
├── application/service/     OverviewService, OverviewAccessResolver
├── infrastructure/persistence/  OverviewReadRepository + 3 result records
└── presentation/web/        OverviewController
```

## API

One endpoint, `GET /api/overview?period=THIS_MONTH|THIS_QUARTER|THIS_YEAR`,
reusing `ForecastPeriodPreset` rather than introducing a second period
vocabulary. Full contract in `docs/api-reference.md`, section
"Overview Dashboard API".

Six blocks, each independently nullable. `null` means the caller lacks the
permission or the data scope; an empty collection inside a present block means
the caller may see the data and there is none. The two must be rendered
differently.

## Block Sources

| Block | Source |
|---|---|
| `revenue` | `OverviewReadRepository.closedWon` twice (selected and previous window) plus `SalesForecastService.getSummary` for pipeline and weighted figures |
| `funnel` | `SalesForecastService.getBreakdown(STAGE)` |
| `leaderboard` | `SalesForecastService.getBreakdown(OWNER)` |
| `topOpportunities` | new query |
| `customerBase` | new query |
| `myDay` | two new queries (exact counts, then a capped list) |

Closed-won is computed by the overview for both windows rather than taken from
the forecast for the current one, so the delta compares two figures produced by
one definition instead of two definitions that merely look alike.

## Decisions

**Per-block permission gating without exceptions.** `TenantAccessAuthorizer`
offers `hasPermission` (boolean) and `authorize` (throws when the actor holds
the permission but has no data scope). Both outcomes mean "omit this block", so
`OverviewAccessResolver` collapses them into `Optional.empty()` in one place.
`OverviewService` contains no exception handling.

**Leaderboard omitted at `OWN` scope.** A ranking containing only the reader
ranks nothing.

**Single currency.** The platform stores no exchange rates. Every figure is in
the tenant's `default_currency_code`. Ranking opportunities by amount across
currencies would order the list by the size of the currency unit.

**No sales-cycle velocity, no quota attainment.** Velocity needs a definition
of when a cycle starts that the business has not fixed, and there is no quota
table in the schema. `SalesRepPerformanceDto.targetQuota` is aspirational dead
code. Inventing either would produce a number that is wrong in a way nobody
could detect.

**Day boundaries computed in Java.** The project ships MySQL and PostgreSQL
schemas. `DATE()` and `DATE_TRUNC` would require dialect branching, so the
service converts the tenant-local day into two `Instant` parameters and the SQL
stays dialect-neutral.

**`AccountScopeSql` promoted and renamed.** It carried no account knowledge —
it only generates predicates over `owner_user_id` and a team column. Moved to
`com.crm.foundation.persistence.OwnershipScopeSql`, with a `predicate(alias,
teamColumn)` overload because `crm_activities` names its team column
`assigned_team_id` rather than `owner_team_id`. The one-argument overload keeps
all 47 existing call sites unchanged. The recursive CTE has a fixed name, so a
single statement may carry at most one scope.

## Prerequisite Fixes

The overview composes over `SalesForecastService`, which did not execute against
the configured MySQL datasource. Fixed as part of this work:

1. `crm_pipeline_stages` and `crm_pipelines` have no `deleted_at` column in
   either dialect. Eleven predicates filtered on it — nine in
   `SalesForecastReadRepository`, two in `JdbcOpportunityRepository`.
2. `SalesForecastService` read `FROM platform.tenants`; the MySQL table is
   `platform_tenants`. A `catch (Exception)` swallowed the failure, so the
   tenant timezone was silently never honoured and every period was computed in
   UTC. Narrowed to `DataAccessException` with a WARN log.
3. The owner breakdown joined `platform.users` and `platform.teams`, same fault.
4. The breakdown cast identifier columns with `(UUID) row.get(...)`. MySQL
   returns `CHAR(36)` as `String`, so this threw `ClassCastException`. Replaced
   with a `toUuid` helper tolerant of both representations.

## Known Issues Left Untouched

- **Activity data-scope leak.** `JdbcActivityRepository` resolves an
  `OwnershipScopeSql` and emits its CTE and parameters but never calls
  `predicate(...)`, so activity reads are not restricted by ownership at all.
  An actor with `OWN` scope can read every activity in the tenant. Not fixed
  here because it is outside the overview and warrants its own change.
- **Fourteen further schema-qualified table references** (`platform.users`,
  `platform.teams`) remain in `JdbcNoteRepository`, `JdbcCampaignRepository`,
  `JdbcTeamRepository`, `JdbcRoleDataScopeRepository`, `JdbcTicketRepository`,
  `JdbcTicketCategoryRepository`. They fail under the configured MySQL
  datasource for the same reason as item 2 above.
- **`docs/api-reference.md` documents the forecast summary response with the
  shape of `SalesForecastSummary`**, a record nothing constructs. The endpoint
  actually returns `SalesForecastSummaryResponse` with `currencyGroups`.
