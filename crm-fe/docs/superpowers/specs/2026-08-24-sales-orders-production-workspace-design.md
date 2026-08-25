# Sales Orders Production Workspace Design Specification

**Date:** 2026-08-24

**Status:** Design approved in conversation

**Product surface:** crm-fe Sales Orders workspace, Direct Order editor,
Quote-derived Order setup, Order detail, Order Lines, lifecycle, line-level
fulfillment, fulfillment correction, status history, and print projection

**Runtime language:** English only

**Implementation status:** Design only. This document does not claim that any
proposed frontend, backend, database, API, fulfillment, or document behavior is
implemented.

## 1. Relationship to existing requirements

This specification defines the production target for:

~~~text
/app/sales/orders
/app/sales/orders/new
/app/sales/orders/:id
/app/sales/orders/:id/edit
~~~

It follows the approved Sales Quotes design at:

~~~text
crm-fe/docs/superpowers/specs/2026-08-24-sales-quotes-production-workspace-design.md
~~~

The Quote design intentionally deferred Order Line fulfillment. This Sales
Orders specification completes that boundary by defining:

- Direct and Quote-derived Orders.
- Canonical Order Lines.
- Commercial snapshots and locking.
- Server-owned decimal-safe calculations.
- Order lifecycle actions.
- Append-only fulfillment events with line quantities.
- Partial fulfillment and closing the unfulfilled remainder.
- Auditable fulfillment correction.
- Scope-safe list, summary, detail, mutation, history, print, and Quote handoff.
- Explicit handling for legacy amount-only Orders.
- Complete loading, refresh, empty, error, conflict, responsive, and
  accessible states.

This is a design specification, not an implementation plan. It does not assign
tasks, prescribe commits, or modify product behavior.

Repository rules continue to apply:

- Runtime product copy is English only.
- Status presentation is centralized in `@/config/crmStatusConfig`.
- Future implemented API changes update `docs/api-reference.md` in the same
  implementation task.
- No commit, staging, push, pull request, test, build, browser run, API call, or
  application start is part of this spec-only task.

## 2. Executive decision

Sales Orders becomes a Production Order Workspace built around an Order
Aggregate and an append-only Fulfillment Ledger.

The approved v1 contains:

1. A server-backed Orders Workspace.
2. Server-backed Order Pulse metrics.
3. A full-page Direct Order editor.
4. A Quote-derived operational setup experience.
5. A read-optimized Order detail page.
6. Canonical Order Lines.
7. Product, customer, pricing, and address snapshots.
8. Server-calculated subtotal, discount, tax, shipping, and grand total.
9. A one-currency-per-Order invariant.
10. Explicit action-based lifecycle transitions.
11. Line-level partial fulfillment.
12. Append-only fulfillment events.
13. Auditable void correction.
14. A distinct close-remaining outcome.
15. Scope-safe related-entity selection.
16. Canonical print and Save-as-PDF output.
17. Explicit legacy amount-only compatibility.
18. English-only, accessible, responsive presentation.

The following capabilities are excluded until separate subsystems are
designed:

- Invoice generation.
- Accounts receivable.
- Payment collection.
- Payment reconciliation.
- Refund processing.
- Credit notes.
- Warehouse inventory.
- Location allocation.
- Picking and packing.
- Shipment records.
- Carrier integrations.
- Tracking numbers.
- Delivery-route planning.
- Returns and reverse logistics.
- Product bundles and configuration rules.
- Subscription provisioning.
- Jurisdictional tax calculation.
- Tax-provider integration.
- Stored PDF artifacts.
- Document-template management.
- Order amendment and revision chains.
- Customer portal order tracking.
- Email composition or delivery.

The page must not present any excluded capability as implemented.

## 3. Approved architectural approach

The approved architecture is an Order Aggregate with immutable commercial
snapshots and a Fulfillment Ledger.

The aggregate owns:

- Order identity.
- Source type.
- Customer and related sales context.
- Owner User or Team.
- Currency.
- Commercial lock state.
- Billing and fulfillment snapshots.
- Ordered lines.
- Canonical monetary totals.
- Lifecycle state.
- Optimistic concurrency version.

The fulfillment ledger owns:

- One fulfillment event per recorded operational completion.
- One or more line quantities per event.
- Event date, reference, note, actor, and timestamps.
- Recorded or Voided state.
- Void reason and void actor.

The primary command flow is:

~~~text
Action request with If-Match
  -> authentication
  -> permission check
  -> Order scope check
  -> idempotency lookup when the command requires it
  -> expected-version check for a new command intent
  -> lifecycle precondition check
  -> related-entity check when applicable
  -> aggregate mutation
  -> fulfillment and status derivation when applicable
  -> append status history
  -> transactional persistence
  -> canonical response with new ETag
~~~

No generic Order update command may change status.

### 3.1 Rejected approach: header-only extension

Updating `fulfilled_quantity` directly on Order Items would be faster but
would not preserve which event changed the quantity, who recorded it, or how a
mistake was corrected.

### 3.2 Rejected approach: full Order Management System

Warehouse, allocation, fulfillment-order routing, shipment, invoice, payment,
and returns models exceed the approved CRM boundary.

### 3.3 Transaction boundaries

Each lifecycle or fulfillment command is one transaction.

Record Fulfillment atomically:

1. Authenticates, authorizes, and resolves the scope-safe Order.
2. Resolves the Idempotency Key and normalized intent hash.
3. Returns the prior event result when the key and intent match.
4. Rejects the request when the key exists for a different intent.
5. Enforces the expected Order version for a new intent.
6. Validates the Order and all submitted lines.
7. Inserts the fulfillment event.
8. Inserts fulfillment event lines.
9. Recalculates fulfilled projections.
10. Derives and persists the new Order status.
11. Appends action/status history even when the resulting status is unchanged.
12. Increments the Order version exactly once.

Partial writes are never exposed.

## 4. Current-state audit

### 4.1 Frontend page

The current file is:

~~~text
crm-fe/src/features/sales/orders/OrdersPage.tsx
~~~

The audited file is 616 lines and combines:

- List fetching.
- Search and filters.
- Pagination.
- Page-level KPI calculation.
- Create state.
- Edit state.
- Mutation handlers.
- Desktop table rendering.
- Create/Edit modal rendering.
- Status configuration consumption.

Material problems include:

- The page title claims fulfillment, invoicing, and payment reconciliation even
  though those capabilities do not exist.
- New and edit behavior is compressed into a modal that cannot support real
  Order Lines.
- Account is free text while the request sends a fixed Account ID.
- Assigned user is free text and defaults to a named individual.
- Total is entered manually instead of calculated from lines.
- Status is directly editable through a dropdown.
- Payment status is directly editable despite no payment subsystem.
- New Orders default to a non-Draft status.
- Amount parsing uses JavaScript floating-point numbers.
- Order KPIs are calculated from the visible ten-row page.
- Currency is rendered as VND regardless of response currency.
- Settled amount is fabricated as either zero or the full total.
- In Fulfillment and Fulfilled tab counts are derived from the current page.
- Delete is offered as a generic row action.
- Delete does not pass the row's actual version from the page handler.
- Search requests are issued directly from controlled state without an
  explicit debounce or URL contract.
- Rows are not semantic links to a detail route.
- There is no Order detail, Order Line, fulfillment history, status history, or
  print projection.

### 4.2 Frontend API adapter

The current file is:

~~~text
crm-fe/src/services/api/orderApi.ts
~~~

The audited file is 214 lines and materially diverges from the backend.

`normalizeOrder` uses untyped input and fabricates missing values for:

- Order ID.
- Order Number.
- Account ID.
- Account name.
- Contact name.
- Status.
- Payment status.
- Requested delivery date.
- Assigned user.
- Item count.
- Created timestamp.
- Version.

Additional contract problems include:

- It treats subtotal as the primary total instead of grand total.
- It accepts both `items` and `content` without a single typed PageResult.
- Payment filtering is performed on the current client page.
- Order Number is generated on the client.
- Account ID falls back to a fixed value.
- Currency is hardcoded to VND.
- Discount and tax are replaced with zero.
- Create and update merge the request back over the server response.
- Create and update use untyped API responses.
- The update request can pass status through the generic endpoint.
- Cancel is absent even though the backend exposes it.
- Start, Record, Void, Close Remaining, history, summary, and document APIs do
  not exist.

### 4.3 Divergent runtime mock

The file below defines a third, incompatible Order contract:

~~~text
crm-fe/src/services/mock/mockOrdersData.ts
~~~

It uses:

- `PENDING`, `PROCESSING`, `SHIPPED`, `DELIVERED`, and `CANCELLED` statuses.
- A separate payment-status vocabulary.
- Client-generated IDs and Order Numbers.
- In-memory mutation.
- Fixed demo customer, owner, price, and payment data.

This mock must not remain a runtime source of truth after the production API
contract is implemented.

### 4.4 Backend aggregate

The current backend aggregate includes an Order header and statuses:

- DRAFT.
- CONFIRMED.
- PROCESSING.
- PARTIALLY_FULFILLED.
- FULFILLED.
- CANCELLED.

Material gaps include:

- Order Lines are not part of the aggregate.
- Fulfillment events are absent.
- No command starts processing.
- No command records partial or full fulfillment.
- No command voids a fulfillment.
- No command closes the remaining quantity.
- `fulfilledAt` exists but no domain behavior sets it.
- Generic update accepts `OrderStatus`.
- Generic update can jump between nonterminal statuses.
- Terminal-state and version failures are both mapped to version conflict.
- Cancel reason is optional.
- A repeated Cancel is not modeled as a distinct invalid transition.
- Any Order may be hard-deleted after a version check.
- Order Number is accepted from the client.
- Header totals are accepted without canonical lines.
- Billing and fulfillment address snapshots in schema are not mapped into the
  aggregate.

### 4.5 Repository scope gap

`JdbcOrderRepository` resolves `AccountScopeSql` and prepends its CTE, but the
Order detail, count, and search queries do not apply the resolved scope
predicate.

The practical result is that a scoped actor can receive tenant-wide Orders if
they have the Order permission.

The repository also:

- Models only `owner_user_id`.
- Does not support Team ownership.
- Uses Order-authorized data access to validate Account, Contact, Opportunity,
  and Quote IDs.
- Does not apply a Quote scope predicate in `existsQuote`.
- Does not exclude soft-deleted Orders because soft deletion is absent.
- Hard-deletes the header and cascades child rows.

### 4.6 Database schema

`docs/crm_mysql80.sql` already contains:

- `sales_orders`.
- `sales_order_items`.
- Billing and shipping address JSON snapshots.
- `fulfilled_quantity` on Order Items.

The application does not use the Order Item table.

The schema has no canonical:

- Fulfillment event header.
- Fulfillment event lines.
- Fulfillment void metadata.
- Order status history.
- Team owner column.
- Soft-delete metadata.
- Source type.
- Pricing mode.
- Commercial lock timestamp.
- Closed-partial status metadata.
- Direct-create idempotency record.

No invoice, payment, refund, warehouse, shipment, or carrier table supports the
claims made by the current frontend.

### 4.7 API reference

The Sales Order section of `docs/api-reference.md` documents create, get,
search, update, confirm, cancel, and delete.

It overstates a full fulfillment lifecycle because the backend does not expose
fulfillment actions or Order Lines.

It also documents client-supplied Order Number and header-entered totals, which
are not acceptable for the target contract.

The API reference is not changed by this design-only task. It must describe
only implemented behavior during a later implementation.

## 5. Goals

The target must:

- Present one reliable operational view of Orders.
- Support Direct and Accepted-Quote sources.
- Preserve the commercial commitment made in an Accepted Quote.
- Use real Order Lines.
- Calculate money on the backend.
- Keep each Order in one currency.
- Make every lifecycle transition explicit.
- Track fulfillment per line and per event.
- Support multiple fulfillment events.
- Prevent over-fulfillment.
- Preserve correction history.
- Distinguish partial completion from cancellation.
- Make due and progress information operationally useful.
- Apply permission and scope consistently.
- Remove every fabricated frontend value.
- Handle legacy rows honestly.
- Remain usable on laptop, tablet, and mobile layouts.
- Meet the approved accessibility and performance contract.

## 6. Non-goals

The target does not:

- Become an ERP.
- Reserve or decrement inventory.
- Allocate a warehouse or location.
- Model pick lists or packing slips.
- Create a Shipment entity.
- Integrate a carrier.
- Store tracking numbers under a misleading generic reference.
- Calculate accounts receivable.
- Create invoices.
- Accept payments.
- Reconcile bank transactions.
- Display manual payment status.
- Process refunds or returns.
- Reprice an Accepted Quote at Order conversion.
- Allow mixed-currency lines.
- Allow generic status editing.
- Allow direct fulfilled-quantity editing.
- Allow hidden line or total fabrication.
- Allow client-generated Order Numbers.
- Send Order email.
- Persist PDF files.
- Create a customer tracking portal.
- Implement amendment or revision workflows.
- Add a new frontend UI, state, form, table, icon, or styling library.

## 7. Canonical vocabulary

Runtime copy uses these terms:

| Concept | Approved English label |
|---|---|
| Sales commitment | Order |
| Manually originated Order | Direct Order |
| Accepted-Quote-originated Order | Quote-derived Order |
| Ordered commercial rows | Line Items |
| Ready but not started | Confirmed |
| Operational work started | Processing |
| Some quantity complete | Partially Fulfilled |
| All quantity complete | Fulfilled |
| No quantity will be fulfilled | Cancelled |
| Some quantity complete and remainder stopped | Partially Fulfilled — Closed |
| Begin operational work | Start Fulfillment |
| Record completed quantity | Record Fulfillment |
| Reverse an erroneous event | Void Fulfillment |
| Stop unfulfilled remainder | Close Remaining |
| Customer-provided purchase reference | Customer Reference |
| Planned completion date | Requested Fulfillment Date |
| Output action | Print / Save as PDF |

The page title is `Orders`.

The page does not use `Payment Status`, `Settled`, `Shipment`, or `Tracking`
without an implemented subsystem that owns those concepts.

## 8. Order source and identity

### 8.1 Source type

`sourceType` is one of:

- DIRECT.
- QUOTE_CONVERSION.

It is immutable after creation.

### 8.2 Order ID

Every Order has a server-generated UUID.

### 8.3 Order Number

Every Order has a tenant-unique, server-generated Order Number.

The client cannot propose or override it.

The generation strategy is a tenant-safe backend concern. The format may be
human-readable, but uniqueness must not rely on the browser clock or random
client values.

### 8.4 Quote relationship

A Quote-derived Order has an immutable `quoteId` pointing to the latest
Accepted Quote revision used for conversion.

One Accepted Quote produces at most one Order result.

Repeated conversion returns the already linked Order, including a Cancelled
Order. V1 does not silently create a replacement Order for the same Quote.

### 8.5 Direct relationship rules

A Direct Order:

- Has no Quote ID.
- Requires an Account.
- May reference a compatible Contact and Opportunity.
- Requires an active Price Book before lines are added.

### 8.6 Source presentation

The UI shows a compact source label:

- Direct.
- From Quote.

When source is Quote, the Quote Number is a scoped semantic link when the actor
can read it.

## 9. Order aggregate

The target Order header contains:

- Tenant ID.
- Order ID.
- Order Number.
- Source Type.
- Pricing Mode.
- Account ID.
- Contact ID.
- Opportunity ID.
- Quote ID.
- Price Book ID.
- Owner User ID.
- Owner Team ID.
- Status.
- Currency Code.
- Order Date.
- Requested Fulfillment Date.
- Customer Reference.
- Customer Snapshot.
- Billing Address Snapshot.
- Fulfillment Address Snapshot.
- Subtotal.
- Discount Total.
- Tax Total.
- Shipping Total.
- Grand Total.
- Confirmed At.
- Fulfillment Started At.
- Fulfilled At.
- Cancelled At.
- Cancellation Reason.
- Closed Partial At.
- Close Remaining Reason.
- Commercial Locked At.
- Operational Notes.
- Created At and Created By.
- Updated At and Updated By.
- Deleted At and Deleted By.
- Version.

### 9.1 Owner invariant

Exactly one of `ownerUserId` and `ownerTeamId` is populated.

When no owner is supplied for a Direct Order, the server defaults to the
current actor as User owner.

Quote conversion copies the approved Quote owner when it remains valid;
otherwise the backend assigns the converting actor and records that decision.

### 9.2 Pricing mode

`pricingMode` is one of:

- LINE_ITEM.
- LEGACY_AMOUNT_ONLY.

New Orders are LINE_ITEM.

### 9.3 Soft deletion

Only a never-confirmed Direct Draft may be soft-deleted.

Normal queries exclude `deleted_at IS NOT NULL`.

No lifecycle, fulfillment, history, or document action operates on a
soft-deleted Order.

## 10. Customer and address snapshots

Commercial output must not depend on mutable current customer data.

### 10.1 Customer snapshot

The Order stores:

- Legal or display name used for the Order.
- Primary contact name.
- Contact email.
- Contact phone.

### 10.2 Billing address snapshot

The billing snapshot stores:

- Address line 1.
- Address line 2.
- Locality.
- Region.
- Postal code.
- Country code.

### 10.3 Fulfillment address snapshot

The fulfillment snapshot uses the same address shape.

It is an operational location label only. Its existence does not imply a
warehouse, shipment, or carrier workflow.

### 10.4 Snapshot creation

Direct Order creation initializes snapshots from authorized Account and
Contact projections.

Quote conversion copies the accepted Quote customer snapshot and initializes
addresses from the Quote or authorized Account data according to available
canonical fields.

The backend never guesses labels when source data is absent.

### 10.5 Snapshot editing

Snapshots are editable only while the Order is Draft and only within the
source-specific lock rules.

After Confirm, snapshots are immutable in v1.

## 11. Order Line model

Each LINE_ITEM Order contains one or more ordered lines before Confirm.

An Order Line contains:

- Tenant ID.
- Line ID.
- Order ID.
- Position.
- Product ID.
- Price Book Item ID for Direct Orders.
- Quote Line ID for Quote-derived Orders.
- SKU snapshot.
- Product name snapshot.
- Unit-of-measure snapshot.
- Description snapshot.
- Quantity.
- List unit price.
- Sales unit price.
- Discount percent.
- Tax percent.
- Line subtotal.
- Line discount.
- Line tax.
- Line total.
- Created and updated audit metadata.
- Version when line-level persistence requires it.

### 11.1 Snapshot stability

After a line is created, later changes to Product, Price Book, SKU, name, unit,
or description do not rewrite the Order snapshot.

### 11.2 Quote-derived lines

Quote conversion copies every canonical Quote Line exactly once.

The conversion preserves:

- Quote Line ID.
- Product and Price Book Item relationships.
- All commercial snapshots.
- Quantity.
- Price inputs.
- Calculated amounts.

The Order does not reprice the Accepted Quote.

### 11.3 Direct lines

Direct Draft lines are selected from active Products and compatible active
Price Book Items visible under catalogue permission and scope.

### 11.4 Fulfillment projection

Each line response includes:

- Ordered Quantity.
- Fulfilled Quantity.
- Remaining Quantity.
- Progress percent.

Fulfilled Quantity is derived from non-voided fulfillment event lines.

The value is never accepted as Draft or fulfillment input.

### 11.5 Line immutability

Direct Order Lines are editable only in Draft.

Quote-derived Order Lines are immutable from creation.

All Order Lines are immutable after Confirm.

## 12. Calculation contract

### 12.1 Authoritative calculator

The backend calculator is authoritative for Direct Orders.

The frontend may show provisional totals while editing but persists only
pricing inputs. It replaces provisional values with the canonical response
after every save.

### 12.2 Line formulas

For each Direct Order Line:

~~~text
lineSubtotal = quantity * salesUnitPrice
lineDiscount = lineSubtotal * discountPercent / 100
taxableAmount = lineSubtotal - lineDiscount
lineTax = taxableAmount * taxPercent / 100
lineTotal = taxableAmount + lineTax
~~~

### 12.3 Header formulas

~~~text
subtotal = sum(lineSubtotal)
discountTotal = sum(lineDiscount)
taxTotal = sum(lineTax)
grandTotal = subtotal - discountTotal + taxTotal + shippingTotal
~~~

### 12.4 Quote-derived amounts

Quote conversion copies canonical Accepted Quote amounts.

The Order Line and header totals must reconcile to the Quote Line and header
totals before conversion commits.

The Order does not fetch current catalogue prices during conversion.

### 12.5 Decimal safety

Backend money and quantity calculations use `BigDecimal`.

Java code does not use `double` or `float` for Order amounts or quantities.

API monetary and quantity fields use decimal strings.

### 12.6 Zero handling

Zero is a valid commercial value where the field allows it.

The frontend does not use truthiness to replace zero with a fallback.

### 12.7 Rounding

The Order calculator uses the same currency precision and rounding policy as
the canonical Quote calculator.

Intermediate values retain configured calculation precision. Persisted line
and header values use one documented rounding boundary so that detail,
summary, print, and Quote conversion remain equal.

## 13. Currency and commercial lock

### 13.1 Single currency

Every Order has exactly one uppercase three-letter currency code.

Every line and its Price Book Item must match the Order currency.

### 13.2 Direct Order currency

The server derives currency from the selected Price Book.

Changing Price Book is allowed only in Direct Draft.

If lines exist, the UI requires explicit confirmation and clears incompatible
lines before switching Price Book.

### 13.3 Quote-derived currency

Quote conversion copies the Accepted Quote currency.

The currency is immutable from Order creation.

### 13.4 Commercial lock

Quote-derived Orders are commercially locked at creation.

Direct Orders become commercially locked at Confirm.

Commercial lock covers:

- Account.
- Contact and Opportunity commercial context.
- Quote relationship.
- Price Book.
- Currency.
- Ordered lines.
- Ordered quantities.
- Product and price snapshots.
- Discount and tax inputs.
- Header commercial totals.

V1 does not unlock a confirmed Order.

## 14. Fulfillment aggregate

### 14.1 Fulfillment event

An Order Fulfillment contains:

- Tenant ID.
- Fulfillment ID.
- Order ID.
- Fulfillment Date.
- Reference.
- Note.
- Status: RECORDED or VOIDED.
- Recorded At and Recorded By.
- Voided At and Voided By.
- Void Reason.
- Idempotency Key metadata.

### 14.2 Fulfillment event line

Each event contains one or more lines with:

- Fulfillment Line ID.
- Fulfillment ID.
- Order Line ID.
- Fulfilled Quantity.
- Audit metadata.

### 14.3 Event immutability

A RECORDED event cannot be edited or deleted.

A correction uses Void Fulfillment and preserves the original event and line
quantities.

### 14.4 Neutral operational meaning

Fulfillment means the ordered quantity has been operationally completed or
handed over.

The event is deliberately neutral so it can represent a product delivery or a
completed service without pretending to be a Shipment.

### 14.5 Reference semantics

Reference is an optional customer or internal operational reference.

The UI label remains `Reference`. It is not labeled Tracking Number, Shipment
Number, Invoice Number, or Payment Reference.

## 15. Fulfillment quantity and status derivation

For Order Line `L`:

~~~text
fulfilledQuantity(L) =
  sum(quantity from RECORDED fulfillment lines for L)

remainingQuantity(L) =
  orderedQuantity(L) - fulfilledQuantity(L)
~~~

VOIDED events contribute zero.

### 15.1 Quantity invariants

For every line:

~~~text
0 <= fulfilledQuantity <= orderedQuantity
0 <= remainingQuantity <= orderedQuantity
~~~

The transaction locks or otherwise serializes the Order aggregate so
concurrent fulfillment commands cannot over-fulfill one line.

### 15.2 Derived fulfillment state

After Record or Void Fulfillment:

- All lines fully fulfilled produces FULFILLED.
- At least one positive fulfilled quantity and at least one remaining quantity
  produces PARTIALLY_FULFILLED.
- Zero fulfilled quantity on a previously started active Order produces
  PROCESSING.

### 15.3 Persisted status projection

The derived status is persisted on `sales_orders` for efficient search but is
not an independent source of truth.

Every Record or Void command recomputes it from the ledger in the same
transaction.

### 15.4 Progress percent

The default progress percent is quantity-based:

~~~text
sum(fulfilled quantities) / sum(ordered quantities) * 100
~~~

It is not amount-weighted.

Line quantities may have different units, so the UI presents the percent as an
operational indicator and always exposes exact per-line quantities in detail.

## 16. Lifecycle model

The canonical statuses are:

- DRAFT.
- CONFIRMED.
- PROCESSING.
- PARTIALLY_FULFILLED.
- FULFILLED.
- CANCELLED.
- CLOSED_PARTIAL.

### 16.1 Transition graph

~~~text
Direct Draft --Confirm--> Confirmed
Quote-derived Draft --Confirm--> Confirmed
Confirmed --Start Fulfillment--> Processing
Processing --Record partial--> Partially Fulfilled
Processing --Record all--> Fulfilled
Partially Fulfilled --Record remainder--> Fulfilled
Partially Fulfilled --Close Remaining--> Closed Partial
Quote-derived Draft --Cancel--> Cancelled
Confirmed --Cancel before any fulfillment--> Cancelled
Processing --Cancel before any fulfillment--> Cancelled
Fulfilled --Void Fulfillment--> Partially Fulfilled or Processing
Partially Fulfilled --Void Fulfillment--> Partially Fulfilled or Processing
~~~

### 16.2 Draft

Draft is not an operational commitment.

Direct Draft permits commercial editing.

Quote-derived Draft permits only approved operational setup fields.

### 16.3 Confirmed

Confirmed means the Order passed all required validation and its commercial
content is locked.

### 16.4 Processing

Processing means fulfillment work has explicitly started but no positive
fulfilled quantity is currently recorded.

### 16.5 Partially Fulfilled

Partially Fulfilled means at least one positive quantity is recorded and at
least one line has remaining quantity.

### 16.6 Fulfilled

Fulfilled means every Order Line is fully fulfilled.

`fulfilledAt` is the timestamp of the command that made all lines complete.

### 16.7 Cancelled

Cancelled means no quantity was fulfilled and the Order will not proceed.

### 16.8 Closed Partial

Closed Partial means some quantity was fulfilled and the remaining quantity
will not be fulfilled.

The UI label is `Partially Fulfilled — Closed`.

## 17. Lifecycle preconditions

### 17.1 Confirm

Confirm requires:

- LINE_ITEM pricing mode.
- At least one valid line.
- Account.
- Valid source relationship.
- Price Book for Direct Orders.
- Currency consistency.
- Reconciled canonical totals.
- Positive ordered quantity on every line.
- Requested Fulfillment Date.
- Valid owner.
- Required customer snapshot fields.
- Current version.

### 17.2 Start Fulfillment

Start Fulfillment requires:

- CONFIRMED status.
- At least one line.
- Current version.
- `sales_order.fulfill` permission.

### 17.3 Record Fulfillment

Record Fulfillment requires:

- PROCESSING or PARTIALLY_FULFILLED status.
- At least one positive submitted line quantity.
- Every submitted line belongs to the Order.
- Every quantity is within the current remaining quantity.
- A Fulfillment Date from Order Date through tenant business date, inclusive.
- A valid Idempotency Key.
- Current version.

### 17.4 Void Fulfillment

Void requires:

- RECORDED event status.
- Event belongs to the Order and tenant.
- Order is not CANCELLED or CLOSED_PARTIAL.
- Nonblank reason.
- Current version.

### 17.5 Cancel

Cancel requires:

- Quote-derived DRAFT, or CONFIRMED/PROCESSING from either source.
- No positive fulfilled quantity.
- Nonblank reason.
- Current version.

A Direct Draft is soft-deleted instead of Cancelled.

### 17.6 Close Remaining

Close Remaining requires:

- PARTIALLY_FULFILLED status.
- At least one remaining quantity.
- Nonblank reason.
- Current version.

## 18. Cancellation, partial close, and correction

### 18.1 Direct Draft deletion

A never-confirmed Direct Draft may be soft-deleted.

The operation does not create a Cancelled Order because no operational
commitment existed.

### 18.2 Quote-derived Draft cancellation

A Quote-derived Draft cannot be deleted because the Accepted Quote handoff
must remain auditable.

Cancel preserves the Order and Quote link.

### 18.3 Cancellation after Confirm

Confirmed or Processing may be Cancelled only while aggregate fulfilled
quantity is zero.

### 18.4 Partial close

An Order with completed quantity is never labeled Cancelled.

Close Remaining:

- Preserves ordered quantity.
- Preserves fulfilled quantity.
- Preserves remaining quantity.
- Records why the remainder stopped.
- Prevents new fulfillment.
- Produces CLOSED_PARTIAL.

### 18.5 Fulfillment correction

Void Fulfillment does not edit or delete the original event.

It records:

- Void reason.
- Void actor.
- Void timestamp.

It then recalculates all line projections and the Order status.

When the result is no longer FULFILLED, `fulfilledAt` is cleared. The original
Fulfilled transition remains visible in status history and the Void action
records the correction.

### 18.6 No hidden quantity rewrite

The system never reduces ordered quantity to make an incomplete Order appear
Fulfilled.

## 19. Status history and audit

Every lifecycle and fulfillment command appends a history row containing:

- Order ID.
- Previous status.
- New status.
- Action code.
- Reason when supplied.
- Related Fulfillment ID when applicable.
- Actor ID.
- Occurred At.
- Resulting Order version.

The action codes include:

- CREATED.
- CONFIRMED.
- FULFILLMENT_STARTED.
- FULFILLMENT_RECORDED.
- FULFILLMENT_VOIDED.
- CANCELLED.
- REMAINING_CLOSED.
- LEGACY_DRAFT_REBUILT.
- SOFT_DELETED.

Status history is append-only.

For CREATED, Previous Status is null. For auditable actions that do not change
status, Previous Status and New Status are equal. Fulfillment Ledger remains
the canonical source for event-line quantity detail.

## 20. Information architecture

### 20.1 Routes

~~~text
/app/sales/orders
/app/sales/orders/new
/app/sales/orders/:id
/app/sales/orders/:id/edit
/app/sales/orders/:id/print
~~~

### 20.2 Route responsibilities

`/app/sales/orders` owns discovery, operational filters, Order Pulse, and
pagination.

`/app/sales/orders/new` creates Direct Orders only.

`/app/sales/orders/:id` owns read-only commercial context, actions,
fulfillment progress, fulfillment timeline, and status history.

`/app/sales/orders/:id/edit` owns source-aware Draft editing.

`/app/sales/orders/:id/print` owns a canonical print projection.

### 20.3 Quote conversion entry

Quote-derived Orders are created from the Accepted Quote action defined by the
Quote design.

The Orders Workspace does not offer a free-form `Create from Quote` selector
that bypasses Quote acceptance and conversion preconditions.

## 21. URL state

The Orders Workspace URL represents:

- Search query.
- Selected operational view.
- Multi-status filter.
- Source Type.
- Account ID.
- Quote ID.
- Opportunity ID.
- Owner Type and Owner ID.
- Currency Code.
- Order Date range.
- Requested Fulfillment Date range.
- Due State.
- Sort field.
- Sort direction.
- Page.
- Page size.

Example:

~~~text
/app/sales/orders?view=in-fulfillment&status=PROCESSING&status=PARTIALLY_FULFILLED&currencyCode=VND&dueState=DUE_SOON&page=0&size=20&sort=requestedFulfillmentDate&direction=asc
~~~

### 21.1 Parse rules

- Unknown enum values are removed.
- Invalid UUID filters are removed.
- Negative page becomes zero.
- Unsupported size becomes the default.
- Inverted date ranges are removed and surfaced as invalid filter state.
- Owner Type and Owner ID are accepted only as a complete pair.
- Multi-status values are deduplicated.

### 21.2 Navigation behavior

- Filter changes use replace navigation while the user is actively editing
  the search field.
- Explicit page and operational-view changes use normal history navigation.
- Back and Forward restore the same list state.
- Returning from detail restores the prior list state.

## 22. Orders Workspace

### 22.1 Page header

The page header uses:

- Title: `Orders`.
- Subtitle: `Manage confirmed sales commitments and line-level fulfillment.`
- Total count from the scoped search response or matching summary response.
- `New Order` action when the actor has `sales_order.write`.
- Refresh as a secondary action.

The header does not claim invoicing or payment reconciliation.

### 22.2 Operational views

The approved views are:

| View | Included statuses |
|---|---|
| All Orders | All normal visible statuses |
| Drafts | DRAFT |
| Ready to Start | CONFIRMED |
| In Fulfillment | PROCESSING, PARTIALLY_FULFILLED |
| Completed | FULFILLED, CLOSED_PARTIAL |
| Cancelled | CANCELLED |

View counts come from the server and never from the visible page.

### 22.3 Filters

The filter bar supports:

- Debounced search.
- Multi-status.
- Source Type.
- Account lookup.
- Quote lookup.
- Opportunity lookup.
- Owner User or Team lookup.
- Currency.
- Order Date range.
- Requested Fulfillment Date range.
- Due State.
- Reset.

### 22.4 Desktop table

The desktop table contains:

- Order Number and Source.
- Account.
- Quote reference when present.
- Status.
- Fulfillment progress.
- Requested Fulfillment Date and due indicator.
- Grand Total with currency.
- Owner.
- Updated At.
- Context action menu.

Order Number is a semantic Link to detail.

The table does not contain:

- Payment Status.
- Settled amount.
- Tracking Number.
- Editable status.
- Generic Edit and Delete icons for every row.

### 22.5 Mobile compact list

Mobile rows become compact Order cards containing:

- Order Number.
- Account.
- Status.
- Grand Total and currency.
- Exact progress label.
- Requested date and due state.
- Source label.
- Context action menu.

The page does not force the full desktop table into horizontal scrolling.

### 22.6 Sorting

Supported sort fields are:

- updatedAt.
- orderDate.
- requestedFulfillmentDate.
- grandTotal.
- orderNumber.

`grandTotal` sort is valid only with `currencyCode` supplied.

## 23. Order Pulse

Order Pulse is a separate server query with filter parity.

### 23.1 Metrics

The response contains:

- Total matching Orders.
- Active Orders.
- Draft count.
- Ready-to-Start count.
- Processing count.
- Partially Fulfilled count.
- Fulfilled count.
- Closed Partial count.
- Cancelled count.
- Due Soon count.
- Overdue count.
- Confirmed Order Value grouped by currency.

### 23.2 Active definition

Active Orders include:

- CONFIRMED.
- PROCESSING.
- PARTIALLY_FULFILLED.

Draft, Fulfilled, Closed Partial, and Cancelled are excluded.

### 23.3 Confirmed Order Value

Confirmed Order Value includes non-deleted Orders that have reached Confirm
and are not Cancelled.

Amounts are grouped by currency. The UI never sums unrelated currencies into
one value.

### 23.4 Due Soon

Due Soon means:

- Active Order.
- Remaining quantity exists.
- Requested Fulfillment Date is from the tenant business date through seven
  calendar days later, inclusive.

### 23.5 Overdue

Overdue means:

- Active Order.
- Remaining quantity exists.
- Requested Fulfillment Date is before the tenant business date.

### 23.6 On Track

On Track means:

- Active Order.
- Remaining quantity exists.
- Requested Fulfillment Date is more than seven calendar days after the tenant
  business date.

### 23.7 Complete and Not Applicable

COMPLETE applies to FULFILLED and CLOSED_PARTIAL.

NOT_APPLICABLE applies to DRAFT and CANCELLED because they are not active
fulfillment commitments.

### 23.8 No page aggregation

Order Pulse does not receive page or size and never derives values from the
visible list.

## 24. Direct Order editor

Direct Order creation and editing use a full page.

### 24.1 Sections

The editor contains:

1. Customer Context.
2. Commercial Context.
3. Fulfillment Setup.
4. Billing Address.
5. Fulfillment Address.
6. Line Items.
7. Customer Reference and Operational Notes.
8. Canonical Totals.

### 24.2 Customer Context

The user selects:

- Account.
- Compatible Contact.
- Compatible Opportunity.
- Owner User or Team.

Free-text Account or owner identity is not allowed.

### 24.3 Commercial Context

The user selects an active Price Book.

The server derives currency.

Changing Account clears incompatible Contact and Opportunity values.

