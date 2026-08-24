# Sales Quotes Production Workspace Design Specification

**Date:** 2026-08-24

**Status:** Design approved in conversation

**Product surface:** crm-fe Sales Quotes workspace, Quote editor, Quote detail,
commercial lifecycle, Quote Line Items, approval, revision, print projection,
and Accepted Quote to Sales Order handoff

**Runtime language:** English only

**Implementation status:** Design only. This document does not claim that any
proposed frontend, backend, database, API, or document-output behavior is
implemented.

## 1. Relationship to existing requirements

This specification defines the production target for the existing route:

- /app/sales/quotes

It also introduces the approved route family:

- /app/sales/quotes/new
- /app/sales/quotes/:quoteId
- /app/sales/quotes/:quoteId/print

The approved target is a **Production Quote Workspace** with:

- A server-paginated and URL-backed Quotes list.
- A dedicated full-page Draft editor.
- A dedicated Quote detail experience.
- Real Quote Line Items sourced from active Product and Price Book records.
- Server-owned decimal-safe calculations.
- A strict commercial lifecycle with action-specific commands.
- Internal approval using the existing sales_quote.approve permission.
- Immutable customer, product, price, and terms snapshots for commercial
  output.
- Revision chains that preserve prior customer-visible versions.
- Scope-safe list, summary, detail, document, mutation, revision, and Order
  conversion behavior.
- A print projection backed only by canonical Quote data.
- An idempotent Accepted Quote to Sales Order handoff.
- Explicit handling for legacy amount-only Quotes.
- Complete loading, refresh, empty, error, validation, conflict, forbidden,
  responsive, and accessible behavior.

This is a design specification, not an implementation plan. It intentionally
does not assign tasks, prescribe commits, or modify product behavior.

Repository rules continue to apply:

- No Git commit, staging, push, or pull request is part of this work.
- No test, build, browser, API, application-start, or manual runtime command is
  part of this work.
- Any later API addition, modification, or removal must update the repository
  root docs/api-reference.md in the same implementation task.
- Existing user-owned worktree changes must be preserved.
- All runtime UI copy must be English.
- Quote Status presentation must be centralized in
  @/config/crmStatusConfig.

## 2. Executive decision

Sales Quotes becomes a trustworthy commercial-document workspace rather than
a page-level table plus an amount-entry modal.

The approved release consists of:

1. A Quotes operational workspace.
2. A full-page Quote Draft editor.
3. A read-optimized Quote detail page.
4. Server-backed Quote Line Items.
5. Server-calculated subtotal, discount, tax, shipping, and grand total.
6. A one-currency-per-Quote invariant.
7. Action-specific status transitions.
8. Approval and request-changes behavior.
9. Customer outcome capture.
10. Immutable revision history.
11. Scope-safe customer and catalogue selection.
12. Canonical print and Save-as-PDF output.
13. Accepted Quote to Order handoff.
14. Explicit legacy amount-only compatibility.
15. English-only, accessible, responsive presentation.

The following capabilities are excluded until separate subsystems are
designed:

- Product bundles.
- Product configuration rules.
- Attribute-driven configuration.
- Tier-pricing rule evaluation inside Quote.
- Automated approval thresholds.
- Multi-step approval matrices.
- Discount policy rules.
- Contracted-price agreements.
- Subscription billing schedules.
- Usage-based pricing.
- Proration.
- Currency conversion.
- Exchange-rate refresh.
- Jurisdictional tax calculation.
- Tax-provider integration.
- Electronic signatures.
- Customer portal acceptance.
- Email composition and delivery.
- Email open or click tracking.
- Stored PDF artifacts.
- Document-template management.
- Customer-facing payment collection.
- Quote analytics beyond the approved operational summary.
- Order Line fulfillment design.

This boundary delivers a production Quote workflow without presenting the
route as a complete Configure-Price-Quote platform.

## 3. Approved architectural approach

The approved architecture is a server-owned Quote Aggregate with command-
specific lifecycle actions.

The primary flow is:

~~~text
URL-backed workspace state
  -> typed Quote query
  -> tenant and actor resolution
  -> Quote permission and data-scope resolution
  -> scoped read projection
  -> typed decimal-string response
  -> Quotes workspace or Quote detail
~~~

The Draft mutation flow is:

~~~text
Account or Opportunity selection
  -> entity-specific permission and scope validation
  -> active Price Book selection
  -> Price Book currency lock
  -> Product and Price Book Item selection
  -> Product and price snapshot
  -> server-side line calculation
  -> aggregate validation
  -> transactional Draft save
  -> canonical response
~~~

The lifecycle flow is:

~~~text
Action request with If-Match
  -> permission check
  -> Quote scope check
  -> latest-revision check
  -> expected-version check
  -> transition precondition check
  -> aggregate mutation
  -> status-history append
  -> audit event
  -> canonical response
~~~

This approach was selected over:

- A frontend-only redesign, which would retain fabricated labels, hardcoded
  currency, page-level totals, manual amount entry, and fake document lines.
- A full CPQ platform, which would require pricing, product configuration,
  approval-policy, tax, subscription, signature, and document-delivery
  subsystems outside the approved release.

## 4. Current-state audit

### 4.1 Active frontend entry points

The active frontend surface includes:

- src/features/sales/quotes/QuotesPage.tsx
- src/services/api/quoteApi.ts
- src/services/mock/mockQuotesData.ts
- src/features/sales/templates/DocumentPreviewModal.tsx
- The Sales Quotes route in src/routes/AppRoutes.tsx
- The Sales Quotes item in src/config/navigationConfig.ts

QuotesPage.tsx currently owns list retrieval, page state, search, filtering,
summary calculations, create and update forms, deletion, document preview,
currency formatting, status presentation, and toasts in one component.

### 4.2 Current list accuracy problem

The page computes:

- Gross Quoted Value.
- Accepted Value.
- Sent count.

from the current page's Quotes array.

The page size is ten. Those values are nevertheless presented as workspace
totals. The metrics therefore change with pagination and do not represent the
complete filtered result.

### 4.3 Current frontend fabrication

normalizeQuote currently invents missing business data, including:

- A Quote number derived from the final characters of an ID.
- A Vietnamese Quote title.
- A fixed Account ID.
- A Vietnamese customer name.
- A Vietnamese contact label.
- A fixed validity date.
- A fixed owner name.
- A fixed line count.
- A current timestamp.
- A default version.

The adapter also accepts any, supports speculative response shapes, and merges
the request back into the server response.

Missing data therefore looks like successful production data.

### 4.4 Current create and update mismatch

The create form captures:

- Title.
- Customer name.
- Contact name.
- Total value.
- Discount percent.
- Status.
- Valid-until date.
- Representative name.

The implemented backend requires stable UUID references and an Amounts object.

The current frontend sends:

- A client-generated Quote number.
- A fixed or invalid Account identifier.
- A hardcoded VND currency.
- A manually entered total as subtotal.
- Zero shipping.

The captured discount percent is not converted into the discount amount sent
to the API. Title, customer display name, contact display name, and assigned
representative display name are not canonical backend fields.

### 4.5 Current status bypass

The create and edit UI allows a user to select business statuses directly.

The generic backend update command accepts QuoteStatus. The domain permits a
Draft or Pending Approval Quote to be updated to a supplied status without an
action-specific transition.

This bypasses:

- Approval permission.
- Approval timestamp.
- Approval actor.
- Customer outcome semantics.
- Transition-specific validation.
- Status-history reasons.

### 4.6 Current lifecycle incompleteness

The backend exposes only one lifecycle action:

- POST /api/quotes/{id}/approve

There are no action endpoints for:

- Submit for approval.
- Request changes.
- Mark sent.
- Accept.
- Reject.
- Cancel.
- Revise.
- Convert to Order.

The domain contains acceptedAt and rejectedAt fields, but no implemented
action sets them.

The approve method does not restrict its source status. A Quote can be marked
Approved without proving that it was Pending Approval.

### 4.7 Current Quote Line Item gap

The audited repository exposes Product and Price Book foundations, but the
Quote aggregate, controller, requests, DTOs, and persistence layer contain no
Quote Line Item contract.

The current Quote stores only header-level amounts.

The page preview compensates by creating one synthetic item whose name is the
Quote title and whose quantity is one. That item is not a stored Product or
commercial line.

### 4.8 Current revision gap

The backend model includes:

- revisionNumber
- previousQuoteId

There is no revise command, revision endpoint, revision chain query, latest-
revision rule, or protection against actions on a superseded version.

The current unique Quote number behavior also does not define how multiple
revisions share one commercial number.

### 4.9 Current currency gap

The backend uses BigDecimal and stores a currency code, which is a useful
foundation.

The frontend nevertheless:

- Converts amounts to JavaScript number.
- Hardcodes VND on creation and update.
- Appends the dong symbol in the table.
- Divides totals by one million.
- Aggregates without separating currencies.

### 4.10 Current data-scope vulnerability

QuoteApplicationService requests AuthorizedDataAccess for entity type QUOTE.

JdbcQuoteRepository resolves AccountScopeSql and prepends its CTE, but the
Quote find and search queries do not append scope.predicate("q").

The current Quote table projection exposes owner_user_id but not
owner_team_id. AccountScopeSql expects both owner columns for Team-based
scope.

As a result, Quote read and mutation lookup can be tenant-wide even when the
actor has OWN, TEAM, or TEAM_TREE scope.

### 4.11 Related-entity authorization drift

The current service passes Quote AuthorizedDataAccess into AccountScopeSql to
validate Account, Contact, and Opportunity IDs.

