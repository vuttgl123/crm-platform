# Unified App Shell and Role Access Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Execution note:** Trong repository này, dùng `superpowers:executing-plans`. Không dùng subagent-driven development vì người dùng chưa cho phép multi-agent execution.

**Goal:** Xây app shell production-ready và thiết kế lại màn Vai trò & Phân quyền để navigation, route, action và dữ liệu role dùng chung một mô hình quyền đúng hợp đồng API.

**Architecture:** Một route manifest tập trung cung cấp metadata cho sidebar, breadcrumb, command palette và route guard. App shell tái sử dụng shadcn/Radix hiện có; Role Management được tách thành domain mappers, React Query hooks và các component nhỏ cho list, editor, catalogue, comparison và delete.

**Tech Stack:** React 18, TypeScript 5.7, React Router 6, TanStack Query 5, React Hook Form 7, Zod 3, Tailwind CSS 3, shadcn/Radix, cmdk, react-i18next, Lucide hiện có.

**Spec:** `docs/superpowers/specs/2026-08-21-app-shell-role-access-redesign-design.md`

## Global Constraints

- Đọc `AGENTS.md`, `crm-fe/AGENTS.md` và spec trước khi sửa file.
- Không chạy unit, integration, E2E, smoke, browser hoặc manual runtime test.
- Không chạy dev server hoặc build. Chỉ được chạy kiểm tra tĩnh read-only như `npm run typecheck`, `npm run lint`, `rg`, `rtk read`, `rtk grep` và `rtk diff`.
- Không commit, stage, push, merge hoặc tạo pull request.
- Không thêm package, UI library, icon library, state library, form library hoặc table library.
- Không đổi backend API. Vì không đổi API nên không sửa `../docs/api-reference.md`.
- Không ghi đè thay đổi hiện có ở landing, authentication hoặc hai file translation. Mọi sửa translation phải merge theo key.
- Tiếng Việt là mặc định và mọi copy mới phải có bản tiếng Anh.
- Giữ light mode, nền slate nhẹ, một accent xanh, không gradient, glassmorphism, neon hoặc motion kiểu landing page.
- Chỉ dùng `@/config/crmStatusConfig` cho CRM lifecycle/account/lead/priority badges. Role status và permission risk là semantic riêng.
- Backend vẫn là authority cuối cùng; frontend gating không thay thế authorization backend.
- Mỗi task kết thúc bằng static inspection và reviewer checkpoint, không có test hoặc commit step.

---

## File Map

### Navigation và app shell

- Modify `src/types/navigation.ts`: type cho manifest, group và access rule.
- Modify `src/config/navigationConfig.ts`: route manifest và group metadata duy nhất.
- Create `src/config/navigationIcons.ts`: registry icon đã có trong Lucide.
- Create `src/core/navigation/routeResolver.ts`: match pathname và build authorized navigation.
- Modify `src/core/permissions/constants.ts`: bỏ assertion “exact 19”, thêm Role Management codes.
- Modify `src/core/permissions/evaluator.ts`: tenant-admin helper và access-rule evaluator dùng chung.
- Modify `src/components/common/PermissionGate.tsx`: dùng evaluator tập trung.
- Modify `src/components/common/ProtectedRoute.tsx`: chỉ xử lý session/auth/pending state.
- Create `src/components/common/RouteAccessBoundary.tsx`: chặn route theo manifest.
- Modify `src/components/ui/sheet.tsx`: cho phép truyền localized close label.
- Modify `src/components/ui/sidebar.tsx`: persistence, mobile Sheet, localized labels và keyboard safety.
- Modify `src/layouts/Sidebar.tsx`: sidebar thật từ manifest/session.
- Create `src/layouts/AppLanguageMenu.tsx`: language control riêng cho app shell.
- Create `src/layouts/AccountMenu.tsx`: session/profile/logout/mock role switcher.
- Modify `src/layouts/Header.tsx`: page context, command trigger và account controls.
- Modify `src/layouts/CommandPalette.tsx`: cmdk/Radix, authorized navigation và keyboard behavior.
- Modify `src/layouts/AppLayout.tsx`: compose provider, sidebar, header, boundary và main landmark.
- Modify `src/routes/AppRoutes.tsx`: `/app` index và authenticated not-found.
- Modify `src/i18n/locales/vi/translation.json`: merge `appShell` và `roleManagement` keys.
- Modify `src/i18n/locales/en/translation.json`: cùng key tree với tiếng Việt.

### Role Management

- Modify `src/services/api/roleApi.ts`: DTO đúng Role Management contract.
- Create `src/features/platform/roles/types.ts`: view model, draft, filter và editor modes.
- Create `src/features/platform/roles/roleMappers.ts`: API-to-view và draft-to-request mapping.
- Create `src/features/platform/roles/roleErrors.ts`: errorCode-to-i18n mapping.
- Create `src/features/platform/roles/schemas/roleEditorSchema.ts`: Zod schema đúng backend validation.
- Create `src/features/platform/roles/hooks/useRoleManagement.ts`: query keys, queries và mutations.
- Create `src/features/platform/roles/components/RolesSummary.tsx`: compact metrics strip.
- Create `src/features/platform/roles/components/RolesToolbar.tsx`: search/filter/create.
- Create `src/features/platform/roles/components/RolesTable.tsx`: desktop table và mobile stacked rows.
- Create `src/features/platform/roles/components/RoleBasicsStep.tsx`: metadata step.
- Replace `src/features/platform/roles/components/PermissionGroupSelector.tsx` with `PermissionMatrix.tsx`: semantic selector và privileged confirmation.
- Create `src/features/platform/roles/components/DataScopeEditor.tsx`: per-entity scopes và team selection.
- Create `src/features/platform/roles/components/RoleEditorSheet.tsx`: view/create/edit/clone orchestration.
- Create `src/features/platform/roles/components/PermissionCatalogue.tsx`: read-only catalogue.
- Create `src/features/platform/roles/components/RoleComparison.tsx`: real detail comparison.
- Create `src/features/platform/roles/components/RoleDeleteDialog.tsx`: confirmed delete.
- Modify `src/features/platform/roles/RolesPage.tsx`: route-level composition only.
- Delete `src/features/platform/roles/schemas/roleFormSchema.ts` after all imports are removed.

---

### Task 1: Centralize route metadata and permission evaluation

**Files:**

- Modify: `src/types/navigation.ts`
- Modify: `src/config/navigationConfig.ts`
- Create: `src/core/navigation/routeResolver.ts`
- Modify: `src/core/permissions/constants.ts`
- Modify: `src/core/permissions/evaluator.ts`
- Modify: `src/components/common/PermissionGate.tsx`

**Interfaces:**

- Produces `AppRouteManifestItem`, `NavigationAccessRule`, `APP_ROUTE_MANIFEST`, `resolveAppRoute()`, `getAuthorizedPrimaryNavigationItems()`, `getAuthorizedNavigationGroups()`, `getAuthorizedCommandItems()`, `isTenantAdminSession()` and `canAccessRule()`.
- Later shell and route tasks consume these exact exports.

- [ ] **Step 1: Replace navigation types with an explicit access rule**

Use these public shapes in `src/types/navigation.ts`:

```ts
export type SchemaModuleGroup =
  | 'crm'
  | 'catalog'
  | 'sales'
  | 'marketing'
  | 'service'
  | 'privacy'
  | 'integration'
  | 'audit'
  | 'platform';

export type NavigationAccessRule =
  | { kind: 'authenticated' }
  | { kind: 'permission'; code: string }
  | { kind: 'tenant-admin' }
  | { kind: 'any-permission'; codes: readonly string[] };

export interface AppRouteManifestItem {
  id: string;
  titleKey: string;
  path: string;
  matchPatterns: readonly string[];
  iconName: string;
  access: NavigationAccessRule;
  groupId?: SchemaModuleGroup;
  showInSidebar: boolean;
  showInCommandPalette: boolean;
  order: number;
}

export interface NavigationGroupDefinition {
  id: SchemaModuleGroup;
  titleKey: string;
  order: number;
}

export interface AuthorizedNavigationGroup extends NavigationGroupDefinition {
  items: AppRouteManifestItem[];
}
```

