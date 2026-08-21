# Role Production Governance: Design Specification

**Ngày:** 2026-08-21

**Phạm vi:** `crm-fe`

**Route:** `/app/platform/roles`

**Trạng thái:** Thiết kế trong hội thoại đã được duyệt; tài liệu chờ người dùng duyệt

**Hướng thiết kế:** Production-safe Role Governance, frontend-first

## 1. Quan hệ với tài liệu hiện có

Tài liệu này là nguồn thiết kế chính cho màn Vai trò & Phân quyền. Khi có mâu
thuẫn, tài liệu này thay thế các phần liên quan tới Role Management trong:

- `docs/superpowers/specs/2026-08-21-app-shell-role-access-redesign-design.md`;
- `docs/superpowers/plans/2026-08-21-app-shell-role-access-redesign.md`.

Yêu cầu ngôn ngữ của tài liệu này tuân theo
`docs/superpowers/specs/2026-08-21-system-wide-english-only-design.md`. Mọi
runtime copy của Role Governance chỉ dùng tiếng Anh. Quy tắc tiếng Việt mặc định
hoặc song ngữ trong tài liệu cũ và `crm-fe/AGENTS.md` bị thay thế cho phạm vi
ngôn ngữ; implementation toàn hệ thống sẽ cập nhật instruction file tương ứng.

Các yêu cầu app shell, sidebar, header, command palette và route manifest của
tài liệu cũ vẫn giữ nguyên. Implementation plan cũ không được thực thi máy móc
cho phần Roles; một plan mới sẽ được viết sau khi tài liệu này được duyệt.

`RolesPage.tsx` đang có thay đổi chưa commit của người dùng. Việc triển khai phải
đọc và bảo toàn các hành vi có giá trị như pagination và filter, không reset file
về phiên bản Git hoặc thay bằng một bản dựng lại không đối chiếu diff.

## 2. Bối cảnh hiện tại

Màn hình hiện có ba view chính:

1. danh sách vai trò;
2. danh mục quyền;
3. so sánh vai trò.

Nó cũng có tìm kiếm, lọc, phân trang, create/edit wizard, permission selector,
clone và delete. Tuy nhiên, các luồng quan trọng chưa đủ an toàn cho production:

- lỗi delete bị nuốt nhưng UI vẫn có thể xóa row và báo thành công;
- clone không sao chép đầy đủ permission và data scope;
- comparison dùng fallback suy đoán quyền từ role code hoặc risk level;
- edit lấy scope đầu tiên rồi ghi cùng một scope lên nhiều entity;
- `TEAM` và `TEAM_TREE` chưa thu thập `teamId` bắt buộc;
- mutation action chưa được gate nhất quán bằng `platform_role.manage`;
- role list và permission catalogue biến lỗi thành mảng rỗng;
- frontend DTO khác hợp đồng backend;
- `RolesPage.tsx` đang giữ UI, API, mapping, form và comparison trong khoảng
  1.500 dòng;
- nhiều control nhỏ hơn touch target tối thiểu, icon button chỉ có `title`, và
  permission selector dùng clickable `Badge`/`div`.

## 3. Quyết định phân rã phạm vi

Role Governance được chia thành hai dự án độc lập.

### 3.1 Role Production Governance — tài liệu này

Frontend-only, dùng hợp đồng API hiện có. Phạm vi gồm production hardening,
editor bốn bước, risk-aware change review, exact comparison, authorization,
responsive, accessibility, English-only content và URL state.

### 3.2 Role Governance API — dự án sau

Cần thay đổi backend và cập nhật `docs/api-reference.md`. Phạm vi dự kiến gồm:

- số người đang được gán từng role;
- danh sách người bị ảnh hưởng trước deactivate/delete;
- audit đầy đủ cho role metadata, permission grant và data-scope grant;
- lịch sử thay đổi theo role;
- effective-access preview cho role hoặc người dùng.

Không đưa dữ liệu giả cho các tính năng này vào frontend hiện tại. Dự án sau
phải có design spec và implementation plan riêng.

## 4. Mục tiêu

1. Bảo đảm mọi dữ liệu, kết quả so sánh và thông báo thành công phản ánh API
   thật.