Related entities can have different permissions and entity-specific data
scopes. Quote scope is not a substitute for:

- ACCOUNT scope.
- CONTACT scope.
- OPPORTUNITY scope.

Price Book validation checks tenant and active state but does not require an
explicit Sales Catalogue read boundary in the Quote workflow.

### 4.12 Current deletion risk

DELETE physically removes a Quote after a version check.

The domain does not restrict deletion to an unsubmitted Draft. A Quote that
was approved, sent, or accepted can therefore lose its commercial record
instead of being cancelled and audited.

### 4.13 Current presentation debt

The current page:

- Uses four equal KPI cards.
- Uses a modal for a complex commercial record.
- Mixes square enterprise styling with a rounded gradient modal.
- Uses five manually listed statuses while the API exposes eight.
- Defines Quote Status colors inside quoteApi.ts.
- Uses uppercase table labels heavily.
- Uses hardcoded date formatting.
- Uses a generic spinner instead of shape-matched skeletons.
- Uses toast-only load errors.
- Does not persist list state in the URL.
- Does not provide a Quote detail route.
- Does not provide an accessible compact mobile list.

### 4.14 Current document-output debt

DocumentPreviewModal receives display strings and numeric totals assembled by
the page.

It does not fetch a canonical document projection. It can therefore print:

- Fabricated customer names.
- Fabricated product lines.
- Frontend-recalculated totals.
- Hardcoded document copy.
- Non-snapshot customer data.

window.print is a usable v1 output mechanism, but its source must be a
canonical and access-controlled Quote document projection.

### 4.15 API-reference mismatch

docs/api-reference.md currently describes Quote Management as a complete
lifecycle including approvals and Order conversion.

The implemented controller does not expose Order conversion and does not
implement the complete lifecycle described by that introduction.

This spec-only task does not update docs/api-reference.md because proposed
behavior must not be documented as implemented. A later implementation task
must synchronize the API reference with source behavior.

### 4.16 Useful existing foundations

The repository already provides:

- Quote header persistence.
- Quote number and revision fields.
- previousQuoteId.
- BigDecimal Quote amounts.
- Currency validation.
- Account, Contact, Opportunity, Price Book, and owner references.
- Approval permission.
- Optimistic version fields.
- Product and Price Book modules.
- Sales Order references to Quote ID.
- Tenant settings used by document presentation.
- TanStack Query.
- React Router.
- shadcn/Radix primitives.
- Central route access resolution.
- Central CRM status configuration.

These foundations should be extended rather than replaced.

## 5. Goals

The design must:

- Make every displayed Quote identity server-backed.
- Make every displayed amount canonical and decimal-safe.
- Make line items the source of Quote subtotal and discount totals.
- Make every transition explicit, permissioned, versioned, and audited.
- Preserve the exact commercial content of sent revisions.
- Prevent cross-tenant and out-of-scope disclosure.
- Preserve prior revisions without allowing actions on superseded versions.
- Produce a useful customer-facing print view from canonical data.
- Provide an operational Quotes list that remains correct under pagination.
- Provide a responsive editor and detail experience.
- Make legacy data limitations visible.
- Reuse the existing React, Vite, Tailwind, shadcn, permission, Product, Price
  Book, and Sales Order foundations.

## 6. Non-goals

This release does not:

- Become a full CPQ rule engine.
- Evaluate product compatibility.
- Configure bundles.
- Calculate jurisdictional taxes.
- Convert currencies.
- Fetch market exchange rates.
- Create subscription schedules.
- Implement electronic signature.
- Send Quote email.
- Track customer document engagement.
- Persist generated PDF binaries.
- Let customers accept through a public portal.
- Implement configurable approval matrices.
- Add Quote comments or collaborative editing.
- Add a rich-text document-template editor.
- Add Order Line fulfillment.
- Add invoice generation.
- Add payment collection.
- Add new frontend component, form, table, icon, or styling libraries.

## 7. Canonical vocabulary

Runtime copy uses these terms:

| Concept | Approved English label |
|---|---|
| Collection page | Quotes |
| Record | Quote |
| New action | New Quote |
| Editable record | Draft |
| Internal review request | Pending Approval |
| Approved internal version | Approved |
| Delivered to customer | Sent |
| Customer-approved outcome | Accepted |
| Customer-declined outcome | Rejected |
| Past validity | Expired |
| Withdrawn version | Cancelled |
| Replaced version | Superseded |
| Internal reviewer response | Request Changes |
| Commercial rows | Line Items |
| Output action | Print / Save as PDF |
| Order handoff | Create Order |

The page title is Quotes.

The page does not use Sales Quotations (CPQ) because the approved release does
not contain a complete CPQ engine.

## 8. Quote identity and revision model

### 8.1 Quote ID

Every revision has a unique UUID Quote ID.

URLs use the Quote ID, not Quote number or label.

### 8.2 Quote number

Quote number is a server-generated business identifier shared by every
revision in the same series.

The frontend never generates a Quote number from:

- Date.now.
- Array length.
- The final characters of an ID.
- A random integer.

### 8.3 Revision number

The first revision is revision 1.

Revision creates a new Quote row with:

- The same Quote number.
- revisionNumber equal to the prior revision plus one.
- previousQuoteId equal to the prior revision ID.
- A new UUID.
- DRAFT stored status.
- LINE_ITEM pricing mode.

### 8.4 Uniqueness

Database uniqueness is:

~~~text
(tenant_id, quote_number, revision_number)
~~~

Quote number alone is not unique across revisions.

previous_quote_id has an index and cannot form a cycle.

### 8.5 Latest revision

A revision is latest when no Quote in the same tenant points to it as
previousQuoteId.

Only the latest revision can expose lifecycle actions.

The default workspace list returns latest revisions only.

The user may opt into All Revisions through an explicit filter.

## 9. Quote aggregate

### 9.1 Header identity

The Quote header owns:

- tenantId
- id
- quoteNumber
- revisionNumber
- previousQuoteId
- name
- accountId
- contactId
- opportunityId
- priceBookId
- ownerUserId
- ownerTeamId
- storedStatus
- pricingMode
- issueDate
- validUntil
- currencyCode
- paymentTerms
- deliveryTerms
- customerReference
- internalNotes
- shippingTotal
- sentAt
- acceptedAt
- rejectedAt
- cancelledAt
- approvedAt
- approvedBy
- createdAt
- createdBy
- updatedAt
- updatedBy
- version
- deletedAt

### 9.2 Customer snapshot

The Quote stores an editable Draft snapshot containing:

- Legal or display name.
- Billing address lines.
- City or locality.
- State or province.
- Postal code.
- Country code.
- Contact name.
- Contact email.
- Contact phone.

Account and Contact IDs remain for navigation and relationship queries.

Changing the live Account or Contact does not mutate a locked Quote snapshot.

### 9.3 Commercial terms

Commercial terms remain plain bounded text in v1:

- Payment terms.
- Delivery terms.
- Customer reference.
- Internal notes.

Internal notes never appear in the document projection.

### 9.4 Line collection

The Quote owns an ordered collection of Quote Lines.

Line ordering is deterministic and persisted.

Line IDs are stable UUIDs within a revision.

### 9.5 Aggregate replacement

Saving a Draft replaces the mutable header and complete ordered line
collection in one transaction.

The backend does not expose partially persisted line operations that can leave
header totals inconsistent with line content.

## 10. Quote Line model

Each Quote Line stores:

- id
- quoteId
- position
- productId
- priceBookItemId
- skuSnapshot
- productNameSnapshot
- unitSnapshot
- descriptionSnapshot
- quantity
- listUnitPrice
- salesUnitPrice
- discountPercent
- taxPercent
- lineSubtotal
- lineDiscount
- lineTax
- lineTotal
- createdAt
- updatedAt

### 10.1 Source validation

While a Draft is saved, the backend verifies:

- Product belongs to the active tenant.
- Product is active.
- Price Book belongs to the tenant.
- Price Book is active.
- Price Book Item belongs to the selected Price Book.
- Price Book Item refers to the selected Product.
- Price Book Item is active for the current quantity and business date when
  the catalogue contract exposes those constraints.
- Price Book currency matches the Quote currency.

### 10.2 Snapshot rule

The server obtains SKU, product name, unit, description, and list price from
canonical Product and Price Book data.

The frontend cannot supply authoritative snapshot labels.

Once the Quote leaves Draft, catalogue changes do not rewrite a stored line.

### 10.3 Quantity

Quantity is a positive BigDecimal with an explicitly documented maximum scale.

Zero and negative quantity are invalid.

### 10.4 Prices and rates

Money uses BigDecimal.

Percent rates use BigDecimal.

Sales unit price is non-negative.

Discount and tax percentages are within zero and one hundred inclusive.

## 11. Calculation contract

### 11.1 Line subtotal

~~~text
lineSubtotal
  = quantity * salesUnitPrice
~~~

### 11.2 Line discount

~~~text
lineDiscount
  = lineSubtotal * discountPercent / 100
~~~

### 11.3 Taxable line amount

~~~text
lineTaxableAmount
  = lineSubtotal - lineDiscount
~~~

### 11.4 Line tax

~~~text
lineTax
  = lineTaxableAmount * taxPercent / 100
~~~

### 11.5 Line total

~~~text
lineTotal
  = lineTaxableAmount + lineTax
~~~

### 11.6 Header totals

~~~text
subtotal
  = SUM(lineSubtotal)

discountTotal
  = SUM(lineDiscount)

taxTotal
  = SUM(lineTax)

grandTotal
  = subtotal - discountTotal + taxTotal + shippingTotal
~~~

### 11.7 Rounding

