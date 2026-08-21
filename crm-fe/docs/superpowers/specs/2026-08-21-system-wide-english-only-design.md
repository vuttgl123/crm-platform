# System-wide English-only Runtime: Design Specification

**Date:** 2026-08-21

**Scope:** Entire CRM repository: `crm-fe`, `crm`, public/API documentation,
system-generated content, and controlled data migration

**Status:** All design sections approved in conversation; document pending final
user approval

**Direction:** Canonical English runtime, one coordinated production release

## 1. Decision

The CRM becomes English-only at runtime. English is the only language used for:

- frontend interface copy;
- validation and API errors;
- backend notifications and timeline events;
- system-generated insights, summaries, recommendations, analytics, exports,
  and documents;
- built-in templates, sample content, mock data, and seed data;
- tenant bootstrap language behavior;
- public and API-facing documentation.

The system does not expose a language selector and does not change its output in
response to browser language, stored locale, tenant language, user preference,
or `Accept-Language`.

This is a canonical-English architecture, not a visual-only removal of the
Vietnamese selector. i18next and Spring `MessageSource` remain as centralized
message registries, but each has exactly one English runtime source of truth.

## 2. Relationship to existing requirements

This specification replaces language requirements that describe VUM as
Vietnamese-first or bilingual, including the language rule in
`crm-fe/AGENTS.md` and language clauses inside previously approved feature
specifications.

It does not replace feature behavior, permissions, API contracts, or visual
requirements unrelated to language. Existing feature documents must be read
together with this specification; if a language requirement conflicts, this
document wins.

The Role Production Governance specification at
`docs/superpowers/specs/2026-08-21-role-production-governance-design.md` is
updated in the same documentation task so its runtime copy and verification
requirements are English-only.

## 3. Audit baseline

At design time, the repository contains multiple competing language paths.

### 3.1 Frontend baseline

- `src/i18n/config.ts` loads both English and Vietnamese resources.
- `src/i18n/locales/en/translation.json` and
  `src/i18n/locales/vi/translation.json` both exist.
- `AuthLanguageMenu` changes i18next language at runtime.
- `storageAdapter` persists `vum_crm_locale_pref`.
- formatting helpers contain `vi-VN` defaults.
- the date picker imports the Vietnamese date-fns locale.
- tenant setup exposes a language selection control.
- landing demo types and content still model an English/Vietnamese locale.
- at least 69 frontend TypeScript, TSX, or JSON files contain Vietnamese
  Unicode text at the time of audit.

### 3.2 Backend baseline

- `InternationalizationConfig` supports Vietnamese and English and defaults to
  Vietnamese.
- `messages.properties` and `messages_vi.properties` are Vietnamese while
  `messages_en.properties` is English.
- `ErrorMessageTranslator` has a Vietnamese final fallback.
- request locale can influence errors through Spring locale context.
- system-owned Vietnamese content exists in notification, webhook, marketing
  template, drip campaign, analytics, customer timeline, commission,
  deduplication, forecast, customer health, and lead-scoring services.
- tenant bootstrap accepts arbitrary `defaultLanguageCode` values even though
  the database default is already English in some schemas.
- at least 16 backend source or resource files contain Vietnamese system-owned
  text at the time of audit.

Counts are audit evidence, not acceptance thresholds. Completion is based on
the defined source boundaries and enforcement rule, not on reducing these two
numbers by a fixed amount.

## 4. Goals

1. Make English the deterministic output language across frontend, backend,
   generated content, and controlled system data.
2. Remove every runtime language choice and locale-detection path.
3. Preserve centralized message lookup instead of scattering hardcoded copy.
4. Prevent a future reintroduction of Vietnamese system copy through static
   enforcement.
5. Keep user-entered and customer-owned data unchanged.
6. Preserve API compatibility where practical and explicitly validate the only
   supported tenant language value.
7. Ship frontend, backend, and database compatibility changes as one coordinated
   production release.

## 5. Non-goals

- Translating customer names, contact details, free-form notes, comments, email
  bodies, or templates authored by users.
- Removing language metadata that is valid CRM business data.
- Inferring or rewriting user content based on Unicode detection.
- Replacing i18next with hardcoded React strings.
- Replacing Spring `MessageSource` with hardcoded controller messages.
- Adding another localization library.
- Providing an undocumented hidden Vietnamese mode.
- Running a database migration as part of the implementation session.
- Running tests, builds, servers, browsers, or API calls under the current
  repository rules.

## 6. Content ownership boundary

Every string-bearing field must be classified before it is changed.

### 6.1 System-owned content

System-owned content is authored and controlled by the product and must be
English. It includes:

- navigation, buttons, labels, tooltips, dialogs, empty states, loading states,
  errors, validation, toasts, and accessibility labels;
- built-in email, webhook, notification, drip, and marketing templates;
- server-generated timeline text, recommendations, reasons, health insights,
  scoring explanations, forecast commentary, and analytics summaries;
- fixed export headers, document headings, field labels, and generated
  descriptions;
- mock records and seed records that demonstrate product behavior;
- API error messages, API examples, and product-owned public documentation.

### 6.2 User-entered or customer-owned content

User-entered content is data supplied or intentionally edited by a user or an
integration. It is preserved byte-for-byte unless the user edits it. Examples:

- account, contact, lead, opportunity, team, and tenant names;
- notes, comments, activity descriptions, and custom field values;
- user-authored email, notification, webhook, or campaign templates;
- imported records and integration payload content;
- uploaded files and external document bodies.

No implementation script may bulk-translate or replace this category.

### 6.3 Business language metadata

`preferredLanguageCode` on Account, Contact, and Lead remains valid business
metadata. It can describe the customer's preferred language for human workflows
or future integrations, but it must not select the CRM interface language or
change system-generated content.

Tenant `defaultLanguageCode` is different: it is retained only for API and data
compatibility, normalized to `en`, and no longer controls runtime language.

## 7. Canonical terminology

Product copy uses one English term consistently for each concept.

| Canonical term | Usage rule |
|---|---|
| Role | Never pair with a Vietnamese translation in runtime copy |
| Permission | Individual authorization capability |
| Data Scope | Record visibility boundary attached to a permission grant |
| Account | CRM organization/customer record |
| Contact | Person associated with an account or business process |
| Lead | Unqualified or pre-conversion prospect record |
| Opportunity | Qualified sales opportunity |
| Quote | Commercial quotation |
| Order | Confirmed customer order |
| Contract | Governed commercial agreement |
| Team | Tenant-scoped working group |
| Tenant | Isolated customer workspace |
| Membership | A user's association with a tenant or team |
| Lifecycle Stage | Account lifecycle classification |
| Status | Current operational state |
| Priority | Urgency or importance classification |

Runtime copy must not use mixed labels such as `Vai trò (Role)`, bilingual
slashes, or Vietnamese explanations in parentheses. Feature-specific glossaries
may add English terms but may not redefine these concepts.

## 8. Frontend architecture

### 8.1 i18next remains the message registry

`src/i18n/config.ts` must:

- import only `src/i18n/locales/en/translation.json`;
- register only the `en` resource;
- set `lng`, `fallbackLng`, and `supportedLngs` to English-only values;
- disable locale detection and avoid reading persisted locale state;
- keep interpolation escaping behavior appropriate for React.

Components continue using `t()` for product copy. This preserves consistent
keys, allows centralized content review, and avoids a large hardcoded-string
regression.

`src/i18n/locales/vi/translation.json` and the empty Vietnamese locale directory
are removed. English keys are canonical; there is no parallel placeholder
resource.

### 8.2 Language switching and persistence

- Remove `AuthLanguageMenu` from every auth, landing, shell, and settings
  surface, then remove the unused component.
- Remove `getLocale` and `setLocale` from `storageAdapter`.
- Stop reading or writing `vum_crm_locale_pref`.
- Perform a best-effort one-time removal of the stale storage key during the
  compatible rollout or deliberately leave it inert; it must never influence
  runtime behavior.
- Remove language options, language switch icons, and locale-specific route or
  query parameters.

The preferred approach is to remove the stale key once from a narrowly scoped
bootstrap migration function and then remove that migration after the agreed
compatibility window. A storage exception must never block application startup.

### 8.3 Formatting

- `Intl.DateTimeFormat` and `Intl.NumberFormat` default to `en-US`.
- date-fns components use the English locale or the library's English default.
- `index.html` declares `lang="en"`.
- time zone remains data-driven or tenant/user-configured where the existing
  feature supports it; English-only does not force a new time zone.
- currency remains data-driven. English-only must not convert every amount to
  USD or replace tenant currency settings.
- stable machine values such as ISO dates, codes, and IDs remain unchanged.

### 8.4 Tenant setup

Tenant setup no longer displays a language selector. Its request payload sends
`defaultLanguageCode: "en"` when the compatibility field is present.

The frontend request type narrows the field to the literal type `'en'` where
possible. A response containing another legacy value is normalized for display
and must not reactivate locale switching.

### 8.5 Feature content migration

All feature-owned UI copy is reviewed by domain, not by blind global replace:

1. application shell, header, sidebar, command surfaces, and permissions;
2. authentication, onboarding, tenant setup, and session flows;
3. landing page and public forms;
4. Platform administration, including Roles and Permissions;
5. CRM core: accounts, contacts, leads, opportunities, activities, notes, and
   customer health;
6. sales: quotes, orders, contracts, forecasts, commissions, and pipelines;
7. marketing, automation, notifications, analytics, integrations, and webhooks;
8. shared UI primitives, formatters, validation schemas, accessibility copy,
   mock data, fixtures, and demo data.

Each domain review covers loading, empty, filtered-empty, populated, error,
validation, disabled, success, warning, permission-denied, and destructive
states. English translation keys must be semantic and must not preserve
Vietnamese words in key names when a clear English key can be introduced safely.

## 9. Backend architecture

### 9.1 Fixed English locale

`InternationalizationConfig` uses a fixed English locale resolver. The intended
behavior is equivalent to `FixedLocaleResolver(Locale.ENGLISH)`:

- `Accept-Language` does not change message resolution;
- a request-scoped locale cannot select Vietnamese resources;
- scheduled jobs, async work, and message consumers use the same English
  fallback;
- missing locale headers and invalid locale headers produce the same English
  output.

Any code that calls `LocaleContextHolder` for system copy must either resolve to
the fixed English locale or be refactored to the canonical English message
source.

### 9.2 One message bundle

`crm/src/main/resources/messages.properties` becomes the canonical English
bundle.

- Merge verified English values from `messages_en.properties` into
  `messages.properties`.
- Remove `messages_en.properties` after parity is confirmed.
- Remove `messages_vi.properties`.
- Configure fallback so a missing key is visible during development and does
  not silently produce Vietnamese copy.
- Do not place raw credentials, personal data, or request payloads in error
  messages.

`ErrorMessageTranslator` uses an English final fallback such as a generic
internal-error recovery message. Controllers and services should prefer stable
error codes plus message-source lookup over embedded prose.

### 9.3 System-generated service content

The following domains require explicit source review because the audit found
system-owned Vietnamese content:

- `InAppNotificationService`;
- `WebhookDispatcherService`;
- `MarketingTemplateService` and marketing-template DTO validation;
- `DripCampaignService`;
- `MarketingAnalyticsService`;
- `TimelineApplicationService`;
- `SalesCommissionService`;
- `AccountDeduplicationService`;
- `SalesForecastService`;
- `CustomerHealthService`;
- `LeadScoringService`.

For every domain:

- fixed titles, summaries, reasons, labels, and recovery guidance become
  English;
- dynamic user/customer values are interpolated unchanged;
- stable enum values and API field names are not localized;
- template defaults are English, while user-edited template bodies remain
  unchanged;
- structured data should carry codes/fields separately from display text when
  the existing contract supports it.

This list is a known baseline, not a closed allowlist. The implementation scan
must cover all backend sources, resources, migrations, mocks, and seed data in
scope.

## 10. Tenant language API contract

### 10.1 Request behavior

For tenant bootstrap or update endpoints that accept
`defaultLanguageCode`:

- the field remains optional for backward-compatible request parsing;
- omitted or blank input normalizes to `en`;
- the only accepted non-blank value is `en`, compared case-insensitively and
  persisted canonically as lowercase `en`;
- every other value, including `vi`, returns HTTP 400 with
  `REQUEST_VALIDATION_FAILED` and an English field-level message;
- no request header can override this rule.

### 10.2 Response behavior

- tenant responses expose `defaultLanguageCode: "en"` wherever the field is
  already part of the contract;
- legacy database values are not leaked as active runtime options;
- `Accept-Language: vi` still returns English errors and English system copy;
- no new locale endpoint or supported-language list is added.

### 10.3 Compatibility boundary

The field is retained because removing it would be a wider API break. It is a
compatibility value, not an active feature flag. A later API version may remove
it through a separate design and deprecation process.

Because this changes validation and response behavior, the implementation must
update `docs/api-reference.md` in the same task. The documentation must include:

- the literal supported value `en`;
- omission/defaulting behavior;
- the 400 validation response for non-English values;
- the fact that `Accept-Language` does not localize responses;
- English-only examples without real credentials or personal data.

## 11. Persisted system content and database migration

### 11.1 Migration policy

Do not mass-translate persisted text based only on Vietnamese characters.
Persisted rows may be updated only when ownership is reliably system-owned,
identified by a stable key, immutable template code, seed identifier, or another
auditable marker.

Rows without reliable ownership evidence are treated as customer content and
left unchanged.

### 11.2 Tenant language normalization

Prepare an idempotent migration script for existing tenant language values. The
implementation plan should place it in the repository's established migration
location; if none exists, document and use a reviewable path such as
`docs/migrations/2026-08-21-english-only-tenant-language.sql`.