- [ ] **Step 2: Convert navigationConfig to one route manifest**

Keep every current `/app/...` path. Add authenticated entries for `/app/overview` and `/app/profile`. Use `/app/crm/accounts/:id` as a second match pattern on the accounts item. Set the roles item exactly as follows:

```ts
{
  id: 'platform-roles',
  titleKey: 'nav.rolesPermissions',
  path: '/app/platform/roles',
  matchPatterns: ['/app/platform/roles'],
  iconName: 'Shield',
  access: { kind: 'permission', code: 'platform_role.read' },
  groupId: 'platform',
  showInSidebar: true,
  showInCommandPalette: true,
  order: 30,
}
```

Do not change access rules of other Platform pages in this task. Preserve their current behavior unless their existing entry is only being translated to the new union shape.

- [ ] **Step 3: Replace stale permission constants**

Rename the seeded list to `KNOWN_PERMISSION_CODES`, retain all existing values and append:

```ts
'platform_role.read',
'platform_role.manage',
```

Export `KnownPermissionCode`. Keep `CRM_READ_PERMISSIONS` unchanged. Remove the comment that claims the list is the exact set of 19 permissions.

- [ ] **Step 4: Unify tenant-admin and access-rule evaluation**

In `evaluator.ts`, export and reuse:

```ts
export function isTenantAdminSession(session: UserSessionContext | null): boolean {
  return Boolean(
    session?.membership?.is_tenant_admin ||
      session?.activeRole?.role_code === 'TENANT_ADMIN' ||
      session?.activeRole?.role_code === 'ADMIN'
  );
}

export function canAccessRule(
  rule: NavigationAccessRule,
  session: UserSessionContext | null
): boolean {
  if (!session) return false;
  if (isTenantAdminSession(session)) return true;
  if (rule.kind === 'authenticated') return true;
  if (rule.kind === 'tenant-admin') return false;
  if (rule.kind === 'permission') return session.grantedPermissions.includes(rule.code);
  return rule.codes.some((code) => session.grantedPermissions.includes(code));
}
```

Make `can()`, `canAccessRoute()` and `canAccessEntity()` call the same tenant-admin helper. `canAccessRoute()` now accepts `AppRouteManifestItem` and delegates to `canAccessRule(item.access, session)`.

- [ ] **Step 5: Add route resolver and authorized group builder**

Implement `resolveAppRoute(pathname)` with `matchPath({ path, end: true }, pathname)`. Sort exact paths before dynamic paths so `/app/crm/accounts` does not resolve as a detail route.

Export these three filtered views:

```ts
getAuthorizedPrimaryNavigationItems(session: UserSessionContext | null): AppRouteManifestItem[]
getAuthorizedNavigationGroups(session: UserSessionContext | null): AuthorizedNavigationGroup[]
getAuthorizedCommandItems(session: UserSessionContext | null): AppRouteManifestItem[]
```

Primary items are authorized sidebar entries without `groupId`. Grouped items follow `NAVIGATION_GROUP_DEFINITIONS`. Command items require `showInCommandPalette` and valid access.

- [ ] **Step 6: Make PermissionGate delegate to the evaluator**

Keep the existing component API for consumers, but construct one `NavigationAccessRule` and call `canAccessRule()`. Remove its local tenant-admin and CRM permission logic.

- [ ] **Step 7: Static verification**

Run:

```bash
npm run typecheck
rg -n "Exact 19|platform-roles|platform_role.read|isTenantAdminSession|canAccessRule" src/types src/config src/core src/components/common/PermissionGate.tsx
```

Expected: typecheck succeeds; one roles route rule uses `platform_role.read`; tenant-admin bypass is defined once.

---

### Task 2: Enforce route access at the authenticated shell boundary

**Files:**

- Create: `src/components/common/RouteAccessBoundary.tsx`
- Modify: `src/components/common/ProtectedRoute.tsx`
- Modify: `src/routes/AppRoutes.tsx`

**Interfaces:**

- Consumes `resolveAppRoute()` and `canAccessRoute()` from Task 1.
- Produces `RouteAccessBoundary({ children })` for `AppLayout`.

- [ ] **Step 1: Create RouteAccessBoundary**

Use this behavior:

```tsx
interface RouteAccessBoundaryProps {
  children: React.ReactNode;
}

export function RouteAccessBoundary({ children }: RouteAccessBoundaryProps): JSX.Element {
  const location = useLocation();
  const { session } = useAuth();
  const routeEntry = resolveAppRoute(location.pathname);

  if (!routeEntry) return <>{children}</>;
  if (!canAccessRoute(routeEntry, session)) {
    return <Navigate to="/403" replace state={{ from: location.pathname }} />;
  }
  return <>{children}</>;
}
```

Unknown authenticated paths are allowed through this boundary so the nested `*` route can render `NotFoundPage`.

- [ ] **Step 2: Reduce ProtectedRoute to authentication concerns**

Remove the optional `navItem` prop and `canAccessRoute` import. Preserve loading, expired session, login return URL and pending-approval redirects. Replace its duplicated tenant-admin role-code checks with `isTenantAdminSession(session)` from Task 1; combine that result with `membership_status === 'ACTIVE'` for the pending-approval decision.

- [ ] **Step 3: Add deterministic `/app` routing behavior**

Inside the `/app` route:

```tsx
<Route index element={<Navigate to="overview" replace />} />
<Route path="*" element={<NotFoundPage />} />
```

Add `Navigate` to the router import. Do not move landing/auth/setup routes into the app shell.

- [ ] **Step 4: Static verification**

```bash
npm run typecheck
rg -n "navItem|RouteAccessBoundary|path=\"\*\"|platform_role.read" src/components/common src/routes
```

Expected: `ProtectedRoute` has no navigation prop; unknown nested app route has a not-found element.

---

### Task 3: Harden the sidebar primitive and build the global sidebar

**Files:**

- Modify: `src/components/ui/sheet.tsx`
- Modify: `src/components/ui/sidebar.tsx`
- Create: `src/config/navigationIcons.ts`
- Modify: `src/layouts/Sidebar.tsx`

**Interfaces:**

- Consumes authorized navigation groups and manifest entries.
- Produces the existing `SidebarProvider`, `SidebarTrigger` and layout `Sidebar` without changing import paths used by app code.

- [ ] **Step 1: Make sidebar persistence real**

Initialize desktop open state from `sidebar:state` cookie. If no cookie exists, default open only when `window.innerWidth >= 1024`. Keep writes scoped to `path=/` and seven days.

Ignore `Ctrl/Cmd + B` when the event target is an `input`, `textarea`, `select` or `[contenteditable="true"]`.

- [ ] **Step 2: Make the Sheet close label localizable**

Add `closeLabel?: string` to `SheetContentProps`, remove it before spreading props to Radix content and render it inside the existing sr-only span. Default to `Close` for existing consumers.

- [ ] **Step 3: Replace the mobile overlay with the existing Sheet primitive**

Render controlled `Sheet`/`SheetContent side="left"` using `openMobile` and `setOpenMobile`. Use `w-[--sidebar-width-mobile] p-0 sm:max-w-[--sidebar-width-mobile]` and pass the localized close label from the layout Sidebar. This supplies focus trapping, Escape handling and focus return.

- [ ] **Step 4: Localize sidebar labels without importing i18n into ui primitives**

Add optional `label?: string` to `SidebarTrigger` and `SidebarRail`; use the supplied value for screen-reader text, aria-label and title. Default to `Toggle sidebar` only when no label is passed.