Calculation uses unrounded BigDecimal intermediates.

Values are rounded at documented monetary boundaries to the database-supported
six fractional digits with HALF_UP.

The implementation must use one shared calculation policy for:

- Draft save.
- Detail response.
- Summary projection.
- Document projection.
- Order conversion.

### 11.8 Zero behavior

A true zero remains zero.

Zero is not treated as missing and is not replaced by a fallback.

### 11.9 Client calculation

The client may calculate a clearly labeled provisional display while a user
edits an unsaved line.

Only the canonical server response is treated as saved commercial truth.

The client never uses its provisional value for list summary, document output,
approval, or Order conversion.

## 12. Currency contract

### 12.1 One Quote currency

Every LINE_ITEM Quote has one currency code.

The currency is derived from the selected Price Book.

### 12.2 Currency lock

Currency cannot change while the Quote contains a line.

To change currency, the user must remove all lines and select a compatible
Price Book.

### 12.3 No implicit conversion

The Quote workflow does not calculate or display:

- Tenant-converted total.
- Corporate-currency total.
- Exchange-rate gain or loss.
- Mixed-currency aggregate.

The existing exchangeRateToTenantCurrency field is not populated or presented
as production truth in this release.

### 12.4 Summary separation

Workspace amounts are grouped by currency.

The UI never adds VND, USD, EUR, or another code into one amount.

### 12.5 Transport

Every monetary JSON value is a base-10 plain decimal string:

- No scientific notation.
- No currency symbol.
- No locale separators.
- Up to six fractional digits.

## 13. Lifecycle model

### 13.1 Stored statuses

New lifecycle commands persist:

- DRAFT
- PENDING_APPROVAL
- APPROVED
- SENT
- ACCEPTED
- REJECTED
- CANCELLED
- SUPERSEDED

### 13.2 Effective Expired status

EXPIRED is an effective read status when:

- Stored status is SENT.
- validUntil is before the tenant-local business date.

The browser does not calculate effective status.

No scheduled job is required solely to make expiry visible.

An effective Expired Quote cannot be accepted.

### 13.3 Approved state machine

~~~text
DRAFT
  -> PENDING_APPROVAL

PENDING_APPROVAL
  -> APPROVED
  -> DRAFT through Request Changes
  -> CANCELLED

APPROVED
  -> SENT
  -> CANCELLED
  -> SUPERSEDED through Revise

SENT
  -> ACCEPTED
  -> REJECTED
  -> CANCELLED
  -> SUPERSEDED through Revise

Effective EXPIRED
  -> SUPERSEDED through Revise

REJECTED
  -> SUPERSEDED through Revise

ACCEPTED
  -> Create Order
~~~

### 13.4 Editability

Only Draft is editable.

Pending Approval, Approved, Sent, Accepted, Rejected, Cancelled, Superseded,
and effective Expired records are read-only.

### 13.5 Request Changes

Request Changes:

- Requires sales_quote.approve.
- Requires PENDING_APPROVAL.
- Requires a non-blank reason.
- Returns the Quote to DRAFT.
- Preserves an immutable history event.

REJECTED is reserved for the customer's commercial decision.

### 13.6 Approval

Approval:

- Requires sales_quote.approve.
- Requires PENDING_APPROVAL.
- Sets approvedAt and approvedBy.
- Does not imply the document was sent.

### 13.7 Mark Sent

Mark Sent:

- Requires sales_quote.write.
- Requires APPROVED.
- Sets stored status SENT.
- Sets sentAt from the backend TimeProvider.
- Does not claim email delivery.

### 13.8 Accept

Accept:

- Requires sales_quote.write.
- Requires effective SENT and not expired.
- Sets acceptedAt.
- Locks the Quote permanently.

### 13.9 Reject

Reject:

- Requires sales_quote.write.
- Requires effective SENT and not expired.
- Requires a customer-decision reason.
- Sets rejectedAt.

### 13.10 Cancel

Cancel:

- Requires sales_quote.write.
- Requires a non-terminal and non-superseded Quote.
- Requires a reason.
- Sets cancelledAt.

### 13.11 Revise

Revise is available for:

- APPROVED.
- SENT.
- REJECTED.
- Effective EXPIRED.

It is unavailable for ACCEPTED.

The original becomes SUPERSEDED and a new Draft revision is created in one
transaction.

## 14. Lifecycle preconditions

### 14.1 Submit preconditions

A Draft can be submitted only when:

- It is the latest revision.
- It has a non-blank name.
- Account is valid.
- Customer snapshot has a display or legal name.
- Price Book is valid and active.
- Currency is valid.
- It has at least one valid line.
- issueDate is present.
- validUntil is not before issueDate.
- All canonical totals match recalculation.

### 14.2 Latest-revision precondition

No lifecycle action is allowed on a Quote that has a successor revision.

### 14.3 Version precondition

Every mutation after create requires a valid If-Match version.

### 14.4 Catalogue revalidation boundary

Catalogue activity and Price Book validity are checked when a Draft is saved
and submitted.

Approved and customer-visible revisions use their stored snapshots even if a
Product later becomes inactive.

## 15. Status history

sales_quote_status_history is append-only.

Each explicit transition record contains:

- tenantId
- id
- quoteId
- quoteRevisionNumber
- action
- previousStoredStatus
- newStoredStatus
- actorId
- reason
- quoteVersionBefore
- quoteVersionAfter
- occurredAt

Effective expiry is displayed as a date-derived lifecycle condition and does
not fabricate a human actor event.

## 16. Information architecture

### 16.1 Route inventory

~~~text
/app/sales/quotes
/app/sales/quotes/new
/app/sales/quotes/:quoteId
/app/sales/quotes/:quoteId/print
~~~

### 16.2 Route responsibilities

- QuotesPage owns collection context.
- QuoteEditorPage owns New and editable Draft composition.
- QuoteDetailPage owns immutable and lifecycle-oriented record review.
- QuotePrintPage owns canonical printable output.

### 16.3 No create modal

The existing create/edit modal is removed from the target design.

A Quote with customer context, Product selection, ordered lines, totals,
terms, snapshot fields, validation, and unsaved-change behavior is not a
small modal task.

## 17. URL state

### 17.1 Quotes workspace parameters

The workspace supports:

- q
- status
- accountId
- opportunityId
- ownerType
- ownerId
- currencyCode
- validity
- issueFrom
- issueTo
- validFrom
- validTo
- latestOnly
- sort
- direction
- page
- size

### 17.2 Multi-status encoding

status may appear more than once.

The canonical serializer sorts status values by the lifecycle order defined in
this specification.

### 17.3 Defaults

- latestOnly defaults to true.
- page defaults to 0.
- size defaults to 20.
- sort defaults to updatedAt.
- direction defaults to desc.

### 17.4 Invalid URL behavior

Invalid enum, UUID, date, range, sort, page, or size values are not silently
converted into unrelated filters.

The page shows an invalid-filter state with a Clear Invalid Filters action.

### 17.5 Navigation behavior

Browser Back and Forward restore:

- Search.
- Filters.
- Sort.
- Pagination.
- Latest-only selection.

Returning from Quote detail restores the collection context.

## 18. Quotes Workspace

### 18.1 Page header

The header contains:

- Title: Quotes.
- Short operational subtitle.
- Result count.
- Refresh action.
- New Quote action when authorized.

It does not contain decorative sales copy or unsupported CPQ claims.

### 18.2 Quote Pulse

Quote Pulse is one composed horizontal surface, not four unrelated cards.

For each selected or returned currency group it shows:

- Draft and Pending Approval count.
- Sent amount.
- Accepted amount.
- Expiring-soon count and amount.

All values come from the server-side summary using the same non-page filters
as the list.

### 18.3 Operational views

Approved operational views are:

- All.
- Needs Approval.
- Drafts.
- Sent.
- Accepted.
- Expiring.

Views map to canonical URL filters rather than private component state.

### 18.4 Filter bar

The filter bar includes:

- Search.
- Status.
- Account.
- Opportunity.
- Owner or Team.
- Currency.
- Validity.
- Date filters in progressive disclosure.
- Clear Filters.

### 18.5 Desktop table

The table columns are:

1. Quote and Revision.
2. Account.
3. Opportunity.
4. Grand Total.
5. Status.
6. Valid Until.
7. Owner.
8. Updated At.
9. Row actions.

### 18.6 Row behavior

Quote name and number are Links to detail.

The row is not a div with an onClick navigation handler.

The action menu contains only actions returned as available.

### 18.7 Currency display

Amount cells display:

- Formatted value.
- Currency code when ambiguity is possible.
- Exact accessible value.

No amount is always divided by one million.

## 19. Quote editor

### 19.1 Editor layout

On wide screens the editor uses:

- Main column for context, customer snapshot, Line Items, and terms.
- Sticky side rail for totals, validation readiness, and Draft actions.

### 19.2 Context section

The context section includes:

- Quote name.
- Account.
- Contact.
- Opportunity.
- Price Book.
- Owner User or Team.
- Issue date.
- Valid-until date.

### 19.3 Context dependency

Selecting an Opportunity can prefill Account and eligible Contact context.

The user must review the values before saving.

Changing Account clears an incompatible Contact and Opportunity.

Changing Price Book with existing lines requires explicit confirmation and
removes incompatible lines.

### 19.4 Line editor

The Line editor supports:

- Add Product.
- Quantity.
- Sales unit price.
- Discount percent.
- Tax percent.
- Line description.
- Reorder.
- Remove.
- Canonical recalculation after save.

### 19.5 Totals rail

The totals rail displays:

- Subtotal.
- Discount total.
- Tax total.
- Shipping total.
- Grand total.
- Currency.