2. Ngăn mutation không hợp lệ bằng authorization, validation và review rõ ràng.
3. Cho phép cấu hình permission và data scope mà không làm mất grant đang tồn
   tại.
4. Làm rõ tác động của quyền đặc quyền, scope rộng và trạng thái inactive trước
   khi lưu.
5. Tách màn hình thành các đơn vị nhỏ có interface rõ ràng.
6. Giữ mental model ba view hiện có và không làm mất filter/pagination hữu ích.
7. Cung cấp đầy đủ loading, empty, partial-error, retry và mutation states.
8. Đạt mức responsive và accessibility phù hợp một màn quản trị production.

## 5. Ngoài phạm vi

- Không thay đổi backend endpoint, DTO, security hoặc database.
- Không chỉnh sửa `docs/api-reference.md` vì tài liệu này không đổi API.
- Không hiển thị assignment count, affected-user list hoặc role audit history.
- Không thêm role hierarchy hoặc suy diễn capability từ role name/code.
- Không thêm permission definition create/update/delete; catalogue là read-only.
- Không thêm thư viện UI, form, state, table, icon hoặc animation.
- Không thiết kế lại sidebar, header hoặc các trang Platform khác.
- Không thêm dark mode, import/export, bulk role mutation hoặc impersonation.
- Không chạy test, build, dev server, browser, API hoặc manual runtime test.

## 6. Ràng buộc và nguồn sự thật

- Stack: React, TypeScript, Vite, Tailwind CSS 3 và shadcn/Radix.
- Dùng React Query, React Hook Form và Zod đã có trong project.
- `docs/api-reference.md`, controller, request/response DTO và permission checker
  là nguồn sự thật cho Role Management.
- `GET /api/permissions`, `GET /api/roles`, `GET /api/roles/{id}` yêu cầu
  `platform_role.read`.
- `POST`, `PUT`, `DELETE /api/roles` yêu cầu `platform_role.manage`.
- System role luôn read-only.
- Backend là lớp authorization có thẩm quyền cuối cùng; frontend gating phục vụ
  điều hướng và ngăn thao tác không hợp lệ trên UI.
- Tenant-admin bypass phải đi qua evaluator tập trung, không lặp logic trong
  feature.
- Runtime UI chỉ dùng tiếng Anh thông qua i18next English message registry.
- Không render language switch, không đọc locale preference và không thêm
  Vietnamese translation resource trong feature.

## 7. Information architecture

Giữ ba tab hiện có để không phá vỡ mental model.

### 7.1 Roles

- Dải summary gọn: tổng role, role active, custom role và tổng permission.
- Toolbar: search, status filter, system/custom filter và Create Role.
- Desktop table: identity, permission count, data-scope count/summary, status,
  updated time và actions.
- Chọn row hoặc View mở role editor/detail sheet.
- Create chỉ xuất hiện khi có `platform_role.manage`.

### 7.2 Permission Catalogue

- Read-only catalogue.
- Search theo permission code hoặc description.
- Filter theo module và risk level.
- Pagination cục bộ vì backend trả toàn bộ catalogue.
- Risk chỉ dùng `NORMAL`, `SENSITIVE`, `PRIVILEGED` từ API.

### 7.3 Compare

- Chọn hai role ID khác nhau; mặc định không hardcode ID.
- Tải cả hai role detail thật trước khi tính kết quả.
- So sánh permission membership và data scope riêng biệt.
- Search, module filter, only-differences và pagination.
- Nếu một detail lỗi, không hiển thị matrix một phần như kết quả hoàn chỉnh.

## 8. Component architecture

```text
RolesPage
├── RolesSummary
├── RolesToolbar
├── RolesTable
├── PermissionCatalogue
├── RoleComparison
├── RoleEditorSheet
│   ├── RoleBasicsStep
│   ├── PermissionMatrix
│   ├── DataScopeEditor
│   └── RoleChangeReview
└── RoleDeleteDialog
```

### 8.1 Trách nhiệm

