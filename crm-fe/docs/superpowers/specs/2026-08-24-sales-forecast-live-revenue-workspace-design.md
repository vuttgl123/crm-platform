# Sales Forecast Live Revenue Workspace Design Specification

**Date:** 2026-08-24

**Status:** Design approved in conversation

**Product surface:** crm-fe Sales Forecast workspace, server-side forecast
aggregation, owner and stage breakdowns, and Opportunity drill-down

**Runtime language:** English only

**Implementation status:** Design only. This document does not claim that any
proposed backend, database, API, or frontend change is implemented.

## 1. Relationship to existing requirements

This specification defines the production target for the existing route:

- /app/sales/forecast

The approved target is a **Live Revenue Forecast Workspace** with:

- On-demand server-side aggregation from real Opportunities.
- Forecast categories sourced from configured Pipeline Stages.
- Calendar month, quarter, and year periods resolved by the backend.
- Strict tenant, permission, and Opportunity data-scope enforcement.
- Currency-separated totals with no implicit exchange-rate conversion.
- URL-backed Pipeline, Owner or Team, Currency, period, category, dimension,
  and pagination context.
- A compact forecast ledger rather than a row of decorative KPI cards.
- Owner and Stage breakdowns backed by stable IDs and server pagination.
- Opportunity drill-down that uses exactly the same forecast semantics as the
  aggregate.
- Explicit data-quality visibility for omitted, unscheduled, contradictory,
  and unassigned records.
- Complete loading, refreshing, empty, partial-error, fatal-error, forbidden,
  invalid-filter, and stale-data behavior.

This is a design specification, not an implementation plan. It intentionally
does not assign tasks, prescribe a commit sequence, or modify product code.

Repository rules continue to apply:

- No Git commit, staging, push, or pull request is part of this work.
- No test, build, browser, API, application-start, or manual runtime command is
  part of this work.
- Any later API addition, modification, or removal must update the repository
  root docs/api-reference.md in the same implementation task.
- Existing user-owned changes in the worktree must be preserved.
- All runtime UI copy must be English.
- CRM status and category presentation must be centralized in
  @/config/crmStatusConfig.

## 2. Executive decision

Sales Forecast becomes a trustworthy revenue-analysis workspace rather than a
quota dashboard backed by fallback demo values.

The approved release consists of:

1. A live, read-only Revenue Forecast workspace.
2. Server-side summary aggregation.
3. Single-category forecast rollups for CLOSED, COMMIT, BEST_CASE, PIPELINE,
   and OMITTED.
4. A separate probability-weighted forecast amount.
5. Strict separation of currency groups.
6. A server-paginated Owner or Team breakdown.
7. A server-paginated Stage breakdown.
8. Opportunity drill-down through an extended Opportunity Search contract.
9. Data-quality metrics for UNSCHEDULED, STATUS_STAGE_CONFLICT, and
   MISSING_OWNER records.
10. URL-backed filters and selection state.
11. Permission and Opportunity data-scope parity between aggregate and
    drill-down.
12. Accessible chart alternatives and responsive table-to-list behavior.

The following capabilities are excluded until separate subsystems exist:

- Sales quotas.
- Quota attainment.
- Representative ranking or leaderboard presentation.
- Forecast submission.
- Forecast locking.
- Forecast snapshots.
- Historical forecast-change analysis.
- Manager or seller adjustments.
- Override-specific permissions.
- Sales hierarchy rollups beyond the existing Opportunity owner and team
  scope model.
- Territory forecasts.
- Product-family forecasts.
- Exchange-rate conversion.
- Corporate-currency normalization.
- AI predictions.
- Predictive confidence labels.
- Commit recommendations.
- Compensation, commission, or employee-performance decisions.
- Scheduled report delivery.
- Export.

The decision prioritizes numerical integrity and explainability over a broad
forecasting suite whose supporting quota, hierarchy, snapshot, and exchange
rate models do not exist in the repository.

## 3. Approved architectural approach

The approved architecture is an on-demand, server-side live rollup.

The request flow is:

~~~text
URL-backed filters
  -> typed frontend query
  -> Forecast HTTP endpoint
  -> tenant and actor resolution
  -> crm_opportunity.read authorization
  -> OPPORTUNITY data-scope resolution
  -> scoped aggregate query
  -> typed decimal-string response
  -> forecast workspace
~~~

This approach was selected over:

- Client-side aggregation, which cannot remain correct under pagination,
  permission scope, or multiple currencies.
- A forecast snapshot subsystem, which would require period lifecycle,
  scheduler, backfill, locking, audit, and adjustment semantics beyond this
  release.

The response contract is designed so a future snapshot source can implement
the same read model without changing the frontend presentation contract.

## 4. Current-state audit

### 4.1 Active frontend entry points

The active frontend surface consists of:

- src/features/sales/forecast/SalesForecastPage.tsx
- src/services/api/forecastApi.ts
- The /app/sales/forecast route in src/routes/AppRoutes.tsx
- The Sales Forecast item in src/config/navigationConfig.ts
- Shared Pipeline Stage contracts in src/services/api/pipelineApi.ts
- Shared Opportunity contracts in src/services/api/opportunityApi.ts

The route is shown in navigation when the actor has
crm_opportunity.read. The route element itself does not provide a Forecast-
specific permission boundary.

### 4.2 Current page responsibilities

SalesForecastPage.tsx currently combines:

- Period state.
- Manual effect-based fetching.
- Error toasts.
- Revenue fallback calculations.
- Quota fallback calculations.
- Currency formatting.
- Forecast-category presentation.
- Progress visualization.
- Win-rate presentation.
- Representative leaderboard rendering.
- Refresh behavior.

The page has no separation between domain contract, URL state, query
coordination, display formatting, accessible chart behavior, and page states.

### 4.3 Frontend fabrication

The current frontend fabricates or substitutes business values:

- Missing weighted forecast is recomputed from hardcoded category multipliers.
- Missing quota becomes 1,200,000,000.
- Missing win rate becomes 75 percent.
- Missing deal count becomes 18.
- Missing representative data becomes a displayed count of 3.
- Every amount is formatted as VND.
- Every value is displayed in millions regardless of currency magnitude.
- The quarter label is hardcoded to Q3.
- The year label claims a fiscal year without a persisted fiscal-calendar
  contract.

The use of logical OR also replaces legitimate zero values with fallback
values. A valid zero cannot be distinguished from an absent field.

### 4.4 Loading and failure behavior

The current page:

- Displays revenue and quota fallbacks while the first request is loading.
- Does not render shape-matched skeletons.
- Reports load failure only through a transient toast.
- Can retain stale summary data without identifying it as stale.
- Has no page-level retry state.
- Has no independent breakdown error boundary.
- Has no first-use or filtered-empty state.
- Has no forbidden or invalid-filter state.

### 4.5 Current visual and interaction debt

The current page:

- Uses five independent KPI cards of equal visual weight.
- Gives quota and leaderboard surfaces prominence despite their fabricated
  source.
- Encodes forecast categories heavily through color.
- Uses progress tracks without a semantic progress contract.
- Uses transition-all.
- Does not provide a persistent accessible table alternative for the visual
  composition.
- Does not store period or selection context in the URL.
- Does not make category totals navigable to the underlying Opportunities.
- Does not provide a compact mobile alternative to the wide leaderboard
  table.
- Uses an unlabeled period Select.
- Uses array index as the representative row key.

### 4.6 Active backend entry points

The implemented backend surface consists of:

- com.crm.sales.forecast.presentation.web.SalesForecastController
- com.crm.sales.forecast.application.service.SalesForecastService
- com.crm.sales.forecast.application.dto.SalesForecastSummary
- com.crm.sales.forecast.application.dto.SalesRepPerformanceDto

The controller exposes:

~~~http
GET /api/sales/forecast?period={value}
~~~

The period value is accepted as an arbitrary String. Unknown values do not
produce a validation error.

### 4.7 Current backend query failure

SalesForecastService queries these columns:

- amount
- probability
- stage
- status
- assigned_to

The canonical crm_opportunities table does not contain stage or assigned_to.
It stores:

- current_stage_id
- owner_user_id
- owner_team_id

The current query therefore does not match the repository schema.

### 4.8 Suppressed query errors

The service catches every Exception and replaces the failed query with a
fixed demo dataset.

The fallback includes:

- Fixed Closed Won, Commit, Best Case, and Pipeline amounts.
- Fixed deal counts.
- Fixed won and lost counts.
- Fixed monthly, quarterly, and yearly quotas.
- Three fixed personal names.
- Fixed individual quota-attainment values.
- Fixed won and lost counts per representative.

This behavior makes a production query failure look like a successful
business forecast. It is a release-blocking integrity failure.

### 4.9 Period semantics are not implemented

The current service reads every Opportunity in the tenant and never filters
by:

- expected_close_date
- actual_close_date
- calendar month
- calendar quarter
- calendar year
- tenant timezone

The period parameter only changes a hardcoded quota value.

### 4.10 Forecast-category drift

The canonical schema stores forecast_category on crm_pipeline_stages with:

- OMITTED
- PIPELINE
- BEST_CASE
- COMMIT
- CLOSED

The current Forecast service does not join Pipeline Stages. It infers
category from probability thresholds and hardcoded stage names such as
NEGOTIATION and PROPOSAL.

Custom pipelines, custom stages, and tenant-specific category mapping are
therefore ignored.

### 4.11 Security and data-scope gap

The current service:

- Allows either crm_opportunity.read or sales_order.read.
- Does not call authorize with the OPPORTUNITY entity type.
- Does not resolve AuthorizedDataAccess.
- Injects CurrentActor but does not use it.
- Filters by tenant only.