Unsaved provisional amounts are identified as estimates until the server
returns canonical values.

### 19.6 Terms and snapshot sections

Customer snapshot and commercial terms use expandable sections after the
primary pricing workflow.

Internal notes are visually separated from customer-visible content.

### 19.7 Save behavior

Save Draft:

- Sends the full aggregate.
- Uses If-Match for existing Drafts.
- Keeps the user on the editor.
- Replaces provisional totals with canonical totals.
- Announces success without an exclamation mark.

### 19.8 Unsaved changes

The editor warns before route or browser navigation when local changes differ
from the last canonical response.

## 20. Quote detail

### 20.1 Detail header

The header includes:

- Quote name.
- Quote number.
- Revision number.
- Effective status.
- Account Link when Account read permission exists.
- Opportunity Link when Opportunity read permission exists.
- Owner.
- Validity.
- Available primary and overflow actions.

### 20.2 Detail content

The detail page contains:

- Overview.
- Line Items.
- Totals.
- Commercial Terms.
- Approval and Status History.
- Revision History.
- Related Order when one exists.

### 20.3 Read-only clarity

Locked records render static values rather than disabled copies of every input.

The page explains why the record is locked and which action can create an
editable revision.

### 20.4 Lifecycle actions

Action dialogs display:

- The exact transition.
- Any required reason.
- Consequences.
- Version-conflict behavior.
- A specific action label.

### 20.5 Revision history

Revision history shows:

- Revision number.
- Status.
- Creator.
- Created time.
- Grand total and currency.
- Link to that revision.

Superseded revisions remain readable.

## 21. Document projection and print view

### 21.1 Document endpoint

~~~http
GET /api/quotes/{id}/document
~~~

The endpoint returns a document-specific projection rather than reusing an
untrusted frontend-normalized object.

### 21.2 Document content

The projection contains:

- Tenant branding and legal information permitted for Quotes.
- Quote number and revision.
- Issue and validity dates.
- Customer snapshot.
- Real ordered Line Items.
- Exact monetary totals.
- Customer-visible payment and delivery terms.
- Customer reference.

It excludes:

- Internal notes.
- Hidden IDs.
- Permission metadata.
- Application-only audit content.

### 21.3 Print route

/app/sales/quotes/:quoteId/print is protected by the same Quote read and scope
checks as detail.

The route provides:

- Print.
- Save as PDF through the browser print dialog.
- Close or Return to Quote.

Draft, Pending Approval, Rejected, Cancelled, Superseded, legacy, and effective
Expired output carries an explicit status watermark. Only Approved, effective
Sent, and Accepted output may appear without a non-final watermark.

### 21.4 Output boundary

V1 does not claim:

- Stored PDF generation.
- An immutable file checksum.
- Email delivery.
- Customer receipt.
- Signature.

The commercial data is immutable by revision; the browser-generated file is a
user output, not a stored system artifact.

## 22. Responsive behavior

### 22.1 Wide desktop

- Quote Pulse remains a single row.
- Filter controls remain visible when space permits.
- Table uses the approved columns.
- Editor uses main column plus sticky totals rail.

### 22.2 Standard laptop

- Lower-priority filters move into More Filters.
- Table content truncates with accessible full-value access.
- Totals rail remains visible without covering focused content.

### 22.3 Tablet

- Quote Pulse can wrap by currency group.
- Table may reduce secondary columns.
- Editor totals move below context and above actions.

### 22.4 Narrow mobile

- Quote table becomes a compact list.
- Each item exposes Quote, Account, total, status, validity, and one overflow
  action.
- Editor sections stack vertically.
- Totals and primary action use a safe-area-aware sticky bottom bar.
- Line editor uses one composed card per line, not a squeezed desktop row.

### 22.5 Overflow

Long Quote names, Account names, Product names, addresses, terms, and amounts
must not create horizontal page overflow.

## 23. Visual system

### 23.1 Direction

The page follows the existing VUM light-mode, professional-blue direction.

It uses:

- Restrained blue for primary actions.
- Neutral cool surfaces.
- Dense but readable enterprise spacing.
- Tabular figures for monetary columns.
- Stronger hierarchy through typography and spacing rather than gradients.

### 23.2 Prohibited visual patterns

The page does not use:

- A blue-to-indigo gradient modal header.
- Four equal decorative KPI cards.
- A unique color for every filter.
- Oversized rounded containers around every section.
- Heavy shadow on routine data surfaces.
- Color as the only status signal.
- transition-all.
- Continuous decorative motion.

### 23.3 Quote Status configuration

Quote Status labels and classes live in @/config/crmStatusConfig.

The approved semantic mapping is:

- DRAFT: neutral slate.
- PENDING_APPROVAL: amber.
- APPROVED: blue.
- SENT: purple.
- ACCEPTED: emerald.
- REJECTED: rose.
- EXPIRED: amber with an explicit expiry label.
- CANCELLED: neutral slate.
- SUPERSEDED: neutral slate with a revision indicator.

The status map does not live in quoteApi.ts or mockQuotesData.ts.

## 24. Permission model

### 24.1 Read

sales_quote.read permits:

- Quotes navigation.
- Workspace route.
- Detail route.
- Print route.
- Scoped list.
- Scoped summary.
- Scoped history.
- Scoped revision chain.
- Scoped document projection.

### 24.2 Write

sales_quote.write permits, subject to scope and status:

- New Draft.
- Save Draft.
- Soft-delete never-submitted Draft.
- Submit for Approval.
- Mark Sent.
- Accept.
- Reject.
- Cancel.
- Revise.

### 24.3 Approval

sales_quote.approve permits:

- Approve.
- Request Changes.

Approval permission does not grant edit permission by itself.

No role name or role hierarchy is used as an implicit approval rule.

### 24.4 Order conversion

Create Order requires:

- sales_quote.write
- sales_order.write
- Scoped access to the Accepted Quote

### 24.5 Related data selection

Creating or editing Quote context requires:

- crm_account.read for Account selection.
- crm_contact.read for Contact selection.
- crm_opportunity.read for Opportunity selection.
- sales_catalog.read for Product and Price Book selection.

Each related entity uses its own entity type and AuthorizedDataAccess.

### 24.6 Navigation to related entities

A Quote may display its stored customer snapshot under sales_quote.read.

A live Link to Account, Contact, Opportunity, Product, Price Book, or Order is
shown only when the actor can access the target route.

## 25. Route protection

The route manifest must include:

- /app/sales/quotes
- /app/sales/quotes/new
- /app/sales/quotes/:quoteId
- /app/sales/quotes/:quoteId/print

All patterns require sales_quote.read except New Quote, which additionally
requires sales_quote.write.

Direct navigation is protected by RouteAccessBoundary or a focused equivalent.

Sidebar hiding is not authorization.

## 26. Quote data-scope contract

### 26.1 Owned columns

Quote persistence includes:

- owner_user_id
- owner_team_id

### 26.2 Scope variants

QUOTE supports:

- OWN.
- TEAM.
- TEAM_TREE.
- TENANT.

### 26.3 Query predicate

Every user-facing Quote repository operation receives:

- TenantId.
- ActorId.
- AuthorizedDataAccess for QUOTE.
- Typed request context.

The repository applies a Quote scope predicate to the q alias.

Every normal read also applies q.deleted_at IS NULL.

Prepending a scope CTE without using its predicate is prohibited.

### 26.4 Operation coverage

The exact scope contract applies to:

- Search count query.
- Search page query.
- Summary query.
- Detail query.
- Document query.
- History query.
- Revision query.
- Draft mutation lookup.
- Lifecycle mutation lookup.
- Revise source lookup.
- Order conversion source lookup.
- Soft deletion.

### 26.5 Child access

Quote Lines and Quote history are never fetched directly by Quote ID without
first joining or validating a scoped Quote header.

### 26.6 Scope-safe not found

A missing, soft-deleted, wrong-tenant, or out-of-scope Quote returns the same:

- 404 Not Found.
- QUOTE_NOT_FOUND.

## 27. Related-entity security

### 27.1 Account

Account is required.

The server validates crm_account.read and ACCOUNT scope for the selected ID.

### 27.2 Contact

Contact is optional.

When supplied, it must be visible under CONTACT scope and compatible with the
selected Account according to the canonical Contact relationship model.

### 27.3 Opportunity

Opportunity is optional.

When supplied, it must be visible under OPPORTUNITY scope and use the selected
Account.

### 27.4 Catalogue

Price Book and Product selection require sales_catalog.read.

The Quote API does not become an unrestricted Product or Price Book directory.

### 27.5 Existence disclosure

Unknown, inactive, deleted, wrong-tenant, and unauthorized related IDs use the
same resource-specific not-found behavior where disclosure would be unsafe.

## 28. Frontend component boundaries

The target feature structure is:

~~~text
src/features/sales/quotes/
  pages/
    QuotesPage.tsx
    QuoteEditorPage.tsx
    QuoteDetailPage.tsx
    QuotePrintPage.tsx
  components/
    QuotePulse.tsx
    QuoteFilterBar.tsx
    QuoteTable.tsx
    QuoteCompactList.tsx
    QuoteDetailHeader.tsx
    QuoteContextSection.tsx
    QuoteCustomerSnapshotSection.tsx
    QuoteLineEditor.tsx
    QuoteLineCard.tsx
    QuoteTotalsRail.tsx
    QuoteTermsPanel.tsx
    QuoteStatusHistory.tsx
    QuoteRevisionHistory.tsx
    QuoteActionDialogs.tsx
    QuoteListSkeleton.tsx
    QuoteDetailSkeleton.tsx
    QuoteErrorState.tsx
    QuoteEmptyState.tsx
  hooks/
    useQuotes.ts
    useQuoteSummary.ts
    useQuote.ts
    useQuoteDocument.ts
    useQuoteMutations.ts
  model/
    quoteTypes.ts
    quoteSchemas.ts
    quoteUrlState.ts
    quoteCapabilities.ts
  api/
    quoteApi.ts