- `RolesPage`: route composition, active view và URL search params.
- `RolesSummary`: số liệu từ query result; không tự fetch.
- `RolesToolbar`: filter controls và create trigger.
- `RolesTable`: desktop table, mobile rows và action presentation.
- `PermissionCatalogue`: catalogue read-only, filter và pagination.
- `RoleComparison`: selection, exact diff và comparison states.
- `RoleEditorSheet`: mode, draft lifecycle, step navigation và mutation
  orchestration.
- `RoleBasicsStep`: role metadata/status fields.
- `PermissionMatrix`: semantic permission selection.
- `DataScopeEditor`: normalized grant editing và conditional team selection.
- `RoleChangeReview`: deterministic diff và risk warnings.
- `RoleDeleteDialog`: explicit confirmation và delete mutation.

Không đưa business logic của Role Management vào `components/ui` primitives.

## 9. Domain boundaries

### 9.1 Types

`roleTypes.ts` chứa:

- API-independent view models;
- `RoleEditorMode = 'view' | 'create' | 'edit' | 'clone'`;
- `RoleEditorStep = 'basics' | 'permissions' | 'scopes' | 'review'`;
- role filters, permission filters và comparison filters;
- normalized permission and data-scope diff types;
- editor draft và immutable original snapshot.

Shared types không được import ngược từ `RolesPage`.

### 9.2 API contract types

`roleApi.ts` phải phản ánh đúng contract:

- permission catalogue có required `permissionCode`, `description`, `moduleCode`
  và `riskLevel`;
- role summary dùng `system`, `permissionCount`, `dataScopeCount`, `updatedAt`
  và `version`;
- role detail dùng `system`, `permissionCodes`, `dataScopes`, `createdAt`,
  `updatedAt` và `version`;
- response không tự thêm `isSystem`, `scopeType` hoặc nested `permissions`;
- create/update request không có `scopeType`.

Compatibility alias chỉ được giữ ở mapper tạm thời nếu có consumer ngoài phạm
vi; feature mới không dùng alias làm source of truth.

### 9.3 Mapping và validation

- `roleMappers.ts`: API response sang view model/draft và draft sang create/update
  request.
- `roleSchemas.ts`: field, permission và data-scope validation.
- `roleDiff.ts`: pure functions tính metadata, permission và scope diff.
- `roleErrors.ts`: backend error code sang English i18n key và recovery action.

## 10. Query và cache

Query key luôn chứa tenant ID:

```text
['roles', tenantId]
['role', tenantId, roleId]
['permissions', tenantId]
['teams', tenantId]
```

- Role list và permission catalogue tải độc lập.
- Một query lỗi không biến query còn lại thành empty state.
- Detail tải on demand theo selected role ID.
- Team list chỉ enable khi editor có grant `TEAM` hoặc `TEAM_TREE`.
- Comparison dùng hai detail query độc lập và chỉ tính diff khi cả hai success.
- Response cũ của role selection trước không được hydrate vào selection mới.
- Không dùng `.catch(() => [])`, invented fallback hoặc placeholder data.

## 11. Role list behavior

### 11.1 Filters và URL state

Các state bền vững dùng React Router search params:

- `tab`;
- role `q`, `status`, `kind`, `page`, `size`;
- catalogue search/module/risk/page/size;
- comparison left/right role ID, search/module/differences/page/size.

View/Edit detail của role hiện có phải deep-link bằng role ID và mode. Create và
clone draft không deep-link vì draft chưa được server lưu; refresh không được
giả vờ phục hồi draft.

### 11.2 Row actions

- System role: View.
- Custom role với read-only user: View.
- Custom role với manage user: View/Edit, Clone, Delete.
- Action menu hoặc buttons có accessible name và pending/disabled state.
- Status được hiển thị riêng, không suy diễn từ system/custom.

### 11.3 Empty states

- First-use empty: mô tả chưa có custom role và CTA nếu có manage.
- Filtered empty: cho clear filters.
- API error: inline recovery và Retry.
- Loading: row skeleton đúng cấu trúc table/mobile row.

## 12. Role editor

Sheet hỗ trợ `view`, `create`, `edit`, `clone` và có bốn bước.

### 12.1 Thông tin cơ bản

- Create/clone: role code, name, description.
- Edit: immutable role code, name, description và status.
- View/system role: toàn bộ readonly.
- Clone hiển thị nguồn clone nhưng không sao chép ID, version, role code hoặc
  audit fields.