A user with Order read but no Opportunity read can call the endpoint. A user
with OWN or TEAM scope can receive tenant-wide totals. Aggregate counts and
amounts therefore disclose data outside the actor's authorized Opportunity
scope.

### 4.12 Currency integrity gap

The canonical Opportunity stores:

- amount as DECIMAL(20,6)
- currency_code as an ISO-style three-character code

The current service:

- Does not select currency_code.
- Converts money to double.
- Adds all amounts into one total.
- Returns no currency metadata.

The current response can add VND, USD, EUR, and other currencies into a
meaningless number.

### 4.13 Record-integrity gaps

The current query does not filter:

- deleted_at IS NULL
- current Pipeline Stage category
- current Pipeline Stage forecast category
- expected or actual close date
- owner data scope

It also counts every row as a pipeline deal, including lost and cancelled
records.

### 4.14 API-reference mismatch with production truth

docs/api-reference.md documents the current demo-shaped response as an
implemented Revenue Forecast API.

The documented fields include quota and representative performance even
though no quota data model exists.

A future implementation of this specification must replace that section with
the implemented production contract. This spec-only task does not change the
API reference because proposed behavior must not be documented as already
implemented.

### 4.15 Useful existing foundations

The repository already provides:

- Tenant currency and timezone fields.
- Opportunity amount and currency.
- Opportunity probability.
- Expected close date.
- Actual close date.
- Opportunity status.
- Pipeline and current Stage IDs.
- User and Team ownership.
- Pipeline Stage category.
- Pipeline Stage forecast category.
- Opportunity data-scope infrastructure.
- Opportunity search and detail routes.
- TanStack Query.
- Recharts.
- URL-backed state patterns in other CRM features.
- Central CRM status configuration.

No new forecast fact table is required for the approved live v1.

## 5. Goals

The design must:

1. Make every displayed amount traceable to real, authorized Opportunities.
2. Make Pipeline Stage configuration the source of forecast category.
3. Apply one period definition consistently across summary, breakdown, and
   drill-down.
4. Keep different currencies separate.
5. Use decimal-safe money values.
6. Make scope-restricted aggregate results match scope-restricted detail
   results.
7. Preserve forecast context in the URL.
8. Make every category total explainable through Opportunity drill-down.
9. Expose material data-quality exclusions.
10. Remove all demo fallback behavior.
11. Remove all quota and ranking claims until those domains exist.
12. Provide a focused B2B revenue workspace with restrained visual hierarchy.
13. Provide complete loading, refreshing, empty, error, forbidden, stale, and
    invalid-filter states.
14. Remain keyboard accessible and screen-reader understandable.
15. Preserve the existing React, TypeScript, Vite, Tailwind CSS, shadcn/Radix,
    TanStack Query, React Router, Recharts, and Java/Spring stack.
16. Avoid adding a frontend or backend library.
17. Use English-only runtime copy.
18. Keep Forecast Category presentation centralized.

## 6. Non-goals

This specification does not design or promise:

- Quota configuration.
- Quota assignment.
- Quota attainment.
- Sales compensation.
- Commission calculation.
- Representative ranking.
- Employee scoring.
- Manager adjustments.
- Seller adjustments.
- Forecast submissions.
- Forecast approval.
- Forecast locking.
- Forecast snapshots.
- Historical forecast trend.
- Pipeline-change history.
- Moved-in or moved-out analysis.
- Year-over-year comparison.
- AI prediction.
- Machine-learning win probability.
- Risk scoring.
- Next-best action.
- Territory forecasts.
- Product-family forecasts.
- Opportunity splits.
- Multi-level organizational forecast hierarchy.
- Exchange-rate tables.
- Currency conversion.
- Corporate-currency reporting.
- Custom forecast formulas.
- Custom fiscal calendars.
- Export.
- Scheduled reports.
- Notification delivery.
- Forecast write permissions.
- A new design-system package.
- An implementation plan.

## 7. Design posture

The workspace follows these principles:

- Numerical truth precedes visual richness.
- Aggregate and drill-down must use the same predicates.
- A failed query is an error, not an opportunity to show demo data.
- A missing value remains missing.
- Zero remains zero.
- Server projections are the business source of truth.
- The client formats but does not calculate revenue.
- Forecast Category is configuration, not a probability threshold.
- Probability affects only the Weighted Forecast metric.
- Single-category amounts are shown without implicit cumulative math.
- Currency context is explicit on every monetary surface.
- Read access never implies write access.
- A restricted result is not a tenant-wide result with hidden rows.
- Data-quality exclusions remain visible.
- Charts supplement exact values rather than replace them.
- Operational information uses one composed surface before card decoration.
- Filters and selections are deep-linkable.
- First-use empty, filtered empty, restricted, failed, and stale are different
  states.

## 8. Sources of truth

### 8.1 Opportunity source

Forecast revenue comes only from canonical rows in crm_opportunities joined to
their current Pipeline and current Pipeline Stage.

The following sources are prohibited:

- Runtime mock Opportunity data.
- Demo Forecast records.
- Client fallback amounts.
- Client fallback counts.
- Fixed people.
- Fixed quotas.
- Fixed win rates.
- Probability-derived category names.
- Hardcoded Stage aliases.
- Merging different currencies.

### 8.2 Pipeline Stage source

The current Stage supplies:

- stage_category
- forecast_category
- default_probability for configuration display only

The Opportunity supplies its persisted probability. The Forecast service
does not substitute Stage default probability for a missing Opportunity
probability. Probability is non-null in the canonical schema.

### 8.3 Tenant context

The selected tenant supplies:

- tenant ID
- default currency code
- default timezone

Tenant default currency controls initial presentation preference only. It does
not convert or absorb other currencies.

### 8.4 Actor and scope

The current actor and AuthorizedDataAccess supply:

- actor ID
- crm_opportunity.read permission
- OWN scope
- TEAM scope
- TEAM_TREE scope
- TENANT scope

The data-scope predicate is part of every summary, breakdown, filter-option,
and drill-down query.

## 9. Canonical vocabulary

### 9.1 Period preset

~~~ts
type ForecastPeriodPreset =
  | 'THIS_MONTH'
  | 'THIS_QUARTER'
  | 'THIS_YEAR';
~~~

These are calendar periods, not fiscal periods.

### 9.2 Forecast category

~~~ts
type ForecastCategory =
  | 'OMITTED'
  | 'PIPELINE'
  | 'BEST_CASE'
  | 'COMMIT'
  | 'CLOSED';
~~~

Labels are:

| Code | Runtime label |
|---|---|
| CLOSED | Closed Won |
| COMMIT | Commit |
| BEST_CASE | Best Case |
| PIPELINE | Pipeline |
| OMITTED | Omitted |

### 9.3 Breakdown dimension

~~~ts
type ForecastBreakdownDimension = 'OWNER' | 'STAGE';
~~~

OWNER includes USER, TEAM, and UNASSIGNED rows. It does not imply a reporting
hierarchy.

### 9.4 Data-quality code

~~~ts
type ForecastQualityCode =
  | 'UNSCHEDULED'
  | 'STATUS_STAGE_CONFLICT'
  | 'MISSING_OWNER';
~~~

### 9.5 Owner filter

~~~ts
type ForecastOwnerType = 'USER' | 'TEAM';

interface ForecastOwnerFilter {
  ownerType: ForecastOwnerType;
  ownerId: string;
}
~~~

ownerType and ownerId form one atomic filter. Neither is valid alone.

### 9.6 Money boundary

~~~ts
interface ForecastAmount {
  amount: string;
  currencyCode: string;
}
~~~

amount is a base-10 plain decimal string:

- No scientific notation.
- No locale separator.
- No currency symbol.
- Up to the database-supported six fractional digits.
- No client conversion to JavaScript number for calculation.

## 10. Forecast period semantics

### 10.1 Resolver

ForecastPeriodResolver resolves a preset from:

- The backend TimeProvider.
- The selected tenant's persisted IANA timezone.
- UTC only when the persisted tenant timezone is unavailable through a
  documented compatibility fallback.

The browser timezone is not used to define the business period.

### 10.2 Calendar month

THIS_MONTH resolves to:

- fromDate: first calendar date of the current tenant-local month.
- toDate: final calendar date of the current tenant-local month.

Both date boundaries are inclusive.

### 10.3 Calendar quarter

THIS_QUARTER resolves to one of:

- January 1 through March 31.
- April 1 through June 30.
- July 1 through September 30.
- October 1 through December 31.

The quarter is derived from the current tenant-local business date.

### 10.4 Calendar year

THIS_YEAR resolves from January 1 through December 31 of the current
tenant-local year.

The UI label is This Year. The label Full Fiscal Year is removed.

### 10.5 Response context

Every Forecast response echoes:

- preset
- fromDate
- toDate
- timezone
- asOf

asOf is the backend read time as an ISO-8601 UTC Instant.

### 10.6 Navigation stability

Opportunity drill-down uses the resolved fromDate and toDate returned by the
Forecast response. It does not recalculate the period in the browser.

This keeps a deep link stable if the current business period changes after
the summary was loaded.

## 11. Record eligibility

### 11.1 Common predicates

Every aggregate candidate must satisfy:

- o.tenant_id equals the selected tenant.
- o.deleted_at IS NULL.
- The Opportunity is inside the actor's OPPORTUNITY data scope.
- Optional Pipeline filter.
- Optional Owner filter.
- Optional Currency filter.

### 11.2 Open forecast candidate

An open Opportunity contributes to a normal category when:

- status is OPEN.
- current Pipeline Stage stage_category is OPEN.
- current Pipeline Stage forecast_category is PIPELINE, BEST_CASE, COMMIT, or
  OMITTED.