Changing Price Book with existing lines requires explicit confirmation and
clears incompatible lines.

### 24.4 Line editor

The user can:

- Add an active Product through a compatible Price Book Item.
- Reorder Draft lines.
- Change quantity.
- Change sales unit price within supported validation.
- Change discount percent.
- Change tax percent.
- Change description.
- Remove a Draft line.

The UI shows list price, provisional line math, and canonical response values.

### 24.5 Save behavior

Save Draft:

- Sends the full aggregate.
- Uses `If-Match` for an existing Draft.
- Treats absent existing lines as removal.
- Rejects foreign line IDs.
- Replaces provisional totals with canonical totals.
- Keeps the user on the editor.
- Updates the local version from ETag.

### 24.6 Unsaved changes

Navigation away from a dirty editor requires explicit confirmation.

Background query refresh does not overwrite local Draft values.

## 25. Quote-derived Order setup

Quote conversion creates a DRAFT Order and routes to Order detail or setup.

### 25.1 Commercial read-only regions

The following are read-only:

- Account.
- Contact commercial identity.
- Opportunity relationship.
- Quote relationship.
- Price Book.
- Currency.
- Lines.
- Ordered quantities.
- Price, discount, and tax values.
- Commercial totals.

### 25.2 Editable Draft operational regions

The user may complete:

- Requested Fulfillment Date.
- Billing Address Snapshot.
- Fulfillment Address Snapshot.
- Customer Reference.
- Owner when the source owner required a valid fallback or reassignment is
  allowed before Confirm.
- Operational Notes.

### 25.3 Source warning

The page explains that commercial values came from the Accepted Quote and
cannot be changed.

It links to the source Quote when permitted.

### 25.4 No silent divergence

The frontend never enables commercial fields through DOM-only state or request
manipulation. The backend rejects prohibited fields or changed values.

## 26. Order detail

### 26.1 Header

The detail header shows:

- Order Number.
- Status.
- Source.
- Account.
- Quote reference when present.
- Updated At.
- Primary lifecycle action.
- Secondary actions menu.

### 26.2 Summary region

The summary region shows:

- Grand Total and currency.
- Order Date.
- Requested Fulfillment Date.
- Due State.
- Owner.
- Fulfillment progress.
- Ordered, fulfilled, and remaining quantities as explicit labels.

### 26.3 Detail sections

The page contains:

- Overview.
- Line Items.
- Fulfillment Timeline.
- Status History.
- Related Records.
- Audit Metadata.

### 26.4 Line Items

Each line displays:

- SKU and Product name.
- Description and unit.
- Ordered Quantity.
- Fulfilled Quantity.
- Remaining Quantity.
- Progress.
- Commercial pricing.
- Line Total.

### 26.5 Available actions

The page renders actions from the server-provided `availableActions`, filtered
again by known frontend permission state.

The backend remains authoritative.

## 27. Fulfillment user experience

### 27.1 Start Fulfillment

The action uses a focused confirmation dialog.

It explains that Processing means operational work started and that no
quantity is recorded by this action.

### 27.2 Record Fulfillment dialog

The dialog contains:

- Fulfillment Date.
- Optional Reference.
- Optional Note.
- Every line with remaining quantity.
- Ordered, previously fulfilled, and remaining quantity.
- Quantity to record.
- Result preview.

Quantity inputs default to blank, not the full remainder.

At least one line must contain a positive value.

The preview shows the expected resulting status but does not replace backend
validation.

### 27.3 Successful record

After success:

- The dialog closes.
- Detail is replaced with the canonical response.
- Fulfillment timeline refreshes.
- Status history refreshes when status changed.
- List and Order Pulse queries invalidate.
- Focus returns to the action region.
- An accessible status message announces success.

### 27.4 Void Fulfillment

Void is offered only on a RECORDED event when available.

The dialog:

- Identifies the event.
- Shows affected line quantities.
- Requires a reason.
- Explains the expected progress and status change.

### 27.5 Close Remaining

The dialog shows every remaining line and quantity.

It requires a reason and explains that the Order becomes terminal.

### 27.6 Cancel Order

The dialog requires a reason and explains that Cancel is available only when
no fulfilled quantity exists.

### 27.7 Double-submit prevention

Only the active action is disabled during submission.

The client sends one Idempotency Key for one Record Fulfillment intent and
reuses it only when retrying that exact intent.

## 28. Document projection and print view

### 28.1 Canonical source

The print route uses a canonical server projection.

It does not reconstruct commercial data from list rows or local Draft state.

### 28.2 Content

The projection contains:

- Product branding supported by existing assets.
- Order Number.
- Status.
- Order Date.
- Requested Fulfillment Date.
- Customer Snapshot.
- Billing Address Snapshot.
- Fulfillment Address Snapshot.
- Customer Reference.
- Line Items.
- Canonical totals.
- Source Quote reference when present.

Operational notes, internal audit metadata, void reasons, and hidden IDs are
excluded.

### 28.3 Status watermark

- Draft output shows `DRAFT` watermark.
- Cancelled output shows `CANCELLED` watermark.
- Closed Partial output shows `PARTIALLY FULFILLED — CLOSED` watermark.
- Confirmed, Processing, Partially Fulfilled, and Fulfilled outputs show their
  status without claiming an invoice or receipt.

### 28.4 PDF boundary

The action label is `Print / Save as PDF`.

V1 uses browser print. It does not claim a stored, signed, emailed, or delivered
PDF.

## 29. Responsive behavior

### 29.1 Wide desktop

- Order Pulse uses a restrained operational grid.
- Filters stay compact.
- Table columns remain readable.
- Detail uses a main content region and bounded contextual summary.

### 29.2 Laptop

- Nonessential table content compresses before horizontal overflow.
- Actions collapse into a menu when width is constrained.
- Editor totals remain visible without obscuring lines.

### 29.3 Tablet

- Filter controls wrap into structured rows.
- Detail sections become single-column where needed.
- Fulfillment dialogs use available viewport height and preserve actions.

### 29.4 Mobile

- Table becomes compact cards.
- Editor lines become stacked line editors.
- Status, account, due state, progress, and total remain above secondary data.
- Action bar respects safe areas.
- No control depends on hover.

### 29.5 Long content

The design supports:

- Long Order Numbers.
- Long Account names.
- Long Product names.
- Large VND values.
- Decimal currencies.
- Multiple currency groups.
- Long operational references.

No page-level horizontal overflow is allowed.

## 30. Visual system

The visual direction remains restrained professional enterprise CRM.

### 30.1 Hierarchy

- One primary action per state.
- Flat section boundaries.
- Compact operational density.
- Monospace numerals for quantities, currency, references, and dates where
  scanning benefits.
- Progress shown with exact text and a restrained bar.

### 30.2 Status centralization

All Order and fulfillment-event status configuration is added to and imported
from:

~~~text
@/config/crmStatusConfig
~~~

Local Order status maps in API, page, or mock files are prohibited.

### 30.3 Approved semantic palette

| Status | Semantic treatment |
|---|---|
| DRAFT | Slate neutral |
| CONFIRMED | Blue |
| PROCESSING | Purple |
| PARTIALLY_FULFILLED | Amber |
| FULFILLED | Emerald |
| CANCELLED | Rose |
| CLOSED_PARTIAL | Amber with terminal closed label |
| RECORDED fulfillment | Blue or Emerald according to context |
| VOIDED fulfillment | Slate with line-through or Void label |

Color is never the only status signal.

## 31. Permission model

### 31.1 Read permission

`sales_order.read` permits scope-constrained access to:

- Navigation.
- Orders Workspace.
- Order Pulse.
- Order detail.
- Order Lines.
- Fulfillment timeline.
- Status history.
- Print projection.

### 31.2 Write permission

`sales_order.write` permits scope-constrained:

- Direct Order creation.
- Draft save.
- Confirm.
- Cancel.
- Close Remaining.
- Direct Draft soft deletion.

It does not grant fulfillment actions by itself.

### 31.3 Fulfillment permission

`sales_order.fulfill` permits scope-constrained:

- Start Fulfillment.
- Record Fulfillment.
- Void Fulfillment.

It does not grant commercial Draft editing by itself.

This is a new explicit permission. A future implementation registers it in the
backend permission enum, frontend permission constants, role-permission UI,
permission catalogue, and deployment migration. It is not inferred from role
names or silently treated as equivalent to `sales_order.write`.

### 31.4 Quote conversion

Accepted Quote conversion requires:

- `sales_quote.write`.
- `sales_order.write`.
- Scoped access to the Accepted Quote.

### 31.5 No role inference

No frontend or backend behavior infers permission from role name, visual role
label, or assumed hierarchy.

### 31.6 Server action projection

Order detail and summary responses include order-level `availableActions`
derived from:

- Permission.
- Order scope.
- Source Type.
- Pricing Mode.
- Lifecycle status.
- Remaining quantity.
- Record mutability.

Each fulfillment event separately includes event-level `availableActions`
derived from its event status, Order status, permission, scope, and record
mutability. `VOID_FULFILLMENT` appears only in this event-level projection.

The frontend hides unavailable actions, while every endpoint independently
enforces authorization and preconditions.

## 32. Route and action protection

### 32.1 Route gates

- Orders list, detail, and print require `sales_order.read`.
- New and edit routes require `sales_order.write`.
- Opening edit for a non-Draft or unavailable source mode redirects to detail
  with a clear explanation.

### 32.2 Page-action gates

- New Order requires `sales_order.write`.
- Confirm, Cancel, Close Remaining, and Direct Draft Delete require
  `sales_order.write`.
- Start, Record, and Void Fulfillment require `sales_order.fulfill`.

### 32.3 Permission changes during a session

If permission changes after render, the backend denial is authoritative.

The UI refreshes current permission state and does not retry a forbidden
mutation automatically.

## 33. Order data-scope contract

### 33.1 Ownership representation

Order persistence supports:

- `owner_user_id`.
- `owner_team_id`.

Exactly one is non-null.

### 33.2 Scope modes

The Order entity supports:

- OWN.
- TEAM.
- TEAM_TREE.
- TENANT.

### 33.3 Scope predicate

An `OrderScopePredicate` or equivalent dedicated component resolves the
authorized Order predicate.

It does not reuse `AccountScopeSql` as a substitute for Order ownership.

### 33.4 OWN

OWN includes Orders where `owner_user_id` equals the current actor.

Team-owned Orders are not included merely because the actor is a Team member
unless the resolved access explicitly includes Team scope.

### 33.5 TEAM

TEAM includes Orders owned by Teams directly available under the actor's
authorized Team membership contract.

### 33.6 TEAM_TREE

TEAM_TREE includes Orders owned by active descendant Teams in the authorized
Team hierarchy.

The resolver uses the repository-standard hierarchy and membership activity
rules.

### 33.7 TENANT

TENANT includes all non-deleted Orders in the current tenant.

### 33.8 Universal application

The identical Order predicate is applied to:

- Search items.
- Search count.
- Order Pulse.
- Detail.
- Lines.
- Fulfillment history.
- Status history.
- Print projection.
- Draft save.
- Confirm.
- Start Fulfillment.
- Record Fulfillment.
- Void Fulfillment.
- Cancel.
- Close Remaining.
- Direct Draft deletion.
- Quote conversion result lookup.

### 33.9 Non-disclosure

Absent, wrong-tenant, soft-deleted, and out-of-scope IDs all map to
`ORDER_NOT_FOUND` for normal callers.

## 34. Related-entity security

Order authorization does not authorize unrelated entity access.

### 34.1 Account

Account selection and validation require:

- `crm_account.read`.
- Account entity scope.
- Same tenant.
- Non-deleted Account.

### 34.2 Contact

Contact selection and validation require:

- `crm_contact.read`.
- Contact entity scope.
- Same tenant.
- Non-deleted Contact.
- Compatibility with the selected Account.

### 34.3 Opportunity

Opportunity selection and validation require:

- `crm_opportunity.read`.
- Opportunity entity scope.
- Same tenant.
- Non-deleted Opportunity.
- Compatibility with the selected Account.

### 34.4 Quote

Quote conversion and projection require:

- Appropriate Quote permission.
- Quote entity scope.
- Same tenant.
- Latest revision.
- Accepted effective status.
- No soft deletion.