- [ ] **Step 5: Create a typed icon registry**

In `navigationIcons.ts`, export:

```ts
export const NAVIGATION_ICONS: Record<string, LucideIcon> = {
  LayoutDashboard,
  Building2,
  Users,
  UserPlus,
  TrendingUp,
  Calendar,
  BarChart3,
  FileText,
  ShoppingCart,
  FileSignature,
  FolderTree,
  Package,
  Tag,
  LifeBuoy,
  Megaphone,
  ShieldCheck,
  Archive,
  UserCheck,
  Lock,
  Link,
  Send,
  Webhook,
  Upload,
  ClipboardList,
  Eye,
  User,
  Network,
  Shield,
  Settings,
  Workflow,
};
```

Add `LayoutDashboard` as the overview icon in the manifest. If an icon key is absent, render a neutral `Circle` fallback and never throw.

- [ ] **Step 6: Rewrite layouts/Sidebar from the manifest**

The layout component must:

- read `session`, `location`, `i18n` and `t`;
- render an overview entry before grouped navigation;
- call `getAuthorizedPrimaryNavigationItems(session)` and `getAuthorizedNavigationGroups(session)`;
- resolve active state with `resolveAppRoute(location.pathname)?.id === item.id`;
- use `NavLink` with the real item path;
- close the mobile Sheet through `setOpenMobile(false)` after navigation;
- show `session.tenant.display_name` as static context;
- omit fake workspace switcher and duplicate user footer.

Use `SidebarMenuButton asChild`, tooltip text from `t(item.titleKey)`, and `aria-current="page"` from `NavLink` when active.

- [ ] **Step 7: Static verification**

```bash
npm run typecheck
rg -n "href=\"#\"|Workspace: IPA|Vũ Phạm Tuấn|material-symbols" src/layouts/Sidebar.tsx src/components/ui/sidebar.tsx
```

Expected: no match for fake content or Material Symbols; all links come from route entries.

---

### Task 4: Build the global header, language control and account menu

**Files:**

- Create: `src/layouts/AppLanguageMenu.tsx`
- Create: `src/layouts/AccountMenu.tsx`
- Modify: `src/layouts/Header.tsx`

**Interfaces:**

- `HeaderProps`: `{ commandOpen: boolean; onCommandOpenChange(open: boolean): void }`.
- `AppLanguageMenu`: no props; updates `i18n.changeLanguage('vi' | 'en')`.
- `AccountMenu`: no props; consumes auth context and navigation.

- [ ] **Step 1: Implement AppLanguageMenu**

Reuse existing DropdownMenu primitives. Render the current language as `VI` or `EN` in the compact trigger and full language names in radio items. Use `appShell.language.label`, `appShell.language.vi` and `appShell.language.en`.

- [ ] **Step 2: Implement AccountMenu from session data**

Derive initials from `session.user.display_name`, with email prefix fallback. Show tenant, role and scope as non-interactive context. Profile navigates to `/app/profile`.

Logout behavior:

```ts
const handleLogout = async () => {
  setLoggingOut(true);
  try {
    await logout();
    navigate('/login', { replace: true });
  } finally {
    setLoggingOut(false);
  }
};
```

Only render demo role selection when `env.useMocks && env.enableRoleSwitcher`. Source options from `DEMO_ROLES`; call `switchDemoRole(roleCode)` and leave authorization redirection to the route boundary.

- [ ] **Step 3: Rewrite Header around truthful controls**

Header contains, from left to right:

- localized `SidebarTrigger`;
- group breadcrumb on desktop;
- current page title;
- command trigger showing `Ctrl K` or `⌘ K`;
- AppLanguageMenu;
- AccountMenu.

Resolve page/group metadata from the manifest and group definitions. Use a 56px sticky header. Remove Projects, Filters, Dashboard, global Create, search input, AI badge, notifications and settings icon.

- [ ] **Step 4: Static verification**

```bash
npm run typecheck
rg -n "Dự án|Bộ lọc|Bảng điều khiển|Tạo mới|smart_toy|notifications|material-symbols" src/layouts/Header.tsx src/layouts/AccountMenu.tsx
```

Expected: no fake controls; session-derived name, tenant and role are present.

---

### Task 5: Rebuild Command Palette and compose AppLayout

**Files:**

- Modify: `src/layouts/CommandPalette.tsx`
- Modify: `src/layouts/AppLayout.tsx`

**Interfaces:**

- `CommandPaletteProps`: `{ open: boolean; onOpenChange(open: boolean): void }`.
- Consumes `getAuthorizedCommandItems(session)` from Task 1.

- [ ] **Step 1: Rewrite CommandPalette with cmdk**

Use `CommandDialog`, `CommandInput`, `CommandList`, `CommandEmpty`, `CommandGroup` and `CommandItem` from `@/components/ui/command`.

Build groups from `getAuthorizedCommandItems(session)` and `NAVIGATION_GROUP_DEFINITIONS`; place ungrouped primary items in an `appShell.command.primaryGroup` section. The selected item must:

```ts
const handleSelect = (path: string) => {
  navigate(path);
  onOpenChange(false);
};
```

Search value should include the current translation plus fixed Vietnamese and English translations, so a user can search either language. Remove the “Sắp ra mắt” badge and the custom key handling already supplied by cmdk/Radix.

- [ ] **Step 2: Own global shortcuts in AppLayout**

`AppLayout` owns command state and listens for `Ctrl/Cmd + K`. Ignore editable targets using the same rule as Sidebar. Toggle the controlled dialog.

- [ ] **Step 3: Compose the authenticated shell**

Use this structure:

```tsx
<SidebarProvider>
  <a href="#app-main-content" className="sr-only focus:not-sr-only">
    {t('appShell.skipToContent')}
  </a>
  <Sidebar />
  <div className="flex min-h-dvh min-w-0 flex-1 flex-col bg-slate-50">
    <Header commandOpen={commandOpen} onCommandOpenChange={setCommandOpen} />
    <RouteAccessBoundary>
      <main id="app-main-content" tabIndex={-1} className="min-w-0 flex-1">
        <div className="mx-auto w-full max-w-[1600px] px-4 py-5 md:px-6 lg:px-8 lg:py-7">
          <Outlet />
        </div>
      </main>
    </RouteAccessBoundary>
  </div>
  <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />
</SidebarProvider>
```

Keep exactly one `main`. Remove manual `md:ml-56`, nested overflow and hardcoded Material theme classes.

- [ ] **Step 4: Static verification**

```bash
npm run typecheck
rg -n "md:ml-56|Sắp ra mắt|role=\"dialog\"|backdrop-blur-xs|<main" src/layouts
```

Expected: one main landmark in AppLayout; Command Palette uses the existing dialog primitive.

---

### Task 6: Merge app-shell and Role Management translations

**Files:**

- Modify: `src/i18n/locales/vi/translation.json`
- Modify: `src/i18n/locales/en/translation.json`

**Interfaces:**

- Produces identical key trees for `appShell` and `roleManagement`.
- All later components consume `t()` keys only.

- [ ] **Step 1: Add appShell keys to both locale files**

Add this exact tree with localized values:

```json
{
  "appShell": {
    "skipToContent": "Chuyển đến nội dung chính",
    "toggleSidebar": "Mở hoặc thu gọn thanh điều hướng",
    "tenantContext": "Tổ chức hiện tại",
    "command": {
      "open": "Mở bảng lệnh",
      "placeholder": "Tìm trang hoặc chức năng…",
      "empty": "Không tìm thấy trang phù hợp hoặc bạn không có quyền truy cập."
    },
    "language": {
      "label": "Chọn ngôn ngữ",
      "vi": "Tiếng Việt",
      "en": "English"
    },
    "account": {
      "label": "Mở menu tài khoản",
      "profile": "Hồ sơ cá nhân",
      "logout": "Đăng xuất",
      "loggingOut": "Đang đăng xuất…",
      "activeRole": "Vai trò hiện tại",
      "dataScope": "Phạm vi dữ liệu",
      "demoRole": "Đổi vai trò mô phỏng"
    }
  }
}
```