~~~

### 28.1 Page responsibility

Pages coordinate routing, queries, mutations, and layout.

Pages do not calculate saved money or define lifecycle rules.

### 28.2 API responsibility

quoteApi:

- Serializes typed parameters.
- Sends typed bodies.
- Parses typed responses.
- Preserves decimal strings.
- Maps standard API errors.

It does not:

- Accept any.
- Generate Quote numbers.
- Create customer labels.
- Create owner labels.
- Create validity dates.
- Guess response shape.
- Merge the request into the response.

### 28.3 Form responsibility

The Draft form owns only unsaved editable state.

Canonical saved state always comes from the latest successful response.

### 28.4 Capability responsibility

The frontend may combine session permission with server-provided
availableActions for presentation.

The frontend does not reconstruct the complete lifecycle state machine.

## 29. Backend component boundaries

### 29.1 Domain

The domain owns:

- Quote.
- QuoteLine.
- QuoteAmounts.
- QuoteStatus.
- QuotePricingMode.
- Lifecycle transition preconditions.
- Revision invariants.
- Calculation policy.

### 29.2 Command application service

QuoteCommandService owns:

- Create Draft.
- Save Draft.
- Submit.
- Approve.
- Request Changes.
- Mark Sent.
- Accept.
- Reject.
- Cancel.
- Revise.
- Soft-delete Draft.

### 29.3 Query application service

QuoteQueryService owns:

- Workspace list.
- Quote Pulse summary.
- Detail projection.
- History.
- Revision chain.
- Document projection.
- Effective status.
- Available actions.

### 29.4 Pricing service

QuotePricingService owns:

- Catalogue validation.
- Snapshot creation.
- Line calculation.
- Header total calculation.
- Rounding policy.

### 29.5 Scope

QuoteScopeSql or a generalized owned-entity scope helper owns scope SQL.

It must be safe for both user and Team ownership columns.

### 29.6 Persistence

Persistence owns:

- Quote header save.
- Complete line replacement.
- Status-history append.
- Scoped query projections.
- Optimistic update condition.
- Revision transaction.

It does not return List<Map<String, Object>> to the application layer.

### 29.7 Order conversion

QuoteOrderConversionService owns idempotent Order creation from an Accepted
Quote.

The Quote service does not duplicate general Order lifecycle logic.

## 30. Frontend query behavior

### 30.1 TanStack Query

List, summary, detail, history, revisions, and document use TanStack Query.

Manual useEffect fetching is removed from the target design.

### 30.2 Query keys

Query keys include:

- Tenant context.
- Primitive normalized filter values.
- Sort.
- Page.
- Size.
- Quote ID for record queries.

Mutable URLSearchParams objects are not query-key members.

### 30.3 Search

Search input is debounced.

Filter changes reset page to zero.

Superseded requests are cancelled through the request signal.

### 30.4 Previous data

Changing page or filter may retain prior data during background fetch, but the
UI must label it as refreshing.

### 30.5 Mutation invalidation

After mutation success, the client invalidates:

- The affected Quote detail.
- Its history.
- Its revision chain.
- The current list.
- Quote Pulse.
- Related Order query after conversion.

### 30.6 No broad cache clearing

The client does not clear all application queries after every Quote action.

### 30.7 Shared API types

~~~ts
type QuoteStatus =
  | 'DRAFT'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'SENT'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'EXPIRED'
  | 'CANCELLED'
  | 'SUPERSEDED';

type QuoteAction =
  | 'EDIT_DRAFT'
  | 'DELETE_DRAFT'
  | 'SUBMIT'
  | 'APPROVE'
  | 'REQUEST_CHANGES'
  | 'MARK_SENT'
  | 'ACCEPT'
  | 'REJECT'
  | 'CANCEL'
  | 'REVISE'
  | 'PRINT'
  | 'CREATE_ORDER';

type QuoteOwnerType = 'USER' | 'TEAM';

type QuoteValidity = 'ACTIVE' | 'EXPIRING_SOON' | 'EXPIRED';

interface QuoteReference {
  id: string;
  label: string;
  routeAvailable: boolean;
}

interface QuoteOwnerInput {
  type: QuoteOwnerType;
  id: string;
}

interface QuoteOwnerReference extends QuoteOwnerInput {
  label: string;
}

interface QuoteAppliedFilters {
  q: string | null;
  statuses: QuoteStatus[];
  account: QuoteReference | null;
  opportunity: QuoteReference | null;
  owner: QuoteOwnerReference | null;
  currencyCode: string | null;
  validity: QuoteValidity | null;
  issueFrom: string | null;
  issueTo: string | null;
  validFrom: string | null;
  validTo: string | null;
}

interface QuoteCustomerSnapshotInput {
  legalName: string;
  addressLine1: string | null;
  addressLine2: string | null;
  locality: string | null;
  region: string | null;
  postalCode: string | null;
  countryCode: string | null;
  contactName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
}
~~~

## 31. Quotes Search API

### 31.1 Endpoint

~~~http
GET /api/quotes
~~~

### 31.2 Query parameters

| Parameter | Type | Required | Rules |
|---|---|---:|---|
| q | string | No | Trimmed, bounded search |
| status | repeated enum | No | Effective Quote Status |
| accountId | UUID | No | Scope-safe Account filter |
| opportunityId | UUID | No | Scope-safe Opportunity filter |
| ownerType | enum | Pair | USER or TEAM |
| ownerId | UUID | Pair | Required with ownerType |
| currencyCode | string | No | Three uppercase letters |
| validity | enum | No | ACTIVE, EXPIRING_SOON, EXPIRED |
| issueFrom | date | Pair | Inclusive |
| issueTo | date | Pair | Inclusive and not before issueFrom |
| validFrom | date | Pair | Inclusive |
| validTo | date | Pair | Inclusive and not before validFrom |
| latestOnly | boolean | No | Default true |
| sort | enum | No | updatedAt, validUntil, grandTotal, quoteNumber |
| direction | enum | No | asc or desc |
| page | integer | No | Default 0 |
| size | integer | No | Default 20, maximum 100 |

### 31.3 Search fields

q searches normalized values for:

- Quote number.
- Quote name.
- Customer reference.
- Customer snapshot name.
- Resolved Account name when permitted by the projection.

grandTotal sort is valid only when currencyCode is supplied. Sorting amounts
across different currencies would imply a comparison the product does not
support.

### 31.4 Search response

~~~ts
interface QuoteSummaryItem {
  id: string;
  quoteNumber: string;
  revisionNumber: number;
  name: string;
  latestRevision: boolean;
  legacyAmountOnly: boolean;
  effectiveStatus: QuoteStatus;
  account: QuoteReference;
  opportunity: QuoteReference | null;
  owner: QuoteOwnerReference | null;
  amounts: QuoteAmountsResponse;
  lineCount: number;
  issueDate: string;
  validUntil: string | null;
  updatedAt: string;
  version: number;
  availableActions: QuoteAction[];
}
~~~

The endpoint returns the repository-standard PageResult shape.

## 32. Quote Pulse API

### 32.1 Endpoint

~~~http
GET /api/quotes/summary
~~~

### 32.2 Filter parity

Summary accepts the same non-page, non-sort filters as Search except
latestOnly.

Quote Pulse always aggregates latest revisions only. This prevents prior
customer-visible revisions from inflating the operational portfolio when the
list is temporarily displaying All Revisions.

### 32.3 Response

~~~ts
interface QuotePulseCurrencyGroup {
  currencyCode: string;
  draftCount: number;
  pendingApprovalCount: number;
  sentAmount: string;
  sentCount: number;
  acceptedAmount: string;
  acceptedCount: number;
  expiringSoonAmount: string;
  expiringSoonCount: number;
}

interface QuotePulseResponse {
  appliedFilters: QuoteAppliedFilters;
  revisionScope: 'LATEST_ONLY';
  asOf: string;
  tenantTimezone: string;
  currencyGroups: QuotePulseCurrencyGroup[];
}
~~~

### 32.4 Expiring soon

EXPIRING_SOON means effective SENT with validUntil from the tenant-local
business date through seven calendar days later, inclusive.

### 32.5 No page aggregation

Summary never receives or derives totals from the visible page content.

## 33. Quote Detail API

### 33.1 Endpoint

~~~http
GET /api/quotes/{id}
~~~

### 33.2 Response shape

The response includes:

- Identity and revision fields.
- Quote name.
- Effective and stored lifecycle context.
- Pricing mode.
- Scoped references and labels.
- Customer snapshot.
- Ordered lines.
- Exact amounts.
- Commercial terms.
- Lifecycle timestamps.
- Related Order reference when visible.
- latestRevision.
- availableActions.
- version.

The response includes:

~~~http
ETag: "{version}"
~~~

### 33.3 Amount response

~~~ts
interface QuoteAmountsResponse {
  currencyCode: string;
  subtotal: string;
  discountTotal: string;
  taxTotal: string;
  shippingTotal: string;
  grandTotal: string;
}
~~~

### 33.4 Line response