### 34.5 Catalogue

Direct line selection requires:

- `sales_catalog.read`.
- Catalogue entity scope where configured.
- Active Product.
- Active Price Book.
- Active Price Book Item.
- Product and Price Book Item consistency.
- Price Book and Order currency consistency.

### 34.6 Owner target

Owner User or Team must be active and assignable under the platform ownership
contract.

An unauthorized owner ID is rejected without disclosing private membership or
Team data.

## 35. Frontend component boundaries

The current monolithic page is replaced with focused units.

### 35.1 Pages

- `OrdersWorkspacePage` owns URL state and list composition.
- `NewOrderPage` owns Direct Order creation.
- `OrderEditPage` owns source-aware Draft editing.
- `OrderDetailPage` owns detail and operational actions.
- `OrderPrintPage` owns canonical print layout.

### 35.2 Workspace components

- `OrderPulse` renders summary data.
- `OrderViewTabs` renders operational views.
- `OrderFilterBar` parses and serializes filters.
- `OrdersTable` renders desktop results.
- `OrderCompactList` renders mobile results.
- `OrderDueIndicator` renders exact due state.
- `OrderProgress` renders exact fulfillment progress.
- `OrderActionsMenu` renders available row actions.

### 35.3 Editor components

- `OrderCustomerSection` owns Account, Contact, and Opportunity fields.
- `OrderCommercialSection` owns source, Price Book, and currency context.
- `OrderAddressSection` owns one address snapshot.
- `OrderLinesEditor` owns line collection behavior.
- `OrderLineEditorRow` owns one Direct Draft line.
- `OrderTotalsPanel` renders provisional and canonical totals.
- `OrderEditorActions` owns Save, Confirm navigation, and dirty-state behavior.

### 35.4 Detail components

- `OrderDetailHeader` renders identity, status, and action region.
- `OrderSummaryPanel` renders total, owner, dates, due state, and progress.
- `OrderLinesDetail` renders ordered and fulfilled quantities.
- `FulfillmentTimeline` renders immutable events.
- `OrderStatusHistory` renders lifecycle history.
- `OrderRelatedRecords` renders scoped semantic links.

### 35.5 Action dialogs

- `StartFulfillmentDialog`.
- `RecordFulfillmentDialog`.
- `VoidFulfillmentDialog`.
- `CancelOrderDialog`.
- `CloseRemainingDialog`.
- `DeleteDirectDraftDialog`.

Each dialog has one action purpose and a typed request contract.

### 35.6 Service boundary

`orderApi` exports typed requests and responses only.

It does not:

- Normalize untyped values.
- Fabricate labels.
- Generate Order Numbers.
- Hardcode Account IDs.
- Hardcode owner names.
- Hardcode VND.
- Inject payment state.
- Merge request values over canonical responses.

### 35.7 Query boundary

Order query hooks own:

- Query keys.
- Cancellation signals.
- Pagination.
- Summary isolation.
- Detail ETag capture.
- Mutation invalidation.

Presentational components do not call `apiFetch` directly.

## 36. Backend component boundaries

### 36.1 Order aggregate

The domain aggregate owns:

- Source invariants.
- Draft mutability.
- Commercial locking.
- Lifecycle transitions.
- Cancellation and partial-close rules.
- Version checks.

### 36.2 Order calculator

`OrderCalculator` or equivalent owns Direct Order calculations and
reconciliation.

It shares the canonical currency precision and rounding policy used by Quotes.

### 36.3 Quote conversion service

The conversion service owns:

- Accepted Quote preconditions.
- Idempotent result lookup.
- Header copy.
- Customer snapshot copy.
- Line copy.
- Amount reconciliation.
- Source and commercial-lock metadata.
- Quote and Order linkage.

### 36.4 Fulfillment service

The fulfillment application service owns:

- Start.
- Record.
- Void.
- Quantity reconciliation.
- Status derivation.
- Fulfilled timestamp changes.
- Status history append.

### 36.5 Order repository

The aggregate repository loads and persists:

- Header.
- Lines.
- Version.
- Source metadata.
- Snapshots.

Mutation lookup is scope-safe.

### 36.6 Fulfillment repository

The fulfillment repository persists immutable event headers and event lines.

It supports scope-safe event history and idempotency lookup.

### 36.7 Query service

`OrderQueryService` owns read projections for:

- Search.
- Search count.
- Order Pulse.
- Detail.
- Fulfillment history.
- Status history.
- Print.

### 36.8 Status history repository

History insertion is append-only and occurs in the lifecycle transaction.

### 36.9 Error mapping

Domain and application failures map to distinct stable error codes.

Lifecycle invalidity is not mapped to version conflict.

## 37. Persistence target

### 37.1 `sales_orders`

The target header adds or formalizes:

- `source_type`.
- `pricing_mode`.
- `price_book_id`.
- `owner_team_id`.
- Customer snapshot fields or canonical JSON.
- Billing address snapshot.
- Fulfillment address snapshot.
- `fulfillment_started_at`.
- `closed_partial_at`.
- `close_remaining_reason`.
- `commercial_locked_at`.
- `operational_notes`.
- `deleted_at`.
- `deleted_by`.
- CLOSED_PARTIAL in the status constraint.

### 37.2 `sales_order_items`

The existing table evolves to represent canonical Order Lines.

It adds or formalizes:

- Stable position.
- Price Book Item ID.
- Quote Line ID.
- Complete snapshots.
- List Unit Price.
- Sales Unit Price.
- Discount Percent.
- Tax Percent.
- Canonical line amounts.

The existing `fulfilled_quantity` column is not a command input. If retained as
a cached projection, it is updated only from the fulfillment ledger in the
same transaction and is subject to reconciliation checks.

### 37.3 `sales_order_fulfillments`

The event table contains:

- Tenant and event ID.
- Order ID.
- Fulfillment Date.
- Reference.
- Note.
- RECORDED or VOIDED status.
- Record and void audit metadata.
- Void reason.
- Idempotency Key hash or safe normalized value.

### 37.4 `sales_order_fulfillment_items`

The event-line table contains:

- Tenant and event-line ID.
- Fulfillment ID.
- Order Line ID.
- Positive quantity.
- Audit metadata.

The database prevents duplicate Order Line entries inside one fulfillment
event.

### 37.5 `sales_order_status_history`

The history table contains the fields defined by the audit contract.

### 37.6 Constraints

Database constraints enforce:

- Tenant-scoped foreign keys.
- Tenant-unique Order Number.
- Exactly one owner where supported by the database strategy.
- Valid status values.
- Valid Source Type and Pricing Mode.
- Nonnegative amounts.
- Positive ordered and fulfillment quantities.
- Valid dates.
- One Quote conversion result per Quote.
- Unique fulfillment Idempotency Key per Order intent.

### 37.7 Indexes

Target indexes support:

- Tenant, owner User, status, and requested date.
- Tenant, owner Team, status, and requested date.
- Tenant, Account, status, and requested date.
- Tenant, Quote ID.
- Tenant, Opportunity ID.
- Tenant, Source Type, and status.
- Order Line lookup by Order and position.
- Fulfillment lookup by Order and recorded time.
- Fulfillment line lookup by Order Line.
- Status history lookup by Order and occurred time.

## 38. Frontend query behavior

### 38.1 Query keys

List query keys include every server filter, sort, page, and size value.

Summary query keys include the matching non-page and non-sort filters.

Detail, fulfillment history, status history, and document use separate keys.

### 38.2 Search debounce

Search input is debounced before URL and query updates.

The visible input remains immediate.

### 38.3 Cancellation

Superseded search and filter requests use the request signal and are cancelled
when the API client supports it.

### 38.4 Previous data

Page and filter changes may retain prior list data during background fetch,
but the UI labels the content as refreshing.

### 38.5 Mutation invalidation

After mutation success, the client invalidates:

- The affected Order detail.
- Fulfillment history.
- Status history.
- The current list.
- Order Pulse.
- Source Quote detail after conversion when applicable.

### 38.6 No broad cache clearing

The client does not clear all application queries after each Order action.

### 38.7 Canonical replacement

A successful save or action replaces the current Order cache with the
canonical response before related background refetches.

## 39. Shared API types

~~~ts
type OrderSourceType = 'DIRECT' | 'QUOTE_CONVERSION';

type OrderPricingMode = 'LINE_ITEM' | 'LEGACY_AMOUNT_ONLY';

type OrderStatus =
  | 'DRAFT'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'PARTIALLY_FULFILLED'
  | 'FULFILLED'
  | 'CANCELLED'
  | 'CLOSED_PARTIAL';

type FulfillmentEventStatus = 'RECORDED' | 'VOIDED';

type OrderDueState =
  | 'ON_TRACK'
  | 'DUE_SOON'
  | 'OVERDUE'
  | 'COMPLETE'
  | 'NOT_APPLICABLE';

type OrderOwnerType = 'USER' | 'TEAM';

type OrderAction =
  | 'EDIT_DRAFT'
  | 'DELETE_DIRECT_DRAFT'
  | 'CONFIRM'
  | 'START_FULFILLMENT'
  | 'RECORD_FULFILLMENT'
  | 'CANCEL'
  | 'CLOSE_REMAINING'
  | 'PRINT';

type FulfillmentEventAction = 'VOID_FULFILLMENT';

interface OrderReference {
  id: string;
  label: string;
  routeAvailable: boolean;
}

interface OrderOwnerInput {
  type: OrderOwnerType;
  id: string;
}

interface OrderOwnerReference extends OrderOwnerInput {
  label: string;
}

interface OrderAddressInput {
  addressLine1: string | null;
  addressLine2: string | null;
  locality: string | null;
  region: string | null;
  postalCode: string | null;
  countryCode: string | null;
}

interface OrderCustomerSnapshotInput {
  legalName: string;
  contactName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
}

interface OrderAmountsResponse {
  currencyCode: string;
  subtotal: string;
  discountTotal: string;
  taxTotal: string;
  shippingTotal: string;
  grandTotal: string;
}

interface OrderFulfillmentProgress {
  orderedQuantity: string;
  fulfilledQuantity: string;
  remainingQuantity: string;
  progressPercent: string;
}

interface OrderAppliedFilters {
  q: string | null;
  statuses: OrderStatus[];
  sourceType: OrderSourceType | null;
  account: OrderReference | null;
  quote: OrderReference | null;
  opportunity: OrderReference | null;
  owner: OrderOwnerReference | null;
  currencyCode: string | null;
  orderFrom: string | null;
  orderTo: string | null;
  requestedFrom: string | null;
  requestedTo: string | null;
  dueState: OrderDueState | null;
}
~~~

## 40. Orders Search API

### 40.1 Endpoint

~~~http
GET /api/orders
~~~

### 40.2 Query parameters

| Parameter | Type | Required | Rules |
|---|---|---:|---|
| q | string | No | Trimmed and bounded search |
| status | repeated enum | No | Canonical Order Status |
| sourceType | enum | No | DIRECT or QUOTE_CONVERSION |
| accountId | UUID | No | Scope-safe Account filter |
| quoteId | UUID | No | Scope-safe Quote filter |
| opportunityId | UUID | No | Scope-safe Opportunity filter |
| ownerType | enum | Pair | USER or TEAM |
| ownerId | UUID | Pair | Required with ownerType |
| currencyCode | string | No | Three uppercase letters |
| orderFrom | date | Pair | Inclusive |
| orderTo | date | Pair | Inclusive and not before orderFrom |
| requestedFrom | date | Pair | Inclusive |
| requestedTo | date | Pair | Inclusive and not before requestedFrom |
| dueState | enum | No | ON_TRACK, DUE_SOON, OVERDUE, COMPLETE, NOT_APPLICABLE |
| sort | enum | No | updatedAt, orderDate, requestedFulfillmentDate, grandTotal, orderNumber |
| direction | enum | No | asc or desc |
| page | integer | No | Default 0 |
| size | integer | No | Default 20, maximum 100 |

### 40.3 Search fields

`q` searches normalized values for:

- Order Number.
- Customer Reference.
- Customer Snapshot name.
- Resolved Account name when permitted by the projection.
- Source Quote Number when permitted by the projection.

### 40.4 Summary item