Use this exact English tree:

```json
{
  "appShell": {
    "skipToContent": "Skip to main content",
    "toggleSidebar": "Open or collapse navigation",
    "tenantContext": "Current organization",
    "command": {
      "open": "Open command palette",
      "placeholder": "Search pages or features…",
      "empty": "No matching page was found, or you do not have access.",
      "primaryGroup": "Workspace"
    },
    "language": {
      "label": "Choose language",
      "vi": "Tiếng Việt",
      "en": "English"
    },
    "account": {
      "label": "Open account menu",
      "profile": "Profile",
      "logout": "Sign out",
      "loggingOut": "Signing out…",
      "activeRole": "Active role",
      "dataScope": "Data scope",
      "demoRole": "Switch demo role"
    }
  }
}
```

Also add `"primaryGroup": "Không gian làm việc"` under the Vietnamese `appShell.command` object.

- [ ] **Step 2: Add roleManagement namespaces**

Add the following exact key/value pairs. Nest dotted keys as JSON objects.

| Key suffix under `roleManagement` | Vietnamese | English |
|---|---|---|
| `title` | Vai trò & Phân quyền | Roles & Permissions |
| `description` | Quản lý quyền truy cập và phạm vi dữ liệu trong tổ chức. | Manage access permissions and data scope across the organization. |
| `tabs.roles` | Vai trò | Roles |
| `tabs.catalogue` | Danh mục quyền | Permission catalogue |
| `tabs.comparison` | So sánh vai trò | Compare roles |
| `summary.total` | Tổng vai trò | Total roles |
| `summary.system` | Vai trò hệ thống | System roles |
| `summary.custom` | Vai trò tùy chỉnh | Custom roles |
| `summary.permissions` | Quyền hệ thống | Permissions |
| `filters.roleSearch` | Tìm theo tên hoặc mã vai trò… | Search by role name or code… |
| `filters.statusAll` | Mọi trạng thái | All statuses |
| `filters.statusActive` | Đang hoạt động | Active |
| `filters.statusInactive` | Ngừng hoạt động | Inactive |
| `filters.typeAll` | Mọi loại vai trò | All role types |
| `filters.system` | Hệ thống | System |
| `filters.custom` | Tùy chỉnh | Custom |
| `filters.clear` | Xóa bộ lọc | Clear filters |
| `table.role` | Vai trò | Role |
| `table.permissions` | Số quyền | Permissions |
| `table.scopes` | Phạm vi dữ liệu | Data scopes |
| `table.status` | Trạng thái | Status |
| `table.updatedAt` | Cập nhật | Updated |
| `table.actions` | Thao tác | Actions |
| `actions.create` | Tạo vai trò | Create role |
| `actions.view` | Xem chi tiết | View details |
| `actions.edit` | Chỉnh sửa | Edit |
| `actions.clone` | Nhân bản | Clone |
| `actions.delete` | Xóa vai trò | Delete role |
| `actions.retry` | Thử lại | Retry |
| `actions.back` | Quay lại | Back |
| `actions.next` | Tiếp tục | Continue |
| `actions.save` | Lưu vai trò | Save role |
| `actions.cancel` | Hủy | Cancel |
| `actions.discard` | Bỏ thay đổi | Discard changes |
| `actions.keepEditing` | Tiếp tục chỉnh sửa | Keep editing |
| `actions.reloadLatest` | Tải dữ liệu mới nhất | Load latest data |
| `actions.selectAll` | Chọn tất cả | Select all |
| `actions.deselectAll` | Bỏ chọn tất cả | Clear selection |
| `editor.basics.title` | Thông tin cơ bản | Basic information |
| `editor.basics.roleCode` | Mã vai trò | Role code |
| `editor.basics.name` | Tên vai trò | Role name |
| `editor.basics.description` | Mô tả | Description |
| `editor.basics.status` | Trạng thái | Status |
| `editor.permissions.title` | Quyền truy cập | Access permissions |
| `editor.permissions.search` | Tìm theo mã hoặc mô tả quyền… | Search by permission code or description… |
| `editor.permissions.moduleAll` | Mọi phân hệ | All modules |
| `editor.permissions.riskAll` | Mọi mức rủi ro | All risk levels |
| `editor.permissions.bulkPrivilegedTitle` | Xác nhận cấp quyền đặc quyền | Confirm privileged access |
| `editor.permissions.bulkPrivilegedDescription` | Lựa chọn này sẽ cấp một hoặc nhiều quyền đặc quyền cho vai trò. | This selection grants one or more privileged permissions to the role. |
| `editor.permissions.confirmBulk` | Xác nhận cấp quyền | Confirm access |
| `editor.scopes.title` | Phạm vi dữ liệu | Data scopes |
| `editor.scopes.entity` | Đối tượng | Entity |
| `editor.scopes.type` | Loại phạm vi | Scope type |
| `editor.scopes.team` | Nhóm áp dụng | Assigned team |
| `editor.scopes.teamPlaceholder` | Chọn nhóm đang hoạt động | Select an active team |
| `catalogue.title` | Danh mục quyền hệ thống | System permission catalogue |
| `catalogue.search` | Tìm theo mã hoặc mô tả quyền… | Search by permission code or description… |
| `catalogue.empty` | Chưa có quyền nào trong danh mục. | No permissions are available in the catalogue. |
| `catalogue.filteredEmpty` | Không có quyền nào khớp với bộ lọc. | No permissions match the current filters. |
| `comparison.title` | So sánh vai trò | Compare roles |
| `comparison.left` | Vai trò thứ nhất | First role |
| `comparison.right` | Vai trò thứ hai | Second role |
| `comparison.onlyDifferences` | Chỉ xem khác biệt | Show differences only |
| `comparison.hasPermission` | Có quyền | Granted |
| `comparison.noPermission` | Không có quyền | Not granted |
| `comparison.same` | Giống nhau | Same |
| `comparison.different` | Khác nhau | Different |
| `comparison.needsTwo` | Cần ít nhất hai vai trò để so sánh. | At least two roles are required for comparison. |
| `comparison.selectRoles` | Chọn hai vai trò khác nhau để bắt đầu. | Select two different roles to begin. |
| `comparison.error` | Chưa thể tải đầy đủ dữ liệu so sánh. | Complete comparison data could not be loaded. |
| `deleteDialog.title` | Xóa vai trò tùy chỉnh | Delete custom role |
| `deleteDialog.description` | Vai trò {{name}} ({{code}}) sẽ ngừng cấp quyền ngay sau khi xóa. | Role {{name}} ({{code}}) will stop granting access immediately after deletion. |
| `deleteDialog.confirm` | Xóa vai trò | Delete role |
| `deleteDialog.pending` | Đang xóa… | Deleting… |
| `states.loading` | Đang tải dữ liệu vai trò… | Loading role data… |
| `states.rolesError` | Chưa thể tải danh sách vai trò. | The role list could not be loaded. |
| `states.firstEmptyTitle` | Chưa có vai trò tùy chỉnh | No custom roles yet |
| `states.firstEmptyDescription` | Tạo vai trò đầu tiên để cấp quyền phù hợp cho đội ngũ. | Create the first role to grant appropriate team access. |
| `states.filteredEmptyTitle` | Không tìm thấy vai trò phù hợp | No matching roles |
| `states.filteredEmptyDescription` | Thay đổi từ khóa hoặc xóa bộ lọc để xem lại danh sách. | Change the search term or clear filters to view the list. |
| `states.detailError` | Chưa thể tải chi tiết vai trò. | Role details could not be loaded. |
| `states.teamsError` | Chưa thể tải danh sách nhóm đang hoạt động. | Active teams could not be loaded. |
| `states.created` | Đã tạo vai trò {{name}}. | Role {{name}} was created. |
| `states.updated` | Đã cập nhật vai trò {{name}}. | Role {{name}} was updated. |
| `states.deleted` | Đã xóa vai trò {{name}}. | Role {{name}} was deleted. |
| `risk.normal` | Thông thường | Normal |
| `risk.sensitive` | Nhạy cảm | Sensitive |
| `risk.privileged` | Đặc quyền | Privileged |
| `scopeTypes.OWN` | Dữ liệu cá nhân phụ trách | Owned records |
| `scopeTypes.TEAM` | Dữ liệu của một nhóm | Team records |
| `scopeTypes.TEAM_TREE` | Nhóm và các nhóm cấp dưới | Team and descendants |
| `scopeTypes.TENANT` | Toàn tổ chức | Entire organization |
| `status.ACTIVE` | Đang hoạt động | Active |
| `status.INACTIVE` | Ngừng hoạt động | Inactive |
| `status.system` | Hệ thống | System |
| `status.custom` | Tùy chỉnh | Custom |
| `validation.roleCode` | Dùng chữ hoa, số hoặc dấu gạch dưới; bắt đầu bằng chữ cái và tối đa 191 ký tự. | Use uppercase letters, numbers, or underscores; start with a letter and use at most 191 characters. |
| `validation.name` | Nhập tên vai trò, tối đa 255 ký tự. | Enter a role name no longer than 255 characters. |
| `validation.description` | Mô tả không được vượt quá 4.000 ký tự. | Description must not exceed 4,000 characters. |
| `validation.teamRequired` | Chọn nhóm cho phạm vi này. | Select a team for this scope. |
| `validation.duplicateScope` | Phạm vi dữ liệu bị trùng lặp. | This data scope is duplicated. |