The script/package must provide:

1. a preflight query grouped by current language value;
2. a backup or rollback table keyed by tenant ID and previous value;
3. an affected-row count before mutation;
4. an update that changes only non-`en` tenant language values to `en`;
5. an idempotency guard;
6. post-migration verification queries;
7. a rollback statement or companion script;
8. operator notes stating that customer-authored text is untouched.

The agent must not execute this migration under the current request. Production
execution requires an explicit later instruction and normal operational review.

### 11.3 Built-in persisted templates

Built-in template rows may be replaced with English only when their stable
system identifier proves product ownership. Preserve user-modified or cloned
templates unless the data model has an explicit immutable-system marker that
makes ownership unambiguous.

## 12. Generated documents, exports, and integrations

- Product-owned export column headers and document labels are English.
- CSV/XLSX/PDF values originating from customer fields are preserved.
- dates and numbers use the documented English formatting unless an export
  contract requires machine-stable ISO/raw values.
- built-in outbound notification subjects and webhook descriptions are English.
- structured webhook field names and enum codes remain contract-stable.
- user-authored integration payload templates are not rewritten.
- generated API examples and sample requests use English synthetic data.

If a generated artifact currently has a locale parameter, the implementation
must either remove it without breaking the public contract or accept it as an
inert compatibility field documented as English-only. Any API contract change
must update `docs/api-reference.md`.

## 13. Repository instructions and documentation

Implementation must update repository guidance so future work does not
reintroduce Vietnamese-first behavior:

- change the language rule in `crm-fe/AGENTS.md` to canonical English-only;
- update any active `DESIGN.md`, `SITE.md`, README, developer guideline, or
  feature specification that instructs agents to create Vietnamese or bilingual
  runtime copy;
- keep internal historical design documents intact unless they actively govern
  new implementation, but add a supersession note where necessary;
- keep public/API/product documentation in English;
- internal planning discussion may remain in Vietnamese because it is not
  shipped runtime content.

Documentation changes must not misrepresent unimplemented behavior. API
reference changes land with the corresponding source implementation, not during
this design-only task.

## 14. Static enforcement

### 14.1 Verification command

Add a repository-scoped static checker, proposed as:

```text
crm-fe/scripts/check-english-only.mjs
crm-fe/scripts/english-only-allowlist.json
```

Expose it through `crm-fe/package.json` as `verify:english-only`. The checker is
a source-policy verifier, not a runtime test.

### 14.2 Required detections

The checker fails on system-owned source when it finds:

- Vietnamese-specific Unicode characters or known Vietnamese system phrases;
- `vi-VN` or a Vietnamese date-fns locale;
- Vietnamese translation resources or imports;
- `changeLanguage` or a rendered language switch;
- locale preference storage such as `vum_crm_locale_pref`;
- an English/Vietnamese runtime locale union;
- `AcceptHeaderLocaleResolver` or another request-selected locale resolver;
- a default runtime locale other than English;
- `messages_vi.properties` or equivalent Vietnamese bundles;
- non-English system-owned seed/template content;
- a tenant default language value other than `en`.

The scanner covers frontend/backend runtime sources, resources, active seed and
migration content, public documentation, and API reference files. It excludes
generated build output, dependency directories, Git metadata, logs, binary
assets, and internal historical/planning documents that are not runtime or
public product content.

### 14.3 Allowlist policy

Some Vietnamese text is legitimate customer/business sample data, a proper
name, or a migration fixture. Exceptions must be exact and reviewable.

Each allowlist entry contains:

- exact repository-relative file path;
- exact string or narrowly scoped match;
- ownership classification;
- reason it must remain;
- reviewer or ticket reference when available.

Whole-directory exclusions, generic Unicode suppression, or an unrestricted
regex are forbidden. Adding an exception is a product/data decision, not a
shortcut around migration work.

## 15. Error handling and failure modes

- Missing frontend translation keys must be visible during static review and
  must not fall back to Vietnamese.
- Missing backend message keys return the defined English safe fallback and log
  the stable code without leaking secrets.
- A legacy stored frontend locale is ignored even if cleanup fails.
- A legacy non-English tenant value is normalized by the controlled migration;
  it cannot reactivate localized output before migration.
- Invalid non-English tenant requests return deterministic English validation.
- User-authored Vietnamese content renders as user data; the UI around it stays
  English.
- A system/user ownership ambiguity blocks data rewriting and is recorded for
  operator review rather than guessed.

## 16. Rollout strategy

This change ships as one coordinated production release because partial rollout
would create contradictory contracts and mixed-language output.

