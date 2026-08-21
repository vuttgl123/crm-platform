# Implementation Plan: Role Production Governance

This implementation plan specifies the complete, multi-step technical execution for refactoring and hardening the Role Management & Access Control feature (`/app/platform/roles`) in `crm-fe` according to the approved design specification [`docs/superpowers/specs/2026-08-21-role-production-governance-design.md`](file:///d:/Code/crm/crm-fe/docs/superpowers/specs/2026-08-21-role-production-governance-design.md).

## User Review Required

> [!IMPORTANT]
> **Production Hardening Highlights**:
> 1. **Zero Synthetic / Invented Data**: Comparison, cloning, and detail views will rely 100% on actual API responses from `GET /api/roles/{id}` and `GET /api/permissions`. Fallback guessing based on role codes or prefixes is completely removed.
> 2. **Exact Backend Contract Alignment**: `roleApi.ts` will strictly align with Spring Boot `RoleController` / `RoleResponse` / `RoleSummaryResponse` (e.g. `system: boolean`, `dataScopes: { entityType, type, teamId }[]`, `version: number`, `If-Match: "{version}"` header on delete).
> 3. **4-Step Governance Editor**: The role editor is partitioned into:
>    - Step 1: Basics (Role Code, Name, Description, Status)
>    - Step 2: Permissions (Grouped by module with risk level badges & privileged confirmation)
>    - Step 3: Data Scopes (Multi-grant by entity with conditional team picker for `TEAM`/`TEAM_TREE`)
>    - Step 4: Change Review (Deterministic diff with risk warnings for privileged grants, tenant-wide expansions, and deactivations)
> 4. **No Git Mutation / No Tests Rule**: All verification is performed statically (`npx tsc --noEmit`, diff review, structural contract checking) without running runtime test suites or creating git commits.

---

## Proposed Changes

```
crm-fe/
├── src/services/api/
│   └── [MODIFY] roleApi.ts
├── src/features/platform/roles/
│   ├── [MODIFY] RolesPage.tsx
│   ├── [NEW] roleSearchParams.ts
│   ├── model/
│   │   ├── [NEW] roleTypes.ts
│   │   ├── [NEW] roleSchemas.ts
│   │   ├── [NEW] roleMappers.ts
│   │   ├── [NEW] roleDiff.ts
│   │   └── [NEW] roleErrors.ts
│   ├── hooks/
│   │   └── [NEW] roleQueries.ts
│   └── components/
│       ├── [NEW] RolesSummary.tsx
│       ├── [NEW] RolesToolbar.tsx
│       ├── [NEW] RolesTable.tsx
│       ├── [NEW] PermissionCatalogue.tsx
│       ├── [NEW] PermissionMatrix.tsx
│       ├── [NEW] DataScopeEditor.tsx
│       ├── [NEW] RoleBasicsStep.tsx
│       ├── [NEW] RoleChangeReview.tsx
│       ├── [NEW] RoleEditorSheet.tsx
│       ├── [NEW] RoleComparison.tsx
│       └── [NEW] RoleDeleteDialog.tsx
```

---

### Component 1: API Client & Domain Models (`src/services/api/` & `src/features/platform/roles/model/`)

#### [MODIFY] [roleApi.ts](file:///d:/Code/crm/crm-fe/src/services/api/roleApi.ts)
- Standardize TypeScript interfaces with exact Spring Boot backend contracts:
  - `PermissionResponse`: `{ permissionCode: string; description: string; moduleCode: string; riskLevel: 'NORMAL' | 'SENSITIVE' | 'PRIVILEGED' }`
  - `RoleSummaryResponse`: `{ id: string; roleCode: string; name: string; description?: string; system: boolean; status: 'ACTIVE' | 'INACTIVE'; permissionCount: number; dataScopeCount: number; updatedAt: string; version: number }`
  - `RoleDataScope`: `{ entityType: string; type: 'OWN' | 'TEAM' | 'TEAM_TREE' | 'TENANT'; teamId?: string }`
  - `RoleDetailResponse`: `{ id: string; roleCode: string; name: string; description?: string; system: boolean; status: 'ACTIVE' | 'INACTIVE'; permissionCodes: string[]; dataScopes: RoleDataScope[]; createdAt: string; updatedAt: string; version: number }`
  - `CreateRoleRequest`: `{ roleCode: string; name: string; description?: string; permissionCodes: string[]; dataScopes?: RoleDataScope[] }`
  - `UpdateRoleRequest`: `{ version: number; name: string; description?: string; status: 'ACTIVE' | 'INACTIVE'; permissionCodes: string[]; dataScopes?: RoleDataScope[] }`
  - `deleteRole(id: string, version: number)`: uses `If-Match: "${version}"` header and handles 204 No Content.

#### [NEW] [roleTypes.ts](file:///d:/Code/crm/crm-fe/src/features/platform/roles/model/roleTypes.ts)
- Define editor lifecycle types:
  - `RoleEditorMode = 'view' | 'create' | 'edit' | 'clone'`
  - `RoleEditorStep = 'basics' | 'permissions' | 'scopes' | 'review'`
  - `RoleDraft`: in-memory editable state for the 4-step sheet
  - `RoleFilterState`: `{ search: string; status: 'ALL' | 'ACTIVE' | 'INACTIVE'; type: 'ALL' | 'SYSTEM' | 'CUSTOM'; page: number; pageSize: number }`
  - `CatalogueFilterState`: `{ search: string; module: string; risk: string; page: number; pageSize: number }`
  - `ComparisonFilterState`: `{ leftRoleId: string; rightRoleId: string; search: string; module: string; onlyDifferences: boolean; page: number; pageSize: number }`
  - `RoleDiffResult`: structured metadata, permission, and data scope diff analysis

#### [NEW] [roleSchemas.ts](file:///d:/Code/crm/crm-fe/src/features/platform/roles/model/roleSchemas.ts)
- Zod validation schemas:
  - `roleBasicsSchema`: validates `roleCode` (`^[A-Z][A-Z0-9_]*$`, max 191), `name` (required, max 255), `description` (optional, max 4000), `status` (`ACTIVE | INACTIVE`).
  - `roleDataScopeSchema`: validates `entityType` (`^[A-Z][A-Z0-9_]*$`), `type` (`OWN | TEAM | TEAM_TREE | TENANT`), and enforces `teamId` presence if `TEAM` or `TEAM_TREE`, and null/empty if `OWN` or `TENANT`.
  - `roleDraftSchema`: full validator before allowing transition to Step 4 (Review) and final submission.

#### [NEW] [roleMappers.ts](file:///d:/Code/crm/crm-fe/src/features/platform/roles/model/roleMappers.ts)
- Pure transformation functions:
  - `roleDetailToDraft(detail: RoleDetailResponse, mode: RoleEditorMode)`: transforms server detail into an isolated editable draft.
  - `draftToCreateRequest(draft: RoleDraft)`: transforms draft into sanitized `CreateRoleRequest`.
  - `draftToUpdateRequest(draft: RoleDraft, originalVersion: number)`: transforms draft into sanitized `UpdateRoleRequest`.
  - Grouping and sorting helpers for permissions by module code and risk level.

#### [NEW] [roleDiff.ts](file:///d:/Code/crm/crm-fe/src/features/platform/roles/model/roleDiff.ts)
- Pure deterministic diff computation:
  - `computeRoleDiff(original: RoleDetailResponse | null, draft: RoleDraft)`: computes added/removed permission codes, added/removed/modified data scopes, status changes, and highlights risk warnings (privileged grants, scope escalations to `TENANT` or `TEAM_TREE`).
  - `computeRoleComparison(left: RoleDetailResponse, right: RoleDetailResponse)`: calculates exact 2-role matrix of shared vs unique permissions and data scopes.

#### [NEW] [roleErrors.ts](file:///d:/Code/crm/crm-fe/src/features/platform/roles/model/roleErrors.ts)
- Maps backend error codes (`ROLE_NOT_FOUND`, `ROLE_CODE_ALREADY_EXISTS`, `ROLE_VERSION_CONFLICT`, `SYSTEM_ROLE_IMMUTABLE`, `ROLE_PERMISSION_UNKNOWN`, `ROLE_DATA_SCOPE_INVALID`, `ACCESS_DENIED`, etc.) to human-friendly, localized error messages with actionable recovery steps.

---

### Component 2: URL State & React Query Data Layer (`src/features/platform/roles/`)

#### [NEW] [roleSearchParams.ts](file:///d:/Code/crm/crm-fe/src/features/platform/roles/roleSearchParams.ts)
- URL synchronization helpers using `react-router-dom` `useSearchParams`:
  - Parses and serializes `tab` (`roles | catalogue | compare`), `q`, `status`, `type`, `page`, `roleId`, `mode`, `leftId`, `rightId`, etc.

#### [NEW] [roleQueries.ts](file:///d:/Code/crm/crm-fe/src/features/platform/roles/hooks/roleQueries.ts)
- Tenant-scoped React Query hooks:
  - `useRolesList(tenantId)`: query for all roles summary.
  - `usePermissionCatalogue(tenantId)`: query for system permissions catalogue.
  - `useRoleDetail(roleId, tenantId, enabled)`: query for specific role details.
  - `useTeamsList(tenantId, enabled)`: conditional query for teams list (only enabled when `TEAM` or `TEAM_TREE` scope is configured).
  - `useRoleMutations()`: mutation hooks for Create, Update, and Delete with optimistic rollback, error mapping, and cache invalidation.

---

### Component 3: Presentation & View Components (`src/features/platform/roles/components/`)

#### [NEW] [RolesSummary.tsx](file:///d:/Code/crm/crm-fe/src/features/platform/roles/components/RolesSummary.tsx)
- Compact summary strip rendering metric stats: Total Roles, Active Roles, Custom Roles, Total System Permissions.

#### [NEW] [RolesToolbar.tsx](file:///d:/Code/crm/crm-fe/src/features/platform/roles/components/RolesToolbar.tsx)
- Action bar containing search input, status filter select, role type filter (All, System, Custom), and "Create Role" button protected by `<PermissionGate permission="platform_role.manage">`.

#### [NEW] [RolesTable.tsx](file:///d:/Code/crm/crm-fe/src/features/platform/roles/components/RolesTable.tsx)
- Accessible, responsive table displaying Role Code (mono), Role Name, Description, Granted Permissions count, Role Type badge (System vs Custom), Status badge (ACTIVE vs INACTIVE), Last Updated timestamp, and action buttons/menu (View, Edit, Clone, Delete).
- Includes mobile stacked card layout below `lg` breakpoint.

#### [NEW] [PermissionCatalogue.tsx](file:///d:/Code/crm/crm-fe/src/features/platform/roles/components/PermissionCatalogue.tsx)
- Read-only catalogue of all permissions returned by `GET /api/permissions`, searchable by code/description, filterable by module group and risk level (`NORMAL`, `SENSITIVE`, `PRIVILEGED`), with client-side pagination.

#### [NEW] [RoleComparison.tsx](file:///d:/Code/crm/crm-fe/src/features/platform/roles/components/RoleComparison.tsx)
- Exact comparison view between two selected roles (`leftRoleId` & `rightRoleId`):
  - Fetches both role details in parallel.
  - Displays summary diff metrics, side-by-side permission checklist (with "Only Differences" toggle), and data scope alignment.
  - Handles loading and partial failure states without fake fallback data.

#### [NEW] [RoleDeleteDialog.tsx](file:///d:/Code/crm/crm-fe/src/features/platform/roles/components/RoleDeleteDialog.tsx)
- Accessible confirmation dialog for deleting custom roles, passing the current version in `If-Match` header, displaying mapped error feedback if the role cannot be deleted.

---

### Component 4: 4-Step Role Editor Wizard (`src/features/platform/roles/components/`)

#### [NEW] [RoleBasicsStep.tsx](file:///d:/Code/crm/crm-fe/src/features/platform/roles/components/RoleBasicsStep.tsx)
- Step 1: Role Code (editable for Create/Clone, immutable for Edit), Role Display Name, Description, and Status toggle (`ACTIVE` / `INACTIVE`).

#### [NEW] [PermissionMatrix.tsx](file:///d:/Code/crm/crm-fe/src/features/platform/roles/components/PermissionMatrix.tsx)
- Step 2: Semantic permission checkboxes grouped by module. Module-level Select All toggle with confirmation modal when selecting `PRIVILEGED` permissions. Search & module filter.

#### [NEW] [DataScopeEditor.tsx](file:///d:/Code/crm/crm-fe/src/features/platform/roles/components/DataScopeEditor.tsx)
- Step 3: Multi-grant data scoping editor allowing multiple entity scopes (`ACCOUNT`, `CONTACT`, `LEAD`, `OPPORTUNITY`, `CONTRACT`, `ORDER`, etc.).
- Dynamically loads and binds active tenant teams when `TEAM` or `TEAM_TREE` scope is chosen.

#### [NEW] [RoleChangeReview.tsx](file:///d:/Code/crm/crm-fe/src/features/platform/roles/components/RoleChangeReview.tsx)
- Step 4: Full governance change review showing deterministic summary of:
  - Basic metadata changes & deactivation warnings.
  - Added / Removed permissions grouped by module and risk.
  - Added / Removed / Altered data scope grants.
  - High-visibility warnings for `PRIVILEGED` permissions or `TENANT`/`TEAM_TREE` escalations.

#### [NEW] [RoleEditorSheet.tsx](file:///d:/Code/crm/crm-fe/src/features/platform/roles/components/RoleEditorSheet.tsx)
- Master Sheet container coordinating the 4 steps, step indicator, validation state, dirty draft detection (warning before closing if unsaved changes exist), and save dispatch.

---

### Component 5: Page Shell Composition (`src/features/platform/roles/RolesPage.tsx`)

#### [MODIFY] [RolesPage.tsx](file:///d:/Code/crm/crm-fe/src/features/platform/roles/RolesPage.tsx)
- Refactor `RolesPage.tsx` from 1,470 lines down to a clean ~150-line route composition shell integrating:
  - `StandardPageHeader`
  - URL search params management via `roleSearchParams.ts`
  - `RolesSummary`, `RolesToolbar`, `RolesTable`, `StandardPagination`
  - `PermissionCatalogue` tab
  - `RoleComparison` tab
  - `RoleEditorSheet` & `RoleDeleteDialog` modals
  - Permission check (`platform_role.read` required for page, `platform_role.manage` for mutation actions).

---

## Verification Plan

### Static Verification (Read-Only)
- **TypeScript Static Typecheck**: Run `npx tsc --noEmit` inside `crm-fe` to ensure 0 type errors across all newly created modules and refactored components.
- **Contract Verification**: Verify that `RoleSummaryResponse`, `RoleDetailResponse`, `CreateRoleRequest`, and `UpdateRoleRequest` match Spring Boot backend controller DTOs.
- **Zero Fallback / Zero Fake Data Audit**: Grep across `src/features/platform/roles/` to ensure no synthetic fallback permission prefixes, hardcoded role IDs, or swallowed promise errors exist.
- **Repository Rules Audit**:
  - Verify no git commits or git staging were created.
  - Verify no runtime test suites were executed.
  - Verify accessibility standards (no clickable divs, minimum touch targets, proper ARIA labels).