~~~ts
interface QuoteLineResponse {
  id: string;
  position: number;
  productId: string;
  priceBookItemId: string;
  sku: string;
  productName: string;
  unit: string | null;
  description: string | null;
  quantity: string;
  listUnitPrice: string;
  salesUnitPrice: string;
  discountPercent: string;
  taxPercent: string;
  lineSubtotal: string;
  lineDiscount: string;
  lineTax: string;
  lineTotal: string;
}
~~~

## 34. Draft Create API

### 34.1 Endpoint

~~~http
POST /api/quotes
~~~

### 34.2 Server identity

The backend generates:

- Quote ID.
- Quote number.
- Revision 1.
- DRAFT status.
- LINE_ITEM pricing mode.
- Version 1.

### 34.3 Request

~~~ts
interface CreateQuoteRequest {
  name: string;
  accountId: string;
  contactId: string | null;
  opportunityId: string | null;
  priceBookId: string;
  owner: QuoteOwnerInput | null;
  issueDate: string;
  validUntil: string | null;
}
~~~

The initial Draft can contain no lines.

The server derives currency from Price Book and builds an initial customer
snapshot from authorized Account and Contact data.

## 35. Draft Save API

### 35.1 Endpoint

~~~http
PUT /api/quotes/{id}
If-Match: "{version}"
~~~

### 35.2 Request

~~~ts
interface SaveQuoteDraftRequest {
  name: string;
  accountId: string;
  contactId: string | null;
  opportunityId: string | null;
  priceBookId: string;
  owner: QuoteOwnerInput | null;
  issueDate: string;
  validUntil: string | null;
  customerSnapshot: QuoteCustomerSnapshotInput;
  paymentTerms: string | null;
  deliveryTerms: string | null;
  customerReference: string | null;
  internalNotes: string | null;
  shippingTotal: string;
  lines: QuoteLineInput[];
}
~~~

### 35.3 Line input

~~~ts
interface QuoteLineInput {
  id: string | null;
  position: number;
  productId: string;
  priceBookItemId: string;
  quantity: string;
  salesUnitPrice: string;
  discountPercent: string;
  taxPercent: string;
  description: string | null;
}
~~~

The request does not accept:

- status.
- quoteNumber.
- revisionNumber.
- listUnitPrice.
- snapshot labels.
- calculated line totals.
- calculated header totals.

Lines absent from the submitted collection are removed from the Draft in the
same transaction. Existing line IDs must belong to the same Quote revision;
foreign or cross-tenant line IDs are rejected without disclosing their owner.

## 36. Lifecycle Action APIs

All action endpoints require:

~~~http
If-Match: "{version}"
~~~

Successful non-delete Draft and lifecycle mutations return the new canonical
Quote and its updated ETag.

### 36.1 Submit

~~~http
POST /api/quotes/{id}/submit
~~~

No body is required.

### 36.2 Approve

~~~http
POST /api/quotes/{id}/approve
~~~

No body is required.

### 36.3 Request Changes

~~~http
POST /api/quotes/{id}/request-changes
~~~

~~~json
{
  "reason": "Update the delivery timeline before customer review."
}
~~~

### 36.4 Mark Sent

~~~http
POST /api/quotes/{id}/mark-sent
~~~

No body is required.

The endpoint does not claim an email was sent.

### 36.5 Accept

~~~http
POST /api/quotes/{id}/accept
~~~

~~~json
{
  "customerReference": "PO-REQ-8842"
}
~~~

customerReference is optional.

### 36.6 Reject

~~~http
POST /api/quotes/{id}/reject
~~~

~~~json
{
  "reason": "Customer selected a different commercial proposal."
}
~~~

### 36.7 Cancel

~~~http
POST /api/quotes/{id}/cancel
~~~

~~~json
{
  "reason": "Opportunity scope changed and this proposal is withdrawn."
}
~~~

### 36.8 Revise

~~~http
POST /api/quotes/{id}/revise
~~~

The response contains the new Draft Quote and its route ID.

### 36.9 Soft-delete Draft

~~~http
DELETE /api/quotes/{id}
~~~

Only a never-submitted Draft may be soft-deleted.

Successful deletion returns `204 No Content`. It does not return a Quote body
or a replacement ETag.

## 37. History and Revisions APIs

### 37.1 History

~~~http
GET /api/quotes/{id}/history?page=0&size=20
~~~

History is server-paginated and ordered newest first with stable ID ordering.

### 37.2 Revisions

~~~http
GET /api/quotes/{id}/revisions
~~~

Revision response is ordered by revision number descending.

It contains only revisions in the same tenant and Quote-number series that are
visible under the actor's Quote scope.

## 38. Accepted Quote to Order handoff

### 38.1 Endpoint

~~~http
POST /api/quotes/{id}/convert-to-order
If-Match: "{version}"
~~~

### 38.2 Preconditions

- Quote is the latest revision.
- Effective status is ACCEPTED.
- Quote is not soft-deleted.
- Actor has sales_quote.write.
- Actor has sales_order.write.
- No existing active Order is linked to the Quote.

### 38.3 Idempotency

Repeated conversion returns the existing linked Order when the prior request
completed.

The database enforces one conversion result per Quote through a compatible
unique or idempotency constraint.

QUOTE_ORDER_ALREADY_EXISTS is reserved for a conflicting pre-existing Order
that cannot be treated as the same idempotent conversion result.

### 38.4 Copied header data

The Order receives:

- Account ID.
- Contact ID.
- Opportunity ID.
- Quote ID.
- Owner.
- Currency.
- Exact Quote amounts.
- Order date from backend business date.
- Customer reference when compatible.

### 38.5 Order Line boundary

The approved handoff creates the existing Order header and preserves the Quote
as the immutable source document.

Creating an Order Line fulfillment subsystem is outside this Quote spec and
requires a later Sales Order design.

## 39. Request validation

### 39.1 Strings

Every string field has an explicit maximum length derived from persistence and
domain constraints.

Required strings are trimmed and cannot become blank.

### 39.2 Dates

- issueDate is required before submit.
- validUntil may be null in Draft.
- validUntil is required before submit.
- validUntil cannot be before issueDate.

### 39.3 Owner pair

Owner Type and Owner ID are atomic.

Incomplete pairs return a validation error.

### 39.4 Lines

- Position values are unique and normalized.
- Product and Price Book Item IDs are required.
- Quantity is positive.
- Monetary inputs are non-negative.
- Percent inputs are within range.
- Duplicate Product lines are allowed only when the line description or
  commercial context intentionally differs; the UI warns but does not merge
  them silently.

### 39.5 Currency

Currency codes are three uppercase letters.

Currency is server-derived for new LINE_ITEM Quotes.

## 40. Error contract

The target API uses stable error codes.

| HTTP | Code | Meaning |
|---:|---|---|
| 400 | INVALID_PAYLOAD | Request validation failed |
| 400 | QUOTE_FILTER_INVALID | Query filter is malformed |
| 401 | AUTHENTICATION_REQUIRED | Authentication is missing or invalid |
| 403 | ACCESS_DENIED | Permission or usable scope is missing |
| 404 | QUOTE_NOT_FOUND | Quote is absent, deleted, wrong-tenant, or out of scope |
| 404 | QUOTE_ACCOUNT_INVALID | Account is unavailable under Account scope |
| 404 | QUOTE_CONTACT_INVALID | Contact is unavailable or incompatible |
| 404 | QUOTE_OPPORTUNITY_INVALID | Opportunity is unavailable or incompatible |
| 404 | QUOTE_PRICE_BOOK_INVALID | Price Book is unavailable or inactive |
| 404 | QUOTE_PRODUCT_INVALID | Product or Price Book Item is unavailable |
| 400 | QUOTE_IF_MATCH_INVALID | If-Match is malformed or contains an unsupported value |
| 428 | QUOTE_IF_MATCH_REQUIRED | A mutation after create omitted If-Match |
| 409 | QUOTE_NUMBER_ALREADY_EXISTS | Server-generated number collided |
| 409 | QUOTE_VERSION_CONFLICT | If-Match does not match current version |
| 409 | QUOTE_IMMUTABLE | Requested content edit targets a locked Quote |
| 409 | QUOTE_NOT_LATEST_REVISION | Action targets a superseded revision |
| 409 | QUOTE_ORDER_ALREADY_EXISTS | A conflicting Order conversion exists |
| 422 | QUOTE_STATUS_INVALID | Lifecycle transition is invalid |
| 422 | QUOTE_LINES_REQUIRED | Submit requires at least one valid line |
| 422 | QUOTE_CURRENCY_MISMATCH | Quote, Price Book, or line currencies differ |
| 422 | QUOTE_TOTAL_INVALID | Recalculated aggregate violates constraints |
| 422 | QUOTE_VALIDITY_INVALID | Date range is invalid |
| 422 | QUOTE_REASON_REQUIRED | Transition reason is missing |
| 422 | QUOTE_LEGACY_ACTION_UNAVAILABLE | Legacy amount-only Quote cannot perform action |

The UI maps codes to a specific next step.

## 41. Loading and refresh states

### 41.1 Initial list load

The page shows:

- Quote Pulse skeleton.
- Shape-matched table or compact-list skeleton.
- Disabled pagination placeholder.

No business values appear before data arrives.

### 41.2 Background list refresh

Existing rows remain visible.

The page displays Refreshing and an accessible live announcement.

### 41.3 Initial detail load

The detail page reserves header, line table, totals, and history geometry.

### 41.4 Editor lookups

Account, Opportunity, Contact, Product, and Price Book lookups expose focused
loading states without blocking unrelated saved Draft content.

### 41.5 Action pending

Only the submitted action is pending.

Other conflicting lifecycle actions are disabled until the response returns.

## 42. Empty states

### 42.1 First-use empty