- expected_close_date is within the selected inclusive period.
- Currency is valid.

### 11.3 Closed Won candidate

An Opportunity contributes to CLOSED when:

- status is WON.
- current Pipeline Stage stage_category is WON.
- current Pipeline Stage forecast_category is CLOSED.
- actual_close_date is within the selected inclusive period.
- Currency is valid.

### 11.4 Lost candidate

LOST Opportunities:

- Do not contribute to forecast revenue.
- Do not contribute to category totals.
- Do not contribute to Weighted Forecast.
- Are not displayed as CLOSED.

### 11.5 Cancelled candidate

CANCELLED Opportunities:

- Do not contribute to forecast revenue.
- Do not contribute to category totals.
- Do not contribute to Weighted Forecast.

### 11.6 Deleted candidate

Soft-deleted Opportunities never contribute to:

- Summary.
- Breakdown.
- Filter options.
- Data-quality counts.
- Opportunity drill-down.

## 12. Category rules

### 12.1 Single-category rollup

Each eligible Opportunity contributes to exactly one category amount.

The release uses a single-category rollup:

- CLOSED contains only Closed Won.
- COMMIT contains only Commit.
- BEST_CASE contains only Best Case.
- PIPELINE contains only Pipeline.
- OMITTED contains only Omitted.

The UI does not label CLOSED plus COMMIT as Commit Forecast. It does not label
CLOSED plus COMMIT plus BEST_CASE as Best Case Forecast.

### 12.2 Omitted behavior

OMITTED:

- Is shown for audit visibility.
- Has amount and Opportunity count.
- Does not contribute to openPipelineAmount.
- Does not contribute to weightedForecastAmount.
- Uses expected_close_date for period inclusion.

### 12.3 Category consistency

Probability never changes category.

The following are prohibited:

- probability greater than or equal to 80 implies COMMIT.
- probability from 50 through 79 implies BEST_CASE.
- probability below 50 implies PIPELINE.
- Stage name NEGOTIATION implies COMMIT.
- Stage name PROPOSAL implies BEST_CASE.

### 12.4 Terminal consistency

A WON Opportunity must use:

- stage_category WON
- forecast_category CLOSED

An OPEN Opportunity must use:

- stage_category OPEN
- forecast_category PIPELINE, BEST_CASE, COMMIT, or OMITTED

Contradictions are handled as data-quality issues and never silently assigned
to a plausible category.

## 13. Forecast calculations

### 13.1 Category amount

For a category C and currency K:

~~~text
categoryAmount(C, K)
  = SUM(opportunity.amount)
    for eligible Opportunities
    with currency K
    and category C
~~~

### 13.2 Category count

~~~text
categoryOpportunityCount(C, K)
  = COUNT(eligible Opportunities)
    with currency K
    and category C
~~~

### 13.3 Open pipeline amount

~~~text
openPipelineAmount(K)
  = PIPELINE amount
  + BEST_CASE amount
  + COMMIT amount
~~~

CLOSED and OMITTED are excluded.

### 13.4 Weighted open amount

For each eligible open, non-omitted Opportunity:

~~~text
weightedOpenAmount
  = amount * probability / 100
~~~

The calculation uses BigDecimal. The result is rounded to six decimal places
with HALF_UP only at the defined aggregate boundary.

### 13.5 Weighted forecast

~~~text
weightedForecastAmount(K)
  = CLOSED amount
  + SUM(weightedOpenAmount)
    for PIPELINE, BEST_CASE, and COMMIT
~~~

OMITTED, LOST, CANCELLED, deleted, unscheduled, and contradictory records are
excluded.

### 13.6 Zero behavior

A true zero remains:

~~~json
{
  "amount": "0",
  "currencyCode": "VND"
}
~~~

The client does not replace zero with a fallback.

### 13.7 Count type

Counts are non-negative integer values. Backend aggregation uses a type that
does not truncate SQL COUNT results.

## 14. Currency rules

### 14.1 No cross-currency total

Amounts with different currency codes are never added.

The API does not return:

- grandTotalAmount without a currency.
- tenantConvertedAmount.
- exchangeRate.
- corporateCurrencyAmount.

### 14.2 Currency groups

When currencyCode is absent, summary returns one currency group for every
currency present in eligible or quality data.

Ordering is:

1. Tenant default currency when present.
2. Remaining currency codes in ascending code order.

### 14.3 Canonical URL currency

When the URL does not contain currency:

1. Frontend requests summary without currencyCode.
2. Frontend selects the first returned currency group.
3. Frontend updates the URL with replace navigation.
4. Breakdown and drill-down use that explicit currency.

If there are no currency groups, the URL remains without currency.

### 14.4 Selected currency

When currencyCode is supplied:

- Summary returns only that currency group.
- Breakdown requires the same currency.
- Drill-down requires the same currency.
- An unavailable but valid currency produces an empty success response, not a
  fabricated zero from another currency.

### 14.5 Presentation

The client formats amount strings with Intl.NumberFormat and the supplied ISO
currency code.

The client may use a compact display in the ledger only when:

- The exact value remains accessible.
- The compact unit is produced by Intl.NumberFormat.
- The user can access the full value without relying only on hover.

## 15. Data-quality rules

### 15.1 Unscheduled

UNSCHEDULED contains open, non-deleted, in-scope Opportunities that:

- Have an OPEN Stage and a normal open forecast category.
- Have expected_close_date null.

Because no period can contain a missing date, UNSCHEDULED intentionally uses
the current Pipeline, Owner, and Currency filters but not the selected date
period.

The API marks its scope as FILTERS_EXCLUDING_PERIOD.

### 15.2 Status and Stage conflict

STATUS_STAGE_CONFLICT includes records such as:

- status OPEN with stage_category WON.
- status OPEN with stage_category LOST.
- status OPEN with forecast_category CLOSED.
- status WON with stage_category not WON.
- status WON with forecast_category not CLOSED.
- status LOST with stage_category not LOST.

Conflicting records are excluded from category and weighted aggregates.

### 15.3 Missing owner

MISSING_OWNER includes in-scope eligible or unscheduled Opportunities with:

- owner_user_id null
- owner_team_id null

The bucket is visible only when no explicit Owner filter is applied.

### 15.4 Quality precedence

One Opportunity is counted once in the primary quality summary.

Precedence is:

1. STATUS_STAGE_CONFLICT
2. UNSCHEDULED
3. MISSING_OWNER

An Opportunity may still appear in the missing-owner diagnostic drill-down
when explicitly requested, but the top-level primary issue count does not
double count it.

### 15.5 Quality amounts

Quality amounts remain grouped by currency.

Quality amounts never contribute to:

- category totals
- openPipelineAmount
- weightedForecastAmount

### 15.6 Quality interaction

Each quality row shows:

- issue label
- affected Opportunity count
- affected amount in selected currency
- scope note when the period is excluded

Quality rows navigate to an Opportunity drill-down only when the implemented
Opportunity Search contract supports the exact documented quality predicate.

## 16. Information architecture

### 16.1 Route

The workspace remains:

- /app/sales/forecast

No detail route is introduced for Forecast itself.

### 16.2 Page order

The page order is:

1. Revenue Forecast header.
2. Forecast context and filter bar.
3. Forecast Ledger.
4. Forecast Composition and Data Quality.
5. Breakdown by Owner or Stage.
6. Opportunity drill-down.

### 16.3 Header

The header uses:

- Title: Revenue Forecast
- Subtitle: Live opportunity rollup for {formatted start date} to
  {formatted end date}
- As-of timestamp.
- Refresh action.

The following copy is removed:

- Revenue Forecasting & Quota Attainment
- Predictive revenue intelligence
- Rep attainment metrics
- High Pipeline Velocity

### 16.4 Filter bar

The filter bar contains:

- Period.
- Pipeline.
- Owner or Team.
- Currency.
- Clear Filters.

Filter controls appear below the page title. They do not compete with the
title in StandardPageHeader actions on narrow layouts.

## 17. URL state

### 17.1 Canonical search parameters

~~~ts
interface SalesForecastSearchParams {
  period: ForecastPeriodPreset;
  pipelineId?: string;
  ownerType?: ForecastOwnerType;
  ownerId?: string;
  currency?: string;
  dimension: ForecastBreakdownDimension;
  category?: ForecastCategory;
  breakdownPage: number;
  breakdownSize: number;
  opportunityPage: number;
  opportunitySize: number;
}
~~~

### 17.2 Defaults

Defaults are:

- period: THIS_MONTH
- dimension: OWNER
- breakdownPage: 0
- breakdownSize: 20
- opportunityPage: 0
- opportunitySize: 20

Default values may be omitted from the canonical URL except period and
currency after currency selection. Serialization rules must be deterministic.

### 17.3 Atomic owner pair

ownerType without ownerId is invalid.

ownerId without ownerType is invalid.

The parser removes the incomplete pair and records a client-visible
normalization reason. It does not send a speculative request.

### 17.4 Filter change reset

Changing period, Pipeline, Owner, Team, or Currency resets:

- breakdownPage to 0
- opportunityPage to 0
- category selection only when the selected category becomes unavailable

Changing dimension resets breakdownPage only.

Changing category resets opportunityPage only.

### 17.5 Back and forward navigation

Browser Back and Forward restore:

- Period.
- Pipeline.
- Owner or Team.
- Currency.
- Breakdown dimension.
- Selected category.
- Breakdown page.
- Opportunity page.

The page does not mirror URL state into a second independent state object.

### 17.6 Invalid enum

An invalid period, dimension, category, ownerType, currency format, negative
page, or unsupported size is normalized before request.