~~~ts
interface OrderSummaryItem {
  id: string;
  orderNumber: string;
  sourceType: OrderSourceType;
  pricingMode: OrderPricingMode;
  account: OrderReference;
  quote: OrderReference | null;
  owner: OrderOwnerReference;
  status: OrderStatus;
  dueState: OrderDueState;
  amounts: OrderAmountsResponse;
  progress: OrderFulfillmentProgress;
  lineCount: number;
  orderDate: string;
  requestedFulfillmentDate: string | null;
  updatedAt: string;
  version: number;
  availableActions: OrderAction[];
}
~~~

### 40.5 Response

The endpoint returns the repository-standard PageResult shape with:

- `items`.
- `page`.
- `size`.
- `totalElements`.
- `totalPages`.

## 41. Order Pulse API

### 41.1 Endpoint

~~~http
GET /api/orders/summary
~~~

### 41.2 Filter parity

Summary accepts the same non-page and non-sort filters as Search.

### 41.3 Response

~~~ts
interface OrderPulseCurrencyGroup {
  currencyCode: string;
  confirmedOrderValue: string;
  confirmedOrderCount: number;
}

interface OrderPulseResponse {
  appliedFilters: OrderAppliedFilters;
  asOf: string;
  tenantTimezone: string;
  totalCount: number;
  activeCount: number;
  draftCount: number;
  readyToStartCount: number;
  processingCount: number;
  partiallyFulfilledCount: number;
  fulfilledCount: number;
  closedPartialCount: number;
  cancelledCount: number;
  dueSoonCount: number;
  overdueCount: number;
  currencyGroups: OrderPulseCurrencyGroup[];
}
~~~

### 41.4 Time basis

Due metrics use tenant-local business date and return `asOf` plus
`tenantTimezone`.

## 42. Order Detail and history read APIs

### 42.1 Detail endpoint

~~~http
GET /api/orders/{id}
~~~

The response includes:

- Identity and source.
- Pricing Mode.
- Scoped related references.
- Owner.
- Status and due state.
- Customer and address snapshots.
- Ordered lines.
- Canonical amounts.
- Fulfillment progress.
- Lifecycle timestamps and reasons.
- Available actions.
- Version.

The response includes:

~~~http
ETag: "{version}"
~~~

### 42.2 Line response