### 16.1 Implementation order

1. Freeze the inventory, ownership rules, glossary, and exact allowlist.
2. Implement backend fixed-English locale, canonical messages, tenant
   validation, and English fallback.
3. Implement frontend single-resource i18n, remove language switching/storage,
   and standardize formatting.
4. Migrate frontend system copy domain by domain.
5. Migrate backend-generated content, built-in templates, validation, and
   sample/seed content.
6. Prepare the idempotent tenant/system-content migration package without
   executing it.
7. Update API reference and active repository guidance.
8. Add the English-only static checker and exact allowlist.
9. Perform repository-rule-compliant static verification and prepare an
   operator runtime checklist.

### 16.2 Deployment order

The release package should be deployed in this operational sequence:

1. take the approved database backup and run preflight counts;
2. deploy backend code that accepts omitted/`en` tenant language and always
   emits English;
3. execute the reviewed idempotent tenant/system-owned data migration;
4. deploy the English-only frontend;
5. run post-deployment runtime checks under an explicitly authorized release
   procedure;
6. monitor validation errors, missing message keys, and template delivery;
7. retain the rollback package until the release is accepted.

The repository implementation task prepares code and scripts only. It does not
authorize production deployment or database execution.

## 17. Acceptance criteria

### 17.1 Frontend

- Only the English translation resource is bundled.
- No language switch appears on auth, landing, app shell, settings, or tenant
  setup.
- No locale preference is read from or written to local storage.
- HTML language, dates, numbers, date picker, and accessibility copy use English
  conventions.
- All system-owned UI states are English.
- User-entered Vietnamese data remains visible and unchanged.

### 17.2 Backend and API

- API errors are English with no header-dependent language variation.
- `Accept-Language: vi` does not produce Vietnamese system output.
- `messages.properties` is canonical English; English/Vietnamese suffix bundles
  are absent.
- error fallback is English.
- tenant language accepts omitted/blank or `en`, persists `en`, and rejects
  other values with documented HTTP 400 behavior.
- Account, Contact, and Lead `preferredLanguageCode` remain business metadata
  and do not control runtime output.
- `docs/api-reference.md` matches implemented request, response, validation,
  status, and error behavior.

### 17.3 Generated content and data

- new notifications, timelines, scoring explanations, health insights,
  forecasts, analytics summaries, webhook descriptions, and built-in templates
  are English.
- export/document system labels are English.
- migration scripts update only reliably identified system-owned rows and
  tenant language compatibility values.
- no customer-authored content is mass-translated.
- preflight, backup, affected counts, post-checks, and rollback are documented.

### 17.4 Governance

- active repository instructions no longer require Vietnamese-first or
  bilingual runtime copy.
- the static checker blocks Vietnamese system copy and removed locale
  mechanisms.
- allowlist entries are exact, justified, and ownership-aware.
- Role Production Governance requirements are English-only.

## 18. Verification under repository rules

Only read-only/static verification is permitted for the implementation plan
unless the user later explicitly authorizes more:

- inspect scoped diffs and `git diff --check`;
- compare frontend translation keys with their call sites;
- search for Vietnamese resources, Unicode system copy, `vi-VN`, Vietnamese
  date locale, language switch imports, locale storage, and locale unions;
- compare backend error codes and message keys with canonical English values;
- search for request-selected locale resolvers and Vietnamese fallbacks;
- compare tenant DTO validation, controller/service normalization, schemas,
  migrations, and `docs/api-reference.md`;
- inspect every allowlist entry against the ownership boundary;
- run the static English-only policy script only if repository rules classify it
  as static inspection rather than a test runner;
- inspect generated migration SQL without connecting to a database.

Do not run unit, integration, E2E, smoke, browser, API, database, manual runtime,
dev-server, build, or deployment commands. Runtime checks remain an operator
checklist until a later explicit authorization.

## 19. High-level implementation boundaries

The implementation plan must create reviewable checkpoints rather than one
repository-wide blind rewrite:

1. contract and terminology inventory;
2. backend locale/message foundation and API documentation delta;
3. frontend locale foundation and shell/auth/tenant cleanup;
4. frontend domain content batches;
5. backend domain content batches;
6. generated document/export/template review;
7. safe SQL migration package;
8. active documentation and agent-instruction updates;
9. static enforcement, allowlist review, and final scoped diff audit.

Each checkpoint must list exact files after fresh static discovery, preserve
unrelated uncommitted work, and avoid tests/commits. No global replacement may
cross the system-owned/user-owned boundary.

The detailed file-by-file implementation plan is written only after this design
specification and the linked Role specification update receive final approval.