The URL is replaced with its canonical form. The page announces that invalid
filters were reset.

### 17.7 Invalid ID

A syntactically valid but unknown or unauthorized Pipeline or Owner ID cannot
be normalized by the client. The backend returns the documented not-found
contract. The page offers Reset Filters.

## 18. Forecast Ledger

### 18.1 Structure

The Forecast Ledger is one composed surface rather than five detached cards.

It contains:

- Weighted Forecast as the primary value.
- Closed Won.
- Commit.
- Best Case.
- Pipeline.
- Open Opportunity count.

Omitted appears in Data Quality and category audit context, not as a primary
revenue promise.

### 18.2 Hierarchy

Weighted Forecast receives the strongest typographic hierarchy.

Category values use:

- Consistent label placement.
- Tabular figures.
- Exact currency context.
- Dividers rather than separate shadows.

### 18.3 Interaction

CLOSED, COMMIT, BEST_CASE, and PIPELINE are buttons or links.

Activating a category:

- Writes category to the URL.
- Resets opportunityPage.
- Filters the drill-down.
- Moves focus to the drill-down heading only when the activation explicitly
  requests navigation.

Weighted Forecast is not a category and is not presented as a category
filter.

### 18.4 Counts

Each category can show Opportunity count alongside amount.

Counts come from the summary response. They are never calculated from the
loaded drill-down page.

## 19. Forecast Composition

### 19.1 Purpose

Forecast Composition explains how the selected currency is distributed across
the approved single categories.

### 19.2 Visual

The panel uses Recharts already present in the repository.

The chart:

- Shows CLOSED, COMMIT, BEST_CASE, and PIPELINE.
- Keeps category order stable.
- Uses exact response values.
- Does not infer cumulative totals.
- Does not use 3D effects.
- Does not animate continuously.

### 19.3 Accessible alternative

The panel always includes an exact-value table or structured textual summary
in the document.

The accessible representation includes:

- Category label.
- Amount.
- Currency.
- Opportunity count.
- Percentage of the non-omitted displayed category amount when the
  denominator is greater than zero.

The percentage is presentation-only and may be calculated from amounts in
the same selected currency. It is not persisted or returned as business
truth.

### 19.4 Empty composition

When every normal category amount is zero:

- The chart is replaced by a composed zero state.
- The exact-value table remains available.
- No decorative fake segment is rendered.

## 20. Data Quality panel

### 20.1 Purpose

The panel explains why visible pipeline data may not contribute to the period
forecast.

### 20.2 Rows

Rows are:

- Unscheduled.
- Status or Stage Conflict.
- Missing Owner.
- Omitted.

Omitted is a valid forecast choice. It is visually separated from invalid or
incomplete data.

### 20.3 Copy

Approved copy patterns include:

- Open deals without an expected close date.
- Records whose status and current Stage disagree.
- Records without a user or team owner.
- Deals intentionally excluded from forecast totals.

The panel does not use alarmist language.

### 20.4 No issue state

When no quality issue exists and Omitted is zero:

- Show Forecast data is complete for this context.
- Do not hide the panel and cause layout shift after loading.

## 21. Breakdown

### 21.1 Dimension control

The control has:

- By Owner
- By Stage

The selected dimension is stored in the URL.

### 21.2 Owner rows

Owner rows contain:

- key kind: USER, TEAM, or UNASSIGNED
- stable ID when applicable
- display label
- Closed Won amount and count
- Commit amount and count
- Best Case amount and count
- Pipeline amount and count
- Weighted Forecast amount
- Open Opportunity count

### 21.3 No leaderboard

Owner rows do not contain:

- rank
- trophy
- medal
- top performer badge
- quota
- attainment
- compensation language

Default sort is Weighted Forecast descending, followed by normalized label and
stable ID.

### 21.4 Stage rows

Stage rows contain:

- Pipeline ID.
- Pipeline name.
- Stage ID.
- Stage name.
- Stage display order.
- Stage category.
- Forecast category.
- Amount.
- Weighted amount.
- Opportunity count.

When one Pipeline is selected, rows follow Stage display order.

When all Pipelines are selected, rows sort by amount descending, followed by
Pipeline name, Stage display order, and Stage ID.

### 21.5 Pagination

Breakdown is server-paginated.

The response supplies:

- items
- page
- size
- totalElements
- totalPages

The frontend does not rank or truncate a complete tenant list in memory.

### 21.6 Selection

Activating an Owner or Stage row:

- Writes the corresponding canonical filter to the URL.
- Resets summary-dependent pages.
- Refreshes summary and breakdown.
- Updates Opportunity drill-down.

## 22. Opportunity drill-down

### 22.1 Purpose

The drill-down makes each category amount explainable.

It reuses the Opportunity directory contract rather than introducing a second
Forecast-specific Opportunity record shape.

### 22.2 Columns

Desktop columns are:

- Opportunity.
- Account.
- Pipeline and Stage.
- Owner.
- Forecast Category.
- Amount.
- Probability.
- Weighted Amount.
- Expected or Actual Close Date.
- Status.

Weighted Amount is a presentation of the same defined formula. It may be
returned by the server projection or calculated from one Opportunity amount
and probability solely for that row. It is never summed from the loaded page.

### 22.3 Opportunity link

Opportunity name and number link to:

- /app/crm/opportunities/{id}

The return target preserves the Forecast URL in router state or an explicit,
validated returnTo parameter.

### 22.4 Category-aware date

The drill-down displays:

- Actual Close Date for CLOSED.
- Expected Close Date for open categories.

It does not label an expected date as an actual close date.

### 22.5 Server pagination

The drill-down uses server pagination and canonical Opportunity summary
responses.

The page does not:

- Load the first 100 Opportunities and call it complete.
- Sum the loaded page.
- Derive category counts from the loaded page.
- Apply hidden client-only filters.

### 22.6 Mobile compact list

Below 768 px the wide table becomes a compact list.

Each item shows:

- Opportunity name and number.
- Amount and currency.
- Forecast Category and status text.
- Pipeline and Stage.
- Owner.
- Relevant close date.

The mobile list retains the same links, pagination, and accessible names.

## 23. Responsive behavior

### 23.1 Wide desktop

At wide desktop:

- Header and filter bar remain within the app-shell content width.
- Forecast Ledger uses one horizontal composed surface.
- Forecast Composition uses approximately two-thirds of the main analysis
  row.
- Data Quality uses approximately one-third.
- Breakdown and Opportunity drill-down use full width.

### 23.2 Standard laptop

At standard laptop:

- Ledger values may wrap to two rows without changing semantic order.
- Filter controls wrap intentionally.
- Table columns prioritize amount, category, Stage, Owner, and close date.
- Secondary labels truncate with accessible full text.

### 23.3 Tablet

At tablet:

- Forecast Composition and Data Quality stack.
- Ledger uses two columns.
- Breakdown remains horizontally contained.
- Filter controls may move to a responsive filter sheet.

### 23.4 Mobile

At mobile:

- Period and Currency remain visible.
- Pipeline and Owner or Team move to a Filters sheet.
- The sheet contains applied-filter count and Clear Filters.
- Forecast Ledger uses two columns.
- Chart is followed by its exact-value table.
- Breakdown rows use a compact list when a table would overflow.
- Opportunity drill-down uses the defined compact list.
- Interactive targets remain comfortably operable.

### 23.5 Long content

Every layout handles:

- Long Pipeline names.
- Long Stage names.
- Long Opportunity names.
- Large decimal values.
- Zero-decimal and multi-decimal currencies.
- User and Team names wider than the available column.

Text uses min-width zero, truncation, wrapping, or line clamp according to
context. Full text remains accessible.

## 24. Visual system

### 24.1 Design direction

The page is a serious B2B revenue workspace:

- Light theme consistent with the current app shell.
- Cool neutral surfaces.
- Restrained blue interaction accent.
- Semantic Forecast Category colors.
- Minimal shadow.
- Clear spacing and divider hierarchy.
- No glassmorphism.
- No gradient headline.
- No marketing-style hero.

### 24.2 Cards

Cards are used only where a bounded surface communicates hierarchy.

The ledger uses one composed surface. It is not five equal cards.

Breakdown and drill-down use table or list structure rather than nested cards.

### 24.3 Typography

- Page title follows StandardPageHeader hierarchy.
- Labels use sentence case.
- Monetary comparison values use tabular figures.
- Monospace is not applied to all page text.
- Very small uppercase tracking is not repeated across every section.

### 24.4 Category presentation

Forecast category visual tokens are centralized in
@/config/crmStatusConfig.

The configuration supplies:

- label
- text color
- background color
- border color
- icon or marker when required
- display order

No component defines a local category color map.

### 24.5 Semantic distinction

Category colors may distinguish:

- Closed Won.
- Commit.
- Best Case.
- Pipeline.
- Omitted.

Every colored category also includes a text label. Color is never the only
signal.

### 24.6 Motion

Motion is limited to:

- Skeleton shimmer when permitted by reduced-motion preference.
- Refresh feedback.
- Opacity or transform feedback for state transition.
- Hover and active feedback on interactive controls.

The page has:

- No continuous decorative motion.
- No animated progress race.
- No scroll-driven animation.
- No transition-all.

## 25. Permission model

### 25.1 Navigation

The Sales Forecast navigation item requires:

- crm_opportunity.read

### 25.2 Route

Direct navigation to /app/sales/forecast requires the same permission.

The route does not rely solely on the sidebar being hidden.

### 25.3 Backend summary

The summary service uses:

~~~java
authorizer.authorize(
    SystemPermission.CRM_OPPORTUNITY_READ,
    "OPPORTUNITY"
);
~~~