The error subtree must contain these exact keys in both locales:

```json
{
  "requestValidation": "Dữ liệu chưa hợp lệ. Kiểm tra các trường được đánh dấu.",
  "authenticationRequired": "Phiên đăng nhập không còn hợp lệ. Hãy đăng nhập lại.",
  "accessDenied": "Bạn không có quyền thực hiện thao tác này.",
  "roleNotFound": "Vai trò không còn tồn tại hoặc không thuộc tổ chức hiện tại.",
  "roleCodeExists": "Mã vai trò này đã được sử dụng.",
  "systemRoleImmutable": "Vai trò hệ thống chỉ được xem và không thể thay đổi.",
  "versionConflict": "Vai trò đã được người khác cập nhật. Bản nháp của bạn vẫn được giữ.",
  "permissionUnknown": "Một hoặc nhiều quyền đã chọn không còn tồn tại.",
  "dataScopeInvalid": "Phạm vi dữ liệu hoặc nhóm được chọn không hợp lệ.",
  "internal": "Máy chủ chưa thể hoàn tất thao tác. Hãy thử lại.",
  "network": "Không thể kết nối đến dịch vụ vai trò. Kiểm tra kết nối và thử lại."
}
```

Tasks 9–14 must use only the listed keys and must not use `defaultValue` as a substitute for a missing key.

- [ ] **Step 3: Verify locale parity without rewriting user changes**

Use a read-only JSON key comparison method already available in the repository or inspect with `rg`. Do not format the entire JSON files if it would rewrite unrelated landing/auth sections.

```bash
npm run typecheck
rg -n '"appShell"|"roleManagement"|"versionConflict"|"dataScopeInvalid"' src/i18n/locales/vi/translation.json src/i18n/locales/en/translation.json
```

Expected: both files contain the same namespaces and error keys.

---

### Task 7: Define Role Management domain models, mapping and validation

**Files:**

- Create: `src/features/platform/roles/types.ts`
- Create: `src/features/platform/roles/roleMappers.ts`
- Create: `src/features/platform/roles/roleErrors.ts`
- Create: `src/features/platform/roles/schemas/roleEditorSchema.ts`

**Interfaces:**

- Produces `RoleSummary`, `RoleDetail`, `PermissionItem`, `RoleEditorDraft`, `RoleEditorMode`, `RoleFilters`, mapping functions and Zod schema.
- Existing page is not changed in this task.

- [ ] **Step 1: Create stable view/domain types**

```ts
export type RoleStatus = 'ACTIVE' | 'INACTIVE';
export type PermissionRisk = 'NORMAL' | 'SENSITIVE' | 'PRIVILEGED';
export type RoleScopeType = 'OWN' | 'TEAM' | 'TEAM_TREE' | 'TENANT';
export type RoleEditorMode = 'view' | 'create' | 'edit' | 'clone';
export type RoleEditorStep = 'basics' | 'permissions' | 'scopes';

export interface PermissionItem {
  permissionCode: string;
  description: string;
  moduleCode: string;
  riskLevel: PermissionRisk;
}

export interface RoleDataScopeDraft {
  entityType: string;
  type: RoleScopeType;
  teamId?: string;
}

export interface RoleSummary {
  id: string;
  roleCode: string;
  name: string;
  description?: string;
  system: boolean;
  status: RoleStatus;
  permissionCount: number;
  dataScopeCount: number;
  updatedAt: string;
  version: number;
}

export interface RoleDetail extends RoleSummary {
  permissionCodes: string[];
  dataScopes: RoleDataScopeDraft[];
  createdAt: string;
}

export interface RoleEditorDraft {
  roleCode: string;
  name: string;
  description: string;
  status: RoleStatus;
  permissionCodes: string[];
  dataScopes: RoleDataScopeDraft[];
  version?: number;
}

export interface RoleFilters {
  search: string;
  status: 'ALL' | RoleStatus;
  type: 'ALL' | 'SYSTEM' | 'CUSTOM';
}
```

- [ ] **Step 2: Create deterministic mappers**

Export:

```ts
mapPermissionResponse(response: PermissionResponse): PermissionItem
mapRoleSummaryResponse(response: RoleSummaryResponse): RoleSummary
mapRoleDetailResponse(response: RoleDetailResponse): RoleDetail
createEmptyRoleDraft(): RoleEditorDraft
roleDetailToEditDraft(role: RoleDetail): RoleEditorDraft
roleDetailToCloneDraft(role: RoleDetail): RoleEditorDraft
draftToCreateRequest(draft: RoleEditorDraft): CreateRoleRequest
draftToUpdateRequest(draft: RoleEditorDraft): UpdateRoleRequest
```

Clone mapper must set `roleCode: ''`, preserve name/description/permissions/dataScopes and omit ID/version. Request mappers trim values, uppercase role/entity codes, deduplicate arrays and remove `teamId` for OWN/TENANT.

- [ ] **Step 3: Create exact Zod validation**

Use `^[A-Z][A-Z0-9_]*$`, max 191 for role/entity codes, max 255 for name and max 4000 for description. Add `superRefine` so TEAM/TEAM_TREE require a non-empty `teamId`, OWN/TENANT reject it and normalized scope tuples are unique.

- [ ] **Step 4: Map ApiError codes to translation and recovery**

```ts
export interface RoleErrorDescriptor {
  key: string;
  fieldErrors: Record<string, string>;
  recovery: 'retry' | 'reload-role' | 'login' | 'none';
}

export function describeRoleError(error: unknown): RoleErrorDescriptor;
```

Read `ApiError.errorCode` and `problemDetail.errors`; never return raw `error.message` as user copy.

- [ ] **Step 5: Static verification**

```bash
npm run typecheck
rg -n "ROLE_CODE_ALREADY_EXISTS|ROLE_VERSION_CONFLICT|superRefine|scopeType" src/features/platform/roles
```

Expected: error mapping and scope validation exist; create request mapper does not emit a top-level `scopeType`.

---