### 12.2 Quyền truy cập

- Search theo permission code/description.
- Filter module, risk và selected-only.
- Group theo module; module có semantic select-all state.
- Individual checkbox có label và một hit target thống nhất.
- Bulk select chứa `PRIVILEGED` phải xác nhận trước khi áp dụng.
- Filter/search không làm thay đổi selection ẩn.

### 12.3 Phạm vi dữ liệu

Data scope được chỉnh thành danh sách grant, nhóm theo entity. Không có một
global scope được tự động nhân sang nhiều entity.

- Cho phép nhiều team grant trên cùng entity khi `teamId` khác nhau.
- Không cho duplicate normalized `(entityType, type, teamId)`.
- `TEAM`/`TEAM_TREE` bắt buộc chọn active team trong tenant.
- `OWN`/`TENANT` xóa `teamId` khỏi draft và request.
- Xóa một grant chỉ xóa grant đó, không ảnh hưởng entity khác.
- Detail hiện có phải round-trip mà không mất grant hợp lệ.

### 12.4 Xem lại thay đổi

Review là bước cuối và là nơi duy nhất có primary Save action.

- Create/clone so sánh draft với aggregate rỗng; clone source chỉ là context.
- Edit so sánh draft với immutable detail snapshot đã hydrate.
- Hiển thị metadata/status changes.
- Hiển thị permission added/removed, nhóm theo module và risk.
- Hiển thị data-scope added/removed theo entity/type/team.
- Nhấn mạnh permission `PRIVILEGED` được thêm.
- Cảnh báo khi thêm `TENANT` hoặc đổi grant `TEAM` thành `TEAM_TREE`.
- Các scope khác chỉ hiển thị exact diff; UI không áp thứ bậc giả cho những
  scope không thể so sánh trực tiếp.
- Chuyển sang `INACTIVE` phải nói rõ effective access bị vô hiệu ngay nhưng
  assignment vẫn được backend giữ.

## 13. Create, edit và clone

### 13.1 Create

- Draft bắt đầu không có permission và data scope.
- Role mới luôn active theo backend contract.
- Chỉ submit khi toàn bộ bốn bước hợp lệ.
- Success dùng complete role aggregate từ response để cập nhật cache.

### 13.2 Edit

- Chỉ hydrate sau detail success.
- Update request là complete replacement: version, metadata, status,
  permission codes và data scopes.
- Draft không tự đồng bộ với refetch nền sau khi người dùng đã sửa.
- Version conflict giữ nguyên draft.

### 13.3 Clone

- Tải source detail thật trước khi mở editor.
- Sao chép name, description, permission codes và mọi data scope hợp lệ.
- Role code mới là bắt buộc.
- Nếu source detail lỗi, không mở một clone draft thiếu dữ liệu.

## 14. Delete

- Chỉ custom role và manage user có action Delete.
- Dialog hiển thị name và role code.
- Người dùng phải xác nhận rõ destructive action.
- Không hiển thị affected-user count vì API hiện tại không có dữ liệu đó.
- Request gửi strong quoted `If-Match` từ version hiện tại.
- Row chỉ bị loại bỏ sau `204 No Content`.
- Failure giữ dialog/row, hiển thị mapped error và cho Retry.
- Không swallow promise rejection và không optimistic-delete.

## 15. Comparison

- Initial state hướng dẫn chọn hai role khác nhau.
- Mỗi role selection dùng role ID thật từ list.
- Hai detail được tải song song.
- Permission membership là lookup trong `permissionCodes` thật.
- Scope comparison normalize theo `entityType`, `type`, `teamId`.
- Stats chỉ tính sau khi hai detail success.
- `TENANT_ADMIN` không được frontend tự cấp toàn bộ catalogue.
- Không dùng permission prefix hoặc `NORMAL` risk làm fallback.
- Một detail lỗi làm comparison result unavailable và cung cấp Retry.

## 16. Authorization

| Bề mặt | Điều kiện |
|---|---|
| Route, list, detail, catalogue, comparison | `platform_role.read` |
| Create, edit, clone, deactivate, delete | `platform_role.manage` |
| System role mutation | Luôn cấm |