It does not use requireAny with SALES_ORDER_READ.

### 25.4 Backend breakdown

Breakdown uses the same:

- tenant
- actor
- permission
- entity type
- scope set
- common filters

as summary.

### 25.5 Opportunity drill-down

Opportunity Search already requires crm_opportunity.read and OPPORTUNITY
scope. Its new forecast predicates do not bypass existing scope criteria.

### 25.6 Read-only surface

Forecast v1 has no mutation.

The page does not show:

- Edit Forecast.
- Submit Forecast.
- Adjust Commit.
- Set Quota.
- Change Representative Target.

Opportunity links may lead to write actions on the Opportunity page only when
that page independently confirms crm_opportunity.write.

### 25.7 Owner filter visibility

Filter choices are restricted to the actor's usable scope.

- OWN-only actor sees their own context and does not receive a meaningless
  owner picker.
- TEAM actor sees directly authorized Team context.
- TEAM_TREE actor sees authorized roots and active descendants.
- TENANT actor may filter any valid tenant Opportunity owner.

The Forecast response can supply scoped labels without requiring the frontend
to gain unrelated platform-management permission.

### 25.8 Existence disclosure

A syntactically valid Pipeline, User, or Team ID that is unknown, deleted, or
outside authorized scope maps to the same not-found behavior.

The API does not disclose which condition occurred.

## 26. Data-scope SQL contract

### 26.1 Scope input

SalesForecastReadRepository receives:

- TenantId.
- ActorId.
- AuthorizedDataAccess.
- Typed Forecast query.

It never receives tenant ID alone for a user-facing aggregate.

### 26.2 Predicate

The repository applies the same owner columns used by Opportunity:

- o.owner_user_id
- o.owner_team_id

OWN matches current actor user ID.

TEAM matches directly authorized Team IDs.

TEAM_TREE matches authorized Team roots and active descendants.

TENANT matches all non-deleted tenant Opportunities.

### 26.3 Scope reuse

The implementation may:

- Reuse the existing scope SQL helper with the Opportunity alias.
- Introduce a focused, generalized owned-entity scope helper.

It may not duplicate a weaker tenant-only predicate in Forecast.

### 26.4 Scope parity

For any Forecast context:

- The sum of all matching drill-down rows across all pages must equal the
  corresponding category amount.
- The number of all matching drill-down rows across all pages must equal the
  corresponding category count.

Any mismatch is a release-blocking defect.

## 27. Backend component boundaries

### 27.1 Presentation

The presentation package owns:

- SalesForecastController.
- SalesForecastRequest.
- SalesForecastBreakdownRequest.
- HTTP validation.
- HTTP response mapping.

It does not contain SQL or calculation loops.

### 27.2 Application

The application package owns:

- SalesForecastQueryService.
- ForecastPeriodResolver.
- Typed query records.
- Summary and breakdown DTOs.
- Permission and scope orchestration.
- Business-date and period semantics.

### 27.3 Persistence

The infrastructure package owns:

- SalesForecastReadRepository.
- Scoped aggregate SQL.
- Breakdown SQL.
- Query parameters.
- Row mapping.

It does not return List<Map<String, Object>> to the application service.

### 27.4 Money

Java DTO and calculation use BigDecimal.

The implementation does not use:

- double
- float
- implicit Number.doubleValue

for money.

### 27.5 No fallback

Repository or mapping exceptions propagate to the standard error boundary.

The code contains no:

- catch Exception ignored
- demo tenant baseline
- fixed revenue fallback
- fixed people fallback

## 28. Frontend component boundaries

The target feature structure is:

~~~text
src/features/sales/forecast/
  SalesForecastPage.tsx
  components/
    ForecastContextBar.tsx
    ForecastLedger.tsx
    ForecastCompositionPanel.tsx
    ForecastDataQualityPanel.tsx
    ForecastBreakdownPanel.tsx
    ForecastOpportunityDrilldown.tsx
    ForecastPageStates.tsx
  hooks/
    forecastQueries.ts
    useForecastUrlState.ts
  model/
    forecastTypes.ts
    forecastSearchParams.ts
~~~

The shared API adapter remains:

- src/services/api/forecastApi.ts

Shared Opportunity contracts remain in their existing Opportunity feature and
API modules.

### 28.1 SalesForecastPage

SalesForecastPage:

- Parses URL state through one hook.
- Calls typed query hooks.
- Coordinates section composition.
- Chooses page state.
- Passes already typed values.

It does not:

- Call useEffect to fetch.
- Calculate aggregate revenue.
- Infer category.
- Default missing business values.
- Contain a local category color map.

### 28.2 URL hook

useForecastUrlState:

- Parses.
- Validates.
- Normalizes.
- Serializes.
- Resets dependent page state.
- Uses replace for canonicalization.
- Uses push for intentional user navigation.

It exposes domain-level update operations instead of raw URL mutation.

### 28.3 Query hooks

forecastQueries owns:

- Query keys.
- Summary query.
- Breakdown query.
- Manual refresh invalidation.
- Previous-data behavior.
- Error metadata.

Opportunity drill-down reuses the Opportunity query hook after its typed
search contract is extended.

### 28.4 Presentation components

Presentation components receive:

- Typed DTOs.
- Formatting helpers.
- Selected state.
- Event callbacks.
- Loading or refreshing state.

They do not call API services directly.

### 28.5 Formatter boundary

Formatting helpers own:

- Intl.NumberFormat.
- Intl.DateTimeFormat.
- Exact amount labels.
- Compact amount labels.

Formatting helpers never perform cross-record aggregation.

## 29. Frontend query behavior

### 29.1 Query keys

Query keys include:

- active tenant ID
- period
- Pipeline ID
- ownerType
- ownerId
- currency
- breakdown dimension
- page
- size

Including tenant context or clearing the QueryClient on tenant switch is
mandatory to prevent cross-tenant cache reuse.

### 29.2 Primitive dependencies

Query keys and effects use primitive values. They do not depend on a newly
created filter object on every render.

### 29.3 Independent requests

When currency is explicit:

- Summary and breakdown requests start independently.
- One request does not wait for the other.

When currency is absent:

- Summary resolves available currency groups.
- URL canonicalization selects currency.
- Breakdown starts with the selected currency.

This is an intentional dependency, not an avoidable waterfall.

### 29.4 Previous data

During a filter or page transition:

- Keep the previous successful section visible.
- Mark the section as refreshing.
- Prevent old data from being announced as current for the new filters.
- Replace it when the matching query returns.

### 29.5 Cancellation

apiFetch and TanStack Query must pass an AbortSignal so obsolete filter
requests can be cancelled.

An aborted request does not produce an error toast or fatal state.

### 29.6 Stale time

The default Forecast summary and breakdown stale time is 30 seconds.

The page does not poll continuously.

Manual Refresh invalidates all Forecast keys for:

- current tenant
- current filter context

### 29.7 Recharts loading

ForecastCompositionPanel may be route-local lazy-loaded because Recharts is a
heavy presentation dependency and the Forecast Ledger is the primary first
paint.

The lazy boundary has a shape-matched placeholder with reserved dimensions.

### 29.8 Large collections

Breakdown and Opportunity drill-down are server-paginated at a default size of
20.

The page does not render an unbounded owner, Stage, or Opportunity collection.

Virtualization is not required for the approved default page size. If a later
release raises the visible collection beyond 50 rows, it must evaluate
virtualization or content-visibility.

## 30. Summary API

### 30.1 Endpoint

~~~http
GET /api/sales/forecast
~~~

Required:

- Authenticated actor.
- Selected active tenant.
- crm_opportunity.read.
- Usable OPPORTUNITY data scope.

### 30.2 Query parameters

| Parameter | Type | Required | Rules |
|---|---|---:|---|
| period | enum | No | Default THIS_MONTH |
| pipelineId | UUID | No | Valid and visible tenant Pipeline |
| ownerType | enum | Pair | USER or TEAM |
| ownerId | UUID | Pair | Required with ownerType |
| currencyCode | string | No | Three uppercase characters |

Unknown parameters follow the repository's standard request behavior.

### 30.3 Summary response types

~~~ts
interface ForecastPeriodContext {
  preset: ForecastPeriodPreset;
  fromDate: string;
  toDate: string;
  timezone: string;
}

interface AppliedForecastFilters {
  pipelineId: string | null;
  owner: {
    type: ForecastOwnerType;
    id: string;
    label: string;
  } | null;
  currencyCode: string | null;
}

interface ForecastCategoryMetric {
  category: ForecastCategory;
  amount: string;
  opportunityCount: number;
}

interface ForecastQualityMetric {
  code: ForecastQualityCode;
  amount: string;
  opportunityCount: number;
  scope: 'SELECTED_PERIOD' | 'FILTERS_EXCLUDING_PERIOD';
}

interface ForecastCurrencySummary {
  currencyCode: string;
  weightedForecastAmount: string;
  openPipelineAmount: string;
  eligibleOpportunityCount: number;
  categories: ForecastCategoryMetric[];
  quality: ForecastQualityMetric[];
}

interface SalesForecastSummaryResponse {
  period: ForecastPeriodContext;
  appliedFilters: AppliedForecastFilters;
  tenantCurrencyCode: string;
  asOf: string;
  currencyGroups: ForecastCurrencySummary[];
}
~~~

### 30.4 Category completeness

Every currency group returns all five category codes in canonical order, even
when a category amount and count are zero.

The client does not guess a missing category.

### 30.5 Summary response example