### Task 8: Add React Query orchestration for roles, permissions, teams and mutations

**Files:**

- Create: `src/features/platform/roles/hooks/useRoleManagement.ts`

**Interfaces:**

- Consumes Task 7 domain mappers.
- Produces query hooks and mutation hooks used by every Role component.

- [ ] **Step 1: Define tenant-scoped query keys**

```ts
export const roleManagementKeys = {
  root: (tenantId: string) => ['role-management', tenantId] as const,
  roles: (tenantId: string) => ['role-management', tenantId, 'roles'] as const,
  permissions: (tenantId: string) => ['role-management', tenantId, 'permissions'] as const,
  detail: (tenantId: string, roleId: string) =>
    ['role-management', tenantId, 'roles', roleId] as const,
  teams: (tenantId: string) => ['role-management', tenantId, 'teams'] as const,
};
```

- [ ] **Step 2: Add independent list/catalogue/detail/team queries**

Export:

```ts
useRoles(tenantId: string): UseQueryResult<RoleSummary[], Error>
usePermissionCatalogue(tenantId: string): UseQueryResult<PermissionItem[], Error>
useRoleDetail(tenantId: string, roleId?: string): UseQueryResult<RoleDetail, Error>
useScopeTeams(tenantId: string, enabled: boolean): UseQueryResult<TeamItem[], Error>
```

`useRoleDetail` is enabled only with role ID. `useScopeTeams` filters to `status === 'ACTIVE'`. Do not wrap query functions with catches that return empty arrays.

- [ ] **Step 3: Add create and update mutations**

Export these exact hooks:

```ts
useCreateRole(tenantId: string): UseMutationResult<RoleDetail, Error, RoleEditorDraft>
useUpdateRole(tenantId: string): UseMutationResult<
  RoleDetail,
  Error,
  { roleId: string; draft: RoleEditorDraft }
>
```

Create maps the draft, maps the response and writes both detail and list cache from canonical response. Update variables are `{ roleId: string; draft: RoleEditorDraft }`. On error, leave cache and draft untouched.

- [ ] **Step 4: Add delete mutation**

Export:

```ts
useDeleteRole(tenantId: string): UseMutationResult<
  void,
  Error,
  { roleId: string; version: number }
>
```

Remove the list row and detail cache only in `onSuccess`. Do not catch inside the mutation function.

- [ ] **Step 5: Add comparison detail loading**

Export `useRoleComparison(tenantId, leftRoleId, rightRoleId)` using `useQueries`. Disable both queries until two distinct non-empty IDs are selected. Return this explicit shape without inferring permission membership:

```ts
interface RoleComparisonQuery {
  left?: RoleDetail;
  right?: RoleDetail;
  isPending: boolean;
  error?: Error;
  refetch(): Promise<void>;
}
```

- [ ] **Step 6: Static verification**

```bash
npm run typecheck
rg -n "catch\(\(\) => \[\]\)|onSuccess|useQueries|role-management" src/features/platform/roles/hooks/useRoleManagement.ts
```

Expected: no swallowed query failure; delete cache removal exists only under success.

---

### Task 9: Build the role list, summary, filters and production states

**Files:**

- Create: `src/features/platform/roles/components/RolesSummary.tsx`
- Create: `src/features/platform/roles/components/RolesToolbar.tsx`
- Create: `src/features/platform/roles/components/RolesTable.tsx`

**Interfaces:**

```ts
interface RolesSummaryProps {
  roles: RoleSummary[];
  permissionCount: number;
  loading: boolean;
}

interface RolesToolbarProps {
  filters: RoleFilters;
  onFiltersChange(filters: RoleFilters): void;
  canManage: boolean;
  onCreate(): void;
}

interface RolesTableProps {
  roles: RoleSummary[];
  loading: boolean;
  error?: RoleErrorDescriptor;
  canManage: boolean;
  hasActiveFilters: boolean;
  onRetry(): void;
  onClearFilters(): void;
  onOpen(roleId: string, mode: 'view' | 'edit'): void;
  onClone(roleId: string): void;
  onDelete(role: RoleSummary): void;
}
```

- [ ] **Step 1: Render a compact summary strip**

Compute total, system and custom counts from roles; permission total comes from catalogue. Use skeleton text while each value is pending. Use tabular numbers and separators rather than four large cards.

- [ ] **Step 2: Build semantic filters and manage-gated create action**

Support search, status and system/custom. Use actual label/select controls. Reset all filters with one action. Render Create only when `canManage`.

- [ ] **Step 3: Build desktop and mobile representations**

Desktop columns: identity, permission count, data-scope count, status, updated time and actions. Mobile renders stacked role rows with the same action menu. A system role exposes View only; custom role exposes Edit/Clone/Delete only when `canManage`.

- [ ] **Step 4: Implement four distinct states**

- Loading: skeleton rows matching the table.
- Query error: inline error with Retry.
- First-use empty: explanatory copy and gated Create action.
- Filtered empty: clear-filter action, no create suggestion.

- [ ] **Step 5: Static verification**

```bash
npm run typecheck
rg -n "platform_role.manage|Skeleton|onClearFilters|overflow-x-auto" src/features/platform/roles/components/RolesSummary.tsx src/features/platform/roles/components/RolesToolbar.tsx src/features/platform/roles/components/RolesTable.tsx
```

Expected: mobile rendering is present and the primary solution does not rely on horizontal scrolling.

---

### Task 10: Build semantic permission selection and read-only catalogue

**Files:**

- Create: `src/features/platform/roles/components/PermissionMatrix.tsx`
- Create: `src/features/platform/roles/components/PermissionCatalogue.tsx`

**Interfaces:**

```ts
interface PermissionMatrixProps {
  permissions: PermissionItem[];
  value: string[];
  readOnly: boolean;
  onChange(permissionCodes: string[]): void;
}

interface PermissionCatalogueProps {
  permissions: PermissionItem[];
  loading: boolean;
  error?: RoleErrorDescriptor;
  onRetry(): void;
}
```

- [ ] **Step 1: Replace clickable badges/divs with semantic controls**

Use Input, Select or ToggleGroup for filters and a `<label>` paired with each Checkbox. Group permissions by module and sort by permission code. Module bulk checkbox must support checked/unchecked/indeterminate.

- [ ] **Step 2: Add privileged bulk-selection confirmation**

When a module/global bulk action would newly add any `PRIVILEGED` permission, store the proposed code array in local state and open `AlertDialog`. Apply `onChange(proposedCodes)` only after confirmation. Individual checkbox selection remains explicit and does not need a second dialog.

- [ ] **Step 3: Render risk semantics without CRM status config**

Use text plus icon for NORMAL, SENSITIVE and PRIVILEGED. Do not reuse lifecycle badges. Color is supplementary, never the only distinction.

- [ ] **Step 4: Build the read-only catalogue**

Support search, module and risk filters. Render code, module, description and risk. Include loading, query error, unfiltered empty and filtered empty states.

- [ ] **Step 5: Static verification**

```bash
npm run typecheck
rg -n "onClick=.*div|cursor-pointer.*Badge|PRIVILEGED|AlertDialog|indeterminate" src/features/platform/roles/components/PermissionMatrix.tsx src/features/platform/roles/components/PermissionCatalogue.tsx
```

Expected: no clickable div/badge interaction; privileged bulk selection is confirmed.

---

### Task 11: Build per-entity data-scope editing with real team selection

**Files:**

- Create: `src/features/platform/roles/components/DataScopeEditor.tsx`

**Interfaces:**

```ts
interface DataScopeEditorProps {
  value: RoleDataScopeDraft[];
  teams: TeamItem[];
  teamsLoading: boolean;
  teamsError?: RoleErrorDescriptor;
  readOnly: boolean;
  onRetryTeams(): void;
  onChange(scopes: RoleDataScopeDraft[]): void;
}
```