- Action gating dùng evaluator/`PermissionGate` tập trung.
- Không kiểm tra role display name, role code hoặc thứ bậc giả.
- Không có manage thì mutation action không được render.
- Backend vẫn quyết định cuối cùng và lỗi `ACCESS_DENIED` đi qua luồng 403.

## 17. Validation và payload

### 17.1 Metadata

- `roleCode`: required create/clone, trim, uppercase, tối đa 191 ký tự, pattern
  `^[A-Z][A-Z0-9_]*$`, immutable sau create.
- `name`: required, trim theo contract, tối đa 255 ký tự.
- `description`: optional, tối đa 4.000 ký tự; blank normalize theo backend.
- `status`: `ACTIVE` hoặc `INACTIVE` trên update.
- `version`: positive server version trên update/delete.

### 17.2 Permissions

- Trim, unique và tồn tại trong catalogue đã tải.
- Không submit editor khi catalogue cần thiết đang lỗi.
- Catalogue refetch không làm mất selected codes trong draft; unknown code được
  hiển thị rõ để người dùng xử lý.

### 17.3 Data scopes

- `entityType`: trim, uppercase, tối đa 191 ký tự, pattern
  `^[A-Z][A-Z0-9_]*$`.
- `type`: `OWN`, `TEAM`, `TEAM_TREE`, `TENANT`.
- `teamId`: required cho `TEAM`/`TEAM_TREE`, forbidden cho `OWN`/`TENANT`.
- Duplicate normalized grant bị chặn trước submit.

## 18. Error và mutation behavior

Không hiển thị raw backend message. Map tối thiểu:

- `REQUEST_VALIDATION_FAILED`;
- `AUTHENTICATION_REQUIRED`;
- `ACCESS_DENIED`;
- `ROLE_NOT_FOUND`;
- `ROLE_CODE_ALREADY_EXISTS`;
- `SYSTEM_ROLE_IMMUTABLE`;
- `ROLE_VERSION_CONFLICT`;
- `ROLE_PERMISSION_UNKNOWN`;
- `ROLE_DATA_SCOPE_INVALID`;
- `INTERNAL_ERROR`.

Recovery behavior:

- `ROLE_VERSION_CONFLICT`: giữ draft, cho tải bản mới hoặc cancel; không tự ghi
  đè.
- `ROLE_PERMISSION_UNKNOWN`: giữ draft, refetch catalogue và điều hướng về bước
  permission.
- `ROLE_DATA_SCOPE_INVALID`: giữ draft, điều hướng về scope và đánh dấu grant.
- `ROLE_NOT_FOUND`: đóng stale detail/editor sau thông báo và refetch list.
- `ACCESS_DENIED`: chuyển sang 403 flow, không lặp toast.
- `AUTHENTICATION_REQUIRED`: dùng session-expired flow hiện có.
- `INTERNAL_ERROR`: giữ draft/dialog và cho Retry.

Mutation action có pending label, disable sau khi request bắt đầu và chống gửi
lặp. Editor chỉ đóng và toast success chỉ xuất hiện sau canonical success.

## 19. Unsaved changes

- Editor giữ immutable original snapshot và dirty state.
- Đóng sheet, chuyển route hoặc reload khi dirty phải cảnh báo.
- Navigation giữa bốn bước không làm mất draft.
- Reset/discard yêu cầu xác nhận và phục hồi đúng original snapshot.
- Refetch nền không được thay draft đang dirty.

## 20. Visual system

- Light enterprise CRM: slate background, white surface, một blue accent.
- Không gradient, glassmorphism, neon, heavy shadow hoặc marketing motion.
- Summary là compact strip, không phải bốn dashboard cards lớn.
- Table body khoảng 14px; label phụ không nhỏ tới mức khó đọc.
- Count và comparison numbers dùng `tabular-nums`.
- Heading và label dùng sentence case; hạn chế uppercase microcopy.
- `ACTIVE` dùng emerald, `INACTIVE` dùng amber.
- System/custom dùng neutral/blue; permission risk dùng neutral/amber/rose.
- Role status và permission risk không import `crmStatusConfig`; chuẩn badge CRM
  trong repository chỉ áp cho lifecycle/account/lead/priority tương ứng.