~~~json
{
  "period": {
    "preset": "THIS_MONTH",
    "fromDate": "2026-08-01",
    "toDate": "2026-08-31",
    "timezone": "Asia/Ho_Chi_Minh"
  },
  "appliedFilters": {
    "pipelineId": null,
    "owner": null,
    "currencyCode": "VND"
  },
  "tenantCurrencyCode": "VND",
  "asOf": "2026-08-24T07:32:18Z",
  "currencyGroups": [
    {
      "currencyCode": "VND",
      "weightedForecastAmount": "864250000.000000",
      "openPipelineAmount": "642400000.000000",
      "eligibleOpportunityCount": 24,
      "categories": [
        {
          "category": "CLOSED",
          "amount": "321850000.000000",
          "opportunityCount": 7
        },
        {
          "category": "COMMIT",
          "amount": "278400000.000000",
          "opportunityCount": 5
        },
        {
          "category": "BEST_CASE",
          "amount": "196750000.000000",
          "opportunityCount": 6
        },
        {
          "category": "PIPELINE",
          "amount": "167250000.000000",
          "opportunityCount": 6
        },
        {
          "category": "OMITTED",
          "amount": "48300000.000000",
          "opportunityCount": 2
        }
      ],
      "quality": [
        {
          "code": "UNSCHEDULED",
          "amount": "76250000.000000",
          "opportunityCount": 4,
          "scope": "FILTERS_EXCLUDING_PERIOD"
        },
        {
          "code": "STATUS_STAGE_CONFLICT",
          "amount": "18600000.000000",
          "opportunityCount": 1,
          "scope": "SELECTED_PERIOD"
        },
        {
          "code": "MISSING_OWNER",
          "amount": "42000000.000000",
          "opportunityCount": 2,
          "scope": "SELECTED_PERIOD"
        }
      ]
    }
  ]
}
~~~

The values above illustrate response shape only. They are not runtime fallback
values.

## 31. Breakdown API

### 31.1 Endpoint

~~~http
GET /api/sales/forecast/breakdown
~~~

### 31.2 Query parameters

Breakdown accepts the Summary filters plus:

| Parameter | Type | Required | Rules |
|---|---|---:|---|
| dimension | enum | Yes | OWNER or STAGE |
| currencyCode | string | Yes | One selected currency |
| page | integer | No | Default 0 |
| size | integer | No | Default 20, maximum 100 |

### 31.3 Breakdown row types

~~~ts
interface ForecastBreakdownSubject {
  kind: 'USER' | 'TEAM' | 'UNASSIGNED' | 'STAGE';
  id: string | null;
  label: string;
  pipelineId: string | null;
  pipelineName: string | null;
  displayOrder: number | null;
  stageCategory: 'OPEN' | 'WON' | 'LOST' | null;
  forecastCategory: ForecastCategory | null;
}

interface ForecastBreakdownRow {
  subject: ForecastBreakdownSubject;
  currencyCode: string;
  weightedForecastAmount: string;
  openPipelineAmount: string;
  opportunityCount: number;
  categories: ForecastCategoryMetric[];
}