~~~ts
interface OrderLineResponse {
  id: string;
  position: number;
  productId: string | null;
  priceBookItemId: string | null;
  quoteLineId: string | null;
  sku: string | null;
  productName: string;
  unit: string | null;
  description: string | null;
  quantity: string;
  fulfilledQuantity: string;
  remainingQuantity: string;
  progressPercent: string;
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

### 42.3 Fulfillment history

~~~http
GET /api/orders/{id}/fulfillments?page=0&size=20
~~~

The response is newest first with stable ID ordering.

Every event includes all event lines, actor references allowed by the
projection, void metadata, and event-specific available actions.

### 42.4 Status history

~~~http
GET /api/orders/{id}/history?page=0&size=20
~~~

The response is newest first with stable ID ordering.

## 43. Direct Create and Draft Save APIs

### 43.1 Create Direct Order

~~~http
POST /api/orders
Idempotency-Key: order-create-7fa9f4aa-5b5e-41f4-8637-4778664f58db
~~~

Request:

~~~ts
interface CreateDirectOrderRequest {
  sourceType: 'DIRECT';
  accountId: string;
  contactId: string | null;
  opportunityId: string | null;
  priceBookId: string;
  owner: OrderOwnerInput | null;
  orderDate: string;
  requestedFulfillmentDate: string | null;
}
~~~

The initial Direct Draft may contain no lines.

The backend generates ID, Order Number, DRAFT status, LINE_ITEM mode, currency,
snapshots, and version 1.

Response:

~~~http
HTTP/1.1 201 Created
Location: /api/orders/{id}
ETag: "1"
Idempotency-Replayed: false
~~~

### 43.2 Direct create idempotency

The backend stores a normalized intent hash with the Idempotency Key before
returning success.

- Replaying the same key with the same normalized create intent returns the
  same Order identity and current canonical Order without creating another
  row.
- A successful replay returns `200 OK`, the existing Location, the current
  ETag, and `Idempotency-Replayed: true`.
- Reusing the key with a different normalized create intent returns
  `ORDER_IDEMPOTENCY_CONFLICT`.

### 43.3 Save Draft

~~~http
PUT /api/orders/{id}
If-Match: "{version}"
~~~

### 43.4 Direct Draft request

~~~ts
interface DirectOrderLineInput {
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

interface SaveDirectOrderDraftRequest {
  sourceType: 'DIRECT';
  accountId: string;
  contactId: string | null;
  opportunityId: string | null;
  priceBookId: string;
  owner: OrderOwnerInput;
  orderDate: string;
  requestedFulfillmentDate: string | null;
  customerSnapshot: OrderCustomerSnapshotInput;
  billingAddress: OrderAddressInput;
  fulfillmentAddress: OrderAddressInput;
  customerReference: string | null;
  operationalNotes: string | null;
  shippingTotal: string;
  lines: DirectOrderLineInput[];
}
~~~

Lines absent from the submitted collection are removed in the same
transaction. Existing line IDs must belong to the same Order.

### 43.5 Quote-derived Draft request

~~~ts
interface SaveQuoteDerivedOrderDraftRequest {
  sourceType: 'QUOTE_CONVERSION';
  owner: OrderOwnerInput;
  requestedFulfillmentDate: string | null;
  billingAddress: OrderAddressInput;
  fulfillmentAddress: OrderAddressInput;
  customerReference: string | null;
  operationalNotes: string | null;
}
~~~

Commercial fields are absent from this request.

### 43.6 Save response

Successful Draft save returns the canonical Order and updated ETag.

`PUT /api/orders/{id}` accepts DRAFT only. Confirmed and later Orders cannot
use Draft save to change operational or commercial fields.

### 43.7 Quote conversion cross-contract

The Accepted Quote endpoint remains:

~~~http
POST /api/quotes/{quoteId}/convert-to-order
If-Match: "{quoteVersion}"
~~~

Once the Order Line subsystem in this specification is implemented, conversion
creates the complete Quote-derived DRAFT Order aggregate in one transaction,
including lines, snapshots, exact amounts, source metadata, and commercial
lock.

The response contains the canonical Order, its route ID, and Order ETag. This
completes and supersedes the temporary header-only handoff boundary documented
by the earlier Quote specification. The API reference must not claim the
complete handoff until the full behavior is implemented.

## 44. Lifecycle Action APIs

All action endpoints require:

~~~http
If-Match: "{version}"
~~~

Successful non-delete actions return the canonical Order and updated ETag.

### 44.1 Confirm

~~~http
POST /api/orders/{id}/confirm
~~~

No body is required.

### 44.2 Start Fulfillment

~~~http
POST /api/orders/{id}/start-fulfillment
~~~

No body is required.

### 44.3 Cancel

~~~http
POST /api/orders/{id}/cancel
~~~

~~~json
{
  "reason": "Customer withdrew the order before fulfillment began."
}
~~~

### 44.4 Close Remaining

~~~http
POST /api/orders/{id}/close-remaining
~~~

~~~json
{
  "reason": "Customer accepted the delivered quantity and released the remaining commitment."
}
~~~

### 44.5 Soft-delete Direct Draft

~~~http
DELETE /api/orders/{id}
~~~

Only a never-confirmed Direct Draft may be soft-deleted.

Successful deletion returns `204 No Content` without a response body or new
ETag.

## 45. Fulfillment Action APIs

### 45.1 Record Fulfillment

~~~http
POST /api/orders/{id}/fulfillments
If-Match: "{version}"
Idempotency-Key: fulfillment-9294d09f-f255-4128-ab08-95cd27dd91bb
~~~

Request:

~~~ts
interface RecordFulfillmentLineInput {
  orderLineId: string;
  quantity: string;
}

interface RecordFulfillmentRequest {
  fulfillmentDate: string;
  reference: string | null;
  note: string | null;
  lines: RecordFulfillmentLineInput[];
}
~~~

Response contains:

- Canonical updated Order.
- Created Fulfillment ID.
- Updated ETag.
- `idempotentReplay: false`.

### 45.2 Idempotent replay

Idempotency lookup occurs before expected-version rejection for a key that
already has a recorded result. This lets an exact network retry succeed even
though the first request incremented the Order version.

Replaying the same Idempotency Key with the same normalized intent returns:

- The original Fulfillment ID.
- The current canonical Order visible to the actor.
- The current ETag.
- `idempotentReplay: true`.

Reusing the key with a different payload or Order returns
`ORDER_IDEMPOTENCY_CONFLICT`.

### 45.3 Void Fulfillment

~~~http
POST /api/orders/{id}/fulfillments/{fulfillmentId}/void
If-Match: "{version}"
~~~

~~~json
{
  "reason": "The completed quantity was recorded against the wrong line."
}
~~~

The response contains the canonical updated Order, updated fulfillment event,
and new ETag.

## 46. Print API

### 46.1 Endpoint

~~~http
GET /api/orders/{id}/document
~~~

The endpoint returns a scope-safe canonical document projection.

### 46.2 Print route behavior

The frontend print route:

- Fetches the document projection.
- Renders print-safe HTML.
- Uses browser print.
- Does not mutate the Order.
- Does not report that a PDF was stored or delivered.

## 47. Request validation

### 47.1 Strings

- Customer Reference maximum is 191 characters.
- Fulfillment Reference maximum is 191 characters.
- Transition and void reasons are required where specified and have a maximum
  of 255 characters.
- Operational Notes maximum is 2,000 characters.
- Fulfillment Note maximum is 1,000 characters.
- Required strings are trimmed and cannot become blank.

### 47.2 Dates

- Order Date is required.
- Requested Fulfillment Date is required before Confirm.
- Requested Fulfillment Date cannot be before Order Date.
- Fulfillment Date cannot be before Order Date.
- Fulfillment Date cannot be after the tenant business date.

### 47.3 Owner pair

Owner Type and Owner ID are atomic.

Incomplete or invalid pairs are rejected.

### 47.4 Direct lines

- Position values are unique and normalized.
- Product and Price Book Item IDs are required.
- Quantity is positive.
- Monetary inputs are nonnegative.
- Percent inputs are within supported range.
- Foreign or cross-tenant line IDs are rejected without disclosure.
- Duplicate Product lines may exist only as intentionally distinct commercial
  lines; the UI warns and never merges them silently.

### 47.5 Fulfillment lines

- Each Order Line appears at most once per request.
- Quantity is positive.
- Quantity does not exceed current remaining quantity.
- At least one line is supplied.
- Every line belongs to the target Order.

### 47.6 Currency

Currency code is three uppercase letters.

Direct currency is server-derived from Price Book. Quote-derived currency is
copied from the Accepted Quote.

### 47.7 Idempotency Key

The key:

- Is required for Direct create and Record Fulfillment.
- Is 8 through 128 visible ASCII token characters.
- Is scoped to tenant and operation intent.
- Is never logged with sensitive request content.

## 48. Error contract

The target API uses stable error codes.

| HTTP | Code | Meaning |
|---:|---|---|
| 400 | INVALID_PAYLOAD | Request validation failed |
| 400 | ORDER_FILTER_INVALID | Query filter is malformed |
| 400 | ORDER_IF_MATCH_INVALID | If-Match is malformed or unsupported |
| 400 | ORDER_IDEMPOTENCY_KEY_INVALID | Idempotency Key is missing or malformed where required |
| 401 | AUTHENTICATION_REQUIRED | Authentication is missing or invalid |
| 403 | ACCESS_DENIED | Permission or usable scope is missing |
| 404 | ORDER_NOT_FOUND | Order is absent, deleted, wrong-tenant, or out of scope |
| 404 | ORDER_LINE_NOT_FOUND | Submitted line is absent or unavailable |
| 404 | ORDER_FULFILLMENT_NOT_FOUND | Fulfillment event is absent or unavailable |
| 404 | ORDER_ACCOUNT_INVALID | Account is unavailable under Account scope |
| 404 | ORDER_CONTACT_INVALID | Contact is unavailable or incompatible |
| 404 | ORDER_OPPORTUNITY_INVALID | Opportunity is unavailable or incompatible |
| 404 | ORDER_QUOTE_INVALID | Quote is unavailable or ineligible |
| 404 | ORDER_PRICE_BOOK_INVALID | Price Book is unavailable or inactive |
| 404 | ORDER_PRODUCT_INVALID | Product or Price Book Item is unavailable |
| 409 | ORDER_NUMBER_ALREADY_EXISTS | Server-generated number collided |
| 409 | ORDER_VERSION_CONFLICT | If-Match does not match current version |
| 409 | ORDER_IDEMPOTENCY_CONFLICT | Idempotency Key was reused for a different intent |
| 409 | ORDER_COMMERCIAL_LOCKED | Requested edit targets locked commercial data |
| 409 | ORDER_IMMUTABLE | Requested mutation targets a terminal immutable Order |
| 409 | ORDER_QUOTE_ALREADY_CONVERTED | Quote already has an Order result that cannot be returned in context |
| 422 | ORDER_STATUS_INVALID | Lifecycle transition is invalid |
| 422 | ORDER_LINES_REQUIRED | Confirm requires at least one valid line |
| 422 | ORDER_CURRENCY_MISMATCH | Order, Price Book, or line currencies differ |
| 422 | ORDER_TOTAL_INVALID | Recalculated aggregate violates constraints |
| 422 | ORDER_DATE_INVALID | Date relation is invalid |
| 422 | ORDER_REASON_REQUIRED | Action reason is missing |
| 422 | ORDER_FULFILLMENT_REQUIRED | Record request contains no positive quantity |
| 422 | ORDER_OVER_FULFILLMENT | Submitted quantity exceeds remaining quantity |
| 422 | ORDER_FULFILLMENT_VOIDED | Event is already voided |
| 422 | ORDER_REMAINING_REQUIRED | Close Remaining requires positive remaining quantity |
| 422 | ORDER_LEGACY_ACTION_UNAVAILABLE | Legacy Order cannot perform the requested action |
| 428 | ORDER_IF_MATCH_REQUIRED | A mutation after create omitted If-Match |

The UI maps each code to a specific explanation and next step.

## 49. Loading, empty, refresh, and error states

### 49.1 Initial list loading

The page shows:

- Order Pulse skeleton.
- Shape-matched table or compact-list skeleton.
- Disabled pagination placeholder.

No business values appear before data arrives.

### 49.2 Background refresh

Existing data remains visible with a refreshing indicator.

The page does not replace populated content with a full-page spinner.

### 49.3 First-use empty

When no Order exists and no filter is active:

- Explain the purpose of Orders.
- Offer New Order when permitted.
- Do not imply an error.

### 49.4 Filtered empty

When filters produce no result:

- State that no Orders match.
- Preserve active filters.
- Offer Reset Filters.
- Do not present New Order as the only recovery action.

### 49.5 Partial summary failure

List remains usable.

Order Pulse shows its own error and Retry action.

### 49.6 Fatal list failure

The result area shows a bounded error with Retry.

The page header and safe filter state remain visible.

### 49.7 Detail not found and forbidden

Not found and forbidden use different product states.

Neither state renders stale cached Order data as authoritative.

### 49.8 Validation failure

The editor identifies the exact field or line and focuses the first invalid
control after summary announcement.

### 49.9 Version conflict

The UI:

- Preserves local values.
- Explains that the server version changed.
- Offers Reload Current Order.
- Offers Review Local Values when applicable.
- Never automatically resubmits over the new version.

### 49.10 Idempotent replay and conflict

A successful replay resolves to the original result.

A conflicting key shows a clear error and does not generate a new key for an
automatic hidden retry.

### 49.11 Action pending state

The active action is disabled and labeled as pending.

Unrelated read navigation remains available when safe.

## 50. Accessibility contract

### 50.1 Semantics

- Orders table has a caption.
- Headers use table-header semantics.
- Order Numbers use semantic Links.
- Progress uses accessible text and progress semantics where appropriate.
- Forms use associated labels.
- Required state is programmatically exposed.

### 50.2 Keyboard

Keyboard users can:

- Reach every filter and action.
- Add, edit, remove, and reorder Direct Draft lines.
- Operate action menus.
- Complete every dialog.
- Dismiss nonblocking overlays.

### 50.3 Focus

- Opening a dialog moves focus to its heading or first meaningful control.
- Closing returns focus to the trigger.
- Validation moves focus to the first invalid field after announcing a
  summary.
- Route navigation moves focus to the page heading.

### 50.4 Async announcements

Loading completion, save success, lifecycle changes, fulfillment recording,
void result, and errors are announced without duplicative noise.

### 50.5 Visual access

- Status is not color-only.
- Progress is not bar-only.
- Focus-visible treatment is preserved.
- Text and interactive contrast meet the project accessibility target.
- Reduced-motion preference is honored.

### 50.6 Touch

Mobile actions have adequate target size and separation.

Sticky controls do not cover focused inputs or dialog actions.

## 51. English-only runtime

All runtime labels, validation messages, empty states, toasts, dialogs,
document copy, and API-facing fallback messages are English.

Legacy Vietnamese demo labels are not imported into runtime normalization.

Dates and numbers use the configured English locale presentation while
preserving tenant timezone and explicit currency codes.

## 52. Performance and observability

### 52.1 Query performance

- Search count and page queries use the identical indexed scope and filter
  predicate.
- Order Pulse aggregates on the server.
- Detail loads header and lines without per-line Product queries.
- Fulfillment history loads event lines in bounded queries.
- Account, Quote, Opportunity, and owner labels use joined or batched
  projections.
- No Account, owner, Product, or Quote N+1 is allowed.

### 52.2 Frontend performance

- Search is debounced.
- Superseded requests are cancelled.
- Query keys prevent duplicate concurrent requests for one state.
- Summary and list refresh independently.
- Large line editors avoid unnecessary rerender of unaffected rows.
- No new animation or chart dependency is required.

### 52.3 Operational logging

Structured logs include safe identifiers and result codes for:

- Order create.
- Draft save.
- Quote conversion.
- Confirm.
- Start Fulfillment.
- Record Fulfillment.
- Void Fulfillment.
- Cancel.
- Close Remaining.
- Soft deletion.
- Version conflict.
- Scope denial.
- Idempotency replay and conflict.

Sensitive notes, addresses, contacts, and full request bodies are not logged.

### 52.4 Metrics

Useful metrics include:

- Search latency.
- Summary latency.
- Detail latency.
- Draft save latency.
- Quote conversion result rate.
- Fulfillment command latency.
- Version-conflict rate.
- Over-fulfillment rejection rate.
- Invalid-transition rate.
- Idempotent replay rate.
- Document projection failure rate.

## 53. Legacy compatibility and migration

### 53.1 Classification

Pre-cutover Orders are `LEGACY_AMOUNT_ONLY` unless a deterministic migration
proves that existing Order Items are complete, canonical, and reconcile to the
stored header totals.

No line data is inferred from header amounts.

### 53.2 Legacy display

Legacy Orders remain visible with:

- Stored header relationships.
- Stored status.
- Stored amounts and currency.
- Existing lifecycle timestamps.
- A visible legacy limitation label.

### 53.3 Prohibited fabrication

Migration does not create:

- A generic Product.
- Quantity one.
- A synthetic Package line.
- A guessed price.
- A guessed discount.
- A guessed tax.
- A guessed fulfilled quantity.
- A guessed fulfillment event.
- A guessed payment status.
- A guessed customer or owner label.

### 53.4 Legacy Draft rebuild

A Legacy Direct Draft may open the Line-Item editor.

The first valid full Draft save atomically:

- Creates canonical lines.
- Recalculates header totals.
- Switches Pricing Mode to LINE_ITEM.
- Appends `LEGACY_DRAFT_REBUILT` history.

Until that save succeeds, the original legacy stored amounts remain intact.

### 53.5 Legacy active actions

Legacy Confirmed or Processing Orders may be Cancelled when no stored or
canonical evidence indicates fulfilled quantity.

They cannot:

- Start Fulfillment.
- Record Fulfillment.
- Void Fulfillment.
- Close Remaining.
- Be edited commercially.

### 53.6 Legacy terminal Orders

Legacy Fulfilled and Cancelled Orders are historical read-only records.

Legacy Partially Fulfilled Orders are historical read-only because v1 cannot
invent their completed event quantities.

### 53.7 Legacy print

Legacy print may show header totals and a clear `Line-item detail unavailable`
notice.

It does not display synthetic lines.

### 53.8 Cutover safety

Migration is tenant-safe, restartable, and idempotent.

It records classification counts and reconciliation failures without logging
customer data.

## 54. API-reference synchronization

A future implementation changing Sales Order APIs must update:

~~~text
docs/api-reference.md
~~~

The implemented section must include:

- Authentication.
- Permissions.
- Entity data scope.
- Search and summary filters.
- Request bodies.
- Decimal-string fields.
- Source and Pricing Mode.
- Commercial lock behavior.
- Lifecycle preconditions.
- Fulfillment event semantics.
- Idempotency behavior.
- If-Match and ETag behavior.
- Response fields.
- Status and error codes.
- Print projection.
- Legacy behavior.
- Quote conversion behavior.

The reference must remove claims for behavior that is not implemented.

This design-only task does not change the API reference.

## 55. Acceptance criteria

### 55.1 Data integrity

- No frontend Order field is fabricated.
- No Account, Contact, owner, date, payment, or item-count fallback is
  fabricated.
- Order Number is server-generated.
- Every LINE_ITEM total comes from canonical lines.
- Monetary and quantity values remain decimal-safe.
- Summary amounts are currency-specific.
- True zero remains zero.

### 55.2 Source integrity

- Direct and Quote-derived sources are explicit.
- Source Type is immutable.
- Accepted Quote conversion copies every canonical line exactly once.
- Quote-derived amounts match the source Quote.
- Quote conversion does not reprice.
- One Accepted Quote produces at most one Order result.
- Repeated conversion returns the linked Order.

### 55.3 Commercial lock integrity

- Direct Draft is commercially editable.
- Quote-derived Order is commercially locked from creation.
- Confirm locks Direct commercial data.
- Locked fields cannot be changed through request manipulation.
- No generic update changes status.

### 55.4 Calculation integrity

- Direct line formulas match the approved contract.
- Header totals equal canonical lines plus shipping.
- Detail, summary, and print amounts agree.
- Quote-derived Order and Accepted Quote amounts agree.
- Rounding policy is consistent.
- Java money and quantities do not use double or float.

### 55.5 Lifecycle integrity

- Confirm works only from Draft.
- Start works only from Confirmed.
- Record works only from Processing or Partially Fulfilled.
- Cancel requires zero fulfilled quantity.
- Close Remaining requires partial fulfillment.
- Fulfilled cannot be Cancelled.
- Closed Partial cannot receive new fulfillment.
- Direct Draft deletion is soft deletion.
- Quote-derived Draft cannot be deleted.
- Every transition appends history.

### 55.6 Fulfillment integrity

- Every event has at least one positive line.
- No event line exceeds remaining quantity.
- Concurrent requests cannot over-fulfill.
- Multiple events may fulfill one Order Line.
- Fulfilled Quantity is derived from non-voided events.
- Void preserves the original event.
- Void recalculates line progress and Order status.
- Record Fulfillment is idempotent.
- Direct fulfilled-quantity mutation is unavailable.

### 55.7 Partial-close integrity

- Ordered quantity remains unchanged.
- Fulfilled quantity remains auditable.
- Remaining quantity remains visible.
- Close reason is required.
- CLOSED_PARTIAL is terminal.
- The UI does not label a partially completed Order as Cancelled.

### 55.8 Security integrity

- Navigation requires `sales_order.read`.
- Commercial actions require `sales_order.write`.
- Fulfillment actions require `sales_order.fulfill`.
- List, count, summary, detail, lines, history, fulfillments, document, and
  mutations use identical Order scope.
- OWN, TEAM, TEAM_TREE, and TENANT work with User and Team ownership.
- Related entities use their own permission and scope.
- Out-of-scope IDs do not disclose existence.

### 55.9 Workspace integrity

- Order Pulse is server-side and page-independent.
- Pagination does not change aggregate truth.
- No payment or settled KPI exists.
- Filters round-trip through URL.
- Back and Forward restore state.
- Desktop rows use semantic Links.
- Mobile uses compact cards.
- Status visuals come from `crmStatusConfig`.

### 55.10 Editor integrity

- New and edit use full-page workflow.
- Account and owner are selected entities, not free text.
- Currency locks with compatible Price Book context.
- Save replaces the full Direct Draft aggregate transactionally.
- Unsaved changes warn before navigation.
- Validation identifies the exact invalid field or line.
- Version conflict never silently overwrites.

### 55.11 Detail integrity

- Detail shows source, status, customer, total, owner, due state, and progress.
- Lines show ordered, fulfilled, and remaining quantities.
- Fulfillment timeline distinguishes Recorded and Voided events.
- Status history is visible and paginated.
- Actions match permission and lifecycle.

### 55.12 Document integrity

- Print projection is scope-safe.
- LINE_ITEM print contains real lines.
- Print uses snapshots.
- Print totals equal detail totals.
- Operational notes are excluded.
- Legacy print contains no synthetic lines.
- UI labels the action Print / Save as PDF.
- V1 does not claim stored or delivered PDF.

### 55.13 Operational-state integrity

- Initial loading shows no business fallback values.
- Background refresh preserves and labels prior data.
- First-use empty differs from filtered empty.
- Summary failure does not hide list.
- Fatal list failure has Retry.
- Forbidden differs from not found.
- Conflict preserves local values.
- Action pending state prevents double submit.

### 55.14 Accessibility integrity

- Controls have accessible names.
- Inputs have associated labels.
- Keyboard users can manage Direct Draft lines.
- Focus-visible treatment exists.
- Dialog focus is managed.
- Async changes are announced.
- Tables have captions and headers.
- Progress and status are not color-only.
- Reduced motion is honored.

### 55.15 Legacy integrity

- Legacy Orders are classified explicitly.
- No legacy line or fulfillment data is fabricated.
- Legacy limitations are visible.
- Legacy Draft rebuild is atomic.
- Legacy terminal records remain readable.
- Current API behavior is not documented as replaced before implementation.

## 56. Future verification contract

This section defines evidence expected from a later implementation. No test,
build, browser, API, application-start, or runtime verification is performed
in this spec-only task.

Repository policy requires a new explicit user instruction before running
verification commands.

### 56.1 Static checks

- TypeScript typecheck.
- ESLint with zero warnings.
- English-only runtime scan.
- Search for TypeScript `any` in Order API code.
- Search for Order response fallbacks.
- Search for client-generated Order Numbers.
- Search for hardcoded VND.
- Search for payment status in Orders runtime.
- Search for Order status maps outside `crmStatusConfig`.
- Search for generic status update input.
- Search for direct fulfilled-quantity writes.
- Search for double or float in Order money and quantity logic.
- API-reference diff review.

### 56.2 Calculation checks

- One Direct line without discount or tax.
- Multiple Direct lines.
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
- Detail, summary, and print parity.
- Accepted Quote and converted Order parity.

### 56.3 Source and lock checks

- Direct creation.
- Accepted Quote conversion.
- Non-Accepted Quote rejection.
- Non-latest Quote rejection.
- Idempotent repeated conversion.
- Quote line copy completeness.
- Quote price-lock enforcement.
- Direct Draft commercial editing.
- Direct Confirm lock.
- Request manipulation against locked fields.

### 56.4 Lifecycle checks

- Draft Confirm success.
- Confirm prerequisite failure.
- Confirmed Start success.
- Start from invalid status.
- Cancel Quote-derived Draft.
- Delete Direct Draft.
- Delete Quote-derived Draft rejection.
- Cancel before fulfillment.
- Cancel after fulfillment rejection.
- Close Remaining from Partial.
- Close Remaining without partial quantity rejection.
- Action on terminal Order rejection.
- Generic status update rejection.
- Status history contents.

### 56.5 Fulfillment checks

- One-line full fulfillment.
- One-line partial fulfillment.
- Multi-line partial fulfillment.
- Multiple events on one line.
- Event containing multiple lines.
- Exact remaining quantity.
- Decimal quantity.
- Zero quantity rejection.
- Negative quantity rejection.
- Over-fulfillment rejection.
- Foreign line rejection.
- Future date rejection.
- Before-Order date rejection.
- Idempotent replay.
- Conflicting Idempotency Key.
- Concurrent over-fulfillment prevention.

### 56.6 Void checks

- Void partial event.
- Void event that made Order Fulfilled.
- Result returns to Partially Fulfilled.
- Result returns to Processing when no quantity remains recorded.
- Repeated void rejection.
- Void foreign event rejection.
- Void after Cancel rejection.
- Void after Closed Partial rejection.
- Void reason audit.

### 56.7 Scope checks

- OWN actor sees own User-owned Orders only.
- TEAM actor sees authorized direct Team Orders.
- TEAM_TREE actor sees active descendant Team Orders.
- TENANT actor sees all non-deleted tenant Orders.
- User-owned and Team-owned Orders do not cross unauthorized scope.
- Search count and page use identical scope.
- Summary and list use identical scope.
- Detail, lines, document, fulfillment, and history use identical scope.
- Every mutation uses identical scope.
- Out-of-scope IDs map to Order Not Found.

### 56.8 Related-entity checks

- Account permission and scope.
- Contact permission, scope, and Account compatibility.
- Opportunity permission, scope, and Account compatibility.
- Accepted Quote permission and scope.
- Active Price Book.
- Inactive Price Book rejection.
- Active Product.
- Inactive Product rejection before Confirm.
- Price Book Item and Product consistency.
- Price Book currency consistency.
- Snapshot stability after source changes.

### 56.9 API checks

- Default paging and sorting.
- Multi-status filter.
- Source filter.
- Atomic owner pair.
- Currency format.
- Date-range validation.
- Due-state filters.
- Summary filter parity.
- ETag response behavior.
- Missing If-Match.
- Malformed If-Match.
- Stale If-Match.
- Missing Idempotency Key.
- Stable error codes.
- Delete 204 behavior.

### 56.10 Frontend behavior checks

- URL parse and serialize round-trip.
- Invalid URL state.
- Search debounce.
- Request cancellation.
- Page reset after filter change.
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

### 56.11 Responsive and accessibility checks

- Wide desktop.
- Standard laptop.
- Tablet.
- Narrow mobile.
- Very long Order Number.
- Very long Account and Product names.
- Large VND values.
- Decimal currency values.
- Multiple currency groups.
- Keyboard-only editor.
- Keyboard line reorder.
- Keyboard fulfillment dialog.
- Screen-reader control names.
- Focus after validation.
- Focus return from dialog.
- Reduced-motion preference.
- Print layout.
- No horizontal page overflow.

### 56.12 Performance checks

- Search count query plan.
- Search page query plan.
- Order Pulse query plan.
- Due-state query plan.
- OWN scope query plan.
- TEAM scope query plan.
- TEAM_TREE scope query plan.
- Detail aggregate query count.
- Fulfillment history query plan.
- No Account or owner N+1.
- No Product or Quote N+1.
- No page-level aggregate calculation.
- No duplicate concurrent request for one query key.

## 57. Release gates

The Production Order Workspace is not ready for production until:

1. Frontend fabricated normalization is removed.
2. Client-generated Order Numbers are removed.
3. Payment and settled UI without a subsystem is removed.
4. Canonical Order Line persistence is implemented.
5. Server calculation is authoritative.
6. Quote conversion copies and reconciles canonical lines.
7. Mixed currencies cannot enter one Order or aggregate.
8. Generic status updates are removed.
9. Lifecycle preconditions are enforced.
10. Commercial lock is enforced on the backend.
11. Fulfillment ledger persistence is implemented.
12. Fulfilled Quantity is derived from the ledger.
13. Concurrent commands cannot over-fulfill.
14. Void preserves the original event and recalculates status.
15. Close Remaining produces CLOSED_PARTIAL without rewriting quantity.
16. Status history is append-only and complete.
17. Order scope predicate is applied to every operation.
18. Team ownership is supported by an explicit contract.
19. Related entities use their own permission and scope.
20. List summary is server-side and pagination-independent.
21. Full-page editor, detail, and print routes are protected.
22. Document projection contains canonical data only.
23. Legacy records are explicit and never receive fake lines or events.
24. Idempotent create, conversion, and Record Fulfillment behavior is safe.
25. All operational states are implemented.
26. Accessibility contract is satisfied.
27. Order and fulfillment status presentation is centralized.
28. Runtime copy is English only.
29. `docs/api-reference.md` matches implemented behavior.

No release gate may be satisfied by:

- Fixed demo data.
- A frontend fallback.
- A synthetic Order Line.
- A synthetic fulfillment event.
- A page-only aggregate.
- A client-side status mutation.
- A direct fulfilled-quantity update.
- A tenant-only query shown to a scoped actor.
- A hardcoded VND label.
- A manual payment status.
- A generic catch-all error that hides the business failure.

## 58. Deferred extensions

### 58.1 Invoice and accounts receivable

Requires:

- Invoice aggregate.
- Invoice Lines.
- Issue and due dates.
- Tax and legal numbering rules.
- Outstanding balance.
- Credit notes.
- Accounting integration boundary.

### 58.2 Payment and refund

Requires:

- Payment intent or transaction model.
- Allocation to invoices.
- Partial payment.
- Refund and reversal.
- Provider reconciliation.
- Financial permissions and audit.

### 58.3 Warehouse and shipment

Requires:

- Locations.
- Allocation.
- Pick and pack state.
- Shipment aggregate.
- Carrier and tracking integration.
- Split shipment rules.
- Delivery confirmation.

### 58.4 Returns

Requires:

- Return authorization.
- Returned quantities.
- Condition and disposition.
- Inventory and financial effects.
- Refund or credit-note integration.

### 58.5 Order amendment

Requires:

- Amendment identity.
- Commercial revision rules.
- Delta Lines.
- Reapproval or customer consent.
- Fulfillment impact.
- Historical document retention.

### 58.6 Customer portal

Requires:

- External identity.
- Customer-scoped access.
- Safe document delivery.
- Fulfillment visibility rules.
- Notification preferences.

## 59. External design references

The approved design was informed by primary product documentation:

- Microsoft Dynamics 365 Sales, Create or edit sales orders:
  https://learn.microsoft.com/en-us/dynamics365/sales/create-edit-order-sales
- Microsoft Dynamics 365 Intelligent Order Management, Fulfillment entity
  relationships:
  https://learn.microsoft.com/en-us/dynamics365/intelligent-order-management/fulfillment-entity-relationships
- Microsoft Dynamics 365 Commerce, Order fulfillment setup and line-level
  quantities:
  https://learn.microsoft.com/en-us/dynamics365/commerce/order-fulfillment-pos-setup
- Shopify developer documentation, Order management and fulfillment lifecycle:
  https://shopify.dev/docs/apps/build/orders-fulfillment/order-management-apps
- W3C Web Content Accessibility Guidelines:
  https://www.w3.org/WAI/standards-guidelines/wcag/

These references inform separation of Order, Order Line, fulfillment event,
shipment, invoice, and payment concerns. They do not override repository
constraints or the approved VUM product boundary.

## 60. Approved design recap

The approved Sales Orders target is:

- Server-backed.
- Order-Line-based.
- Direct- and Quote-source-aware.
- Quote-price-locked.
- Decimal-safe.
- Single-currency.
- Full-page editable in Direct Draft.
- Source-aware in Quote-derived Draft.
- Commercially immutable after Confirm.
- Action-driven.
- Fulfillment-ledger-backed.
- Partial-fulfillment-aware.
- Void-correction-safe.
- Closed-remainder-aware.
- Scope-safe.
- URL-backed.
- Canonically printable.
- Legacy-aware.
- Idempotent at high-risk creation and fulfillment boundaries.
- Accessible.
- Responsive.
- English only.

It is not:

- A manual header-total form.
- A page-level KPI dashboard.
- A payment tracker.
- An invoice system.
- A warehouse system.
- A shipment tracker.
- A generic status dropdown.
- A direct fulfilled-quantity editor.
- A fake PDF preview.
- A full Order Management System.

This boundary replaces the current presentation with a credible CRM Order
execution workflow while preserving clean future boundaries for invoices,
payments, warehouses, shipments, returns, and amendments.