- Control tối thiểu khoảng 40px desktop và 44px mobile.
- Transition 150–200ms, chỉ liệt kê property cần animate; không
  `transition-all`.

## 21. Responsive behavior

### 21.1 Desktop

- Full table columns.
- Editor sheet khoảng 680–720px.
- Sticky editor footer không che focused field.

### 21.2 Tablet

- Toolbar wrap theo nhóm.
- Ở viewport dưới Tailwind breakpoint `lg`, ẩn description column; nội dung đầy
  đủ vẫn xem được trong detail sheet.
- Sheet dùng phần lớn viewport nhưng giữ context trang.

### 21.3 Mobile

- Role table chuyển thành stacked rows; không ép horizontal scroll toàn bảng.
- Row actions nằm trong accessible action menu.
- Editor full-screen, dùng safe-area padding và contained overscroll.
- Footer step/save luôn truy cập được.
- Touch targets tối thiểu khoảng 44px.

## 22. Accessibility

- Icon-only buttons có `aria-label`, không chỉ `title`.
- Decorative icons có `aria-hidden="true"`.
- Dùng `<button>` cho action, `<label>`/checkbox cho selection và `<table>` cho
  tabular desktop data.
- Không clickable `div`, `span` hoặc `Badge`.
- Checkbox và label tạo một hit target thống nhất.
- Focus-visible ring rõ; không bỏ outline nếu không có replacement.
- Submit lỗi focus field đầu tiên.
- Validation/toast/async result được announce bằng live region phù hợp.
- Sheet/dialog giữ focus, Escape hoạt động và trả focus về trigger.
- Sticky overlay không che phần tử đang focus.
- Animation tôn trọng `prefers-reduced-motion`.
- Không vô hiệu browser zoom.

## 23. English-only content handling

- Mọi system copy dùng English i18n key; chỉ English translation resource được
  bundle.
- Không thêm Vietnamese key/value, bilingual label hoặc hardcoded Vietnamese
  recovery message.
- Không hiển thị hoặc thêm language switch trong Role Governance.
- Không hardcode role, tenant, user hoặc permission giả.
- Ngày giờ dùng `Intl.DateTimeFormat('en-US', ...)`; count dùng
  `Intl.NumberFormat('en-US', ...)` khi cần.
- Code token dùng font mono, `break-words` và `translate="no"` khi phù hợp.
- Name/description dài được truncate hoặc line-clamp ở collection view nhưng xem
  đầy đủ trong detail.
- Loading label dùng dấu ellipsis `…`.
- Error copy bằng tiếng Anh và nêu bước khôi phục; success copy ngắn và không
  dùng dấu chấm than.
- User-entered role name/description và backend business data được hiển thị
  nguyên trạng, kể cả khi chứa tiếng Việt; English-only chỉ áp cho system-owned
  UI copy.

## 24. Loading, empty và partial failure

- Roles và permissions có skeleton/error/retry riêng.
- Roles success + permissions failure: list vẫn xem được; editor/catalogue báo
  lỗi riêng.
- Permissions success + roles failure: catalogue vẫn xem được; list/comparison
  báo lỗi riêng.
- Detail/editor có skeleton riêng.
- Team query lỗi chỉ chặn các grant cần team, không xóa draft scope khác.
- Empty data không được dùng thay cho error state.

## 25. File boundaries đề xuất

```text
src/features/platform/roles/
├── RolesPage.tsx
├── components/
│   ├── RolesSummary.tsx
│   ├── RolesToolbar.tsx
│   ├── RolesTable.tsx
│   ├── PermissionCatalogue.tsx
│   ├── PermissionMatrix.tsx
│   ├── DataScopeEditor.tsx
│   ├── RoleBasicsStep.tsx
│   ├── RoleChangeReview.tsx
│   ├── RoleEditorSheet.tsx
│   ├── RoleComparison.tsx
│   └── RoleDeleteDialog.tsx
├── hooks/
│   └── roleQueries.ts
├── model/
│   ├── roleTypes.ts
│   ├── roleSchemas.ts
│   ├── roleMappers.ts
│   ├── roleDiff.ts
│   └── roleErrors.ts
└── roleSearchParams.ts
```