- [ ] **Step 1: Define the supported CRM entities in one local constant**

Use the six entities already present in the current UI:

```ts
export const ROLE_SCOPE_ENTITIES = [
  'ACCOUNT',
  'CONTACT',
  'LEAD',
  'OPPORTUNITY',
  'QUOTE',
  'ORDER',
] as const;
```

Do not silently add backend entity types outside current product scope.

- [ ] **Step 2: Render one scope row per configured entity**

Each row has entity label, scope type select and conditional searchable team select. Changing type to OWN/TENANT removes `teamId`. Changing to TEAM/TEAM_TREE leaves team undefined until the user selects an active team, causing form validation to block save.

- [ ] **Step 3: Handle team query states locally**

Only show loading/error/Retry beside rows that need a team. Do not replace a failed team query with an empty dropdown. Read-only system roles display stored team ID/name without permitting changes.

- [ ] **Step 4: Static verification**

```bash
npm run typecheck
rg -n "TEAM_TREE|teamId|ROLE_SCOPE_ENTITIES|catch\(\(\) => \[\]\)" src/features/platform/roles/components/DataScopeEditor.tsx
```

Expected: teamId is conditional and no error is converted to an empty list.

---

### Task 12: Build the role editor Sheet and truthful create/edit/clone flows

**Files:**

- Create: `src/features/platform/roles/components/RoleBasicsStep.tsx`
- Create: `src/features/platform/roles/components/RoleEditorSheet.tsx`

**Interfaces:**

```ts
interface RoleEditorSheetProps {
  open: boolean;
  mode: RoleEditorMode;
  roleId?: string;
  tenantId: string;
  permissions: PermissionItem[];
  canManage: boolean;
  onOpenChange(open: boolean): void;
}
```

- [ ] **Step 1: Build the basics step with React Hook Form and Zod**

Create/clone exposes editable roleCode; edit/view renders roleCode readonly. Create/clone does not expose status because backend creates ACTIVE. Edit exposes ACTIVE/INACTIVE. System role and `mode === 'view'` are readonly.

- [ ] **Step 2: Hydrate editor drafts only from canonical sources**

- create uses `createEmptyRoleDraft()` immediately;
- edit/view waits for successful `useRoleDetail()` then uses `roleDetailToEditDraft()`;
- clone waits for detail then uses `roleDetailToCloneDraft()`;
- detail error renders Retry and never opens a partially populated draft.

- [ ] **Step 3: Implement three-step navigation**

Use `basics`, `permissions`, `scopes`. Before Next, trigger validation only for fields owned by the current step. Footer provides Cancel, Back, Next and Save according to current step/mode. Sheet is approximately 680px on desktop and full-width on mobile.

- [ ] **Step 4: Wire permissions and data scopes**

Use Controller/useFieldArray or explicit `setValue` with `shouldDirty: true` for permissionCodes and dataScopes. Enable `useScopeTeams()` when any current scope is TEAM or TEAM_TREE.

- [ ] **Step 5: Submit canonical create/update mutations**

Create uses `useCreateRole`; edit uses `useUpdateRole`. View has no Save. Disable actions during pending. Close and reset only after mutation success. Toast translated success copy with no exclamation mark.

- [ ] **Step 6: Preserve drafts on version conflict**

When `describeRoleError(error).recovery === 'reload-role'`, show an inline conflict alert. Keep form values. The Reload latest action calls detail refetch and resets the form only after the user explicitly confirms discarding the draft.

- [ ] **Step 7: Guard unsaved close**

Intercept `onOpenChange(false)` when `formState.isDirty`. Open an AlertDialog with Keep editing and Discard changes. Only the discard action resets and calls the parent close callback.

- [ ] **Step 8: Static verification**

```bash
npm run typecheck
rg -n "scopeType:|formState.isDirty|reload-role|roleDetailToCloneDraft|sm:max-w" src/features/platform/roles/components/RoleEditorSheet.tsx src/features/platform/roles/components/RoleBasicsStep.tsx
```

Expected: no top-level scopeType payload; clone and conflict paths use detail data.

---

### Task 13: Build real role comparison and confirmed delete

**Files:**

- Create: `src/features/platform/roles/components/RoleComparison.tsx`
- Create: `src/features/platform/roles/components/RoleDeleteDialog.tsx`

**Interfaces:**

```ts
interface RoleComparisonProps {
  tenantId: string;
  roles: RoleSummary[];
  permissions: PermissionItem[];
  canManage: boolean;
  onCreate(): void;
}

interface RoleDeleteDialogProps {
  tenantId: string;
  role: RoleSummary | null;
  open: boolean;
  onOpenChange(open: boolean): void;
}
```

- [ ] **Step 1: Require two distinct comparison selections**

Start with no hidden hardcoded role IDs. Disable comparison until two different IDs are selected. With fewer than two roles, show an explanatory state and gated Create action.

- [ ] **Step 2: Compare real permission and scope sets**

Create `Set` instances from both detail responses. Group permission rows by module and compute left/right membership solely with `set.has(permissionCode)`. Compare data scopes with normalized `${entityType}|${type}|${teamId ?? ''}` keys. Add a translated Only differences switch.

- [ ] **Step 3: Handle comparison loading and failure as one result**

Show skeleton while either detail is pending. If either fails, show error and Retry; do not render a partial matrix as complete.

- [ ] **Step 4: Implement destructive confirmation**

Delete dialog names the role and code, blocks system roles and calls `useDeleteRole` with exact current version. Close and toast only after success. On failure, keep dialog/row and render translated error with Retry.

- [ ] **Step 5: Static verification**

```bash
npm run typecheck
rg -n "startsWith\(|riskLevel === 'NORMAL'|deleteRole.*catch|permissionCodes|Only" src/features/platform/roles/components/RoleComparison.tsx src/features/platform/roles/components/RoleDeleteDialog.tsx
```

Expected: no prefix/risk inference and no swallowed delete error.

---

### Task 14: Compose RolesPage and synchronize roleApi DTOs

**Files:**

- Modify: `src/services/api/roleApi.ts`
- Modify: `src/features/platform/roles/roleMappers.ts`
- Modify: `src/features/platform/roles/RolesPage.tsx`
- Delete: `src/features/platform/roles/components/PermissionGroupSelector.tsx`
- Delete: `src/features/platform/roles/schemas/roleFormSchema.ts`

**Interfaces:**

- RolesPage becomes route composition and local UI state only.
- roleApi exports contract-exact `PermissionResponse`, `RoleSummaryResponse`, `RoleDetailResponse`, `CreateRoleRequest`, `UpdateRoleRequest` and `RoleDataScopeRequest`.

- [ ] **Step 1: Make roleApi response types exact**

Use required fields from `docs/api-reference.md`:

```ts
export interface PermissionResponse {
  permissionCode: string;
  description: string;
  moduleCode: string;
  riskLevel: 'NORMAL' | 'SENSITIVE' | 'PRIVILEGED';
}

export interface RoleSummaryResponse {
  id: string;
  roleCode: string;
  name: string;
  description: string | null;
  system: boolean;
  status: 'ACTIVE' | 'INACTIVE';
  permissionCount: number;
  dataScopeCount: number;
  updatedAt: string;
  version: number;
}

export interface RoleDetailResponse {
  id: string;
  roleCode: string;
  name: string;
  description: string | null;
  system: boolean;
  status: 'ACTIVE' | 'INACTIVE';
  permissionCodes: string[];
  dataScopes: RoleDataScopeRequest[];
  createdAt: string;
  updatedAt: string;
  version: number;
}

export interface RoleDataScopeRequest {
  entityType: string;
  type: 'OWN' | 'TEAM' | 'TEAM_TREE' | 'TENANT';
  teamId?: string;
}

export interface CreateRoleRequest {
  roleCode: string;
  name: string;
  description?: string;
  permissionCodes: string[];
  dataScopes: RoleDataScopeRequest[];
}

export interface UpdateRoleRequest {
  version: number;
  name: string;
  description?: string;
  status: 'ACTIVE' | 'INACTIVE';
  permissionCodes: string[];
  dataScopes: RoleDataScopeRequest[];
}
```