interface ForecastBreakdownResponse {
  dimension: ForecastBreakdownDimension;
  period: ForecastPeriodContext;
  appliedFilters: AppliedForecastFilters;
  currencyCode: string;
  items: ForecastBreakdownRow[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  asOf: string;
}
~~~

### 31.4 Stable identity

The backend never uses owner label or Stage label as a row ID.

UNASSIGNED uses:

- kind UNASSIGNED
- id null
- stable server sort token

### 31.5 Label authorization

The response includes labels only for subjects represented in the actor's
authorized aggregate.

It does not become a general membership or Team directory endpoint.

## 32. Opportunity Search extension

### 32.1 Existing endpoint

The existing endpoint remains:

~~~http
GET /api/opportunities
~~~

### 32.2 New forecast query parameters

The production implementation extends typed Opportunity Search with:

| Parameter | Type | Rules |
|---|---|---|
| forecastFrom | date | Required with forecastTo and forecastCategory |
| forecastTo | date | Inclusive, not before forecastFrom |
| forecastCategory | enum | One canonical Forecast Category |
| currencyCode | string | Three uppercase characters |
| forecastQuality | enum | Optional diagnostic filter |

Existing Pipeline and Owner parameters remain reusable.

### 32.3 Category-aware predicate

When forecastCategory is CLOSED:

- status equals WON.
- actual_close_date is between forecastFrom and forecastTo inclusive.
- current Stage is consistent with CLOSED.

When forecastCategory is PIPELINE, BEST_CASE, COMMIT, or OMITTED:

- status equals OPEN.
- expected_close_date is between forecastFrom and forecastTo inclusive.
- current Stage forecast category equals the selected category.
- current Stage consistency rules apply.

### 32.4 Quality predicate

forecastQuality supports:

- UNSCHEDULED
- STATUS_STAGE_CONFLICT
- MISSING_OWNER

forecastQuality and forecastCategory are mutually exclusive except that
OMITTED remains a Forecast Category, not a quality code.

UNSCHEDULED does not require forecastFrom or forecastTo because its date is
missing. Pipeline, Owner, and Currency filters still apply.

### 32.5 Exact parity

The Opportunity Search implementation must share a predicate builder or an
equivalent tested domain definition with Forecast aggregation.

Copying similar but independently maintained category/date logic into two
repositories is not acceptable.

## 33. Request validation

### 33.1 Period

Unknown period returns:

- 400 Bad Request
- FORECAST_PERIOD_INVALID

### 33.2 Owner pair

Incomplete owner pair returns:

- 400 Bad Request
- FORECAST_FILTER_INVALID

### 33.3 Currency

Malformed currency returns:

- 400 Bad Request
- FORECAST_FILTER_INVALID

A valid currency with zero records returns 200.

### 33.4 Pagination

Negative page, zero size, or size above 100 returns the repository-standard
validation response.

### 33.5 Dimension

Unknown breakdown dimension returns:

- 400 Bad Request
- FORECAST_FILTER_INVALID

### 33.6 Date range

Opportunity forecastTo before forecastFrom returns:

- 400 Bad Request
- REQUEST_VALIDATION_FAILED or a dedicated implemented error documented in
  docs/api-reference.md

The implementation chooses one canonical repository-wide error mapping and
documents it.

## 34. API errors

The Forecast API defines:

| Status | Error code | Meaning |
|---|---|---|
| 400 | FORECAST_PERIOD_INVALID | Unsupported period preset |
| 400 | FORECAST_FILTER_INVALID | Invalid filter combination or value |
| 401 | AUTHENTICATION_REQUIRED | Missing or invalid authentication |
| 403 | ACCESS_DENIED | Missing crm_opportunity.read or usable data scope |
| 404 | FORECAST_FILTER_NOT_FOUND | Pipeline or Owner filter is absent or outside scope |
| 500 | FORECAST_QUERY_FAILED | Forecast aggregation could not be completed |

### 34.1 No fallback

FORECAST_QUERY_FAILED:

- Does not return 200.
- Does not return previous server data as current.
- Does not return fixed numbers.
- Does not disclose SQL text.

### 34.2 Empty success

A valid request with no eligible data returns:

- 200 OK.
- Canonical period.
- Applied filters.
- Zero or empty currency groups according to the selected currency behavior.
- No error code.

### 34.3 Stale client state

If a refresh fails after a successful client response:

- The client may retain the successful response.
- The client identifies its original asOf.
- The client displays a stale warning.
- The failed response is not merged into the successful data.

## 35. Loading and refresh states

### 35.1 Initial loading

Initial loading renders shape-matched skeletons for:

- Header context.
- Filter controls.
- Forecast Ledger.
- Composition.
- Data Quality.
- Breakdown.
- Opportunity drill-down.

No business value is displayed until a successful response exists.

### 35.2 Background refresh

Background refresh:

- Keeps prior successful content.
- Applies aria-busy to the refreshing section.
- Displays Updating… or equivalent concise copy.
- Does not block unrelated navigation.

### 35.3 Manual refresh

Refresh:

- Has visible text.
- Shows busy state.
- Prevents duplicate manual requests while active.
- Retains layout dimensions.
- Does not show a success toast for ordinary refresh.

### 35.4 Section isolation

Summary, Breakdown, and Opportunity drill-down have independent query states.

A Breakdown failure does not erase a successful Summary.

A drill-down failure does not erase the Ledger or Composition.

## 36. Empty states

### 36.1 First-use empty

When no in-scope Opportunity contributes to any selected-period category and
no filter beyond defaults is active:

- Title: No forecast data for this period
- Explain that Opportunities need an expected or actual close date and a
  configured Pipeline Stage.
- Show View Opportunities.
- Show Create Opportunity only when crm_opportunity.write is present.

### 36.2 Filtered empty

When explicit filters produce no result:

- Preserve every applied filter.
- Title: No opportunities match these filters
- Show Clear Filters.
- Do not imply the tenant has no Opportunities.

### 36.3 Breakdown empty

When Summary has values but the selected breakdown page has no items due to a
stale page parameter:

- Normalize page to the final valid page.
- Use replace navigation.
- Do not show a false no-data state.

### 36.4 Quality empty

When quality counts and Omitted are zero:

- Show Forecast data is complete for this context.
- Keep the panel's reserved location.

## 37. Error and restricted states

### 37.1 Fatal Summary error

The main workspace displays:

- Unable to load revenue forecast.
- A concise next step.
- Retry.
- Return to Overview.

The page does not render fake ledger values behind the error.

### 37.2 Breakdown error

The Breakdown panel displays:

- Unable to load breakdown.
- Retry Breakdown.

Summary and drill-down remain available when independently successful.

### 37.3 Drill-down error

The drill-down displays:

- Unable to load opportunities.
- Retry Opportunities.

### 37.4 Forbidden

Missing permission or usable data scope displays:

- You do not have permission to view Revenue Forecast.
- Return to Overview.

The page does not provide an access-request workflow unless the platform
already has one.

### 37.5 Invalid or missing filter

Unknown or unauthorized ID displays:

- This forecast filter is no longer available.
- Reset Filters.

The UI does not identify whether the record exists in another scope.

### 37.6 Stale data

When refresh fails after prior success:

- Show Could not refresh. Showing data from {formatted asOf}.
- Show Retry.
- Keep the last successful values.

### 37.7 Session expiry

Authentication expiry follows the global application session flow. Forecast
does not invent a local login modal.

## 38. Accessibility contract

### 38.1 Semantics

The page uses:

- one h1
- hierarchical h2 headings
- button for actions
- Link for navigation
- label for controls
- table semantics for exact-value and desktop tabular data

Clickable div and span elements are prohibited.

### 38.2 Filter labels

Period, Pipeline, Owner or Team, Currency, and Dimension controls have:

- Visible label or persistent group label.
- Accessible name.
- Described selected value.
- Error association when invalid.

Placeholder text is not a label.

### 38.3 Chart

The chart:

- Has an accessible title.
- Has a concise description.
- References its exact-value table.
- Does not expose dozens of meaningless SVG nodes.
- Hides decorative SVG content from assistive technology when the table
  supplies the full data.

### 38.4 Category interaction

Category controls:

- Are buttons.
- Have visible focus.
- Announce selected state.
- Include category label, amount, and currency in the accessible name.

### 38.5 Async announcements

aria-live polite announces:

- Filter normalization.
- Result count changes.
- Refresh completion.
- Stale-data warning.

Repeated chart values are not redundantly announced.

### 38.6 Busy state

Refreshing regions use aria-busy without removing previously readable content.

### 38.7 Focus

- Focus-visible treatment is always present.
- Sticky filters do not cover the focused control.
- Mobile filter sheet traps focus correctly.
- Closing the sheet returns focus to its trigger.
- Retry returns focus to the refreshed section heading on success when useful.

### 38.8 Table

Tables provide:

- Caption.
- Column headers.
- Scope attributes through semantic components.
- Accessible sort name and aria-sort.
- Stable row links.

### 38.9 Color

Color is not the only indicator for:

- Forecast Category.
- Selected category.
- Data-quality issue.
- Refresh status.
- Error status.

### 38.10 Motion

- prefers-reduced-motion is honored.
- Only transform and opacity are animated.
- transition-all is prohibited.
- Loading feedback remains understandable without animation.

### 38.11 Formatting

- Numbers and currencies use Intl.NumberFormat.
- Dates and times use Intl.DateTimeFormat.
- Number columns use tabular figures.
- Long values do not overlap controls.

### 38.12 Mobile sheet

The mobile filter sheet uses:

- overscroll-behavior contain.
- Accessible title.
- Close control with accessible name.
- Minimum practical touch targets.
- No gesture-only dismissal requirement.

## 39. English-only runtime

All visible Forecast copy is English.

This includes:

- Navigation label.
- Page title.
- Subtitle.
- Filters.
- Periods.
- Category labels.
- Breakdown dimensions.
- Empty states.
- Error states.
- Retry labels.
- Stale warning.
- Data-quality explanations.
- Pagination.
- Accessible names.
- Screen-reader announcements.

Canonical codes remain uppercase English tokens.

The feature does not add Vietnamese translations or a language switch.

## 40. API adapter rules

forecastApi.ts must:

- Use typed request parameters.
- Serialize only documented query parameters.
- Parse one documented response shape.
- Keep amount as string.
- Keep IDs as string UUID values.
- Preserve null.
- Reject invalid response shape visibly through the established API boundary.
- Accept AbortSignal.

forecastApi.ts must not:

- Accept speculative content or items alternatives.
- Convert null to demo values.
- Convert amount to number for calculation.
- Merge a request over a response.
- Infer category.
- Supply fixed currency.
- Supply fixed quota.

## 41. Performance contract

### 41.1 Server aggregation

Summary uses database aggregation.

The service does not:

- Load every Opportunity into Java.
- Loop through List<Map<String, Object>>.
- Perform one query per owner.
- Perform one query per Stage.

### 41.2 Breakdown

Breakdown performs:

- Grouped aggregate query.
- Stable server sort.
- LIMIT and OFFSET.
- Total group count query or an equivalent documented efficient strategy.

### 41.3 Index posture

The schema currently includes an expected-close index beginning with:

- tenant_id
- expected_close_date

The target implementation must examine actual query plans for:

- actual close date and WON.
- expected close date and OPEN.
- owner user scope.
- owner team scope.
- Pipeline filter.
- currency filter.

At minimum, actual-close queries need an index beginning with tenant and
actual close date or an equivalent proven plan.

Final composite indexes must be selected from EXPLAIN evidence. The
implementation must not add several speculative wide indexes without query
evidence.

### 41.4 Query plan release gate

Representative Summary and Breakdown SQL must not perform an unexplained
tenant-wide full scan when a selective period and scope predicate exists.

Query-plan evidence is a later implementation artifact. It is not generated
in this spec-only task.

### 41.5 Frontend bundle

- Recharts is already installed.
- No chart library is added.
- Composition may load after the primary ledger.
- Lazy loading reserves dimensions to prevent layout shift.

### 41.6 Rendering

- Default visible row count is 20.
- Long pages do not render an unbounded array.
- Static category configuration is hoisted.
- Repeated label lookups use maps when needed.
- Expensive derived presentation is isolated from URL parsing.

### 41.7 Request deduplication

TanStack Query is the only Forecast request coordinator.

The page does not combine:

- useEffect fetch.
- local loading state.
- TanStack Query fetch.

for the same resource.

## 42. Observability

### 42.1 Backend logging

Forecast query failures log:

- correlation or request ID.
- tenant ID in the repository-approved safe form.
- actor ID in the repository-approved safe form.
- period preset.
- whether optional filters were applied.
- error class.

Logs do not include:

- access token.
- raw Authorization header.
- personal notes.
- full Opportunity payloads.
- SQL parameter values that expose sensitive names.

### 42.2 Metrics

A future implementation may measure:

- Summary latency.
- Breakdown latency.
- Forecast query failures.
- Empty summary rate.
- Quality issue counts.

Metrics must not use Opportunity names or personal names as dimensions.

### 42.3 Frontend errors

Frontend error reporting distinguishes:

- Summary.
- Breakdown.
- Opportunity drill-down.
- Filter normalization.

One panel failure does not produce multiple duplicate toasts.

## 43. Security and privacy

### 43.1 Aggregate disclosure

Counts and amounts are protected data.

Aggregation does not weaken authorization merely because individual record
details are omitted.

### 43.2 Cross-tenant isolation

Every query:

- Requires selected tenant.
- Includes tenant_id predicate.
- Uses tenant-safe joins.
- Uses composite tenant keys where applicable.

### 43.3 Scope isolation

Aggregate results contain only records the actor can retrieve through the
equivalent Opportunity Search scope.

### 43.4 Filter labels

Owner and Team labels are returned only for authorized aggregate subjects.

### 43.5 URL safety

The URL may contain IDs and canonical filter codes.

The URL does not contain:

- access token.
- personal email.
- Opportunity amount.
- customer name.
- free-text note.

### 43.6 Error safety

Not-found behavior does not distinguish:

- unknown ID.
- deleted ID.
- inactive ID.
- other-tenant ID.
- out-of-scope ID.

## 44. Data compatibility and cleanup

### 44.1 Existing response

The current SalesForecastSummary and SalesRepPerformanceDto response is not
kept as a compatibility source for the active frontend because its fields
represent fabricated quota and representative metrics.

The implementation changes frontend and backend atomically.

### 44.2 External consumers

Before replacing the response, implementation must perform a repository and
deployment consumer check.

If a confirmed external consumer exists:

- Introduce an explicit versioned production endpoint.
- Document deprecation.
- Do not keep returning demo data.

### 44.3 Existing dirty data

Existing Opportunity contradictions remain visible through Data Quality.

The Forecast implementation does not silently mutate:

- status.
- Stage.
- forecast category.
- expected close date.
- actual close date.
- owner.

Data correction occurs through authorized Opportunity workflows.

### 44.4 Pipeline changes

Because v1 is a live rollup, changing a Stage forecast category changes the
current forecast classification of Opportunities in that Stage.

No historical snapshot is claimed.

The UI may show As of current data but does not imply historical immutability.

## 45. API-reference synchronization

Any implementation of this design that changes the Forecast or Opportunity
API must update docs/api-reference.md in the same task.

The updated reference must include:

- Authentication headers.
- Tenant header.
- Required permission.
- Data-scope behavior.
- Summary query parameters.
- Breakdown query parameters.
- Opportunity Search forecast parameters.
- Decimal-string amount representation.
- Currency separation.
- Period definitions.
- Date semantics.
- Category semantics.
- Data-quality semantics.
- Response examples.
- Pagination.
- Empty success.
- Validation.
- Error codes.
- Status codes.

The reference must remove:

- Hardcoded quota claims.
- Representative leaderboard claims.
- Demo personal names.
- Fixed VND examples presented as universal behavior.
- sales_order.read as an alternative permission.

Only implemented behavior is documented.

## 46. Acceptance criteria

### 46.1 Numerical integrity

- Every category amount comes from canonical Opportunity rows.
- Every amount remains currency-specific.
- Every amount uses decimal-safe transport.
- Every category count matches complete drill-down results.
- Weighted Forecast follows the documented formula.
- Omitted does not contribute to weighted or open pipeline totals.
- Zero remains zero.

### 46.2 Period integrity

- THIS_MONTH resolves in tenant timezone.
- THIS_QUARTER resolves to a calendar quarter.
- THIS_YEAR resolves to a calendar year.
- Open categories use expected close date.
- Closed Won uses actual close date.
- Drill-down uses returned resolved boundaries.

### 46.3 Category integrity

- Pipeline Stage forecast category is authoritative.
- Probability does not select category.
- Hardcoded Stage names do not select category.
- Contradictions are excluded and reported.

### 46.4 Security integrity

- Navigation requires crm_opportunity.read.
- Direct route requires crm_opportunity.read.
- Summary requires crm_opportunity.read.
- Breakdown requires crm_opportunity.read.
- Opportunity drill-down requires crm_opportunity.read.
- SALES_ORDER_READ cannot authorize Forecast.
- OWN, TEAM, TEAM_TREE, and TENANT scopes constrain amounts and counts.
- Out-of-scope filters do not disclose existence.

### 46.5 UX integrity

- Forecast Ledger is one composed surface.
- Quota and leaderboard surfaces are absent.
- Filters round-trip through URL.
- Category selection round-trips through URL.
- Breakdown dimension and pagination round-trip through URL.
- Browser Back and Forward restore state.
- Category controls reach the matching Opportunity drill-down.
- Mobile uses compact lists rather than a squeezed desktop table.

### 46.6 State integrity

- Initial loading shows no business fallback values.
- Background refresh identifies prior data as refreshing.
- First-use empty differs from filtered empty.
- Breakdown failure is isolated.
- Drill-down failure is isolated.
- Fatal Summary failure replaces Summary content.
- Forbidden differs from empty.
- Stale data displays original asOf.
- Invalid filters can be reset.

### 46.7 Accessibility integrity

- All controls have accessible names.
- All interactions are keyboard operable.
- Focus-visible styling is present.
- Chart has an exact-value alternative.
- Tables have captions and headers.
- Color is not the only category signal.
- Async changes use polite announcements.
- Reduced motion is honored.
- Mobile sheet manages focus and overscroll.

### 46.8 Code-boundary integrity

- SalesForecastPage does not calculate revenue.
- SalesForecastPage does not fetch with useEffect.
- API adapter does not normalize speculative shapes.
- Backend service does not materialize every Opportunity.
- Backend money does not use double.
- No catch-all demo fallback remains.
- Category visuals come from crmStatusConfig.
- No new library is introduced.

### 46.9 Documentation integrity

- Implemented API changes update docs/api-reference.md.
- Runtime copy is English only.
- Proposed behavior is not documented as implemented before implementation.

## 47. Future verification contract

This section defines evidence expected from a later implementation. No test,
build, browser, API, or runtime verification is executed in this spec-only
task.

Repository policy requires explicit user authorization before running these
commands in a later task.

### 47.1 Static checks

- TypeScript typecheck.
- ESLint with zero warnings.
- English-only verification script.
- Search for any remaining Forecast quota fallback.
- Search for fixed representative names.
- Search for catch-all demo fallback.
- Search for local Forecast Category color maps.
- Search for double money in Forecast service.
- API-reference diff review.

### 47.2 Backend calculation checks

- One CLOSED VND Opportunity.
- One COMMIT VND Opportunity.
- One BEST_CASE VND Opportunity.
- One PIPELINE VND Opportunity.
- One OMITTED VND Opportunity.
- Probability zero.
- Probability with decimal fraction.
- Amount with six decimal places.
- True zero amount.
- LOST exclusion.
- CANCELLED exclusion.
- Soft-deleted exclusion.
- Missing expected close date.
- Missing owner.
- Status and Stage contradiction.
- Currency separation.
- Empty result.

### 47.3 Period checks

- First day of month.
- Last day of month.
- Leap-year February.
- Quarter boundary.
- Year boundary.
- Tenant timezone date before and after UTC date.
- Closed Won actual date inclusion.
- Open expected date inclusion.
- Drill-down boundary parity.

### 47.4 Scope checks

- OWN actor sees own user-owned Opportunities only.
- TEAM actor sees directly scoped Team Opportunities only.
- TEAM_TREE actor sees root and active descendant Team Opportunities.
- TENANT actor sees all non-deleted tenant Opportunities.
- User-owned and Team-owned records do not cross scope.
- Out-of-scope owner filter produces non-disclosing not-found.
- Summary count and full drill-down count match for every scope.
- Summary amount and full drill-down amount match for every scope.

### 47.5 API checks

- Default period.
- Invalid period.
- Atomic owner pair.
- Invalid currency format.
- Valid empty currency.
- Unknown Pipeline.
- Out-of-scope Owner.
- Breakdown pagination.
- Breakdown stable sorting.
- Opportunity forecast category filter.
- Opportunity quality filter.
- Authentication.
- Permission.
- No usable data scope.
- Query failure without fallback.

### 47.6 Frontend behavior checks

- URL parse and serialize round-trip.
- Invalid URL normalization.
- Currency canonicalization.
- Filter-dependent page reset.
- Back and Forward restoration.
- Category selection.
- Breakdown dimension selection.
- Summary and Breakdown query-key isolation.
- Request cancellation.
- Previous-data refresh state.
- Partial error isolation.
- Stale warning.
- First-use empty.
- Filtered empty.
- Permission-gated route.
- Opportunity return context.

### 47.7 Responsive and accessibility checks

- Wide desktop.
- Standard laptop.
- Tablet.
- Narrow mobile.
- Long Pipeline and Stage names.
- Large VND values.
- Decimal currency values.
- Multiple currencies.
- Keyboard-only operation.
- Screen-reader accessible names.
- Chart exact-value alternative.
- Focus return from mobile sheet.
- Visible focus under sticky filters.
- Reduced-motion preference.
- No horizontal page overflow.

### 47.8 Performance checks

- Summary query plan.
- Closed Won actual-date query plan.
- Open expected-date query plan.
- Team scope query plan.
- Breakdown query plan.
- No N+1 owner query.
- No N+1 Stage query.
- No unbounded frontend render.
- Recharts lazy boundary without layout shift.
- No duplicate concurrent query for the same key.

## 48. Release gates

The Live Revenue Forecast workspace is not production-ready until:

1. The invalid current SQL and demo fallback are removed.
2. Summary uses real Stage forecast categories.
3. Summary applies OPPORTUNITY data scope.
4. Currency groups are separated.
5. Period semantics are implemented.
6. Closed Won uses actual close date.
7. Weighted Forecast uses BigDecimal semantics.
8. Breakdown is server-backed and paginated.
9. Opportunity Search supports exact category-aware drill-down.
10. Summary and drill-down parity is demonstrated.
11. Quota and leaderboard UI is removed.
12. URL state is canonical.
13. Operational states are implemented.
14. Accessibility contract is satisfied.
15. Category presentation is centralized.
16. docs/api-reference.md reflects the implemented contract.

No release gate may be satisfied by:

- A fixed demo response.
- A client-side total over one page.
- A tenant-wide total shown to a scoped actor.
- A hardcoded VND label.
- A probability-derived category.

## 49. Deferred extensions

The following require separate approved specifications:

### 49.1 Quotas

Quota work requires:

- Quota entity.
- Owner or Team assignment.
- Currency.
- Period.
- Versioning.
- Authorization.
- Import or administration flow.
- Historical behavior.

### 49.2 Forecast snapshots

Snapshot work requires:

- Snapshot identity.
- Source timestamp.
- Period identity.
- Capture trigger.
- Backfill behavior.
- Retention.
- Immutable amount and category facts.
- Scope-safe retrieval.

### 49.3 Adjustments

Adjustments require:

- Seller and manager roles.
- Adjustment amount.
- Currency.
- Reason.
- Version.
- Audit.
- Hierarchy semantics.
- Dedicated read and write permissions.

### 49.4 Currency conversion

Conversion requires:

- Rate source.
- Effective timestamp.
- Base and quote currency.
- Missing-rate behavior.
- Rounding.
- Audit.
- Recalculation policy.

### 49.5 Historical insights

Historical insights require snapshots before they can claim:

- Moved in.
- Moved out.
- Increased.
- Decreased.
- Historical velocity.
- Period-over-period change.

### 49.6 AI forecast

AI forecast requires:

- Training or inference source.
- Explainability.
- Model version.
- Confidence calibration.
- Bias and employee-monitoring review.
- Safe fallback.
- Clear separation from the deterministic live forecast.

## 50. External design references

The approved design was informed by:

- Salesforce documentation describing standard Pipeline, Best Case, Commit,
  Omitted, and Closed forecast categories.
- Salesforce documentation distinguishing single-category and cumulative
  rollups.
- Microsoft Dynamics 365 documentation describing real-time forecast review,
  category columns, hierarchy, quota, and drill-down patterns.
- Vercel Web Interface Guidelines for URL-backed state, semantic interaction,
  focus, chart alternatives, formatting, and reduced motion.

The repository implementation remains the source of truth. External products
informed terminology and interaction patterns but did not override current
repository constraints.

## 51. Approved design recap

The approved Sales Forecast v1 is:

- Live.
- Read-only.
- Server-aggregated.
- Opportunity-backed.
- Pipeline-Stage-category-driven.
- Period-bound.
- Scope-safe.
- Currency-separated.
- Decimal-safe.
- URL-backed.
- Drill-down-explainable.
- Data-quality-aware.
- Accessible.
- English only.

It is not:

- A quota product.
- A leaderboard.
- A snapshot product.
- A manager-adjustment product.
- A currency-conversion product.
- An AI prediction product.

This boundary is intentional. It turns the existing route into a credible
production revenue workspace without presenting unsupported metrics as
business truth.