Implementation plan phải dùng đúng các file boundary trên, trừ khi static
inspection chứng minh một file cùng tên đã tồn tại ở vị trí canonical khác.
Trong trường hợp đó, mở rộng file canonical thay vì tạo bản sao. `RolesPage` chỉ
còn route-level composition.

## 26. Tiêu chí nghiệm thu

### 26.1 Correctness

- API DTO và payload khớp `docs/api-reference.md`.
- Không còn create/update `scopeType`.
- Không còn `isSystem` làm source of truth.
- Delete failure không xóa row hoặc báo success.
- Clone round-trip đầy đủ permission và data scopes.
- Edit round-trip không mất multiple grants.
- Comparison chỉ dùng hai detail thật.
- Không có invented fallback hoặc hardcoded role ID.
- Partial API failure không biến thành empty data.

### 26.2 Governance

- Mutation chỉ render với `platform_role.manage`.
- System role luôn readonly.
- Review hiển thị exact permission/scope/status diff.
- Privileged bulk selection, `TENANT`, `TEAM_TREE` expansion và inactive status
  có cảnh báo phù hợp.
- Dirty draft được bảo vệ.

### 26.3 UX và accessibility

- Ba tab, filters, pagination và comparison selection có URL state.
- Desktop/tablet/mobile có layout được định nghĩa.
- Không clickable `Badge`/`div`.
- Icon action có accessible name.
- Focus, labels, live regions và reduced motion được xử lý.
- Control không còn kích thước 28–32px cho primary interaction.
- Mọi system-owned copy chỉ dùng tiếng Anh; không có language switch hoặc
  Vietnamese resource trong feature.
- User-entered role metadata được giữ nguyên, không bị dịch hoặc ghi đè.

### 26.4 Source quality

- `RolesPage.tsx` là composition-sized.
- Shared types không phụ thuộc vào page component.
- Business mapping/diff/error logic nằm trong model modules.
- Không thêm dependency.
- Không sửa backend hoặc API reference trong phạm vi này.
- Không reset hoặc ghi đè thay đổi chưa commit của người dùng.

## 27. Kiểm tra theo repository rules

Chỉ thực hiện static verification:

- đọc scoped diff;
- đối chiếu role API types/payload với controller, DTO và API reference;
- tìm `.catch(() => [])`, swallowed delete error và invented comparison fallback;
- tìm `scopeType`, `isSystem`, hardcoded role ID và permission prefix inference;
- đối chiếu permission gating giữa route, toolbar và row actions;
- đối chiếu mọi Role translation key với canonical English resource;
- tìm Vietnamese system copy, bilingual label, `vi-VN`, locale switch và locale
  preference trong Role feature;
- kiểm tra import tồn tại và không có dependency mới;
- kiểm tra semantic controls, accessible labels, focus classes và touch sizes;
- kiểm tra URL search-param serialization/parsing;
- kiểm tra không còn `transition-all` trong role feature.

Không chạy unit, integration, E2E, smoke, browser/manual runtime test, dev server
hoặc build. Runtime/visual acceptance được bàn giao thành checklist cho người
dùng hoặc thực hiện ở một yêu cầu sau khi người dùng cho phép rõ ràng.

## 28. Trình tự triển khai cấp cao

1. Chụp lại scoped diff hiện tại và chuẩn hóa API contract/types.
2. Tạo model, mapper, schema, diff và error boundaries.
3. Tạo tenant-scoped queries/mutations và URL-state layer.
4. Tách summary, toolbar, responsive role collection và catalogue.
5. Xây editor sheet, basics và semantic permission matrix.
6. Xây multi-grant data-scope editor và risk-aware review.
7. Sửa exact clone, update, conflict và delete flows.
8. Xây exact comparison cho permission và data scope.
9. Hoàn thiện authorization, English-only content, responsive và accessibility.
10. Thực hiện static verification và bàn giao runtime checklist.

Thứ tự chi tiết theo file, checkpoint và static verification command sẽ được
viết trong implementation plan sau khi tài liệu này được người dùng duyệt.