Remove `isSystem`, detail `permissions`, detail/create `scopeType` and optional version fallbacks. Keep strong quoted If-Match in `deleteRole` and require its version argument.

- [ ] **Step 2: Simplify mappers after exact DTO synchronization**

Remove compatibility branches for `isSystem`, `code`, `permissions` and generated timestamps. Every view model value must come from the exact response.

- [ ] **Step 3: Rewrite RolesPage as composition**

RolesPage responsibilities:

- obtain `session.tenant.id` and `can('platform_role.manage', session)`;
- load roles and permissions independently;
- own active tab, list filters, page selection, editor mode/role ID and delete role state;
- render page header, summary and three tab components;
- pass normalized errors through `describeRoleError()`;
- never call roleApi directly.

Keep the page under roughly 250 lines. Do not export permission mapping types from the page.

- [ ] **Step 4: Remove obsolete files safely**

Use `apply_patch` deletion only after `rg` confirms no imports of `PermissionGroupSelector`, `createRoleFormSchema` or `editRoleFormSchema` remain.

- [ ] **Step 5: Static verification**

```bash
npm run typecheck
rg -n "PermissionGroupSelector|roleFormSchema|isSystem|scopeType|catch\(\(\) => null\)|catch\(\(\) => \[\]\)" src/features/platform/roles src/services/api/roleApi.ts
wc -l src/features/platform/roles/RolesPage.tsx
```

Expected: no obsolete role UI import, no swallowed errors, no legacy DTO aliases and RolesPage is composition-sized.

---

### Task 15: Apply final responsive, visual and accessibility polish

**Files:**

- Modify: `src/components/ui/sidebar.tsx`
- Modify: `src/components/ui/sheet.tsx`
- Modify: `src/layouts/AppLayout.tsx`
- Modify: `src/layouts/Header.tsx`
- Modify: `src/layouts/Sidebar.tsx`
- Modify: `src/layouts/CommandPalette.tsx`
- Modify: `src/features/platform/roles/components/RolesSummary.tsx`
- Modify: `src/features/platform/roles/components/RolesToolbar.tsx`
- Modify: `src/features/platform/roles/components/RolesTable.tsx`
- Modify: `src/features/platform/roles/components/RoleBasicsStep.tsx`
- Modify: `src/features/platform/roles/components/PermissionMatrix.tsx`
- Modify: `src/features/platform/roles/components/DataScopeEditor.tsx`
- Modify: `src/features/platform/roles/components/RoleEditorSheet.tsx`
- Modify: `src/features/platform/roles/components/PermissionCatalogue.tsx`
- Modify: `src/features/platform/roles/components/RoleComparison.tsx`
- Modify: `src/features/platform/roles/components/RoleDeleteDialog.tsx`

**Interfaces:** No new public interfaces. This task enforces the approved visual/accessibility contract.

- [ ] **Step 1: Audit semantic landmarks and labels**

Confirm one main, one global nav, header landmark, page heading, aria-label for every icon-only button, aria-current for active navigation and visible focus styles.

- [ ] **Step 2: Audit responsive behavior in source**

Confirm:

- mobile sidebar uses Sheet;
- tablet desktop boundary starts at `md` and default collapsed behavior applies below 1024;
- mobile role list uses stacked rows;
- editor Sheet is full-width mobile and approximately 680px desktop;
- toolbar/filter controls wrap without fixed-width overflow.

- [ ] **Step 3: Normalize visual language**

Use slate neutrals and one blue accent. Remove gradients, oversized shadows, card nesting, excessive uppercase and unneeded rounded pills. Apply `tabular-nums` to counts. Keep motion 150–200ms and add `motion-reduce:transition-none` where custom transitions remain.

In `sheet.tsx`, set the overlay to `bg-slate-950/40`, set open/close animation duration to 200ms and retain reduced-motion support. Both `RoleEditorSheet` and the mobile Sidebar pass `closeLabel={t('common.close')}`.

- [ ] **Step 4: Check touch and keyboard affordances**

Mobile primary controls use at least 44px touch targets. Command items, navigation, editor steps, checkboxes and dialogs are keyboard reachable. No interaction relies on hover only.

- [ ] **Step 5: Static verification**

```bash
npm run typecheck
npm run lint
rg -n "bg-gradient|backdrop-blur|shadow-2xl|material-symbols|href=\"#\"|cursor-pointer.*div" src/layouts src/features/platform/roles src/components/ui/sidebar.tsx
```

Expected: typecheck/lint pass; remaining matches, if any, are reviewed and justified against the spec rather than ignored.

---

### Task 16: Final static verification and handoff

**Files:**

- Review: all files listed in File Map.
- Review unchanged API reference: `../docs/api-reference.md`.
- Do not create or modify runtime/test files.

**Interfaces:** Produces an uncommitted, statically verified handoff and a manual acceptance checklist for the user.

- [ ] **Step 1: Confirm the worktree scope before reviewing**

```bash
git status --short
rtk diff
```

Separate pre-existing landing/auth/i18n changes from implementation changes. Do not revert or reformat pre-existing work.

- [ ] **Step 2: Run allowed static checks**

```bash
npm run typecheck
npm run lint
```

Do not run `npm test`, `npm run build`, `npm run dev`, Playwright, browser tools or API calls.

- [ ] **Step 3: Run targeted correctness scans**

```bash
rg -n "href=\"#\"|Sắp ra mắt|Workspace: IPA|Vũ Phạm Tuấn|material-symbols" src/layouts
rg -n "platform_user.manage" src/config/navigationConfig.ts src/features/platform/roles src/routes
rg -n "catch\(\(\) => null\)|catch\(\(\) => \[\]\)|startsWith\(role|riskLevel === 'NORMAL'" src/features/platform/roles
rg -n "scopeType" src/services/api/roleApi.ts src/features/platform/roles
rg -n "platform_role.read|platform_role.manage" src/config src/core src/features/platform/roles
```

Expected:

- no fake shell copy or links;
- no Role Management gate using `platform_user.manage`;
- no swallowed role errors or inferred comparison;
- no top-level role request `scopeType`;
- read/manage permission codes appear in manifest, evaluator consumers and action gating.

- [ ] **Step 4: Compare locale key trees**

Confirm every `t('appShell...')` and `t('roleManagement...')` key exists in both locale files. Fix only missing keys; do not normalize unrelated JSON.

- [ ] **Step 5: Review API synchronization decision**

Confirm source still calls only documented Role Management endpoints and payloads. Because no endpoint or contract changed, leave `../docs/api-reference.md` untouched. If source behavior diverged, stop and report the divergence rather than editing docs to describe unimplemented behavior.

- [ ] **Step 6: Prepare the unexecuted runtime acceptance checklist**

Report these scenarios to the user without running them:

1. Desktop, tablet and mobile sidebar behavior.
2. Ctrl/Cmd+B and Ctrl/Cmd+K outside and inside form fields.
3. Menu/route/action behavior for read-only, manager and tenant-admin sessions.
4. Role list loading, API error, first-use empty and filtered empty.
5. Create/edit with OWN, TENANT, TEAM and TEAM_TREE.
6. Clone preserves permissions/scopes but requires a new code.
7. Version conflict preserves draft.
8. Delete succeeds only after API response and remains visible on failure.
9. Comparison shows real permission/scope differences.
10. Vietnamese/English switching in shell and Role Management.

- [ ] **Step 7: Leave changes uncommitted**

Final handoff must list created/modified/deleted files, static check results, skipped runtime checks and any pre-existing changes preserved. Do not stage or commit.