When the actor can create Quotes, the page explains the workflow and provides
New Quote.

When the actor is read-only, it explains that no accessible Quotes exist and
does not show an unauthorized action.

### 42.2 Filtered empty

Filtered empty shows:

- No Quotes match these filters.
- Active-filter summary.
- Clear Filters.

### 42.3 Empty Draft lines

The editor explains that totals remain zero until a Product is added.

The Add Product action appears only when the required Account, Price Book,
catalogue permission, and editability conditions are satisfied.

### 42.4 Empty history

History empty is distinct from history failure.

### 42.5 Legacy no-line state

Legacy Quote detail shows a specific limitation message and stored amount
summary. It never displays a synthetic Product line.

## 43. Error and conflict states

### 43.1 Fatal workspace error

List failure replaces the list with a persistent error surface and Retry.

The error is not toast-only.

### 43.2 Partial summary error

Quote Pulse failure does not hide a successfully loaded list.

### 43.3 Detail not found

404 provides Return to Quotes and does not reveal why the Quote was
unavailable.

### 43.4 Forbidden

Forbidden is distinct from empty and not found.

### 43.5 Field validation

Validation is rendered next to the responsible field or line.

An error summary links to invalid controls and focus moves to the first error
after submit.

### 43.6 Version conflict

On QUOTE_VERSION_CONFLICT:

- Local unsaved values remain visible.
- The page explains that another update changed the Quote.
- Open Latest Version is available.
- Reload requires confirmation because it discards local edits.
- The client does not automatically resend with a new version.

### 43.7 Lifecycle action failure

The displayed status remains the last confirmed server status.

### 43.8 Document failure

Print view provides Return to Quote and Retry. It does not render a partial
commercial document as final output.

## 44. Accessibility contract

### 44.1 Semantics

- Collection uses a semantic table on desktop.
- Mobile records use articles or list items.
- Navigation uses Link or anchor.
- Actions use button.
- Form fields use associated labels.
- Tables use captions and column headers.

### 44.2 Focus

- Every interactive element has visible focus-visible treatment.
- Sticky headers and action bars do not cover focused controls.
- Dialogs trap and restore focus.
- Error submission focuses the first invalid field.

### 44.3 Icon buttons

Every icon-only control has an accessible name.

Decorative icons are hidden from assistive technology.

### 44.4 Reordering

Line reorder has keyboard-accessible Move Up and Move Down actions.

Drag is optional enhancement, not the only mechanism.

### 44.5 Async messages

Loading, refreshing, save success, validation summary, and lifecycle results
use appropriate polite announcements.

### 44.6 Motion

- prefers-reduced-motion is honored.
- Animations use transform and opacity.
- transition-all is prohibited.
- No continuous animation communicates business state.

### 44.7 Number and date presentation

- Intl.NumberFormat formats currency.
- Intl.DateTimeFormat formats dates.
- Tabular figures align monetary comparisons.
- Exact values remain available when compact formatting is used.

## 45. English-only runtime

The target Quotes feature contains no Vietnamese runtime copy.

This includes:

- Adapter fallback strings.
- Mock data imported into runtime.
- Status labels.
- Empty states.
- Validation errors.
- Toasts.
- Print content.
- Document headings.
- Legacy warnings.

Identifiers and stored customer content are not translated.

## 46. Performance contract

### 46.1 Server pagination

Quotes, status history, and any large lookup are server-paginated.

The frontend never loads every Quote to calculate summary values.

### 46.2 Query projections

Search and summary use purpose-built projections.

Detail loads the complete aggregate for one scoped Quote.

### 46.3 No N+1

Account, Opportunity, owner, Product, and revision labels are resolved through
bounded joins or batched lookup.

### 46.4 Index candidates

Future implementation evaluates indexes for:

- sales_quotes tenant, deleted state, updated time.
- tenant, effective stored status, valid-until date.
- tenant and owner user.
- tenant and owner Team.
- tenant, Quote number, revision number.
- previous Quote ID.
- sales_quote_lines Quote ID and position.
- sales_quote_status_history Quote ID and occurred time.
- sales_orders Quote ID for idempotent conversion.

Index creation depends on measured query plans, not this list alone.

### 46.5 Render bounds

Default list size is 20 and maximum size is 100.

Virtualization is not required for the default page size. If a later design
renders more than 50 complex rows at once, it must evaluate virtualization or
content-visibility.

## 47. Observability

### 47.1 Structured events

Backend lifecycle operations emit structured events containing:

- Tenant ID.
- Quote ID.
- Revision number.
- Action.
- Previous and new status.
- Actor ID.
- Result.
- Duration.
- Error code when present.

### 47.2 Sensitive content

Logs do not include:

- Customer address.
- Contact email or phone.
- Internal notes.
- Line descriptions.
- Full request bodies.
- Access tokens.

### 47.3 Metrics

Useful operational metrics include:

- Query latency.
- Summary latency.
- Draft save latency.
- Lifecycle command latency.
- Version-conflict rate.
- Invalid-transition rate.
- Document projection failure rate.
- Order conversion result rate.

## 48. Legacy compatibility

### 48.1 Pricing mode

Quote persistence adds:

- LINE_ITEM
- LEGACY_AMOUNT_ONLY

Existing Quote rows without canonical lines become LEGACY_AMOUNT_ONLY.

New Quotes are LINE_ITEM.

### 48.2 Display

Legacy Quotes remain visible with:

- Stored header amounts.
- Existing relationship IDs.
- Existing lifecycle timestamps.
- A visible legacy limitation label.

### 48.3 Prohibited fabrication

Migration does not create:

- A Package line.
- Quantity one.
- A generic Product.
- A guessed discount.
- A guessed tax rate.
- A guessed customer label.

### 48.4 Legacy actions

Legacy Quotes cannot:

- Submit.
- Approve.
- Mark Sent.
- Accept.
- Convert directly to Order.

When lifecycle state permits revision, Create Revision creates a new LINE_ITEM
Draft with copied safe header context and no lines.

The user must review customer snapshot, select Price Book, and add lines.

### 48.5 Existing EXPIRED rows

Existing rows stored as EXPIRED remain readable as legacy lifecycle history.

New LINE_ITEM Quote expiration uses the effective status rule in this
specification.

## 49. API-reference synchronization

A future implementation that changes Quote APIs must update:

- docs/api-reference.md

The implemented section must include:

- Authentication.
- Permissions.
- Entity data scope.
- Query parameters.
- Request bodies.
- Decimal-string fields.
- Lifecycle preconditions.
- If-Match behavior.
- Response fields.
- Error codes.
- Status codes.
- Print projection.
- Legacy behavior.
- Order conversion behavior.

The reference must remove or correct claims that are not implemented.

This design-only task does not change the API reference.

## 50. Acceptance criteria

### 50.1 Data integrity

- No Quote label is fabricated in the frontend.
- No Account, Contact, owner, date, or line count fallback is fabricated.
- Quote number is server-generated.
- Every LINE_ITEM Quote total comes from canonical lines.
- Every money value remains decimal-safe.
- Every summary amount is currency-specific.
- True zero remains zero.

### 50.2 Calculation integrity

- Line formulas match the approved contract.
- Header totals equal the sum of canonical lines plus shipping.
- Detail, summary, document, and Order header amounts agree.
- Rounding policy is consistent.
- Java money does not use double or float.
- Frontend provisional totals are never persisted as authoritative totals.

### 50.3 Lifecycle integrity

- Generic Draft update cannot change status.
- Every transition uses an action endpoint.
- Every transition validates source status.
- Only Draft is editable.
- Approval requires sales_quote.approve.
- Request Changes returns to Draft with a reason.
- Customer Rejected remains distinct from internal Request Changes.
- Superseded versions have no actions.
- Accepted Quote cannot be revised.
- Effective Expired Quote cannot be accepted.

### 50.4 Revision integrity

- Revision creates a new UUID.
- Revision number increments exactly once.
- Quote number remains stable across revisions.
- previousQuoteId is correct.
- Original becomes Superseded.
- Prior revision remains readable.
- Only latest revision is actionable.

### 50.5 Security integrity

- Navigation requires sales_quote.read.
- List, summary, detail, history, revisions, and document are scope-safe.
- Mutation lookup is scope-safe.
- OWN, TEAM, TEAM_TREE, and TENANT work with Quote ownership.
- Related Account, Contact, Opportunity, and catalogue selection uses the
  appropriate permission and entity scope.
- Out-of-scope IDs do not disclose existence.
- Order conversion requires both Quote and Order write permission.

### 50.6 Workspace integrity

- Quote Pulse uses server-side full-result aggregation.
- Pagination does not change aggregate truth.
- Filters round-trip through URL.
- Back and Forward restore state.
- Desktop table uses semantic Links and actions.
- Mobile uses a compact list.
- Status visuals come from crmStatusConfig.

### 50.7 Editor integrity

- New and edit use full-page workflow.
- Unsaved changes warn before navigation.
- Context changes clear incompatible relationships.
- Currency locks with lines.
- Save replaces the full aggregate transactionally.
- Validation identifies the exact invalid field or line.
- Version conflict never silently overwrites.

### 50.8 Document integrity

- Print projection is scope-safe.
- Print contains real lines.
- Print uses customer snapshot.
- Print totals equal Quote detail totals.
- Internal notes are excluded.
- Legacy Quotes do not display synthetic lines.
- UI labels the action Print / Save as PDF.
- V1 does not claim stored or delivered PDF.

### 50.9 State integrity

- Initial loading shows no business fallback values.
- Background refresh preserves and labels prior data.
- First-use empty differs from filtered empty.
- Partial summary failure does not hide list.
- Fatal list failure has Retry.
- Forbidden differs from empty and not found.
- Conflict preserves local values until user decides.

### 50.10 Accessibility integrity

- Controls have accessible names.
- Inputs have associated labels.
- Keyboard users can add, edit, remove, and reorder lines.
- Focus-visible treatment exists.
- Dialog focus is managed.
- Async status changes are announced.
- Tables have captions and headers.
- Reduced motion is honored.
- Color is not the only status signal.

### 50.11 Compatibility integrity

- Existing Quotes are classified without fabricated line data.
- Legacy limitations are visible.
- Legacy stored totals remain readable.
- Legacy revision produces a reviewed LINE_ITEM Draft.
- Existing API behavior is not documented as replaced before implementation.

## 51. Future verification contract

This section defines evidence expected from a later implementation. No test,
build, browser, API, application-start, or runtime verification is performed
in this spec-only task.

Repository policy requires a later explicit user instruction before running
verification commands.

### 51.1 Static checks

- TypeScript typecheck.
- ESLint with zero warnings.
- English-only verification.
- Search for TypeScript any usage in Quote API code.
- Search for Quote data fallbacks.
- Search for client-generated Quote numbers.
- Search for hardcoded VND.
- Search for Quote Status maps outside crmStatusConfig.
- Search for generic status update input.
- Search for double or float money.
- API-reference diff review.

### 51.2 Calculation checks

- One line without discount or tax.
- Multiple lines.
- Fractional quantity.
- Six-decimal unit price.
- Zero sales price.
- One-hundred-percent discount.
- Tax after discount.
- Shipping total.
- Rounding boundary.
- Large supported amount.
- Negative-value rejection.
- Mixed-currency rejection.
- Detail and document parity.
- Detail and summary parity.
- Quote and converted Order header parity.

### 51.3 Lifecycle checks

- Draft submit success.
- Submit prerequisite failure.
- Pending approval approve.
- Pending approval request changes.
- Approved mark sent.
- Sent accept.
- Sent reject.
- Sent effective expiry.
- Expired accept rejection.
- Cancel from every allowed source.
- Cancel from terminal source rejection.
- Revise every allowed source.
- Revise Accepted rejection.
- Action on Superseded rejection.
- Generic status update rejection.
- Status history contents.

### 51.4 Revision checks

- Revision 1 to Revision 2.
- Revision 2 to Revision 3.
- Stable Quote number.
- Unique Quote IDs.
- Correct previous links.
- Stable revision ordering.
- Latest-only search.
- All-revisions search.
- Concurrent revision rejection.

### 51.5 Scope checks

- OWN actor sees own Quotes only.
- TEAM actor sees direct Team Quotes only.
- TEAM_TREE actor sees active descendant Team Quotes.
- TENANT actor sees all non-deleted tenant Quotes.
- User-owned and Team-owned records do not cross unauthorized scope.
- Search count and page use identical scope.
- Summary and list use identical scope.
- Detail, document, history, and revision chain use identical scope.
- Mutation and Order conversion use identical scope.
- Out-of-scope IDs map to Quote Not Found.

### 51.6 Related-entity checks

- Account permission and scope.
- Contact permission, scope, and Account compatibility.
- Opportunity permission, scope, and Account compatibility.
- Active Price Book.
- Inactive Price Book rejection.
- Active Product.
- Inactive Product rejection before submit.
- Price Book Item and Product consistency.
- Price Book currency consistency.
- Catalogue snapshot stability after source change.

### 51.7 API checks

- Default paging and sorting.
- Multi-status filter.
- Atomic owner pair.
- Currency format.
- Date range validation.
- Validity filters.
- latestOnly behavior.
- Summary filter parity.
- ETag or version response behavior.
- Missing If-Match.
- Malformed If-Match.
- Stale If-Match.
- Stable error codes.
- Idempotent Order conversion.

### 51.8 Frontend behavior checks

- URL parse and serialize round-trip.
- Invalid URL state.
- Search debounce.
- Request cancellation.
- Page reset after filter.
- Back and Forward restoration.
- Summary and list query isolation.
- Draft canonical-response replacement.
- Unsaved-change guard.
- Version-conflict flow.
- Action availability by status.
- Action availability by permission.
- Partial failure isolation.
- Legacy display.
- Print data parity.

### 51.9 Responsive and accessibility checks

- Wide desktop.
- Standard laptop.
- Tablet.
- Narrow mobile.
- Very long Quote name.
- Very long Account and Product names.
- Large VND values.
- Decimal currency values.
- Multiple currency groups.
- Keyboard-only editor.
- Keyboard line reorder.
- Screen-reader control names.
- Focus after validation.
- Focus return from dialog.
- Reduced-motion preference.
- Print layout.
- No horizontal page overflow.

### 51.10 Performance checks

- Search count query plan.
- Search page query plan.
- Quote Pulse query plan.
- Effective expiry query plan.
- OWN scope query plan.
- TEAM scope query plan.
- TEAM_TREE scope query plan.
- Detail aggregate query count.
- Revision query plan.
- No Account or owner N+1.
- No Product N+1.
- No page-level aggregate calculation.
- No duplicate concurrent request for one query key.

## 52. Release gates

The Production Quote Workspace is not ready for production until:

1. Frontend fabricated normalization is removed.
2. Client-generated Quote numbers are removed.
3. Quote Line persistence is implemented.
4. Server calculation is authoritative.
5. Mixed currencies cannot enter one Quote or aggregate.
6. Generic status updates are removed.
7. Lifecycle preconditions are enforced.
8. Status history is append-only and complete.
9. Revision preserves the old version and creates a new Draft.
10. Only latest revision is actionable.
11. Quote scope predicate is applied to every operation.
12. owner_team_id or an equivalent supported Team-ownership contract exists.
13. Related entities use their own permission and scope.
14. List summary is server-side and pagination-independent.
15. Full-page editor and detail routes are protected.
16. Document projection contains canonical data only.
17. Legacy records are explicit and never receive fake lines.
18. Order conversion is idempotent and permission-safe.
19. All operational states are implemented.
20. Accessibility contract is satisfied.
21. Quote Status presentation is centralized.
22. Runtime copy is English only.
23. docs/api-reference.md matches implemented behavior.

No release gate may be satisfied by:

- Fixed demo data.
- A frontend fallback.
- A synthetic document line.
- A page-only aggregate.
- A client-side status mutation.
- A tenant-only query shown to a scoped actor.
- A hardcoded VND label.
- A generic catch-all error that hides the business failure.

## 53. Deferred extensions

### 53.1 Advanced CPQ

Requires separate models for:

- Product configuration.
- Bundle hierarchy.
- Constraint evaluation.
- Rule priority.
- Pricing waterfall.
- Explainability.

### 53.2 Approval policy

Requires:

- Threshold conditions.
- Approval stages.
- Approver resolution.
- Delegation.
- Escalation.
- Recall.
- Policy versioning.

### 53.3 Tax engine

Requires:

- Jurisdiction.
- Customer exemptions.
- Product tax category.
- Provider contract.
- Rate effective date.
- Rounding and reporting policy.

### 53.4 Document delivery

Requires:

- Server PDF rendering.
- Template versioning.
- Object storage.
- Immutable checksum.
- Email delivery.
- Delivery state.
- Customer access controls.

### 53.5 Electronic signature

Requires:

- Signer identity.
- Signing order.
- Consent.
- Provider integration.
- Tamper evidence.
- Certificate retention.

### 53.6 Order Lines

Requires:

- Order Line aggregate.
- Copy policy from Quote Lines.
- Fulfillment state.
- Partial fulfillment.
- Returns or cancellation semantics.
- Price-lock policy.

## 54. External design references

The approved design was informed by:

- Salesforce documentation describing Quote Line Items, Quote and Opportunity
  synchronization, Product and Price Book relationships, and line-level price,
  quantity, and discount concepts.
- Microsoft Dynamics 365 documentation describing Draft, activation and lock,
  revision, customer outcome, and Quote-to-Order progression.
- Vercel Web Interface Guidelines covering semantic actions and navigation,
  URL-backed state, focus-visible behavior, accessible forms, reduced motion,
  Intl formatting, and large-list constraints.

Reference URLs:

- https://help.salesforce.com/s/articleView?id=quotes_fields.htm&language=en_US&type=0
- https://help.salesforce.com/s/articleView?id=sales.quotes_synch_overview.htm&language=en_US&type=5
- https://learn.microsoft.com/en-us/dynamics365/sales/create-edit-quote-sales
- https://learn.microsoft.com/en-us/dynamics365/sales/sales-transactions
- https://github.com/vercel-labs/web-interface-guidelines/blob/main/command.md

External products informed terminology and interaction patterns. Repository
source and approved VUM constraints remain authoritative.

## 55. Approved design recap

The approved Sales Quotes v1 is:

- Server-backed.
- Line-item-driven.
- Decimal-safe.
- Single-currency per Quote.
- Full-page editable in Draft.
- Read-only after Draft.
- Approval-aware.
- Revision-safe.
- Scope-safe.
- URL-backed.
- Canonically printable.
- Legacy-aware.
- Idempotent at Order handoff.
- Accessible.
- Responsive.
- English only.

It is not:

- A manual total-entry form.
- A page-level KPI dashboard.
- A fake PDF preview.
- A generic status dropdown.
- A full CPQ rule engine.
- A tax engine.
- An email-delivery system.
- An e-signature system.
- A stored-document service.

This boundary replaces the current presentation with a credible commercial
workflow while preserving a clear path for later CPQ, approval-policy,
document-delivery, signature, and Order Line subsystems.
